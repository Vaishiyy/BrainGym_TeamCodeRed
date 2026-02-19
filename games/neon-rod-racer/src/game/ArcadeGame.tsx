import { useRef, useState, useCallback, useEffect } from 'react';
import { useGameLoop } from './useGameLoop';
import { render } from './renderer';
import {
  GameState, Rod, CANVAS_W, CANVAS_H, BALL_R, ROD_H,
  BALL_SPEED, ROD_SPACING, MOVE_SPEED, getLevelConfig,
} from './types';

const INITIAL_SAFE_SPACE = 180;

function createInitialState(): GameState {
  const cfg = getLevelConfig(1);
  const rods: Rod[] = [];
  for (let i = 0; i < 5; i++) {
    rods.push({
      y: CANVAS_H - INITIAL_SAFE_SPACE - ROD_SPACING * (i + 1),
      gapX: Math.random() * (CANVAS_W - cfg.gapWidth),
      gapWidth: cfg.gapWidth,
      speed: cfg.rodSpeed * (Math.random() > 0.5 ? 1 : -1),
      direction: 1,
      passed: false,
    });
  }

  return {
    ballX: CANVAS_W / 2,
    ballY: CANVAS_H - 40,
    rods,
    score: 0,
    level: 1,
    gameOver: false,
    shakeTimer: 0,
  };
}

