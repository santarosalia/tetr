// 공통 타입 정의 (클라이언트용)
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

// 게임 상태 관련 타입
export type GameStatus = 'WAITING' | 'PLAYING' | 'FINISHED' | 'PAUSED';

export interface GameConfig {
    boardWidth: number;
    boardHeight: number;
    blockSize: number;
    dropInterval: number;
}

// 에러 타입
export interface GameError {
    code: string;
    message: string;
    details?: any;
}

// 네트워크 메시지 타입
export interface NetworkMessage<T = any> {
    type: string;
    payload: T;
    timestamp: number;
    playerId?: string;
}
