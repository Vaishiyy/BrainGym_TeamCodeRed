interface HUDProps {
  score: number;
  combo: number;
  difficulty: number;
  trailIntensity: number;
  onToggleIntensity: () => void;
}

const HUD = ({ score, combo, difficulty, trailIntensity, onToggleIntensity }: HUDProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex justify-between items-start p-4">
        {/* Score */}
        <div className="font-pixel text-[10px] text-foreground text-glow-sm">
          <div>SCORE: {score.toLocaleString()}</div>
          {combo > 1 && (
            <div className="mt-1 text-glow animate-pulse">
              COMBO x{combo}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="font-pixel text-[8px] text-muted-foreground text-glow-sm text-right space-y-1">
          <div>LVL {difficulty}</div>
          <button
            onClick={onToggleIntensity}
            className="pointer-events-auto pixel-btn px-2 py-1 text-[7px] bg-background text-foreground"
          >
            FX:{'█'.repeat(trailIntensity)}{'░'.repeat(3 - trailIntensity)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HUD;
