import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Tetromino } from '../types/tetris';
import {
    createEmptyBoard,
    createTetromino,
    getRandomTetrominoType,
    initializeTetrominoBag,
    rotateTetrominoWithWallKick,
    isValidPosition,
    placeTetromino,
    clearLines,
    moveTetromino,
    dropTetromino,
    calculateScore,
    calculateLevel,
    calculateHardDropBonus,
    getGhostPiece,
} from '../utils/tetrisLogic';

const initialState: GameState & {
    lastPlacedPiece: Tetromino | null;
    isGameStarted: boolean;
    ghostPiece: Tetromino | null;
} = {
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: getRandomTetrominoType(),
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
};

const tetrisSlice = createSlice({
    name: 'tetris',
    initialState,
    reducers: {
        startGame: (state) => {
            // 7-bag 시스템 초기화
            initializeTetrominoBag();
            state.isGameStarted = true;
            state.board = createEmptyBoard();
            state.currentPiece = null;
            state.nextPiece = getRandomTetrominoType();
            state.heldPiece = null;
            state.canHold = true;
            state.score = 0;
            state.level = 0;
            state.lines = 0;
            state.gameOver = false;
            state.paused = false;
            state.lastPlacedPiece = null;
            state.ghostPiece = null;
        },

        spawnNewPiece: (state) => {
            const newPiece = createTetromino(state.nextPiece);
            const newNextPiece = getRandomTetrominoType();

            state.currentPiece = newPiece;
            state.nextPiece = newNextPiece;
            state.canHold = true;
            // 고스트 블록 업데이트
            state.ghostPiece = getGhostPiece(newPiece, state.board);
        },

        movePiece: (
            state,
            action: PayloadAction<{ offsetX: number; offsetY: number }>
        ) => {
            if (!state.currentPiece || state.gameOver || state.paused) return;

            const { offsetX, offsetY } = action.payload;
            const movedPiece = moveTetromino(
                state.currentPiece,
                state.board,
                offsetX,
                offsetY
            );

            if (movedPiece) {
                state.currentPiece = movedPiece;
                // 고스트 블록 업데이트
                state.ghostPiece = getGhostPiece(movedPiece, state.board);
            }
        },

        rotatePiece: (state) => {
            if (!state.currentPiece || state.gameOver || state.paused) return;

            const rotatedPiece = rotateTetrominoWithWallKick(
                state.currentPiece,
                state.board
            );
            if (rotatedPiece) {
                state.currentPiece = rotatedPiece;
                // 고스트 블록 업데이트
                state.ghostPiece = getGhostPiece(rotatedPiece, state.board);
            }
        },

        hardDrop: (state) => {
            if (!state.currentPiece || state.gameOver || state.paused) return;

            const droppedPiece = dropTetromino(state.currentPiece, state.board);
            const dropDistance = droppedPiece.position.y - state.currentPiece.position.y;
            const newBoard = placeTetromino(droppedPiece, state.board);
            const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
            const newScore =
                state.score +
                calculateScore(linesCleared, state.level) +
                calculateHardDropBonus(state.level, dropDistance);
            const newLines = state.lines + linesCleared;
            // 라인이 클리어될 때만 레벨을 자동 계산, 그렇지 않으면 현재 레벨 유지
            const newLevel = linesCleared > 0 ? calculateLevel(newLines) : state.level;

            // 배치된 피스 정보 저장
            state.lastPlacedPiece = droppedPiece;

            state.board = clearedBoard;
            state.currentPiece = null;
            state.ghostPiece = null;
            state.score = newScore;
            state.level = newLevel;
            state.lines = newLines;
        },

        dropPiece: (state) => {
            if (!state.currentPiece || state.gameOver || state.paused) return;

            const movedPiece = moveTetromino(state.currentPiece, state.board, 0, 1);
            if (movedPiece) {
                state.currentPiece = movedPiece;
                // 고스트 블록 업데이트
                state.ghostPiece = getGhostPiece(movedPiece, state.board);
            } else {
                // Piece can't move down, place it
                const newBoard = placeTetromino(state.currentPiece, state.board);
                const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
                const newScore = state.score + calculateScore(linesCleared, state.level);
                const newLines = state.lines + linesCleared;
                // 라인이 클리어될 때만 레벨을 자동 계산, 그렇지 않으면 현재 레벨 유지
                const newLevel =
                    linesCleared > 0 ? calculateLevel(newLines) : state.level;

                // 배치된 피스 정보 저장
                state.lastPlacedPiece = state.currentPiece;

                state.board = clearedBoard;
                state.currentPiece = null;
                state.ghostPiece = null;
                state.score = newScore;
                state.level = newLevel;
                state.lines = newLines;
            }
        },

        togglePause: (state) => {
            if (state.gameOver) return;
            state.paused = !state.paused;
        },

        resetGame: (state) => {
            // 7-bag 시스템 초기화
            initializeTetrominoBag();
            state.board = createEmptyBoard();
            state.currentPiece = null;
            state.nextPiece = getRandomTetrominoType();
            state.heldPiece = null;
            state.canHold = true;
            state.score = 0;
            state.level = 0;
            state.lines = 0;
            state.gameOver = false;
            state.paused = false;
            state.lastPlacedPiece = null;
            state.isGameStarted = false;
            state.ghostPiece = null;
        },

        checkGameOver: (state) => {
            if (state.currentPiece && !isValidPosition(state.currentPiece, state.board)) {
                state.gameOver = true;
            }
        },

        setLevel: (state, action: PayloadAction<number>) => {
            const newLevel = Math.max(0, Math.min(29, action.payload));
            state.level = newLevel;
        },

        clearLastPlacedPiece: (state) => {
            state.lastPlacedPiece = null;
        },

        holdPiece: (state) => {
            if (!state.currentPiece || !state.canHold || state.gameOver || state.paused)
                return;

            const currentType = state.currentPiece.type;

            if (state.heldPiece) {
                // 저장된 블록이 있으면 교체
                const newPiece = createTetromino(state.heldPiece);
                state.currentPiece = newPiece;
                state.heldPiece = currentType;
            } else {
                // 저장된 블록이 없으면 현재 블록을 저장하고 다음 블록으로 교체
                state.heldPiece = currentType;
                const newPiece = createTetromino(state.nextPiece);
                const newNextPiece = getRandomTetrominoType();
                state.currentPiece = newPiece;
                state.nextPiece = newNextPiece;
            }

            // 고스트 블록 업데이트
            state.ghostPiece = getGhostPiece(state.currentPiece, state.board);
            state.canHold = false;
        },
    },
});

export const {
    startGame,
    spawnNewPiece,
    movePiece,
    rotatePiece,
    hardDrop,
    dropPiece,
    togglePause,
    resetGame,
    checkGameOver,
    setLevel,
    clearLastPlacedPiece,
    holdPiece,
} = tetrisSlice.actions;

export default tetrisSlice.reducer;
