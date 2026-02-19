import { useState, useCallback, useEffect } from "react";
import { generatePuzzle, type PuzzleData, type TileData } from "@/lib/puzzleGenerator";
import PuzzleTile from "./PuzzleTile";
import { RotateCcw, Brain, Flame, Star, Zap, Layers, Target } from "lucide-react";

export default function GridLogicGame() {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [puzzle, setPuzzle] = useState<PuzzleData>(() => generatePuzzle(1));
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const nextRound = useCallback(() => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setPuzzle(generatePuzzle(newLevel));
    setSelected(null);
    setFeedback(null);
  }, [level]);

  const handleSelect = useCallback((index: number) => {
    if (feedback) return;
    setSelected(index);
    setTotalAnswered(t => t + 1);

    const chosen = puzzle.options[index];
    const isCorrect = JSON.stringify(chosen) === JSON.stringify(puzzle.answer);

    if (isCorrect) {
      setFeedback("correct");
      setTotalCorrect(t => t + 1);
      const points = 10 + level * 5 + streak * 3;
      setScore(s => s + points);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setTimeout(nextRound, 1000);
    } else {
      setFeedback("wrong");
      setStreak(0);
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
      }, 1500);
    }
  }, [feedback, puzzle, level, streak, bestStreak, nextRound]);

  const resetGame = () => {
    setLevel(1);
    setScore(0);
    setStreak(0);
    setTotalAnswered(0);
    setTotalCorrect(0);
    setPuzzle(generatePuzzle(1));
    setSelected(null);
    setFeedback(null);
  };

  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const difficultyLabel = level <= 2 ? "Beginner" : level <= 4 ? "Intermediate" : level <= 6 ? "Advanced" : "Expert";
  const difficultyColor = level <= 2 ? "text-game-correct" : level <= 4 ? "text-game-arrow" : level <= 6 ? "text-game-glow" : "text-game-wrong";

  useEffect(() => {
    localStorage.setItem(
      "brainGymGameScore:golden-arrow",
      JSON.stringify({
        score,
        scoreUnit: "points",
        label: "Score",
        level,
        streak,
        accuracy,
        updatedAt: new Date().toISOString()
      })
    );
  }, [score, level, streak, accuracy]);

  return (
    <div className="flex h-screen overflow-hidden bg-game-bg">
      {/* Left sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col p-6 border-r border-game-surface overflow-y-auto">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="text-game-glow" size={28} />
            <h1 className="text-2xl font-bold text-game-glow tracking-tight">Pattern IQ</h1>
          </div>
          <p className="text-sm text-game-arrow/60 mb-6">Multi-Layer Grid Logic</p>

          <div className="space-y-4">
            <StatBlock icon={<Zap size={16} />} label="Score" value={score.toString()} />
            <StatBlock icon={<Layers size={16} />} label="Level" value={level.toString()} />
            <div>
              <p className="text-xs text-game-arrow/60 uppercase tracking-wider mb-0.5">Difficulty</p>
              <p className={`text-lg font-bold ${difficultyColor}`}>{difficultyLabel}</p>
            </div>
            <StatBlock icon={<Flame size={16} />} label="Streak" value={streak.toString()} />
            <StatBlock icon={<Star size={16} />} label="Best Streak" value={bestStreak.toString()} />
            <StatBlock icon={<Target size={16} />} label="Accuracy" value={`${accuracy}%`} />
          </div>

        </div>

        <button
          onClick={resetGame}
          className="mt-6 w-full py-3 rounded-xl bg-game-surface text-game-text font-semibold hover:bg-game-arrow/20 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
        >
          <RotateCcw size={16} />
          Reset Game
        </button>
      </div>

      {/* Center game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <p className="text-game-arrow/50 text-xs uppercase tracking-[0.2em] mb-5">
          Complete the pattern
        </p>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-8">
          {puzzle.grid.flatMap((row, ri) =>
            row.map((tile, ci) => {
              if (tile === null) {
                return (
                  <div
                    key={`${ri}-${ci}`}
                    className={`flex items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 ${
                      feedback === "correct"
                        ? "border-game-correct bg-game-correct/10"
                        : feedback === "wrong"
                        ? "border-game-wrong bg-game-wrong/10"
                        : "border-game-glow/40 bg-game-surface/20"
                    }`}
                    style={{ width: 72, height: 72 }}
                  >
                    {feedback === "correct" && selected !== null ? (
                      <PuzzleTile tile={puzzle.answer} cellSize={68} />
                    ) : (
                      <span className="text-2xl font-bold text-game-glow/60">?</span>
                    )}
                  </div>
                );
              }
              return (
                <PuzzleTile key={`${ri}-${ci}`} tile={tile} cellSize={72} />
              );
            })
          )}
        </div>

        {/* Answer options */}
        <p className="text-game-arrow/40 text-xs uppercase tracking-wider mb-3">
          Choose the missing tile
        </p>
        <div className="flex gap-3">
          {puzzle.options.map((option, i) => {
            const isCorrectOption = JSON.stringify(option) === JSON.stringify(puzzle.answer);
            return (
              <PuzzleTile
                key={i}
                tile={option}
                cellSize={64}
                isOption
                isSelected={selected === i}
                isCorrect={feedback !== null && isCorrectOption}
                isWrong={feedback === "wrong" && selected === i}
                onClick={() => handleSelect(i)}
              />
            );
          })}
        </div>

        {/* Feedback message */}
        <div className="h-7 mt-4 flex items-center">
          {feedback === "correct" && (
            <p className="text-game-correct font-semibold animate-pulse">
              Correct! +{10 + level * 5 + (streak - 1) * 3} pts
            </p>
          )}
          {feedback === "wrong" && (
            <p className="text-game-wrong font-semibold">
              Not quite - look at the highlighted answer
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBlock({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span className="text-game-arrow/60">{icon}</span>
        <p className="text-xs text-game-arrow/60 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-game-text">{value}</p>
    </div>
  );
}

