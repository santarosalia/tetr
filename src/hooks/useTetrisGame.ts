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
} from '../store/tetrisSlice';
import { isValidPosition } from '../utils/tetrisLogic';

// 레벨에 따른 드롭 간격 계산 함수
const calculateDistanceToBottom = (piece: any, board: number[][]): number => {
    if (!piece) return 0;

    let distance = 0;

    // 아래로 이동할 수 있는 최대 거리를 찾음
    while (isValidPosition(piece, board, 0, distance + 1)) {
        distance++;
    }
    console.log(distance);
    return distance;
};

// calculateDropInterval 함수 수정
const calculateDropInterval = (level: number, distanceToBottom: number = 0): number => {
    // 표준 테트리스 속도 공식: (0.8 - ((level - 1) * 0.007))^(level - 1) * 1000
    // 최소 50ms, 최대 1000ms
    if (level <= 0) return 1000;
    if (level >= 29) return 50;

    const baseInterval = Math.pow(0.8 - (level - 1) * 0.007, level - 1) * 1000;
    let interval = Math.max(50, Math.min(1000, baseInterval));

    // 바닥까지의 거리가 0이면 인터벌을 늘림 (더 천천히 떨어지도록)
    if (distanceToBottom === 0) {
        interval = Math.min(1000); // 1초로 고정
    }

    return interval;
};

export const useTetrisGame = () => {
    const dispatch = useAppDispatch();
    const gameState = useAppSelector((state) => state.tetris);

    const dropIntervalRef = useRef<number | null>(null);
    const lastDropTimeRef = useRef<number>(0);

    // 키 반복 시스템을 위한 ref들
    const keyRepeatRef = useRef<{ [key: string]: number }>({});
    const keyRepeatTimersRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

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

    // 키 반복 처리 함수
    const handleKeyRepeat = useCallback(
        (key: string) => {
            if (gameState.gameOver || gameState.paused) return;

            switch (key) {
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
            }
        },
        [gameState.gameOver, gameState.paused, handleMovePiece]
    );

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

            // 이미 처리된 키는 무시
            if (event.repeat) return;

            switch (event.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    handleMovePiece(-1, 0);
                    // 키 반복 시작
                    keyRepeatRef.current[event.key] = Date.now();
                    if (keyRepeatTimersRef.current[event.key]) {
                        clearTimeout(keyRepeatTimersRef.current[event.key]!);
                    }
                    keyRepeatTimersRef.current[event.key] = setTimeout(() => {
                        const interval = setInterval(() => {
                            handleKeyRepeat(event.key);
                        }, 50); // 50ms 간격으로 반복
                        keyRepeatTimersRef.current[event.key] = interval as any;
                    }, 100); // 50ms 후 반복 시작
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    handleMovePiece(1, 0);
                    keyRepeatRef.current[event.key] = Date.now();
                    if (keyRepeatTimersRef.current[event.key]) {
                        clearTimeout(keyRepeatTimersRef.current[event.key]!);
                    }
                    keyRepeatTimersRef.current[event.key] = setTimeout(() => {
                        const interval = setInterval(() => {
                            handleKeyRepeat(event.key);
                        }, 50);
                        keyRepeatTimersRef.current[event.key] = interval as any;
                    }, 100);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    handleMovePiece(0, 1);
                    keyRepeatRef.current[event.key] = Date.now();
                    if (keyRepeatTimersRef.current[event.key]) {
                        clearTimeout(keyRepeatTimersRef.current[event.key]!);
                    }
                    keyRepeatTimersRef.current[event.key] = setTimeout(() => {
                        const interval = setInterval(() => {
                            handleKeyRepeat(event.key);
                        }, 50);
                        keyRepeatTimersRef.current[event.key] = interval as any;
                    }, 100);
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

        const handleKeyUp = (event: KeyboardEvent) => {
            // 키 반복 중지
            if (keyRepeatTimersRef.current[event.key]) {
                if (typeof keyRepeatTimersRef.current[event.key] === 'number') {
                    clearTimeout(keyRepeatTimersRef.current[event.key]!);
                } else {
                    clearInterval(
                        keyRepeatTimersRef.current[event.key] as NodeJS.Timeout
                    );
                }
                keyRepeatTimersRef.current[event.key] = null;
            }
            delete keyRepeatRef.current[event.key];
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);

            // 컴포넌트 언마운트 시 모든 타이머 정리
            Object.values(keyRepeatTimersRef.current).forEach((timer) => {
                if (timer) {
                    if (typeof timer === 'number') {
                        clearTimeout(timer);
                    } else {
                        clearInterval(timer);
                    }
                }
            });
        };
    }, [
        handleMovePiece,
        handleRotatePiece,
        handleHardDrop,
        handleTogglePause,
        handleHoldPiece,
        handleResetGame,
        handleKeyRepeat,
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

            // 현재 피스의 바닥까지의 거리 계산
            const distanceToBottom = calculateDistanceToBottom(
                gameState.currentPiece,
                gameState.board
            );
            const dropInterval = calculateDropInterval(gameState.level, distanceToBottom);
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
    }, [
        dispatch,
        gameState.gameOver,
        gameState.paused,
        gameState.level,
        gameState.currentPiece,
        gameState.board,
    ]);

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
