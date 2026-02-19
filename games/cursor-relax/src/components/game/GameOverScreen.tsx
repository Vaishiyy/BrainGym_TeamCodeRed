import { playStartSound, playGameOverSound } from '@/lib/sounds';
import { useEffect } from 'react';

interface GameOverScreenProps {
  score: number;
  maxCombo: number;
  targetsHit: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

const GameOverScreen = ({ score, maxCombo, targetsHit, highScore, isNewHighScore, onRestart }: GameOverScreenProps) => {
  useEffect(() => {
    playGameOverSound();
  }, []);

  const handleRestart = () => {
    playStartSound();
    onRestart();
  };

  return (
    <div className="fixed inset-0 bg-background/95 flex flex-col items-center justify-center z-40">
      <h2 className="font-pixel text-xl md:text-3xl text-foreground text-glow mb-8">
        GAME OVER
      </h2>

      {isNewHighScore && (
        <div className="font-pixel text-[10px] text-foreground text-glow mb-6 animate-pulse">
          ★ NEW HIGH SCORE ★
        </div>
      )}

      <div className="font-pixel text-[9px] md:text-[10px] text-foreground text-glow-sm space-y-3 text-center mb-10">
        <p>SCORE: {score.toLocaleString()}</p>
        <p>MAX COMBO: x{maxCombo}</p>
        <p>TARGETS HIT: {targetsHit}</p>
        <p className="text-muted-foreground">BEST: {highScore.toLocaleString()}</p>
      </div>

      <button
        onClick={handleRestart}
        className="font-pixel text-xs px-8 py-4 pixel-btn text-foreground bg-background"
      >
        [ PLAY AGAIN ]
      </button>

      <div className="crt-scanlines" />
      <div className="crt-vignette" />
    </div>
  );
};

export default GameOverScreen;
