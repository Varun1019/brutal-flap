/**
 * BRUTAL FLAP // NEO-BRUTALISM GAME ENGINE
 * Features:
 * - Thick black ink outlines (4px) on all game elements
 * - Industrial hazard caution tape on pipes and ground
 * - Bold pop-art / brutalist character sprites
 * - Square confetti & comic debris particle physics
 * - High-contrast comic score stamps
 * - 3 Selectable brutalist pilots (Chunky Bird, Cyber Drone, Hot Pink Phoenix)
 * - Screen shake and physical impact feedback
 * - LocalStorage high-score and industrial rank medals
 */

(function () {
  'use strict';

  // --- Configuration Constants ---
  const CANVAS_WIDTH = 420;
  const CANVAS_HEIGHT = 640;
  const GROUND_HEIGHT = 80;

  const GRAVITY = 0.28;
  const JUMP_FORCE = -5.8;
  const MAX_FALL_SPEED = 6.2;
  const PIPE_SPEED = 1.9;
  const PIPE_SPAWN_INTERVAL = 135;
  const BASE_GAP = 180;
  const MIN_GAP = 152;

  // --- Game States ---
  const STATE = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
  };

  // --- Neo-Brutalist Pilots ---
  const SKINS = [
    {
      id: 'chunky',
      name: 'CHUNKY BIRD',
      primaryColor: '#FFE600',
      secondaryColor: '#FF6B00',
      accentColor: '#FFFFFF',
      trailColor: '#FFE600',
      type: 'chunky'
    },
    {
      id: 'drone',
      name: 'CYBER DRONE',
      primaryColor: '#00FF66',
      secondaryColor: '#1E293B',
      accentColor: '#00F0FF',
      trailColor: '#00FF66',
      type: 'drone'
    },
    {
      id: 'phoenix',
      name: 'HOT PHOENIX',
      primaryColor: '#FF3366',
      secondaryColor: '#FFE600',
      accentColor: '#FFFFFF',
      trailColor: '#FF3366',
      type: 'phoenix'
    }
  ];

  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.state = STATE.MENU;

      this.score = 0;
      this.orbsCollected = 0;
      this.bestScore = parseInt(localStorage.getItem('brutalflap_best_score') || '0', 10);
      this.totalOrbs = parseInt(localStorage.getItem('brutalflap_total_orbs') || '0', 10);

      this.currentSkinIndex = parseInt(localStorage.getItem('brutalflap_skin_idx') || '0', 10);
      if (this.currentSkinIndex >= SKINS.length) this.currentSkinIndex = 0;

      this.frameCount = 0;
      this.screenShake = 0;
      this.isNewHighScore = false;

      // Entities
      this.bird = null;
      this.pipes = [];
      this.orbs = [];
      this.particles = [];
      this.floatingTexts = [];
      this.clouds = [];
      this.buildings = [];

      this.initCanvasResolution();
      this.initBackgroundEnvironment();
      this.resetBird();
      this.setupControls();
      this.updateUI();

      this.lastTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }

    initCanvasResolution() {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = CANVAS_WIDTH * dpr;
      this.canvas.height = CANVAS_HEIGHT * dpr;
      this.ctx.scale(dpr, dpr);
    }

    initBackgroundEnvironment() {
      // Bold cartoon clouds
      this.clouds = [
        { x: 30, y: 70, size: 36, speed: 0.35 },
        { x: 200, y: 120, size: 48, speed: 0.5 },
        { x: 330, y: 60, size: 30, speed: 0.4 }
      ];

      // Brutalist skyline silhouettes
      this.buildings = [];
      let curX = 0;
      while (curX < CANVAS_WIDTH + 60) {
        const width = 28 + Math.random() * 32;
        const height = 45 + Math.random() * 90;
        this.buildings.push({
          x: curX,
          width: width,
          height: height,
          hasAntenna: Math.random() > 0.5
        });
        curX += width + 6;
      }
    }

    resetBird() {
      this.bird = {
        x: 95,
        y: CANVAS_HEIGHT / 2 - 35,
        radius: 17,
        velocity: 0,
        rotation: 0,
        wingPhase: 0,
        rotorAngle: 0,
        dead: false
      };
    }

    startNewGame() {
      this.state = STATE.PLAYING;
      this.score = 0;
      this.orbsCollected = 0;
      this.frameCount = 0;
      this.screenShake = 0;
      this.isNewHighScore = false;
      this.pipes = [];
      this.orbs = [];
      this.particles = [];
      this.floatingTexts = [];
      this.resetBird();
      this.bird.velocity = JUMP_FORCE * 0.7;
      this.spawnPipe(CANVAS_WIDTH + 140);

      this.updateUI();
      if (window.soundEngine) {
        window.soundEngine.init();
        window.soundEngine.playFlap();
      }
    }

    setupControls() {
      const handleAction = (e) => {
        if (e && e.type === 'keydown') {
          if (e.code === 'KeyP') {
            this.togglePause();
            e.preventDefault();
            return;
          }
          if (e.code !== 'Space' && e.code !== 'ArrowUp' && e.code !== 'KeyW') {
            return;
          }
          e.preventDefault();
        }

        if (this.state === STATE.MENU) {
          this.startNewGame();
        } else if (this.state === STATE.PLAYING) {
          this.flap();
        } else if (this.state === STATE.GAMEOVER) {
          if (this.frameCount > 18) {
            this.startNewGame();
          }
        }
      };

      window.addEventListener('keydown', handleAction);
      this.canvas.addEventListener('pointerdown', handleAction);

      const playBtn = document.getElementById('playBtn');
      if (playBtn) playBtn.addEventListener('click', () => this.startNewGame());

      const restartBtn = document.getElementById('restartBtn');
      if (restartBtn) restartBtn.addEventListener('click', () => this.startNewGame());

      const pauseBtn = document.getElementById('pauseBtn');
      if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());

      const resumeBtn = document.getElementById('resumeBtn');
      if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());

      const muteBtn = document.getElementById('muteBtn');
      if (muteBtn) {
        muteBtn.addEventListener('click', () => {
          if (window.soundEngine) {
            const isMuted = window.soundEngine.toggleMute();
            muteBtn.innerText = isMuted ? '🔇 SFX: OFF' : '🔊 SFX: ON';
            muteBtn.classList.toggle('active', !isMuted);
          }
        });
      }

      const musicBtn = document.getElementById('musicBtn');
      if (musicBtn) {
        musicBtn.addEventListener('click', () => {
          if (window.soundEngine) {
            const active = window.soundEngine.toggleMusic();
            musicBtn.innerText = active ? '🎵 MUSIC: ON' : '🎵 MUSIC: OFF';
            musicBtn.classList.toggle('active', active);
          }
        });
      }

      const prevSkinBtn = document.getElementById('prevSkinBtn');
      const nextSkinBtn = document.getElementById('nextSkinBtn');
      if (prevSkinBtn && nextSkinBtn) {
        prevSkinBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.cycleSkin(-1);
        });
        nextSkinBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.cycleSkin(1);
        });
      }
    }

    cycleSkin(dir) {
      this.currentSkinIndex = (this.currentSkinIndex + dir + SKINS.length) % SKINS.length;
      localStorage.setItem('brutalflap_skin_idx', this.currentSkinIndex.toString());
      this.updateSkinDisplay();
    }

    updateSkinDisplay() {
      const skin = SKINS[this.currentSkinIndex];
      const skinNameEl = document.getElementById('skinName');
      if (skinNameEl) skinNameEl.innerText = skin.name;
    }

    togglePause() {
      if (this.state === STATE.PLAYING) {
        this.state = STATE.PAUSED;
      } else if (this.state === STATE.PAUSED) {
        this.state = STATE.PLAYING;
      }
      this.updateUI();
    }

    flap() {
      if (this.bird.dead) return;
      this.bird.velocity = JUMP_FORCE;

      // Spawn brutalist square confetti particles
      const skin = SKINS[this.currentSkinIndex];
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: this.bird.x - 14,
          y: this.bird.y + (Math.random() * 10 - 5),
          vx: -(Math.random() * 4 + 2),
          vy: Math.random() * 4 - 2,
          size: Math.random() * 5 + 3,
          color: skin.trailColor,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.2,
          alpha: 1,
          decay: 0.04
        });
      }

      if (window.soundEngine) {
        window.soundEngine.playFlap();
      }
    }

    spawnPipe(startX = CANVAS_WIDTH + 60) {
      const currentGap = Math.max(MIN_GAP, BASE_GAP - Math.floor(this.score / 7) * 3);
      const minTop = 60;
      const maxTop = CANVAS_HEIGHT - GROUND_HEIGHT - currentGap - 60;
      const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
      const bottomY = topHeight + currentGap;
      const bottomHeight = CANVAS_HEIGHT - GROUND_HEIGHT - bottomY;

      const pipe = {
        x: startX,
        width: 68,
        topHeight: topHeight,
        bottomY: bottomY,
        bottomHeight: bottomHeight,
        passed: false
      };

      this.pipes.push(pipe);

      // 45% chance of spawning collectible star
      if (Math.random() < 0.45) {
        this.orbs.push({
          x: startX + pipe.width / 2,
          y: topHeight + currentGap / 2,
          radius: 11,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    addFloatingText(text, x, y, bg = '#FFE600') {
      this.floatingTexts.push({
        text,
        x,
        y,
        bg,
        alpha: 1,
        vy: -1.8
      });
    }

    addExplosion(x, y) {
      const colors = ['#FFE600', '#FF3366', '#000000', '#FFFFFF', '#00F0FF'];
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.3,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    }

    onHitObstacle() {
      if (this.bird.dead) return;
      this.bird.dead = true;
      this.state = STATE.GAMEOVER;
      this.screenShake = 18;
      this.addExplosion(this.bird.x, this.bird.y);

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        this.isNewHighScore = true;
        localStorage.setItem('brutalflap_best_score', this.bestScore.toString());
      }

      this.totalOrbs += this.orbsCollected;
      localStorage.setItem('brutalflap_total_orbs', this.totalOrbs.toString());

      if (window.soundEngine) {
        window.soundEngine.playHit();
        setTimeout(() => {
          if (window.soundEngine) window.soundEngine.playGameOver();
        }, 160);
      }

      this.updateUI();
    }

    // --- Update Loop ---
    update() {
      this.frameCount++;

      // Screen shake decay
      if (this.screenShake > 0) {
        this.screenShake *= 0.86;
        if (this.screenShake < 0.3) this.screenShake = 0;
      }

      // Update background clouds
      for (const cloud of this.clouds) {
        cloud.x -= cloud.speed;
        if (cloud.x < -cloud.size * 2) {
          cloud.x = CANVAS_WIDTH + cloud.size;
        }
      }

      // In MENU state, hover gently
      if (this.state === STATE.MENU) {
        this.bird.y = CANVAS_HEIGHT / 2 - 35 + Math.sin(this.frameCount * 0.08) * 8;
        this.bird.rotation = Math.sin(this.frameCount * 0.08) * 0.1;
        this.bird.wingPhase += 0.2;
        this.bird.rotorAngle += 0.35;
        return;
      }

      if (this.state === STATE.PAUSED) return;

      // Update Bird Physics with gentle gravity & terminal fall speed cap
      this.bird.velocity += GRAVITY;
      if (this.bird.velocity > MAX_FALL_SPEED) {
        this.bird.velocity = MAX_FALL_SPEED;
      }
      this.bird.y += this.bird.velocity;
      this.bird.wingPhase += 0.22;
      this.bird.rotorAngle += 0.5;

      // Angular tilt
      if (this.bird.velocity < 0) {
        this.bird.rotation = Math.max(-0.45, this.bird.velocity * 0.06);
      } else {
        this.bird.rotation = Math.min(1.2, this.bird.rotation + 0.045);
      }

      // Ground & Ceiling Collision
      const groundLimit = CANVAS_HEIGHT - GROUND_HEIGHT - this.bird.radius;
      if (this.bird.y >= groundLimit) {
        this.bird.y = groundLimit;
        if (!this.bird.dead) {
          this.onHitObstacle();
        }
      }

      if (this.bird.y - this.bird.radius <= 0) {
        this.bird.y = this.bird.radius;
        this.bird.velocity = 0;
      }

      if (this.bird.dead) {
        this.updateParticles();
        return;
      }

      // Square thruster exhaust particle trail
      if (this.frameCount % 2 === 0) {
        const skin = SKINS[this.currentSkinIndex];
        this.particles.push({
          x: this.bird.x - 14,
          y: this.bird.y + 4,
          vx: -(Math.random() * 2 + 1),
          vy: Math.random() * 2 - 1,
          size: Math.random() * 4 + 2,
          color: skin.trailColor,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.2,
          alpha: 0.9,
          decay: 0.04
        });
      }

      // Spawn pipes
      if (this.frameCount % PIPE_SPAWN_INTERVAL === 0) {
        this.spawnPipe();
      }

      const currentSpeed = PIPE_SPEED + Math.min(1.3, this.score * 0.04);

      // Update Pipes
      for (let i = this.pipes.length - 1; i >= 0; i--) {
        const p = this.pipes[i];
        p.x -= currentSpeed;

        if (!p.passed && p.x + p.width / 2 < this.bird.x) {
          p.passed = true;
          this.score++;
          this.addFloatingText('+1', this.bird.x, this.bird.y - 24, '#FFE600');
          if (window.soundEngine) window.soundEngine.playScore();
          this.updateHUD();
        }

        if (this.checkPipeCollision(this.bird, p)) {
          this.onHitObstacle();
          break;
        }

        if (p.x + p.width < -30) {
          this.pipes.splice(i, 1);
        }
      }

      // Update Stars
      for (let i = this.orbs.length - 1; i >= 0; i--) {
        const orb = this.orbs[i];
        orb.x -= currentSpeed;
        orb.phase += 0.08;

        const dyHover = Math.sin(orb.phase) * 10;
        const checkY = orb.y + dyHover;

        const dx = this.bird.x - orb.x;
        const dy = this.bird.y - checkY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.bird.radius + orb.radius + 4) {
          this.orbsCollected++;
          this.score += 2;
          this.addFloatingText('+2 STAR', orb.x, checkY - 18, '#FF3366');
          this.addStarCollectParticles(orb.x, checkY);
          if (window.soundEngine) window.soundEngine.playCoin();
          this.orbs.splice(i, 1);
          this.updateHUD();
          continue;
        }

        if (orb.x < -30) {
          this.orbs.splice(i, 1);
        }
      }

      this.updateParticles();
      this.updateFloatingTexts();
    }

    addStarCollectParticles(x, y) {
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5 + 1.5;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: Math.random() * 6 + 3,
          color: '#FFE600',
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.3,
          alpha: 1,
          decay: 0.035
        });
      }
    }

    updateParticles() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot || 0;
        p.alpha -= p.decay;
        if (p.alpha <= 0 || p.size <= 0.5) {
          this.particles.splice(i, 1);
        }
      }
    }

    updateFloatingTexts() {
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.024;
        if (ft.alpha <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }
    }

    checkPipeCollision(bird, pipe) {
      const hitboxRadius = bird.radius * 0.68;

      // Top
      if (
        bird.x + hitboxRadius > pipe.x &&
        bird.x - hitboxRadius < pipe.x + pipe.width &&
        bird.y - hitboxRadius < pipe.topHeight
      ) {
        return true;
      }

      // Bottom
      if (
        bird.x + hitboxRadius > pipe.x &&
        bird.x - hitboxRadius < pipe.x + pipe.width &&
        bird.y + hitboxRadius > pipe.bottomY
      ) {
        return true;
      }

      return false;
    }

    // --- Neo-Brutalist Rendering ---
    draw() {
      const ctx = this.ctx;
      ctx.save();

      // Screen Shake
      if (this.screenShake > 0) {
        const sx = (Math.random() - 0.5) * this.screenShake;
        const sy = (Math.random() - 0.5) * this.screenShake;
        ctx.translate(sx, sy);
      }

      // 1. Solid Neo-Brutalist Sky (Electric Cyan)
      ctx.fillStyle = '#70D6FF';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle technical grid markings in sky
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 40; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT - GROUND_HEIGHT);
        ctx.stroke();
      }
      for (let y = 40; y < CANVAS_HEIGHT - GROUND_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // 2. Bold Graphic Sun
      this.drawBrutalistSun(ctx);

      // 3. Stylized Clouds
      this.drawClouds(ctx);

      // 4. Background Monolith Buildings
      this.drawSkyline(ctx);

      // 5. Brutalist Hazard Pipes
      this.drawPipes(ctx);

      // 6. Collectible Stars
      this.drawStars(ctx);

      // 7. Ground with Hazard Caution Tape
      this.drawGround(ctx);

      // 8. Player Character
      this.drawBird(ctx);

      // 9. Square Confetti Particles
      this.drawParticles(ctx);

      // 10. Comic Book Floating Text Badges
      this.drawFloatingTexts(ctx);

      ctx.restore();
    }

    drawBrutalistSun(ctx) {
      const sunX = 330;
      const sunY = 110;
      const sunR = 42;

      ctx.save();
      // Sun Rays (thick black ink lines)
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + this.frameCount * 0.005;
        const x1 = sunX + Math.cos(angle) * (sunR + 8);
        const y1 = sunY + Math.sin(angle) * (sunR + 8);
        const x2 = sunX + Math.cos(angle) * (sunR + 20);
        const y2 = sunY + Math.sin(angle) * (sunR + 20);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Sun Body (Solid bright yellow, thick black outline)
      ctx.fillStyle = '#FFE600';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sharp sunglasses on the sun for pure neo-brutalist charm
      ctx.fillStyle = '#000000';
      ctx.fillRect(sunX - 26, sunY - 8, 22, 14);
      ctx.fillRect(sunX + 4, sunY - 8, 22, 14);
      ctx.fillRect(sunX - 6, sunY - 4, 12, 4);

      ctx.restore();
    }

    drawClouds(ctx) {
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;

      for (const c of this.clouds) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 0.6, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * 0.5, c.y - c.size * 0.25, c.size * 0.7, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * 1.1, c.y, c.size * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    drawSkyline(ctx) {
      const horizonY = CANVAS_HEIGHT - GROUND_HEIGHT;
      ctx.save();
      ctx.fillStyle = '#C5BDB1';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;

      for (const b of this.buildings) {
        ctx.fillRect(b.x, horizonY - b.height, b.width, b.height);
        ctx.strokeRect(b.x, horizonY - b.height, b.width, b.height);

        // Antenna
        if (b.hasAntenna) {
          ctx.beginPath();
          ctx.moveTo(b.x + b.width / 2, horizonY - b.height);
          ctx.lineTo(b.x + b.width / 2, horizonY - b.height - 18);
          ctx.stroke();

          ctx.fillStyle = '#FF3366';
          ctx.beginPath();
          ctx.arc(b.x + b.width / 2, horizonY - b.height - 18, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#C5BDB1';
        }
      }
      ctx.restore();
    }

    drawPipes(ctx) {
      for (const p of this.pipes) {
        ctx.save();
        // Top Pipe
        this.renderBrutalistPipe(ctx, p.x, 0, p.width, p.topHeight, true);
        // Bottom Pipe
        this.renderBrutalistPipe(ctx, p.x, p.bottomY, p.width, p.bottomHeight, false);
        ctx.restore();
      }
    }

    renderBrutalistPipe(ctx, x, y, width, height, isTop) {
      if (height <= 0) return;

      const collarH = 28;
      const collarW = width + 10;
      const collarX = x - 5;
      const collarY = isTop ? height - collarH : y;

      ctx.save();
      // Main Column: Industrial Concrete Gray
      ctx.fillStyle = '#E2E8F0';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;

      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);

      // Warning Stamp in middle of pipe column if tall enough
      if (height > 120) {
        const labelY = isTop ? y + height / 2 : y + height / 2;
        ctx.fillStyle = '#FFE600';
        ctx.fillRect(x + 10, labelY - 14, width - 20, 26);
        ctx.strokeRect(x + 10, labelY - 14, width - 20, 26);

        ctx.fillStyle = '#000000';
        ctx.font = '900 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠ DANGER', x + width / 2, labelY + 4);
      }

      // Collar (Rim) with Diagonal Caution Hazard Stripes
      ctx.fillStyle = '#FFE600';
      ctx.fillRect(collarX, collarY, collarW, collarH);
      ctx.strokeRect(collarX, collarY, collarW, collarH);

      // Black diagonal hazard stripes on collar
      ctx.save();
      ctx.beginPath();
      ctx.rect(collarX, collarY, collarW, collarH);
      ctx.clip();

      ctx.fillStyle = '#000000';
      const stripeWidth = 12;
      for (let sx = collarX - collarH; sx < collarX + collarW + collarH; sx += stripeWidth * 2) {
        ctx.beginPath();
        ctx.moveTo(sx, collarY + collarH);
        ctx.lineTo(sx + stripeWidth, collarY + collarH);
        ctx.lineTo(sx + stripeWidth + collarH, collarY);
        ctx.lineTo(sx + collarH, collarY);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Border around collar
      ctx.strokeRect(collarX, collarY, collarW, collarH);

      ctx.restore();
    }

    drawStars(ctx) {
      for (const orb of this.orbs) {
        ctx.save();
        const dyHover = Math.sin(orb.phase) * 10;
        ctx.translate(orb.x, orb.y + dyHover);

        // Chunky 5-Point Comic Star
        ctx.fillStyle = '#FFE600';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;

        this.drawStarShape(ctx, 0, 0, 5, orb.radius, orb.radius * 0.5);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }

    drawStarShape(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    }

    drawGround(ctx) {
      const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
      const tapeHeight = 22;

      ctx.save();

      // 1. Hazard Caution Tape on Top Edge
      ctx.fillStyle = '#FFE600';
      ctx.fillRect(0, groundY, CANVAS_WIDTH, tapeHeight);

      // Diagonal black stripes on hazard tape
      const scrollSpeed = this.state === STATE.PLAYING ? PIPE_SPEED : 1.2;
      const offset = (this.frameCount * scrollSpeed) % 24;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, groundY, CANVAS_WIDTH, tapeHeight);
      ctx.clip();

      ctx.fillStyle = '#000000';
      for (let sx = -30 - offset; sx < CANVAS_WIDTH + 30; sx += 24) {
        ctx.beginPath();
        ctx.moveTo(sx, groundY + tapeHeight);
        ctx.lineTo(sx + 12, groundY + tapeHeight);
        ctx.lineTo(sx + 12 + tapeHeight, groundY);
        ctx.lineTo(sx + tapeHeight, groundY);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Thick black dividing line below hazard tape
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, groundY + tapeHeight);
      ctx.lineTo(CANVAS_WIDTH, groundY + tapeHeight);
      ctx.stroke();

      // 2. Industrial Concrete Pavement Below
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, groundY + tapeHeight, CANVAS_WIDTH, GROUND_HEIGHT - tapeHeight);

      // Technical dashed markings
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 16]);
      ctx.beginPath();
      ctx.moveTo(0, groundY + tapeHeight + 25);
      ctx.lineTo(CANVAS_WIDTH, groundY + tapeHeight + 25);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top ground border
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(CANVAS_WIDTH, groundY);
      ctx.stroke();

      ctx.restore();
    }

    drawBird(ctx) {
      const bird = this.bird;
      const skin = SKINS[this.currentSkinIndex];

      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.rotation);

      if (skin.type === 'drone') {
        this.renderDroneSkin(ctx, skin);
      } else if (skin.type === 'phoenix') {
        this.renderPhoenixSkin(ctx, skin, bird.wingPhase);
      } else {
        this.renderChunkyBirdSkin(ctx, skin, bird.wingPhase);
      }

      ctx.restore();
    }

    renderChunkyBirdSkin(ctx, skin, wingPhase) {
      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#000000';

      // 1. Chunky Round Body (Bright Yellow)
      ctx.fillStyle = skin.primaryColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2. Beak (Bold Orange)
      ctx.fillStyle = '#FF6B00';
      ctx.beginPath();
      ctx.moveTo(12, -3);
      ctx.lineTo(24, 0);
      ctx.lineTo(12, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3. Big Cartoon Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(6, -4, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupil (Looking forward)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(8, -4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Eye glint
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(7.5, -5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 4. Animated Wing
      const wingY = Math.sin(wingPhase) * 6;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(-6, 2 + wingY * 0.4, 9, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    renderPhoenixSkin(ctx, skin, wingPhase) {
      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#000000';

      // Hot Pink Body
      ctx.fillStyle = skin.primaryColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spiky Head Crest
      ctx.fillStyle = '#FFE600';
      ctx.beginPath();
      ctx.moveTo(-2, -12);
      ctx.lineTo(6, -22);
      ctx.lineTo(10, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Beak
      ctx.fillStyle = '#FFE600';
      ctx.beginPath();
      ctx.moveTo(12, -3);
      ctx.lineTo(24, 0);
      ctx.lineTo(12, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(6, -4, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(8, -4, 3, 0, Math.PI * 2);
      ctx.fill();

      // Wing
      const wingY = Math.sin(wingPhase) * 7;
      ctx.fillStyle = '#FFE600';
      ctx.beginPath();
      ctx.ellipse(-6, 2 + wingY * 0.4, 10, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    renderDroneSkin(ctx, skin) {
      ctx.save();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#000000';

      // Drone Chassis Box
      ctx.fillStyle = skin.secondaryColor;
      ctx.fillRect(-16, -9, 32, 18);
      ctx.strokeRect(-16, -9, 32, 18);

      // Acid Green Core
      ctx.fillStyle = skin.primaryColor;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rotor Strut
      ctx.beginPath();
      ctx.moveTo(-18, -10);
      ctx.lineTo(18, -10);
      ctx.stroke();

      // Spinning Blades
      const rotorW = Math.cos(this.bird.rotorAngle) * 16;
      ctx.fillStyle = '#FFE600';
      ctx.fillRect(-18 - rotorW / 2, -14, rotorW, 4);
      ctx.strokeRect(-18 - rotorW / 2, -14, rotorW, 4);

      ctx.fillRect(18 - rotorW / 2, -14, rotorW, 4);
      ctx.strokeRect(18 - rotorW / 2, -14, rotorW, 4);

      // Camera Eye
      ctx.fillStyle = '#FF3366';
      ctx.beginPath();
      ctx.arc(14, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    drawParticles(ctx) {
      for (const p of this.particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.globalAlpha = Math.max(0, p.alpha);

        // Chunky Square Particle with Black Border
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);

        ctx.restore();
      }
    }

    drawFloatingTexts(ctx) {
      for (const ft of this.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = '900 16px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';

        const metrics = ctx.measureText(ft.text);
        const padX = 8;
        const padY = 5;
        const boxW = metrics.width + padX * 2;
        const boxH = 22;

        // Comic Badge Box
        ctx.fillStyle = ft.bg || '#FFE600';
        ctx.fillRect(ft.x - boxW / 2, ft.y - 16, boxW, boxH);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(ft.x - boxW / 2, ft.y - 16, boxW, boxH);

        // Black Text
        ctx.fillStyle = '#000000';
        ctx.fillText(ft.text, ft.x, ft.y);

        ctx.restore();
      }
    }

    // --- UI Synchronizer ---
    updateHUD() {
      const scoreVal = document.getElementById('hudScore');
      if (scoreVal) scoreVal.innerText = this.score;

      const orbVal = document.getElementById('hudOrbs');
      if (orbVal) orbVal.innerText = this.orbsCollected;
    }

    updateUI() {
      const startModal = document.getElementById('startModal');
      const gameOverModal = document.getElementById('gameOverModal');
      const pauseModal = document.getElementById('pauseModal');
      const hud = document.getElementById('gameHud');

      if (startModal) startModal.style.display = this.state === STATE.MENU ? 'flex' : 'none';
      if (gameOverModal) gameOverModal.style.display = this.state === STATE.GAMEOVER ? 'flex' : 'none';
      if (pauseModal) pauseModal.style.display = this.state === STATE.PAUSED ? 'flex' : 'none';
      if (hud) hud.style.display = this.state === STATE.PLAYING || this.state === STATE.PAUSED ? 'flex' : 'none';

      const menuBest = document.getElementById('menuBestScore');
      if (menuBest) menuBest.innerText = this.bestScore;

      const finalScore = document.getElementById('finalScore');
      if (finalScore) finalScore.innerText = this.score;

      const finalBest = document.getElementById('finalBestScore');
      if (finalBest) finalBest.innerText = this.bestScore;

      const finalOrbs = document.getElementById('finalOrbs');
      if (finalOrbs) finalOrbs.innerText = this.orbsCollected;

      const newBestTag = document.getElementById('newBestBadge');
      if (newBestTag) {
        newBestTag.style.display = this.isNewHighScore ? 'inline-block' : 'none';
      }

      // Brutalist Rank Roster
      const medalIcon = document.getElementById('medalIcon');
      const medalName = document.getElementById('medalName');
      if (medalIcon && medalName) {
        if (this.score >= 100) {
          medalIcon.innerText = '💀';
          medalName.innerText = 'CONCRETE OVERLORD';
        } else if (this.score >= 50) {
          medalIcon.innerText = '⚡';
          medalName.innerText = 'INDUSTRIAL MASTER';
        } else if (this.score >= 25) {
          medalIcon.innerText = '🔨';
          medalName.innerText = 'STEEL FLAPPER';
        } else if (this.score >= 10) {
          medalIcon.innerText = '📦';
          medalName.innerText = 'BRICK LAYER';
        } else {
          medalIcon.innerText = '🔰';
          medalName.innerText = 'ROOKIE FLAPPER';
        }
      }

      this.updateSkinDisplay();
      this.updateHUD();
    }

    loop(currentTime) {
      this.update();
      this.draw();
      requestAnimationFrame(this.loop.bind(this));
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.brutalFlapGame = new Game();
  });
})();
