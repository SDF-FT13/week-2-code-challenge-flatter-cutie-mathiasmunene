// src/index.js
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const characterBar = document.getElementById('character-bar');
  const nameElement = document.getElementById('name');
  const imageElement = document.getElementById('image');
  const voteCountElement = document.getElementById('vote-count');
  const votesForm = document.getElementById('votes-form');
  const resetBtn = document.getElementById('reset-btn');
  const characterForm = document.getElementById('character-form');
  
  // State
  let currentCharacter = null;
  let characters = [];

  // Initialize app
  initApp();

  async function initApp() {
      try {
          showLoading();
          characters = await fetchCharacters();
          displayCharacters(characters);
          if (characters.length > 0) {
              showCharacterDetails(characters[0]);
          }
      } catch (error) {
          showError("Failed to load characters. Please try again.");
      } finally {
          hideLoading();
      }
  }

  // API Functions
  async function fetchCharacters() {
      const response = await fetch('http://localhost:3000/characters');
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return await response.json();
  }

  async function updateCharacterVotes(character) {
      const response = await fetch(`http://localhost:3000/characters/${character.id}`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              votes: character.votes
          })
      });
      if (!response.ok) {
          throw new Error('Failed to update votes');
      }
      return await response.json();
  }

  async function addNewCharacter(character) {
      const response = await fetch('http://localhost:3000/characters', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(character)
      });
      if (!response.ok) {
          throw new Error('Failed to add character');
      }
      return await response.json();
  }

  // UI Functions
  function displayCharacters(characters) {
      characterBar.innerHTML = '';
      
      characters.forEach(character => {
          const span = document.createElement('span');
          span.textContent = character.name;
          span.className = 'character-name';
          span.addEventListener('click', () => {
              showCharacterDetails(character);
              highlightSelectedCharacter(span);
          });
          
          if (character.id === 1) {
              span.classList.add('selected');
          }
          
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

  function highlightSelectedCharacter(selectedElement) {
      document.querySelectorAll('.character-name').forEach(el => {
          el.classList.remove('selected');
      });
      selectedElement.classList.add('selected');
  }

  // Event Handlers
  votesForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentCharacter) return;

      const votesInput = e.target.votes;
      const votesToAdd = parseInt(votesInput.value);
      
      if (isNaN(votesToAdd)) {
          showError("Please enter a valid number of votes");
          return;
      }

      try {
          showLoading();
          currentCharacter.votes += votesToAdd;
          const updatedCharacter = await updateCharacterVotes(currentCharacter);
          voteCountElement.textContent = updatedCharacter.votes;
          votesInput.value = '';
          showSuccess("Votes added successfully!");
      } catch (error) {
          showError("Failed to update votes. Please try again.");
      } finally {
          hideLoading();
      }
  });

  resetBtn.addEventListener('click', async () => {
      if (!currentCharacter) return;

      try {
          showLoading();
          currentCharacter.votes = 0;
          const updatedCharacter = await updateCharacterVotes(currentCharacter);
          voteCountElement.textContent = updatedCharacter.votes;
          showSuccess("Votes reset successfully!");
      } catch (error) {
          showError("Failed to reset votes. Please try again.");
      } finally {
          hideLoading();
      }
  });

  characterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = e.target.name;
      const imageInput = e.target['image-url'];
      
      if (!nameInput.value.trim()) {
          showError("Please enter a character name");
          return;
      }
      
      if (!imageInput.value.trim()) {
          showError("Please enter an image URL");
          return;
      }

      const newCharacter = {
          name: nameInput.value.trim(),
          image: imageInput.value.trim(),
          votes: 0
      };

      try {
          showLoading();
          const createdCharacter = await addNewCharacter(newCharacter);
          characters.push(createdCharacter);
          
          // Update UI
          displayCharacters(characters);
          showCharacterDetails(createdCharacter);
          highlightSelectedCharacter(characterBar.lastChild);
          
          // Reset form
          e.target.reset();
          showSuccess("Character added successfully!");
      } catch (error) {
          showError("Failed to add character. Please try again.");
      } finally {
          hideLoading();
      }
  });

  // Utility Functions
  function showLoading() {
      const loading = document.createElement('div');
      loading.id = 'loading-indicator';
      loading.textContent = 'Loading...';
      loading.style.position = 'fixed';
      loading.style.top = '20px';
      loading.style.right = '20px';
      loading.style.backgroundColor = 'rgba(0,0,0,0.8)';
      loading.style.color = 'white';
      loading.style.padding = '10px 20px';
      loading.style.borderRadius = '5px';
      loading.style.zIndex = '1000';
      document.body.appendChild(loading);
  }

  function hideLoading() {
      const loading = document.getElementById('loading-indicator');
      if (loading) loading.remove();
  }

  function showError(message) {
      showFeedback(message, 'error');
  }

  function showSuccess(message) {
      showFeedback(message, 'success');
  }

  function showFeedback(message, type) {
      // Remove existing feedback
      const existing = document.querySelector('.feedback-message');
      if (existing) existing.remove();

      const feedback = document.createElement('div');
      feedback.className = `feedback-message ${type}`;
      feedback.textContent = message;
      feedback.style.position = 'fixed';
      feedback.style.top = '20px';
      feedback.style.left = '50%';
      feedback.style.transform = 'translateX(-50%)';
      feedback.style.padding = '10px 20px';
      feedback.style.borderRadius = '5px';
      feedback.style.zIndex = '1000';
      feedback.style.color = 'white';
      feedback.style.backgroundColor = type === 'error' ? '#dc3545' : '#28a745';
      document.body.appendChild(feedback);

      setTimeout(() => {
          feedback.remove();
      }, 3000);
  }
});