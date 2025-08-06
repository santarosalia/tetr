import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState } from '../store';
import {
    setConnectionStatus,
    updatePlayers,
    setGameStarted,
    setGameOver,
    updatePlayerScore,
    setPlayerGameOver,
    updateRoomInfo,
    updateRoomPlayerCount,
    updateRoomStats,
} from '../store/multiplayerSlice';
import { SocketData, JoinRoomResponse } from '../types/multiplayer';
import { startGameWithSeed, setGameSeed, syncGameState } from '../store/tetrisSlice';
import { TetrominoType } from '../types/shared';

// 전역 Socket 인스턴스 관리
let globalSocket: Socket | null = null;
let isConnecting = false;

// 소켓 이벤트 타입 정의
type SocketEvent =
    | 'connect'
    | 'disconnect'
    | 'connect_error'
    | 'playerScoreUpdate'
    | 'playerGameStateChanged'
    | 'gameStateUpdate'
    | 'existingPlayersState'
    | 'roomGameState'
    | 'roomStateUpdate'
    | 'roomStatsUpdate'
    | 'joinAutoRoomResponse';

export const useMultiplayer = () => {
    const dispatch = useDispatch();
    const multiplayerState = useSelector((state: RootState) => state.multiplayer);
    const tetrisState = useSelector((state: RootState) => state.tetris);
    const socketRef = useRef<Socket | null>(null);

    // 전역 Socket 인스턴스 사용
    const getOrCreateSocket = useCallback((): Socket => {
        if (globalSocket && globalSocket.connected) {
            return globalSocket;
        }

        if (isConnecting) {
            // 연결 중이면 기존 소켓 반환
            return globalSocket || io('http://localhost:3000');
        }

        isConnecting = true;

        // 새로운 Socket 인스턴스 생성
        const socketUrl = 'http://localhost:3000';
        globalSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
        });

        socketRef.current = globalSocket;
        isConnecting = false;

        return globalSocket;
    }, []);

    // 전역 Socket 정리 함수
    const cleanupGlobalSocket = useCallback(() => {
        if (globalSocket) {
            globalSocket.disconnect();
            globalSocket = null;
        }
        isConnecting = false;
    }, []);

    // 소켓 이벤트 핸들러들을 객체로 분리
    const socketEventHandlers = {
        connect: () => {
            console.log('Socket.IO 연결됨');
            console.log('소켓 ID:', globalSocket?.id);
            dispatch(setConnectionStatus(true));
        },

        disconnect: () => {
            console.log('Socket.IO 연결 종료');
            console.log('연결 해제 이유:', globalSocket?.disconnected);
            dispatch(setConnectionStatus(false));
        },

        connect_error: (error: any) => {
            console.error('Socket.IO 연결 오류:', error);
            console.error('오류 메시지:', error.message);
            console.error('오류 코드:', error.code);
            dispatch(setConnectionStatus(false));
        },

        playerScoreUpdate: (data: SocketData) => {
            console.log('점수 업데이트:', data);
            if (
                data.playerId &&
                data.score !== undefined &&
                data.level !== undefined &&
                data.lines !== undefined
            ) {
                dispatch(
                    updatePlayerScore({
                        playerId: data.playerId,
                        score: data.score,
                        level: data.level,
                        lines: data.lines,
                    })
                );
            }
        },

        playerGameStateChanged: (data: SocketData) => {
            console.log('플레이어 게임 상태 변경:', data);
            console.log('데이터 구조:', {
                playerId: data.playerId,
                score: data.score,
                level: data.level,
                linesCleared: data.linesCleared,
                gameOver: data.gameOver,
                timestamp: data.timestamp,
            });

            if (
                data.playerId &&
                data.score !== undefined &&
                data.level !== undefined &&
                data.linesCleared !== undefined
            ) {
                console.log('플레이어 점수 업데이트 실행:', {
                    playerId: data.playerId,
                    score: data.score,
                    level: data.level,
                    lines: data.linesCleared,
                });

                dispatch(
                    updatePlayerScore({
                        playerId: data.playerId,
                        score: data.score,
                        level: data.level,
                        lines: data.linesCleared,
                    })
                );
            } else {
                console.log('플레이어 게임 상태 변경 데이터가 불완전함:', data);
            }
        },

        gameStateUpdate: (data: SocketData) => {
            console.log('게임 상태 업데이트:', data);
            if (data.gameState) {
                // 게임 시작 상태 처리
                if (data.gameState.gameStarted !== undefined) {
                    if (data.gameState.gameStarted && !multiplayerState.gameStarted) {
                        console.log('게임 시작 상태 감지:', data.gameState.gameStarted);
                        dispatch(setGameStarted(true));

                        // 게임 시드가 있으면 시드 기반 게임 시작
                        if (data.gameState.gameSeed && !tetrisState.gameSeed) {
                            console.log(
                                '게임 시드 저장 및 시드 기반 게임 시작:',
                                data.gameState.gameSeed
                            );
                            dispatch(setGameSeed(data.gameState.gameSeed));
                            dispatch(
                                startGameWithSeed({ seed: data.gameState.gameSeed })
                            );
                        }
                    } else if (
                        !data.gameState.gameStarted &&
                        multiplayerState.gameStarted
                    ) {
                        console.log('게임 중지 상태 감지:', data.gameState.gameStarted);
                        dispatch(setGameStarted(false));
                    }
                }

                // 서버 권위적: 시드가 있고 아직 설정되지 않았을 때만 저장
                if (data.gameState.gameSeed && !tetrisState.gameSeed) {
                    console.log('게임 시드 저장:', data.gameState.gameSeed);
                    // Redux 상태에 시드 저장
                    dispatch(setGameSeed(data.gameState.gameSeed));
                }

                // 서버 권위적: 서버에서 받은 다음 피스 큐 처리
                if (
                    data.gameState.nextPieces &&
                    Array.isArray(data.gameState.nextPieces)
                ) {
                    console.log('서버에서 받은 다음 피스 큐:', data.gameState.nextPieces);
                    // syncGameState를 통해 nextPieces도 함께 동기화
                    dispatch(
                        syncGameState({
                            nextPieces: data.gameState.nextPieces as TetrominoType[],
                        })
                    );
                }

                // 현재 피스 정보 로그
                console.log('서버에서 받은 currentPiece:', data.gameState.currentPiece);
                console.log('서버에서 받은 ghostPiece:', data.gameState.ghostPiece);

                // 게임 오버 상태 처리
                if (data.gameState.gameOver) {
                    console.log('서버에서 게임오버 상태 수신:', data);
                    dispatch(setGameOver(true));

                    if (data.playerId) {
                        dispatch(setPlayerGameOver(data.playerId));
                    }
                }

                // 서버 권위적: 서버에서 받은 게임 상태로 동기화
                dispatch(
                    syncGameState({
                        board: data.gameState.board,
                        currentPiece: data.gameState.currentPiece,
                        nextPiece: data.gameState.nextPiece,
                        heldPiece: data.gameState.heldPiece,
                        canHold: data.gameState.canHold,
                        score: data.gameState.score,
                        level: data.gameState.level,
                        lines: data.gameState.linesCleared,
                        gameOver: data.gameState.gameOver,
                        paused: data.gameState.paused,
                        ghostPiece: data.gameState.ghostPiece,
                    })
                );
            }
        },

        roomStateUpdate: (data: SocketData) => {
            console.log('룸 상태 업데이트:', data);
            if (data.players) {
                dispatch(updatePlayers(data.players));
            }
            if (data.gameState) {
                // 게임 시작 상태는 gameStateUpdate에서 처리하므로 여기서는 제거
                dispatch(setGameOver(data.gameState.gameOver));
            }
            if (data.playerCount !== undefined) {
                dispatch(updateRoomPlayerCount(data.playerCount));
            }
            if (data.roomInfo) {
                dispatch(updateRoomInfo(data.roomInfo));
            }
        },

        // 에러 처리
        error: (data: SocketData) => {
            console.error('서버 에러:', data);
            if (data.message) {
                // 에러 메시지를 사용자에게 표시할 수 있음
                console.error('서버 에러 메시지:', data.message);
            }
        },
    };

    // 소켓 이벤트 리스너 등록 함수
    const setupSocketEventListeners = (socket: Socket) => {
        Object.entries(socketEventHandlers).forEach(([event, handler]) => {
            socket.on(event as SocketEvent, handler);
        });
    };

    useEffect(() => {
        // Socket.IO 연결 설정 (한 번만)
        if (!globalSocket || !globalSocket.connected) {
            const connectSocket = () => {
                const socket = getOrCreateSocket();
                setupSocketEventListeners(socket);
            };

            // 연결 시작
            connectSocket();
        }

        // 컴포넌트 언마운트 시
        return () => {
            // 이벤트 리스너는 전역 소켓에서 제거하지 않음
            // 대신 컴포넌트별로 관리하거나 전역적으로 한 번만 관리
        };
    }, []); // 의존성 배열을 비움으로써 한 번만 실행

    // Socket.IO 연결 대기 함수
    const waitForConnection = useCallback((timeoutMs: number = 10000): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (globalSocket && globalSocket.connected) {
                resolve();
                return;
            }

            let attempts = 0;
            const maxAttempts = timeoutMs / 100;
            const checkConnection = () => {
                attempts++;
                if (globalSocket && globalSocket.connected) {
                    console.log('Socket.IO 연결 완료');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Socket.IO 연결 시간 초과'));
                } else {
                    setTimeout(checkConnection, 100);
                }
            };
            checkConnection();
        });
    }, []);

    // Socket.IO를 통해 메시지 전송
    const emitMessage = useCallback((event: string, data: any) => {
        if (globalSocket && globalSocket.connected) {
            globalSocket.emit(event, data);
        } else {
            console.error('Socket.IO가 연결되지 않았습니다.');
            throw new Error('Socket.IO가 연결되지 않았습니다.');
        }
    }, []);

    // 자동 룸 참여 (tetrs 스타일)
    const joinAutoRoom = useCallback(
        (playerName: string): Promise<{ roomId: string; player: any }> => {
            return new Promise((resolve, reject) => {
                if (!globalSocket) {
                    reject(new Error('Socket.IO가 연결되지 않았습니다.'));
                    return;
                }

                // 서버 응답을 기다리는 리스너
                const handleJoinResponse = (response: JoinRoomResponse) => {
                    if (response.success && response.roomId) {
                        console.log('룸 참여 성공:', response);

                        // 서버 권위적: 서버에서 받은 시드로 게임 시작
                        if (response.gameSeed) {
                            console.log('서버로부터 받은 게임 시드:', response.gameSeed);
                            dispatch(startGameWithSeed({ seed: response.gameSeed }));
                        }

                        resolve({ roomId: response.roomId, player: response.player });
                    } else {
                        reject(
                            new Error(
                                response.error?.message || '룸 참여에 실패했습니다.'
                            )
                        );
                    }
                };

                // 응답 리스너 등록
                globalSocket.once('joinAutoRoomResponse', handleJoinResponse);

                // 서버에 요청 전송
                emitMessage('joinAutoRoom', { name: playerName });

                // 타임아웃 설정
                setTimeout(() => {
                    globalSocket?.off('joinAutoRoomResponse', handleJoinResponse);
                    reject(new Error('룸 참여 요청이 시간 초과되었습니다.'));
                }, 10000);
            });
        },
        [emitMessage]
    );

    // 룸 나가기
    const leaveAutoRoom = useCallback(
        (roomId: string, playerId: string) => {
            emitMessage('leaveAutoRoom', { roomId, playerId });
        },
        [emitMessage]
    );

    // 게임 입력 전송 (단순한 입력만)
    const sendPlayerInput = useCallback(
        (playerId: string, action: string) => {
            console.log('플레이어 입력 전송:', { playerId, action });

            // 단순한 입력만 전송 (서버에서 모든 게임 로직 처리)
            emitMessage('handlePlayerInput', {
                playerId,
                action,
            });

            console.log('플레이어 입력 전송 완료');
        },
        [emitMessage]
    );

    const { gameStarted, gameOver, currentPlayer } = multiplayerState;

    const handleInput = useCallback(
        (action: string) => {
            console.log('키보드 입력 처리:', {
                action,
                gameStarted,
                gameOver,
                playerId: currentPlayer?.id,
            });
            if (gameStarted && !gameOver && currentPlayer?.id) {
                // 서버가 기대하는 액션 이름으로 변환
                let serverAction = action;
                switch (action) {
                    case 'move_left':
                        serverAction = 'moveLeft';
                        break;
                    case 'move_right':
                        serverAction = 'moveRight';
                        break;
                    case 'move_down':
                        serverAction = 'moveDown';
                        break;
                    case 'hard_drop':
                        serverAction = 'hardDrop';
                        break;
                    case 'rotate':
                        serverAction = 'rotate';
                        break;
                    case 'hold':
                        serverAction = 'hold';
                        break;
                    default:
                        serverAction = action;
                }
                sendPlayerInput(currentPlayer.id, serverAction);
            }
        },
        [gameStarted, gameOver, currentPlayer?.id, sendPlayerInput]
    );

    return {
        isConnected: multiplayerState.isConnected,
        socket: globalSocket,
        emitMessage,
        joinAutoRoom,
        leaveAutoRoom,
        sendPlayerInput,
        handleInput,
        waitForConnection,
        cleanupGlobalSocket,
    };
};
