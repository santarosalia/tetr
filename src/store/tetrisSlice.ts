import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Tetromino } from '../types/tetris';
import {
  createEmptyBoard,
  createTetromino,
  getRandomTetrominoType,
  rotateTetromino,
  isValidPosition,
  placeTetromino,
  clearLines,
  moveTetromino,
  dropTetromino,
  calculateScore,
  calculateLevel,
  calculateHardDropBonus} from '../utils/tetrisLogic';

const initialState: GameState & { lastPlacedPiece: Tetromino | null; isGameStarted: boolean } = {
  board: createEmptyBoard(),
  currentPiece: null,
  nextPiece: getRandomTetrominoType(),
  score: 0,
  level: 0,
  lines: 0,
  gameOver: false,
  paused: false,
  lastPlacedPiece: null,
  isGameStarted: false
};

const tetrisSlice = createSlice({
  name: 'tetris',
  initialState,
  reducers: {
    startGame: (state) => {
      state.isGameStarted = true;
      state.board = createEmptyBoard();
      state.currentPiece = null;
      state.nextPiece = getRandomTetrominoType();
      state.score = 0;
      state.level = 0;
      state.lines = 0;
      state.gameOver = false;
      state.paused = false;
      state.lastPlacedPiece = null;
    },
    
    spawnNewPiece: (state) => {
      const newPiece = createTetromino(state.nextPiece);
      const newNextPiece = getRandomTetrominoType();
      
      state.currentPiece = newPiece;
      state.nextPiece = newNextPiece;
    },
    
    movePiece: (state, action: PayloadAction<{ offsetX: number; offsetY: number }>) => {
      if (!state.currentPiece || state.gameOver || state.paused) return;
      
      const { offsetX, offsetY } = action.payload;
      const movedPiece = moveTetromino(state.currentPiece, state.board, offsetX, offsetY);
      
      if (movedPiece) {
        state.currentPiece = movedPiece;
      }
    },
    
    rotatePiece: (state) => {
      if (!state.currentPiece || state.gameOver || state.paused) return;
      
      const rotatedPiece = rotateTetromino(state.currentPiece);
      if (isValidPosition(rotatedPiece, state.board)) {
        state.currentPiece = rotatedPiece;
      }
    },
    
    hardDrop: (state) => {
      if (!state.currentPiece || state.gameOver || state.paused) return;
      
      const droppedPiece = dropTetromino(state.currentPiece, state.board);
      const dropDistance = droppedPiece.position.y - state.currentPiece.position.y;
      const newBoard = placeTetromino(droppedPiece, state.board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      const newScore = state.score + calculateScore(linesCleared, state.level) + calculateHardDropBonus(state.level, dropDistance);
      const newLines = state.lines + linesCleared;
      // 라인이 클리어될 때만 레벨을 자동 계산, 그렇지 않으면 현재 레벨 유지
      const newLevel = linesCleared > 0 ? calculateLevel(newLines) : state.level;
      
      // 배치된 피스 정보 저장
      state.lastPlacedPiece = droppedPiece;
      
      state.board = clearedBoard;
      state.currentPiece = null;
      state.score = newScore;
      state.level = newLevel;
      state.lines = newLines;
    },
    
    dropPiece: (state) => {
      if (!state.currentPiece || state.gameOver || state.paused) return;
      
      const movedPiece = moveTetromino(state.currentPiece, state.board, 0, 1);
      if (movedPiece) {
        state.currentPiece = movedPiece;
      } else {
        // Piece can't move down, place it
        const newBoard = placeTetromino(state.currentPiece, state.board);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        const newScore = state.score + calculateScore(linesCleared, state.level);
        const newLines = state.lines + linesCleared;
        // 라인이 클리어될 때만 레벨을 자동 계산, 그렇지 않으면 현재 레벨 유지
        const newLevel = linesCleared > 0 ? calculateLevel(newLines) : state.level;
        
        // 배치된 피스 정보 저장
        state.lastPlacedPiece = state.currentPiece;
        
        state.board = clearedBoard;
        state.currentPiece = null;
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
      state.board = createEmptyBoard();
      state.currentPiece = null;
      state.nextPiece = getRandomTetrominoType();
      state.score = 0;
      state.level = 0;
      state.lines = 0;
      state.gameOver = false;
      state.paused = false;
      state.lastPlacedPiece = null;
      state.isGameStarted = false;
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
    }
  }
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
  clearLastPlacedPiece
} = tetrisSlice.actions;

export default tetrisSlice.reducer; 