import { GameMode, getTopScores } from '@/hooks/useGameEngine';

interface StartMenuProps {
  onStartGame: (mode: GameMode) => void;
}

const modeDescriptions: Record<GameMode, { label: string; desc: string; color: string }> = {
  classic: {
    label: 'CLASSIC',
    desc: 'Endless mode. 3 lives. How far can you go?',
    color: 'text-neon-green text-glow-green',
  },
  timed: {
    label: 'TIMED',
    desc: '60 seconds. Score as much as you can!',
    color: 'text-neon-cyan text-glow-cyan',
  },
  challenge: {
    label: 'CHALLENGE',
    desc: '10 levels of increasing difficulty.',
    color: 'text-neon-magenta text-glow-magenta',
  },
};

const StartMenu = ({ onStartGame }: StartMenuProps) => {
  const topScores = getTopScores();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-4xl font-arcade text-primary text-glow-green mb-2 animate-pulse-glow">
          ARITHMETICA
        </h1>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {(Object.keys(modeDescriptions) as GameMode[]).map((mode) => {
          const { label, desc, color } = modeDescriptions[mode];
          return (
            <button
              key={mode}
              onClick={() => onStartGame(mode)}
              className={`
                border-2 border-border rounded p-4 text-left
                hover:border-primary transition-all duration-200
                hover:box-glow-green bg-card active:scale-95
                focus:outline-none focus:border-primary
              `}
            >
              <div className={`text-sm sm:text-base font-arcade ${color} mb-2`}>
                {label}
              </div>
              <div className="text-[8px] sm:text-[10px] text-muted-foreground leading-relaxed">
                {desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* High Scores */}
      {topScores.length > 0 && (
        <div className="w-full max-w-sm">
          <h2 className="text-xs font-arcade text-neon-yellow text-glow-yellow mb-3 text-center">
            HIGH SCORES
          </h2>
          <div className="border border-border rounded p-3 bg-card">
            {topScores.slice(0, 5).map((entry, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-[8px] sm:text-[10px] py-1"
              >
                <span className="text-muted-foreground">
                  {i + 1}. {entry.mode.toUpperCase()}
                </span>
                <span className="text-primary text-glow-green">
                  {entry.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="text-[7px] sm:text-[8px] text-muted-foreground text-center leading-relaxed">
        <p>KEYBOARD: 1-4 TO SELECT • ESC TO QUIT</p>
        <p>TOUCH: TAP ANSWER BUTTONS</p>
      </div>
    </div>
  );
};

export default StartMenu;
