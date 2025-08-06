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
    gameSeed?: number;
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
    ghostPiece?: any;
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
    roomId?: string;
    gameSeed?: number;
    score?: number;
    level?: number;
    lines?: number;
    linesCleared?: number;
    roomInfo?: RoomInfo;
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
