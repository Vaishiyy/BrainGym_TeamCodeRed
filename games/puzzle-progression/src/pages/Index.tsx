import { useState, useCallback, useEffect } from "react";
import { GameHeader } from "@/components/GameHeader";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { GameSidebar } from "@/components/GameSidebar";
import { LevelComplete } from "@/components/LevelComplete";
import { useTimer } from "@/hooks/useTimer";
import { getLevelInfo, shuffleBoard, moveTile, isSolved } from "@/lib/puzzle";

const Index = () => {
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const timer = useTimer();

  const { size, totalTiles } = getLevelInfo(level);
  const puzzleName = `${totalTiles}-Puzzle`;

  const startLevel = useCallback(
    (lvl: number) => {
      const { size } = getLevelInfo(lvl);
      setBoard(shuffleBoard(size));
      setMoves(0);
      setCompleted(false);
      timer.reset();
      timer.start();
    },
    [timer]
  );

  useEffect(() => {
    startLevel(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTileClick = (index: number) => {
    if (completed) return;
    const newBoard = moveTile(index, board, size);
    if (newBoard) {
      const nextMoves = moves + 1;
      setBoard(newBoard);
      setMoves(nextMoves);
      if (isSolved(newBoard)) {
        const levelPoints = Math.max(25, level * 120 - nextMoves * 3 - timer.seconds);
        setScore((previous) => previous + levelPoints);
        timer.stop();
        setCompleted(true);
      }
    }
  };

  const handleNextLevel = () => {
    const next = level + 1;
    setLevel(next);
    startLevel(next);
  };

  useEffect(() => {
    localStorage.setItem(
      "brainGymGameScore:puzzle-progression",
      JSON.stringify({
        score,
        scoreUnit: "points",
        label: "Score",
        level,
        moves,
        state: completed ? "level-complete" : "playing",
        updatedAt: new Date().toISOString()
      })
    );
  }, [score, level, moves, completed]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1">
        {/* Main area */}
        <div className="flex-1 flex flex-col">
          <GameHeader title={`Mystic Square — Level ${level}`} />
          <div className="flex-1 flex items-center justify-center p-8">
            <PuzzleBoard board={board} size={size} onTileClick={handleTileClick} />
          </div>
        </div>
        {/* Sidebar */}
        <GameSidebar
          time={timer.formatted}
          moves={moves}
          level={level}
          score={score}
          puzzleName={puzzleName}
        />
      </div>

      {completed && (
        <LevelComplete
          level={level}
          time={timer.formatted}
          moves={moves}
          onNext={handleNextLevel}
        />
      )}
    </div>
  );
};

export default Index;
