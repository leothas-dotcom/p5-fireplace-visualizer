# p5 Fireplace Visualizer

A cozy, browser-based fireplace simulator built with p5.js. The goal is a relaxing corner to watch simulated flames emerge from configurable sources and respond to simulated airflow.

Live demo

- GitHub Pages: https://leothas-dotcom.github.io/p5-fireplace-visualizer/  (coming soon)

What this repo contains

- `index.html` — HTML shell that loads the p5 sketch.
- `src/sketch.js` — main sketch and loop.
- `src/styles.css` — page styles for a clean canvas experience.
- `src/fire/particles.js` — particle class used to render flame particles.
- `src/fire/airflow.js` — simple airflow helper class.

Quick start (development)

1. Clone the repository:

   git clone https://github.com/leothas-dotcom/p5-fireplace-visualizer.git
   cd p5-fireplace-visualizer

2. Install dev dependencies (Windows / PowerShell)

   npm install

3. Run a local server and open the sketch in a browser:

   npm start

Windows (PowerShell) notes

- `npm` is not a PowerShell "function" — it's the Node package manager executable that comes with Node.js. If `npm` is not recognized in PowerShell, install Node.js (which includes `npm`) or use one of the install options below.

- Recommended installs on Windows:
  - Official Node installer (LTS): download from https://nodejs.org and run the Windows installer (includes npm). After installing, open a new PowerShell window and run `node -v` and `npm -v` to verify.
  - winget (Windows 10/11):

    ```powershell
    winget install OpenJS.NodeJS.LTS
    ```

  - Chocolatey (if you use it):

    ```powershell
    choco install nodejs-lts
    ```

  - nvm-windows (if you want multiple Node versions): https://github.com/coreybutler/nvm-windows

- Verify installation in PowerShell:

  ```powershell
  node -v
  npm -v
  ```

- If you see `npm: command not found` or `npm is not recognized`, either:
  - Restart the terminal after installing Node (the PATH is updated on a new session), or
  - Ensure the Node installation directory is in your PATH environment variable.

Run and preview

- After `npm install`, run `npm start`. This uses `live-server` (dev dependency) to serve the folder and should open your default browser automatically.
- If the browser doesn't open, visit http://127.0.0.1:8080 or http://localhost:8080 (live-server default) in your browser.
- Stop the server with Ctrl+C in the terminal.

Notes on current status

- This is an early scaffold. The sketch renders particles and a basic airflow helper, but there are known issues and missing features (see Backlog issues).
- The project uses p5.js for rendering and `live-server` for local development.

Roadmap / Backlog

I created a set of issues to track the next steps. Top priorities:

- Make the particle system robust: remove dead particles to prevent memory growth.
- Add support for multiple fire sources and configurable emission.
- Integrate airflow forces so particles react more realistically.
- Add UI controls for emission rate, wind, and color palettes.
- Improve visuals (color gradients, additive blending, glow, flicker).
- Add CI and a GitHub Pages demo deploy.

Contributing

Issues and PRs are welcome. If you pick a task from the backlog, please comment on the corresponding issue so someone else doesn't duplicate work.

License

MIT — see `LICENSE` for full text.

Owner

leothas-dotcom
