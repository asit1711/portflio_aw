
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
            });
        } else {
            snackbarMessage.textContent = `👋 Welcome back, ${name}!`;
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
                setTimeout(hideSnackbar, 4000);
            }, 500); // show thanks message after bubble closes
        }
    });

    // Close bubble if 'x' is clicked
    greetingCloseBtn.addEventListener('click', () => {
        // Don't save name, but mark as visited to not ask again
        localStorage.setItem(VISITED_BEFORE_KEY, 'true');
        hideGreetingBubble();
    });

    snackbarClose.addEventListener('click', hideSnackbar);

    checkVisitor();
    console.log("Interactive features (greeting bubble) initialized.");
});
