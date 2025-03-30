document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const characterBar = document.getElementById('character-bar');
    const nameElement = document.getElementById('name');
    const imageElement = document.getElementById('image');
    const voteCountElement = document.getElementById('vote-count');
    
// Correct fetch URL (must match your server)
fetch('http://localhost:3000/characters')
  .then(response => response.json())
  .then(data => {
    console.log("Data loaded:", data); // Check browser console
    displayCharacters(data);
  })
  .catch(error => {
    console.error("Fetch error:", error);
  });
  
    // Display characters function
    function displayCharacters(characters) {
      characterBar.innerHTML = ''; // Clear existing
      
      characters.forEach(character => {
        const span = document.createElement('span');
        span.textContent = character.name;
        span.style.cursor = 'pointer';
        span.style.margin = '0 10px';
        
        span.addEventListener('click', () => {
          showCharacterDetails(character);
        });
        
        characterBar.appendChild(span);
      });
    }
  
    // Show character details function
    function showCharacterDetails(character) {
      nameElement.textContent = character.name;
      imageElement.src = character.image;
      imageElement.alt = character.name;
      voteCountElement.textContent = character.votes;
    }
  
    // 3. Handle voting form
    document.getElementById('votes-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const votesInput = document.getElementById('votes');
      const votesToAdd = parseInt(votesInput.value);
      
      if (isNaN(votesToAdd)) {
        alert('Please enter a valid number');
        return;
      }
      
      const currentVotes = parseInt(voteCountElement.textContent);
      voteCountElement.textContent = currentVotes + votesToAdd;
      votesInput.value = '';
    });
  
    // 4. Handle reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
      voteCountElement.textContent = '0';
    });
  });