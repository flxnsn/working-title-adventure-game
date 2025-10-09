// Animation loop functions
function stopAnimationLoop() {
  if (animationLoopInterval !== null) {
    clearInterval(animationLoopInterval);
    animationLoopInterval = null;
  }
  // Also stop any ongoing blend animation
  if (window.blendAnimationFrame) {
    cancelAnimationFrame(window.blendAnimationFrame);
    window.blendAnimationFrame = null;
  }
}

function startAnimationLoop() {
  // Don't start if there's no art or no sequence
  if (!currentAsciiArt || !currentAsciiArt.sequence) {
    return;
  }

  // Parse the sequence string into an array of frame indices
  const sequence = currentAsciiArt.sequence.split(',').map(Number);
  
  // If sequence is empty or only has one frame, no animation needed
  if (sequence.length <= 1) {
    return;
  }

  currentFrameIndex = 0;
  let lastRenderedFrame = -1; // Track the last frame we actually rendered

  // Animation loop - update every 1000ms (adjustable)
  animationLoopInterval = setInterval(() => {
    currentFrameIndex = (currentFrameIndex + 1) % sequence.length;
    const frameNumber = sequence[currentFrameIndex];
    
    // Only render if the frame number has changed
    if (frameNumber !== lastRenderedFrame) {
      const previousFrame = lastRenderedFrame;
      blendToFrame(currentAsciiArt, previousFrame, frameNumber, 100); // 200ms blend duration
      lastRenderedFrame = frameNumber;
    }
  }, 200);
}

// Blend from one frame to another with a smooth transition
function blendToFrame(asciiData, fromFrameIndex, toFrameIndex, duration = 200) {
  const canvas = document.getElementById('asciiArtCanvas');
  if (!canvas) return;

  // If this is the first frame (fromFrameIndex is -1), just render instantly
  if (fromFrameIndex === -1 || fromFrameIndex === toFrameIndex) {
    renderAsciiFrame(asciiData, toFrameIndex);
    return;
  }

  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Render both frames with opacity
    renderAsciiFrameBlended(asciiData, fromFrameIndex, toFrameIndex, progress);

    if (progress < 1) {
      window.blendAnimationFrame = requestAnimationFrame(animate);
    } else {
      window.blendAnimationFrame = null;
    }
  }

  window.blendAnimationFrame = requestAnimationFrame(animate);
}

// Render two frames blended together
function renderAsciiFrameBlended(asciiData, fromFrameIndex, toFrameIndex, blendFactor) {
  const canvas = document.getElementById('asciiArtCanvas');
  if (!canvas) return;

  const width = asciiData.dimensions.width;
  const height = asciiData.dimensions.height;
  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '10px "Courier New", monospace';
  ctx.textBaseline = 'top';

  // Check if frames exist
  if (!asciiData.frames[fromFrameIndex] || !asciiData.frames[toFrameIndex]) {
    return;
  }

  const fromChars = asciiData.frames[fromFrameIndex][0].split('');
  const fromColors = asciiData.frames[fromFrameIndex][1].split(',').map(Number);
  const toChars = asciiData.frames[toFrameIndex][0].split('');
  const toColors = asciiData.frames[toFrameIndex][1].split(',').map(Number);

  // Render from-frame with fading out opacity
  ctx.globalAlpha = 1 - blendFactor;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const char = fromChars[idx];
      const colorIndex = fromColors[idx];
      ctx.fillStyle = asciiColors[colorIndex];
      ctx.fillText(char, x * charWidth, y * charHeight);
    }
  }

  // Render to-frame with fading in opacity
  ctx.globalAlpha = blendFactor;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const char = toChars[idx];
      const colorIndex = toColors[idx];
      ctx.fillStyle = asciiColors[colorIndex];
      ctx.fillText(char, x * charWidth, y * charHeight);
    }
  }

  // Reset global alpha
  ctx.globalAlpha = 1;
}