import type { PatternMode } from "./ZenGarden";

const PATTERNS: { mode: PatternMode; label: string; icon: string }[] = [
  { mode: "rake", label: "RAKE", icon: "≡" },
  { mode: "ripple", label: "RIPPLE", icon: "◎" },
  { mode: "spiral", label: "SPIRAL", icon: "◌" },
  { mode: "wave", label: "WAVE", icon: "∿" },
  { mode: "dots", label: "DOTS", icon: "⁘" },
];

interface ZenControlsProps {
  rakeWidth: number;
  setRakeWidth: (w: number) => void;
  patternMode: PatternMode;
  setPatternMode: (m: PatternMode) => void;
  onClear: () => void;
  onUndo: () => void;
  strokeCount: number;
}

export default function ZenControls({
  rakeWidth,
  setRakeWidth,
  patternMode,
  setPatternMode,
  onClear,
  onUndo,
  strokeCount,
}: ZenControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 p-3 pointer-events-none">
      <div className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded px-4 py-2 pointer-events-auto flex-wrap justify-center">
        {/* Rake width */}
        <span className="text-muted-foreground text-sm mr-1">WIDTH</span>
        {[1, 2, 3, 4, 5].map((w) => (
          <button
            key={w}
            onClick={() => setRakeWidth(w)}
            className={`retro-btn text-sm px-2 py-0.5 ${
              rakeWidth === w ? "active" : ""
            }`}
          >
            {w}
          </button>
        ))}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Pattern modes */}
        {PATTERNS.map((p) => (
          <button
            key={p.mode}
            onClick={() => setPatternMode(p.mode)}
            className={`retro-btn text-sm ${patternMode === p.mode ? "active" : ""}`}
          >
            {p.icon} {p.label}
          </button>
        ))}

        <div className="w-px h-5 bg-border mx-1" />

        {/* Undo / Clear */}
        <button
          onClick={onUndo}
          disabled={strokeCount === 0}
          className="retro-btn text-sm disabled:opacity-30"
        >
          ↩ UNDO
        </button>
        <button onClick={onClear} className="retro-btn text-sm">
          ✕ CLEAR
        </button>
      </div>
    </div>
  );
}
