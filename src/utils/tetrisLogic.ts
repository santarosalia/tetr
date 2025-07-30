import { Tetromino, TetrominoType } from '../types/tetris';
import { TETROMINO_SHAPES, TETROMINO_SPAWN_POSITIONS } from '../constants/tetrominos';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BLOCK_SIZE = 30;

export function createEmptyBoard(): number[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
}

export function createTetromino(type: TetrominoType): Tetromino {
  const spawnPos = TETROMINO_SPAWN_POSITIONS[type];
  return {
    type,
    position: { x: spawnPos.x, y: spawnPos.y },
    rotation: 0,
    shape: TETROMINO_SHAPES[type][0]
  };
}

export function getRandomTetrominoType(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

export function rotateTetromino(tetromino: Tetromino): Tetromino {
  const newRotation = (tetromino.rotation + 1) % 4;
  return {
    ...tetromino,
    rotation: newRotation,
    shape: TETROMINO_SHAPES[tetromino.type][newRotation]
  };
}

export function isValidPosition(
  tetromino: Tetromino,
  board: number[][],
  offsetX: number = 0,
  offsetY: number = 0
): boolean {
  const { shape, position } = tetromino;
  const newX = position.x + offsetX;
  const newY = position.y + offsetY;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = newX + x;
        const boardY = newY + y;

        if (
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          boardY >= BOARD_HEIGHT ||
          (boardY >= 0 && board[boardY][boardX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

export function placeTetromino(tetromino: Tetromino, board: number[][]): number[][] {
  const newBoard = board.map(row => [...row]);
  const { shape, position } = tetromino;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = position.x + x;
        const boardY = position.y + y;
        if (boardY >= 0) {
          newBoard[boardY][boardX] = 1;
        }
      }
    }
  }

  return newBoard;
}

export function clearLines(board: number[][]): { newBoard: number[][]; linesCleared: number } {
  const newBoard = board.filter(row => row.some(cell => cell === 0));
  const linesCleared = board.length - newBoard.length;
  
  // Add empty lines at the top
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(0));
  }

  return { newBoard, linesCleared };
}

export function moveTetromino(
  tetromino: Tetromino,
  board: number[][],
  offsetX: number,
  offsetY: number
): Tetromino | null {
  if (isValidPosition(tetromino, board, offsetX, offsetY)) {
    return {
      ...tetromino,
      position: {
        x: tetromino.position.x + offsetX,
        y: tetromino.position.y + offsetY
      }
    };
  }
  return null;
}

export function dropTetromino(tetromino: Tetromino, board: number[][]): Tetromino {
  let droppedTetromino = tetromino;
  while (isValidPosition(droppedTetromino, board, 0, 1)) {
    droppedTetromino = {
      ...droppedTetromino,
      position: {
        x: droppedTetromino.position.x,
        y: droppedTetromino.position.y + 1
      }
    };
  }
  return droppedTetromino;
}

export function calculateScore(linesCleared: number, level: number): number {
  const lineScores = [0, 100, 300, 500, 800];
  return lineScores[linesCleared] * (level + 1);
}

export function calculateLevel(lines: number): number {
  return Math.floor(lines / 10);
}

export function isGameOver(board: number[][]): boolean {
  return board[0].some(cell => cell === 1);
} 