import { useEffect, useCallback, useRef, useMemo } from 'react';
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
import { calculateDistanceToBottom, calculateDropInterval } from '../utils/tetrisCore';

// 메모이제이션된 게임 상태 선택자
const selectGameState = (state: any) => ({
    gameOver: state.tetris.gameOver,
    paused: state.tetris.paused,
    level: state.tetris.level,
    currentPiece: state.tetris.currentPiece,
    board: state.tetris.board,
});

// 키 반복 설정
const KEY_REPEAT_DELAY = 100; // 초기 지연
const KEY_REPEAT_INTERVAL = 50; // 반복 간격

export const useOptimizedTetrisGame = () => {
    const dispatch = useAppDispatch();
    const gameState = useAppSelector(selectGameState);

    // ref들을 사용하여 불필요한 리렌더링 방지
    const dropIntervalRef = useRef<number | null>(null);
    const lastDropTimeRef = useRef<number>(0);
    const keyRepeatRef = useRef<{ [key: string]: number }>({});
    const keyRepeatTimersRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

    // 메모이제이션된 핸들러들
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

    // 키 반복 처리 함수 (메모이제이션)
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

    // 키보드 이벤트 핸들러 (메모이제이션)
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
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
                        }, KEY_REPEAT_INTERVAL);
                        keyRepeatTimersRef.current[event.key] = interval as any;
                    }, KEY_REPEAT_DELAY);
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
                        }, KEY_REPEAT_INTERVAL);
                        keyRepeatTimersRef.current[event.key] = interval as any;
                    }, KEY_REPEAT_DELAY);
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
                        }, KEY_REPEAT_INTERVAL);
                        keyRepeatTimersRef.current[event.key] = interval as any;
                    }, KEY_REPEAT_DELAY);
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
        },
        [
            gameState.gameOver,
            gameState.paused,
            handleMovePiece,
            handleRotatePiece,
            handleHardDrop,
            handleTogglePause,
            handleHoldPiece,
            handleResetGame,
            handleKeyRepeat,
        ]
    );

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        // 키 반복 중지
        if (keyRepeatTimersRef.current[event.key]) {
            if (typeof keyRepeatTimersRef.current[event.key] === 'number') {
                clearTimeout(keyRepeatTimersRef.current[event.key]!);
            } else {
                clearInterval(keyRepeatTimersRef.current[event.key] as NodeJS.Timeout);
            }
            keyRepeatTimersRef.current[event.key] = null;
        }
        delete keyRepeatRef.current[event.key];
    }, []);

    // 키보드 이벤트 리스너 (최적화)
    useEffect(() => {
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
    }, [handleKeyDown, handleKeyUp]);

    // 게임 루프 (최적화)
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

    // 새로운 피스 생성 (최적화)
    useEffect(() => {
        if (!gameState.currentPiece && !gameState.gameOver) {
            dispatch(spawnNewPiece());
        }
    }, [gameState.currentPiece, gameState.gameOver, dispatch]);

    // 게임 오버 체크 (최적화)
    useEffect(() => {
        dispatch(checkGameOver());
    }, [gameState.currentPiece, gameState.board, dispatch]);

    // 메모이제이션된 반환값
    const gameActions = useMemo(
        () => ({
            movePiece: handleMovePiece,
            rotatePiece: handleRotatePiece,
            hardDrop: handleHardDrop,
            togglePause: handleTogglePause,
            resetGame: handleResetGame,
        }),
        [
            handleMovePiece,
            handleRotatePiece,
            handleHardDrop,
            handleTogglePause,
            handleResetGame,
        ]
    );

    return {
        gameState,
        ...gameActions,
    };
};
