class Airflow {
    constructor() {
    // restore gentler default tuned for cozy flames
    this.baseStrength = 0.0025; // gentler lift
    this.noiseScale = 0.0025; // coarser noise for smooth flutter
    this.time = 0;
    this.gustTimer = 0;
    }

    // Returns a p5.Vector force for a given (x,y)
    getForce(x, y) {
        // sample Perlin noise for gentle turbulent flow
        let nx = x * this.noiseScale;
        let ny = y * this.noiseScale;
        let t = millis() * 0.0002;
    // horizontal swirl with gentle flutter near the burners (lower y values)
    // base noise-driven angle
    let angle = (noise(nx, ny, t) - 0.5) * PI * 0.6;
    // convective swirl: small rotational flow that increases with proximity to burner zone
    const vy = map(y, height, height * 0.5, 1, 0); // 1 at bottom, 0 higher up
    const swirl = 0.45 * vy * (noise(nx * 0.8, ny * 0.8, t * 0.9) - 0.5);
    angle += swirl;
    // strength increases closer to the bottom (where burners are)
    const burnerZone = constrain(map(y, height, height * 0.6, 1, 0), 0, 1);
    let strength = this.baseStrength * (1 + noise(nx + 10, ny + 10, t)) * (0.9 + 0.9 * burnerZone);
    // small time-varying gust component (kept small)
    const gust = sin(millis() * 0.0012 + nx * 1.9) * 0.18;
    let fx = (sin(angle) + gust) * strength * 48; // reduced multiplier
    // upward component with subtle oscillation
    let fy = -abs(cos(angle)) * strength * (100 + burnerZone * 40) * (0.95 + 0.35 * sin(millis() * 0.0009 + ny));
    // clamp to safe ranges so particles don't get huge accelerations
    fx = constrain(fx, -0.9, 0.9);
    fy = constrain(fy, -1.6, 0.2);
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