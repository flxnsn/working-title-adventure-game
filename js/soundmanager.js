class SoundManager {
    constructor() {
        this.globalVolume = 0.7;
        this.sounds = new Map();
        this.loopingSound = null;
        this.fadeInterval = null;
    }

    // Set the global volume for all sounds
    setGlobalVolume(volume) {
        this.globalVolume = Math.max(0, Math.min(1, volume));

        // Update volume for all currently playing sounds
        this.sounds.forEach(audio => {
            audio.volume = this.globalVolume;
        });

        // Update looping sound volume if it exists
        if (this.loopingSound) {
            this.loopingSound.volume = this.globalVolume;
        }
    }

    // Play a sound once (allows simultaneous playback)
    playSound(soundUrl, volume = 1.0) {
        const audio = new Audio(soundUrl);
        audio.volume = this.globalVolume * volume;

        // Store reference to manage volume changes
        const soundId = Date.now() + Math.random();
        this.sounds.set(soundId, audio);

        // Clean up when sound ends
        audio.addEventListener('ended', () => {
            this.sounds.delete(soundId);
        });

        // Handle loading errors
        audio.addEventListener('error', (e) => {
            console.warn('Sound failed to load:', soundUrl, e);
            this.sounds.delete(soundId);
        });

        audio.play().catch(e => {
            console.warn('Sound failed to play:', soundUrl, e);
            this.sounds.delete(soundId);
        });

        return soundId;
    }

    // Play a sound with random pitch variation (95%, 100%, or 105%)
    playSoundRandomPitch(soundUrl, volume = 1.0) {
        const audio = new Audio(soundUrl);
        audio.volume = this.globalVolume * volume;

        // Random pitch: 95%, 100%, or 105%
        const pitchOptions = [0.9, 0.95, 1.0, 1.05, 1.1];
        const randomPitch = pitchOptions[Math.floor(Math.random() * pitchOptions.length)];
        audio.playbackRate = randomPitch;
        audio.preservesPitch = false;

        // Store reference to manage volume changes
        const soundId = Date.now() + Math.random();
        this.sounds.set(soundId, audio);

        // Clean up when sound ends
        audio.addEventListener('ended', () => {
            this.sounds.delete(soundId);
        });

        // Handle loading errors
        audio.addEventListener('error', (e) => {
            console.warn('Sound failed to load:', soundUrl, e);
            this.sounds.delete(soundId);
        });

        audio.play().catch(e => {
            console.warn('Sound failed to play:', soundUrl, e);
            this.sounds.delete(soundId);
        });

        return soundId;
    }

    // Start a looping sound
    startLoop(soundUrl, volume = 1.0) {
        // Stop existing loop first
        this.stopLoop();

        this.loopingSound = new Audio(soundUrl);
        this.loopingSound.loop = true;
        this.loopingSound.volume = this.globalVolume * volume;

        this.loopingSound.addEventListener('error', (e) => {
            console.warn('Looping sound failed to load:', soundUrl, e);
            this.loopingSound = null;
        });

        this.loopingSound.play().catch(e => {
            console.warn('Looping sound failed to play:', soundUrl, e);
            this.loopingSound = null;
        });
    }

    // Stop looping sound immediately
    stopLoop() {
        if (this.loopingSound) {
            this.loopingSound.pause();
            this.loopingSound = null;
        }
        this.clearFade();
    }

    // Stop looping sound with fade out
    stopLoopWithFade(fadeDuration = 1000) {
        if (!this.loopingSound) return;

        this.clearFade();

        const startVolume = this.loopingSound.volume;
        const fadeSteps = 50;
        const stepDuration = fadeDuration / fadeSteps;
        const volumeStep = startVolume / fadeSteps;

        let currentStep = 0;

        this.fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = Math.max(0, startVolume - (volumeStep * currentStep));

            if (this.loopingSound) {
                this.loopingSound.volume = newVolume;
            }

            if (currentStep >= fadeSteps || newVolume <= 0) {
                this.stopLoop();
            }
        }, stepDuration);
    }

    // Check if a looping sound is currently playing
    isLooping() {
        return this.loopingSound && !this.loopingSound.paused;
    }

    // Clear any active fade
    clearFade() {
        if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
        }
    }

    // Stop all sounds
    stopAll() {
        // Stop all one-time sounds
        this.sounds.forEach(audio => {
            audio.pause();
        });
        this.sounds.clear();

        // Stop looping sound
        this.stopLoop();
    }
}

/*
// Initialize the sound manager
const soundManager = new SoundManager();

// Set global volume (0.0 to 1.0)
soundManager.setGlobalVolume(0.8);

// Play a one-time sound
soundManager.playSound('path/to/your/sound.mp3');

// Random pitch variation (adds variety)
soundManager.playSoundRandomPitch('coin-pickup.wav');

// Start a looping sound
soundManager.startLoop('path/to/your/loop.mp3');

// Stop looping with fade
soundManager.stopLoopWithFade();
*/