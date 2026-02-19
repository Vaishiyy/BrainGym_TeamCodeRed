import { useEffect, useCallback } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import CRTOverlay from '@/components/game/CRTOverlay';
import StartMenu from '@/components/game/StartMenu';
import GameHUD from '@/components/game/GameHUD';
import Keypad from '@/components/game/Keypad';
import GameOver from '@/components/game/GameOver';

/**
 * Main game screen - orchestrates all game components and handles keyboard input
 */
const GameScreen = () => {
  const {
    gameState, gameMode, stats, question,
    feedback, pointsEarned,
    startGame, submitAnswer, goToMenu,
  } = useGameEngine();

  /** Keyboard controls: 1-4 for answers, Escape to quit */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState === 'playing' && question && !feedback) {
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 4) {
        submitAnswer(question.choices[keyNum - 1]);
      }
    }
    if (e.key === 'Escape') {
      goToMenu();
    }
  }, [gameState, question, feedback, submitAnswer, goToMenu]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    localStorage.setItem(
      "brainGymGameScore:math-challenge",
      JSON.stringify({
        score: stats.score,
        scoreUnit: "points",
        label: "Score",
        mode: gameMode,
        state: gameState,
        updatedAt: new Date().toISOString()
      })
    );
  }, [stats.score, gameMode, gameState]);

  return (
    <div className="crt-screen min-h-screen bg-background relative overflow-hidden">
      <CRTOverlay />

      {/* Menu */}
      {gameState === 'menu' && <StartMenu onStartGame={startGame} />}

      {/* Active gameplay */}
      {gameState === 'playing' && question && (
        <div className="flex flex-col items-center justify-center min-h-screen py-6 gap-6">
          {/* HUD */}
          <GameHUD stats={stats} mode={gameMode} />

          {/* Expression display */}
          <div className="relative">
            <div
              className={`
                text-center px-8 py-6 border-2 border-border rounded bg-card
                ${feedback === 'correct' ? 'animate-flash-correct border-neon-green' : ''}
                ${feedback === 'wrong' ? 'animate-shake border-neon-red' : ''}
              `}
            >
              <div className="text-[8px] sm:text-[10px] text-muted-foreground mb-3">SOLVE</div>
              <div className="text-2xl sm:text-4xl font-arcade text-foreground text-glow-green">
                {question.expression}
              </div>
              <div className="text-2xl sm:text-4xl font-arcade text-neon-cyan text-glow-cyan mt-1">
                = ?
              </div>
            </div>

            {/* Floating points earned */}
            {feedback === 'correct' && pointsEarned > 0 && (
              <div className="absolute -top-2 right-0 text-xs font-arcade text-neon-yellow text-glow-yellow animate-float-up">
                +{pointsEarned}
              </div>
            )}
          </div>

          {/* Answer choices */}
          <Keypad
            choices={question.choices}
            onSelect={submitAnswer}
            disabled={feedback !== null}
            feedback={feedback}
            correctAnswer={question.answer}
          />

          {/* Quit hint */}
          <button
            onClick={goToMenu}
            className="text-[7px] sm:text-[8px] text-muted-foreground hover:text-foreground transition-colors mt-2"
          >
            [ESC] QUIT
          </button>
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameover' && (
        <GameOver
          stats={stats}
          mode={gameMode}
          onPlayAgain={() => startGame(gameMode)}
          onMenu={goToMenu}
        />
      )}
    </div>
  );
};

export default GameScreen;
