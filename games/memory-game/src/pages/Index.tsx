import { useSimonGame } from "@/hooks/useSimonGame";
import { GameBoard } from "@/components/GameBoard";
import { GameControls } from "@/components/GameControls";
import { GameOverScreen } from "@/components/GameOverScreen";
import { useState } from "react";

const Index = () => {
  const game = useSimonGame();
  const [prevHighScore] = useState(game.highScore);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4 gap-6 select-none overflow-hidden">
      {/* CRT scanline overlay */}
      <div className="fixed inset-0 crt-overlay z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center gap-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-display text-primary text-glow leading-relaxed">
            SIMON
          </h1>
          <p className="text-muted-foreground text-lg font-body tracking-[0.3em] uppercase mt-1">
            - Memory Sequence -
          </p>
        </div>

        {/* Round indicator */}
        {(game.gameState === "showing" || game.gameState === "input") && (
          <p className="text-xs font-body text-muted-foreground">
            ROUND {game.sequence.length}
          </p>
        )}

        {/* Game Board */}
        <GameBoard
          activeColor={game.activeColor}
          gameState={game.gameState}
          score={game.score}
          onColorClick={game.handlePlayerInput}
        />

        {/* Controls */}
        <GameControls
          gameState={game.gameState}
          difficulty={game.difficulty}
          soundEnabled={game.soundEnabled}
          highScore={game.highScore}
          onStart={game.startGame}
          onDifficultyChange={game.setDifficulty}
          onSoundToggle={() => game.setSoundEnabled(!game.soundEnabled)}
        />
      </div>

      {/* Game Over Overlay */}
      {game.gameState === "gameover" && (
        <GameOverScreen
          score={game.score}
          highScore={game.highScore}
          isNewHighScore={game.score > prevHighScore}
          onRestart={game.startGame}
        />
      )}
    </div>
  );
};

export default Index;
