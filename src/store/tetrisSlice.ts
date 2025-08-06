import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState } from '../types/tetris';
import { Tetromino, TetrominoType } from '../types/shared';

const initialState: GameState & {
    lastPlacedPiece: Tetromino | null;
    isGameStarted: boolean;
    ghostPiece: Tetromino | null;
    gameSeed?: number;
    nextPieces: TetrominoType[]; // 서버 권위적: 서버에서 받은 다음 피스 큐
} = {
    board: Array(20)
        .fill(null)
        .map(() => Array(10).fill(0)),
    currentPiece: null,
    nextPiece: 'I',
    heldPiece: null,
    canHold: true,
    score: 0,
    level: 0,
    lines: 0,
    gameOver: false,
    paused: false,
    lastPlacedPiece: null,
    isGameStarted: false,
    ghostPiece: null,
    gameSeed: undefined,
    nextPieces: [], // 서버에서 받은 다음 피스 큐 초기화
};

const tetrisSlice = createSlice({
    name: 'tetris',
    initialState,
    reducers: {
        // 서버 권위적: 클라이언트는 서버 상태만 동기화
        startGame: (state) => {
            state.isGameStarted = true;
            state.board = Array(20)
                .fill(null)
                .map(() => Array(10).fill(0));
            state.currentPiece = null;
            state.nextPiece = 'I';
            state.heldPiece = null;
            state.canHold = true;
            state.score = 0;
            state.level = 0;
            state.lines = 0;
            state.gameOver = false;
            state.paused = false;
            state.lastPlacedPiece = null;
            state.ghostPiece = null;
            state.nextPieces = [];
        },

        startGameWithSeed: (state, action: PayloadAction<{ seed: number }>) => {
            console.log('Client: Starting game with seed:', action.payload.seed);
            state.isGameStarted = true;
            state.board = Array(20)
                .fill(null)
                .map(() => Array(10).fill(0));
            state.currentPiece = null;
            state.nextPiece = 'I';
            state.heldPiece = null;
            state.canHold = true;
            state.score = 0;
            state.level = 0;
            state.lines = 0;
            state.gameOver = false;
            state.paused = false;
            state.lastPlacedPiece = null;
            state.ghostPiece = null;
            state.gameSeed = action.payload.seed;
            state.nextPieces = [];
            console.log('Client: Game state initialized with seed:', state.gameSeed);
        },

        // 서버 권위적: 클라이언트는 게임 로직을 처리하지 않음
        // 모든 게임 로직은 서버에서 처리하고 클라이언트는 상태만 동기화

        setGameOver: (state, action: PayloadAction<boolean>) => {
            state.gameOver = action.payload;
        },

        setGameSeed: (state, action: PayloadAction<number>) => {
            state.gameSeed = action.payload;
            console.log('Client: Game seed set to:', action.payload);
        },

        setLevel: (state, action: PayloadAction<number>) => {
            const newLevel = Math.max(0, Math.min(29, action.payload));
            state.level = newLevel;
        },

        clearLastPlacedPiece: (state) => {
            state.lastPlacedPiece = null;
        },

        // 서버와 동기화를 위한 액션들 (서버 권위적)
        syncGameState: (
            state,
            action: PayloadAction<{
                board?: number[][];
                currentPiece?: Tetromino | null;
                nextPiece?: TetrominoType;
                heldPiece?: TetrominoType | null;
                canHold?: boolean;
                score?: number;
                level?: number;
                lines?: number;
                gameOver?: boolean;
                paused?: boolean;
                ghostPiece?: Tetromino | null;
                nextPieces?: TetrominoType[]; // 서버에서 받은 다음 피스 큐
            }>
        ) => {
            // 서버 상태와 동기화
            if (action.payload.board !== undefined) state.board = action.payload.board;
            if (action.payload.currentPiece !== undefined)
                state.currentPiece = action.payload.currentPiece;
            if (action.payload.nextPiece !== undefined)
                state.nextPiece = action.payload.nextPiece;
            if (action.payload.heldPiece !== undefined)
                state.heldPiece = action.payload.heldPiece;
            if (action.payload.canHold !== undefined)
                state.canHold = action.payload.canHold;
            if (action.payload.score !== undefined) state.score = action.payload.score;
            if (action.payload.level !== undefined) state.level = action.payload.level;
            if (action.payload.lines !== undefined) state.lines = action.payload.lines;
            if (action.payload.gameOver !== undefined)
                state.gameOver = action.payload.gameOver;
            if (action.payload.paused !== undefined) state.paused = action.payload.paused;
            if (action.payload.ghostPiece !== undefined)
                state.ghostPiece = action.payload.ghostPiece;
            if (action.payload.nextPieces !== undefined)
                state.nextPieces = action.payload.nextPieces;
        },

        // 개별 상태 업데이트 액션들 (서버 동기화용)
        updateBoard: (state, action: PayloadAction<number[][]>) => {
            state.board = action.payload;
        },

        updateCurrentPiece: (state, action: PayloadAction<Tetromino | null>) => {
            state.currentPiece = action.payload;
        },

        updateNextPiece: (state, action: PayloadAction<TetrominoType>) => {
            state.nextPiece = action.payload;
        },

        updateHeldPiece: (state, action: PayloadAction<TetrominoType | null>) => {
            state.heldPiece = action.payload;
        },

        updateScore: (state, action: PayloadAction<number>) => {
            state.score = action.payload;
        },

        updateLevel: (state, action: PayloadAction<number>) => {
            state.level = action.payload;
        },

        updateLines: (state, action: PayloadAction<number>) => {
            state.lines = action.payload;
        },

        setPaused: (state, action: PayloadAction<boolean>) => {
            state.paused = action.payload;
        },

        // 전체 게임 상태 업데이트 (서버 동기화용)
        updateGameState: (
            state,
            action: PayloadAction<{
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
            }>
        ) => {
            state.board = action.payload.board;
            state.currentPiece = action.payload.currentPiece;
            state.nextPiece = action.payload.nextPiece;
            state.heldPiece = action.payload.heldPiece;
            state.canHold = action.payload.canHold;
            state.score = action.payload.score;
            state.level = action.payload.level;
            state.lines = action.payload.lines;
            state.gameOver = action.payload.gameOver;
            state.paused = action.payload.paused;
        },
    },
});

export const {
    startGame,
    startGameWithSeed,
    setGameOver,
    setGameSeed,
    setLevel,
    clearLastPlacedPiece,
    syncGameState,
    updateBoard,
    updateCurrentPiece,
    updateNextPiece,
    updateHeldPiece,
    updateScore,
    updateLevel,
    updateLines,
    setPaused,
    updateGameState,
} = tetrisSlice.actions;

export default tetrisSlice.reducer;
