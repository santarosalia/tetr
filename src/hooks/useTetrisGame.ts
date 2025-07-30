import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  spawnNewPiece,
  movePiece,
  rotatePiece,
  hardDrop,
  dropPiece,
  togglePause,
  resetGame,
  checkGameOver
} from '../store/tetrisSlice';

const INITIAL_DROP_INTERVAL = 1000;

export const useTetrisGame = () => {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.tetris);
  
  const dropIntervalRef = useRef<number | null>(null);
  const lastDropTimeRef = useRef<number>(0);

  const handleMovePiece = useCallback((offsetX: number, offsetY: number) => {
    dispatch(movePiece({ offsetX, offsetY }));
  }, [dispatch]);

  const handleRotatePiece = useCallback(() => {
    dispatch(rotatePiece());
  }, [dispatch]);

  const handleHardDrop = useCallback(() => {
    dispatch(hardDrop());
  }, [dispatch]);

  const handleTogglePause = useCallback(() => {
    dispatch(togglePause());
  }, [dispatch]);

  const handleResetGame = useCallback(() => {
    dispatch(resetGame());
  }, [dispatch]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState.gameOver) {
        if (event.key === 'Enter' || event.key === ' ') {
          handleResetGame();
        }
        return;
      }

      if (gameState.paused) {
        if (event.key === 'p' || event.key === 'P') {
          handleTogglePause();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleMovePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleMovePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleMovePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleRotatePiece();
          break;
        case ' ':
          handleHardDrop();
          break;
        case 'p':
        case 'P':
          handleTogglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMovePiece, handleRotatePiece, handleHardDrop, handleTogglePause, handleResetGame, gameState.gameOver, gameState.paused]);

  // Game loop
  useEffect(() => {
    if (gameState.gameOver || gameState.paused) return;

    const gameLoop = (timestamp: number) => {
      if (!lastDropTimeRef.current) {
        lastDropTimeRef.current = timestamp;
      }

      const dropInterval = Math.max(50, INITIAL_DROP_INTERVAL - gameState.level * 50);
      
      if (timestamp - lastDropTimeRef.current > dropInterval) {
        dispatch(dropPiece());
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
  }, [dispatch, gameState.gameOver, gameState.paused, gameState.level]);

  // Spawn new piece when current piece is null
  useEffect(() => {
    if (!gameState.currentPiece && !gameState.gameOver) {
      dispatch(spawnNewPiece());
    }
  }, [gameState.currentPiece, gameState.gameOver, dispatch]);

  // Check for game over
  useEffect(() => {
    dispatch(checkGameOver());
  }, [gameState.currentPiece, gameState.board, dispatch]);

  return {
    gameState,
    movePiece: handleMovePiece,
    rotatePiece: handleRotatePiece,
    hardDrop: handleHardDrop,
    togglePause: handleTogglePause,
    resetGame: handleResetGame
  };
}; 