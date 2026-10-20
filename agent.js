/**
 * BRUTAL FLAP // AUTOPILOT AGENT
 * A self-contained AI agent that observes the game world (bird, pillars, stars)
 * and decides when to flap.
 *
 * Architecture: SENSE -> PLAN -> ACT
 * - SENSE: reads bird kinematics and the corridor of the next pillar
 *           (stars spawn in the middle of that corridor, so tracking it
 *           also harvests them).
 * - PLAN:  beam search over candidate action sequences (FLAP / HOLD),
 *          scoring every rollout with tracking, survival and crash costs.
 * - ACT:   commits the winning root action to the game, restarting the run
 *          automatically when it crashes.
 */

(function () {
  'use strict';

  // --- Agent Tuning Constants ---
  const HORIZON = 24;
  const BEAM_WIDTH = 5;
  const CRASH_PENALTY = 20000;
  const TRACK_WEIGHT = 0.02;
  const TRACK_TOLERANCE = 14;
  const MAX_TRACK_ERROR = 160;
  const EDGE_WEIGHT = 60;

  const ACTION = {
    FLAP: 'FLAP',
    HOLD: 'HOLD'
  };

  class FlapAgent {
    constructor(game) {
      this.game = game;
      this.enabled = false;
      this.autoRestart = true;
      this.restartDelay = 45;
      this.restartTimer = 0;
      this.horizon = HORIZON;
      this.beamWidth = BEAM_WIDTH;
      this.flaps = 0;
      this.decisions = 0;
      this.lastAction = ACTION.HOLD;
    }

    // --- Public API ---

    toggle() {
      this.enabled = !this.enabled;
      this.restartTimer = 0;
      this.flaps = 0;
      this.decisions = 0;

      if (this.enabled && this.game.state === this.game.states.MENU) {
        this.game.startNewGame();
      }

      return this.enabled;
    }

    update() {
      if (!this.enabled) return;

      const game = this.game;
      const states = game.states;

      if (game.state === states.GAMEOVER) {
        if (!this.autoRestart) return;
        this.restartTimer++;
        if (this.restartTimer >= this.restartDelay) {
          this.restartTimer = 0;
          game.startNewGame();
        }
        return;
      }

      this.restartTimer = 0;

      if (game.state !== states.PLAYING) return;

      const bird = game.bird;
      if (!bird || bird.dead) return;

      const action = this.decide();
      this.decisions++;
      this.lastAction = action;

      if (action === ACTION.FLAP) {
        this.flaps++;
        game.flap();
      }
    }

    // --- Planning ---

    decide() {
      const hold = this.rollout(false);
      const flap = this.rollout(true);

      if (this.isBetter(flap, hold)) return ACTION.FLAP;
      return ACTION.HOLD;
    }

    /**
     * Beam search over action sequences starting with the forced root action.
     * Returns the best outcome: { cost, crashed, survived }.
     */
    rollout(forceFlap) {
      const bird = this.game.bird;
      let beam = [{ y: bird.y, v: bird.velocity, cost: 0 }];
      let best = null;

      for (let t = 0; t < this.horizon; t++) {
        const next = [];
        const actions = t === 0 ? [forceFlap] : [false, true];

        for (const state of beam) {
          for (const action of actions) {
            const step = this.step(state.y, state.v, t, action);
            const cost = state.cost + step.cost;

            if (step.crashed) {
              const result = { cost: cost + CRASH_PENALTY, crashed: true, survived: t + 1 };
              if (this.isBetter(result, best)) best = result;
            } else {
              next.push({ y: step.y, v: step.v, cost: cost });
            }
          }
        }

        if (next.length === 0) {
          beam = [];
          break;
        }

        next.sort((a, b) => a.cost - b.cost);
        beam = next.slice(0, this.beamWidth);
      }

      if (beam.length > 0) {
        const survivor = { cost: beam[0].cost, crashed: false, survived: this.horizon };
        if (this.isBetter(survivor, best)) best = survivor;
      }

      return best || { cost: 0, crashed: true, survived: 0 };
    }

    /**
     * Simulates a single frame of the world with the given action applied.
     * Mirrors the engine physics exactly: flap sets velocity, then gravity
     * is applied, then the position is integrated.
     */
    step(y, v, t, flap) {
      const game = this.game;
      const cfg = game.config;
      const bird = game.bird;
      const hitbox = bird.radius * cfg.HITBOX_SCALE;
      const speed = game.getPipeSpeed();

      if (flap) v = cfg.JUMP_FORCE;

      v += cfg.GRAVITY;
      if (v > cfg.MAX_FALL_SPEED) v = cfg.MAX_FALL_SPEED;
      y += v;

      let crashed = false;

      // Ground is fatal, ceiling only clamps.
      if (y + hitbox >= cfg.CANVAS_HEIGHT - cfg.GROUND_HEIGHT) {
        y = cfg.CANVAS_HEIGHT - cfg.GROUND_HEIGHT - hitbox;
        crashed = true;
      }
      if (y - hitbox <= 0) {
        y = hitbox;
        v = 0;
      }

      // Track the nearest pillar that has not been fully cleared yet.
      let target = this.cruiseAltitude();
      let corridorTop = -Infinity;
      let corridorBottom = Infinity;
      const pipes = game.pipes;
      for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];
        const px = p.x - speed * (t + 1);
        if (px + p.width < bird.x - hitbox) continue;

        if (bird.x + hitbox > px && bird.x - hitbox < px + p.width) {
          if (y - hitbox < p.topHeight || y + hitbox > p.bottomY) {
            crashed = true;
            break;
          }
        }

        corridorTop = p.topHeight + hitbox;
        corridorBottom = p.bottomY - hitbox;
        target = (corridorTop + corridorBottom) / 2;
        break;
      }

      let cost = 0;

      // Safety first: stay inside the gap corridor of the next pillar.
      if (y < corridorTop) cost += EDGE_WEIGHT * (corridorTop - y);
      else if (y > corridorBottom) cost += EDGE_WEIGHT * (y - corridorBottom);

      // Then track the middle of the gap (that is also where stars spawn).
      const deviation = Math.min(Math.abs(y - target), MAX_TRACK_ERROR) - TRACK_TOLERANCE;
      if (deviation > 0) cost += TRACK_WEIGHT * deviation * deviation;

      return { y: y, v: v, cost: cost, crashed: crashed };
    }

    cruiseAltitude() {
      return this.game.config.CANVAS_HEIGHT / 2 - 60;
    }

    /**
     * Ranking: surviving beats crashing, then surviving longer beats dying
     * sooner, then lower tracking cost wins. Ties keep the current choice,
     * so the agent never flaps without a reason.
     */
    isBetter(a, b) {
      if (!a) return false;
      if (!b) return true;
      if (a.crashed !== b.crashed) return b.crashed;
      if (a.survived !== b.survived) return a.survived > b.survived;
      return a.cost < b.cost;
    }
  }

  window.BrutalFlapAgent = FlapAgent;
})();
