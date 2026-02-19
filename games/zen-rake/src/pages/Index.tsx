import { useState, useEffect } from "react";
import ZenGarden, { type PatternMode } from "@/components/ZenGarden";
import ZenControls from "@/components/ZenControls";

const Index = () => {
  const [rakeWidth, setRakeWidth] = useState(3);
  const [patternMode, setPatternMode] = useState<PatternMode>("rake");
  const [strokeCount, setStrokeCount] = useState(0);
  const [clearSignal, setClearSignal] = useState(0);
  const [undoSignal, setUndoSignal] = useState(0);
  const [showTitle, setShowTitle] = useState(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "5") {
        setRakeWidth(parseInt(e.key));
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        setUndoSignal((s) => s + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Fade title after first stroke
  useEffect(() => {
    if (strokeCount > 0 && showTitle) {
      const timer = setTimeout(() => setShowTitle(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [strokeCount, showTitle]);

  return (
    <div className="fixed inset-0 bg-background overflow-hidden select-none">
      {/* Title overlay */}
      <div
        className={`fixed inset-0 z-40 flex items-center justify-center pointer-events-none transition-opacity duration-[2000ms] ${
          showTitle ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-center">
          <h1 className="font-retro text-3xl md:text-5xl text-foreground/70 tracking-widest mb-3">
            ZEN GARDEN
          </h1>
          <p className="font-retro text-lg md:text-xl text-muted-foreground tracking-wider">
            RAKE · RIPPLE · SPIRAL · WAVE · DOTS
          </p>
          <p className="font-retro text-xs text-muted-foreground/50 mt-4 tracking-wide">
            DRAG TO RAKE · KEYS 1-5 FOR WIDTH
          </p>
        </div>
      </div>

      {/* Canvas */}
      <ZenGarden
        rakeWidth={rakeWidth}
        patternMode={patternMode}
        onStrokeCount={setStrokeCount}
        clearSignal={clearSignal}
        undoSignal={undoSignal}
      />

      {/* CRT Effects */}
      <div className="crt-scanlines" />
      <div className="crt-vignette" />

      {/* Controls */}
      <ZenControls
        rakeWidth={rakeWidth}
        setRakeWidth={setRakeWidth}
        patternMode={patternMode}
        setPatternMode={setPatternMode}
        onClear={() => setClearSignal((s) => s + 1)}
        onUndo={() => setUndoSignal((s) => s + 1)}
        strokeCount={strokeCount}
      />
    </div>
  );
};

export default Index;
