import type { ShapeType, ColorToken, TileData } from "@/lib/puzzleGenerator";

const COLOR_MAP: Record<ColorToken, string> = {
  gold: "hsl(45, 100%, 55%)",
  amber: "hsl(38, 90%, 50%)",
  orange: "hsl(25, 95%, 55%)",
  brown: "hsl(30, 60%, 35%)",
  lime: "hsl(80, 70%, 50%)",
  teal: "hsl(175, 60%, 45%)",
};

const SIZE_MAP: Record<TileData["size"], number> = { sm: 28, md: 36, lg: 44 };

function ShapeSVG({ shape, color, size }: { shape: ShapeType; color: string; size: number }) {
  const half = size / 2;

  switch (shape) {
    case "circle":
      return <circle cx={half} cy={half} r={half - 2} fill={color} />;
    case "square":
      return <rect x={2} y={2} width={size - 4} height={size - 4} fill={color} rx={3} />;
    case "triangle":
      return (
        <polygon
          points={`${half},3 ${size - 3},${size - 3} 3,${size - 3}`}
          fill={color}
        />
      );
    case "diamond":
      return (
        <polygon
          points={`${half},2 ${size - 2},${half} ${half},${size - 2} 2,${half}`}
          fill={color}
        />
      );
    case "pentagon": {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        return `${half + (half - 3) * Math.cos(angle)},${half + (half - 3) * Math.sin(angle)}`;
      }).join(" ");
      return <polygon points={pts} fill={color} />;
    }
    case "star": {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
        const r = i % 2 === 0 ? half - 3 : (half - 3) * 0.45;
        return `${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`;
      }).join(" ");
      return <polygon points={pts} fill={color} />;
    }
  }
}

interface PuzzleTileProps {
  tile: TileData;
  cellSize?: number;
  isOption?: boolean;
  isSelected?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  onClick?: () => void;
}

export default function PuzzleTile({
  tile,
  cellSize = 80,
  isOption = false,
  isSelected = false,
  isCorrect = false,
  isWrong = false,
  onClick,
}: PuzzleTileProps) {
  const color = COLOR_MAP[tile.color];
  const shapeSize = SIZE_MAP[tile.size];

  let borderClass = "border-2 border-game-surface/60";
  if (isSelected && isCorrect) borderClass = "border-3 border-game-correct ring-2 ring-game-correct/40";
  else if (isSelected && isWrong) borderClass = "border-3 border-game-wrong ring-2 ring-game-wrong/40";
  else if (isCorrect) borderClass = "border-2 border-game-correct/60";
  else if (isOption) borderClass = "border-2 border-game-arrow/30 hover:border-game-glow hover:scale-105 cursor-pointer";

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl bg-game-surface/50 transition-all duration-200 ${borderClass}`}
      style={{ width: cellSize, height: cellSize }}
    >
      <svg
        width={shapeSize}
        height={shapeSize}
        viewBox={`0 0 ${shapeSize} ${shapeSize}`}
        style={{ transform: `rotate(${tile.rotation}deg)` }}
      >
        <ShapeSVG shape={tile.shape} color={color} size={shapeSize} />
      </svg>
    </div>
  );
}
