class Airflow {
    constructor() {
        this.time = 0;
        // The scale determines how "zoomed in" the noise patterns are.
        // Smaller = larger, smoother swirls. Larger = chaotic static.
        this.scale = 0.003; 
        this.zOffset = 0;
    }

    update() {
        // Move the noise field upwards over time to simulate rising heat
        this.zOffset -= 0.005; 
    }

    // Get the wind vector at a specific (x, y) coordinate
    getVector(x, y) {
        // 3D noise (x, y, time) provides smooth animation
        let angle = noise(x * this.scale, y * this.scale, this.zOffset) * TWO_PI * 2;
        
        // Create a vector from the angle
        let v = p5.Vector.fromAngle(angle);
        v.mult(0.05); // Strength of the chaos
        return v;
    }
}
