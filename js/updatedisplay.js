const asciiColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ff8000', '#8000ff', '#00ff80', '#ff0080', '#8080ff', '#ff8080', '#80ff80', '#808080'
];

// Character dimensions
const charWidth = 6;
const charHeight = 10;

// Global variables for animation
let currentAsciiArt = null;
let currentFrameIndex = 0;
let animationLoopInterval = null;

// Helper function to create random chunks
function createRandomChunks(totalLines, minChunkSize = 5, maxChunkSize = 10) {
  const chunks = [];
  let currentIndex = 0;

  while (currentIndex < totalLines) {
    const remainingLines = totalLines - currentIndex;
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

// Helper function to render specific lines of ASCII art
function renderAsciiLines(asciiData, lineIndices = null) {
  const canvas = document.getElementById('asciiArtCanvas');
  if (!canvas) {
    console.error(`Canvas with id 'asciiArtCanvas' not found`);
    return;
  }

  const width = asciiData.dimensions.width;
  const height = asciiData.dimensions.height;
  
  // Extract chars and colorIndices from frame[0]
  const chars = asciiData.frames[0][0].split('');
  const colorIndices = asciiData.frames[0][1].split(',').map(Number);

  const ctx = canvas.getContext('2d');
  ctx.font = '10px "Courier New", monospace';
  ctx.textBaseline = 'top';

  // If no specific lines provided, render all
  const linesToRender = lineIndices || Array.from({ length: height }, (_, i) => i);

  for (const y of linesToRender) {
    if (y >= height) continue;
    
    // Clear the line first
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, y * charHeight, canvas.width, charHeight);

    // Draw the line
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const char = chars[idx];
      const colorIndex = colorIndices[idx];
      ctx.fillStyle = asciiColors[colorIndex];
      ctx.fillText(char, x * charWidth, y * charHeight);
    }
  }
}

// Helper function to clear specific lines
function clearAsciiLines(asciiData, lineIndices) {
  const canvas = document.getElementById('asciiArtCanvas');
  if (!canvas) return;

  const height = asciiData.dimensions.height;
  const ctx = canvas.getContext('2d');

  for (const y of lineIndices) {
    if (y >= height) continue;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, y * charHeight, canvas.width, charHeight);
  }
}

// Main update function
function updateAsciiDisplay(asciiData, transitionType = 'instant') {
  // Stop any existing animation loop
  stopAnimationLoop();
  
  // Update current art reference
  currentAsciiArt = asciiData;
  currentFrameIndex = 0;
  
  const canvas = document.getElementById('asciiArtCanvas');
  if (!canvas) {
    console.error(`Canvas with id 'asciiArtCanvas' not found`);
    return;
  }

  // Set canvas size if needed
  const width = asciiData.dimensions.width;
  const height = asciiData.dimensions.height;
  if (canvas.width !== width * charWidth || canvas.height !== height * charHeight) {
    canvas.width = width * charWidth;
    canvas.height = height * charHeight;
  }

  // Play sounds if soundManager is available
  if (soundManager) {
    if (transitionType === "init") {
      let hddsounds = ["sounds/HDD/Startup1.mp3", "sounds/HDD/Startup2.mp3"];
      
      let sound = hddsounds[Math.floor(Math.random() * hddsounds.length)];
      soundManager.playSoundRandomPitch(sound);
    } else if (transitionType !== 'instant') {
      let hddsounds = [
        "sounds/HDD/loading1.mp3", "sounds/HDD/loading2.mp3", "sounds/HDD/loading3.mp3",
        "sounds/HDD/loading4.mp3", "sounds/HDD/loading5.mp3", "sounds/HDD/loading6.mp3",
        "sounds/HDD/loading7.mp3", "sounds/HDD/loading8.mp3", "sounds/HDD/loading9.mp3",
        "sounds/HDD/loading10.mp3", "sounds/HDD/loading11.mp3"
      ];
      let sound = hddsounds[Math.floor(Math.random() * hddsounds.length)];
      soundManager.playSoundRandomPitch(sound);
    }
  }

  // Execute transition, then start animation loop
  if (transitionType === "init") {
    topToBottomTransition(asciiData, () => startAnimationLoop());
  } else {
    switch (transitionType) {
      case 'topToBottom':
        topToBottomTransition(asciiData, () => startAnimationLoop());
        break;
      case 'deleteAndWrite':
        deleteAndWriteTransition(asciiData, () => startAnimationLoop());
        break;
      case 'random':
        randomLineTransition(asciiData, () => startAnimationLoop());
        break;
      case 'instant':
      default:
        renderAsciiLines(asciiData);
        startAnimationLoop();
        break;
    }
  }
}

