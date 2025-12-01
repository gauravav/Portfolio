// main.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Element References (Core UI) ---
    const gridContainer = document.getElementById('grid-container');
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.portfolio-section');
    const themeToggle = document.getElementById('theme-toggle'); // Light/Dark toggle button
    const themeIcon = themeToggle?.querySelector('i'); // Icon for Light/Dark button
    const body = document.body;

    // --- State Variables ---
    let currentTheme = 'light'; // Overall theme state: 'light' or 'dark'

    // --- Grid Animation Scope Variables & Functions ---
    let gridAnimation_dots = [];
    let gridAnimation_lines = [];
    let gridAnimation_animationFrameId = null;
    let gridAnimation_updateNodePositions = null;
    let gridAnimation_drawLines = null;
    let gridAnimation_animate = null;

    if (gridContainer) {
        console.log("Grid container found:", gridContainer); // DEBUG
        const maxSpeed = 0.3; const mouseConnectionRadius = 150; const nodeConnectionRadius = 100; const nodeLineOpacity = 0.4;
        let mouseX = -mouseConnectionRadius * 2; let mouseY = -mouseConnectionRadius * 2;
        let containerWidth = gridContainer.offsetWidth; let containerHeight = gridContainer.offsetHeight;
        function calculateNumDots(width) { if (width < 768) return 35; else if (width < 1024) return 60; else return 80; }
        function getRandomLetter() { return String.fromCharCode(Math.floor(Math.random() * 26) + 65); }

        // Function to create a single letter node (extracted for reusability)
        function createSingleLetterNode(xPos, yPos, initialVx, initialVy) {
            console.log(`Inside createSingleLetterNode: x=${xPos}, y=${yPos}`); // DEBUG
            const dotElement = document.createElement('div');
            dotElement.classList.add('grid-dot');
            dotElement.textContent = getRandomLetter();
             console.log('Created dot element:', dotElement); // DEBUG

            const dot = {
                element: dotElement,
                x: xPos,
                y: yPos,
                vx: initialVx !== undefined ? initialVx : (Math.random() - 0.5) * 2 * maxSpeed,
                vy: initialVy !== undefined ? initialVy : (Math.random() - 0.5) * 2 * maxSpeed
            };
            dot.element.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
            console.log('Appending dot element to grid container...'); // DEBUG
            gridContainer.appendChild(dot.element);
            console.log('Pushing dot object to array...'); // DEBUG
            gridAnimation_dots.push(dot);
             console.log('Dot creation complete. Current dot count:', gridAnimation_dots.length); // DEBUG
            return dot; // Return the created dot if needed
        }


        function createLetterNodes() {
            const currentNumDots = calculateNumDots(containerWidth);
            gridAnimation_dots.length = 0; // Clear existing dots array
            gridContainer.innerHTML = ''; // Clear existing dot elements and lines
            gridAnimation_lines.length = 0; // Clear lines array
            console.log(`Creating initial ${currentNumDots} dots.`); // DEBUG

            for (let i = 0; i < currentNumDots; i++) {
                createSingleLetterNode(
                    Math.random() * containerWidth,
                    Math.random() * containerHeight
                );
            }
        }

        gridAnimation_updateNodePositions = () => {
            gridAnimation_dots.forEach(dot => {
                dot.x += dot.vx; dot.y += dot.vy; const buffer = 10;
                if (dot.x < buffer && dot.vx < 0 || dot.x > containerWidth - buffer && dot.vx > 0) { dot.vx *= -1; dot.x = Math.max(buffer, Math.min(dot.x, containerWidth - buffer)); }
                if (dot.y < buffer && dot.vy < 0 || dot.y > containerHeight - buffer && dot.vy > 0) { dot.vy *= -1; dot.y = Math.max(buffer, Math.min(dot.y, containerHeight - buffer)); }
                dot.element.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
            });
        };
        gridAnimation_drawLines = () => {
            gridAnimation_lines.forEach(line => line.remove()); gridAnimation_lines.length = 0;
            for (let i = 0; i < gridAnimation_dots.length; i++) {
                const dotA = gridAnimation_dots[i];
                // Connect node to other nodes
                for (let j = i + 1; j < gridAnimation_dots.length; j++) {
                    const dotB = gridAnimation_dots[j]; const dx = dotB.x - dotA.x, dy = dotB.y - dotA.y; const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < nodeConnectionRadius) {
                        const line = document.createElement('div'); line.classList.add('line'); const angle = Math.atan2(dy, dx);
                        line.style.left = `${dotA.x}px`; line.style.top = `${dotA.y}px`; line.style.width = `${dist}px`; line.style.transform = `rotate(${angle}rad)`; line.style.opacity = (1 - (dist / nodeConnectionRadius)) * nodeLineOpacity; gridContainer.appendChild(line); gridAnimation_lines.push(line);
                    }
                }
                // Connect node to mouse
                const mouseDx = dotA.x - mouseX, mouseDy = dotA.y - mouseY; const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
                if (mouseDist < mouseConnectionRadius) {
                    const line = document.createElement('div'); line.classList.add('line'); const angle = Math.atan2(mouseDy, mouseDx);
                    line.style.left = `${mouseX}px`; line.style.top = `${mouseY}px`; line.style.width = `${mouseDist}px`; line.style.transform = `rotate(${angle}rad)`; line.style.opacity = 1 - (mouseDist / mouseConnectionRadius); gridContainer.appendChild(line); gridAnimation_lines.push(line);
                }
            }
        };
        // Grid animation runs continuously now
        gridAnimation_animate = () => {
            if (typeof gridAnimation_updateNodePositions === 'function') gridAnimation_updateNodePositions();
            if (typeof gridAnimation_drawLines === 'function') gridAnimation_drawLines();
            gridAnimation_animationFrameId = requestAnimationFrame(gridAnimation_animate);
        };
        function updateMousePosition(event) { mouseX = event.clientX; mouseY = event.clientY; }
        window.addEventListener('mousemove', updateMousePosition, { passive: true, capture: true }); window.addEventListener('touchmove', (event) => { if (event.touches.length > 0) updateMousePosition(event.touches[0]); }, { passive: true, capture: true });
        window.addEventListener('mouseleave', () => { mouseX = -mouseConnectionRadius * 2; mouseY = -mouseConnectionRadius * 2; }); window.addEventListener('touchend', () => { mouseX = -mouseConnectionRadius * 2; mouseY = -mouseConnectionRadius * 2; });

        // --- NEW: Add click listener to create a new node ---
        console.log("Adding click listener to grid container."); // DEBUG
        gridContainer.addEventListener('click', (event) => {
             console.log('Grid container clicked!'); // DEBUG

            // Only trigger if the click is directly on the container, not on a child element (like an existing dot)
            if (event.target === gridContainer) {
                 console.log('Click target IS the grid container.'); // DEBUG
                const rect = gridContainer.getBoundingClientRect();
                const clickX = event.clientX - rect.left;
                const clickY = event.clientY - rect.top;
                 console.log(`Calculated click position: x=${clickX}, y=${clickY}`); // DEBUG

                // Check if click is within bounds (optional, but good practice)
                if (clickX >= 0 && clickX <= containerWidth && clickY >= 0 && clickY <= containerHeight) {
                     console.log('Creating single letter node...'); // DEBUG
                    createSingleLetterNode(clickX, clickY); // Create node at click position with random velocity
                } else {
                      console.log('Click was outside calculated bounds.'); // DEBUG
                }
            } else {
                  console.log('Click target was NOT the grid container. Target:', event.target); // DEBUG
            }
        });
        // --- END NEW ---

        let resizeTimeout; window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => {
                const newWidth = gridContainer.offsetWidth; const newHeight = gridContainer.offsetHeight; if (newWidth !== containerWidth || newHeight !== containerHeight) {
                     console.log("Resizing grid animation."); // DEBUG
                    containerWidth = newWidth; containerHeight = newHeight; if (containerWidth > 0 && containerHeight > 0) { if (gridAnimation_animationFrameId) cancelAnimationFrame(gridAnimation_animationFrameId); gridAnimation_animationFrameId = null; createLetterNodes(); gridAnimation_animate(); } else { if (gridAnimation_animationFrameId) cancelAnimationFrame(gridAnimation_animationFrameId); gridAnimation_animationFrameId = null; } // Restart animation on resize
                }
            }, 250);
        });
        function initializeGridAnimation() {
            containerWidth = gridContainer.offsetWidth; containerHeight = gridContainer.offsetHeight;
             console.log(`Initializing grid: width=${containerWidth}, height=${containerHeight}`); // DEBUG
            if (containerWidth > 0 && containerHeight > 0) {
                 createLetterNodes();
                 gridAnimation_animate();
                 console.log("Grid animation started."); // DEBUG
             } else {
                 console.warn("Grid container has no dimensions on init, will retry..."); // DEBUG
                 const initialCheckInterval = setInterval(() => {
                     if (gridContainer.offsetWidth > 0 && gridContainer.offsetHeight > 0) {
                         clearInterval(initialCheckInterval);
                         console.log("Grid container now has dimensions, initializing."); // DEBUG
                         initializeGridAnimation();
                     }
                 }, 100);
                 setTimeout(() => {
                     clearInterval(initialCheckInterval);
                     if (!(gridContainer.offsetWidth > 0 && gridContainer.offsetHeight > 0)) {
                          console.error("Grid container failed to get dimensions after 2s."); // DEBUG
                     }
                 }, 2000);
             }
        }
        initializeGridAnimation(); // Start grid
    } else { console.error("#grid-container not found!"); }

    // --- Side Menu Toggle Logic ---
    function openMenu() { if (sideMenu && menuOverlay && menuToggle) { sideMenu.classList.add('open'); menuOverlay.classList.add('visible'); menuToggle.setAttribute('aria-expanded', 'true'); sideMenu.setAttribute('aria-hidden', 'false'); } }
    function closeMenu() { if (sideMenu && menuOverlay && menuToggle) { sideMenu.classList.remove('open'); menuOverlay.classList.remove('visible'); menuToggle.setAttribute('aria-expanded', 'false'); sideMenu.setAttribute('aria-hidden', 'true'); } }
    if (menuToggle && sideMenu && menuClose && menuOverlay) { menuToggle.addEventListener('click', (e) => { e.stopPropagation(); openMenu(); }); menuClose.addEventListener('click', closeMenu); menuOverlay.addEventListener('click', closeMenu); window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sideMenu?.classList.contains('open')) closeMenu(); }); } else { console.error("Menu toggle/close elements not found."); }

    // --- Tab Switching Logic ---
    if (navLinks.length > 0 && sections.length > 0) { navLinks.forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); const targetId = link.getAttribute('data-target'); const targetSection = document.getElementById(targetId); if (targetSection) { sections.forEach(section => section.classList.remove('active-section')); navLinks.forEach(navLink => navLink.classList.remove('active-link')); targetSection.classList.add('active-section'); link.classList.add('active-link'); if (window.innerWidth <= 768 && sideMenu?.classList.contains('open')) closeMenu(); const mainContent = document.getElementById('main-content'); if (mainContent) mainContent.scrollTop = 0; window.scrollTo({ top: 0, behavior: 'smooth' }); } else { console.warn(`Target section #${targetId} not found.`); } }); }); const initialHash = window.location.hash.substring(1); const initialLink = document.querySelector(`.nav-link[data-target="${initialHash}"]`) || (navLinks.length > 0 ? navLinks[0] : null); if (initialLink) setTimeout(() => initialLink.click(), 0); } else { console.error("Navigation links or portfolio sections not found."); }


    // --- Simplified Theme Management ---
    function applyTheme(theme, options = { isInitialLoad: false }) {
        // console.log(`Applying theme: ${theme}`); // Keep this one minimal unless debugging theme
        body.classList.remove('light-theme', 'dark-theme');
        if(themeIcon) themeIcon.classList.remove('fa-sun', 'fa-moon');
        currentTheme = theme;
        if (!options.isInitialLoad || (options.isInitialLoad && theme !== 'light')) {
             localStorage.setItem('portfolioTheme', theme);
        }
        try {
            if (theme === 'dark') {
                 if (typeof DarkTheme !== 'undefined' && typeof DarkTheme.activate === 'function') { DarkTheme.activate(body, themeIcon, themeToggle); } else { throw new Error("DarkTheme missing"); }
            } else {
                 if (typeof LightTheme !== 'undefined' && typeof LightTheme.activate === 'function') { LightTheme.activate(body, themeIcon, themeToggle); } else { throw new Error("LightTheme missing"); }
                 currentTheme = 'light';
            }
        } catch (error) {
            console.error(`Error applying theme ${theme}:`, error);
             if (typeof LightTheme !== 'undefined' && typeof LightTheme.activate === 'function') { console.warn("Falling back to light theme due to error."); LightTheme.activate(body, themeIcon, themeToggle); currentTheme = 'light'; localStorage.setItem('portfolioTheme', 'light'); } else { console.error("Fallback to light theme failed."); body.classList.remove('dark-theme'); if(themeIcon) themeIcon.className = 'fas fa-sun'; if(themeToggle) themeToggle.setAttribute('aria-label', 'Switch to Dark Theme'); }
        }
        if (themeToggle) { themeToggle.setAttribute('aria-pressed', String(theme === 'dark')); }
    }


    // --- Theme Event Listeners & Initialization ---
    if (themeToggle && themeIcon && body) {
        themeToggle.addEventListener('click', () => { applyTheme((currentTheme === 'dark') ? 'light' : 'dark'); });
        function initializeApp() {
            // console.log("Initializing application..."); // Minimal logging
            const savedTheme = localStorage.getItem('portfolioTheme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            let initialTheme = 'light';
            if (savedTheme === 'dark') { initialTheme = 'dark'; } else if (!savedTheme && prefersDark) { initialTheme = 'dark'; }
            // console.log(`Initializing with theme: ${initialTheme}`); // Minimal logging
            setTimeout(() => { applyTheme(initialTheme, { isInitialLoad: true }); }, 0);
             window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => { if (!localStorage.getItem('portfolioTheme')) { console.log("System theme changed, applying..."); applyTheme(e.matches ? 'dark' : 'light'); } });
            // console.log("Initialization complete."); // Minimal logging
        }
        initializeApp();
    } else { console.error("Core theme control elements (toggle, icon, body) not found."); }

}); // End DOMContentLoaded

