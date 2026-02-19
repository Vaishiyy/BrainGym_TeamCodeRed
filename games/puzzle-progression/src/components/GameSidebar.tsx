import { Clock, Move, Trophy } from "lucide-react";

interface GameSidebarProps {
  time: string;
  moves: number;
  level: number;
  score: number;
  puzzleName: string;
}

export function GameSidebar({ time, moves, level, score, puzzleName }: GameSidebarProps) {
  return (
    <div className="w-56 border-l-[3px] border-foreground flex flex-col">
      {/* Timer */}
      <div className="flex items-center gap-3 border-b-[3px] border-foreground px-4 py-3">
        <Clock className="w-7 h-7 text-foreground" strokeWidth={2.5} />
        <span className="font-display text-2xl font-bold">{time}</span>
      </div>
      {/* Moves */}
      <div className="flex items-center gap-3 border-b-[3px] border-foreground px-4 py-3">
        <Move className="w-7 h-7 text-foreground" strokeWidth={2.5} />
        <span className="font-display text-2xl font-bold">{moves}</span>
      </div>
      {/* Score */}
      <div className="flex items-center gap-3 border-b-[3px] border-foreground px-4 py-3">
        <Trophy className="w-7 h-7 text-foreground" strokeWidth={2.5} />
        <span className="font-display text-2xl font-bold">{score}</span>
      </div>
      {/* Level info */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-display text-sm text-muted-foreground">LEVEL</p>
          <p className="font-display text-5xl font-bold">{level}</p>
          <p className="font-display text-xs text-muted-foreground mt-1">{puzzleName}</p>
        </div>
      </div>
    </div>
  );
}
