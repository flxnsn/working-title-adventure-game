const contentCanvas = document.getElementById('contentCanvas');
const contentCtx = contentCanvas.getContext('2d');
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');
const content = document.getElementById('content');

if (!gl) {
    alert('WebGL not supported');
}

// Vertex shader for full-screen quad
const vsSource = `
            attribute vec2 aPosition;
            varying vec2 vTexCoord;
            void main() {
                vTexCoord = aPosition * 0.5 + 0.5;
                vTexCoord.y = 1.0 - vTexCoord.y;
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

// ===== SHADER EFFECT PARAMETERS (Easy to adjust!) =====
const EFFECTS = {
    pixelation: {
        pixelSize: 1.0  // Higher = more pixelated (try 2.0 - 8.0)
    },
    bloom: {
        radius: 3.0,        // Bloom spread distance (try 1.0 - 6.0)
        threshold: 0.6,     // Brightness threshold for bloom (try 0.4 - 0.8)
        intensity: 0.8,     // Bloom strength (try 0.3 - 1.5)
        samples: 16         // Quality of bloom (16 is good balance)
    },
    scanlines: {
        frequency: 1.5,     // Lines per pixel (try 1.0 - 3.0)
        intensity: 0.1      // Darkness of lines (try 0.05 - 0.2)
    },
    crt: {
        flickerSpeedMin: 5.0,  // Min flicker speed (try 5.0 - 15.0)
        flickerSpeedMax: 15.0, // Max flicker speed (try 10.0 - 25.0)
        flickerAmountMin: 0.02, // Min flicker intensity (try 0.01 - 0.05)
        flickerAmountMax: 0.1, // Max flicker intensity (try 0.05 - 0.15)
        flickerBurstMin: 1,    // Minimum flicker bursts (try 1 - 3)
        flickerBurstMax: 3,    // Maximum flicker bursts (try 2 - 5)
        flickerDelayMin: 5.0,  // Min seconds between flickers (try 3.0 - 10.0)
        flickerDelayMax: 120.0, // Max seconds between flickers (try 15.0 - 60.0)
        barrelDistortion: 0.1, // CRT bulge amount (try 0.05 - 0.2)
        overscan: 1.05         // Zoom to fill edges (try 1.0 - 1.1)
    }
};

// Fragment shader for pixelation + bloom + scanlines + barrel distortion
const fsSource = `
            precision mediump float;
            varying vec2 vTexCoord;
            uniform sampler2D uTexture;
            uniform vec2 uResolution;
            uniform float uTime;
            uniform float uPixelSize;
            uniform float uBloomRadius;
            uniform float uBloomThreshold;
            uniform float uBloomIntensity;
            uniform float uScanlineFreq;
            uniform float uScanlineIntensity;
            uniform float uFlickerSpeed;
            uniform float uFlickerAmount;
            uniform float uBarrelDistortion;
            uniform float uOverscan;
            uniform float uFlickerActive;
            
            void main() {
                vec2 uv = vTexCoord;
                
                // ===== PIXELATION =====
                vec2 pixelatedUV = floor(uv * uResolution / uPixelSize) * uPixelSize / uResolution;
                vec4 color = texture2D(uTexture, pixelatedUV);
                
                // ===== BLOOM EFFECT =====
                vec4 bloom = vec4(0.0);
                
                for(int i = 0; i < 16; i++) {
                    float angle = float(i) * 6.28318 / 16.0;
                    vec2 bloomOffset = vec2(cos(angle), sin(angle)) * uBloomRadius / uResolution;
                    vec4 sample = texture2D(uTexture, pixelatedUV + bloomOffset);
                    float brightness = dot(sample.rgb, vec3(0.299, 0.587, 0.114));
                    if(brightness > uBloomThreshold) {
                        bloom += sample * (brightness - uBloomThreshold);
                    }
                }
                bloom /= 16.0;
                color += bloom * uBloomIntensity;
                
                // ===== SCANLINES =====
                float scanline = sin(uv.y * uResolution.y * uScanlineFreq) * uScanlineIntensity;
                color.rgb -= scanline;
                
                // ===== CRT EFFECTS (Applied Last) =====
                // CRT Barrel Distortion - stretch outward from center
                vec2 center = vec2(0.5, 0.5);
                vec2 offset = uv - center;
                float dist = length(offset);
                
                // Positive distortion stretches outward (barrel effect)
                float distortionFactor = 1.0 + uBarrelDistortion * dist * dist;
                vec2 distortedUV = center + offset * distortionFactor;
                
                // Apply overscan AFTER distortion to zoom in and fill viewport
                distortedUV = (distortedUV - 0.5) / uOverscan + 0.5;
                
                // If distorted UV is out of bounds, show black (CRT edges)
                if(distortedUV.x < 0.0 || distortedUV.x > 1.0 || distortedUV.y < 0.0 || distortedUV.y > 1.0) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                    return;
                }
                
                // Sample the color at the distorted position
                pixelatedUV = floor(distortedUV * uResolution / uPixelSize) * uPixelSize / uResolution;
                color = texture2D(uTexture, pixelatedUV);
                
                // Reapply bloom at distorted position
                bloom = vec4(0.0);
                for(int i = 0; i < 16; i++) {
                    float angle = float(i) * 6.28318 / 16.0;
                    vec2 bloomOffset = vec2(cos(angle), sin(angle)) * uBloomRadius / uResolution;
                    vec4 sample = texture2D(uTexture, pixelatedUV + bloomOffset);
                    float brightness = dot(sample.rgb, vec3(0.299, 0.587, 0.114));
                    if(brightness > uBloomThreshold) {
                        bloom += sample * (brightness - uBloomThreshold);
                    }
                }
                bloom /= 16.0;
                color += bloom * uBloomIntensity;
                
                // Reapply scanlines at distorted position
                scanline = sin(distortedUV.y * uResolution.y * uScanlineFreq) * uScanlineIntensity;
                color.rgb -= scanline;
                
                // CRT Flicker (only when active)
                float flicker = 1.0;
                if(uFlickerActive > 0.5) {
                    flicker = sin(uTime * uFlickerSpeed * 10.0) * uFlickerAmount + (1.0 - uFlickerAmount);
                }
                color.rgb *= flicker;
                
                // CRT Vignette at edges
                float vignette = smoothstep(0.8, 0.3, dist);
                color.rgb *= vignette;
                
                gl_FragColor = color;
            }
        `;

function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
}

const positionLocation = gl.getAttribLocation(program, 'aPosition');
const textureLocation = gl.getUniformLocation(program, 'uTexture');
const resolutionLocation = gl.getUniformLocation(program, 'uResolution');
const timeLocation = gl.getUniformLocation(program, 'uTime');

// Get uniform locations for all effect parameters
const pixelSizeLocation = gl.getUniformLocation(program, 'uPixelSize');
const bloomRadiusLocation = gl.getUniformLocation(program, 'uBloomRadius');
const bloomThresholdLocation = gl.getUniformLocation(program, 'uBloomThreshold');
const bloomIntensityLocation = gl.getUniformLocation(program, 'uBloomIntensity');
const scanlineFreqLocation = gl.getUniformLocation(program, 'uScanlineFreq');
const scanlineIntensityLocation = gl.getUniformLocation(program, 'uScanlineIntensity');
const flickerSpeedLocation = gl.getUniformLocation(program, 'uFlickerSpeed');
const flickerAmountLocation = gl.getUniformLocation(program, 'uFlickerAmount');
const barrelDistortionLocation = gl.getUniformLocation(program, 'uBarrelDistortion');
const overscanLocation = gl.getUniformLocation(program, 'uOverscan');
const flickerActiveLocation = gl.getUniformLocation(program, 'uFlickerActive');

// Create full-screen quad
const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const texture = gl.createTexture();

function resizeCanvases() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w;
    canvas.height = h;
    contentCanvas.width = w;
    contentCanvas.height = h;

    gl.viewport(0, 0, w, h);
}

window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// Flicker timing system
let flickerState = {
    isActive: false,
    nextFlickerTime: 0,
    flickerEndTime: 0,
    burstCount: 0,
    currentBurst: 0,
    currentSpeed: 0,
    currentAmount: 0
};

function updateFlickerState(currentTime) {
    if (!flickerState.isActive && currentTime >= flickerState.nextFlickerTime) {
        // Start new flicker burst with random speed and amount
        flickerState.isActive = true;
        flickerState.burstCount = Math.floor(
            Math.random() * (EFFECTS.crt.flickerBurstMax - EFFECTS.crt.flickerBurstMin + 1)
        ) + EFFECTS.crt.flickerBurstMin;
        flickerState.currentBurst = 0;
        flickerState.flickerEndTime = currentTime + (flickerState.burstCount * 0.15); // Each burst ~150ms

        // Randomize speed and amount for this burst
        flickerState.currentSpeed = Math.random() *
            (EFFECTS.crt.flickerSpeedMax - EFFECTS.crt.flickerSpeedMin) +
            EFFECTS.crt.flickerSpeedMin;
        flickerState.currentAmount = Math.random() *
            (EFFECTS.crt.flickerAmountMax - EFFECTS.crt.flickerAmountMin) +
            EFFECTS.crt.flickerAmountMin;
    }

    if (flickerState.isActive && currentTime >= flickerState.flickerEndTime) {
        // End flicker burst, schedule next one
        flickerState.isActive = false;
        const delay = Math.random() *
            (EFFECTS.crt.flickerDelayMax - EFFECTS.crt.flickerDelayMin) +
            EFFECTS.crt.flickerDelayMin;
        flickerState.nextFlickerTime = currentTime + delay;
    }

    return {
        active: flickerState.isActive ? 1.0 : 0.0,
        speed: flickerState.currentSpeed,
        amount: flickerState.currentAmount
    };
}

// Capture HTML content using html2canvas
let capturedCanvas = null;
let isCapturing = false;

async function renderContentToCanvas() {
    if (isCapturing) return;
    isCapturing = true;

    try {
        // Capture the actual HTML content
        capturedCanvas = await html2canvas(document.body, {
            backgroundColor: '#0a0a0a',
            scale: 1,
            logging: false,
            width: window.innerWidth,
            height: window.innerHeight
        });

        // Draw captured content to our content canvas
        contentCtx.clearRect(0, 0, contentCanvas.width, contentCanvas.height);
        contentCtx.drawImage(capturedCanvas, 0, 0);
    } catch (error) {
        console.error('Error capturing content:', error);
    }

    isCapturing = false;
}

// Capture content periodically (e.g., every 100ms for smooth updates)
let lastCaptureTime = 0;
const captureInterval = 100; // ms

function render(time) {
    const currentTimeSeconds = time * 0.001;

    // Update flicker state
    const flickerData = updateFlickerState(currentTimeSeconds);

    // Capture content at regular intervals
    if (time - lastCaptureTime > captureInterval) {
        renderContentToCanvas();
        lastCaptureTime = time;
    }

    // Update WebGL texture from content canvas
    if (capturedCanvas) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, contentCanvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Render with shader effects
        gl.useProgram(program);

        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(textureLocation, 0);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, currentTimeSeconds);

        // Pass all effect parameters to shader
        gl.uniform1f(pixelSizeLocation, EFFECTS.pixelation.pixelSize);
        gl.uniform1f(bloomRadiusLocation, EFFECTS.bloom.radius);
        gl.uniform1f(bloomThresholdLocation, EFFECTS.bloom.threshold);
        gl.uniform1f(bloomIntensityLocation, EFFECTS.bloom.intensity);
        gl.uniform1f(scanlineFreqLocation, EFFECTS.scanlines.frequency);
        gl.uniform1f(scanlineIntensityLocation, EFFECTS.scanlines.intensity);
        gl.uniform1f(flickerSpeedLocation, flickerData.speed);
        gl.uniform1f(flickerAmountLocation, flickerData.amount);
        gl.uniform1f(barrelDistortionLocation, EFFECTS.crt.barrelDistortion);
        gl.uniform1f(overscanLocation, EFFECTS.crt.overscan);
        gl.uniform1f(flickerActiveLocation, flickerData.active);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    requestAnimationFrame(render);
}

// Initial capture and start render loop
renderContentToCanvas().then(() => {
    requestAnimationFrame(render);
});