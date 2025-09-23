// Game state variables
        let gameState = {
            playerName: "Hero",
            health: 100,
            level: 1,
            location: "Forest Clearing"
        };

        let isInfoUpdating = false; // Flag to track if info panel is updating

        // DOM elements
        const asciiDisplay = document.getElementById('asciiDisplay');
        const infoPanel = document.getElementById('infoPanel');
        const playerInput = document.getElementById('playerInput');

        // Function to update ASCII display with transition effects
        function updateAsciiDisplay(asciiArt, transitionType = 'instant') {
            const currentContent = asciiDisplay.value;
            const newContent = asciiArt;
            
            switch(transitionType) {
                case 'leftToRight':
                    leftToRightTransition(currentContent, newContent);
                    break;
                case 'deleteAndWrite':
                    deleteAndWriteTransition(currentContent, newContent);
                    break;
                case 'random':
                    randomTransition(currentContent, newContent);
                    break;
                case 'instant':
                default:
                    asciiDisplay.value = newContent;
                    break;
            }
        }

        // Left to right transition - update each column progressively
        function leftToRightTransition(oldContent, newContent) {
            const oldLines = oldContent.split('\n');
            const newLines = newContent.split('\n');
            const maxLines = Math.max(oldLines.length, newLines.length);
            const maxWidth = Math.max(
                Math.max(...oldLines.map(line => line.length)),
                Math.max(...newLines.map(line => line.length))
            );
            
            let currentColumn = 0;
            
            function updateColumn() {
                let result = [];
                
                for (let row = 0; row < maxLines; row++) {
                    const oldLine = oldLines[row] || '';
                    const newLine = newLines[row] || '';
                    let line = '';
                    
                    for (let col = 0; col <= maxWidth; col++) {
                        if (col < currentColumn) {
                            line += newLine[col] || ' ';
                        } else {
                            line += oldLine[col] || ' ';
                        }
                    }
                    result.push(line.trimEnd());
                }
                
                asciiDisplay.value = result.join('\n');
                
                currentColumn++;
                if (currentColumn <= maxWidth) {
                    setTimeout(updateColumn, 20);
                }
            }
            
            updateColumn();
        }

        // Delete from bottom-right, then write from top-left
        function deleteAndWriteTransition(oldContent, newContent) {
            const oldLines = oldContent.split('\n');
            let deletingLines = [...oldLines];
            
            // Phase 1: Delete from bottom-right to top-left
            function deletePhase() {
                if (deletingLines.length === 0 || deletingLines.every(line => line.length === 0)) {
                    // Start writing phase
                    setTimeout(() => writePhase(), 100);
                    return;
                }
                
                // Delete from the last non-empty line
                for (let i = deletingLines.length - 1; i >= 0; i--) {
                    if (deletingLines[i].length > 0) {
                        deletingLines[i] = deletingLines[i].slice(0, -1);
                        break;
                    }
                }
                
                // Remove empty lines from the end
                while (deletingLines.length > 0 && deletingLines[deletingLines.length - 1].length === 0) {
                    deletingLines.pop();
                }
                
                asciiDisplay.value = deletingLines.join('\n');
                setTimeout(deletePhase, 8);
            }
            
            // Phase 2: Write new content line by line
            function writePhase() {
                const newLines = newContent.split('\n');
                let currentLineIndex = 0;
                let currentCharIndex = 0;
                let writingLines = [];
                
                function writeNextChar() {
                    if (currentLineIndex >= newLines.length) {
                        return; // Done
                    }
                    
                    const targetLine = newLines[currentLineIndex];
                    
                    if (currentCharIndex === 0) {
                        writingLines.push('');
                    }
                    
                    if (currentCharIndex < targetLine.length) {
                        writingLines[currentLineIndex] += targetLine[currentCharIndex];
                        currentCharIndex++;
                    } else {
                        // Move to next line
                        currentLineIndex++;
                        currentCharIndex = 0;
                    }
                    
                    asciiDisplay.value = writingLines.join('\n');
                    
                    if (currentLineIndex < newLines.length) {
                        setTimeout(writeNextChar, 15);
                    }
                }
                
                writeNextChar();
            }
            
            deletePhase();
        }

        // Random character replacement transition
        function randomTransition(oldContent, newContent) {
            const oldLines = oldContent.split('\n');
            const newLines = newContent.split('\n');
            const maxLines = Math.max(oldLines.length, newLines.length);
            
            // Create a working copy that we'll modify
            let workingLines = [];
            for (let i = 0; i < maxLines; i++) {
                workingLines.push(oldLines[i] || '');
            }
            
            // Create list of all character positions that need to be updated
            let positions = [];
            for (let row = 0; row < maxLines; row++) {
                const oldLine = oldLines[row] || '';
                const newLine = newLines[row] || '';
                const maxWidth = Math.max(oldLine.length, newLine.length);
                
                for (let col = 0; col < maxWidth; col++) {
                    const oldChar = oldLine[col] || ' ';
                    const newChar = newLine[col] || ' ';
                    if (oldChar !== newChar) {
                        positions.push({ row, col, newChar });
                    }
                }
            }
            
            // Shuffle positions for random update
            for (let i = positions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [positions[i], positions[j]] = [positions[j], positions[i]];
            }
            
            let currentIndex = 0;
            
            function updateRandomChar() {
                if (currentIndex >= positions.length) {
                    return; // Done
                }
                
                const pos = positions[currentIndex];
                
                // Extend line if necessary
                while (workingLines[pos.row].length <= pos.col) {
                    workingLines[pos.row] += ' ';
                }
                
                // Update character
                workingLines[pos.row] = 
                    workingLines[pos.row].substring(0, pos.col) + 
                    pos.newChar + 
                    workingLines[pos.row].substring(pos.col + 1);
                
                asciiDisplay.value = workingLines.join('\n');
                
                currentIndex++;
                if (currentIndex < positions.length) {
                    setTimeout(updateRandomChar, 10);
                }
            }
            
            updateRandomChar();
        }

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

        // Function to handle player input
        function handlePlayerInput(input) {
            console.log("Player input:", input);
            
            // Example command processing
            if (input.toLowerCase().includes('help')) {
                updateInfoPanel(`Available commands:
- look: Examine your surroundings
- move [direction]: Move in a direction
- inventory: Check your items
- help: Show this help message

Current Status:
Player: ${gameState.playerName}
Health: ${gameState.health}/100
Level: ${gameState.level}
Location: ${gameState.location}`);
            } else if (input.toLowerCase().includes('look')) {
                loadTestScene2('leftToRight');
            } else if (input.toLowerCase().includes('cave')) {
                loadTestScene2('deleteAndWrite');
            } else if (input.toLowerCase().includes('forest')) {
                loadTestScene1('random');
            } else {
                updateInfoPanel(`You entered: "${input}"
Try typing 'help' for available commands.

Current Status:
Player: ${gameState.playerName}
Health: ${gameState.health}/100
Level: ${gameState.level}
Location: ${gameState.location}`);
            }
        }

        // Event listener for Enter key
        playerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !isInfoUpdating) {
                const input = playerInput.value.trim();
                if (input) {
                    handlePlayerInput(input);
                    playerInput.value = ''; // Clear input field
                }
            }
        });

        // Test ASCII art scenes
        function loadTestScene1(transition = 'instant') {
            const forestScene = `
                                    🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
                                  🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
                                🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
                              🌲🌲🌲           🌲🌲🌲
                            🌲🌲🌲               🌲🌲🌲
                          🌲🌲                     🌲🌲
                        🌲🌲         🧙‍♂️              🌲🌲
                      🌲🌲                           🌲🌲
                    🌲🌲             ⚔️                🌲🌲
                  🌲🌲                                 🌲🌲
                🌲🌲                                     🌲🌲
              🌲🌲           🏰                           🌲🌲
            🌲🌲                                           🌲🌲
          🌲🌲                                             🌲🌲
        🌲🌲                 🌿🌿🌿🌿🌿                       🌲🌲
      🌲🌲                 🌿🌿🌿🌿🌿🌿🌿                     🌲🌲
    🌲🌲                   🌿🌿🌿🌿🌿🌿🌿                     🌲🌲
  🌲🌲                     🌿🌿🌿🌿🌿🌿🌿                     🌲🌲
🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌿🌿🌿🌿🌿🌿🌿🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲

                    === ENCHANTED FOREST CLEARING ===
                          A mystical place awaits...
            `;
            updateAsciiDisplay(forestScene, transition);
        }

        function loadTestScene2(transition = 'instant') {
            const caveScene = `
████████████████████████████████████████████████████████████████████████████████
██                                                                            ██
██    ⚡     DARK CAVE ENTRANCE     ⚡                                      ██
██                                                                            ██
██         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                                           ██
██       ▄▄                     ▄▄▄                                         ██
██     ▄▄                         ▄▄▄                                       ██
██   ▄▄                             ▄▄                                      ██
██  ▄▄               👤               ▄▄                                     ██
██ ▄▄                                  ▄▄                                    ██
██▄▄                💎                  ▄▄                                   ██
██▄                                      ▄▄                                  ██
██▄              🔥   🔥   🔥              ▄                                  ██
██▄                                       ▄                                  ██
██▄▄                 ⚰️                   ▄▄                                  ██
██ ▄▄                                    ▄▄                                   ██
██  ▄▄              💀                  ▄▄                                    ██
██   ▄▄▄                             ▄▄▄                                     ██
██     ▄▄▄                         ▄▄▄                                       ██
██       ▄▄▄▄                 ▄▄▄▄▄                                          ██
██          ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄                                              ██
██                                                                            ██
████████████████████████████████████████████████████████████████████████████████

                           Something glints in the darkness...
            `;
            updateAsciiDisplay(caveScene, transition);
        }

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