import { useRef, useEffect, useCallback } from 'react';
import type { Particle, Target, GameState, CursorState } from '@/lib/gameTypes';
import { playHitSound, playMissSound, playComboSound } from '@/lib/sounds';

// Game constants
const TARGET_SPAWN_BASE = 3000; // ms between spawns at level 1
const TARGET_LIFE = 4000; // ms targets live
const COMBO_TIMEOUT = 2000; // ms to maintain combo
const DIFFICULTY_INTERVAL = 15000; // ms between difficulty increases
const GAME_OVER_MISSES = 10; // misses to end game
const PARTICLE_LIMIT = 500;
const TARGET_RAINBOW_COLORS = [
  '#ff003c',
  '#ff6a00',
  '#ffd400',
  '#2ee600',
  '#00d5ff',
  '#0066ff',
  '#7a00ff',
  '#ff00c8',
];

interface UseGameEngineProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export function useGameEngine({ canvasRef, gameState, setGameState }: UseGameEngineProps) {
  const particlesRef = useRef<Particle[]>([]);
  const targetsRef = useRef<Target[]>([]);
  const cursorRef = useRef<CursorState>({ x: 0, y: 0, prevX: 0, prevY: 0, speed: 0, isDown: false });
  const lastFrameRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const animFrameRef = useRef(0);
  const gameStateRef = useRef(gameState);

