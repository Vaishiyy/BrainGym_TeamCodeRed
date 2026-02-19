import { GameState, CANVAS_W, CANVAS_H, BALL_R, ROD_H } from './types';

const ROD_COLORS = ['#FFD700', '#A855F7', '#00E5FF', '#FF2D95'];

export function render(ctx: CanvasRenderingContext2D, state: GameState, flashOn: boolean) {
  const { ballX, ballY, rods, score, level, gameOver } = state;

  ctx.save();

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Rods
  for (let i = 0; i < rods.length; i++) {
    const rod = rods[i];
    const color = ROD_COLORS[i % ROD_COLORS.length];
    ctx.fillStyle = color;
    ctx.fillRect(0, rod.y, rod.gapX, ROD_H);
    ctx.fillRect(rod.gapX + rod.gapWidth, rod.y, CANVAS_W - rod.gapX - rod.gapWidth, ROD_H);
  }

  // Ball
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#2C2C2C';
  ctx.beginPath();
  ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // HUD
  ctx.font = '12px "Press Start 2P", monospace';
  ctx.fillStyle = '#333333';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 10, 28);
  ctx.textAlign = 'right';
  ctx.fillText(`LVL ${level}`, CANVAS_W - 10, 28);

  // Game Over overlay
  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.textAlign = 'center';
    if (flashOn) {
      ctx.font = '24px "Press Start 2P", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 30);
    }
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`SCORE: ${score}`, CANVAS_W / 2, CANVAS_H / 2 + 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PRESS ENTER', CANVAS_W / 2, CANVAS_H / 2 + 58);
  }

  ctx.restore();
}
