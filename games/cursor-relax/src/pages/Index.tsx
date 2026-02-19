import { useState, useRef, useCallback } from 'react';
import type { GameState } from '@/lib/gameTypes';
import { useGameEngine } from '@/hooks/useGameEngine';
import StartScreen from '@/components/game/StartScreen';
import GameOverScreen from '@/components/game/GameOverScreen';
import HUD from '@/components/game/HUD';

const INITIAL_STATE: GameState = {
  phase: 'menu',
  score: 0,
  combo: 0,
  maxCombo: 0,
  comboTimer: 0,
  difficulty: 1,
  timeElapsed: 0,
  targetsHit: 0,
  targetsMissed: 0,
  trailIntensity: 2,
};

function getHighScore(): number {
  try {
    return parseInt(localStorage.getItem('cursorfx_highscore') || '0', 10);
  } catch {
    return 0;
  }
}

function setHighScore(score: number) {
  try {
    localStorage.setItem('cursorfx_highscore', String(score));
  } catch {
    // ignore
  }
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [highScore, setHighScoreState] = useState(getHighScore);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  useGameEngine({ canvasRef, gameState, setGameState });

  const handleStart = useCallback(() => {
    setGameState({
      ...INITIAL_STATE,
      phase: 'playing',
      trailIntensity: gameState.trailIntensity,
    });
  }, [gameState.trailIntensity]);

  const handleRestart = useCallback(() => {
    setGameState({
      ...INITIAL_STATE,
      phase: 'playing',
      trailIntensity: gameState.trailIntensity,
    });
  }, [gameState.trailIntensity]);

  const toggleIntensity = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      trailIntensity: (prev.trailIntensity % 3) + 1,
    }));
  }, []);

  // Trigger game over logic when phase changes
  if (gameState.phase === 'gameover') {
    const isNew = gameState.score > highScore;
    if (isNew && highScore !== gameState.score) {
      setHighScore(gameState.score);
      setHighScoreState(gameState.score);
    }
  }

  return (
    <div className="w-screen h-screen bg-background overflow-hidden">
      {/* Game canvas - always rendered */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* CRT overlay - always on */}
      <div className="crt-scanlines" />
      <div className="crt-vignette" />

      {/* Phase screens */}
      {gameState.phase === 'menu' && (
        <StartScreen highScore={highScore} onStart={handleStart} />
      )}

      {gameState.phase === 'playing' && (
        <HUD
          score={gameState.score}
          combo={gameState.combo}
          difficulty={gameState.difficulty}
          trailIntensity={gameState.trailIntensity}
          onToggleIntensity={toggleIntensity}
        />
      )}

      {gameState.phase === 'gameover' && (
        <GameOverScreen
          score={gameState.score}
          maxCombo={gameState.maxCombo}
          targetsHit={gameState.targetsHit}
          highScore={Math.max(highScore, gameState.score)}
          isNewHighScore={gameState.score > getHighScore()}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default Index;
