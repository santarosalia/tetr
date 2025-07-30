import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from '../types/tetris';
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
  calculateLevel} from '../utils/tetrisLogic';

const INITIAL_DROP_INTERVAL = 1000;

export const useTetrisGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: getRandomTetrominoType(),
    score: 0,
    level: 0,
    lines: 0,
    gameOver: false,
    paused: false
  });

  const dropIntervalRef = useRef<number | null>(null);
  const lastDropTimeRef = useRef<number>(0);

  const spawnNewPiece = useCallback(() => {
    const newPiece = createTetromino(gameState.nextPiece);
    const newNextPiece = getRandomTetrominoType();

    setGameState(prev => ({
      ...prev,
      currentPiece: newPiece,
      nextPiece: newNextPiece
    }));
  }, [gameState.nextPiece]);

  const movePiece = useCallback((offsetX: number, offsetY: number) => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.paused) return;

    const movedPiece = moveTetromino(gameState.currentPiece, gameState.board, offsetX, offsetY);
    if (movedPiece) {
      setGameState(prev => ({
        ...prev,
        currentPiece: movedPiece
      }));
    }
  }, [gameState.currentPiece, gameState.board, gameState.gameOver, gameState.paused]);

  const rotatePiece = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.paused) return;

    const rotatedPiece = rotateTetromino(gameState.currentPiece);
    if (isValidPosition(rotatedPiece, gameState.board)) {
      setGameState(prev => ({
        ...prev,
        currentPiece: rotatedPiece
      }));
    }
  }, [gameState.currentPiece, gameState.board, gameState.gameOver, gameState.paused]);

  const hardDrop = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.paused) return;

    const droppedPiece = dropTetromino(gameState.currentPiece, gameState.board);
    const newBoard = placeTetromino(droppedPiece, gameState.board);
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
    const newScore = gameState.score + calculateScore(linesCleared, gameState.level);
    const newLines = gameState.lines + linesCleared;
    const newLevel = calculateLevel(newLines);

    setGameState(prev => ({
      ...prev,
      board: clearedBoard,
      currentPiece: null,
      score: newScore,
      level: newLevel,
      lines: newLines
    }));
  }, [gameState.currentPiece, gameState.board, gameState.score, gameState.level, gameState.lines, gameState.gameOver, gameState.paused]);

  const dropPiece = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.paused) return;

    const movedPiece = moveTetromino(gameState.currentPiece, gameState.board, 0, 1);
    if (movedPiece) {
      setGameState(prev => ({
        ...prev,
        currentPiece: movedPiece
      }));
    } else {
      // Piece can't move down, place it
      const newBoard = placeTetromino(gameState.currentPiece, gameState.board);
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
      const newScore = gameState.score + calculateScore(linesCleared, gameState.level);
      const newLines = gameState.lines + linesCleared;
      const newLevel = calculateLevel(newLines);

      setGameState(prev => ({
        ...prev,
        board: clearedBoard,
        currentPiece: null,
        score: newScore,
        level: newLevel,
        lines: newLines
      }));
    }
  }, [gameState.currentPiece, gameState.board, gameState.score, gameState.level, gameState.lines, gameState.gameOver, gameState.paused]);

  const togglePause = useCallback(() => {
    if (gameState.gameOver) return;
    setGameState(prev => ({
      ...prev,
      paused: !prev.paused
    }));
  }, [gameState.gameOver]);

  const resetGame = useCallback(() => {
    setGameState({
      board: createEmptyBoard(),
      currentPiece: null,
      nextPiece: getRandomTetrominoType(),
      score: 0,
      level: 0,
      lines: 0,
      gameOver: false,
      paused: false
    });
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.gameOver) {
        if (event.key === 'Enter' || event.key === ' ') {
          resetGame();
        }
        return;
      }

      if (gameState.paused) {
        if (event.key === 'p' || event.key === 'P') {
          togglePause();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          rotatePiece();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePiece, rotatePiece, hardDrop, togglePause, resetGame, gameState.gameOver, gameState.paused]);

  // Game loop
  useEffect(() => {
    if (gameState.gameOver || gameState.paused) return;

    const gameLoop = (timestamp: number) => {
      if (!lastDropTimeRef.current) {
        lastDropTimeRef.current = timestamp;
      }

      const dropInterval = Math.max(50, INITIAL_DROP_INTERVAL - gameState.level * 50);
      
      if (timestamp - lastDropTimeRef.current > dropInterval) {
        dropPiece();
        lastDropTimeRef.current = timestamp;
      }

      dropIntervalRef.current = requestAnimationFrame(gameLoop);
    };

    dropIntervalRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (dropIntervalRef.current) {
        cancelAnimationFrame(dropIntervalRef.current);
      }
    };
  }, [dropPiece, gameState.gameOver, gameState.paused, gameState.level]);

  // Spawn new piece when current piece is null
  useEffect(() => {
    if (!gameState.currentPiece && !gameState.gameOver) {
      spawnNewPiece();
    }
  }, [gameState.currentPiece, gameState.gameOver, spawnNewPiece]);

  // Check for game over
  useEffect(() => {
    if (gameState.currentPiece && !isValidPosition(gameState.currentPiece, gameState.board)) {
      setGameState(prev => ({
        ...prev,
        gameOver: true
      }));
    }
  }, [gameState.currentPiece, gameState.board]);

  return {
    gameState,
    movePiece,
    rotatePiece,
    hardDrop,
    togglePause,
    resetGame
  };
}; 