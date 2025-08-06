import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppSelector } from './redux';
import { useMultiplayer } from './useMultiplayer';

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
    const gameState = useAppSelector(selectGameState);
    const { handleInput } = useMultiplayer();

    // ref들을 사용하여 불필요한 리렌더링 방지
    const keyRepeatRef = useRef<{ [key: string]: number }>({});
    const keyRepeatTimersRef = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

    // 서버에 입력 전송하는 함수들
    const sendMoveLeft = useCallback(() => {
            handleInput('move_left');
    }, [handleInput]);

    const sendMoveRight = useCallback(() => {
        handleInput('move_right');
    }, [handleInput]);

    const sendMoveDown = useCallback(() => {
        handleInput('move_down');
    }, [handleInput]);

    const sendRotate = useCallback(() => {
        handleInput('rotate');
    }, [handleInput]);

    const sendHardDrop = useCallback(() => {
        handleInput('hard_drop');
    }, [handleInput]);

    const sendHold = useCallback(() => {
        handleInput('hold');
    }, [handleInput]);

    // 키 반복 처리 함수 (메모이제이션)
    const handleKeyRepeat = useCallback(
        (key: string) => {
            if (gameState.gameOver || gameState.paused) return;

            switch (key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    sendMoveLeft();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    sendMoveRight();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    sendMoveDown();
                    break;
            }
        },
        [gameState.gameOver, gameState.paused, sendMoveLeft, sendMoveRight, sendMoveDown]
    );

    // 키보드 이벤트 핸들러 (메모이제이션)
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (gameState.gameOver) {
                // 게임 오버 시 재시작은 서버에서 처리
                return;
            }

            if (gameState.paused) {
                // 일시정지는 서버에서 처리
                return;
            }

            // 이미 처리된 키는 무시
            if (event.repeat) return;

            switch (event.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    sendMoveLeft();
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
                    sendMoveRight();
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
                    sendMoveDown();
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
                    sendRotate();
                    break;
                case ' ':
                    sendHardDrop();
                    break;
                case 'Shift':
                case 'ShiftLeft':
                case 'ShiftRight':
                    sendHold();
                    break;
            }
        },
        [
            gameState.gameOver,
            gameState.paused,
            sendMoveLeft,
            sendMoveRight,
            sendMoveDown,
            sendRotate,
            sendHardDrop,
            sendHold,
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

    // 메모이제이션된 반환값
    const gameActions = useMemo(
        () => ({
            moveLeft: sendMoveLeft,
            moveRight: sendMoveRight,
            moveDown: sendMoveDown,
            rotate: sendRotate,
            hardDrop: sendHardDrop,
            hold: sendHold,
        }),
        [sendMoveLeft, sendMoveRight, sendMoveDown, sendRotate, sendHardDrop, sendHold]
    );

    return {
        gameState,
        ...gameActions,
    };
};
