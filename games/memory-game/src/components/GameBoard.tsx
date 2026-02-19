import { SimonButton } from "./SimonButton";
import { SimonColor, GameState } from "@/hooks/useSimonGame";

interface GameBoardProps {
  activeColor: SimonColor | null;
  gameState: GameState;
  score: number;
  onColorClick: (color: SimonColor) => void;
}

const BUTTON_CONFIG: { color: SimonColor; position: "top-left" | "top-right" | "bottom-left" | "bottom-right" }[] = [
  { color: "green", position: "top-left" },
  { color: "red", position: "top-right" },
  { color: "yellow", position: "bottom-left" },
  { color: "blue", position: "bottom-right" },
];

export function GameBoard({ activeColor, gameState, score, onColorClick }: GameBoardProps) {
  const isInputPhase = gameState === "input";

  return (
    <div className="relative">
      {/* Outer retro frame */}
      <div className="p-3 sm:p-4 bg-card border-[3px] border-foreground/20 rounded-lg pixel-border">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {BUTTON_CONFIG.map(({ color, position }) => (
            <SimonButton
              key={color}
              color={color}
              position={position}
              isActive={activeColor === color}
              disabled={!isInputPhase}
              onClick={() => onColorClick(color)}
            />
          ))}
        </div>

        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-background border-[3px] border-foreground/30 flex flex-col items-center justify-center">
            <span className="text-[8px] sm:text-[9px] text-muted-foreground font-display uppercase">Score</span>
            <span className="text-xl sm:text-2xl font-display font-bold text-primary text-glow">
              {score}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
