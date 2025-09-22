// ASCII characters from light to dark (based on visual density)
        const asciiChars = ' .,:;ox%#@';
        
        // 16-color palette (ANSI colors)
        const colors = [
            '#000000', '#800000', '#008000', '#808000',
            '#000080', '#800080', '#008080', '#c0c0c0',
            '#808080', '#ff0000', '#00ff00', '#ffff00',
            '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
        ];

        function convertToAscii() {
            const input = document.getElementById('imageInput');
            const output = document.getElementById('ascii-output');
            
            if (!input.files[0]) {
                alert('Please select a JPG image first!');
                return;
            }

            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = function() {
                // Set canvas to 200x100
                canvas.width = 200;
                canvas.height = 100;
                
                // Draw image scaled to canvas size
                ctx.drawImage(img, 0, 0, 200, 100);
                
                // Get image data
                const imageData = ctx.getImageData(0, 0, 200, 100);
                const pixels = imageData.data;
                
                let asciiArt = '';
                
                // Process each pixel
                for (let y = 0; y < 100; y++) {
                    for (let x = 0; x < 200; x++) {
                        const pixelIndex = (y * 200 + x) * 4;
                        const r = pixels[pixelIndex];
                        const g = pixels[pixelIndex + 1];
                        const b = pixels[pixelIndex + 2];
                        
                        // Calculate brightness (grayscale)
                        const brightness = Math.round((r + g + b) / 3);
                        
                        // Map brightness to ASCII character
                        const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1));
                        const asciiChar = asciiChars[charIndex];
                        
                        // Determine color based on RGB values
                        const colorIndex = getColorIndex(r, g, b);
                        const color = colors[colorIndex];
                        
                        // Add colored character to output
                        asciiArt += `<span style="color: ${color}">${asciiChar}</span>`;
                    }
                    asciiArt += '\n';
                }
                
                output.innerHTML = asciiArt;
            };
            
            // Load the selected image
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }

        function getColorIndex(r, g, b) {
            // Map RGB values to one of 16 colors
            // This uses a simple approach: quantize each channel to 2 levels
            // then combine to get 2^3 = 8 base colors, then add intensity variants
            
            const rLevel = r > 127 ? 1 : 0;
            const gLevel = g > 127 ? 1 : 0;
            const bLevel = b > 127 ? 1 : 0;
            
            // Calculate overall intensity
            const intensity = (r + g + b) / 3;
            const isIntense = intensity > 127;
            
            // Base color index (0-7)
            let baseColor = rLevel * 4 + gLevel * 2 + bLevel;
            
            // If intense, add 8 to get brighter variant (8-15)
            if (isIntense && baseColor > 0) {
                baseColor += 8;
            }
            
            return Math.min(baseColor, 15);
        }

        // Alternative more sophisticated color mapping function
        function getColorIndexAdvanced(r, g, b) {
            // Find closest color in the 16-color palette
            let minDistance = Infinity;
            let closestIndex = 0;
            
            for (let i = 0; i < colors.length; i++) {
                const color = colors[i];
                const cr = parseInt(color.substr(1, 2), 16);
                const cg = parseInt(color.substr(3, 2), 16);
                const cb = parseInt(color.substr(5, 2), 16);
                
                // Calculate Euclidean distance in RGB space
                const distance = Math.sqrt(
                    Math.pow(r - cr, 2) + 
                    Math.pow(g - cg, 2) + 
                    Math.pow(b - cb, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = i;
                }
            }
            
            return closestIndex;
        }