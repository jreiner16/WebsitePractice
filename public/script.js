// 3D card rotation effect
function initCardRotation() {
    const card = document.getElementById('card');

    if (!card) return;

    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xPos = (clientX / innerWidth) - 0.5;
        const yPos = (clientY / innerHeight) - 0.5;

        const rotateX = yPos * 8;
        const rotateY = xPos * -8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    document.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
}

// Background parallax effect
function initBackgroundParallax() {
    // Store the last mouse position globally
    let lastMouseX = window.innerWidth / 2;
    let lastMouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        // Store current position
        lastMouseX = clientX;
        lastMouseY = clientY;

        // Calculate mouse position as percentage (0 to 1)
        const xPercent = clientX / innerWidth;
        const yPercent = clientY / innerHeight;

        // Calculate background position offset (subtle movement)
        const xOffset = (xPercent - 0.5) * 20; // Max 20px movement
        const yOffset = (yPercent - 0.5) * 20; // Max 20px movement

        // Apply to all body elements with background
        const bodies = document.querySelectorAll('body.index, body.projects, body.error');
        bodies.forEach(body => {
            body.style.backgroundPosition = `calc(50% + ${xOffset}px) calc(50% + ${yOffset}px)`;
        });
    });

    // Don't reset background position when mouse leaves
    // This maintains the position when navigating between pages
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCardRotation();
    initBackgroundParallax();
});
