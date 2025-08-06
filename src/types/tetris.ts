import { TetrominoType, Tetromino, GameConfig } from './shared';

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
    nextPieces: TetrominoType[]; // 테트리스 표준: 다음 피스들을 저장하는 큐
}

// 게임 설정은 공통 타입 사용
export type { GameConfig };
