class Particle {
    constructor(x, y) {
        this.position = createVector(x, y);
        // initial upward velocity with slight horizontal jitter
        this.options = arguments[2] || {};
        this.kind = this.options.kind || 'flame';
        if (this.kind === 'ember') {
            // more upright and slower embers to resemble droplets
            this.velocity = createVector(random(-0.25, 0.25), random(-1.8, -0.8));
            this.lifespan = random(1200, 2800);
            this.baseSize = random(1.0, 2.4);
        } else if (this.kind === 'core') {
            this.velocity = createVector(random(-0.4, 0.4), random(-0.6, -1.2));
            this.lifespan = random(1400, 2200);
            this.baseSize = random(10, 26);
        } else { // flame
            this.velocity = createVector(random(-0.8, 0.8), random(-0.6, -2.2));
            this.lifespan = random(700, 1200); // ms
            this.baseSize = random(2.0, 6.2);
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
        // simple drag dependent on size (slightly lower for embers to keep them cohesive)
        let dragFactor = this.kind === 'ember' ? -0.009 : -0.01;
        let drag = this.velocity.copy().mult(dragFactor * (this.size / 12));
        this.applyForce(drag);

    // perlin sway to make flame wavy; embers get softer lateral sway
    let swayAmt = this.kind === 'ember' ? 0.9 : 1.0;
    let sway = (noise(this.position.x * 0.008, millis() * 0.0008) - 0.5) * swayAmt;
    this.applyForce(createVector(sway * 0.01, 0));

        // integrate
        this.velocity.add(this.acceleration);

        // simple cohesion for ember particles: sample nearby particles by index to approximate local grouping
        if (this.kind === 'ember' && typeof particles !== 'undefined' && particles.length > 3) {
            let center = createVector(0,0);
            let count = 0;
            const myIndex = particles.indexOf(this);
            for (let i = -2; i <= 2; i++) {
                const idx = myIndex + i;
                if (idx >= 0 && idx < particles.length && particles[idx] !== this) {
                    center.add(particles[idx].position);
                    count++;
                }
            }
            if (count > 0) {
                center.div(count);
                // pull slightly toward local center to create stickiness
                const pull = p5.Vector.sub(center, this.position).mult(0.0012);
                this.velocity.add(pull);
            }
        }

        this.position.add(p5.Vector.mult(this.velocity, deltaTime / 16.666));
        this.acceleration.mult(0);

        // age
        this.age += deltaTime;

        // shrink over life
        let lifeT = constrain(this.age / this.lifespan, 0, 1);
        this.size = this.baseSize * (1 - lifeT);
    }

    display() {
        // layered glow for better fire look
        let speed = this.velocity.mag();
        let t = constrain(map(speed, 0, 8, 0, 1), 0, 1);
        // color ramps per kind
        let inner, mid, outer;
        if (this.kind === 'ember') {
            inner = [255, 210, 140]; mid = [255, 150, 60]; outer = [90, 30, 12];
        } else if (this.kind === 'core') {
            inner = [255, 255, 200]; mid = [255, 200, 80]; outer = [180, 70, 20];
        } else { // flame
            inner = [255, 245, 200]; mid = [255, 140, 40]; outer = [120, 30, 10];
        }

        let lifeAlpha = map(this.age, 0, this.lifespan, 220, 0);

        // inner bright core (small)
        fill(lerp(inner[0], mid[0], t), lerp(inner[1], mid[1], t), lerp(inner[2], mid[2], t), lifeAlpha);
        ellipse(this.position.x, this.position.y, max(0.4, this.size * 0.45), max(0.4, this.size * 0.45));

        // mid glow
        fill(lerp(mid[0], outer[0], t), lerp(mid[1], outer[1], t), lerp(mid[2], outer[2], t), lifeAlpha * 0.6);
        ellipse(this.position.x, this.position.y, max(0.8, this.size * 0.95), max(0.8, this.size * 0.95));

        // outer fuzz / smoke-ish
        fill(outer[0], outer[1], outer[2], lifeAlpha * 0.22);
        ellipse(this.position.x, this.position.y, max(1.6, this.size * 2.2), max(1.6, this.size * 2.2));

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