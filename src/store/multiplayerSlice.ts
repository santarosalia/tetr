import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Player {
    id: string;
    name: string;
    score: number;
    level: number;
    lines: number;
    gameOver: boolean;
}

interface GameState {
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

interface MultiplayerState {
    roomId: string | null;
    currentPlayer: Player | null;
    players: Player[];
    gameStarted: boolean;
    gameOver: boolean;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    gameState: GameState | null;
}

const initialState: MultiplayerState = {
    roomId: null,
    currentPlayer: null,
    players: [],
    gameStarted: false,
    gameOver: false,
    isConnected: false,
    isLoading: false,
    error: null,
    gameState: null,
};

const multiplayerSlice = createSlice({
    name: 'multiplayer',
    initialState,
    reducers: {
        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        updatePlayers: (state, action: PayloadAction<Player[]>) => {
            state.players = action.payload;
        },
        updateCurrentPlayer: (state, action: PayloadAction<Player>) => {
            state.currentPlayer = action.payload;
        },
        setGameStarted: (state, action: PayloadAction<boolean>) => {
            state.gameStarted = action.payload;
        },
        setGameOver: (state, action: PayloadAction<boolean>) => {
            state.gameOver = action.payload;
        },
        updatePlayerScore: (
            state,
            action: PayloadAction<{
                playerId: string;
                score: number;
                level: number;
                lines: number;
            }>
        ) => {
            const { playerId, score, level, lines } = action.payload;
            const player = state.players.find((p) => p.id === playerId);
            if (player) {
                player.score = score;
                player.level = level;
                player.lines = lines;
            }
            if (state.currentPlayer?.id === playerId) {
                state.currentPlayer.score = score;
                state.currentPlayer.level = level;
                state.currentPlayer.lines = lines;
            }
        },
        setPlayerGameOver: (state, action: PayloadAction<string>) => {
            const playerId = action.payload;
            const player = state.players.find((p) => p.id === playerId);
            if (player) {
                player.gameOver = true;
            }
            if (state.currentPlayer?.id === playerId) {
                state.currentPlayer.gameOver = true;
            }
        },
        clearError: (state) => {
            state.error = null;
        },
        resetMultiplayer: (state) => {
            return initialState;
        },
        joinRoom: (
            state,
            action: PayloadAction<{ roomId: string; playerName: string }>
        ) => {
            state.roomId = action.payload.roomId;
            state.isLoading = false;
            state.error = null;
        },
        leaveRoom: (state) => {
            return initialState;
        },
        startMultiplayerGame: (state, action: PayloadAction<{ roomId: string }>) => {
            state.roomId = action.payload.roomId;
            state.gameStarted = true;
            state.isLoading = false;
            state.error = null;
        },
        updateGameState: (state, action: PayloadAction<GameState>) => {
            state.gameState = action.payload;
        },
        updateBoard: (state, action: PayloadAction<number[][]>) => {
            if (state.gameState) {
                state.gameState.board = action.payload;
            }
        },
        updateCurrentPiece: (state, action: PayloadAction<any>) => {
            if (state.gameState) {
                state.gameState.currentPiece = action.payload;
            }
        },
        updateNextPiece: (state, action: PayloadAction<any>) => {
            if (state.gameState) {
                state.gameState.nextPiece = action.payload;
            }
        },
        updateHeldPiece: (state, action: PayloadAction<any>) => {
            if (state.gameState) {
                state.gameState.heldPiece = action.payload;
            }
        },
        updateScore: (state, action: PayloadAction<number>) => {
            if (state.gameState) {
                state.gameState.score = action.payload;
            }
        },
        updateLevel: (state, action: PayloadAction<number>) => {
            if (state.gameState) {
                state.gameState.level = action.payload;
            }
        },
        updateLines: (state, action: PayloadAction<number>) => {
            if (state.gameState) {
                state.gameState.lines = action.payload;
            }
        },
        setPaused: (state, action: PayloadAction<boolean>) => {
            if (state.gameState) {
                state.gameState.paused = action.payload;
            }
        },
    },
});

export const {
    setConnectionStatus,
    updatePlayers,
    updateCurrentPlayer,
    setGameStarted,
    setGameOver,
    updatePlayerScore,
    setPlayerGameOver,
    clearError,
    resetMultiplayer,
    joinRoom,
    leaveRoom,
    startMultiplayerGame,
    updateGameState,
    updateBoard,
    updateCurrentPiece,
    updateNextPiece,
    updateHeldPiece,
    updateScore,
    updateLevel,
    updateLines,
    setPaused,
} = multiplayerSlice.actions;

export default multiplayerSlice.reducer;
