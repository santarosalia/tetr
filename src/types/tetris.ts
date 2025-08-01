export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  position: Position;
  rotation: number;
  shape: number[][];
}

export interface GameState {
  board: number[][];
  currentPiece: Tetromino | null;
  nextPiece: TetrominoType;
  heldPiece: TetrominoType | null;
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  paused: boolean;
  isGameStarted: boolean;
  ghostPiece: Tetromino | null;
}

export interface GameConfig {
  boardWidth: number;
  boardHeight: number;
  blockSize: number;
  dropInterval: number;
} 