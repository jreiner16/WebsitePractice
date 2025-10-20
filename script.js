// Windshield-style rain engine with surface droplets and lens/refraction
class WindshieldRain {
    constructor() {
        this.canvas = document.getElementById('rainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.timeElement = document.getElementById('time');

        // Offscreen background buffer to match CSS cover sizing for refraction
        this.bgCanvas = document.createElement('canvas');
        this.bgCtx = this.bgCanvas.getContext('2d');
        this.bgImage = null;
        this.bgReady = false;

        // Simulation state
        this.droplets = [];
        this.gridCellSize = 48;
        this.maxDroplets = 1200;
        this.spawnAccumulator = 0;

        // Tilt (unit-ish vector); updated from device orientation if available
        this.tiltX = 0.15; // slight rightwards slide
        this.tiltY = 1.0;  // downward gravity along glass

        // Wind (minor perturbation)
        this.windX = 0;

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.loadBackgroundFromCss();
        this.updateTime();
        this.startTimeLoop();
        this.startWindSimulation();
        this.attachOrientation();
        this.loop();

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.redrawBackgroundBuffer();
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.bgCanvas.width = this.canvas.width;
        this.bgCanvas.height = this.canvas.height;
    }

    loadBackgroundFromCss() {
        const bgEl = document.querySelector('.background-image');
        if (!bgEl) return;
        const style = window.getComputedStyle(bgEl);
        const bg = style.backgroundImage;
        const match = bg && bg.match(/url\(["']?(.*?)["']?\)/);
        if (!match || !match[1]) return;

        const url = match[1];
        const img = new Image();
        // Attempt CORS-safe draw (Unsplash typically sets CORS headers)
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            this.bgImage = img;
            this.bgReady = true;
            this.redrawBackgroundBuffer();
        };
        img.onerror = () => {
            // Fallback: not ready, but we can still render droplets without refraction
            this.bgReady = false;
        };
        img.src = url;
    }

    redrawBackgroundBuffer() {
        if (!this.bgReady || !this.bgImage) return;
        const cw = this.bgCanvas.width;
        const ch = this.bgCanvas.height;
        const iw = this.bgImage.naturalWidth || this.bgImage.width;
        const ih = this.bgImage.naturalHeight || this.bgImage.height;

        // Emulate CSS background-size: cover with center positioning
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;

        this.bgCtx.clearRect(0, 0, cw, ch);
        this.bgCtx.drawImage(this.bgImage, dx, dy, dw, dh);
    }

    startTimeLoop() {
        setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    updateTime() {
        if (!this.timeElement) return;
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.timeElement.textContent = timeString;
    }

    attachOrientation() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                const gamma = (e.gamma || 0); // left-right tilt
                const beta = (e.beta || 0);   // front-back tilt
                // Map tilt to a vector; keep normalized-ish and smooth
                const targetX = Math.max(-1, Math.min(1, gamma / 45));
                const targetY = Math.max(0.2, Math.min(1.4, 0.8 + (beta / 90) * 0.6));
                // Light smoothing
                this.tiltX = this.tiltX * 0.9 + targetX * 0.1;
                this.tiltY = this.tiltY * 0.9 + targetY * 0.1;
            });
        }
    }

    startWindSimulation() {
        setInterval(() => {
            this.windX += (Math.random() - 0.5) * 0.05;
            this.windX = Math.max(-0.25, Math.min(0.25, this.windX));
        }, 700);
    }

    spawnDroplets(dt) {
        // Dense spawn concentrated near top; accumulate fractional spawns for stability
        const width = this.canvas.width;
        const baseRatePerPx = 0.0018; // tune density
        this.spawnAccumulator += width * baseRatePerPx * (dt * 60); // normalize to ~60fps

        while (this.spawnAccumulator >= 1 && this.droplets.length < this.maxDroplets) {
            this.spawnAccumulator -= 1;
            const r = Math.random() * 2.2 + 1.1; // radius 1.1 - 3.3
            const x = Math.random() * width;
            const y = Math.random() * (this.canvas.height * 0.25); // top quarter
            this.droplets.push({
                x, y, r,
                vx: (Math.random() - 0.5) * 0.05,
                vy: 0,
                alive: true
            });
        }
    }

    rebuildSpatialGrid() {
        this.grid = new Map();
        const cell = this.gridCellSize;
        for (let i = 0; i < this.droplets.length; i++) {
            const d = this.droplets[i];
            if (!d.alive) continue;
            const cx = Math.floor(d.x / cell);
            const cy = Math.floor(d.y / cell);
            for (let oy = -1; oy <= 1; oy++) {
                for (let ox = -1; ox <= 1; ox++) {
                    const key = `${cx + ox},${cy + oy}`;
                    if (!this.grid.has(key)) this.grid.set(key, []);
                    this.grid.get(key).push(i);
                }
            }
        }
    }

