import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
    Player, 
    GameState, 
    RoomInfo, 
    MultiplayerState, 
    PlayerScoreUpdate 
} from '../types/multiplayer';

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
    roomInfo: null,
};

const multiplayerSlice = createSlice({
    name: 'multiplayer',
    initialState,
    reducers: {
        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        updatePlayers: (state, action: PayloadAction<Player[]>) => {
            // 서버에서 받은 플레이어 정보를 처리하여 gameState 정보를 기본 정보와 병합
            state.players = action.payload.map((player) => {
                const updatedPlayer = { ...player };

                // gameState 정보가 있으면 기본 정보와 병합
                if (player.gameState) {
                    updatedPlayer.score = player.gameState.score || player.score;
                    updatedPlayer.level = player.gameState.level || player.level;
                    updatedPlayer.lines = player.gameState.linesCleared || player.lines;
                    updatedPlayer.gameOver = player.gameState.gameOver || player.gameOver;
                }

                return updatedPlayer;
            });
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
        updatePlayerScore: (state, action: PayloadAction<PlayerScoreUpdate>) => {
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
        updateRoomInfo: (state, action: PayloadAction<RoomInfo>) => {
            state.roomInfo = action.payload;
        },
        updateRoomPlayerCount: (state, action: PayloadAction<number>) => {
            if (state.roomInfo) {
                state.roomInfo.playerCount = action.payload;
            }
        },
        updateRoomStatus: (state, action: PayloadAction<string>) => {
            if (state.roomInfo) {
                state.roomInfo.roomStatus = action.payload;
            }
        },
        updateRoomStats: (
            state,
            action: PayloadAction<{ averageScore?: number; highestScore?: number }>
        ) => {
            if (state.roomInfo) {
                if (action.payload.averageScore !== undefined) {
                    state.roomInfo.averageScore = action.payload.averageScore;
                }
                if (action.payload.highestScore !== undefined) {
                    state.roomInfo.highestScore = action.payload.highestScore;
                }
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
    updateRoomInfo,
    updateRoomPlayerCount,
    updateRoomStatus,
    updateRoomStats,
} = multiplayerSlice.actions;

export default multiplayerSlice.reducer;
