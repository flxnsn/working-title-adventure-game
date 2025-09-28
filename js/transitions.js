// Replace lines from top to bottom
function topToBottomTransition(oldContent, newContent) {
  const oldLines = parseHtmlLines(oldContent);
  const newLines = parseHtmlLines(newContent);
  const maxLines = Math.max(oldLines.length, newLines.length);
  
  let workingLines = [...oldLines];
  
  // Ensure we have enough lines in working array
  while (workingLines.length < maxLines) {
    workingLines.push('');
  }
  
  let currentLineIndex = 0;

  function updateNextLine() {
    if (currentLineIndex >= maxLines) {
      return; // Done
    }

    // Replace current line with new content
    workingLines[currentLineIndex] = newLines[currentLineIndex] || '';
    
    // Update display
    asciiDisplay.innerHTML = workingLines.slice(0, Math.max(oldLines.length, currentLineIndex + 1)).join('\n');

    currentLineIndex++;
    if (currentLineIndex < maxLines) {
      setTimeout(updateNextLine, 50);
    }
  }

  updateNextLine();
}

// Delete lines bottom to top, then write new lines top to bottom
function deleteAndWriteTransition(oldContent, newContent) {
  const oldLines = parseHtmlLines(oldContent);
  const newLines = parseHtmlLines(newContent);
  
  let workingLines = [...oldLines];

  // Phase 1: Delete from bottom to top
  function deletePhase() {
    if (workingLines.length === 0) {
      // Start writing phase
      setTimeout(() => writePhase(), 100);
      return;
    }

    // Remove last line
    workingLines.pop();
    asciiDisplay.innerHTML = workingLines.join('\n');
    
    setTimeout(deletePhase, 30);
  }

  // Phase 2: Write new content line by line from top
  function writePhase() {
    let writingLines = [];
    let currentLineIndex = 0;

    function writeNextLine() {
      if (currentLineIndex >= newLines.length) {
        return; // Done
      }

      // Add next line
      writingLines.push(newLines[currentLineIndex]);
      asciiDisplay.innerHTML = writingLines.join('\n');

      currentLineIndex++;
      if (currentLineIndex < newLines.length) {
        setTimeout(writeNextLine, 40);
      }
    }

    writeNextLine();
  }

  deletePhase();
}

// Replace lines in random order
function randomLineTransition(oldContent, newContent) {
  const oldLines = parseHtmlLines(oldContent);
  const newLines = parseHtmlLines(newContent);
  const maxLines = Math.max(oldLines.length, newLines.length);
  
  let workingLines = [...oldLines];
  
  // Ensure we have enough lines in working array
  while (workingLines.length < maxLines) {
    workingLines.push('');
  }

  // Create array of line indices to update
  let lineIndices = [];
  for (let i = 0; i < maxLines; i++) {
    // Only add lines that are actually different
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';
    if (oldLine !== newLine) {
      lineIndices.push(i);
    }
  }

  // Shuffle the line indices for random order
  for (let i = lineIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lineIndices[i], lineIndices[j]] = [lineIndices[j], lineIndices[i]];
  }

  let currentIndex = 0;

  function updateRandomLine() {
    if (currentIndex >= lineIndices.length) {
      return; // Done
    }

    const lineIndex = lineIndices[currentIndex];
    workingLines[lineIndex] = newLines[lineIndex] || '';

    // Update display - show up to the maximum of original length or current updates
    const displayLines = workingLines.slice(0, Math.max(oldLines.length, Math.max(...lineIndices.slice(0, currentIndex + 1)) + 1));
    asciiDisplay.innerHTML = displayLines.join('\n');

    currentIndex++;
    if (currentIndex < lineIndices.length) {
      setTimeout(updateRandomLine, 60);
    }
  }

  updateRandomLine();
}