// Email function with auto-filled details
function sendEmail(event) {
    event.preventDefault();

    // Show the location permission modal
    const locationModal = document.getElementById('email-location-modal');
    locationModal.classList.add('show');

    // Get modal buttons
    const yesBtn = document.getElementById('email-yes-location');
    const noBtn = document.getElementById('email-no-location');
    const loadingModal = document.getElementById('email-loading-modal');
    const cancelBtn = document.getElementById('email-cancel-location');

    // Remove any existing event listeners by cloning buttons
    const newYesBtn = yesBtn.cloneNode(true);
    const newNoBtn = noBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    noBtn.parentNode.replaceChild(newNoBtn, noBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // Timer and location request variables
    let countdownTimer;
    let locationReceived = false;

    // Handle "Yes, Include Location"
    newYesBtn.addEventListener('click', function() {
        locationModal.classList.remove('show');
        loadingModal.classList.add('show');

        // Get system information
        const systemInfo = getSystemInfo();

        // Reset timer variables
        locationReceived = false;
        let timeLeft = 10;
        const timerDisplay = document.getElementById('email-timer');

        // Start countdown timer
        countdownTimer = setInterval(function() {
            timeLeft--;
            timerDisplay.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(countdownTimer);
                if (!locationReceived) {
                    loadingModal.classList.remove('show');
                    createMailtoLink(systemInfo, 'Location timeout - not received within 10 seconds');
                }
            }
        }, 1000);

        // Request location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                // Success callback
                function(position) {
                    if (!locationReceived) {
                        locationReceived = true;
                        clearInterval(countdownTimer);

                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        const location = `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;

                        loadingModal.classList.remove('show');
                        // Reset timer display for next time
                        timerDisplay.textContent = '10';
                        createMailtoLink(systemInfo, location);
                    }
                },
                // Error callback
                function(error) {
                    if (!locationReceived) {
                        locationReceived = true;
                        clearInterval(countdownTimer);
                        loadingModal.classList.remove('show');
                        // Reset timer display for next time
                        timerDisplay.textContent = '10';
                        createMailtoLink(systemInfo, 'Location permission denied or error occurred');
                    }
                },
                {
                    timeout: 10000,
                    enableHighAccuracy: true
                }
            );
        } else {
            clearInterval(countdownTimer);
            loadingModal.classList.remove('show');
            timerDisplay.textContent = '10';
            createMailtoLink(systemInfo, 'Geolocation not supported');
        }
    });

    // Handle "No, Send Without Location"
    newNoBtn.addEventListener('click', function() {
        locationModal.classList.remove('show');
        const systemInfo = getSystemInfo();
        createMailtoLink(systemInfo, 'Location not included (user preference)');
    });

    // Handle "Changed My Mind" while loading
    newCancelBtn.addEventListener('click', function() {
        locationReceived = true;
        clearInterval(countdownTimer);
        loadingModal.classList.remove('show');
        // Reset timer display for next time
        const timerDisplay = document.getElementById('email-timer');
        timerDisplay.textContent = '10';
        const systemInfo = getSystemInfo();
        createMailtoLink(systemInfo, 'Location not included (user preference)');
    });
}

function getSystemInfo() {
    const now = new Date();
    const dateTime = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });

    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const screenResolution = `${screenWidth}x${screenHeight}`;

    return {
        dateTime,
        userAgent,
        platform,
        language,
        screenResolution
    };
}

function createMailtoLink(systemInfo, location) {
    const email = 'sudo@gauravavula.com';
    const subject = 'Gaurav Avula Portfolio Query';
    const body = `Hello Gaurav,

I am reaching out regarding your portfolio.

---
System Information:
Date & Time: ${systemInfo.dateTime}
Platform: ${systemInfo.platform}
Browser/OS: ${systemInfo.userAgent}
Language: ${systemInfo.language}
Screen Resolution: ${systemInfo.screenResolution}
Location: ${location}
---

[Please write your message here]

Best regards,`;

    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
}