import { useState, useCallback, useRef, useEffect } from "react";

export type SimonColor = "green" | "red" | "yellow" | "blue";
export type Difficulty = "easy" | "medium" | "hard";
export type GameState = "idle" | "playing" | "showing" | "input" | "gameover";

const COLORS: SimonColor[] = ["green", "red", "yellow", "blue"];

const SPEED_MAP: Record<Difficulty, number> = {
  easy: 800,
  medium: 500,
  hard: 300,
};

// Web Audio API frequencies for each color
const FREQ_MAP: Record<SimonColor, number> = {
  green: 392,   // G4
  red: 329.63,  // E4
  yellow: 261.63, // C4
  blue: 440,    // A4
};

function playTone(frequency: number, duration: number, audioCtx: AudioContext) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
  osc.start();
  osc.stop(audioCtx.currentTime + duration / 1000);
}

function playErrorSound(audioCtx: AudioContext) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = "sawtooth";
  osc.frequency.value = 150;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

export function useSimonGame() {
  const [sequence, setSequence] = useState<SimonColor[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [activeColor, setActiveColor] = useState<SimonColor | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("simon-high-score");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const playColorSound = useCallback(
    (color: SimonColor) => {
      if (!soundEnabled) return;
      const ctx = getAudioCtx();
      playTone(FREQ_MAP[color], SPEED_MAP[difficulty] * 0.8, ctx);
    },
    [soundEnabled, difficulty, getAudioCtx]
  );

  const flashColor = useCallback(
    (color: SimonColor, duration: number): Promise<void> => {
      return new Promise((resolve) => {
        setActiveColor(color);
        playColorSound(color);
        const t = window.setTimeout(() => {
          setActiveColor(null);
          const t2 = window.setTimeout(resolve, duration * 0.3);
          timeoutsRef.current.push(t2);
        }, duration);
        timeoutsRef.current.push(t);
      });
    },
    [playColorSound]
  );

  const showSequence = useCallback(
    async (seq: SimonColor[]) => {
      setGameState("showing");
      const speed = SPEED_MAP[difficulty];
      // Small delay before starting
      await new Promise((r) => {
        const t = window.setTimeout(r, 500);
        timeoutsRef.current.push(t);
      });
      for (const color of seq) {
        await flashColor(color, speed);
      }
      setGameState("input");
      setPlayerIndex(0);
    },
    [difficulty, flashColor]
  );

  const addToSequence = useCallback(() => {
    const next = COLORS[Math.floor(Math.random() * 4)];
    const newSeq = [...sequence, next];
    setSequence(newSeq);
    return newSeq;
  }, [sequence]);

  const startGame = useCallback(() => {
    clearTimeouts();
    setScore(0);
    setPlayerIndex(0);
    const first = COLORS[Math.floor(Math.random() * 4)];
    const newSeq = [first];
    setSequence(newSeq);
    setGameState("playing");
    // Use timeout to allow state to settle
    const t = window.setTimeout(() => showSequence(newSeq), 300);
    timeoutsRef.current.push(t);
  }, [clearTimeouts, showSequence]);

  const handlePlayerInput = useCallback(
    (color: SimonColor) => {
      if (gameState !== "input") return;

      playColorSound(color);
      setActiveColor(color);
      const t = window.setTimeout(() => setActiveColor(null), 200);
      timeoutsRef.current.push(t);

      if (color !== sequence[playerIndex]) {
        // Wrong!
        if (soundEnabled) {
          playErrorSound(getAudioCtx());
        }
        const finalScore = score;
        if (finalScore > highScore) {
          setHighScore(finalScore);
          localStorage.setItem("simon-high-score", finalScore.toString());
        }
        setGameState("gameover");
        return;
      }

      const nextIndex = playerIndex + 1;
      if (nextIndex === sequence.length) {
        // Completed this round
        const newScore = score + 1;
        setScore(newScore);
        setPlayerIndex(0);
        // Add next step
        const next = COLORS[Math.floor(Math.random() * 4)];
        const newSeq = [...sequence, next];
        setSequence(newSeq);
        const t2 = window.setTimeout(() => showSequence(newSeq), 600);
        timeoutsRef.current.push(t2);
      } else {
        setPlayerIndex(nextIndex);
      }
    },
    [gameState, sequence, playerIndex, score, highScore, playColorSound, soundEnabled, getAudioCtx, showSequence]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  useEffect(() => {
    localStorage.setItem(
      "brainGymGameScore:memory-game",
      JSON.stringify({
        score,
        scoreUnit: "points",
        label: "Score",
        state: gameState,
        updatedAt: new Date().toISOString()
      })
    );
  }, [score, gameState]);

  return {
    gameState,
    activeColor,
    score,
    highScore,
    difficulty,
    soundEnabled,
    sequence,
    setDifficulty,
    setSoundEnabled,
    startGame,
    handlePlayerInput,
  };
}
