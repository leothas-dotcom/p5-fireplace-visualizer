class Particle {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(random(-1, 1), random(-2, -1));
        this.lifespan = 255;
    }

    update() {
        this.position.add(this.velocity);
        this.lifespan -= 2;
    }

    display() {
        stroke(255, this.lifespan);
        strokeWeight(2);
        fill(255, this.lifespan);
        ellipse(this.position.x, this.position.y, 8, 8);
    }

    isDead() {
        return this.lifespan < 0;
    }
}
