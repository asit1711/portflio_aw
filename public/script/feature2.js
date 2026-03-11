// ===================================================================================
// ========================== CLICK SOUNDS (REWRITTEN) ===============================
// ===================================================================================

function setupClickSounds() {
    let audioContext;
    const oscillatorType = 'triangle';

    // A single, shared function to initialize the AudioContext.
    function initAudioContext() {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log("Web Audio API context initialized.");
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.", e);
            }
        }
    }

    // Initialize once on the very first user interaction.
    document.body.addEventListener('mousedown', initAudioContext, { once: true });
    document.body.addEventListener('touchstart', initAudioContext, { once: true });
    document.body.addEventListener('keydown', initAudioContext, { once: true });

    // A single, shared function to play the sound.
    function playClickSound() {
        if (!audioContext) return;
        if (audioContext.state === 'suspended') audioContext.resume();

        const currentTime = audioContext.currentTime;
        const gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.6, currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + 0.15);

        const oscillator = audioContext.createOscillator();
        oscillator.connect(gainNode);
        oscillator.type = oscillatorType;
        oscillator.frequency.setValueAtTime(880, currentTime);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.15);
    }

    // =================================================================
    // NEW & IMPROVED: EVENT DELEGATION
    // We attach ONE listener to the whole document.
    // =================================================================
    document.addEventListener('click', (e) => {
        // Check if the clicked element (or its parent) is interactive.
        const target = e.target.closest(
            'a, button, [role="button"], input[type="submit"], .social-icon, .theme-toggle-btn'
        );

        // If it's not an interactive element we care about, do nothing.
        if (!target) return;

        // If we found an interactive element, play the sound.
        playClickSound();

        // Handle external links with a small delay for the sound to play.
        const isExternalLink = target.tagName === 'A' && target.getAttribute('target') === '_blank';
        if (isExternalLink) {
            e.preventDefault();
            setTimeout(() => {
                window.open(target.href, '_blank', 'noopener,noreferrer');
            }, 150);
        }
    });

    console.log("Click sound system initialized using event delegation.");
}
