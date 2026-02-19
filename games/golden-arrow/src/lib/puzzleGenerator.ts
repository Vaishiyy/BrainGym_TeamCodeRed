export type ShapeType = "circle" | "square" | "triangle" | "diamond" | "pentagon" | "star";
export type ColorToken = "gold" | "amber" | "orange" | "brown" | "lime" | "teal";
export type Rotation = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;

export interface TileData {
  shape: ShapeType;
  color: ColorToken;
  rotation: Rotation;
  size: "sm" | "md" | "lg";
}

export interface PuzzleData {
  grid: (TileData | null)[][]; // 3x3, bottom-right is null
  answer: TileData;
  options: TileData[];
  rules: string[];
}

const SHAPES: ShapeType[] = ["circle", "square", "triangle", "diamond", "pentagon", "star"];
const COLORS: ColorToken[] = ["gold", "amber", "orange", "brown", "lime", "teal"];
const ROTATIONS: Rotation[] = [0, 45, 90, 135, 180, 225, 270, 315];
const SIZES: TileData["size"][] = ["sm", "md", "lg"];

function pick<T>(arr: T[], index: number): T {
  return arr[((index % arr.length) + arr.length) % arr.length];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateDistractors(answer: TileData, level: number): TileData[] {
  const distractors: TileData[] = [];
  const used = new Set<string>();
  used.add(JSON.stringify(answer));

  const mutations: ((t: TileData) => TileData)[] = [
    (t) => ({ ...t, shape: pick(SHAPES, SHAPES.indexOf(t.shape) + 1) }),
    (t) => ({ ...t, color: pick(COLORS, COLORS.indexOf(t.color) + 1) }),
    (t) => ({ ...t, rotation: pick(ROTATIONS, ROTATIONS.indexOf(t.rotation) + 2) as Rotation }),
    (t) => ({ ...t, size: pick(SIZES, SIZES.indexOf(t.size) + 1) as TileData["size"] }),
    (t) => ({ ...t, shape: pick(SHAPES, SHAPES.indexOf(t.shape) + 2), color: pick(COLORS, COLORS.indexOf(t.color) + 1) }),
  ];

  let attempts = 0;
  while (distractors.length < 3 && attempts < 50) {
    const mutate = mutations[Math.floor(Math.random() * Math.min(mutations.length, 2 + level))];
    const d = mutate(answer);
    const key = JSON.stringify(d);
    if (!used.has(key)) {
      used.add(key);
      distractors.push(d);
    }
    attempts++;
  }

  // Fill remaining if needed
  while (distractors.length < 3) {
    distractors.push({
      ...answer,
      shape: pick(SHAPES, SHAPES.indexOf(answer.shape) + distractors.length + 1),
    });
  }

  return distractors;
}

export function generatePuzzle(level: number): PuzzleData {
  const seed = Math.floor(Math.random() * 1000);
  const shapeStart = (seed) % SHAPES.length;
  const colorStart = (seed + 2) % COLORS.length;
  const rotStart = (seed) % 4;
  const sizeStart = (seed) % SIZES.length;

  const rules: string[] = [];
  const grid: (TileData | null)[][] = [];

  // Determine active dimensions based on level
  const useShape = true;
  const useColor = level >= 2;
  const useRotation = level >= 4;
  const useSize = level >= 6;

  rules.push("Shape changes across columns");
  if (useColor) rules.push("Color changes across rows");
  if (useRotation) rules.push("Rotation progresses diagonally");
  if (useSize) rules.push("Size varies by position");

  // Row offset patterns that get more complex with level
  const rowShapeOffset = level >= 3 ? 1 : 0; // shapes shift per row at higher levels
  const colColorOffset = level >= 5 ? 1 : 0;

  for (let row = 0; row < 3; row++) {
    const gridRow: (TileData | null)[] = [];
    for (let col = 0; col < 3; col++) {
      if (row === 2 && col === 2) {
        gridRow.push(null);
        continue;
      }

      const shapeIdx = shapeStart + col + (rowShapeOffset * row);
      const colorIdx = useColor ? colorStart + row + (colColorOffset * col) : colorStart;
      const rotIdx = useRotation ? (rotStart + row + col) : 0;
      const sizeIdx = useSize ? (sizeStart + col) : 1; // default md

      gridRow.push({
        shape: pick(SHAPES, shapeIdx),
        color: pick(COLORS, colorIdx),
        rotation: pick(ROTATIONS, rotIdx * 2) as Rotation,
        size: pick(SIZES, sizeIdx) as TileData["size"],
      });
    }
    grid.push(gridRow);
  }

  // The answer follows the same rules
  const answerShapeIdx = shapeStart + 2 + (rowShapeOffset * 2);
  const answerColorIdx = useColor ? colorStart + 2 + (colColorOffset * 2) : colorStart;
  const answerRotIdx = useRotation ? (rotStart + 2 + 2) : 0;
  const answerSizeIdx = useSize ? (sizeStart + 2) : 1;

  const answer: TileData = {
    shape: pick(SHAPES, answerShapeIdx),
    color: pick(COLORS, answerColorIdx),
    rotation: pick(ROTATIONS, answerRotIdx * 2) as Rotation,
    size: pick(SIZES, answerSizeIdx) as TileData["size"],
  };

  const distractors = generateDistractors(answer, level);
  const options = shuffle([answer, ...distractors]);

  return { grid, answer, options, rules };
}