  // Keep ref in sync
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Spawn particles based on cursor motion
  const spawnParticles = useCallback((cursor: CursorState, intensity: number) => {
    const particles = particlesRef.current;
    if (particles.length > PARTICLE_LIMIT) return;

    const speed = cursor.speed;
    const count = Math.min(Math.ceil(speed / 8) * intensity, 12);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = Math.random() * 2 + 0.5;
      const isStreak = speed > 12;

      particles.push({
        x: cursor.x + (Math.random() - 0.5) * 4,
        y: cursor.y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * vel + (cursor.x - cursor.prevX) * 0.3,
        vy: Math.sin(angle) * vel + (cursor.y - cursor.prevY) * 0.3,
        life: isStreak ? 600 + Math.random() * 400 : 300 + Math.random() * 300,
        maxLife: isStreak ? 800 : 500,
        size: isStreak ? 2 + Math.random() * 2 : 1 + Math.random() * 2,
        type: isStreak ? 'streak' : 'dot',
      });
    }
  }, []);

  // Spawn burst on click
  const spawnBurst = useCallback((x: number, y: number, intensity: number) => {
    const particles = particlesRef.current;
    const count = 20 * intensity;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const vel = 3 + Math.random() * 5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        life: 500 + Math.random() * 500,
        maxLife: 800,
        size: 2 + Math.random() * 3,
        type: 'burst',
      });
    }
  }, []);

  // Check cursor-target collision using trail
  const checkHits = useCallback((cursor: CursorState) => {
    const targets = targetsRef.current;
    const state = gameStateRef.current;

    targets.forEach(target => {
      if (target.hit) return;
      const dx = cursor.x - target.x;
      const dy = cursor.y - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Hit if cursor trail is close enough
      if (dist < target.radius + 15 && cursor.speed > 3) {
        target.hit = true;
        const newCombo = state.combo + 1;
        const points = 100 * newCombo * state.difficulty;

        playHitSound();
        if (newCombo > 1) playComboSound(newCombo);

        // Burst on hit
        spawnBurst(target.x, target.y, state.trailIntensity);

        setGameState(prev => ({
          ...prev,
          score: prev.score + points,
          combo: newCombo,
          maxCombo: Math.max(prev.maxCombo, newCombo),
          comboTimer: COMBO_TIMEOUT,
          targetsHit: prev.targetsHit + 1,
        }));
      }
    });
  }, [setGameState, spawnBurst]);

  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    if (state.phase !== 'playing') return;

    const dt = lastFrameRef.current ? timestamp - lastFrameRef.current : 16;
    lastFrameRef.current = timestamp;

    // Resize canvas
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    // Clear
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update combo timer
    setGameState(prev => {
      let newCombo = prev.combo;
      let newComboTimer = prev.comboTimer - dt;
      if (newComboTimer <= 0 && newCombo > 0) {
        newCombo = 0;
        newComboTimer = 0;
      }
      const newTime = prev.timeElapsed + dt;
      const newDifficulty = Math.min(10, 1 + Math.floor(newTime / DIFFICULTY_INTERVAL));

      return {
        ...prev,
        comboTimer: newComboTimer,
        combo: newCombo,
        timeElapsed: newTime,
        difficulty: newDifficulty,
      };
    });

    // Spawn targets
    const spawnInterval = TARGET_SPAWN_BASE / state.difficulty;
    if (timestamp - lastSpawnRef.current > spawnInterval) {
      lastSpawnRef.current = timestamp;
      const margin = 80;
      targetsRef.current.push({
        x: margin + Math.random() * (canvas.width - margin * 2),
        y: margin + Math.random() * (canvas.height - margin * 2),
        radius: 20 + Math.random() * 15,
        life: TARGET_LIFE,
        maxLife: TARGET_LIFE,
        hit: false,
        pulsePhase: Math.random() * Math.PI * 2,
        color: TARGET_RAINBOW_COLORS[Math.floor(Math.random() * TARGET_RAINBOW_COLORS.length)],
      });
    }

    // Update + draw targets
    const targets = targetsRef.current;
    for (let i = targets.length - 1; i >= 0; i--) {
      const t = targets[i];
      t.life -= dt;
      t.pulsePhase += dt * 0.005;

      if (t.hit || t.life <= 0) {
        if (!t.hit && t.life <= 0) {
          // Missed
          playMissSound();
          setGameState(prev => {
            const newMissed = prev.targetsMissed + 1;
            if (newMissed >= GAME_OVER_MISSES) {
              return { ...prev, targetsMissed: newMissed, phase: 'gameover' };
            }
            return { ...prev, targetsMissed: newMissed, combo: 0 };
          });
        }
        targets.splice(i, 1);
        continue;
      }

      // Draw target
      const pulse = Math.sin(t.pulsePhase) * 0.3 + 0.7;
      const alpha = Math.min(1, t.life / 500) * pulse;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = t.color;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 18;

      // Crosshair style
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Solid center core makes targets pop on bright backgrounds.
      ctx.globalAlpha = alpha * 0.35;
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;

      // Cross lines
      const len = t.radius + 8;
      ctx.beginPath();
      ctx.moveTo(t.x - len, t.y);
      ctx.lineTo(t.x - t.radius * 0.6, t.y);
      ctx.moveTo(t.x + t.radius * 0.6, t.y);
      ctx.lineTo(t.x + len, t.y);
      ctx.moveTo(t.x, t.y - len);
      ctx.lineTo(t.x, t.y - t.radius * 0.6);
      ctx.moveTo(t.x, t.y + t.radius * 0.6);
      ctx.lineTo(t.x, t.y + len);
      ctx.stroke();

      // Life bar
      const barWidth = t.radius * 2;
      const barHeight = 4;
      const barX = t.x - barWidth / 2;
      const barY = t.y + t.radius + 12;
      const lifeRatio = t.life / t.maxLife;
      ctx.fillStyle = t.color;
      ctx.strokeStyle = t.color;
      ctx.fillRect(barX, barY, barWidth * lifeRatio, barHeight);
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      ctx.restore();
    }

    // Spawn particles from cursor
    const cursor = cursorRef.current;
    if (cursor.speed > 1) {
      spawnParticles(cursor, state.trailIntensity);
      checkHits(cursor);
    }

    // Update + draw particles
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;

      const alpha = p.life / p.maxLife;
      const rainbowHue = (timestamp * 0.08 + p.x * 0.2 + p.y * 0.1) % 360;
      const rainbowColor = `hsl(${rainbowHue}, 95%, 55%)`;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = rainbowColor;
      ctx.shadowColor = rainbowColor;
      ctx.shadowBlur = p.type === 'burst' ? 12 : 6;

      if (p.type === 'streak') {
        // Draw as line
        ctx.strokeStyle = rainbowColor;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
        ctx.stroke();
      } else {
        ctx.fillRect(
          Math.floor(p.x - p.size / 2),
          Math.floor(p.y - p.size / 2),
          Math.ceil(p.size),
          Math.ceil(p.size)
        );
      }
      ctx.restore();
    }

    // Draw custom cursor
    ctx.save();
    const cursorHue = (timestamp * 0.15) % 360;
    const cursorGradient = ctx.createLinearGradient(cursor.x - 12, cursor.y - 12, cursor.x + 12, cursor.y + 12);
    cursorGradient.addColorStop(0, `hsl(${cursorHue}, 95%, 55%)`);
    cursorGradient.addColorStop(0.5, `hsl(${(cursorHue + 120) % 360}, 95%, 55%)`);
    cursorGradient.addColorStop(1, `hsl(${(cursorHue + 240) % 360}, 95%, 55%)`);
    ctx.strokeStyle = cursorGradient;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = `hsl(${cursorHue}, 95%, 55%)`;
    ctx.shadowBlur = 8;
    const cx = cursor.x;
    const cy = cursor.y;
    const cs = 8;
    ctx.beginPath();
    ctx.moveTo(cx - cs, cy);
    ctx.lineTo(cx + cs, cy);
    ctx.moveTo(cx, cy - cs);
    ctx.lineTo(cx, cy + cs);
    ctx.stroke();
    // Center dot
    ctx.fillStyle = `hsl(${(cursorHue + 180) % 360}, 95%, 55%)`;
    ctx.fillRect(cx - 1, cy - 1, 2, 2);
    ctx.restore();

    // Misses indicator
    const state2 = gameStateRef.current;
    if (state2.targetsMissed > 0) {
      ctx.save();
      ctx.font = "10px 'Press Start 2P'";
      ctx.fillStyle = '#1d4ed8';
      ctx.globalAlpha = 0.6;
      ctx.shadowColor = '#1d4ed8';
      ctx.shadowBlur = 4;
      ctx.fillText(
        `MISS: ${'█'.repeat(state2.targetsMissed)}${'░'.repeat(GAME_OVER_MISSES - state2.targetsMissed)}`,
        16,
        canvas.height - 20
      );
      ctx.restore();
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [canvasRef, setGameState, spawnParticles, checkHits]);

  // Mouse handlers
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const cursor = cursorRef.current;
      cursor.prevX = cursor.x;
      cursor.prevY = cursor.y;
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      cursor.speed = Math.sqrt(
        (cursor.x - cursor.prevX) ** 2 + (cursor.y - cursor.prevY) ** 2
      );
    };

    const handleDown = (e: MouseEvent) => {
      cursorRef.current.isDown = true;
      if (gameStateRef.current.phase === 'playing') {
        spawnBurst(e.clientX, e.clientY, gameStateRef.current.trailIntensity);
      }
    };

    const handleUp = () => {
      cursorRef.current.isDown = false;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [spawnBurst]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState.phase === 'playing') {
      lastFrameRef.current = 0;
      lastSpawnRef.current = performance.now();
      particlesRef.current = [];
      targetsRef.current = [];
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gameState.phase, gameLoop]);
}
