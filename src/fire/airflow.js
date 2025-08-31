class Airflow {
    constructor() {
        this.direction = createVector(0, -1); // Default upward direction
        this.strength = 1; // Default strength of airflow
    }

    applyForce(particle) {
        let force = this.direction.copy().mult(this.strength);
        particle.applyForce(force);
    }

    render() {
        stroke(255, 150);
        strokeWeight(2);
        let end = p5.Vector.add(this.direction.copy().mult(50), createVector(width / 2, height));
        line(width / 2, height, end.x, end.y);
    }
}
