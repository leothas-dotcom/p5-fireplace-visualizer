class Particle {
    constructor(x, y) {
        this.position = createVector(x, y);
        // initial upward velocity with slight horizontal jitter
        this.options = arguments[2] || {};
        this.kind = this.options.kind || 'flame';
        if (this.kind === 'ember') {
            // embers are much smaller and slower now
            this.velocity = createVector(random(-0.06, 0.06), random(-0.2, -0.08));
            this.lifespan = random(1800, 3600);
            this.baseSize = random(0.6, 1.4);
        } else if (this.kind === 'core') {
            // core stays visible but less enormous
            this.velocity = createVector(random(-0.12, 0.12), random(-0.12, -0.28));
            this.lifespan = random(2000, 3200);
            this.baseSize = random(6, 14);
        } else { // flame
            // flame rises much slower than before (scale velocities down)
            this.velocity = createVector(random(-0.18, 0.18), random(-0.1, -0.36));
            this.lifespan = random(1400, 2400); // ms
            this.baseSize = random(1.8, 4.2);
        }
        this.acceleration = createVector(0, 0);
        this.age = 0;
        this.size = this.baseSize;
    }

    applyForce(f) {
        // mass = 1 for simplicity
        this.acceleration.add(f);
    }

    update() {
        // Buoyancy / temperature model: particles have 'heat' that creates upward force
        // hotter particles rise stronger; core particles are hotter
        const heat = this.kind === 'core' ? 1.0 : (this.kind === 'flame' ? 0.7 : 0.45);
        const buoyancy = createVector(0, -heat * 0.0025);
        this.applyForce(buoyancy);

        // gentle drag to keep them from accelerating too much
        const drag = this.velocity.copy().mult(-0.015 * (this.size / 6));
        this.applyForce(drag);

        // Perlin-based lateral flutter proportional to local heat
        const flutter = (noise(this.position.x * 0.01, millis() * 0.0012) - 0.5) * (0.002 + heat * 0.01);
        this.applyForce(createVector(flutter, 0));

        // integrate velocity
        this.velocity.add(this.acceleration);

        // radius-based cohesion (sticky behaviour): sample neighbors within short radius
        if ((this.kind === 'ember' || this.kind === 'flame' || this.kind === 'core') && typeof particles !== 'undefined') {
            let sum = createVector(0,0);
            let count = 0;
            const r = 24; // search radius
            for (let i = 0; i < particles.length; i++) {
                const other = particles[i];
                if (other === this) continue;
                const d = p5.Vector.dist(this.position, other.position);
                if (d > 0 && d < r) {
                    // weight by distance and by kind (cores attract more)
                    const w = (1 - (d / r)) * (other.kind === 'core' ? 1.2 : 1.0);
                    const to = p5.Vector.sub(other.position, this.position).mult(w);
                    sum.add(to);
                    count++;
                }
            }
            if (count > 0) {
                sum.div(count);
                this.velocity.add(sum.mult(0.005 * (heat + 0.6)));
            }
        }

        // cap velocity to keep motion gentle
        this.velocity.x = constrain(this.velocity.x, -1.0, 1.0);
        this.velocity.y = constrain(this.velocity.y, -1.6, 0.5);

        // move
        this.position.add(p5.Vector.mult(this.velocity, deltaTime / 16.666));
        this.acceleration.mult(0);
        this.acceleration.mult(0);

        // age
        this.age += deltaTime;

        // shrink over life
        let lifeT = constrain(this.age / this.lifespan, 0, 1);
        this.size = this.baseSize * (1 - lifeT);
    }

    display() {
        // improved flame rendering: a bright jittering core + tall mid glow + soft outer cone
        let lifeAlpha = map(this.age, 0, this.lifespan, 240, 0);
        // color palette
        let inner = [255, 244, 200];
        let mid = [255, 150, 48];
        let outer = [120, 38, 12];

        // smoother gradient: draw many fine concentric ellipses to simulate a soft glow
        const jitterX = (noise(this.position.x * 0.02, millis() * 0.003) - 0.5) * 1.4;
        const jitterY = (noise(this.position.y * 0.02, millis() * 0.002) - 0.5) * 1.0;
        const coreW = max(0.6, this.size * 0.8);
        const coreH = max(1.0, this.size * 3.0);

        noStroke();
        const steps = 12; // higher steps -> smoother gradient
        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            // smooth falloff (bias toward inner brightness)
            const fall = pow(1 - t, 2.2);
            // size interpolates from core to outer cone non-linearly
            const sx = coreW * (1 + t * 3.2);
            const sy = coreH * (1 + t * 3.8);
            // color blend between inner->mid->outer
            const c1 = lerpColor(color(inner[0], inner[1], inner[2]), color(mid[0], mid[1], mid[2]), t * 0.75);
            const c2 = lerpColor(color(mid[0], mid[1], mid[2]), color(outer[0], outer[1], outer[2]), t * 0.9);
            // final color mix
            const col = lerpColor(c1, c2, t);
            const a = lifeAlpha * fall * 0.9;
            fill(red(col), green(col), blue(col), a);
            // small noise per-step to blur edges
            const ox = jitterX * (1 - t) + (noise(i * 0.13, millis() * 0.001 + i) - 0.5) * (0.6 * (1 - t));
            const oy = jitterY * (1 - t) + (noise(i * 0.11, millis() * 0.0007 + i) - 0.5) * (0.6 * (1 - t));
            ellipse(this.position.x + ox, this.position.y + oy - coreH * (t * 0.18), sx, sy);
        }

        // tiny spark highlights for embers (rare)
        if (this.kind === 'ember' && random() < 0.02) {
            fill(255, 230, 140, lifeAlpha);
            ellipse(this.position.x + random(-0.4, 0.4), this.position.y + random(-0.4, 0.4), 0.6, 0.6);
        }

        // Ember tiny spark highlight
        if (this.kind === 'ember' && random() < 0.06) {
            fill(255, 220, 100, lifeAlpha);
            ellipse(this.position.x + random(-1.2, 1.2), this.position.y + random(-1.2, 1.2), 1.2, 1.2);
        }
    }

    isDead() {
        return this.age >= this.lifespan || this.size <= 0.6 || this.position.y < -50;
    }
}