// Event listener for Enter key
let inputAllowed = true;   // set to false to block input

document.addEventListener('keydown', function (e) {
  if (!inputAllowed) return;   // do nothing when blocked

  // ENTER: submit
  if (e.key === 'Enter' && !isInfoUpdating) {
    const input = playerInput.value.trim();
    if (input) {
      handlePlayerInput(input);
      playerInput.value = '';  // clear after handling
    }
    e.preventDefault();
    let spacesounds = ["sounds/Keyboard/space1.mp3", "sounds/Keyboard/space3.mp3", "sounds/Keyboard/space3.mp3", "sounds/Keyboard/space4.mp3", "sounds/Keyboard/space5.mp3"];
    let sound = spacesounds[Math.floor(Math.random() * spacesounds.length)];
    soundManager.playSoundRandomPitch(sound);
    return;
  }

  // BACKSPACE: delete last character
  if (e.key === 'Backspace') {
    playerInput.value = playerInput.value.slice(0, -1);
    e.preventDefault();
    let spacesounds = ["sounds/Keyboard/space1.mp3", "sounds/Keyboard/space3.mp3", "sounds/Keyboard/space3.mp3", "sounds/Keyboard/space4.mp3", "sounds/Keyboard/space5.mp3"];
    let sound = spacesounds[Math.floor(Math.random() * spacesounds.length)];
    soundManager.playSoundRandomPitch(sound);
    return;
  }

  // Letters and numbers: add to value
  if (/^[a-z0-9]$/i.test(e.key)) {
    playerInput.value += e.key;
    e.preventDefault();
    let keysounds = ["sounds/Keyboard/typing1.mp3", "sounds/Keyboard/typing2.mp3", "sounds/Keyboard/typing3.mp3", "sounds/Keyboard/typing4.mp3", "sounds/Keyboard/typing5.mp3", "sounds/Keyboard/typing6.mp3", "sounds/Keyboard/typing7.mp3", "sounds/Keyboard/typing8.mp3", "sounds/Keyboard/typing9.mp3"];
    let sound = keysounds[Math.floor(Math.random() * keysounds.length)];
    soundManager.playSoundRandomPitch(sound);
    return;
  }

  // Allow a few punctuation marks
  if (/^[!.:,?]$/.test(e.key)) {
    playerInput.value += e.key;
    e.preventDefault();
    let keysounds = ["sounds/Keyboard/typing1.mp3", "sounds/Keyboard/typing2.mp3", "sounds/Keyboard/typing3.mp3", "sounds/Keyboard/typing4.mp3", "sounds/Keyboard/typing5.mp3", "sounds/Keyboard/typing6.mp3", "sounds/Keyboard/typing7.mp3", "sounds/Keyboard/typing8.mp3", "sounds/Keyboard/typing9.mp3"];
    let sound = keysounds[Math.floor(Math.random() * keysounds.length)];
    soundManager.playSoundRandomPitch(sound);
    return;
  }

  // Allow space few punctuation marks
  if (/^[ ]$/.test(e.key)) {
    playerInput.value += e.key;
    e.preventDefault();
    let spacesounds = ["sounds/Keyboard/space1.mp3", "sounds/Keyboard/space3.mp3", "sounds/Keyboard/space3.mp3", "sounds/Keyboard/space4.mp3", "sounds/Keyboard/space5.mp3"];
    let sound = spacesounds[Math.floor(Math.random() * spacesounds.length)];
    soundManager.playSoundRandomPitch(sound);
    return;
  }
});

var TestArray = [
                [["mountain", "mountains"],["false"],["mountain range"],myAsciiArt],
                [["castle"],["not"],["ross castle, ireland"],woods],
                [["lighthouse", "take path"],[],["lighthouse"],[]],
                [["back", "return"],[],["Welcome to Untitled Adventure Game\!\nEnter mountains for mountains\nEnter castle for castle\nEnter lighthouse for lighthouse\nEnter cat for cat"],[]],
                [["cat", "kitty"],[],["kitty"],[]],
];

var currentScreenData = TestArray;

function handlePlayerInput(input) {

    const check = (input.toLowerCase()).split(" ");
    //so multi word phrases cnnot be detected...
    //typewriter effect gone
    //alert(check);

    for (let i = 0; i < currentScreenData.length; i++) {
        if ((currentScreenData[i][0].some(subArr => check.includes(subArr))) && ((currentScreenData[i][1].some(subArr => check.includes(subArr))) == false)) {
            if (!(currentScreenData[i][2].length == 0)) {
                //alert(currentScreenData[i][2]);
                updateInfoPanel(currentScreenData[i][2]);

                if (currentScreenData[i][2] == "yay") {
                    soundManager.playSoundRandomPitch('sounds/bop.mp3');
                    
                }
            }
            if (!(currentScreenData[i][3] == null)) {
                //alert(currentScreenData[i][3]);
                updateAsciiDisplay(currentScreenData[i][3], "random");
                //document.getElementById('asciiDisplay').innerHTML = currentScreenData[i][3];
            }
        break;
        }         
    }
    // bug, also triggers for empty lines? Or not... strange...
}


// Function to handle player input
function handlePlayerInputBackup(input) {
    // console.log("Player input:", input);

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