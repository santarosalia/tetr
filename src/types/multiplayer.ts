// 멀티플레이어 관련 타입 정의

import { TetrominoType } from './shared';

export interface Player {
    id: string;
    name: string;
    score: number;
    level: number;
    lines: number;
    gameOver: boolean;
    gameState?: PlayerGameState;
}

export interface PlayerGameState {
    score: number;
    level: number;
    linesCleared: number;
    gameOver: boolean;
    gameStarted: boolean;
    currentPiece?: any;
    nextPiece?: any;
    heldPiece?: any;
    canHold?: boolean;
    board?: number[][];
    paused?: boolean;
    gameSeed?: number;
}

export interface GameState {
    playerId: string;
    roomId: string;
    gameStarted: boolean;
    score: number;
    level: number;
    linesCleared: number;
    currentPiece: Piece | null;
    nextPiece: TetrominoType;
    heldPiece: TetrominoType | null;
    canHold: boolean;
    ghostPiece: Piece | null;
    board: number[][];
    gameOver: boolean;
    paused: boolean;
    isGameStarted: boolean;
    startTime: Date;
    lastActivity: Date;
    tetrominoBag: TetrominoType[];
    bagIndex: number;
    bagNumber: number;
    gameSeed: number;
    nextPieces?: TetrominoType[];
}

export interface Piece {
    type: string;
    position: Position;
    rotation: number;
    shape: number[][];
    falling: boolean;
    lockDelay: number;
    dropTime: number;
}
export interface Position {
    x: number;
    y: number;
}
export interface RoomState {
    success: boolean;
    roomId: string;
    players: Player[];
    gameState: GameState;
    newPlayer: Player;
    timestamp: number;
}

export interface MultiplayerState {
    roomId: string | null;
    currentPlayer: Player | null;
    players: Player[];
    gameStarted: boolean;
    gameOver: boolean;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    gameState: GameState | null;
    roomState: RoomState | null;
}

export interface SocketData {
    players?: Player[];
    playerId?: string;
    roomId?: string;
    gameSeed?: number;
    score?: number;
    level?: number;
    lines?: number;
    linesCleared?: number;
    roomInfo?: RoomState;
    playerCount?: number;
    gameState?: {
        players: Player[];
        gameStarted: boolean;
        gameOver: boolean;
        roomStatus?: string;
        averageScore?: number;
        highestScore?: number;
        board?: number[][];
        currentPiece?: any;
        nextPiece?: any;
        heldPiece?: any;
        score?: number;
        level?: number;
        linesCleared?: number;
        paused?: boolean;
        canHold?: boolean;
        lines?: number;
        ghostPiece?: any;
        tetrominoBag?: string[];
        bagIndex?: number;
        bagNumber?: number;
        gameSeed?: number;
        nextPieces?: string[]; // 서버 권위적: 서버에서 받은 다음 피스 큐 (TetrominoType[])
    };
    board?: number[][];
    currentPiece?: any;
    nextPiece?: any;
    heldPiece?: any;
    canHold?: boolean;
    paused?: boolean;
    gameOver?: boolean;
    playerInfo?: any;
    roomState?: {
        players: Player[];
        gameState: any;
        timestamp: number;
    };
    roomStats?: {
        totalRooms?: number;
        waitingRooms?: number;
        playingRooms?: number;
        totalPlayers?: number;
        averageScore?: number;
        highestScore?: number;
    };
    averageScore?: number;
    highestScore?: number;
    timestamp?: number;
    finalScore?: number;
    finalLevel?: number;
    finalLines?: number;
    reason?: string; // 게임오버 이유
    message?: string; // 에러 메시지용
    success?: boolean; // 게임 상태 동기화 수정 응답용
    error?: string; // 게임 상태 동기화 수정 에러용
    changes?: {
        // 델타 업데이트용
        board?: Array<{ x: number; y: number; value: number }>;
        score?: number;
        level?: number;
        linesCleared?: number;
        currentPiece?: any;
        gameOver?: boolean;
        paused?: boolean;
    };
}

export interface PlayerScoreUpdate {
    playerId: string;
    score: number;
    level: number;
    lines: number;
}

export interface JoinRoomResponse {
    success: boolean;
    roomId?: string;
    player?: Player;
    gameSeed?: number;
    error?: {
        code: string;
        message: string;
    };
}
