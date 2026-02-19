export interface Rod {
  y: number;
  gapX: number;
  gapWidth: number;
  speed: number;
  direction: 1 | -1;
  passed: boolean;
}

export interface GameState {
  ballX: number;
  ballY: number;
  rods: Rod[];
  score: number;
  level: number;
  gameOver: boolean;
  shakeTimer: number;
}

export const CANVAS_W = 400;
export const CANVAS_H = 600;
export const BALL_R = 10;
export const ROD_H = 14;
export const BALL_SPEED = 120;
export const ROD_SPACING = 140;
export const MOVE_SPEED = 220;

export function getLevelConfig(level: number) {
  return {
    rodSpeed: 60 + level * 20,
    gapWidth: Math.max(60 - level * 4, 36),
    scoreToAdvance: level * 5 + 5,
  };
}
