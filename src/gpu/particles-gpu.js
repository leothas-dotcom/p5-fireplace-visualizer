// Lightweight GPU-backed particle helper using GPU.js
// Provides: GPUManager.init(count), GPUManager.step(dt), GPUManager.getPositions()

const GPUManager = (function () {
  let gpu = null;
  let posKernel = null;
  let velKernel = null;
  let seedKernel = null;
  let count = 0;
  let width = 0;
  let height = 0;
  let positions = null; // Float32Array [x,y,...]
  let velocities = null; // Float32Array [vx,vy,...]

  function supportsFloatTextures() {
    // GPU.js handles internal detection; assume browser support is ok.
    return true;
  }

  function init(_count, _width, _height) {
    count = _count;
    width = _width;
    height = _height;
    // try to create a GPU instance; fall back gracefully if unavailable
    try {
      gpu = new GPU(); // let GPU.js pick the best mode (webgl|cpu)
    } catch (err) {
      console.warn('GPU.js initialization failed, falling back to CPU:', err);
      gpu = null;
      return false;
    }

  // simple RNG seed kernel (fill positions near bottom center)
  if (!gpu) return false;
  seedKernel = gpu.createKernel(function (w, h) {
      const id = this.thread.x;
      // scatter in a small area near bottom center
      const cx = w * 0.5 + (id % 17 - 8) * 0.6;
      const cy = h - 40 + ((id % 13) - 6) * 0.8;
      return [cx, cy];
    }).setOutput([count, 2]).setGraphical(false);

  // velocity kernel: start with small upward velocities
  velKernel = gpu.createKernel(function (w, h) {
      const id = this.thread.x;
      // small jitter
      const vx = (id % 19 - 9) * 0.004;
      const vy = -0.6 - (id % 7) * 0.002;
      return [vx, vy];
    }).setOutput([count, 2]).setGraphical(false);

  // position step kernel: simple Euler integration with Perlin-like noise via sine functions
    // enhanced pos kernel: slower motion, convection, and simple cohesion/stickiness
    posKernel = gpu.createKernel(function (posx, posy, velx, vely, t, w, h) {
      const id = this.thread.x;
      let x = posx[id];
      let y = posy[id];
      let vx = velx[id];
      let vy = vely[id];
      // slow down global speed
      vx *= 0.985;
      vy *= 0.985;
      // gentle upward buoyancy
      vy += -0.0006;
      // pseudo-noise for lateral sway, lower frequency for smoother motion
      let n = Math.sin((x * 0.006 + id * 3.7 + t * 0.0006)) * 0.4 + Math.cos((y * 0.004 + id * 1.3 + t * 0.0009)) * 0.4;
      vx += n * 0.0012;

      // convection: add a vorticity-like circular flow sampled by id
      const a = (id % 360) * 0.01745 + t * 0.0003;
      const cx = w * 0.5 + Math.sin(a * 0.7) * 30.0;
      const cy = h - 40 - Math.cos(a * 0.9) * 20.0;
      const dx = x - cx;
      const dy = y - cy;
      // perpendicular pull to create swirl
      vx += (-dy) * 0.00008;
      vy += (dx) * 0.00006;

      // simple cohesion: pull each particle slightly towards a pseudo-neighbor average
      // sample two pseudo-neighbors by hashing id to indices
      const n1 = (id * 7) % this.constants.COUNT;
      const n2 = (id * 13 + 17) % this.constants.COUNT;
      const nx = (posx[n1] + posx[n2]) * 0.5;
      const ny = (posy[n1] + posy[n2]) * 0.5;
      // vector towards neighbor centroid
      const tx = nx - x;
      const ty = ny - y;
      vx += tx * 0.0005; // cohesion strength
      vy += ty * 0.0005;

      // integrate
      x += vx;
      y += vy;

      // soft bounds and respawn
      if (y < -50 || x < -100 || x > w + 100) {
        x = w * 0.5 + ((id % 31) - 15) * 0.6;
        y = h - 40 + ((id % 13) - 6) * 0.6;
        vx = (id % 17 - 8) * 0.002;
        vy = -0.4 - (id % 7) * 0.001;
      }
      return [x, y];
    }).setOutput([count, 2]).setGraphical(false).setConstants({ COUNT: count });

  // allocate arrays
    positions = new Float32Array(count * 2);
    velocities = new Float32Array(count * 2);

    // seed arrays via kernels
    const s = seedKernel(width, height);
    const v = velKernel(width, height);
    for (let i = 0; i < count; i++) {
      positions[i * 2] = s[i][0];
      positions[i * 2 + 1] = s[i][1];
      velocities[i * 2] = v[i][0];
      velocities[i * 2 + 1] = v[i][1];
    }

    return true;
  }

  // internal buffers to avoid allocation every frame
  let _px = null;
  let _py = null;
  let _vx = null;
  let _vy = null;

  function step(dt) {
    if (!gpu || !posKernel) return null;
    // allocate reuse buffers on first run
    if (!_px) {
      _px = new Float32Array(count);
      _py = new Float32Array(count);
      _vx = new Float32Array(count);
      _vy = new Float32Array(count);
    }
    for (let i = 0; i < count; i++) {
      _px[i] = positions[i * 2];
      _py[i] = positions[i * 2 + 1];
      _vx[i] = velocities[i * 2];
      _vy[i] = velocities[i * 2 + 1];
    }
    const t = Date.now();
    try {
      const out = posKernel(_px, _py, _vx, _vy, t, width, height);
      if (!out) return null;
      // out is expected as [count][2]
      for (let i = 0; i < count; i++) {
        const row = out[i];
        positions[i * 2] = row[0];
        positions[i * 2 + 1] = row[1];
      }
      return positions;
    } catch (err) {
      console.warn('GPU posKernel failed:', err);
      return null;
    }
  }

  function getPositions() {
    return positions;
  }

  return {
    init,
    step,
    getPositions,
  };
})();

window.GPUManager = GPUManager;
