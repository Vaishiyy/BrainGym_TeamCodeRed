import { GameStats, GameMode, getTopScores } from '@/hooks/useGameEngine';

interface GameOverProps {
  stats: GameStats;
  mode: GameMode;
  onPlayAgain: () => void;
  onMenu: () => void;
}

const GameOver = ({ stats, mode, onPlayAgain, onMenu }: GameOverProps) => {
  const accuracy = stats.questionsAnswered > 0
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
    : 0;

  const topScores = getTopScores(mode);
  const isNewHighScore = topScores.length > 0 && stats.score >= topScores[0].score;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
      {/* Game Over Title */}
      <div className="text-center">
        {isNewHighScore && (
          <div className="text-xs font-arcade text-neon-yellow text-glow-yellow mb-3 animate-pulse-glow">
            ★ NEW HIGH SCORE ★
          </div>
        )}
        <h2 className="text-xl sm:text-3xl font-arcade text-neon-red text-glow-magenta mb-2">
          GAME OVER
        </h2>
      </div>

      {/* Final Score */}
      <div className="border-2 border-primary rounded p-6 bg-card box-glow-green text-center">
        <div className="text-[8px] sm:text-[10px] text-muted-foreground mb-2">FINAL SCORE</div>
        <div className="text-2xl sm:text-4xl font-arcade text-primary text-glow-green">
          {stats.score.toLocaleString()}
        </div>
      </div>

      {/* Stats */}
      <div className="w-full max-w-xs border border-border rounded p-4 bg-card">
        <div className="space-y-2 text-[8px] sm:text-[10px]">
          {[
            ['LEVEL', stats.level],
            ['CORRECT', `${stats.correctAnswers}/${stats.questionsAnswered}`],
            ['ACCURACY', `${accuracy}%`],
            ['MAX COMBO', `${stats.maxCombo}x`],
          ].map(([label, value]) => (
            <div key={label as string} className="flex justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onPlayAgain}
          className="border-2 border-primary rounded p-3 font-arcade text-xs text-primary
            hover:bg-primary hover:text-primary-foreground hover:box-glow-green
            transition-all active:scale-95"
        >
          PLAY AGAIN
        </button>
        <button
          onClick={onMenu}
          className="border-2 border-border rounded p-3 font-arcade text-xs text-muted-foreground
            hover:border-foreground hover:text-foreground
            transition-all active:scale-95"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
};

export default GameOver;
