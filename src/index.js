document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const characterBar = document.getElementById('character-bar');
    const nameElement = document.getElementById('name');
    const imageElement = document.getElementById('image');
    const voteCountElement = document.getElementById('vote-count');
    const votesForm = document.getElementById('votes-form');
    const resetBtn = document.getElementById('reset-btn');
    const characterForm = document.getElementById('character-form');
  
    // State
    let characters = [];
    let currentCharacter = null;
  
    // Initialize the app
    fetchCharacters()
      .then(data => {
        characters = data;
        renderCharacterBar();
        if (characters.length > 0) {
          showCharacterDetails(characters[0]);
        }
      })
      .catch(error => console.error('Error fetching characters:', error));
  
    // Fetch all characters
    function fetchCharacters() {
      return fetch('http://localhost:3001/characters')
        .then(response => response.json());
    }
  
    // Render character bar
    function renderCharacterBar() {
      characterBar.innerHTML = '';
      characters.forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.textContent = character.name;
        characterSpan.addEventListener('click', () => showCharacterDetails(character));
        characterBar.appendChild(characterSpan);
      });
    }
  
    // Show character details
    function showCharacterDetails(character) {
      currentCharacter = character;
      nameElement.textContent = character.name;
      imageElement.src = character.image;
      imageElement.alt = character.name;
      voteCountElement.textContent = character.votes;
    }
  
    // Handle vote submission
    votesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentCharacter) return;
      
      const votes = parseInt(e.target.votes.value);
      if (isNaN(votes)) {
        alert('Please enter a valid number');
        return;
      }
      
      currentCharacter.votes += votes;
      voteCountElement.textContent = currentCharacter.votes;
      e.target.votes.value = '';
      
      // Bonus: Update server
      updateCharacterOnServer(currentCharacter);
    });
  
    // Handle reset votes
    resetBtn.addEventListener('click', () => {
      if (!currentCharacter) return;
      
      currentCharacter.votes = 0;
      voteCountElement.textContent = 0;
      
      // Bonus: Update server
      updateCharacterOnServer(currentCharacter);
    });
  
    // Handle new character form
    characterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newCharacter = {
        name: e.target.name.value,
        image: e.target['image-url'].value,
        votes: 0
      };
      
      // Bonus: Add to server
      addCharacterToServer(newCharacter)
        .then(character => {
          characters.push(character);
          renderCharacterBar();
          showCharacterDetails(character);
          e.target.reset();
        });
    });
  
    // Bonus: Update character on server
    function updateCharacterOnServer(character) {
      fetch(`http://localhost:3000/characters/${character.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          votes: character.votes
        })
      })
      .then(response => response.json());
    }
  
    // Bonus: Add character to server
    function addCharacterToServer(character) {
      return fetch('http://localhost:3000/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(character)
      })
      .then(response => response.json());
    }
  });