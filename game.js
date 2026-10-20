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

  // --- Neo-Brutalist Environment Themes ---
  const THEMES = [
    {
      id: 'cyan',
      name: 'ELECTRIC CYAN',
      icon: '⚡',
      tagline: 'Classic High-Voltage Neo-Brutal',
      swatches: ['#70D6FF', '#FFE600', '#FF3366', '#E2E8F0'],
      sky: '#70D6FF',
      skyType: 'solid',
      skyGridColor: 'rgba(0, 0, 0, 0.08)',
      hasStars: false,
      celestial: {
        type: 'sunglasses',
        color: '#FFE600',
        accentColor: '#FF6B00',
        rayColor: '#000000',
        size: 42
      },
      clouds: {
        color: '#FFFFFF',
        outline: '#000000'
      },
      skyline: {
        color: '#C5BDB1',
        outline: '#000000',
        antennaLight: '#FF3366',
        windowStyle: 'none'
      },
      pipe: {
        body: '#E2E8F0',
        outline: '#000000',
        badgeBg: '#FFE600',
        badgeText: '⚠ DANGER',
        badgeColor: '#000000',
        collarBg: '#FFE600',
        stripeColor: '#000000'
      },
      ground: {
        tapeBg: '#FFE600',
        stripeColor: '#000000',
        paveColor: '#1E293B',
        dashColor: '#FFFFFF'
      },
      starColor: '#FFE600',
      particles: ['#FFE600', '#FF3366', '#000000', '#FFFFFF', '#00F0FF'],
      cssVars: {
        '--b-bg': '#F4EFE6',
        '--b-device-bg': '#70D6FF',
        '--ticker-bg': '#FFE600',
        '--ticker-text': '#000000',
        '--brand-icon-bg': '#FFE600',
        '--btn-accent': '#00FF66',
        '--body-dot': 'rgba(0, 0, 0, 0.8)',
        '--body-grid': 'rgba(0, 0, 0, 0.05)'
      }
    },
    {
      id: 'cyberpunk',
      name: 'CYBERPUNK NEON',
      icon: '🌆',
      tagline: 'Midnight Synthwave & Neon Lights',
      swatches: ['#0E0824', '#FF007F', '#00F0FF', '#FFE600'],
      sky: '#0E0824',
      skyGradient: ['#0E0824', '#260D45', '#4C1066'],
      skyType: 'gradient',
      skyGridColor: 'rgba(255, 0, 128, 0.25)',
      hasStars: true,
      celestial: {
        type: 'synthwave-sun',
        color: '#FF007F',
        accentColor: '#FFE600',
        rayColor: '#00F0FF',
        size: 46
      },
      clouds: {
        color: '#261447',
        outline: '#00F0FF'
      },
      skyline: {
        color: '#150A2A',
        outline: '#FF007F',
        antennaLight: '#00F0FF',
        windowStyle: 'neon',
        windowColors: ['#00F0FF', '#FFE600', '#FF007F']
      },
      pipe: {
        body: '#180E30',
        outline: '#FF007F',
        badgeBg: '#00F0FF',
        badgeText: '⚡ NEON',
        badgeColor: '#000000',
        collarBg: '#FF007F',
        stripeColor: '#00F0FF'
      },
      ground: {
        tapeBg: '#00F0FF',
        stripeColor: '#FF007F',
        paveColor: '#0D061A',
        dashColor: '#00F0FF'
      },
      starColor: '#00F0FF',
      particles: ['#FF007F', '#00F0FF', '#FFE600', '#FFFFFF', '#9D4EDD'],
      cssVars: {
        '--b-bg': '#0B061A',
        '--b-device-bg': '#0E0824',
        '--ticker-bg': '#FF007F',
        '--ticker-text': '#FFFFFF',
        '--brand-icon-bg': '#00F0FF',
        '--btn-accent': '#00F0FF',
        '--body-dot': '#FF007F',
        '--body-grid': 'rgba(0, 240, 255, 0.12)'
      }
    },
    {
      id: 'toxic',
      name: 'TOXIC WASTELAND',
      icon: '☣',
      tagline: 'Radioactive Slime & Bio-Fallout',
      swatches: ['#1A2510', '#A3E635', '#FACC15', '#22C55E'],
      sky: '#1A2510',
      skyGradient: ['#121C0B', '#243515', '#3A5222'],
      skyType: 'gradient',
      skyGridColor: 'rgba(163, 230, 53, 0.2)',
      hasStars: true,
      celestial: {
        type: 'biohazard',
        color: '#A3E635',
        accentColor: '#FACC15',
        rayColor: '#000000',
        size: 44
      },
      clouds: {
        color: '#34491E',
        outline: '#A3E635'
      },
      skyline: {
        color: '#16220E',
        outline: '#A3E635',
        antennaLight: '#FACC15',
        windowStyle: 'smokestack'
      },
      pipe: {
        body: '#263B18',
        outline: '#A3E635',
        badgeBg: '#A3E635',
        badgeText: '☣ TOXIC',
        badgeColor: '#000000',
        collarBg: '#FACC15',
        stripeColor: '#000000'
      },
      ground: {
        tapeBg: '#A3E635',
        stripeColor: '#000000',
        paveColor: '#0E1708',
        dashColor: '#A3E635'
      },
      starColor: '#A3E635',
      particles: ['#A3E635', '#FACC15', '#000000', '#FFFFFF', '#4ADE80'],
      cssVars: {
        '--b-bg': '#141E0F',
        '--b-device-bg': '#1A2510',
        '--ticker-bg': '#A3E635',
        '--ticker-text': '#000000',
        '--brand-icon-bg': '#A3E635',
        '--btn-accent': '#A3E635',
        '--body-dot': '#A3E635',
        '--body-grid': 'rgba(163, 230, 53, 0.1)'
      }
    },
    {
      id: 'sunset',
      name: 'SUNSET OVERDRIVE',
      icon: '🌅',
      tagline: 'Blazing Tangerine & Electric Pink',
      swatches: ['#FF5E36', '#FF007F', '#FFE600', '#2B0938'],
      sky: '#FF5E36',
      skyGradient: ['#3A0CA3', '#C72C41', '#FF5E36', '#FFB703'],
      skyType: 'gradient',
      skyGridColor: 'rgba(0, 0, 0, 0.12)',
      hasStars: false,
      celestial: {
        type: 'sunset-disc',
        color: '#FFE600',
        accentColor: '#FF5E36',
        rayColor: '#FF007F',
        size: 46
      },
      clouds: {
        color: '#FFDEB9',
        outline: '#2B0938'
      },
      skyline: {
        color: '#2B0938',
        outline: '#FF5E36',
        antennaLight: '#FFE600',
        windowStyle: 'warm'
      },
      pipe: {
        body: '#431247',
        outline: '#000000',
        badgeBg: '#FF007F',
        badgeText: '🔥 HEAT',
        badgeColor: '#FFFFFF',
        collarBg: '#FFE600',
        stripeColor: '#FF007F'
      },
      ground: {
        tapeBg: '#FF5E36',
        stripeColor: '#2B0938',
        paveColor: '#1A0423',
        dashColor: '#FFE600'
      },
      starColor: '#FFE600',
      particles: ['#FF5E36', '#FFE600', '#FF007F', '#FFFFFF', '#3A0CA3'],
      cssVars: {
        '--b-bg': '#FDF2E9',
        '--b-device-bg': '#FF5E36',
        '--ticker-bg': '#FF5E36',
        '--ticker-text': '#FFFFFF',
        '--brand-icon-bg': '#FFE600',
        '--btn-accent': '#FF5E36',
        '--body-dot': '#FF5E36',
        '--body-grid': 'rgba(255, 94, 54, 0.08)'
      }
    },
    {
      id: 'matrix',
      name: 'MATRIX TERMINAL',
      icon: '💻',
      tagline: 'Phosphor Green CRT & Code Rain',
      swatches: ['#040B05', '#00FF66', '#003B15', '#10B981'],
      sky: '#040B05',
      skyType: 'matrix-rain',
      skyGridColor: 'rgba(0, 255, 102, 0.16)',
      hasStars: true,
      celestial: {
        type: 'digital-glyph',
        color: '#00FF66',
        accentColor: '#003B15',
        rayColor: '#00FF66',
        size: 40
      },
      clouds: {
        color: '#081F0E',
        outline: '#00FF66'
      },
      skyline: {
        color: '#051409',
        outline: '#00FF66',
        antennaLight: '#00FF66',
        windowStyle: 'code'
      },
      pipe: {
        body: '#0B2312',
        outline: '#00FF66',
        badgeBg: '#00FF66',
        badgeText: '0xDEAD',
        badgeColor: '#000000',
        collarBg: '#00FF66',
        stripeColor: '#040B05'
      },
      ground: {
        tapeBg: '#00FF66',
        stripeColor: '#040B05',
        paveColor: '#020703',
        dashColor: '#00FF66'
      },
      starColor: '#00FF66',
      particles: ['#00FF66', '#39FF14', '#003B15', '#FFFFFF', '#10B981'],
      cssVars: {
        '--b-bg': '#040A05',
        '--b-device-bg': '#040B05',
        '--ticker-bg': '#00FF66',
        '--ticker-text': '#000000',
        '--brand-icon-bg': '#00FF66',
        '--btn-accent': '#00FF66',
        '--body-dot': '#00FF66',
        '--body-grid': 'rgba(0, 255, 102, 0.12)'
      }
    },
    {
      id: 'noir',
      name: 'NOIR MONOCHROME',
      icon: '🏁',
      tagline: 'Raw Ink Halftone Manga Comic',
      swatches: ['#E5E5E5', '#000000', '#FFFFFF', '#888888'],
      sky: '#E5E5E5',
      skyType: 'halftone',
      skyGridColor: 'rgba(0, 0, 0, 0.15)',
      hasStars: false,
      celestial: {
        type: 'ink-black',
        color: '#000000',
        accentColor: '#FFFFFF',
        rayColor: '#000000',
        size: 44
      },
      clouds: {
        color: '#FFFFFF',
        outline: '#000000'
      },
      skyline: {
        color: '#1A1A1A',
        outline: '#000000',
        antennaLight: '#FFFFFF',
        windowStyle: 'white'
      },
      pipe: {
        body: '#FFFFFF',
        outline: '#000000',
        badgeBg: '#000000',
        badgeText: 'INK NOIR',
        badgeColor: '#FFFFFF',
        collarBg: '#FFFFFF',
        stripeColor: '#000000'
      },
      ground: {
        tapeBg: '#FFFFFF',
        stripeColor: '#000000',
        paveColor: '#000000',
        dashColor: '#FFFFFF'
      },
      starColor: '#FFFFFF',
      particles: ['#000000', '#FFFFFF', '#666666', '#CCCCCC'],
      cssVars: {
        '--b-bg': '#EAEAEA',
        '--b-device-bg': '#E5E5E5',
        '--ticker-bg': '#000000',
        '--ticker-text': '#FFFFFF',
        '--brand-icon-bg': '#000000',
        '--btn-accent': '#000000',
        '--body-dot': '#000000',
        '--body-grid': 'rgba(0, 0, 0, 0.1)'
      }
    },
    {
      id: 'candy',
      name: 'CANDY POP',
      icon: '🍭',
      tagline: 'Pastel Bubblegum & Mint Sweetness',
      swatches: ['#FFA6C9', '#FFE600', '#B5E2FA', '#FF3385'],
      sky: '#FFA6C9',
      skyGradient: ['#FFC2D1', '#FFA6C9', '#FF80BF'],
      skyType: 'gradient',
      skyGridColor: 'rgba(255, 255, 255, 0.4)',
      hasStars: false,
      celestial: {
        type: 'lollipop',
        color: '#FFE600',
        accentColor: '#FF3385',
        rayColor: '#FF3385',
        size: 42
      },
      clouds: {
        color: '#E0F7FA',
        outline: '#FF3385'
      },
      skyline: {
        color: '#D4BBFF',
        outline: '#FF3385',
        antennaLight: '#00F0FF',
        windowStyle: 'pastel'
      },
      pipe: {
        body: '#B5E2FA',
        outline: '#FF3385',
        badgeBg: '#FFE600',
        badgeText: '♥ YUMMY',
        badgeColor: '#000000',
        collarBg: '#FF66B2',
        stripeColor: '#FFFFFF'
      },
      ground: {
        tapeBg: '#FF66B2',
        stripeColor: '#B5E2FA',
        paveColor: '#6A0572',
        dashColor: '#FFE600'
      },
      starColor: '#FFE600',
      particles: ['#FF66B2', '#B5E2FA', '#FFE600', '#FFFFFF', '#D4BBFF'],
      cssVars: {
        '--b-bg': '#FFF0F5',
        '--b-device-bg': '#FFA6C9',
        '--ticker-bg': '#FF66B2',
        '--ticker-text': '#FFFFFF',
        '--brand-icon-bg': '#FF66B2',
        '--btn-accent': '#FF66B2',
        '--body-dot': '#FF66B2',
        '--body-grid': 'rgba(255, 102, 178, 0.1)'
      }
    },
    {
      id: 'inferno',
      name: 'LAVA INFERNO',
      icon: '🌋',
      tagline: 'Volcanic Core & Molten Magma',
      swatches: ['#1C0606', '#FF3B00', '#FFAA00', '#FFE600'],
      sky: '#1C0606',
      skyGradient: ['#120202', '#280707', '#440D0D'],
      skyType: 'embers',
      skyGridColor: 'rgba(255, 69, 0, 0.2)',
      hasStars: true,
      celestial: {
        type: 'magma-core',
        color: '#FF3B00',
        accentColor: '#FFAA00',
        rayColor: '#FFAA00',
        size: 45
      },
      clouds: {
        color: '#341212',
        outline: '#FF4500'
      },
      skyline: {
        color: '#1D0808',
        outline: '#FF3B00',
        antennaLight: '#FFE600',
        windowStyle: 'fire'
      },
      pipe: {
        body: '#2D0D0D',
        outline: '#FF4500',
        badgeBg: '#FF3B00',
        badgeText: '☠ LAVA',
        badgeColor: '#FFFFFF',
        collarBg: '#FF3B00',
        stripeColor: '#FFE600'
      },
      ground: {
        tapeBg: '#FF3B00',
        stripeColor: '#FFE600',
        paveColor: '#0E0303',
        dashColor: '#FF6B00'
      },
      starColor: '#FFAA00',
      particles: ['#FF3B00', '#FFAA00', '#FFE600', '#FFFFFF', '#8B0000'],
      cssVars: {
        '--b-bg': '#140505',
        '--b-device-bg': '#1C0606',
        '--ticker-bg': '#FF3B00',
        '--ticker-text': '#FFFFFF',
        '--brand-icon-bg': '#FF3B00',
        '--btn-accent': '#FF3B00',
        '--body-dot': '#FF3B00',
        '--body-grid': 'rgba(255, 59, 0, 0.14)'
      }
    },
    {
      id: 'gameboy',
      name: 'RETRO GAMEBOY',
      icon: '👾',
      tagline: '1989 Pea-Soup 4-Shade Nostalgia',
      swatches: ['#9BBC0F', '#8BAC0F', '#306230', '#0F380F'],
      sky: '#9BBC0F',
      skyType: 'dither',
      skyGridColor: 'rgba(15, 56, 15, 0.16)',
      hasStars: false,
      celestial: {
        type: 'pixel-sun',
        color: '#8BAC0F',
        accentColor: '#306230',
        rayColor: '#0F380F',
        size: 42
      },
      clouds: {
        color: '#9BBC0F',
        outline: '#0F380F'
      },
      skyline: {
        color: '#306230',
        outline: '#0F380F',
        antennaLight: '#0F380F',
        windowStyle: 'pixel'
      },
      pipe: {
        body: '#8BAC0F',
        outline: '#0F380F',
        badgeBg: '#306230',
        badgeText: 'DMG-01',
        badgeColor: '#9BBC0F',
        collarBg: '#306230',
        stripeColor: '#8BAC0F'
      },
      ground: {
        tapeBg: '#8BAC0F',
        stripeColor: '#0F380F',
        paveColor: '#0F380F',
        dashColor: '#9BBC0F'
      },
      starColor: '#8BAC0F',
      particles: ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
      cssVars: {
        '--b-bg': '#87918B',
        '--b-device-bg': '#9BBC0F',
        '--ticker-bg': '#306230',
        '--ticker-text': '#9BBC0F',
        '--brand-icon-bg': '#8BAC0F',
        '--btn-accent': '#306230',
        '--body-dot': '#0F380F',
        '--body-grid': 'rgba(15, 56, 15, 0.15)'
      }
    },
    {
      id: 'blueprint',
      name: 'ARCHITECT BLUEPRINT',
      icon: '📐',
      tagline: 'Drafting CAD Blue & White Grid',
      swatches: ['#0B3C5D', '#F9BA32', '#FFFFFF', '#1D2731'],
      sky: '#0B3C5D',
      skyType: 'blueprint',
      skyGridColor: 'rgba(255, 255, 255, 0.22)',
      hasStars: false,
      celestial: {
        type: 'compass-rose',
        color: '#1D2731',
        accentColor: '#F9BA32',
        rayColor: '#FFFFFF',
        size: 42
      },
      clouds: {
        color: '#13293D',
        outline: '#FFFFFF'
      },
      skyline: {
        color: '#13293D',
        outline: '#FFFFFF',
        antennaLight: '#F9BA32',
        windowStyle: 'schematic'
      },
      pipe: {
        body: '#1D2731',
        outline: '#FFFFFF',
        badgeBg: '#F9BA32',
        badgeText: 'SPEC.404',
        badgeColor: '#000000',
        collarBg: '#F9BA32',
        stripeColor: '#0B3C5D'
      },
      ground: {
        tapeBg: '#F9BA32',
        stripeColor: '#0B3C5D',
        paveColor: '#081622',
        dashColor: '#FFFFFF'
      },
      starColor: '#F9BA32',
      particles: ['#F9BA32', '#FFFFFF', '#0B3C5D', '#4682B4'],
      cssVars: {
        '--b-bg': '#071E30',
        '--b-device-bg': '#0B3C5D',
        '--ticker-bg': '#F9BA32',
        '--ticker-text': '#000000',
        '--brand-icon-bg': '#F9BA32',
        '--btn-accent': '#F9BA32',
        '--body-dot': '#FFFFFF',
        '--body-grid': 'rgba(255, 255, 255, 0.1)'
      }
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

      // Theme Management
      const savedThemeId = localStorage.getItem('brutalflap_theme_id');
      const foundThemeIdx = THEMES.findIndex(t => t.id === savedThemeId);
      this.currentThemeIndex = foundThemeIdx !== -1 ? foundThemeIdx : 0;

      this.frameCount = 0;
      this.screenShake = 0;
      this.isNewHighScore = false;

      // Shared physics + state contract (consumed by the autopilot agent)
      this.config = {
        CANVAS_WIDTH: CANVAS_WIDTH,
        CANVAS_HEIGHT: CANVAS_HEIGHT,
        GROUND_HEIGHT: GROUND_HEIGHT,
        GRAVITY: GRAVITY,
        JUMP_FORCE: JUMP_FORCE,
        MAX_FALL_SPEED: MAX_FALL_SPEED,
        PIPE_SPEED: PIPE_SPEED,
        HITBOX_SCALE: 0.68
      };
      this.states = STATE;

      // Autopilot agent (agent.js)
      this.agent = window.BrutalFlapAgent ? new window.BrutalFlapAgent(this) : null;

      // Easter egg
      this.easterEggBuffer = '';
      this.easterEggTimer = 0;
      this.easterEggDuration = 150;

      // Entities
      this.bird = null;
      this.pipes = [];
      this.orbs = [];
      this.particles = [];
      this.floatingTexts = [];
      this.clouds = [];
      this.buildings = [];
      this.ambientParticles = [];

      this.initCanvasResolution();
      this.initBackgroundEnvironment();
      this.resetBird();
      this.setupControls();
      this.applyThemeCSS(THEMES[this.currentThemeIndex]);
      this.initThemeGalleryUI();
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
          hasAntenna: Math.random() > 0.5,
          windowCols: Math.floor(Math.random() * 3) + 2,
          windowRows: Math.floor(Math.random() * 5) + 3,
          seed: Math.random()
        });
        curX += width + 6;
      }

      this.initAmbientParticles();
    }

    initAmbientParticles() {
      this.ambientParticles = [];
      const chars = ['0', '1', 'ｱ', 'ｲ', 'ｳ', 'ｴ', 'ｵ', 'ｶ', 'ｷ', 'ｸ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ'];
      for (let i = 0; i < 45; i++) {
        this.ambientParticles.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * (CANVAS_HEIGHT - GROUND_HEIGHT),
          speed: Math.random() * 1.5 + 0.6,
          size: Math.random() * 3.5 + 2,
          char: chars[Math.floor(Math.random() * chars.length)],
          alpha: Math.random() * 0.7 + 0.3,
          flicker: Math.random() * Math.PI * 2,
          flickerSpeed: Math.random() * 0.08 + 0.03
        });
      }
    }

    updateAmbientParticles() {
      const theme = THEMES[this.currentThemeIndex];
      for (const p of this.ambientParticles) {
        p.flicker += p.flickerSpeed;
        if (theme.skyType === 'matrix-rain') {
          p.y += p.speed * 2.8;
          if (p.y > CANVAS_HEIGHT - GROUND_HEIGHT) {
            p.y = -10;
            p.x = Math.random() * CANVAS_WIDTH;
            const chars = ['0', '1', 'ｱ', 'ｲ', 'ｳ', 'ｴ', 'ｵ', 'ｶ', 'ｷ', 'ｸ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ'];
            p.char = chars[Math.floor(Math.random() * chars.length)];
          }
        } else if (theme.skyType === 'embers') {
          p.y -= p.speed * 1.2;
          p.x += Math.sin(p.flicker) * 0.8;
          if (p.y < 0) {
            p.y = CANVAS_HEIGHT - GROUND_HEIGHT;
            p.x = Math.random() * CANVAS_WIDTH;
          }
        }
      }
    }

    applyThemeCSS(theme) {
      if (!theme || !theme.cssVars) return;
      for (const [key, val] of Object.entries(theme.cssVars)) {
        document.documentElement.style.setProperty(key, val);
      }
    }

    setTheme(indexOrId, announce = false) {
      let nextIndex = 0;
      if (typeof indexOrId === 'string') {
        const found = THEMES.findIndex(t => t.id === indexOrId);
        nextIndex = found !== -1 ? found : 0;
      } else {
        nextIndex = (indexOrId + THEMES.length) % THEMES.length;
      }

      this.currentThemeIndex = nextIndex;
      const theme = THEMES[this.currentThemeIndex];
      localStorage.setItem('brutalflap_theme_id', theme.id);

      this.applyThemeCSS(theme);
      this.updateThemeDisplay();

      if (announce) {
        this.addFloatingText(`${theme.icon} ${theme.name}`, CANVAS_WIDTH / 2, 75, theme.pipe.badgeBg);
      }
    }

    cycleTheme(dir, announce = false) {
      this.setTheme(this.currentThemeIndex + dir, announce);
    }

    randomTheme() {
      let randIdx = Math.floor(Math.random() * THEMES.length);
      if (THEMES.length > 1 && randIdx === this.currentThemeIndex) {
        randIdx = (randIdx + 1) % THEMES.length;
      }
      this.setTheme(randIdx, true);
    }

    openThemeModal() {
      const themeModal = document.getElementById('themeModal');
      if (themeModal) {
        themeModal.style.display = 'flex';
        this.updateThemeDisplay();
      }
    }

    closeThemeModal() {
      const themeModal = document.getElementById('themeModal');
      if (themeModal) {
        themeModal.style.display = 'none';
      }
    }

    updateThemeDisplay() {
      const theme = THEMES[this.currentThemeIndex];
      if (!theme) return;

      const navLabel = document.getElementById('navThemeLabel');
      if (navLabel) navLabel.innerText = theme.name;

      const menuThemeIcon = document.getElementById('menuThemeIcon');
      if (menuThemeIcon) menuThemeIcon.innerText = theme.icon;
      const themeNameEl = document.getElementById('themeName');
      if (themeNameEl) themeNameEl.innerText = theme.name;

      const pauseThemeIcon = document.getElementById('pauseThemeIcon');
      if (pauseThemeIcon) pauseThemeIcon.innerText = theme.icon;
      const pauseThemeName = document.getElementById('pauseThemeName');
      if (pauseThemeName) pauseThemeName.innerText = theme.name;

      const overThemeIcon = document.getElementById('overThemeIcon');
      if (overThemeIcon) overThemeIcon.innerText = theme.icon;
      const overThemeName = document.getElementById('overThemeName');
      if (overThemeName) overThemeName.innerText = theme.name;

      const cards = document.querySelectorAll('.theme-card');
      cards.forEach((card, idx) => {
        const isActive = idx === this.currentThemeIndex;
        card.classList.toggle('active', isActive);
        let indicator = card.querySelector('.theme-active-indicator');
        if (isActive && !indicator) {
          indicator = document.createElement('div');
          indicator.className = 'theme-active-indicator';
          indicator.innerText = 'ACTIVE';
          card.appendChild(indicator);
        } else if (!isActive && indicator) {
          indicator.remove();
        }
      });
    }

    initThemeGalleryUI() {
      const grid = document.getElementById('themeGrid');
      if (!grid) return;
      grid.innerHTML = '';

      THEMES.forEach((theme, idx) => {
        const card = document.createElement('div');
        card.className = `theme-card ${idx === this.currentThemeIndex ? 'active' : ''}`;
        card.setAttribute('data-theme-id', theme.id);

        const swatchesHtml = theme.swatches.map(color => 
          `<span class="theme-swatch" style="background-color: ${color};"></span>`
        ).join('');

        card.innerHTML = `
          <div class="theme-card-top">
            <span class="theme-card-icon">${theme.icon}</span>
            <div class="theme-swatches">${swatchesHtml}</div>
          </div>
          <div>
            <div class="theme-card-name">${theme.name}</div>
            <div class="theme-card-tagline">${theme.tagline}</div>
          </div>
          ${idx === this.currentThemeIndex ? '<div class="theme-active-indicator">ACTIVE</div>' : ''}
        `;

        card.addEventListener('click', () => {
          this.setTheme(idx, false);
        });

        grid.appendChild(card);
      });
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
          if (this.handleEasterEggKey(e.key)) {
            e.preventDefault();
            return;
          }
          if (e.code === 'KeyP') {
            this.togglePause();
            e.preventDefault();
            return;
          }
          if (e.code === 'KeyT') {
            this.cycleTheme(1, true);
            e.preventDefault();
            return;
          }
          if (e.code === 'KeyA') {
            this.toggleAgent();
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

      const aiAgentBtn = document.getElementById('aiAgentBtn');
      if (aiAgentBtn) {
        aiAgentBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleAgent();
        });
      }

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

      // Theme Nav & HUD
      const themeNavBtn = document.getElementById('themeNavBtn');
      if (themeNavBtn) themeNavBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openThemeModal();
      });

      const hudThemeBtn = document.getElementById('hudThemeBtn');
      if (hudThemeBtn) hudThemeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleTheme(1, true);
      });

      // Start Menu Theme Picker
      const prevThemeBtn = document.getElementById('prevThemeBtn');
      const nextThemeBtn = document.getElementById('nextThemeBtn');
      const openGalleryFromMenuBtn = document.getElementById('openGalleryFromMenuBtn');
      if (prevThemeBtn) prevThemeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleTheme(-1, false);
      });
      if (nextThemeBtn) nextThemeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleTheme(1, false);
      });
      if (openGalleryFromMenuBtn) openGalleryFromMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openThemeModal();
      });

      // Pause Modal Theme Picker
      const prevPauseThemeBtn = document.getElementById('prevPauseThemeBtn');
      const nextPauseThemeBtn = document.getElementById('nextPauseThemeBtn');
      const openGalleryFromPauseBtn = document.getElementById('openGalleryFromPauseBtn');
      if (prevPauseThemeBtn) prevPauseThemeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleTheme(-1, false);
      });
      if (nextPauseThemeBtn) nextPauseThemeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleTheme(1, false);
      });
      if (openGalleryFromPauseBtn) openGalleryFromPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openThemeModal();
      });

      // Game Over Modal Theme Picker
      const prevOverThemeBtn = document.getElementById('prevOverThemeBtn');
      const nextOverThemeBtn = document.getElementById('nextOverThemeBtn');
      const openGalleryFromOverBtn = document.getElementById('openGalleryFromOverBtn');
      if (prevOverThemeBtn) prevOverThemeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleTheme(-1, false);
      });
      if (nextOverThemeBtn) nextOverThemeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cycleTheme(1, false);
      });
      if (openGalleryFromOverBtn) openGalleryFromOverBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openThemeModal();
      });

      // Gallery Modal Actions
      const closeThemeModalBtn = document.getElementById('closeThemeModalBtn');
      if (closeThemeModalBtn) closeThemeModalBtn.addEventListener('click', () => this.closeThemeModal());

      const doneThemeBtn = document.getElementById('doneThemeBtn');
      if (doneThemeBtn) doneThemeBtn.addEventListener('click', () => this.closeThemeModal());

      const randomThemeBtn = document.getElementById('randomThemeBtn');
      if (randomThemeBtn) randomThemeBtn.addEventListener('click', () => this.randomTheme());

      const themeModal = document.getElementById('themeModal');
      if (themeModal) {
        themeModal.addEventListener('click', (e) => {
          if (e.target === themeModal) this.closeThemeModal();
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

    toggleAgent() {
      if (!this.agent) return;
      const on = this.agent.toggle();

      const aiBtn = document.getElementById('aiAgentBtn');
      if (aiBtn) {
        aiBtn.innerText = on ? '🤖 AI AGENT: ON' : '🤖 AI AGENT: OFF';
        aiBtn.classList.toggle('active', on);
        aiBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    }

    // --- Easter Egg ---
    handleEasterEggKey(key) {
      const EGG = 'VARUN';
      if (!key || key.length !== 1) return false;

      const ch = key.toUpperCase();
      if (!/^[A-Z]$/.test(ch)) return false;

      if (this.easterEggBuffer.length === 0) {
        if (ch !== EGG[0]) return false;
        this.easterEggBuffer = ch;
        return true;
      }

      const next = this.easterEggBuffer + ch;
      if (next === EGG) {
        this.easterEggBuffer = '';
        this.triggerEasterEgg();
        return true;
      }

      if (EGG.startsWith(next)) {
        this.easterEggBuffer = next;
        return true;
      }

      this.easterEggBuffer = '';
      return false;
    }

    triggerEasterEgg() {
      this.easterEggTimer = this.easterEggDuration;

      const x = this.bird ? this.bird.x : CANVAS_WIDTH / 2;
      const y = this.bird ? this.bird.y : CANVAS_HEIGHT / 2;

      this.addFloatingText('VARUN', x, y - 30, '#FFE600');

      for (let i = 0; i < 26; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5 + 2;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: Math.random() * 7 + 3,
          color: i % 2 === 0 ? '#FFE600' : '#FF3366',
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.3,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015
        });
      }

      if (window.soundEngine) {
        window.soundEngine.playCoin();
        window.soundEngine.playScore();
      }
    }

    drawEasterEggStamp(ctx) {
      if (this.easterEggTimer <= 0) return;

      const progress = 1 - this.easterEggTimer / this.easterEggDuration;
      const pop = progress < 0.12 ? progress / 0.12 : 1;
      const fade = this.easterEggTimer < 45 ? this.easterEggTimer / 45 : 1;

      ctx.save();
      ctx.globalAlpha = Math.min(1, fade);
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
      ctx.rotate(-0.07);
      ctx.scale(pop, pop);

      ctx.font = '900 42px "Archivo Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const text = 'VARUN';
      const width = ctx.measureText(text).width + 40;
      const height = 62;

      ctx.fillStyle = '#FFE600';
      ctx.fillRect(-width / 2, -height / 2, width, height);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.strokeRect(-width / 2, -height / 2, width, height);

      ctx.fillStyle = '#000000';
      ctx.fillText(text, 0, 2);

      ctx.restore();
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
      const theme = THEMES[this.currentThemeIndex];
      const colors = (theme && theme.particles) ? theme.particles : ['#FFE600', '#FF3366', '#000000', '#FFFFFF', '#00F0FF'];
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

    getPipeSpeed() {
      return PIPE_SPEED + Math.min(1.3, this.score * 0.04);
    }

    // --- Update Loop ---
    update() {
      this.frameCount++;

      // Autopilot agent acts before the physics step so its decision
      // lands on the very same frame it was made.
      if (this.agent) this.agent.update();

      if (this.easterEggTimer > 0) this.easterEggTimer--;

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

      this.updateAmbientParticles();

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

      const currentSpeed = this.getPipeSpeed();

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
      const theme = THEMES[this.currentThemeIndex] || THEMES[0];
      ctx.save();

      // Screen Shake
      if (this.screenShake > 0) {
        const sx = (Math.random() - 0.5) * this.screenShake;
        const sy = (Math.random() - 0.5) * this.screenShake;
        ctx.translate(sx, sy);
      }

      // 1. Theme-Specific Sky & Atmospheric Grid
      this.drawSky(ctx, theme);

      // 2. Bold Theme-Specific Celestial Body
      this.drawCelestial(ctx, theme);

      // 3. Stylized Clouds
      this.drawClouds(ctx, theme);

      // 4. Background Monolith Buildings & Architecture
      this.drawSkyline(ctx, theme);

      // 5. Brutalist Hazard Pipes with Theme Danger Stamping
      this.drawPipes(ctx, theme);

      // 6. Collectible Stars
      this.drawStars(ctx, theme);

      // 7. Ground with Hazard Caution Tape
      this.drawGround(ctx, theme);

      // 8. Player Character
      this.drawBird(ctx);

      // 9. Square Confetti Particles
      this.drawParticles(ctx);

      // 10. Comic Book Floating Text Badges
      this.drawFloatingTexts(ctx);

      // 11. Easter Egg Stamp
      this.drawEasterEggStamp(ctx);

      ctx.restore();
    }

    drawSky(ctx, theme) {
      const horizonY = CANVAS_HEIGHT - GROUND_HEIGHT;

      // Base Sky Fill / Gradient
      if (theme.skyGradient && theme.skyGradient.length >= 2) {
        const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
        const stops = theme.skyGradient;
        stops.forEach((color, i) => {
          grad.addColorStop(i / (stops.length - 1), color);
        });
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = theme.sky;
      }
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();

      // Atmospheric Pattern Overlays
      if (theme.skyType === 'perspective-grid') {
        ctx.strokeStyle = theme.skyGridColor;
        ctx.lineWidth = 1.5;
        for (let y = 60; y < horizonY; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(CANVAS_WIDTH, y);
          ctx.stroke();
        }
        for (let x = 30; x < CANVAS_WIDTH; x += 35) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, horizonY);
          ctx.stroke();
        }
      } else if (theme.skyType === 'matrix-rain') {
        ctx.strokeStyle = theme.skyGridColor;
        ctx.lineWidth = 1;
        for (let y = 20; y < horizonY; y += 24) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(CANVAS_WIDTH, y);
          ctx.stroke();
        }

        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        for (const p of this.ambientParticles) {
          ctx.fillStyle = `rgba(0, 255, 102, ${p.alpha * 0.85})`;
          ctx.fillText(p.char, p.x, p.y);
        }
      } else if (theme.skyType === 'halftone') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        for (let x = 12; x < CANVAS_WIDTH; x += 20) {
          for (let y = 12; y < horizonY; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (theme.skyType === 'dither') {
        ctx.fillStyle = 'rgba(15, 56, 15, 0.08)';
        for (let x = 0; x < CANVAS_WIDTH; x += 8) {
          for (let y = 0; y < horizonY; y += 8) {
            if ((x / 8 + y / 8) % 2 === 0) {
              ctx.fillRect(x, y, 4, 4);
            }
          }
        }
      } else if (theme.skyType === 'blueprint') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 10; x < CANVAS_WIDTH; x += 10) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, horizonY);
          ctx.stroke();
        }
        for (let y = 10; y < horizonY; y += 10) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(CANVAS_WIDTH, y);
          ctx.stroke();
        }
        ctx.strokeStyle = theme.skyGridColor;
        ctx.lineWidth = 1.5;
        for (let x = 40; x < CANVAS_WIDTH; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, horizonY);
          ctx.stroke();
        }
        for (let y = 40; y < horizonY; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(CANVAS_WIDTH, y);
          ctx.stroke();
        }
      } else if (theme.skyType === 'embers') {
        ctx.strokeStyle = theme.skyGridColor;
        ctx.lineWidth = 1;
        for (let y = 35; y < horizonY; y += 35) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(CANVAS_WIDTH, y);
          ctx.stroke();
        }
        for (const p of this.ambientParticles) {
          ctx.fillStyle = `rgba(255, ${Math.floor(80 + Math.sin(p.flicker) * 70)}, 0, ${p.alpha})`;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      } else {
        ctx.strokeStyle = theme.skyGridColor || 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 40; x < CANVAS_WIDTH; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, horizonY);
          ctx.stroke();
        }
        for (let y = 40; y < horizonY; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(CANVAS_WIDTH, y);
          ctx.stroke();
        }
      }

      // Background shimmering stars for night/space themes
      if (theme.hasStars && theme.skyType !== 'matrix-rain' && theme.skyType !== 'embers') {
        for (const p of this.ambientParticles) {
          const alpha = 0.4 + Math.sin(p.flicker) * 0.35;
          ctx.fillStyle = theme.starColor || '#FFFFFF';
          ctx.globalAlpha = Math.max(0.1, alpha);
          ctx.fillRect(p.x, p.y, p.size, p.size);
          if (p.size > 3.8) {
            ctx.fillRect(p.x - 2, p.y + 1, p.size + 4, 1);
            ctx.fillRect(p.x + 1, p.y - 2, 1, p.size + 4);
          }
        }
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();
    }

    drawCelestial(ctx, theme) {
      const sunX = 330;
      const sunY = 110;
      const c = theme.celestial || { type: 'sunglasses', color: '#FFE600', size: 42, rayColor: '#000000' };
      const sunR = c.size || 42;

      ctx.save();

      if (c.type === 'sunglasses') {
        ctx.strokeStyle = c.rayColor || '#000000';
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

        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.fillRect(sunX - 26, sunY - 8, 22, 14);
        ctx.fillRect(sunX + 4, sunY - 8, 22, 14);
        ctx.fillRect(sunX - 6, sunY - 4, 12, 4);

      } else if (c.type === 'synthwave-sun') {
        const grad = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + sunR);
        grad.addColorStop(0, '#FFE600');
        grad.addColorStop(0.5, '#FF007F');
        grad.addColorStop(1, '#9D4EDD');

        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR + 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = grad;
        ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2);

        ctx.fillStyle = theme.sky;
        for (let y = sunY - 4; y < sunY + sunR; y += 8) {
          const gapH = Math.max(2, (y - sunY) * 0.14 + 2);
          ctx.fillRect(sunX - sunR, y, sunR * 2, gapH);
        }
        ctx.restore();

      } else if (c.type === 'biohazard') {
        ctx.strokeStyle = '#A3E635';
        ctx.lineWidth = 4;
        ctx.fillStyle = c.color;

        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3 + this.frameCount * 0.015;
          const x1 = sunX + Math.cos(angle) * (sunR + 6);
          const y1 = sunY + Math.sin(angle) * (sunR + 6);
          const x2 = sunX + Math.cos(angle) * (sunR + 18);
          const y2 = sunY + Math.sin(angle) * (sunR + 18);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 7, 0, Math.PI * 2);
        ctx.fill();

        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI * 2) / 3 - Math.PI / 2 + this.frameCount * 0.01;
          const bx = sunX + Math.cos(a) * 16;
          const by = sunY + Math.sin(a) * 16;
          ctx.beginPath();
          ctx.arc(bx, by, 9, 0, Math.PI * 2);
          ctx.stroke();
        }

      } else if (c.type === 'digital-glyph') {
        ctx.strokeStyle = '#00FF66';
        ctx.lineWidth = 3.5;
        ctx.fillStyle = '#020C04';

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 + this.frameCount * 0.008;
          const hx = sunX + Math.cos(a) * sunR;
          const hy = sunY + Math.sin(a) * sunR;
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sunX - sunR - 12, sunY);
        ctx.lineTo(sunX + sunR + 12, sunY);
        ctx.moveTo(sunX, sunY - sunR - 12);
        ctx.lineTo(sunX, sunY + sunR + 12);
        ctx.stroke();

        ctx.fillStyle = '#00FF66';
        ctx.fillRect(sunX - 10, sunY - 10, 20, 20);
        ctx.fillStyle = '#040B05';
        ctx.fillRect(sunX - 5, sunY - 5, 10, 10);

      } else if (c.type === 'ink-black') {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI) / 6;
          const length = i % 2 === 0 ? 22 : 12;
          const x1 = sunX + Math.cos(angle) * (sunR + 6);
          const y1 = sunY + Math.sin(angle) * (sunR + 6);
          const x2 = sunX + Math.cos(angle) * (sunR + 6 + length);
          const y2 = sunY + Math.sin(angle) * (sunR + 6 + length);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

      } else if (c.type === 'lollipop') {
        ctx.fillStyle = c.color;
        ctx.strokeStyle = '#FF3385';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        for (let t = 0; t < 18; t += 0.3) {
          const r = t * 2.2;
          const a = t + this.frameCount * 0.03;
          const x = sunX + Math.cos(a) * r;
          const y = sunY + Math.sin(a) * r;
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (c.type === 'magma-core') {
        ctx.strokeStyle = '#FFAA00';
        ctx.lineWidth = 4;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4 + Math.sin(this.frameCount * 0.05 + i) * 0.15;
          const reach = 16 + Math.sin(this.frameCount * 0.08 + i) * 8;
          const x1 = sunX + Math.cos(angle) * (sunR + 4);
          const y1 = sunY + Math.sin(angle) * (sunR + 4);
          const x2 = sunX + Math.cos(angle) * (sunR + reach);
          const y2 = sunY + Math.sin(angle) * (sunR + reach);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        ctx.fillStyle = '#FF3B00';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        ctx.fillStyle = '#FFE600';
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * 0.55, 0, Math.PI * 2);
        ctx.fill();

      } else if (c.type === 'pixel-sun') {
        ctx.fillStyle = c.color;
        ctx.strokeStyle = c.rayColor;
        ctx.lineWidth = 3;

        const s = sunR * 1.6;
        ctx.fillRect(sunX - s / 2, sunY - s / 2, s, s);
        ctx.strokeRect(sunX - s / 2, sunY - s / 2, s, s);

        for (let i = -1; i <= 1; i += 2) {
          ctx.fillRect(sunX + i * (s / 2 + 8) - 4, sunY - 4, 8, 8);
          ctx.fillRect(sunX - 4, sunY + i * (s / 2 + 8) - 4, 8, 8);
        }

      } else if (c.type === 'compass-rose') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * 0.45, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#F9BA32';
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(a) * (sunR + 14), sunY + Math.sin(a) * (sunR + 14));
          ctx.lineTo(sunX + Math.cos(a + 0.3) * (sunR * 0.5), sunY + Math.sin(a + 0.3) * (sunR * 0.5));
          ctx.lineTo(sunX + Math.cos(a - 0.3) * (sunR * 0.5), sunY + Math.sin(a - 0.3) * (sunR * 0.5));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = c.color;
        ctx.strokeStyle = c.rayColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    drawClouds(ctx, theme) {
      ctx.save();
      ctx.fillStyle = theme.clouds.color;
      ctx.strokeStyle = theme.clouds.outline;
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

    drawSkyline(ctx, theme) {
      const horizonY = CANVAS_HEIGHT - GROUND_HEIGHT;
      ctx.save();
      ctx.fillStyle = theme.skyline.color;
      ctx.strokeStyle = theme.skyline.outline;
      ctx.lineWidth = 3;

      for (const b of this.buildings) {
        ctx.fillRect(b.x, horizonY - b.height, b.width, b.height);
        ctx.strokeRect(b.x, horizonY - b.height, b.width, b.height);

        if (theme.skyline.windowStyle === 'neon') {
          const colors = theme.skyline.windowColors || ['#00F0FF', '#FFE600', '#FF007F'];
          const winW = 4;
          const winH = 5;
          for (let wy = horizonY - b.height + 12; wy < horizonY - 14; wy += 14) {
            for (let wx = b.x + 6; wx < b.x + b.width - 6; wx += 9) {
              const colorIdx = Math.floor((b.seed * 10 + wx + wy) % colors.length);
              ctx.fillStyle = colors[colorIdx];
              ctx.fillRect(wx, wy, winW, winH);
            }
          }
          ctx.fillStyle = theme.skyline.color;
        } else if (theme.skyline.windowStyle === 'code') {
          ctx.fillStyle = '#00FF66';
          for (let wy = horizonY - b.height + 10; wy < horizonY - 10; wy += 12) {
            ctx.fillRect(b.x + 5, wy, Math.min(b.width - 10, 14), 2.5);
          }
          ctx.fillStyle = theme.skyline.color;
        } else if (theme.skyline.windowStyle === 'fire') {
          ctx.fillStyle = '#FF5E00';
          for (let wy = horizonY - b.height + 14; wy < horizonY - 12; wy += 16) {
            ctx.fillRect(b.x + 6, wy, b.width - 12, 3);
          }
          ctx.fillStyle = theme.skyline.color;
        } else if (theme.skyline.windowStyle === 'schematic') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(b.x, horizonY - b.height);
          ctx.lineTo(b.x + b.width, horizonY);
          ctx.moveTo(b.x + b.width, horizonY - b.height);
          ctx.lineTo(b.x, horizonY);
          ctx.stroke();
          ctx.strokeStyle = theme.skyline.outline;
          ctx.lineWidth = 3;
        } else if (theme.skyline.windowStyle === 'white') {
          ctx.fillStyle = '#FFFFFF';
          for (let wy = horizonY - b.height + 14; wy < horizonY - 14; wy += 16) {
            ctx.fillRect(b.x + 6, wy, 5, 7);
          }
          ctx.fillStyle = theme.skyline.color;
        } else if (theme.skyline.windowStyle === 'warm') {
          ctx.fillStyle = '#FFE600';
          for (let wy = horizonY - b.height + 12; wy < horizonY - 12; wy += 14) {
            ctx.fillRect(b.x + 6, wy, 6, 6);
          }
          ctx.fillStyle = theme.skyline.color;
        }

        if (b.hasAntenna) {
          ctx.strokeStyle = theme.skyline.outline;
          ctx.beginPath();
          ctx.moveTo(b.x + b.width / 2, horizonY - b.height);
          ctx.lineTo(b.x + b.width / 2, horizonY - b.height - 18);
          ctx.stroke();

          ctx.fillStyle = theme.skyline.antennaLight || '#FF3366';
          ctx.beginPath();
          ctx.arc(b.x + b.width / 2, horizonY - b.height - 18, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = theme.skyline.color;
        }
      }
      ctx.restore();
    }

    drawPipes(ctx, theme) {
      for (const p of this.pipes) {
        ctx.save();
        this.renderBrutalistPipe(ctx, p.x, 0, p.width, p.topHeight, true, theme);
        this.renderBrutalistPipe(ctx, p.x, p.bottomY, p.width, p.bottomHeight, false, theme);
        ctx.restore();
      }
    }

    renderBrutalistPipe(ctx, x, y, width, height, isTop, theme) {
      if (height <= 0) return;

      const collarH = 28;
      const collarW = width + 10;
      const collarX = x - 5;
      const collarY = isTop ? height - collarH : y;
      const pipeCfg = theme.pipe;

      ctx.save();
      ctx.fillStyle = pipeCfg.body;
      ctx.strokeStyle = pipeCfg.outline;
      ctx.lineWidth = 4;

      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);

      if (height > 120) {
        const labelY = y + height / 2;
        ctx.fillStyle = pipeCfg.badgeBg;
        ctx.fillRect(x + 8, labelY - 14, width - 16, 26);
        ctx.strokeRect(x + 8, labelY - 14, width - 16, 26);

        ctx.fillStyle = pipeCfg.badgeColor || '#000000';
        ctx.font = '900 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pipeCfg.badgeText || '⚠ DANGER', x + width / 2, labelY + 4);
      }

      ctx.fillStyle = pipeCfg.collarBg;
      ctx.fillRect(collarX, collarY, collarW, collarH);
      ctx.strokeRect(collarX, collarY, collarW, collarH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(collarX, collarY, collarW, collarH);
      ctx.clip();

      ctx.fillStyle = pipeCfg.stripeColor;
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

      ctx.strokeRect(collarX, collarY, collarW, collarH);
      ctx.restore();
    }

    drawStars(ctx, theme) {
      for (const orb of this.orbs) {
        ctx.save();
        const dyHover = Math.sin(orb.phase) * 10;
        ctx.translate(orb.x, orb.y + dyHover);

        ctx.fillStyle = theme.starColor || '#FFE600';
        ctx.strokeStyle = theme.pipe.outline || '#000000';
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

    drawGround(ctx, theme) {
      const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
      const tapeHeight = 22;
      const gCfg = theme.ground;

      ctx.save();

      ctx.fillStyle = gCfg.tapeBg;
      ctx.fillRect(0, groundY, CANVAS_WIDTH, tapeHeight);

      const scrollSpeed = this.state === STATE.PLAYING ? PIPE_SPEED : 1.2;
      const offset = (this.frameCount * scrollSpeed) % 24;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, groundY, CANVAS_WIDTH, tapeHeight);
      ctx.clip();

      ctx.fillStyle = gCfg.stripeColor;
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

      ctx.strokeStyle = theme.pipe.outline || '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, groundY + tapeHeight);
      ctx.lineTo(CANVAS_WIDTH, groundY + tapeHeight);
      ctx.stroke();

      ctx.fillStyle = gCfg.paveColor;
      ctx.fillRect(0, groundY + tapeHeight, CANVAS_WIDTH, GROUND_HEIGHT - tapeHeight);

      ctx.strokeStyle = gCfg.dashColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 16]);
      ctx.beginPath();
      ctx.moveTo(0, groundY + tapeHeight + 25);
      ctx.lineTo(CANVAS_WIDTH, groundY + tapeHeight + 25);
      ctx.stroke();
      ctx.setLineDash([]);

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
      this.updateThemeDisplay();
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