export default function ArcadeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const moveDir = useRef<number>(0);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [bestScore, setBestScore] = useState(() => {
    const s = localStorage.getItem('arcade-best');
    return s ? parseInt(s, 10) : 0;
  });
  const [displayScore, setDisplayScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const flashRef = useRef(true);
  const touchStart = useRef<number | null>(null);

  const restart = useCallback(() => {
    stateRef.current = createInitialState();
    moveDir.current = 0;
    setRunning(true);
    setGameOver(false);
    setDisplayScore(0);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveDir.current = -1;
      if (e.key === 'ArrowRight') moveDir.current = 1;
      if (e.key === 'Enter' && stateRef.current.gameOver) restart();
    };

    const up = (e: KeyboardEvent) => {
      if (
        (e.key === 'ArrowLeft' && moveDir.current === -1) ||
        (e.key === 'ArrowRight' && moveDir.current === 1)
      ) {
        moveDir.current = 0;
      }
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [restart]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (stateRef.current.gameOver) {
      restart();
      return;
    }
    touchStart.current = e.touches[0].clientX;
  }, [restart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.touches[0].clientX - touchStart.current;
    moveDir.current = diff > 10 ? 1 : diff < -10 ? -1 : 0;
  }, []);

  const onTouchEnd = useCallback(() => {
    touchStart.current = null;
    moveDir.current = 0;
  }, []);

  useEffect(() => {
    if (!gameOver) return;
    const id = setInterval(() => {
      flashRef.current = !flashRef.current;
    }, 400);
    return () => clearInterval(id);
  }, [gameOver]);

  useEffect(() => {
    localStorage.setItem(
      "brainGymGameScore:neon-rod-racer",
      JSON.stringify({
        score: displayScore,
        scoreUnit: "points",
        label: "Score",
        state: gameOver ? "gameover" : started ? "playing" : "idle",
        updatedAt: new Date().toISOString()
      })
    );
  }, [displayScore, gameOver, started]);

  useGameLoop((dt) => {
    const s = stateRef.current;

    if (s.gameOver) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) render(ctx, s, flashRef.current);
      return;
    }

    const cfg = getLevelConfig(s.level);

    s.ballX += moveDir.current * MOVE_SPEED * dt;
    s.ballX = Math.max(BALL_R, Math.min(CANVAS_W - BALL_R, s.ballX));

    s.ballY -= BALL_SPEED * dt;

    for (const rod of s.rods) {
      rod.gapX += rod.speed * dt;
      if (rod.gapX <= 0) {
        rod.gapX = 0;
        rod.speed = Math.abs(rod.speed);
      }
      if (rod.gapX + rod.gapWidth >= CANVAS_W) {
        rod.gapX = CANVAS_W - rod.gapWidth;
        rod.speed = -Math.abs(rod.speed);
      }

      if (!rod.passed && s.ballY - BALL_R < rod.y + ROD_H && s.ballY + BALL_R > rod.y) {
        const inGap = s.ballX - BALL_R >= rod.gapX && s.ballX + BALL_R <= rod.gapX + rod.gapWidth;
        if (inGap) {
          rod.passed = true;
          s.score++;
          if (s.score >= cfg.scoreToAdvance) s.level++;
        } else {
          s.gameOver = true;
          if (s.score > bestScore) {
            setBestScore(s.score);
            localStorage.setItem('arcade-best', String(s.score));
          }
          setGameOver(true);
        }
      }
    }

    const newCfg = getLevelConfig(s.level);
    for (let i = 0; i < s.rods.length; i++) {
      if (s.rods[i].y > s.ballY + CANVAS_H * 0.6) {
        const topRod = s.rods.reduce((a, b) => (a.y < b.y ? a : b));
        s.rods[i] = {
          y: topRod.y - ROD_SPACING,
          gapX: Math.random() * (CANVAS_W - newCfg.gapWidth),
          gapWidth: newCfg.gapWidth,
          speed: newCfg.rodSpeed * (Math.random() > 0.5 ? 1 : -1),
          direction: 1,
          passed: false,
        };
      }
    }

    const targetY = CANVAS_H * 0.7;
    if (s.ballY < targetY) {
      const shift = targetY - s.ballY;
      s.ballY = targetY;
      for (const rod of s.rods) rod.y += shift;
    }

    setDisplayScore(s.score);

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) render(ctx, s, flashRef.current);
  }, running);

  const handleStart = useCallback(() => {
    stateRef.current = createInitialState();
    moveDir.current = 0;
    setStarted(true);
    setRunning(true);
    setGameOver(false);
    setDisplayScore(0);
  }, []);

  if (!started) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden select-none" style={{ backgroundColor: '#1A1A1A' }}>
        <h1 className="maze-title mb-6 text-5xl" style={{ color: '#FFFFFF' }}>
          BLOCK SLIDE
        </h1>
        <p className="mb-10 text-sm" style={{ color: '#D4D4D4', fontFamily: '"Press Start 2P", monospace' }}>
          BEST: {bestScore}
        </p>
        <button
          onClick={handleStart}
          className="px-10 py-4 text-base font-bold rounded transition-all duration-200"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            color: '#FFFFFF',
            backgroundColor: 'transparent',
            border: '2px solid #FFFFFF',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.color = '#1A1A1A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#FFFFFF';
          }}
        >
          START
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden select-none">
      <aside
        className="hidden h-full w-[360px] flex-col border-r-2 p-6 md:flex"
        style={{ borderColor: '#1F1F1F', backgroundColor: '#E9E9E9' }}
      >
        <h1
          className="maze-title text-5xl"
          style={{
            color: '#fefefe',
            fontWeight: 900,
            WebkitTextStroke: '3px #111111',
            textShadow: '3px 3px 0 #00a2ff, 6px 6px 0 #000000',
          }}
        >
          BLOCK SLIDE
        </h1>
        <p className="mt-6 text-sm" style={{ color: '#444444' }}>BEST: {bestScore}</p>
        <p className="mt-4 text-xs" style={{ color: '#666666', lineHeight: 1.9 }}>
          Move left and right to pass through gaps.
          <br />
          Press Enter after game over to restart.
        </p>
        <div className="mt-6 text-xs" style={{ color: '#666666' }}>
          LEFT / RIGHT MOVE
        </div>
      </aside>

      <main className="flex h-full flex-1 flex-col items-center justify-center px-3 py-2">
        <div className="mb-2 text-center md:hidden">
          <h1
            className="maze-title text-4xl"
            style={{
              color: '#fefefe',
              fontWeight: 900,
              WebkitTextStroke: '2.5px #111111',
              textShadow: '2px 2px 0 #00a2ff, 5px 5px 0 #000000',
            }}
          >
            BLOCK SLIDE
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#666666' }}>BEST: {bestScore}</p>
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-sm"
          style={{
            border: '2px solid #1F1F1F',
            backgroundColor: '#FFFFFF',
            width: 'auto',
            height: 'min(78vh, 680px)',
            maxWidth: 'min(88vw, 460px)',
          }}
          onClick={() => {
            if (stateRef.current.gameOver) restart();
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
        <div className="mt-2 text-xs md:hidden" style={{ color: '#666666' }}>
          LEFT / RIGHT MOVE
        </div>
      </main>
    </div>
  );
}
