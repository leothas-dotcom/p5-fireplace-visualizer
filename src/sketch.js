// ...existing code...

let particles = [];
let airflow;
let emitAccumulator = 0; // particles to emit accumulator
const EMIT_RATE = 240; // slower emission for better FPS and slower fire
const MAX_PARTICLES = 6000;

// GPU mode toggle
let useGPU = true;
let gpuCount = 25000; // B) Moderate: 25k particles
let gpuPositions = null;

// stars for background
let stars = [];
const STAR_COUNT = 120;

function setup() {
    const container = document.getElementById('canvas-container') || document.body;
    let c = createCanvas(windowWidth, windowHeight);
    c.parent('canvas-container');
    colorMode(RGB, 255);
    noStroke();

    airflow = new Airflow();

    // generate stars
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: random(width),
            y: random(height * 0.55),
            base: random(80, 200),
            phase: random(TAU),
            scale: random(0.6, 1.6)
        });
    }

    if (useGPU && window.GPUManager) {
        const ok = window.GPUManager.init(gpuCount, width, height);
        if (!ok) {
            console.warn('GPUManager failed to initialize — falling back to CPU rendering');
            useGPU = false;
        }
    }
}

function draw() {
    // Cozy vertical gradient background
    drawCozyBackground();
    drawStars();
    drawLandscape();

    // Emit particles based on real time
    emitAccumulator += EMIT_RATE * (deltaTime / 1000);
    while (emitAccumulator >= 1) {
    emitParticle();
        emitAccumulator -= 1;
    }

    // Update and display particles
    // Use additive blending for hotter glow
    blendMode(ADD);
    if (useGPU && window.GPUManager) {
        // run GPU step and accept either a nested array ([count][2]) or a flat typed array
        try {
            const out = window.GPUManager.step(deltaTime);
            // normalize to an interleaved Float32Array [x,y,x,y,...]
            if (out) {
                if (Array.isArray(out) && Array.isArray(out[0])) {
                    // convert nested array to Float32Array
                    gpuPositions = new Float32Array(gpuCount * 2);
                    for (let i = 0; i < Math.min(gpuCount, out.length); i++) {
                        gpuPositions[i * 2] = Number(out[i][0]) || 0;
                        gpuPositions[i * 2 + 1] = Number(out[i][1]) || 0;
                    }
                } else if (out instanceof Float32Array || (Array.isArray(out) && out.length >= gpuCount * 2)) {
                    // already interleaved (or plain array) - use as-is
                    gpuPositions = out;
                } else {
                    gpuPositions = null;
                }
            } else {
                gpuPositions = null;
            }
        } catch (e) {
            // if kernel fails, null out positions so CPU path remains visible
            console.warn('GPUManager.step failed:', e);
            gpuPositions = null;
        }

        // draw positions quickly if we have valid data
        if (gpuPositions && gpuPositions.length >= gpuCount * 2) {
            // draw positions in a single batched shape using POINTS
            push();
            stroke(255, 160, 60, 140);
            strokeWeight(1.2);
            noFill();
            beginShape(POINTS);
            for (let i = 0; i < gpuCount; i++) {
                const x = gpuPositions[i * 2];
                const y = gpuPositions[i * 2 + 1];
                if (!isFinite(x) || !isFinite(y)) continue;
                vertex(x, y);
            }
            endShape();
            pop();
        } else {
            // draw a simple debug anchor so user sees something when GPU data isn't available
            noStroke();
            fill(255, 100, 0, 180);
            ellipse(width * 0.5, height - 60, 6, 6);
        }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        // apply airflow force
        let f = airflow.getForce(p.position.x, p.position.y);
        p.applyForce(f);
        p.update();
        p.display();
        if (p.isDead()) particles.splice(i, 1);
    }
    blendMode(BLEND);

    // enforce a hard cap to avoid runaway memory/cpu
    if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
    }

    // optional: debug airflow
    // airflow.render();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function emitParticle() {
    // Emit from a loose source near bottom-center
    const x = width * 0.5 + random(-30, 30);
    const y = height - 40 + random(-10, 10);
    // emit a small cluster of fine flame particles
    const cluster = floor(random(2, 6));
    for (let i = 0; i < cluster; i++) {
        particles.push(new Particle(x + random(-8, 8), y + random(-6, 4), { kind: 'flame' }));
    }
    // occasional ember / spark
    if (random() < 0.12) {
        particles.push(new Particle(x + random(-12, 12), y + random(-6, 4), { kind: 'ember' }));
    }
    // rare core/glow particle to act like source
    if (random() < 0.02) {
        particles.push(new Particle(x + random(-6, 6), y + random(-2, 2), { kind: 'core' }));
    }
}

function drawStars() {
    push();
    for (let s of stars) {
        let a = s.base + sin((millis() * 0.002) + s.phase) * 40;
        fill(255, 240, 220, constrain(a, 20, 255));
        ellipse(s.x, s.y, s.scale * 2, s.scale * 2);
    }
    pop();
}

function drawLandscape() {
    // simple distant sea and silhouette
    push();
    // sea gradient rectangle near bottom
    for (let y = height * 0.6; y < height; y += 6) {
        let t = map(y, height * 0.6, height, 0, 1);
        let r = lerp(25, 8, t);
        let g = lerp(40, 12, t);
        let b = lerp(55, 18, t);
        fill(r, g, b);
        rect(0, y, width, 6);
    }

    // silhouette hills
    fill(8, 6, 10, 220);
    beginShape();
    vertex(0, height * 0.62);
    vertex(width * 0.12, height * 0.54);
    vertex(width * 0.28, height * 0.62);
    vertex(width * 0.44, height * 0.50);
    vertex(width * 0.60, height * 0.62);
    vertex(width * 0.76, height * 0.55);
    vertex(width * 0.92, height * 0.62);
    vertex(width, height * 0.58);
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);
    pop();
}

function drawCozyBackground() {
    // simple vertical gradient from very dark to warm dark
    for (let y = 0; y < height; y += 4) {
        let t = y / height;
        // darker at top, warm near bottom
        let r = lerp(12, 35, t);
        let g = lerp(14, 18, t);
        let b = lerp(25, 20, t);
        fill(r, g, b);
        rect(0, y, width, 4);
    }
}
