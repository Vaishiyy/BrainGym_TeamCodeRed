import { PuzzleTile } from "./PuzzleTile";
import { canMove as checkCanMove, isCorrectPosition } from "@/lib/puzzle";

interface PuzzleBoardProps {
  board: number[];
  size: number;
  onTileClick: (index: number) => void;
}

export function PuzzleBoard({ board, size, onTileClick }: PuzzleBoardProps) {
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {board.map((value, index) => (
        <PuzzleTile
          key={index}
          value={value}
          isEmpty={value === 0}
          isCorrect={isCorrectPosition(index, value)}
          canMove={checkCanMove(index, board, size)}
          onClick={() => onTileClick(index)}
          size={size}
        />
      ))}
    </div>
  );
}
