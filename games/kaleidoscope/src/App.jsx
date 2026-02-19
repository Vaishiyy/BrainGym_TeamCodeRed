import { useEffect, useRef, useState } from "react";

const DPR_LIMIT = 2;

const COLOR_MODES = {
  neon: ["#53f9ff", "#d06bff", "#ff5ad5"],
  aurora: ["#6fffe9", "#7da6ff", "#cb7bff"],
  sunset: ["#ff7cc6", "#ffb86a", "#7be7ff"],
};

const BG_MODES = {
  deep: ["#060913", "#0f1630", "#1b1533"],
  midnight: ["#04050c", "#0b1026", "#1a1040"],
  abyss: ["#02040a", "#0a1c2d", "#17203a"],
};

function App() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  const settingsRef = useRef({
    symmetryMode: 4,
    colorMode: "neon",
    bgMode: "deep",
  });

  const drawingRef = useRef({
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    smoothX: 0,
    smoothY: 0,
    color: COLOR_MODES.neon[0],
    width: 2.8,
    velocity: 0,
  });

  const [symmetryMode, setSymmetryMode] = useState(4);
  const [colorMode, setColorMode] = useState("neon");
  const [bgMode, setBgMode] = useState("deep");

  useEffect(() => {
    settingsRef.current.symmetryMode = symmetryMode;
  }, [symmetryMode]);

  useEffect(() => {
    settingsRef.current.colorMode = colorMode;
  }, [colorMode]);

  useEffect(() => {
    settingsRef.current.bgMode = bgMode;
    const [a, b, c] = BG_MODES[bgMode];
    document.documentElement.style.setProperty("--bg-1", a);
    document.documentElement.style.setProperty("--bg-2", b);
    document.documentElement.style.setProperty("--bg-3", c);
  }, [bgMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = 1;

    const paintBackground = () => {
      const [a, b, c] = BG_MODES[settingsRef.current.bgMode];
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, a);
      g.addColorStop(0.5, b);
      g.addColorStop(1, c);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    };

    const resize = () => {
      const prev = document.createElement("canvas");
      prev.width = canvas.width;
      prev.height = canvas.height;
      const prevCtx = prev.getContext("2d");
      if (canvas.width && canvas.height) {
        prevCtx.drawImage(canvas, 0, 0);
      }

      dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      paintBackground();
      if (prev.width && prev.height) {
        ctx.globalAlpha = 0.95;
        ctx.drawImage(prev, 0, 0, prev.width / dpr, prev.height / dpr, 0, 0, width, height);
        ctx.globalAlpha = 1;
      }
    };

    const pickStrokeStyle = () => {
      const colors = COLOR_MODES[settingsRef.current.colorMode];
      const color = colors[(Math.random() * colors.length) | 0];
      drawingRef.current.color = color;
      drawingRef.current.width = 2 + Math.random() * 2.6;
      drawingRef.current.velocity = 0;
    };

    const getCanvasPoint = (ev) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top,
      };
    };

    const pointsForMode = (x, y, mode) => {
      const cx = width * 0.5;
      const cy = height * 0.5;
      const dx = x - cx;
      const dy = y - cy;

      if (mode === 2) {
        return [
          [cx + dx, cy + dy],
          [cx - dx, cy + dy],
        ];
      }

      if (mode === 4) {
        return [
          [cx + dx, cy + dy],
          [cx - dx, cy + dy],
          [cx + dx, cy - dy],
          [cx - dx, cy - dy],
        ];
      }

      return [
        [cx + dx, cy + dy],
        [cx - dx, cy + dy],
        [cx + dx, cy - dy],
        [cx - dx, cy - dy],
        [cx + dy, cy + dx],
        [cx - dy, cy + dx],
        [cx + dy, cy - dx],
        [cx - dy, cy - dx],
      ];
    };

    const drawMirroredSegment = (x0, y0, x1, y1) => {
      const mode = settingsRef.current.symmetryMode;
      const p0 = pointsForMode(x0, y0, mode);
      const p1 = pointsForMode(x1, y1, mode);
      const d = drawingRef.current;

      const dist = Math.hypot(x1 - x0, y1 - y0);
      d.velocity = d.velocity * 0.75 + dist * 0.25;
      const easedWidth = Math.max(1.3, d.width - d.velocity * 0.02);

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = d.color;
      ctx.shadowColor = d.color;
      ctx.shadowBlur = 18;
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = easedWidth;

      for (let i = 0; i < p0.length; i += 1) {
        const mx = (p0[i][0] + p1[i][0]) * 0.5;
        const my = (p0[i][1] + p1[i][1]) * 0.5;
        ctx.beginPath();
        ctx.moveTo(p0[i][0], p0[i][1]);
        ctx.quadraticCurveTo(mx, my, p1[i][0], p1[i][1]);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    };

    const onPointerDown = (ev) => {
      const pt = getCanvasPoint(ev);
      pickStrokeStyle();
      drawingRef.current.active = true;
      drawingRef.current.pointerId = ev.pointerId;
      drawingRef.current.lastX = pt.x;
      drawingRef.current.lastY = pt.y;
      drawingRef.current.smoothX = pt.x;
      drawingRef.current.smoothY = pt.y;
      canvas.setPointerCapture(ev.pointerId);
    };

    const onPointerMove = (ev) => {
      const d = drawingRef.current;
      if (!d.active || d.pointerId !== ev.pointerId) return;

      const pt = getCanvasPoint(ev);
      d.smoothX += (pt.x - d.smoothX) * 0.34;
      d.smoothY += (pt.y - d.smoothY) * 0.34;

      drawMirroredSegment(d.lastX, d.lastY, d.smoothX, d.smoothY);
      d.lastX = d.smoothX;
      d.lastY = d.smoothY;
    };

    const stopDrawing = (ev) => {
      const d = drawingRef.current;
      if (d.pointerId !== ev.pointerId) return;
      d.active = false;
      d.pointerId = null;
      if (canvas.hasPointerCapture(ev.pointerId)) {
        canvas.releasePointerCapture(ev.pointerId);
      }
    };

    const clearCanvas = () => {
      paintBackground();
    };

    canvas.addEventListener("pointerdown", onPointerDown, { passive: true });
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointercancel", stopDrawing);
    canvas.addEventListener("dblclick", clearCanvas);
    window.addEventListener("resize", resize);

    resize();

    const animate = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(3, 7, 16, 0.028)";
      ctx.fillRect(0, 0, width, height);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", stopDrawing);
      canvas.removeEventListener("pointercancel", stopDrawing);
      canvas.removeEventListener("dblclick", clearCanvas);
    };
  }, []);

  return (
    <div className="app">
      <canvas ref={canvasRef} />

      <div className="ui">
        <label className="chip">
          Symmetry
          <select value={symmetryMode} onChange={(e) => setSymmetryMode(Number(e.target.value))}>
            <option value={2}>2-way</option>
            <option value={4}>4-way</option>
            <option value={8}>8-way</option>
          </select>
        </label>

        <label className="chip">
          Color
          <select value={colorMode} onChange={(e) => setColorMode(e.target.value)}>
            <option value="neon">Neon</option>
            <option value="aurora">Aurora</option>
            <option value="sunset">Sunset</option>
          </select>
        </label>

        <label className="chip">
          Backdrop
          <select value={bgMode} onChange={(e) => setBgMode(e.target.value)}>
            <option value="deep">Deep</option>
            <option value="midnight">Midnight</option>
            <option value="abyss">Abyss</option>
          </select>
        </label>
      </div>

      <div className="hint">Draw with mouse or touch. Double-tap/double-click to clear.</div>
    </div>
  );
}

export default App;