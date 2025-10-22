/* Rocker Power Switch */
(function () {
    const rockerBezel = document.getElementById('rockerBezel');
    const rocker = document.getElementById('rocker');

    let isOn = false;

    // Web Audio API click
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function playClick() {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, audioContext.currentTime);
        gain.gain.setValueAtTime(0.35, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 0.12);
    }

    function toggle() {
        isOn = !isOn;
        rocker.classList.toggle('on', isOn);
        playClick();
        if (navigator.vibrate) navigator.vibrate(25);
    }

    function handleActivate(e) {
        if (audioContext.state === 'suspended') audioContext.resume();
        e.preventDefault();
        toggle();
    }

    rockerBezel.addEventListener('click', handleActivate);
    rockerBezel.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            handleActivate(e);
        }
    });
})();