    mergeDroplets() {
        const toRemove = new Set();
        const cell = this.gridCellSize;

        for (let i = 0; i < this.droplets.length; i++) {
            const a = this.droplets[i];
            if (!a.alive || toRemove.has(i)) continue;

            const cx = Math.floor(a.x / cell);
            const cy = Math.floor(a.y / cell);

            for (let oy = -1; oy <= 1; oy++) {
                for (let ox = -1; ox <= 1; ox++) {
                    const key = `${cx + ox},${cy + oy}`;
                    const indices = this.grid.get(key);
                    if (!indices) continue;
                    for (const j of indices) {
                        if (j === i || toRemove.has(j)) continue;
                        const b = this.droplets[j];
                        if (!b.alive) continue;
                        const dx = b.x - a.x;
                        const dy = b.y - a.y;
                        const dist = Math.hypot(dx, dy);
                        const overlap = a.r + b.r - dist;
                        if (overlap > Math.min(a.r, b.r) * 0.45) {
                            // Merge b into a (area conservation)
                            const areaA = a.r * a.r;
                            const areaB = b.r * b.r;
                            const totalArea = areaA + areaB;
                            a.x = (a.x * areaA + b.x * areaB) / totalArea;
                            a.y = (a.y * areaA + b.y * areaB) / totalArea;
                            a.vx = (a.vx * areaA + b.vx * areaB) / totalArea;
                            a.vy = (a.vy * areaA + b.vy * areaB) / totalArea;
                            a.r = Math.sqrt(totalArea);
                            b.alive = false;
                            toRemove.add(j);
                        }
                    }
                }
            }
        }

        if (toRemove.size > 0) {
            this.droplets = this.droplets.filter((d, idx) => d.alive && !toRemove.has(idx));
        }
    }

    updatePhysics(dt) {
        const width = this.canvas.width;
        const height = this.canvas.height;

        const baseGX = this.tiltX * 0.06; // lateral component
        const baseGY = this.tiltY * 0.12; // primary down-glass gravity

        for (let i = 0; i < this.droplets.length; i++) {
            const d = this.droplets[i];
            if (!d.alive) continue;

            // Stickiness (static friction) stronger for small droplets
            const adhesion = 0.065 / Math.max(1.0, d.r);
            const trialVx = d.vx + baseGX + this.windX * 0.02;
            const trialVy = d.vy + baseGY;
            const trialSpeed = Math.hypot(trialVx, trialVy);

            if (trialSpeed < adhesion) {
                // Not enough force to overcome adhesion; slowly relax
                d.vx *= 0.9;
                d.vy *= 0.9;
            } else {
                // Slide with damping; larger drops slide more easily
                const damping = 0.985 - Math.min(0.02, d.r * 0.0015);
                d.vx = d.vx * damping + baseGX + this.windX * 0.02;
                d.vy = d.vy * damping + baseGY;
            }

            // Minor surface micro-jitter to avoid perfect uniformity
            d.vx += (Math.random() - 0.5) * 0.005;
            d.vy += (Math.random() - 0.5) * 0.003;

            // Integrate
            d.x += d.vx * (dt * 60);
            d.y += d.vy * (dt * 60);

            // Bounds: keep on screen; if too large and goes off, recycle
            if (d.x < -d.r || d.x > width + d.r || d.y > height + d.r) {
                d.alive = false;
            } else {
                // Prevent partial clipping at top
                if (d.y < d.r) d.y = d.r;
            }
        }

        // Remove dead droplets
        if (this.droplets.length > this.maxDroplets) {
            this.droplets.splice(0, this.droplets.length - this.maxDroplets);
        }
        this.droplets = this.droplets.filter(d => d.alive);
    }

    drawDropletLens(d) {
        if (!this.bgReady) {
            // Fallback: simple glossy circle
            this.ctx.beginPath();
            this.ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
            this.ctx.fill();
            return;
        }

        const mag = 1.05 + Math.min(0.08, d.r * 0.01); // magnification factor
        const shiftX = d.vx * 6; // refractive offset along motion
        const shiftY = d.vy * 6;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        this.ctx.clip();

        // Lens transform: scale around droplet center and offset slightly
        this.ctx.translate(d.x + shiftX, d.y + shiftY);
        this.ctx.scale(mag, mag);
        this.ctx.translate(-d.x, -d.y);

        // Draw the background buffer into the clipped region
        this.ctx.drawImage(this.bgCanvas, 0, 0);

        this.ctx.restore();

        // Edge and highlight for realism
        // Soft edge darkening
        const edgeGrad = this.ctx.createRadialGradient(d.x, d.y, d.r * 0.6, d.x, d.y, d.r);
        edgeGrad.addColorStop(0, 'rgba(0,0,0,0)');
        edgeGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
        this.ctx.fillStyle = edgeGrad;
        this.ctx.beginPath();
        this.ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        this.ctx.fill();

        // Specular highlight
        this.ctx.beginPath();
        this.ctx.ellipse(d.x - d.r * 0.35, d.y - d.r * 0.35, d.r * 0.25, d.r * 0.18, -0.6, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255,255,255,0.25)';
        this.ctx.fill();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw droplets (sorted by radius for nicer layering)
        const list = this.droplets.slice().sort((a, b) => a.r - b.r);
        for (let i = 0; i < list.length; i++) {
            this.drawDropletLens(list[i]);
        }
    }

    loop() {
        let last = performance.now();
        const frame = (now) => {
            const dt = Math.min(0.05, (now - last) / 1000); // clamp dt
            last = now;

            // Spawn, simulate, merge, and render
            this.spawnDroplets(dt);
            this.updatePhysics(dt);
            this.rebuildSpatialGrid();
            this.mergeDroplets();
            this.render();

            requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    new WindshieldRain();
});