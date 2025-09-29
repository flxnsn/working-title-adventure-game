// Replace lines from top to bottom in chunks
function topToBottomTransition(oldContent, newContent) {
  const oldLines = parseHtmlLines(oldContent);
  const newLines = parseHtmlLines(newContent);
  const maxLines = Math.max(oldLines.length, newLines.length);
  
  let workingLines = [...oldLines];
  
  // Ensure we have enough lines in working array
  while (workingLines.length < maxLines) {
    workingLines.push('');
  }
  
  // Create chunks of line indices
  const chunks = createRandomChunks(maxLines);
  let currentChunkIndex = 0;

  function updateNextChunk() {
    if (currentChunkIndex >= chunks.length) {
      return; // Done
    }

    const chunk = chunks[currentChunkIndex];
    
    // Update all lines in this chunk
    chunk.forEach(lineIndex => {
      workingLines[lineIndex] = newLines[lineIndex] || '';
    });
    
    // Update display - show up to the last line we've processed
    const maxProcessedLine = Math.max(...chunk);
    asciiDisplay.innerHTML = workingLines.slice(0, Math.max(oldLines.length, maxProcessedLine + 1)).join('\n');

    currentChunkIndex++;
    if (currentChunkIndex < chunks.length) {
      setTimeout(updateNextChunk, 50);
    }
  }

  updateNextChunk();
}

// Delete lines bottom to top in chunks, then write new lines top to bottom in chunks
function deleteAndWriteTransition(oldContent, newContent) {
  const oldLines = parseHtmlLines(oldContent);
  const newLines = parseHtmlLines(newContent);
  
  let workingLines = [...oldLines];
  
  // Create chunks for deletion (in reverse order)
  const deleteChunks = createRandomChunks(oldLines.length);
  deleteChunks.reverse(); // Process from bottom to top

  // Phase 1: Delete from bottom to top in chunks
  let deleteChunkIndex = 0;
  
  function deletePhase() {
    if (deleteChunkIndex >= deleteChunks.length) {
      // Start writing phase
      setTimeout(() => writePhase(), 100);
      return;
    }

    const chunk = deleteChunks[deleteChunkIndex];
    const linesToRemove = chunk.length;
    
    // Remove lines from the end
    workingLines.splice(-linesToRemove, linesToRemove);
    asciiDisplay.innerHTML = workingLines.join('\n');
    
    deleteChunkIndex++;
    setTimeout(deletePhase, 30);
  }

  // Phase 2: Write new content in chunks from top
  function writePhase() {
    let writingLines = [];
    const writeChunks = createRandomChunks(newLines.length);
    let writeChunkIndex = 0;

    function writeNextChunk() {
      if (writeChunkIndex >= writeChunks.length) {
        return; // Done
      }

      const chunk = writeChunks[writeChunkIndex];
      
      // Add all lines from this chunk
      chunk.forEach(lineIndex => {
        writingLines.push(newLines[lineIndex]);
      });
      
      asciiDisplay.innerHTML = writingLines.join('\n');

      writeChunkIndex++;
      if (writeChunkIndex < writeChunks.length) {
        setTimeout(writeNextChunk, 40);
      }
    }

    writeNextChunk();
  }

  deletePhase();
}

// Replace lines in random order in chunks
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
      return; // Done
    }

    const chunk = chunks[chunkIndex];
    
    // Update all lines in this chunk
    chunk.forEach(lineIndex => {
      workingLines[lineIndex] = newLines[lineIndex] || '';
    });

    // Update display
    const allProcessedIndices = chunks.slice(0, chunkIndex + 1).flat();
    const maxProcessedLine = Math.max(...allProcessedIndices);
    const displayLines = workingLines.slice(0, Math.max(oldLines.length, maxProcessedLine + 1));
    asciiDisplay.innerHTML = displayLines.join('\n');

    chunkIndex++;
    if (chunkIndex < chunks.length) {
      setTimeout(updateRandomChunk, 60);
    }
  }

  updateRandomChunk();
}