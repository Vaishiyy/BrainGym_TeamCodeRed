interface LevelCompleteProps {
  level: number;
  time: string;
  moves: number;
  onNext: () => void;
}

export function LevelComplete({ level, time, moves, onNext }: LevelCompleteProps) {
  return (
    <div className="fixed inset-0 bg-foreground/60 flex items-center justify-center z-50">
      <div className="bg-card border-[3px] border-foreground rounded-xl p-8 text-center max-w-sm mx-4 animate-level-up">
        <p className="font-display text-sm text-muted-foreground">LEVEL {level}</p>
        <h2 className="font-display text-3xl font-bold mt-1">COMPLETE!</h2>
        <div className="flex justify-center gap-8 mt-6 mb-6">
          <div>
            <p className="font-display text-xs text-muted-foreground">TIME</p>
            <p className="font-display text-xl font-bold">{time}</p>
          </div>
          <div>
            <p className="font-display text-xs text-muted-foreground">MOVES</p>
            <p className="font-display text-xl font-bold">{moves}</p>
          </div>
        </div>
        <button
          onClick={onNext}
          className="font-display font-bold text-sm bg-foreground text-background px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          NEXT LEVEL →
        </button>
      </div>
    </div>
  );
}
