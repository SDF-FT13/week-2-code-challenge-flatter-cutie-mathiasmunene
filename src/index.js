document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const characterBar = document.getElementById('character-bar');
  const nameElement = document.getElementById('name');
  const imageElement = document.getElementById('image');
  const voteCountElement = document.getElementById('vote-count');
  const votesForm = document.getElementById('votes-form');
  const resetBtn = document.getElementById('reset-btn');
  const characterForm = document.getElementById('character-form');
  
  
  let currentCharacter = null;

  
  characterBar.innerHTML = '<p>Loading characters...</p>';

  
  fetch('http://localhost:3000/characters')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Data loaded:", data);
      displayCharacters(data);
      if (data.length > 0) {
        showCharacterDetails(data[0]); 
      }
    })
    .catch(error => {
      console.error("Fetch error:", error);
      characterBar.innerHTML = `<p style="color: red">Error loading characters: ${error.message}</p>`;
    });

  
  function displayCharacters(characters) {
    characterBar.innerHTML = ''; 
    
    characters.forEach(character => {
      const span = document.createElement('span');
      span.textContent = character.name;
      span.style.cursor = 'pointer';
      span.style.margin = '0 10px';
      span.style.padding = '5px';
      
      
      if (character.id === 1) {
        span.style.borderBottom = '2px solid blue';
      }
      
      span.addEventListener('click', () => {
        showCharacterDetails(character);
        
        document.querySelectorAll('#character-bar span').forEach(s => {
          s.style.borderBottom = 'none';
        });
        span.style.borderBottom = '2px solid blue';
      });
      
      characterBar.appendChild(span);
    });
  }

  
  function showCharacterDetails(character) {
    currentCharacter = character; 
    nameElement.textContent = character.name;
    imageElement.src = character.image;
    imageElement.alt = character.name;
    voteCountElement.textContent = character.votes;
  }

  
  votesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentCharacter) return;
    
    const votesInput = document.getElementById('votes');
    const votesToAdd = parseInt(votesInput.value);
    
    if (isNaN(votesToAdd)) {
      alert('Please enter a valid number');
      return;
    }
    
    try {
      const newVotes = currentCharacter.votes + votesToAdd;
      
      // Update server first
      const response = await fetch(`http://localhost:3000/characters/${currentCharacter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          votes: newVotes
        })
      });
      
      if (!response.ok) throw new Error('Failed to update votes');
      
      // Update UI after successful server update
      currentCharacter.votes = newVotes;
      voteCountElement.textContent = newVotes;
      votesInput.value = '';
      
      // Show success feedback
      showFeedback('Votes added successfully!', 'success');
    } catch (error) {
      console.error('Error updating votes:', error);
      showFeedback('Failed to update votes. Please try again.', 'error');
    }
  });

  
  resetBtn.addEventListener('click', async () => {
    if (!currentCharacter) return;
    
    try {
      // Update server first
      const response = await fetch(`http://localhost:3000/characters/${currentCharacter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          votes: 0
        })
      });
      
      if (!response.ok) throw new Error('Failed to reset votes');
      
      // Update UI after successful server update
      currentCharacter.votes = 0;
      voteCountElement.textContent = 0;
      
      // Show success feedback
      showFeedback('Votes reset successfully!', 'success');
    } catch (error) {
      console.error('Error resetting votes:', error);
      showFeedback('Failed to reset votes. Please try again.', 'error');
    }
  });

  // Handle new character form (with server creation)
  characterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = e.target.name.value.trim();
    const imageUrl = e.target['image-url'].value.trim();
    
    if (!name || !imageUrl) {
      showFeedback('Please fill all fields', 'error');
      return;
    }
    
    try {
      // Create on server first
      const response = await fetch('http://localhost:3000/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          image: imageUrl,
          votes: 0
        })
      });
      
      if (!response.ok) throw new Error('Failed to create character');
      
      const newCharacter = await response.json();
      
      
      const span = document.createElement('span');
      span.textContent = newCharacter.name;
      span.style.cursor = 'pointer';
      span.style.margin = '0 10px';
      span.style.padding = '5px';
      span.addEventListener('click', () => showCharacterDetails(newCharacter));
      characterBar.appendChild(span);
      
      
      showCharacterDetails(newCharacter);
      e.target.reset();
      
      
      showFeedback('Character added successfully!', 'success');
    } catch (error) {
      console.error('Error adding character:', error);
      showFeedback('Failed to add character. Please try again.', 'error');
    }
  });

  
  function showFeedback(message, type) {
    const feedbackElement = document.createElement('div');
    feedbackElement.textContent = message;
    feedbackElement.style.margin = '10px 0';
    feedbackElement.style.padding = '10px';
    feedbackElement.style.borderRadius = '5px';
    
    if (type === 'success') {
      feedbackElement.style.backgroundColor = '#d4edda';
      feedbackElement.style.color = '#155724';
    } else {
      feedbackElement.style.backgroundColor = '#f8d7da';
      feedbackElement.style.color = '#721c24';
    }
    
    
    const existingFeedback = document.querySelector('.feedback-message');
    if (existingFeedback) existingFeedback.remove();
    
    feedbackElement.className = 'feedback-message';
    document.body.prepend(feedbackElement);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      feedbackElement.remove();
    }, 3000);
  }
});