function extractPlainText(htmlContent) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  return tempDiv.textContent || tempDiv.innerText || '';
}

// Helper function to parse HTML content into lines
function parseHtmlLines(htmlContent) {
  // Handle cases where htmlContent might be undefined, null, or not a string
  if (htmlContent === undefined || htmlContent === null) {
    return [];
  }
  
  // Convert to string if it's not already
  const contentStr = String(htmlContent);
  
  // Split by newlines while preserving HTML structure
  const lines = contentStr.split('\n');
  return lines;
}

// Helper function to create random chunks
function createRandomChunks(totalLines, minChunkSize = 5, maxChunkSize = 10) {
  const chunks = [];
  let currentIndex = 0;
  
  while (currentIndex < totalLines) {
    const remainingLines = totalLines - currentIndex;
    // Random chunk size between min and max, but not exceeding remaining lines
    const chunkSize = Math.min(
      remainingLines,
      Math.floor(Math.random() * (maxChunkSize - minChunkSize + 1)) + minChunkSize
    );
    
    const chunk = [];
    for (let i = 0; i < chunkSize && currentIndex < totalLines; i++) {
      chunk.push(currentIndex);
      currentIndex++;
    }
    chunks.push(chunk);
  }
  
  return chunks;
}

// Updated main function
function updateAsciiDisplay(asciiArt, transitionType = 'instant') {
  const currentContent = asciiDisplay.innerHTML;
  const newContent = asciiArt;

  if (transitionType == "init") {
    let hddsounds = ["sounds/HDD/Startup1.mp3", "sounds/HDD/Startup2.mp3"];
    let sound = hddsounds[Math.floor(Math.random() * hddsounds.length)];
    soundManager.playSoundRandomPitch(sound);
    topToBottomTransition(currentContent, newContent);

  } else {

    let hddsounds = ["sounds/HDD/loading1.mp3", "sounds/HDD/loading2.mp3", "sounds/HDD/loading3.mp3", "sounds/HDD/loading4.mp3", "sounds/HDD/loading5.mp3", "sounds/HDD/loading6.mp3", "sounds/HDD/loading7.mp3", "sounds/HDD/loading8.mp3", "sounds/HDD/loading9.mp3", "sounds/HDD/loading10.mp3", "sounds/HDD/loading11.mp3"];
    let sound = hddsounds[Math.floor(Math.random() * hddsounds.length)];
    soundManager.playSoundRandomPitch(sound);

    switch (transitionType) {
      case 'topToBottom':
        topToBottomTransition(currentContent, newContent);
        break;
      case 'deleteAndWrite':
        deleteAndWriteTransition(currentContent, newContent);
        break;
      case 'random':
        randomLineTransition(currentContent, newContent);
        break;
      case 'instant':
      default:
        asciiDisplay.innerHTML = newContent;
        break;
    }
  }
}