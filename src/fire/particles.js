class Particle {
    constructor(x, y) {
        this.position = createVector(x, y);
        // Initial velocity: Upwards with a little spread
        this.velocity = createVector(random(-0.5, 0.5), random(-1, -3));
        this.acceleration = createVector(0, 0);
        
        // Life properties
        this.maxLife = random(150, 250);
        this.life = this.maxLife;
        
        // Appearance
        this.baseSize = random(40, 120); // Much larger for the "mist" effect
        this.size = this.baseSize;
        
        // Rotation for the texture
        this.angle = random(TWO_PI);
        this.angVelocity = random(-0.05, 0.05);
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    update(flowField) {
        // 1. Buoyancy: Heat rises
        let buoyancy = createVector(0, -0.03);
        this.applyForce(buoyancy);

        // 2. Airflow: Sample the vector field at this position
        let wind = flowField.getVector(this.position.x, this.position.y);
        this.applyForce(wind);

        // Physics integration
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        
        // Drag (Air resistance) - stabilizes the movement
        this.velocity.mult(0.98);
        
        this.acceleration.mult(0);
        
        // Age
        this.life -= 1.5;
        this.angle += this.angVelocity;
        
        // Shrink slightly as it cools
        let lifeRatio = this.life / this.maxLife;
        this.size = this.baseSize * (0.5 + 0.5 * lifeRatio);
    }

    display(img) {
        let lifeRatio = this.life / this.maxLife;
        
        // Dynamic Tinting
        // 1.0 (New) -> White/Yellow
        // 0.7 -> Orange
        // 0.3 -> Deep Red
        // 0.0 (Old) -> Dark Smoke
        
        let r, g, b, alpha;
        
        if (lifeRatio > 0.7) {
            // White to Yellow
            let t = map(lifeRatio, 0.7, 1, 0, 1);
            r = 255;
            g = map(t, 0, 1, 150, 255);
            b = map(t, 0, 1, 50, 200);
            alpha = map(lifeRatio, 0, 1, 0, 50); // Lower alpha for white core
        } else if (lifeRatio > 0.3) {
            // Yellow to Red
            let t = map(lifeRatio, 0.3, 0.7, 0, 1);
            r = 255;
            g = map(t, 0, 1, 50, 150);
            b = 0;
            alpha = 30;
        } else {
            // Red to Smoke
            let t = map(lifeRatio, 0, 0.3, 0, 1);
            r = map(t, 0, 1, 50, 255);
            g = map(t, 0, 1, 50, 50);
            b = map(t, 0, 1, 50, 0);
            alpha = map(t, 0, 1, 0, 20);
        }

        tint(r, g, b, alpha);
        
        push();
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        imageMode(CENTER);
        // Draw the soft texture instead of a shape
        image(img, 0, 0, this.size, this.size);
        pop();
    }

    isDead() {
        return this.life < 0;
    }
}
