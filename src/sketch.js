let heatSources = [];
let particleTexture;

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.parent('canvas-container');
    
    // Generate the "mist" texture programmatically
    // This creates a soft radial gradient image in memory
    particleTexture = createImage(64, 64);
    particleTexture.loadPixels();
    for (let x = 0; x < 64; x++) {
        for (let y = 0; y < 64; y++) {
            let d = dist(x, y, 32, 32);
            // Calculate alpha: opaque in center, transparent at edges
            let alpha = map(d, 0, 32, 255, 0);
            alpha = constrain(alpha, 0, 255);
            
            // Curve the alpha for a softer "glowing" falloff
            alpha = pow(alpha / 255, 3) * 255;

            let index = (x + y * 64) * 4;
            particleTexture.pixels[index] = 255;     // R
            particleTexture.pixels[index + 1] = 255; // G
            particleTexture.pixels[index + 2] = 255; // B
            particleTexture.pixels[index + 3] = alpha; // A
        }
    }
    particleTexture.updatePixels();

    fireParticles = [];
    airflow = new Airflow();
    
    updateHeatSources();
}

function draw() {
    // Deep, dark background for maximum contrast
    background(5, 5, 5);
    
    // Additive blending is the key: colors add up to white
    blendMode(ADD);
    
    airflow.update();

    // Emit particles from our heat sources
    for (let i = 0; i < 3; i++) {
        createFireParticle();
    }
    
    // Update and display fire particles
    for (let i = fireParticles.length - 1; i >= 0; i--) {
        let p = fireParticles[i];
        
        p.update(airflow);
        p.display(particleTexture);
        
        if (p.isDead()) {
            fireParticles.splice(i, 1);
        }
    }
    
    blendMode(BLEND);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    updateHeatSources();
}

function updateHeatSources() {
    // Create heat sources (virtual logs) at bottom center
    let center = width / 2;
    // Wider spread for a larger fire
    heatSources = [center - 60, center - 20, center + 20, center + 60];
}

function createFireParticle() {
    let sourceX = random(heatSources);
    let x = randomGaussian(sourceX, 15);
    let y = height - 100; // Start slightly up from bottom
    
    let particle = new Particle(x, y);
    fireParticles.push(particle);
}
