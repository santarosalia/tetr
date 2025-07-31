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
    checkGameOver,
    holdPiece,
    startGame,
} from '../store/tetrisSlice';

// 레벨에 따른 드롭 간격 계산 함수
const calculateDropInterval = (level: number): number => {
    // 표준 테트리스 속도 공식: (0.8 - ((level - 1) * 0.007))^(level - 1) * 1000
    // 최소 50ms, 최대 1000ms
    if (level <= 0) return 1000;
    if (level >= 29) return 50;

    const baseInterval = Math.pow(0.8 - (level - 1) * 0.007, level - 1) * 1000;
    return Math.max(50, Math.min(1000, baseInterval));
};

export const useTetrisGame = () => {
    const dispatch = useAppDispatch();
    const gameState = useAppSelector((state) => state.tetris);

    const dropIntervalRef = useRef<number | null>(null);
    const lastDropTimeRef = useRef<number>(0);

    const handleMovePiece = useCallback(
        (offsetX: number, offsetY: number) => {
            dispatch(movePiece({ offsetX, offsetY }));
        },
        [dispatch]
    );

    const handleRotatePiece = useCallback(() => {
        dispatch(rotatePiece());
    }, [dispatch]);

    const handleHardDrop = useCallback(() => {
        dispatch(hardDrop());
    }, [dispatch]);

    const handleTogglePause = useCallback(() => {
        dispatch(togglePause());
    }, [dispatch]);

    const handleHoldPiece = useCallback(() => {
        dispatch(holdPiece());
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
                case 'Shift':
                case 'ShiftLeft':
                case 'ShiftRight':
                    handleHoldPiece();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        handleMovePiece,
        handleRotatePiece,
        handleHardDrop,
        handleTogglePause,
        handleHoldPiece,
        handleResetGame,
        gameState.gameOver,
        gameState.paused,
    ]);

    // Game loop
    useEffect(() => {
        if (gameState.gameOver || gameState.paused) return;

        const gameLoop = (timestamp: number) => {
            if (!lastDropTimeRef.current) {
                lastDropTimeRef.current = timestamp;
            }

            const dropInterval = calculateDropInterval(gameState.level);

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
        resetGame: handleResetGame,
    };
};
