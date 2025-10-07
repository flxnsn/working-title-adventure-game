const soundManager = new SoundManager();

let isInfoUpdating = false; // Flag to track if info panel is updating

// DOM elements
const asciiDisplay = document.getElementById('asciiDisplay');
const infoPanel = document.getElementById('infoPanel');
const playerInput = document.getElementById('playerInput');

// Initialize game with test data
function initializeGame() {
    updateAsciiDisplay(myAsciiArt, "init");
    updateInfoPanel(`Welcome to Untilted Adventure Game!
Enter mountains for mountains
Enter castle for castle
Enter lighthouse for lighthouse
Enter cat for cat`);

    // Focus on input field
    playerInput.focus();
}

// Start the game when page loads
window.addEventListener('load', initializeGame);