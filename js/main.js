const soundManager = new SoundManager();

let isInfoUpdating = false; // Flag to track if info panel is updating

// DOM elements
const asciiDisplay = document.getElementById('asciiDisplay');
const infoPanel = document.getElementById('infoPanel');
const playerInput = document.getElementById('playerInput');

// Initialize game with test data
function initializeGame() {
    loadTestScene1('instant');
    updateInfoPanel(`Welcome to the Untilted Adventure Game!`);

    // Focus on input field
    playerInput.focus();
}

// Start the game when page loads
window.addEventListener('load', initializeGame);