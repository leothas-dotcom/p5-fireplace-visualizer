function setup() {
    createCanvas(windowWidth, windowHeight);
    // Initialize fire and airflow simulations
    fireParticles = [];
    airflow = new Airflow();
}

function draw() {
    background(0);
    // Update and display fire particles
    for (let i = 0; i < fireParticles.length; i++) {
        fireParticles[i].update();
        fireParticles[i].display();
    }
    
    // Render airflow
    airflow.render();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Function to create new fire particles
function createFireParticle() {
    let particle = new Particle(random(width), height, random(-1, 1), random(-2, -5));
    fireParticles.push(particle);
}

// Set an interval to create new fire particles
setInterval(createFireParticle, 100);
