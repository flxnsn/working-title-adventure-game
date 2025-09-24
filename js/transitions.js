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