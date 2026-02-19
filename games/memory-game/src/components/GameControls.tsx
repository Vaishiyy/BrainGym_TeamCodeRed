import { Difficulty, GameState } from "@/hooks/useSimonGame";
import { Volume2, VolumeX, RotateCcw, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  gameState: GameState;
  difficulty: Difficulty;
  soundEnabled: boolean;
  highScore: number;
  onStart: () => void;
  onDifficultyChange: (d: Difficulty) => void;
  onSoundToggle: () => void;
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "EASY" },
  { value: "medium", label: "MED" },
  { value: "hard", label: "HARD" },
];

export function GameControls({
  gameState,
  difficulty,
  soundEnabled,
  highScore,
  onStart,
  onDifficultyChange,
  onSoundToggle,
}: GameControlsProps) {
  const isLocked = gameState === "showing";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* High Score */}
      <div className="flex items-center gap-2 text-muted-foreground font-body text-xl">
        <span>HI-SCORE:</span>
        <span className="text-accent font-bold">{String(highScore).padStart(4, "0")}</span>
      </div>

      {/* Difficulty selector */}
      <div className="flex items-center gap-1 border-2 border-foreground/20 bg-card p-1">
        {DIFFICULTIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onDifficultyChange(value)}
            disabled={isLocked}
            className={cn(
              "px-3 py-1 text-xs font-display transition-all duration-100",
              difficulty === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
              isLocked && "opacity-40 cursor-not-allowed"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onStart}
          className={cn(
            "flex items-center gap-2 px-5 py-2 font-display text-[10px] sm:text-xs",
            "border-2 border-primary bg-primary/10 text-primary",
            "hover:bg-primary hover:text-primary-foreground",
            "active:scale-95 transition-all duration-100",
            "shadow-[0_0_10px_hsl(var(--primary)/0.3)]",
            "hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
          )}
        >
          {gameState === "idle" ? (
            <>
              <Play className="w-3 h-3" />
              START
            </>
          ) : (
            <>
              <RotateCcw className="w-3 h-3" />
              RESTART
            </>
          )}
        </button>

        <button
          onClick={onSoundToggle}
          className={cn(
            "p-2 border-2 border-foreground/20 bg-card text-foreground",
            "hover:border-primary hover:text-primary transition-all duration-100"
          )}
          aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Status message */}
      {gameState === "showing" && (
        <p className="text-sm font-body text-primary text-glow tracking-widest animate-pulse">
          ► WATCH THE SEQUENCE...
        </p>
      )}
      {gameState === "input" && (
        <p className="text-sm font-body text-accent tracking-widest">
          ► YOUR TURN!
        </p>
      )}
    </div>
  );
}
