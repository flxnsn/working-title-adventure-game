// Function to update info panel with typewriter effect
function updateInfoPanel(info) {
    // Lock input field
    isInfoUpdating = true;
    playerInput.disabled = true;
    playerInput.placeholder = "Please wait...";

    // Clear existing content instantly
    infoPanel.value = '';

    let currentIndex = 0;

    function typeNextChar() {
        if (currentIndex < info.length) {
            infoPanel.value += info[currentIndex];
            currentIndex++;

            // Auto-scroll to bottom as we type
            infoPanel.scrollTop = infoPanel.scrollHeight;

            setTimeout(typeNextChar, 25);
        } else {
            // Typing complete - unlock input field
            isInfoUpdating = false;
            playerInput.disabled = false;
            playerInput.placeholder = "Enter your command...";
            playerInput.focus();
        }
    }

    // Start typing after a brief pause
    setTimeout(typeNextChar, 50);
}