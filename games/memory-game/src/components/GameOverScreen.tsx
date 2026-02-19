import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameOverScreenProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export function GameOverScreen({ score, highScore, isNewHighScore, onRestart }: GameOverScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-6 p-8 bg-card border-[3px] border-destructive/60 pixel-border max-w-sm w-full mx-4">
        {/* CRT scanlines */}
        <div className="absolute inset-0 crt-overlay rounded" />

        <h2 className="text-lg sm:text-xl font-display text-destructive relative z-10"
          style={{ textShadow: "0 0 10px hsl(0 85% 50% / 0.6)" }}>
          GAME OVER
        </h2>

        <div className="flex flex-col items-center gap-2 relative z-10">
          <span className="text-sm text-muted-foreground font-body">FINAL SCORE</span>
          <span className="text-4xl font-display text-foreground">{String(score).padStart(4, "0")}</span>
          {isNewHighScore && (
            <span className="text-xs font-display text-accent animate-pulse mt-1"
              style={{ textShadow: "0 0 8px hsl(50 90% 55% / 0.6)" }}>
              ★ NEW RECORD! ★
            </span>
          )}
        </div>

        <div className="text-sm text-muted-foreground font-body relative z-10">
          BEST: <span className="text-foreground font-bold">{String(highScore).padStart(4, "0")}</span>
        </div>

        <button
          onClick={onRestart}
          className={cn(
            "flex items-center gap-2 px-5 py-2 font-display text-[10px] sm:text-xs relative z-10",
            "border-2 border-primary bg-primary/10 text-primary",
            "hover:bg-primary hover:text-primary-foreground",
            "active:scale-95 transition-all duration-100",
            "shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
          )}
        >
          <RotateCcw className="w-3 h-3" />
          PLAY AGAIN
        </button>

        <p className="text-xs text-muted-foreground font-body relative z-10">
          INSERT COIN TO CONTINUE...
        </p>
      </div>
    </div>
  );
}
