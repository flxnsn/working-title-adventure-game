// Event listener for Enter key
playerInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !isInfoUpdating) {
        const input = playerInput.value.trim();
        if (input) {
            handlePlayerInput(input);
            playerInput.value = ''; // Clear input field
        }
    }
});

var TestArray = [
                [["true"],["false"],["yay"],["yayyy"]],
                [["look", "get up"],["not"],["you look around"],["scenery"]],
                [["go to path", "take path"],[],["you take the path"],["pathway and stuff"]],
                [["go back", "return"],[],["you cannot return"],[]]
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
            }
            if (!(currentScreenData[i][3].length == 0)) {
                //alert(currentScreenData[i][3]);
                updateAsciiDisplay(currentScreenData[i][3], "instant");
            }

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