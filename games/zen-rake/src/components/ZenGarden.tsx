import { useRef, useEffect, useState, useCallback } from "react";

export type PatternMode = "rake" | "ripple" | "spiral" | "wave" | "dots";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  rakeWidth: number;
  patternMode: PatternMode;
}

interface Stone {
  x: number;
  y: number;
  radius: number;
  shape: "circle" | "triangle";
}

interface ZenGardenProps {
  rakeWidth: number;
  patternMode: PatternMode;
  onStrokeCount: (count: number) => void;
  clearSignal: number;
  undoSignal: number;
}

const STONES: Stone[] = [
  { x: 0.25, y: 0.35, radius: 25, shape: "circle" },
  { x: 0.7, y: 0.55, radius: 20, shape: "triangle" },
  { x: 0.5, y: 0.75, radius: 18, shape: "circle" },
];

const TINE_SPACING = 6;
const TINE_WIDTH = 2;

function generateNoiseTexture(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const base = 195 + Math.random() * 30;
    const grain = Math.random() * 15 - 7;
    const val = Math.min(255, Math.max(0, base + grain));
    data[i] = val;
    data[i + 1] = val * 0.92;
    data[i + 2] = val * 0.78;
    data[i + 3] = 255;
  }
  return imageData;
}

function drawStone(
  ctx: CanvasRenderingContext2D,
  stone: Stone,
  w: number,
  h: number
) {
  const x = stone.x * w;
  const y = stone.y * h;
  const r = stone.radius;

  ctx.save();

  // Shadow
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = "#555";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1.5;

  if (stone.shape === "circle") {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Highlight
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x - r * 0.9, y + r * 0.7);
    ctx.lineTo(x + r * 0.9, y + r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function isNearStone(
  px: number,
  py: number,
  stones: Stone[],
  w: number,
  h: number
): boolean {
  for (const s of stones) {
    const dx = px - s.x * w;
    const dy = py - s.y * h;
    if (Math.sqrt(dx * dx + dy * dy) < s.radius + 12) return true;
  }
  return false;
}

export default function ZenGarden({
  rakeWidth,
  patternMode,
  onStrokeCount,
  clearSignal,
  undoSignal,
}: ZenGardenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noiseRef = useRef<ImageData | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);
  const [, forceRender] = useState(0);

  const getCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { w: 0, h: 0 };
    return { w: canvas.width, h: canvas.height };
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = getCanvasSize();

    // Draw sand base
    if (!noiseRef.current || noiseRef.current.width !== w || noiseRef.current.height !== h) {
      noiseRef.current = generateNoiseTexture(ctx, w, h);
    }
    ctx.putImageData(noiseRef.current, 0, 0);

    // Draw all strokes
    const allStrokes = [...strokesRef.current];
    if (currentStrokeRef.current.length > 1) {
      allStrokes.push({
        points: currentStrokeRef.current,
        rakeWidth,
        patternMode,
      });
    }

    for (const stroke of allStrokes) {
      switch (stroke.patternMode) {
        case "ripple":
          drawRippleStroke(ctx, stroke, w, h);
          break;
        case "spiral":
          drawSpiralStroke(ctx, stroke, w, h);
          break;
        case "wave":
          drawWaveStroke(ctx, stroke, w, h);
          break;
        case "dots":
          drawDotsStroke(ctx, stroke, w, h);
          break;
        default:
          drawRakeStroke(ctx, stroke, w, h);
          break;
      }
    }

    // Draw stones
    for (const stone of STONES) {
      drawStone(ctx, stone, w, h);
    }
  }, [getCanvasSize, rakeWidth, patternMode]);

  function drawRakeStroke(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    w: number,
    h: number
  ) {
    const { points, rakeWidth: rw } = stroke;
    if (points.length < 2) return;

    const tineCount = rw;
    const totalWidth = (tineCount - 1) * TINE_SPACING;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let t = 0; t < tineCount; t++) {
      const offset = -totalWidth / 2 + t * TINE_SPACING;

      // groove (dark)
      ctx.strokeStyle = "rgba(90, 75, 60, 0.55)";
      ctx.lineWidth = TINE_WIDTH + 2;
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        // Perpendicular offset
        let nx = 0,
          ny = 0;
        if (i < points.length - 1) {
          const dx = points[i + 1].x - p.x;
          const dy = points[i + 1].y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          nx = -dy / len;
          ny = dx / len;
        } else if (i > 0) {
          const dx = p.x - points[i - 1].x;
          const dy = p.y - points[i - 1].y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          nx = -dy / len;
          ny = dx / len;
        }
        const px = p.x + nx * offset;
        const py = p.y + ny * offset;
        if (isNearStone(px, py, STONES, w, h)) {
          ctx.stroke();
          ctx.beginPath();
          continue;
        }
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // ridge (lighter)
      ctx.strokeStyle = "rgba(200, 185, 165, 0.4)";
      ctx.lineWidth = TINE_WIDTH;
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        let nx = 0,
          ny = 0;
        if (i < points.length - 1) {
          const dx = points[i + 1].x - p.x;
          const dy = points[i + 1].y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          nx = -dy / len;
          ny = dx / len;
        } else if (i > 0) {
          const dx = p.x - points[i - 1].x;
          const dy = p.y - points[i - 1].y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          nx = -dy / len;
          ny = dx / len;
        }
        const px = p.x + nx * (offset + 1.5);
        const py = p.y + ny * (offset + 1.5);
        if (isNearStone(px, py, STONES, w, h)) {
          ctx.stroke();
          ctx.beginPath();
          continue;
        }
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawRippleStroke(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    _w: number,
    _h: number
  ) {
    const { points, rakeWidth: rw } = stroke;
    ctx.save();
    for (const p of points) {
      const rings = rw + 2;
      for (let r = 1; r <= rings; r++) {
        const radius = r * 10;
        ctx.strokeStyle = `rgba(90, 75, 60, ${0.4 / r})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawSpiralStroke(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    w: number,
    h: number
  ) {
    const { points, rakeWidth: rw } = stroke;
    ctx.save();
    ctx.lineCap = "round";
    for (const p of points) {
      const turns = rw + 2;
      const maxRadius = turns * 12;
      ctx.strokeStyle = "rgba(90, 75, 60, 0.45)";
      ctx.lineWidth = TINE_WIDTH;
      ctx.beginPath();
      for (let angle = 0; angle < turns * Math.PI * 2; angle += 0.1) {
        const radius = (angle / (turns * Math.PI * 2)) * maxRadius;
        const sx = p.x + Math.cos(angle) * radius;
        const sy = p.y + Math.sin(angle) * radius;
        if (isNearStone(sx, sy, STONES, w, h)) {
          ctx.stroke();
          ctx.beginPath();
          continue;
        }
        if (angle === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      // Light highlight spiral
      ctx.strokeStyle = "rgba(200, 185, 165, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let angle = 0.15; angle < turns * Math.PI * 2; angle += 0.1) {
        const radius = (angle / (turns * Math.PI * 2)) * maxRadius + 1.5;
        const sx = p.x + Math.cos(angle) * radius;
        const sy = p.y + Math.sin(angle) * radius;
        if (isNearStone(sx, sy, STONES, w, h)) {
          ctx.stroke();
          ctx.beginPath();
          continue;
        }
        if (angle <= 0.15) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWaveStroke(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    w: number,
    h: number
  ) {
    const { points, rakeWidth: rw } = stroke;
    if (points.length < 2) return;
    const tineCount = rw;
    const totalWidth = (tineCount - 1) * TINE_SPACING;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let t = 0; t < tineCount; t++) {
      const offset = -totalWidth / 2 + t * TINE_SPACING;

      ctx.strokeStyle = "rgba(90, 75, 60, 0.55)";
      ctx.lineWidth = TINE_WIDTH + 1;
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        let nx = 0, ny = 0;
        if (i < points.length - 1) {
          const dx = points[i + 1].x - p.x;
          const dy = points[i + 1].y - p.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          nx = -dy / len;
          ny = dx / len;
        } else if (i > 0) {
          const dx = p.x - points[i - 1].x;
          const dy = p.y - points[i - 1].y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          nx = -dy / len;
          ny = dx / len;
        }
        const wave = Math.sin(i * 0.3 + t * 1.2) * 8;
        const px = p.x + nx * (offset + wave);
        const py = p.y + ny * (offset + wave);
        if (isNearStone(px, py, STONES, w, h)) {
          ctx.stroke();
          ctx.beginPath();
          continue;
        }
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDotsStroke(
    ctx: CanvasRenderingContext2D,
    stroke: Stroke,
    w: number,
    h: number
  ) {
    const { points, rakeWidth: rw } = stroke;
    ctx.save();
    const spacing = 8;
    let accDist = 0;

    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      accDist += dist;

      if (accDist >= spacing) {
        accDist = 0;
        const p = points[i];
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const totalWidth = (rw - 1) * TINE_SPACING;

        for (let t = 0; t < rw; t++) {
          const offset = -totalWidth / 2 + t * TINE_SPACING;
          const px = p.x + nx * offset;
          const py = p.y + ny * offset;
          if (isNearStone(px, py, STONES, w, h)) continue;

          // Dark indent
          ctx.fillStyle = "rgba(90, 75, 60, 0.5)";
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
          // Light highlight
          ctx.fillStyle = "rgba(200, 185, 165, 0.35)";
          ctx.beginPath();
          ctx.arc(px + 0.8, py - 0.8, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  // Resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      noiseRef.current = null;
      render();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [render]);

  // Clear
  useEffect(() => {
    if (clearSignal > 0) {
      strokesRef.current = [];
      noiseRef.current = null;
      onStrokeCount(0);
      render();
    }
  }, [clearSignal, render, onStrokeCount]);

  // Undo
  useEffect(() => {
    if (undoSignal > 0 && strokesRef.current.length > 0) {
      strokesRef.current.pop();
      noiseRef.current = null;
      onStrokeCount(strokesRef.current.length);
      render();
    }
  }, [undoSignal, render, onStrokeCount]);

  useEffect(() => {
    render();
  }, [render]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getPos(e);
    currentStrokeRef.current = [pos];
    // Play rake sound
    playRakeSound();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const pos = getPos(e);
    const prev = currentStrokeRef.current[currentStrokeRef.current.length - 1];
    if (prev) {
      const dist = Math.sqrt((pos.x - prev.x) ** 2 + (pos.y - prev.y) ** 2);
      if (dist < 3) return; // throttle
    }
    currentStrokeRef.current.push(pos);
    render();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentStrokeRef.current.length > 1) {
      strokesRef.current.push({
        points: [...currentStrokeRef.current],
        rakeWidth,
        patternMode,
      });
      onStrokeCount(strokesRef.current.length);
    }
    currentStrokeRef.current = [];
    stopRakeSound();
    render();
  };

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rakeOscRef = useRef<OscillatorNode | null>(null);
  const rakeGainRef = useRef<GainNode | null>(null);
  const ambientRef = useRef<AudioBufferSourceNode | null>(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  const startAmbient = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      if (ambientRef.current) return;
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      // Brown noise (softer than white)
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.06;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      ambientRef.current = source;
    } catch {
      // Audio not available
    }
  }, []);

  const playRakeSound = () => {
    try {
      const ctx = getAudioCtx();
      if (rakeOscRef.current) return;
      // Noise-based rake
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 800;
      bandpass.Q.value = 0.5;

      const gain = ctx.createGain();
      gain.gain.value = 0.04;
      rakeGainRef.current = gain;

      source.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      rakeOscRef.current = source as unknown as OscillatorNode;
    } catch {
      // ignore
    }
  };

  const stopRakeSound = () => {
    try {
      if (rakeOscRef.current) {
        (rakeOscRef.current as unknown as AudioBufferSourceNode).stop();
        rakeOscRef.current = null;
      }
    } catch {
      // ignore
    }
  };

  // Start ambient on first interaction
  useEffect(() => {
    const handler = () => {
      startAmbient();
      window.removeEventListener("pointerdown", handler);
    };
    window.addEventListener("pointerdown", handler);
    return () => window.removeEventListener("pointerdown", handler);
  }, [startAmbient]);

  return (
    <div
      className="relative w-full h-full"
      style={{ cursor: "crosshair" }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
}
