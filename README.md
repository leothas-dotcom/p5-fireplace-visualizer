# p5 Fireplace Visualizer

Cozy, browser-based fireplace visualizer built with p5.js and an optional GPU compute path (GPU.js). The project simulates fire particles, airflow, and a slower, droplet-like ember behavior for a warm, relaxing visual.

Repository: https://github.com/leothas-dotcom/p5-fireplace-visualizer

## Status (latest)
- GPU prototype implemented using GPU.js (browser WebGL path when available).
- Particle system supports three kinds: `flame`, `ember`, and `core`.
- Performance improvements: batched POINTS rendering, reduced default particle counts, and cheaper GPU kernels with cohesion/convective terms to approximate liquid-like droplets.

## Files of interest
- `index.html` — entry page, includes p5.js and GPU.js via CDN.
- `src/sketch.js` — main p5 sketch, emission, scene composition, and GPU toggle.
- `src/fire/particles.js` — CPU particle class (flame/ember/core) and display code.
- `src/fire/airflow.js` — airflow sampling that applies forces to particles.
- `src/gpu/particles-gpu.js` — GPUManager wrapper (init / step / getPositions) using GPU.js kernels.
- `scripts/serve.js` — minimal zero-dependency static server used by `npm start`.

## Quick start (local)
1. Clone:
   ```bash
   git clone https://github.com/leothas-dotcom/p5-fireplace-visualizer.git
   cd p5-fireplace-visualizer
   ```
2. Install runtime deps (p5 is in package.json):
   ```powershell
   npm install
   ```
3. Start the local static server:
   ```powershell
   npm start
   ```
   The server runs `node scripts/serve.js 8080` by default and serves the project at `http://localhost:8080`.

Windows PowerShell notes
- If PowerShell blocks npm launch scripts (error mentioning `npm.ps1`), either run `npm.cmd` directly or open a new PowerShell and run:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
  npm start
  ```

## GPU notes & tuning
- GPU mode is enabled by default in `src/sketch.js` with `useGPU = true`. The GPU particle compute is implemented in `src/gpu/particles-gpu.js` using GPU.js (CDN).
- Default GPU count is modest (12k) — you can change `gpuCount` in `src/sketch.js` to a higher or lower value depending on your GPU and target FPS.
- If GPU.js cannot initialize (due to browser or driver limitations), the code falls back to CPU particles automatically.

Performance tips
- Reduce `gpuCount` and `EMIT_RATE` in `src/sketch.js` to improve FPS.
- Close other GPU-heavy applications (browser tabs, games) for better WebGL performance.
- For maximum performance on high particle counts, consider a WebGL point-sprite renderer (future improvement).

How the liquid-like embers were achieved
- GPU kernel: introduced gentle buoyancy, smooth pseudo-noise sway, convection swirl, and a cheap cohesion term (pseudo-neighbors sampled by id hash) to create slow, twirling droplet motion.
- CPU embers: reduced lateral jitter, longer lifespan, and a local cohesion pull toward nearby particles to approximate stickiness.

Contributing
- Contributions welcome: open an issue for a feature request or bug, or submit a pull request. See code comments for areas marked TODO (GPU sprite rendering, UI tuning controls).

License
- MIT

Enjoy the visualization — pull requests and feedback are welcome!
# p5 Fireplace Visualizer

This project is a cozy visualization of a fireplace using the p5.js library. It simulates fire and airflow to create a relaxing experience.

## Features

- Realistic fire simulation with individual particles.
- Airflow dynamics that influence the movement of fire particles.
- Interactive canvas that provides a soothing visual experience.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/p5-fireplace-visualizer.git
   ```
2. Navigate to the project directory:
   ```
   cd p5-fireplace-visualizer
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To run the project, use the following command:
```
npm start
```
This will start a local server and open the visualization in your default web browser.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.