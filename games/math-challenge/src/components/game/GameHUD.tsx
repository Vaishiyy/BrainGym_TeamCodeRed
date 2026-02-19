import { GameStats, GameMode } from '@/hooks/useGameEngine';

interface GameHUDProps {
  stats: GameStats;
  mode: GameMode;
}

/** Heads-Up Display showing score, combo, lives, level, timer */
const GameHUD = ({ stats, mode }: GameHUDProps) => {
  const livesDisplay = Array.from({ length: 3 }, (_, i) => (
    <span
      key={i}
      className={`text-sm sm:text-base ${
        i < stats.lives ? 'text-neon-red' : 'text-muted'
      }`}
    >
      ♥
    </span>
  ));

  const timerPercent = mode === 'timed' ? (stats.timeLeft / 60) * 100 : 0;
  const timerCritical = mode === 'timed' && stats.timeLeft <= 10;

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {/* Top row: Score + Lives */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="text-[7px] sm:text-[8px] text-muted-foreground mb-1">SCORE</div>
          <div className="text-sm sm:text-lg font-arcade text-primary text-glow-green">
            {stats.score.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[7px] sm:text-[8px] text-muted-foreground mb-1">LVL</div>
          <div className="text-sm sm:text-lg font-arcade text-neon-cyan text-glow-cyan">
            {stats.level}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[7px] sm:text-[8px] text-muted-foreground mb-1">LIVES</div>
          <div className="flex gap-1 justify-end">{livesDisplay}</div>
        </div>
      </div>

      {/* Combo display */}
      {stats.combo > 1 && (
        <div className="text-center mb-2 animate-combo-fire">
          <span className="text-xs sm:text-sm font-arcade text-neon-orange text-glow-yellow">
            🔥 {stats.combo}x COMBO
          </span>
        </div>
      )}

      {/* Timer bar for timed mode */}
      {mode === 'timed' && (
        <div className="mb-2">
          <div className="flex justify-between text-[7px] text-muted-foreground mb-1">
            <span>TIME</span>
            <span>{stats.timeLeft}s</span>
          </div>
          <div className="w-full h-2 bg-muted rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded ${
                timerCritical
                  ? 'bg-neon-red timer-critical'
                  : timerPercent > 50
                  ? 'bg-neon-green'
                  : 'bg-neon-yellow'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Challenge progress */}
      {mode === 'challenge' && (
        <div className="mb-2">
          <div className="flex justify-between text-[7px] text-muted-foreground mb-1">
            <span>PROGRESS</span>
            <span>{stats.correctAnswers % 10}/10</span>
          </div>
          <div className="w-full h-2 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-neon-magenta transition-all duration-300 rounded"
              style={{ width: `${(stats.correctAnswers % 10) * 10}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHUD;
