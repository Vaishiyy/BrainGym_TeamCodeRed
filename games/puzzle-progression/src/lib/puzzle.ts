// Puzzle utility functions

export function getLevelInfo(level: number) {
  // Level 1 = 8-puzzle (3x3), Level 2 = 15-puzzle (4x4), Level 3 = 24-puzzle (5x5), etc.
  const size = level + 2;
  const totalTiles = size * size - 1;
  return { size, totalTiles };
}

export function createSolvedBoard(size: number): number[] {
  const board: number[] = [];
  for (let i = 1; i < size * size; i++) {
    board.push(i);
  }
  board.push(0); // 0 represents the empty tile
  return board;
}

export function isSolvable(board: number[], size: number): boolean {
  let inversions = 0;
  const flat = board.filter((v) => v !== 0);
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++;
    }
  }

  if (size % 2 === 1) {
    return inversions % 2 === 0;
  } else {
    const emptyRow = Math.floor(board.indexOf(0) / size);
    const fromBottom = size - emptyRow;
    return (inversions + fromBottom) % 2 === 0;
  }
}

export function shuffleBoard(size: number): number[] {
  const solved = createSolvedBoard(size);
  let board: number[];
  do {
    board = [...solved];
    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
  } while (!isSolvable(board, size) || isSolved(board));
  return board;
}

export function isSolved(board: number[]): boolean {
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

export function getNeighbors(index: number, size: number): number[] {
  const neighbors: number[] = [];
  const row = Math.floor(index / size);
  const col = index % size;
  if (row > 0) neighbors.push(index - size);
  if (row < size - 1) neighbors.push(index + size);
  if (col > 0) neighbors.push(index - 1);
  if (col < size - 1) neighbors.push(index + 1);
  return neighbors;
}

export function canMove(index: number, board: number[], size: number): boolean {
  const emptyIndex = board.indexOf(0);
  return getNeighbors(emptyIndex, size).includes(index);
}

export function moveTile(index: number, board: number[], size: number): number[] | null {
  if (!canMove(index, board, size)) return null;
  const newBoard = [...board];
  const emptyIndex = newBoard.indexOf(0);
  [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
  return newBoard;
}

export function isCorrectPosition(index: number, value: number): boolean {
  if (value === 0) return false;
  return index === value - 1;
}