// Replace lines from top to bottom in chunks
function topToBottomTransition(asciiData, onComplete) {
  const height = asciiData.dimensions.height;
  const chunks = createRandomChunks(height);
  let currentChunkIndex = 0;

  function updateNextChunk() {
    if (currentChunkIndex >= chunks.length) {
      if (onComplete) onComplete();
      return; // Done
    }

    const chunk = chunks[currentChunkIndex];
    renderAsciiLines(asciiData, chunk);

    currentChunkIndex++;
    if (currentChunkIndex < chunks.length) {
      setTimeout(updateNextChunk, 50);
    } else {
      if (onComplete) onComplete();
    }
  }

  updateNextChunk();
}

// Delete lines bottom to top in chunks, then write new lines top to bottom in chunks
function deleteAndWriteTransition(asciiData, onComplete) {
  const height = asciiData.dimensions.height;
  const deleteChunks = createRandomChunks(height);
  deleteChunks.reverse(); // Process from bottom to top

  let deleteChunkIndex = 0;
  let currentHeight = height;

  // Phase 1: Delete from bottom to top in chunks
  function deletePhase() {
    if (deleteChunkIndex >= deleteChunks.length) {
      // Start writing phase
      setTimeout(() => writePhase(), 100);
      return;
    }

    const chunk = deleteChunks[deleteChunkIndex];
    clearAsciiLines(asciiData, chunk);

    deleteChunkIndex++;
    setTimeout(deletePhase, 30);
  }

  // Phase 2: Write new content in chunks from top
  function writePhase() {
    const writeChunks = createRandomChunks(height);
    let writeChunkIndex = 0;

    function writeNextChunk() {
      if (writeChunkIndex >= writeChunks.length) {
        if (onComplete) onComplete();
        return; // Done
      }

      const chunk = writeChunks[writeChunkIndex];
      renderAsciiLines(asciiData, chunk);

      writeChunkIndex++;
      if (writeChunkIndex < writeChunks.length) {
        setTimeout(writeNextChunk, 40);
      } else {
        if (onComplete) onComplete();
      }
    }

    writeNextChunk();
  }

  deletePhase();
}

// Replace lines in random order in chunks
function randomLineTransition(asciiData, onComplete) {
  const height = asciiData.dimensions.height;

  // Create array of all line indices
  let lineIndices = Array.from({ length: height }, (_, i) => i);

  // Shuffle the line indices for random order
  for (let i = lineIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lineIndices[i], lineIndices[j]] = [lineIndices[j], lineIndices[i]];
  }

  // Create random chunks from the shuffled indices
  const chunks = [];
  let currentIndex = 0;

  while (currentIndex < lineIndices.length) {
    const remainingLines = lineIndices.length - currentIndex;
    const chunkSize = Math.min(
      remainingLines,
      Math.floor(Math.random() * 6) + 5 // 5-10 lines per chunk
    );

    const chunk = lineIndices.slice(currentIndex, currentIndex + chunkSize);
    chunks.push(chunk);
    currentIndex += chunkSize;
  }

  let chunkIndex = 0;

  function updateRandomChunk() {
    if (chunkIndex >= chunks.length) {
      if (onComplete) onComplete();
      return; // Done
    }

    const chunk = chunks[chunkIndex];
    renderAsciiLines(asciiData, chunk);

    chunkIndex++;
    if (chunkIndex < chunks.length) {
      setTimeout(updateRandomChunk, 60);
    } else {
      if (onComplete) onComplete();
    }
  }

  updateRandomChunk();
}

// Full display function (for reference/compatibility)
function displayAsciiArt(asciiData) {
  updateAsciiDisplay(asciiData, 'instant');
}



// Helper function to render a specific frame
function renderAsciiFrame(asciiData, frameIndex) {
  const canvas = document.getElementById('asciiArtCanvas');
  if (!canvas) return;

  const width = asciiData.dimensions.width;
  const height = asciiData.dimensions.height;
  
  // Check if frame exists
  if (!asciiData.frames[frameIndex]) {
    console.error(`Frame ${frameIndex} does not exist`);
    return;
  }
  
  const chars = asciiData.frames[frameIndex][0].split('');
  const colorIndices = asciiData.frames[frameIndex][1].split(',').map(Number);

  const ctx = canvas.getContext('2d');
  ctx.font = '10px "Courier New", monospace';
  ctx.textBaseline = 'top';

  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render all characters
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const char = chars[idx];
      const colorIndex = colorIndices[idx];
      ctx.fillStyle = asciiColors[colorIndex];
      ctx.fillText(char, x * charWidth, y * charHeight);
    }
  }
}