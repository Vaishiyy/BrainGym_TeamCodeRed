import { cn } from "@/lib/utils";

interface PuzzleTileProps {
  value: number;
  isCorrect: boolean;
  isEmpty: boolean;
  canMove: boolean;
  onClick: () => void;
  size: number;
}

export function PuzzleTile({ value, isCorrect, isEmpty, canMove, onClick, size }: PuzzleTileProps) {
  // Scale tile size based on grid size
  const tileSize = size <= 3 ? "w-20 h-20 text-2xl" : size <= 4 ? "w-[72px] h-[72px] text-xl" : "w-14 h-14 text-base";

  if (isEmpty) {
    return <div className={cn(tileSize, "rounded-lg bg-tile-empty")} />;
  }

  return (
    <button
      onClick={onClick}
      disabled={!canMove}
      className={cn(
        tileSize,
        "rounded-lg border-[3px] font-display font-bold transition-all duration-100",
        "bg-tile select-none",
        isCorrect
          ? "border-tile-correct text-accent"
          : "border-tile-border text-foreground",
        canMove && "cursor-pointer hover:scale-95 active:animate-tile-pop",
        !canMove && "cursor-default"
      )}
    >
      {value}
    </button>
  );
}
