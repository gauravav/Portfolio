// lightTheme.js
const LightTheme = {
    activate: function(body, themeIcon, themeToggle) {
        console.log("Activating Light Theme");
        // Remove dark theme class
        body.classList.remove('dark-theme');

        // Set icon and ARIA attributes
        if (themeIcon) themeIcon.className = 'fas fa-sun';
        if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to Dark Theme');

        // No weather cleanup needed
    }
};