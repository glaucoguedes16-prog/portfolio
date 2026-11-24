(function () {
  if (window.__glaucoArcadeLoaded) return;
  window.__glaucoArcadeLoaded = true;

  /* =========================================================
     GLAUCO GUEDES — LIGHTWEIGHT RETRO MINI ARCADE (4 GAMES)
     1. Packet Invaders (Space Invaders)
     2. Cyber Snake (Snake)
     3. Firewall Breakout (Brick Breaker)
     4. Cyber Runner (Endless Jumper)
     Zero external dependencies • 60 FPS Canvas • Touch + Keys
  ========================================================= */

  const STORAGE_KEY = "glauco_arcade_highscores_v3";
  let highScores = { invaders: 0, snake: 0, breakout: 0, runner: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    highScores = Object.assign(highScores, saved);
  } catch (e) {}

  function saveHighScore(game, score) {
    if (score > (highScores[game] || 0)) {
      highScores[game] = score;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(highScores));
      } catch (e) {}
    }
  }

  function getLang() {
    const htmlLang = (document.documentElement.lang || "pt-BR").toLowerCase();
    return htmlLang.startsWith("en") ? "en" : "pt";
  }

  const TEXT = {
    pt: {
      fab: "Mini Arcade",
      badge: "4 JOGOS",
      title: "Fliperama Retrô • Offline",
      score: "PONTOS",
      best: "RECORDE",
      wave: "FASE",
      lives: "VIDAS",
      start: "Jogar",
      restart: "Jogar Novamente",
      paused: "PAUSADO",
      gameOver: "FIM DE JOGO",
      victory: "FASE CONCLUÍDA!",
      tapToStart: "Toque ou pressione Espaço para começar",
      games: {
        invaders: {
          tab: "👾 Invaders",
          name: "Packet Invaders",
          hint: "Mova (◀ ▶ ou toque) e dispare contra os bugs antes que invadam o servidor!"
        },
        snake: {
          tab: "🐍 Snake",
          name: "Cyber Snake",
          hint: "Colete os pacotes de energia neon sem bater nas bordas ou na própria cauda."
        },
        breakout: {
          tab: "🧱 Breakout",
          name: "Firewall Breakout",
          hint: "Arraste ou use ◀ ▶ para rebater o pulso e quebrar todas as camadas do firewall."
        },
        runner: {
          tab: "⚡ Runner",
          name: "Cyber Runner",
          hint: "Toque na tela ou pressione Espaço / ▲ para saltar sobre os obstáculos!"
        }
      }
    },
    en: {
      fab: "Mini Arcade",
      badge: "4 GAMES",
      title: "Retro Arcade • Offline",
      score: "SCORE",
      best: "BEST",
      wave: "STAGE",
      lives: "LIVES",
      start: "Play",
      restart: "Play Again",
      paused: "PAUSED",
      gameOver: "GAME OVER",
      victory: "STAGE CLEARED!",
      tapToStart: "Tap or press Space to start",
      games: {
        invaders: {
          tab: "👾 Invaders",
          name: "Packet Invaders",
          hint: "Move (◀ ▶ or touch) and blast incoming malware bugs before they breach!"
        },
        snake: {
          tab: "🐍 Snake",
          name: "Cyber Snake",
          hint: "Collect neon energy nodes without hitting the firewall walls or your tail."
        },
        breakout: {
          tab: "🧱 Breakout",
          name: "Firewall Breakout",
          hint: "Drag or use ◀ ▶ to bounce the energy pulse and shatter all firewall layers."
        },
        runner: {
          tab: "⚡ Runner",
          name: "Cyber Runner",
          hint: "Tap screen or press Space / ▲ to leap over spikes and corrupted packets!"
        }
      }
    }
  };

  /* Tiny Web Audio 8-bit synth (optional, muteable) */
  let muted = false;
  let audioCtx = null;
  function beep(freq, duration, type, vol) {
    if (muted) return;
    try {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audioCtx = new AC();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || "square";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol || 0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (duration || 0.08));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + (duration || 0.08));
    } catch (e) {}
  }

  /* Inject Styles */
  const style = document.createElement("style");
  style.textContent = `
    #gl-arcade-fab {
      position: fixed;
      right: 18px;
      bottom: 20px;
      z-index: 9998;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      padding: 11px 16px;
      border-radius: 999px;
      border: 1px solid rgba(34, 211, 238, 0.48);
      background: linear-gradient(135deg, rgba(10, 17, 32, 0.96), rgba(22, 33, 62, 0.96));
      color: #f8fafc;
      font-family: "Inter", system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.01em;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(2, 6, 23, 0.65), 0 0 20px rgba(34, 211, 238, 0.2);
      backdrop-filter: blur(12px);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    }
    #gl-arcade-fab:hover {
      transform: translateY(-2px);
      border-color: #22d3ee;
      box-shadow: 0 14px 34px rgba(2, 6, 23, 0.75), 0 0 28px rgba(34, 211, 238, 0.35);
    }
    #gl-arcade-fab .gl-fab-pill {
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(34, 211, 238, 0.16);
      border: 1px solid rgba(34, 211, 238, 0.38);
      color: #22d3ee;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.06em;
    }
    #gl-arcade-modal {
      position: fixed;
      inset: 0;
      z-index: 10050;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(3, 7, 18, 0.88);
      backdrop-filter: blur(10px);
      padding: 12px;
    }
    #gl-arcade-modal.open {
      display: flex;
    }
    #gl-arcade-card {
      width: 100%;
      max-width: 440px;
      background: #090f1e;
      border: 1px solid rgba(56, 189, 248, 0.38);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8), 0 0 36px rgba(34, 211, 238, 0.14);
      font-family: "Inter", system-ui, -apple-system, sans-serif;
      color: #f8fafc;
      user-select: none;
      -webkit-user-select: none;
    }
    .gl-arc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.92);
      border-bottom: 1px solid rgba(148, 163, 184, 0.14);
    }
    .gl-arc-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 800;
      color: #f8fafc;
    }
    .gl-arc-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .gl-arc-icon-btn {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: 1px solid rgba(148, 163, 184, 0.22);
      background: rgba(30, 41, 59, 0.75);
      color: #e2e8f0;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.15s, background 0.15s;
    }
    .gl-arc-icon-btn:hover {
      border-color: #22d3ee;
      background: rgba(34, 211, 238, 0.16);
    }
    .gl-arc-tabs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      padding: 8px 10px;
      background: #070b14;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    }
    .gl-arc-tab {
      padding: 7px 4px;
      border-radius: 9px;
      border: 1px solid transparent;
      background: rgba(15, 23, 42, 0.7);
      color: #94a3b8;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.15s ease;
    }
    .gl-arc-tab:hover {
      color: #f8fafc;
      border-color: rgba(56, 189, 248, 0.3);
    }
    .gl-arc-tab.active {
      background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.22));
      border-color: rgba(34, 211, 238, 0.55);
      color: #22d3ee;
    }
    .gl-arc-hud {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: rgba(12, 19, 34, 0.9);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #cbd5e1;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }
    .gl-arc-hud span b {
      color: #22d3ee;
      font-variant-numeric: tabular-nums;
    }
    .gl-arc-canvas-wrap {
      position: relative;
      width: 100%;
      background: #050912;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #gl-arc-canvas {
      display: block;
      width: 100%;
      max-width: 400px;
      height: auto;
      aspect-ratio: 4 / 3;
      touch-action: none;
    }
    .gl-arc-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 20px;
      background: rgba(5, 9, 18, 0.78);
      backdrop-filter: blur(4px);
    }
    .gl-arc-overlay.hidden {
      display: none;
    }
    .gl-arc-ov-title {
      font-size: 20px;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 6px;
    }
    .gl-arc-ov-sub {
      font-size: 12.5px;
      color: #cbd5e1;
      max-width: 310px;
      margin-bottom: 16px;
      line-height: 1.45;
    }
    .gl-arc-play-btn {
      padding: 10px 22px;
      border-radius: 999px;
      border: none;
      background: linear-gradient(135deg, #22d3ee, #3b82f6);
      color: #04101d;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(34, 211, 238, 0.35);
      transition: transform 0.15s ease;
    }
    .gl-arc-play-btn:hover {
      transform: scale(1.04);
    }
    .gl-arc-controls {
      padding: 10px 14px 12px;
      background: #090f1e;
      border-top: 1px solid rgba(148, 163, 184, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .gl-pad-btn {
      flex: 1;
      max-width: 110px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid rgba(56, 189, 248, 0.3);
      background: rgba(15, 23, 42, 0.9);
      color: #e2e8f0;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      touch-action: manipulation;
    }
    .gl-pad-btn:active {
      background: rgba(34, 211, 238, 0.25);
      border-color: #22d3ee;
      transform: scale(0.97);
    }
    .gl-pad-btn.fire {
      background: linear-gradient(135deg, rgba(34, 211, 238, 0.22), rgba(139, 92, 246, 0.24));
      border-color: rgba(34, 211, 238, 0.55);
      color: #22d3ee;
    }
    @media (max-width: 480px) {
      #gl-arcade-fab {
        right: 12px;
        bottom: 14px;
        padding: 10px 13px;
        font-size: 12px;
      }
    }
  `;
  document.head.appendChild(style);

  /* Build DOM */
  const fab = document.createElement("button");
  fab.id = "gl-arcade-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Abrir Mini Arcade");
  fab.innerHTML = `<span>🕹️</span><span id="gl-fab-label">Mini Arcade</span><span class="gl-fab-pill" id="gl-fab-pill">4 JOGOS</span>`;
  document.body.appendChild(fab);

  const modal = document.createElement("div");
  modal.id = "gl-arcade-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `
    <div id="gl-arcade-card">
      <div class="gl-arc-header">
        <div class="gl-arc-title"><span>🕹️</span><span id="gl-arc-title-text">Fliperama Retrô • Offline</span></div>
        <div class="gl-arc-actions">
          <button type="button" class="gl-arc-icon-btn" id="gl-arc-mute" title="Som">🔊</button>
          <button type="button" class="gl-arc-icon-btn" id="gl-arc-close" title="Fechar">✕</button>
        </div>
      </div>
      <div class="gl-arc-tabs" id="gl-arc-tabs">
        <button type="button" class="gl-arc-tab active" data-arc="invaders">👾 Invaders</button>
        <button type="button" class="gl-arc-tab" data-arc="snake">🐍 Snake</button>
        <button type="button" class="gl-arc-tab" data-arc="breakout">🧱 Breakout</button>
        <button type="button" class="gl-arc-tab" data-arc="runner">⚡ Runner</button>
      </div>
      <div class="gl-arc-hud">
        <span><span id="gl-hud-score-lbl">PONTOS</span>: <b id="gl-hud-score">0</b></span>
        <span><span id="gl-hud-extra-lbl">FASE</span>: <b id="gl-hud-extra">1</b></span>
        <span><span id="gl-hud-best-lbl">RECORDE</span>: <b id="gl-hud-best">0</b></span>
      </div>
      <div class="gl-arc-canvas-wrap">
        <canvas id="gl-arc-canvas" width="400" height="300"></canvas>
        <div class="gl-arc-overlay" id="gl-arc-overlay">
          <div class="gl-arc-ov-title" id="gl-arc-ov-title">Packet Invaders</div>
          <div class="gl-arc-ov-sub" id="gl-arc-ov-sub"></div>
          <button type="button" class="gl-arc-play-btn" id="gl-arc-play-btn">Jogar</button>
        </div>
      </div>
      <div class="gl-arc-controls" id="gl-arc-controls"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const canvas = document.getElementById("gl-arc-canvas");
  const ctx = canvas.getContext("2d");
  const W = 400;
  const H = 300;

  const overlay = document.getElementById("gl-arc-overlay");
  const ovTitle = document.getElementById("gl-arc-ov-title");
  const ovSub = document.getElementById("gl-arc-ov-sub");
  const playBtn = document.getElementById("gl-arc-play-btn");
  const hudScore = document.getElementById("gl-hud-score");
  const hudExtraLbl = document.getElementById("gl-hud-extra-lbl");
  const hudExtra = document.getElementById("gl-hud-extra");
  const hudBest = document.getElementById("gl-hud-best");
  const controlsBar = document.getElementById("gl-arc-controls");

  let activeGame = "invaders";
  let running = false;
  let rafId = null;
  let keys = {};
  let touchHold = { left: false, right: false, up: false, down: false, fire: false };

  function syncLabels() {
    const t = TEXT[getLang()];
    document.getElementById("gl-fab-label").textContent = t.fab;
    document.getElementById("gl-fab-pill").textContent = t.badge;
    document.getElementById("gl-arc-title-text").textContent = t.title;
    document.getElementById("gl-hud-score-lbl").textContent = t.score;
    document.getElementById("gl-hud-best-lbl").textContent = t.best;
    document.querySelectorAll(".gl-arc-tab").forEach((btn) => {
      const k = btn.getAttribute("data-arc");
      btn.textContent = t.games[k].tab;
    });
    hudBest.textContent = highScores[activeGame] || 0;
  }

  function updateHUD(score, extraLabel, extraVal) {
    hudScore.textContent = score;
    hudExtraLbl.textContent = extraLabel;
    hudExtra.textContent = extraVal;
    if (score > (highScores[activeGame] || 0)) {
      saveHighScore(activeGame, score);
    }
    hudBest.textContent = highScores[activeGame] || 0;
  }

  function showOverlay(title, sub, btnText) {
    running = false;
    ovTitle.textContent = title;
    ovSub.textContent = sub;
    playBtn.textContent = btnText;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function bindHoldButton(btn, keyName, onTap) {
    const start = (e) => {
      e.preventDefault();
      touchHold[keyName] = true;
      if (onTap) onTap();
    };
    const end = (e) => {
      e.preventDefault();
      touchHold[keyName] = false;
    };
    btn.addEventListener("pointerdown", start);
    btn.addEventListener("pointerup", end);
    btn.addEventListener("pointerleave", end);
    btn.addEventListener("pointercancel", end);
  }

  /* =========================================================
     GAME 1: PACKET INVADERS
  ========================================================= */
  const InvadersGame = (() => {
    let ship, bullets, enemies, enemyBullets, score, wave, dir, stepTimer, shootCooldown;

    function spawnWave(w) {
      enemies = [];
      const rows = Math.min(4, 3 + Math.floor((w - 1) / 2));
      const cols = 7;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          enemies.push({
            x: 42 + c * 46,
            y: 32 + r * 28,
            w: 26,
            h: 18,
            tier: r,
            alive: true
          });
        }
      }
      dir = 1;
      stepTimer = 0;
    }

    function init() {
      score = 0;
      wave = 1;
      ship = { x: W / 2 - 18, y: H - 28, w: 36, h: 14 };
      bullets = [];
      enemyBullets = [];
      shootCooldown = 0;
      spawnWave(wave);
      updateHUD(0, TEXT[getLang()].wave, 1);
    }

    function fire() {
      if (shootCooldown > 0) return;
      bullets.push({ x: ship.x + ship.w / 2 - 2, y: ship.y - 8, w: 4, h: 10 });
      shootCooldown = 14;
      beep(680, 0.06, "square", 0.035);
    }

    function setupControls() {
      controlsBar.innerHTML = `
        <button type="button" class="gl-pad-btn" id="pad-left">◀</button>
        <button type="button" class="gl-pad-btn fire" id="pad-fire">🔥 FIRE</button>
        <button type="button" class="gl-pad-btn" id="pad-right">▶</button>
      `;
      bindHoldButton(document.getElementById("pad-left"), "left");
      bindHoldButton(document.getElementById("pad-right"), "right");
      bindHoldButton(document.getElementById("pad-fire"), "fire", fire);
    }

    function update() {
      const t = TEXT[getLang()];
      if (shootCooldown > 0) shootCooldown--;
      if (keys["ArrowLeft"] || keys["KeyA"] || touchHold.left) ship.x -= 4.2;
      if (keys["ArrowRight"] || keys["KeyD"] || touchHold.right) ship.x += 4.2;
      if (keys["Space"] || touchHold.fire) fire();
      ship.x = Math.max(8, Math.min(W - ship.w - 8, ship.x));

      bullets.forEach((b) => (b.y -= 6.5));
      bullets = bullets.filter((b) => b.y > -12);

      enemyBullets.forEach((b) => (b.y += 3.2 + wave * 0.25));
      enemyBullets = enemyBullets.filter((b) => b.y < H + 10);

      let hitEdge = false;
      const speed = 0.7 + wave * 0.22;
      enemies.forEach((e) => {
        if (!e.alive) return;
        e.x += dir * speed;
        if (e.x <= 12 || e.x + e.w >= W - 12) hitEdge = true;
      });
      if (hitEdge) {
        dir *= -1;
        enemies.forEach((e) => {
          if (e.alive) e.y += 10;
        });
      }

      // Random enemy shot
      if (Math.random() < 0.018 + wave * 0.005) {
        const alive = enemies.filter((e) => e.alive);
        if (alive.length) {
          const shooter = alive[Math.floor(Math.random() * alive.length)];
          enemyBullets.push({ x: shooter.x + shooter.w / 2 - 2, y: shooter.y + shooter.h, w: 4, h: 9 });
        }
      }

      // Bullet vs Enemy
      bullets.forEach((b) => {
        enemies.forEach((e) => {
          if (e.alive && b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
            e.alive = false;
            b.y = -999;
            score += 20;
            beep(320, 0.07, "sawtooth", 0.04);
            updateHUD(score, t.wave, wave);
          }
        });
      });

      // Enemy bullet or invasion vs Ship
      for (const eb of enemyBullets) {
        if (eb.x < ship.x + ship.w && eb.x + eb.w > ship.x && eb.y < ship.y + ship.h && eb.y + eb.h > ship.y) {
          beep(130, 0.25, "sawtooth", 0.06);
          showOverlay(t.gameOver, `${t.score}: ${score} • ${t.best}: ${highScores.invaders}`, t.restart);
          return;
        }
      }
      for (const e of enemies) {
        if (e.alive && e.y + e.h >= ship.y) {
          beep(130, 0.25, "sawtooth", 0.06);
          showOverlay(t.gameOver, `${t.score}: ${score} • ${t.best}: ${highScores.invaders}`, t.restart);
          return;
        }
      }

      if (enemies.every((e) => !e.alive)) {
        wave++;
        score += 100;
        beep(880, 0.14, "triangle", 0.05);
        spawnWave(wave);
        updateHUD(score, t.wave, wave);
      }
    }

    function draw() {
      ctx.fillStyle = "#050912";
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = "rgba(34, 211, 238, 0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      // Ship
      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.moveTo(ship.x + ship.w / 2, ship.y - 5);
      ctx.lineTo(ship.x + ship.w, ship.y + ship.h);
      ctx.lineTo(ship.x, ship.y + ship.h);
      ctx.closePath();
      ctx.fill();

      // Player Bullets
      ctx.fillStyle = "#38bdf8";
      bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

      // Enemy Bullets
      ctx.fillStyle = "#f43f5e";
      enemyBullets.forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));

      // Enemies
      const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];
      enemies.forEach((e) => {
        if (!e.alive) return;
        ctx.fillStyle = colors[e.tier % colors.length];
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.fillStyle = "#050912";
        ctx.fillRect(e.x + 5, e.y + 5, 4, 4);
        ctx.fillRect(e.x + e.w - 9, e.y + 5, 4, 4);
      });
    }

    return { init, setupControls, update, draw, onPointerMove: (nx) => { if (ship) ship.x = Math.max(8, Math.min(W - ship.w - 8, nx - ship.w / 2)); } };
  })();

  /* =========================================================
     GAME 2: CYBER SNAKE
  ========================================================= */
  const SnakeGame = (() => {
    const CELL = 16;
    const COLS = Math.floor(W / CELL);
    const ROWS = Math.floor(H / CELL);
    let snake, dir, nextDir, food, score, tickAcc;

    function spawnFood() {
      while (true) {
        const fx = Math.floor(Math.random() * COLS);
        const fy = Math.floor(Math.random() * ROWS);
        if (!snake.some((s) => s.x === fx && s.y === fy)) {
          food = { x: fx, y: fy };
          break;
        }
      }
    }

    function setDir(dx, dy) {
      if (dx !== 0 && dir.x === -dx) return;
      if (dy !== 0 && dir.y === -dy) return;
      nextDir = { x: dx, y: dy };
    }

    function init() {
      const midX = Math.floor(COLS / 2);
      const midY = Math.floor(ROWS / 2);
      snake = [
        { x: midX, y: midY },
        { x: midX - 1, y: midY },
        { x: midX - 2, y: midY }
      ];
      dir = { x: 1, y: 0 };
      nextDir = { x: 1, y: 0 };
      score = 0;
      tickAcc = 0;
      spawnFood();
      updateHUD(0, "LEN", snake.length);
    }

    function setupControls() {
      controlsBar.innerHTML = `
        <button type="button" class="gl-pad-btn" id="snk-left">◀</button>
        <button type="button" class="gl-pad-btn" id="snk-up">▲</button>
        <button type="button" class="gl-pad-btn" id="snk-down">▼</button>
        <button type="button" class="gl-pad-btn" id="snk-right">▶</button>
      `;
      document.getElementById("snk-left").addEventListener("pointerdown", (e) => { e.preventDefault(); setDir(-1, 0); });
      document.getElementById("snk-right").addEventListener("pointerdown", (e) => { e.preventDefault(); setDir(1, 0); });
      document.getElementById("snk-up").addEventListener("pointerdown", (e) => { e.preventDefault(); setDir(0, -1); });
      document.getElementById("snk-down").addEventListener("pointerdown", (e) => { e.preventDefault(); setDir(0, 1); });
    }

    function update() {
      const t = TEXT[getLang()];
      if (keys["ArrowLeft"] || keys["KeyA"]) setDir(-1, 0);
      if (keys["ArrowRight"] || keys["KeyD"]) setDir(1, 0);
      if (keys["ArrowUp"] || keys["KeyW"]) setDir(0, -1);
      if (keys["ArrowDown"] || keys["KeyS"]) setDir(0, 1);

      tickAcc++;
      const stepFrames = Math.max(4, 8 - Math.floor(score / 80));
      if (tickAcc < stepFrames) return;
      tickAcc = 0;

      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      if (
        head.x < 0 || head.x >= COLS ||
        head.y < 0 || head.y >= ROWS ||
        snake.some((s) => s.x === head.x && s.y === head.y)
      ) {
        beep(130, 0.25, "sawtooth", 0.06);
        showOverlay(t.gameOver, `${t.score}: ${score} • ${t.best}: ${highScores.snake}`, t.restart);
        return;
      }

      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        beep(740, 0.06, "triangle", 0.045);
        spawnFood();
        updateHUD(score, "LEN", snake.length);
      } else {
        snake.pop();
      }
    }

    function draw() {
      ctx.fillStyle = "#050912";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(148, 163, 184, 0.05)";
      for (let x = 0; x <= W; x += CELL) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += CELL) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Food node
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.38, 0, Math.PI * 2);
      ctx.fill();

      // Snake body
      snake.forEach((seg, idx) => {
        ctx.fillStyle = idx === 0 ? "#22d3ee" : "#3b82f6";
        ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
      });
    }

    return { init, setupControls, update, draw, setDir };
  })();

  /* =========================================================
     GAME 3: FIREWALL BREAKOUT
  ========================================================= */
  const BreakoutGame = (() => {
    let paddle, ball, bricks, score, lives, stage;

    function buildBricks() {
      bricks = [];
      const rows = 4;
      const cols = 8;
      const colors = ["#8b5cf6", "#3b82f6", "#22d3ee", "#10b981"];
      const bw = 42;
      const bh = 14;
      const gap = 5;
      const offsetX = (W - (cols * bw + (cols - 1) * gap)) / 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          bricks.push({
            x: offsetX + c * (bw + gap),
            y: 28 + r * (bh + gap),
            w: bw,
            h: bh,
            color: colors[r],
            alive: true
          });
        }
      }
    }

    function resetBall() {
      const spd = 3.1 + (stage - 1) * 0.35;
      ball = { x: W / 2, y: H - 42, r: 6, vx: spd * (Math.random() > 0.5 ? 1 : -1), vy: -spd };
    }

    function init() {
      score = 0;
      lives = 3;
      stage = 1;
      paddle = { x: W / 2 - 36, y: H - 22, w: 72, h: 10 };
      buildBricks();
      resetBall();
      updateHUD(0, TEXT[getLang()].lives, lives);
    }

    function setupControls() {
      controlsBar.innerHTML = `
        <button type="button" class="gl-pad-btn" id="brk-left">◀</button>
        <button type="button" class="gl-pad-btn" id="brk-right">▶</button>
      `;
      bindHoldButton(document.getElementById("brk-left"), "left");
      bindHoldButton(document.getElementById("brk-right"), "right");
    }

    function update() {
      const t = TEXT[getLang()];
      if (keys["ArrowLeft"] || keys["KeyA"] || touchHold.left) paddle.x -= 5.4;
      if (keys["ArrowRight"] || keys["KeyD"] || touchHold.right) paddle.x += 5.4;
      paddle.x = Math.max(6, Math.min(W - paddle.w - 6, paddle.x));

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.r <= 0 || ball.x + ball.r >= W) {
        ball.vx *= -1;
        beep(420, 0.04, "sine", 0.03);
      }
      if (ball.y - ball.r <= 0) {
        ball.vy *= -1;
        beep(420, 0.04, "sine", 0.03);
      }

      // Paddle bounce
      if (
        ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.w
      ) {
        const hitPos = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        const speed = Math.hypot(ball.vx, ball.vy);
        ball.vx = speed * hitPos * 0.85;
        ball.vy = -Math.sqrt(Math.max(2, speed * speed - ball.vx * ball.vx));
        beep(540, 0.05, "triangle", 0.04);
      }

      // Bricks
      for (const b of bricks) {
        if (!b.alive) continue;
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w && ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
          b.alive = false;
          ball.vy *= -1;
          score += 15;
          beep(680, 0.05, "square", 0.035);
          updateHUD(score, t.lives, lives);
          break;
        }
      }

      if (bricks.every((b) => !b.alive)) {
        stage++;
        score += 100;
        buildBricks();
        resetBall();
        updateHUD(score, t.lives, lives);
      }

      if (ball.y - ball.r > H) {
        lives--;
        beep(160, 0.18, "sawtooth", 0.05);
        updateHUD(score, t.lives, Math.max(0, lives));
        if (lives <= 0) {
          showOverlay(t.gameOver, `${t.score}: ${score} • ${t.best}: ${highScores.breakout}`, t.restart);
        } else {
          resetBall();
        }
      }
    }

    function draw() {
      ctx.fillStyle = "#050912";
      ctx.fillRect(0, 0, W, H);

      bricks.forEach((b) => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });

      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
    }

    return { init, setupControls, update, draw, onPointerMove: (nx) => { if (paddle) paddle.x = Math.max(6, Math.min(W - paddle.w - 6, nx - paddle.w / 2)); } };
  })();

  /* =========================================================
     GAME 4: CYBER RUNNER
  ========================================================= */
  const RunnerGame = (() => {
    const GROUND_Y = 248;
    let player, obstacles, score, speed, spawnTimer;

    function jump() {
      if (!player) return;
      if (player.onGround) {
        player.vy = -10.8;
        player.onGround = false;
        beep(620, 0.07, "square", 0.04);
      }
    }

    function init() {
      player = { x: 48, y: GROUND_Y - 26, w: 22, h: 26, vy: 0, onGround: true };
      obstacles = [];
      score = 0;
      speed = 4.2;
      spawnTimer = 45;
      updateHUD(0, "SPD", "1.0x");
    }

    function setupControls() {
      controlsBar.innerHTML = `
        <button type="button" class="gl-pad-btn fire" id="run-jump" style="max-width:220px;">▲ SALTAR / JUMP</button>
      `;
      document.getElementById("run-jump").addEventListener("pointerdown", (e) => {
        e.preventDefault();
        jump();
      });
    }

    function update() {
      const t = TEXT[getLang()];
      if (keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) jump();

      player.vy += 0.55;
      player.y += player.vy;
      if (player.y >= GROUND_Y - player.h) {
        player.y = GROUND_Y - player.h;
        player.vy = 0;
        player.onGround = true;
      }

      spawnTimer--;
      if (spawnTimer <= 0) {
        const tall = Math.random() > 0.45;
        obstacles.push({
          x: W + 10,
          y: GROUND_Y - (tall ? 28 : 18),
          w: tall ? 16 : 24,
          h: tall ? 28 : 18
        });
        spawnTimer = Math.max(42, Math.floor(88 - speed * 4 + Math.random() * 34));
      }

      obstacles.forEach((o) => (o.x -= speed));
      obstacles = obstacles.filter((o) => o.x + o.w > -10);

      score += 0.25;
      speed = 4.2 + Math.min(4.5, score / 280);
      const dispScore = Math.floor(score);
      updateHUD(dispScore, "SPD", (speed / 4.2).toFixed(1) + "x");

      for (const o of obstacles) {
        if (
          player.x + 3 < o.x + o.w &&
          player.x + player.w - 3 > o.x &&
          player.y + 3 < o.y + o.h &&
          player.y + player.h - 2 > o.y
        ) {
          beep(130, 0.25, "sawtooth", 0.06);
          showOverlay(t.gameOver, `${t.score}: ${dispScore} • ${t.best}: ${highScores.runner}`, t.restart);
          return;
        }
      }
    }

    function draw() {
      ctx.fillStyle = "#050912";
      ctx.fillRect(0, 0, W, H);

      // Ground neon line
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();

      // Player cyber-runner
      ctx.fillStyle = "#22d3ee";
      ctx.fillRect(player.x, player.y, player.w, player.h);
      ctx.fillStyle = "#050912";
      ctx.fillRect(player.x + 12, player.y + 5, 6, 5);

      // Obstacles
      ctx.fillStyle = "#f43f5e";
      obstacles.forEach((o) => {
        ctx.fillRect(o.x, o.y, o.w, o.h);
      });
    }

    return { init, setupControls, update, draw, jump };
  })();

  const GAMES = {
    invaders: InvadersGame,
    snake: SnakeGame,
    breakout: BreakoutGame,
    runner: RunnerGame
  };

  function loop() {
    if (!running) return;
    GAMES[activeGame].update();
    if (!running) return;
    GAMES[activeGame].draw();
    rafId = requestAnimationFrame(loop);
  }

  function selectGame(gameKey, autoStart) {
    if (!GAMES[gameKey]) gameKey = "invaders";
    activeGame = gameKey;
    running = false;
    if (rafId) cancelAnimationFrame(rafId);

    document.querySelectorAll(".gl-arc-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-arc") === gameKey);
    });

    syncLabels();
    GAMES[activeGame].setupControls();
    GAMES[activeGame].init();
    GAMES[activeGame].draw();

    const t = TEXT[getLang()];
    if (autoStart) {
      hideOverlay();
      running = true;
      rafId = requestAnimationFrame(loop);
    } else {
      showOverlay(t.games[gameKey].name, t.games[gameKey].hint, t.start);
    }
  }

  function openModal(gameKey) {
    modal.classList.add("open");
    selectGame(gameKey || activeGame, false);
  }

  function closeModal() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    modal.classList.remove("open");
  }

  /* Events */
  fab.addEventListener("click", () => openModal(activeGame));
  document.getElementById("gl-arc-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.getElementById("gl-arc-mute").addEventListener("click", (e) => {
    muted = !muted;
    e.currentTarget.textContent = muted ? "🔇" : "🔊";
  });

  document.querySelectorAll(".gl-arc-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectGame(btn.getAttribute("data-arc"), false);
    });
  });

  playBtn.addEventListener("click", () => {
    GAMES[activeGame].init();
    hideOverlay();
    running = true;
    beep(520, 0.08, "triangle", 0.04);
    rafId = requestAnimationFrame(loop);
  });

  /* Canvas Touch / Pointer Support (drag for Invaders/Breakout, swipe for Snake, tap for Runner) */
  let touchStartPos = null;
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * W;
    const ny = ((e.clientY - rect.top) / rect.height) * H;
    touchStartPos = { x: nx, y: ny };
    if (activeGame === "runner" && running) RunnerGame.jump();
    if (GAMES[activeGame].onPointerMove) GAMES[activeGame].onPointerMove(nx);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * W;
    const ny = ((e.clientY - rect.top) / rect.height) * H;
    if (GAMES[activeGame].onPointerMove) {
      GAMES[activeGame].onPointerMove(nx);
    }
    if (activeGame === "snake" && touchStartPos) {
      const dx = nx - touchStartPos.x;
      const dy = ny - touchStartPos.y;
      if (Math.hypot(dx, dy) > 18) {
        if (Math.abs(dx) > Math.abs(dy)) SnakeGame.setDir(dx > 0 ? 1 : -1, 0);
        else SnakeGame.setDir(0, dy > 0 ? 1 : -1);
        touchStartPos = { x: nx, y: ny };
      }
    }
  });

  window.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === "Escape") {
      closeModal();
      return;
    }
    if (e.code === "Space" && !running && !overlay.classList.contains("hidden")) {
      playBtn.click();
      return;
    }
    keys[e.code] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  /* Sync language if portfolio toggles PT/EN */
  const langObs = new MutationObserver(() => syncLabels());
  langObs.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  /* Expose public launcher for #lab section buttons */
  window.openGlaucoArcade = function (gameKey) {
    openModal(gameKey || "invaders");
  };

  syncLabels();
})();
