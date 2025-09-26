// Game state variables
let gameState = {
    playerName: "Hero",
    health: 100,
    level: 1,
    location: "Forest Clearing"
};

const soundManager = new SoundManager();

let isInfoUpdating = false; // Flag to track if info panel is updating

// DOM elements
const asciiDisplay = document.getElementById('asciiDisplay');
const infoPanel = document.getElementById('infoPanel');
const playerInput = document.getElementById('playerInput');

// Initialize game with test data
function initializeGame() {
    loadTestScene1('instant');
    updateInfoPanel(`Welcome to the ASCII Adventure Game!

Current Status:
Player: ${gameState.playerName}
Health: ${gameState.health}/100
Level: ${gameState.level}
Location: ${gameState.location}

Commands to test transitions:
- 'look': Left-to-right transition to cave
- 'cave': Delete-and-write transition to cave  
- 'forest': Random transition back to forest
- 'help': Show all commands`);

    // Focus on input field
    playerInput.focus();
}

// Start the game when page loads
window.addEventListener('load', initializeGame);

// Example function to demonstrate dynamic content loading
function updateGameState(newState) {
    Object.assign(gameState, newState);
    updateInfoPanel(`Status Updated!

Player: ${gameState.playerName}
Health: ${gameState.health}/100
Level: ${gameState.level}
Location: ${gameState.location}

Enter your next command...`);
}

// Make functions available globally for testing
window.gameAPI = {
    updateAsciiDisplay,
    updateInfoPanel,
    updateGameState,
    loadTestScene1,
    loadTestScene2
};