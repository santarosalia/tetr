import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    Player,
    RoomState,
    MultiplayerState,
    PlayerScoreUpdate,
    GameState,
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
    roomState: null,
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
        setGameState: (state, action: PayloadAction<GameState>) => {
            state.gameState = action.payload;
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
        resetMultiplayer: (_state) => {
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
        leaveRoom: (_state) => {
            return initialState;
        },
        updateRoomState: (state, action: PayloadAction<RoomState>) => {
            state.roomState = action.payload;
        },
    },
});

export const {
    setConnectionStatus,
    updatePlayers,
    updateCurrentPlayer,
    setGameState,
    updatePlayerScore,
    setPlayerGameOver,
    clearError,
    resetMultiplayer,
    joinRoom,
    leaveRoom,
    updateRoomState,
} = multiplayerSlice.actions;

export default multiplayerSlice.reducer;
