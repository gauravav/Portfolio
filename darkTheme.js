// darkTheme.js
const DarkTheme = {
    activate: function(body, themeIcon, themeToggle) {
        console.log("Activating Dark Theme");
        // Remove light theme class ( belt-and-suspenders, main.js should handle this )
        // body.classList.remove('light-theme'); // No light-theme class exists

        // Add dark theme class
        body.classList.add('dark-theme');

        // Set icon and ARIA attributes
        if (themeIcon) themeIcon.className = 'fas fa-moon';
        if (themeToggle) themeToggle.setAttribute('aria-label', 'Switch to Light Theme');

        // No weather cleanup needed
    }
};