import { TetrominoType, Position, Tetromino, GameConfig } from './shared';

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

// 게임 설정은 공통 타입 사용
export type { GameConfig };
