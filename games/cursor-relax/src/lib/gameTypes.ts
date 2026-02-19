export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: 'dot' | 'streak' | 'burst';
}

export interface Target {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  hit: boolean;
  pulsePhase: number;
  color: string;
}

export interface GameState {
  phase: 'boot' | 'menu' | 'playing' | 'gameover';
  score: number;
  combo: number;
  maxCombo: number;
  comboTimer: number;
  difficulty: number;
  timeElapsed: number;
  targetsHit: number;
  targetsMissed: number;
  trailIntensity: number; // 1-3
}

export interface CursorState {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  speed: number;
  isDown: boolean;
}
