class Airflow {
    constructor() {
        this.baseStrength = 0.0025; // tuned for per-frame force
        this.noiseScale = 0.0025;
        this.time = 0;
    }

    // Returns a p5.Vector force for a given (x,y)
    getForce(x, y) {
        // sample Perlin noise for gentle turbulent flow
        let nx = x * this.noiseScale;
        let ny = y * this.noiseScale;
        let t = millis() * 0.0002;
        // horizontal swirl
        let angle = (noise(nx, ny, t) - 0.5) * PI * 0.6;
        let strength = this.baseStrength * (1 + noise(nx + 10, ny + 10, t));
        let fx = sin(angle) * strength * 60; // scale so it's perceptible
        let fy = -abs(cos(angle)) * strength * 120; // mostly upward
        return createVector(fx, fy);
    }

    render() {
        // draw a few flow vectors for debug
        stroke(200, 80);
        strokeWeight(1);
        for (let x = 50; x < width; x += 120) {
            for (let y = height - 160; y > height - 480; y -= 120) {
                let f = this.getForce(x, y).mult(3000);
                push();
                translate(x, y);
                line(0, 0, f.x, f.y);
                pop();
            }
        }
    }
}