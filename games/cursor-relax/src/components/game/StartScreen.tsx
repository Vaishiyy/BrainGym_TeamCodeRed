import { playStartSound } from '@/lib/sounds';

interface StartScreenProps {
  highScore: number;
  onStart: () => void;
}

const StartScreen = ({ highScore, onStart }: StartScreenProps) => {
  const handleStart = () => {
    playStartSound();
    onStart();
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-40 crt-flicker">
      <h1 className="font-pixel text-2xl md:text-4xl text-foreground text-glow mb-2 tracking-wider">
        CURSOR_FX
      </h1>
      <p className="font-pixel text-[8px] md:text-[10px] text-muted-foreground text-glow-sm mb-12">
        A RETRO VISUAL EXPERIENCE
      </p>

      <button
        onClick={handleStart}
        className="font-pixel text-xs md:text-sm px-8 py-4 pixel-btn text-foreground bg-background"
      >
        [ START GAME ]
      </button>

      <div className="mt-12 font-pixel text-[8px] text-muted-foreground text-glow-sm space-y-2 text-center">
        <p>MOVE CURSOR TO CREATE TRAILS</p>
        <p>HIT TARGETS FOR POINTS</p>
        <p>CLICK FOR BURST EFFECTS</p>
      </div>

      {highScore > 0 && (
        <div className="mt-8 font-pixel text-[10px] text-foreground text-glow-sm">
          HIGH SCORE: {highScore.toLocaleString()}
        </div>
      )}

      <div className="crt-scanlines" />
      <div className="crt-vignette" />
    </div>
  );
};

export default StartScreen;
