// 멀티플레이어 관련 타입 정의

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
}

export interface GameState {
    board: number[][];
    currentPiece: any;
    nextPiece: any;
    heldPiece: any;
    canHold: boolean;
    score: number;
    level: number;
    lines: number;
    gameOver: boolean;
    paused: boolean;
}

export interface RoomInfo {
    roomId: string;
    playerCount: number;
    maxPlayers: number;
    roomStatus: string;
    averageScore?: number;
    highestScore?: number;
    createdAt?: string;
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
    roomInfo: RoomInfo | null;
}

export interface SocketData {
    players?: Player[];
    playerId?: string;
    score?: number;
    level?: number;
    lines?: number;
    linesCleared?: number;
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
    roomInfo?: RoomInfo;
    playerCount?: number;
    roomStatus?: string;
    averageScore?: number;
    highestScore?: number;
    roomStats?: {
        averageScore?: number;
        highestScore?: number;
    };
    timestamp?: number;
    finalScore?: number;
    finalLevel?: number;
    finalLines?: number;
}

export interface PlayerScoreUpdate {
    playerId: string;
    score: number;
    level: number;
    lines: number;
}

export interface GameInput {
    action: string;
    currentPiece?: any;
    board?: number[][];
    score?: number;
    level?: number;
    linesCleared?: number;
}

export interface JoinRoomResponse {
    success: boolean;
    roomId?: string;
    player?: Player;
    error?: {
        code: string;
        message: string;
    };
} 