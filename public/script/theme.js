const themeToggleBtn = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
    const toggleIcon = themeToggleBtn?.querySelector('i');

    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        if (toggleIcon) {
            toggleIcon.classList.remove('fa-sun');
            toggleIcon.classList.add('fa-moon');
        }
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        if (toggleIcon) {
            toggleIcon.classList.remove('fa-moon');
            toggleIcon.classList.add('fa-sun');
        }
    }


    if (typeof window.updateParticleColors === 'function') {
        window.updateParticleColors();
    }
}

function initializeTheme() {
    if (!themeToggleBtn) {
        console.warn("Theme toggle button not found.");
        // Apply theme even if button is not found, based on preference/storage
        const storedTheme = localStorage.getItem('theme');
        const initialTheme = storedTheme ? storedTheme : (prefersDarkScheme.matches ? 'dark' : 'light');
        applyTheme(initialTheme);
        return;
    }

    const currentTheme = localStorage.getItem('theme');
    applyTheme(currentTheme ? currentTheme : (prefersDarkScheme.matches ? 'dark' : 'light'));

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = document.documentElement.hasAttribute('data-theme') ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    prefersDarkScheme.addEventListener('change', (e) => {
        // Only change if no theme is explicitly set by the user via localStorage
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}

initializeTheme();
