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

    // Touch tilt: map touch position to same rotation
    const onTouchMoveTilt = (e) => {
        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];
        const { clientX, clientY } = touch;
        const { innerWidth, innerHeight } = window;

        const xPos = (clientX / innerWidth) - 0.5;
        const yPos = (clientY / innerHeight) - 0.5;

        const rotateX = yPos * 8;
        const rotateY = xPos * -8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const onTouchEndTilt = () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };

    document.addEventListener('touchmove', onTouchMoveTilt, { passive: true });
    document.addEventListener('touchend', onTouchEndTilt, { passive: true });
}

// Background parallax effect
function initBackgroundParallax() {
    // Store the last mouse position globally
    let lastMouseX = window.innerWidth / 2;
    let lastMouseY = window.innerHeight / 2;

    const updateBackground = (clientX, clientY) => {
        const { innerWidth, innerHeight } = window;
        // Calculate mouse/touch position as percentage (0 to 1)
        const xPercent = clientX / innerWidth;
        const yPercent = clientY / innerHeight;
        // Calculate background position offset (subtle movement)
        const xOffset = (xPercent - 0.5) * 20; // Max ~20px movement
        const yOffset = (yPercent - 0.5) * 20; // Max ~20px movement
        // Apply to all body elements with background
        const bodies = document.querySelectorAll('body.index, body.projects, body.error');
        bodies.forEach(body => {
            body.style.backgroundPosition = `calc(50% + ${xOffset}px) calc(50% + ${yOffset}px)`;
        });
    };

    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        // Store current position
        lastMouseX = clientX;
        lastMouseY = clientY;
        updateBackground(clientX, clientY);
    });

    // Touch parallax: ignore touches that start inside the scrollable card
    const card = document.getElementById('card');
    let touchStartedInsideCard = false;

    document.addEventListener('touchstart', (e) => {
        if (!card || !e.touches || e.touches.length === 0) return;
        const t = e.touches[0];
        const target = document.elementFromPoint(t.clientX, t.clientY);
        touchStartedInsideCard = !!(target && card.contains(target));
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!e.touches || e.touches.length === 0) return;
        const t = e.touches[0];
        if (touchStartedInsideCard) {
            // Let the card scroll; do not move background
            return;
        }
        updateBackground(t.clientX, t.clientY);
    }, { passive: true });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCardRotation();
    initBackgroundParallax();
    initIntroRunner();
    initSyntaxHighlight();
});

function initIntroRunner() {
    const runBtn = document.getElementById('run-intro');
    const terminal = document.getElementById('intro-terminal');
    const typedEl = document.querySelector('#intro-terminal .typed');
    const cursorEl = document.querySelector('#intro-terminal .cursor');
    if (!runBtn || !terminal || !typedEl || !cursorEl) return;

    const message = "hi, i'm joe, a software developer and project designer! i'm experienced with AI, web/mobile/desktop development and game development. when i'm not doing that, i love camping, skateboarding and drumming.";

    runBtn.addEventListener('click', () => {
        // reset state
        typedEl.textContent = '';
        terminal.style.display = 'block';
        cursorEl.style.visibility = 'visible';

        typewrite(typedEl, message, 18, () => {
            // Keep cursor visible and positioned at end
            cursorEl.style.visibility = 'visible';
        });
    });
}

function typewrite(targetEl, text, speedMs, onDone) {
    let i = 0;
    const interval = setInterval(() => {
        targetEl.textContent += text.charAt(i);
        i += 1;
        if (i >= text.length) {
            clearInterval(interval);
            if (typeof onDone === 'function') onDone();
        }
    }, speedMs);
}

// Lightweight Python-like syntax highlighting for the intro code block
function initSyntaxHighlight() {
    const codeEl = document.querySelector('#intro-code pre code');
    if (!codeEl) return;

    let raw = codeEl.textContent;
    codeEl.innerHTML = highlightPythonLike(raw);
}

function highlightPythonLike(source) {
    const escaped = escapeHtml(source);

    // Protect strings first
    const stringPattern = /(["'])(?:\\.|(?!\1).)*\1/g;
    const strings = [];
    let protectedText = escaped.replace(stringPattern, (m) => {
        const idx = strings.length;
        strings.push(m);
        return `__STR_${idx}__`;
    });

    // Numbers
    protectedText = protectedText.replace(/\b\d+(?:\.\d+)?\b/g, '<span class="token number">$&</span>');

    // Keywords
    const keywords = [
        'def', 'class', 'if', 'else', 'elif', 'for', 'while', 'in', 'return', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'pass', 'break', 'continue', 'and', 'or', 'not', 'is', 'lambda', 'True', 'False', 'None', 'print'
    ];
    const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    protectedText = protectedText.replace(kwRegex, '<span class="token keyword">$1</span>');

    // Builtins
    const builtins = ['len', 'range', 'str', 'int', 'float', 'bool', 'ord', 'chr'];
    const biRegex = new RegExp(`\\b(${builtins.join('|')})\\b`, 'g');
    protectedText = protectedText.replace(biRegex, '<span class="token builtin">$1</span>');

    // Function calls: name(
    protectedText = protectedText.replace(/\b([a-zA-Z_][\w]*)\s*(?=\()/g, '<span class="token function">$1</span>');

    // Comments (# ... end of line)
    protectedText = protectedText.replace(/#.*$/gm, (m) => `<span class="token comment">${m}</span>`);

    // Restore strings
    protectedText = protectedText.replace(/__STR_(\d+)__/g, (m, i) => `<span class="token string">${strings[Number(i)]}</span>`);

    return protectedText;
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
