// script/feature3.js - Text-to-Speech Feature

document.addEventListener('DOMContentLoaded', () => {
    const USER_NAME_KEY = 'portfolioVisitorName';
    const VISITED_BEFORE_KEY = 'hasVisitedPortfolioBefore';

    const greetingBubble = document.getElementById('greeting-bubble');
    const form = document.getElementById('greeting-form');
    const nameInput = document.getElementById('greeting-input');
    const greetingCloseBtn = document.getElementById('greeting-close');

    const snackbar = document.getElementById('snackbar');
    const snackbarMessage = document.getElementById('snackbar-message');
    const snackbarClose = document.getElementById('snackbar-close');

    if (!greetingBubble || !snackbar) {
        console.warn("Greeting feature elements not found. Skipping.");
        return;
    }

    const checkVisitor = () => {
        const name = localStorage.getItem(USER_NAME_KEY);
        const hasVisited = localStorage.getItem(VISITED_BEFORE_KEY);

        if (name) {
            // Returning user with a name
            setTimeout(() => showWelcomeBackSnackbar(name), 1500);
        } else if (hasVisited) {
            // Returning user who didn't give a name
            // Do nothing, respect their choice.
        } else {
            // First time visitor, show the new greeting bubble after a delay.
            setTimeout(showGreetingBubble, 2500);
        }
    };

    const showGreetingBubble = () => {
        greetingBubble.classList.add('visible');
        greetingBubble.setAttribute('aria-hidden', 'false');
        nameInput.focus();
    };

    const hideGreetingBubble = () => {
        greetingBubble.classList.remove('visible');
        greetingBubble.setAttribute('aria-hidden', 'true');
    };

    const showWelcomeBackSnackbar = (name) => {
        // Use Typed.js for the greeting animation
        if (typeof Typed === 'function') {
            new Typed(snackbarMessage, {
                strings: [`👋 Welcome back, ${name}!`],
                typeSpeed: 40,
                showCursor: false,
                onComplete: function() {
                    // Text-to-speech after typing animation completes
                    speakText(`Welcome back, ${name}`);
                }
            });
        } else {
            snackbarMessage.textContent = `👋 Welcome back, ${name}!`;
            // Text-to-speech immediately if Typed.js is not available
            speakText(`Welcome back, ${name}`);
        }

        snackbar.classList.add('visible');

        // Automatically hide after 5 seconds
        setTimeout(() => {
            hideSnackbar();
        }, 5000);
    };

    const hideSnackbar = () => {
        snackbar.classList.remove('visible');
    };

    // Text-to-speech function
    function speakText(text) {
        // Check if browser supports speech synthesis
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9; // Slightly slower for better clarity
            utterance.pitch = 1;
            utterance.volume = 0.9;
            
            // Try to use a pleasant voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.name.includes('Google') || 
                voice.name.includes('Daniel')
            );
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            window.speechSynthesis.speak(utterance);
        } else {
            console.log("Speech synthesis not supported in this browser.");
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        if (name) {
            localStorage.setItem(USER_NAME_KEY, name);
            localStorage.setItem(VISITED_BEFORE_KEY, 'true');
            hideGreetingBubble();
            setTimeout(() => {
                snackbarMessage.textContent = `🎉 Thanks, ${name}! Enjoy your visit.`;
                snackbar.classList.add('visible');
                // Text-to-speech for thank you message
                speakText(`Thanks, ${name}! Enjoy your visit.`);
                setTimeout(hideSnackbar, 4000);
            }, 500);
        }
    });

    greetingCloseBtn.addEventListener('click', () => {
        localStorage.setItem(VISITED_BEFORE_KEY, 'true');
        hideGreetingBubble();
    });

    snackbarClose.addEventListener('click', hideSnackbar);

    checkVisitor();
    console.log("Text-to-speech feature initialized.");
});