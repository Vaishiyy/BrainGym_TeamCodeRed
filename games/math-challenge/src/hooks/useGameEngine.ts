import { useState, useCallback, useEffect, useRef } from 'react';

// --- Types ---
export type GameMode = 'classic' | 'timed' | 'challenge';
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';
export type Operator = '+' | '-' | '×' | '÷';

export interface GameQuestion {
  expression: string;
  answer: number;
  choices: number[];
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  lives: number;
  level: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeLeft: number;
}

interface HighScoreEntry {
  score: number;
  mode: GameMode;
  date: string;
}

// --- Constants ---
const INITIAL_LIVES = 3;
const TIMED_MODE_SECONDS = 60;
const CHALLENGE_QUESTIONS_PER_LEVEL = 10;
const MAX_CHALLENGE_LEVELS = 10;
const BASE_POINTS = 100;
const COMBO_MULTIPLIER = 0.5; // extra 50% per combo step

// --- Helpers ---

/** Generate a random int between min and max inclusive */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate a math question based on difficulty level */
function generateQuestion(level: number): GameQuestion {
  const operators: Operator[] = ['+', '-', '×', '÷'];

  const op = operators[randInt(0, operators.length - 1)];
  const maxNum = Math.min(10 + level * 5, 100);
  let a: number, b: number, answer: number;

  switch (op) {
    case '+':
      a = randInt(1, maxNum);
      b = randInt(1, maxNum);
      answer = a + b;
      break;
    case '-':
      a = randInt(1, maxNum);
      b = randInt(1, a); // ensure positive result
      answer = a - b;
      break;
    case '×':
      a = randInt(2, Math.min(12, maxNum));
      b = randInt(2, Math.min(12, maxNum));
      answer = a * b;
      break;
    case '÷':
      b = randInt(2, Math.min(12, maxNum));
      answer = randInt(1, Math.min(12, maxNum));
      a = b * answer; // ensure clean division
      break;
    default:
      a = 1; b = 1; answer = 2;
  }

  const expression = `${a} ${op} ${b}`;

  // Generate 4 choices including the correct answer
  const choices = new Set<number>([answer]);
  while (choices.size < 4) {
    const offset = randInt(-10, 10);
    const wrong = answer + offset;
    if (wrong !== answer && wrong >= 0) {
      choices.add(wrong);
    }
  }

  // Shuffle choices
  const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);

  return { expression, answer, choices: shuffled };
}

/** Calculate points for a correct answer */
function calculatePoints(combo: number, level: number): number {
  const comboBonus = 1 + combo * COMBO_MULTIPLIER;
  return Math.floor(BASE_POINTS * level * comboBonus);
}

/** Get/set high scores from localStorage */
function getHighScores(): HighScoreEntry[] {
  try {
    const raw = localStorage.getItem('arithmetica_highscores');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHighScore(score: number, mode: GameMode) {
  const scores = getHighScores();
  scores.push({ score, mode, date: new Date().toISOString() });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('arithmetica_highscores', JSON.stringify(scores.slice(0, 10)));
}

export function getTopScores(mode?: GameMode): HighScoreEntry[] {
  const scores = getHighScores();
  if (mode) return scores.filter(s => s.mode === mode).slice(0, 5);
  return scores.slice(0, 10);
}

// --- Hook ---
export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [stats, setStats] = useState<GameStats>({
    score: 0, combo: 0, maxCombo: 0, lives: INITIAL_LIVES,
    level: 1, questionsAnswered: 0, correctAnswers: 0, timeLeft: 0,
  });
  const [question, setQuestion] = useState<GameQuestion | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Start a new game */
  const startGame = useCallback((mode: GameMode) => {
    setGameMode(mode);
    const initialStats: GameStats = {
      score: 0, combo: 0, maxCombo: 0, lives: INITIAL_LIVES,
      level: 1, questionsAnswered: 0, correctAnswers: 0,
      timeLeft: mode === 'timed' ? TIMED_MODE_SECONDS : 0,
    };
    setStats(initialStats);
    setQuestion(generateQuestion(1));
    setFeedback(null);
    setPointsEarned(0);
    setGameState('playing');
  }, []);

  /** Handle player's answer selection */
  const submitAnswer = useCallback((selected: number) => {
    if (!question || gameState !== 'playing') return;

    const isCorrect = selected === question.answer;

    setStats(prev => {
      const newStats = { ...prev };
      newStats.questionsAnswered++;

      if (isCorrect) {
        newStats.correctAnswers++;
        newStats.combo++;
        newStats.maxCombo = Math.max(newStats.maxCombo, newStats.combo);
        const pts = calculatePoints(newStats.combo, newStats.level);
        newStats.score += pts;
        setPointsEarned(pts);

        // Level up logic
        if (gameMode === 'challenge') {
          if (newStats.correctAnswers % CHALLENGE_QUESTIONS_PER_LEVEL === 0) {
            newStats.level = Math.min(newStats.level + 1, MAX_CHALLENGE_LEVELS);
          }
        } else {
          // Level up every 10 correct answers
          if (newStats.correctAnswers % 10 === 0) {
            newStats.level++;
          }
        }
      } else {
        newStats.combo = 0;
        newStats.lives--;
        setPointsEarned(0);
      }

      return newStats;
    });

    setFeedback(isCorrect ? 'correct' : 'wrong');

    // Generate next question after a short delay
    setTimeout(() => {
      setFeedback(null);
      setStats(prev => {
        // Check game over conditions
        if (prev.lives <= 0) {
          setGameState('gameover');
          saveHighScore(prev.score, gameMode);
          return prev;
        }
        if (gameMode === 'challenge' && prev.level > MAX_CHALLENGE_LEVELS) {
          setGameState('gameover');
          saveHighScore(prev.score, gameMode);
          return prev;
        }
        // Generate next question
        setQuestion(generateQuestion(prev.level));
        return prev;
      });
    }, 400);
  }, [question, gameState, gameMode]);

  /** Timer for timed mode */
  useEffect(() => {
    if (gameState === 'playing' && gameMode === 'timed') {
      timerRef.current = setInterval(() => {
        setStats(prev => {
          if (prev.timeLeft <= 1) {
            setGameState('gameover');
            saveHighScore(prev.score, gameMode);
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, gameMode]);

  /** Return to menu */
  const goToMenu = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('menu');
    setQuestion(null);
    setFeedback(null);
  }, []);

  return {
    gameState,
    gameMode,
    stats,
    question,
    feedback,
    pointsEarned,
    startGame,
    submitAnswer,
    goToMenu,
  };
}
