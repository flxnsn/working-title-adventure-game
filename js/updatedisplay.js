// Function to update ASCII display with transition effects
function updateAsciiDisplay(asciiArt, transitionType = 'instant') {
  const currentContent = asciiDisplay.value;
  const newContent = asciiArt;

  switch (transitionType) {
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