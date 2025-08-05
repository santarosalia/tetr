import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io, Socket } from 'socket.io-client';
import { RootState } from '../store';
import {
    setConnectionStatus,
    updatePlayers,
    updateCurrentPlayer,
    setGameStarted,
    setGameOver,
    updatePlayerScore,
    setPlayerGameOver,
    updateGameState,
    updateBoard,
    updateCurrentPiece,
    updateNextPiece,
    updateHeldPiece,
    updateScore,
    updateLevel,
    updateLines,
    setPaused,
    updateRoomInfo,
    updateRoomPlayerCount,
    updateRoomStatus,
    updateRoomStats,
} from '../store/multiplayerSlice';
import { SocketData, GameInput, JoinRoomResponse } from '../types/multiplayer';

// 소켓 이벤트 타입 정의
type SocketEvent =
    | 'connect'
    | 'disconnect'
    | 'connect_error'
    | 'playerJoined'
    | 'playerLeft'
    | 'gameStarted'
    | 'gameOver'
    | 'playerScoreUpdate'
    | 'playerGameStateChanged'
    | 'playerGameOver'
    | 'gameStateUpdate'
    | 'boardUpdate'
    | 'currentPieceUpdate'
    | 'nextPieceUpdate'
    | 'heldPieceUpdate'
    | 'scoreUpdate'
    | 'levelUpdate'
    | 'linesUpdate'
    | 'pauseUpdate'
    | 'fullGameStateUpdate'
    | 'gameStateUpdated'
    | 'roomPlayersUpdate'
    | 'existingPlayersState'
    | 'roomGameState'
    | 'roomInfoUpdate'
    | 'roomPlayerCountUpdate'
    | 'roomStateUpdate'
    | 'roomStatsUpdate'
    | 'joinAutoRoomResponse';

export const useMultiplayer = () => {
    const dispatch = useDispatch();
    const multiplayerState = useSelector((state: RootState) => state.multiplayer);
    const socketRef = useRef<Socket | null>(null);

    // 소켓 이벤트 핸들러들을 객체로 분리
    const socketEventHandlers = {
        connect: () => {
            console.log('Socket.IO 연결됨');
            console.log('소켓 ID:', socketRef.current?.id);
            dispatch(setConnectionStatus(true));
        },

        disconnect: () => {
            console.log('Socket.IO 연결 종료');
            console.log('연결 해제 이유:', socketRef.current?.disconnected);
            dispatch(setConnectionStatus(false));
        },

        connect_error: (error: any) => {
            console.error('Socket.IO 연결 오류:', error);
            console.error('오류 메시지:', error.message);
            console.error('오류 코드:', error.code);
            dispatch(setConnectionStatus(false));
        },

        playerJoined: (data: SocketData) => {
            console.log('플레이어 참여:', data);
            if (data.roomState && data.roomState.players) {
                dispatch(updatePlayers(data.roomState.players));
            } else if (data.players) {
                dispatch(updatePlayers(data.players));
            }
        },

        playerLeft: (data: SocketData) => {
            console.log('플레이어 퇴장:', data);
            if (data.players) {
                dispatch(updatePlayers(data.players));
            }
        },

        gameStarted: (data: SocketData) => {
            console.log('게임 시작:', data);
            dispatch(setGameStarted(true));
            if (data.players) {
                dispatch(updatePlayers(data.players));
            }
        },

        gameOver: (data: SocketData) => {
            console.log('게임 종료:', data);
            dispatch(setGameOver(true));

            if (
                data.finalScore !== undefined &&
                data.finalLevel !== undefined &&
                data.finalLines !== undefined
            ) {
                dispatch(updateScore(data.finalScore));
                dispatch(updateLevel(data.finalLevel));
                dispatch(updateLines(data.finalLines));
            }

            if (data.playerId) {
                dispatch(setPlayerGameOver(data.playerId));
            }
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

        playerGameOver: (data: SocketData) => {
            console.log('플레이어 게임 오버:', data);
            if (data.playerId) {
                dispatch(setPlayerGameOver(data.playerId));
            }
        },

        gameStateUpdate: (data: SocketData) => {
            console.log('게임 상태 업데이트:', data);
            if (data.gameState) {
                if (data.gameState.board) {
                    dispatch(updateBoard(data.gameState.board));
                }
                if (data.gameState.currentPiece) {
                    dispatch(updateCurrentPiece(data.gameState.currentPiece));
                }
                if (data.gameState.nextPiece) {
                    dispatch(updateNextPiece(data.gameState.nextPiece));
                }
                if (data.gameState.heldPiece) {
                    dispatch(updateHeldPiece(data.gameState.heldPiece));
                }
                if (data.gameState.score !== undefined) {
                    dispatch(updateScore(data.gameState.score));
                }
                if (data.gameState.level !== undefined) {
                    dispatch(updateLevel(data.gameState.level));
                }
                if (data.gameState.linesCleared !== undefined) {
                    dispatch(updateLines(data.gameState.linesCleared));
                }
                if (data.gameState.gameOver !== undefined) {
                    dispatch(setGameOver(data.gameState.gameOver));
                }
                if (data.gameState.paused !== undefined) {
                    dispatch(setPaused(data.gameState.paused));
                }
            }
        },

        boardUpdate: (data: SocketData) => {
            console.log('보드 업데이트:', data);
            if (data.board) {
                dispatch(updateBoard(data.board));
            }
        },

        currentPieceUpdate: (data: SocketData) => {
            console.log('현재 조각 업데이트:', data);
            if (data.currentPiece) {
                dispatch(updateCurrentPiece(data.currentPiece));
            }
        },

        nextPieceUpdate: (data: SocketData) => {
            console.log('다음 조각 업데이트:', data);
            if (data.nextPiece) {
                dispatch(updateNextPiece(data.nextPiece));
            }
        },

        heldPieceUpdate: (data: SocketData) => {
            console.log('보유 조각 업데이트:', data);
            if (data.heldPiece) {
                dispatch(updateHeldPiece(data.heldPiece));
            }
        },

        scoreUpdate: (data: SocketData) => {
            console.log('점수 업데이트:', data);
            if (data.score !== undefined) {
                dispatch(updateScore(data.score));
            }
        },

        levelUpdate: (data: SocketData) => {
            console.log('레벨 업데이트:', data);
            if (data.level !== undefined) {
                dispatch(updateLevel(data.level));
            }
        },

        linesUpdate: (data: SocketData) => {
            console.log('라인 업데이트:', data);
            if (data.lines !== undefined) {
                dispatch(updateLines(data.lines));
            }
        },

        pauseUpdate: (data: SocketData) => {
            console.log('일시정지 업데이트:', data);
            if (data.paused !== undefined) {
                dispatch(setPaused(data.paused));
            }
        },

        fullGameStateUpdate: (data: SocketData) => {
            console.log('전체 게임 상태 업데이트:', data);
            if (data.board && data.currentPiece && data.nextPiece !== undefined) {
                dispatch(
                    updateGameState({
                        board: data.board,
                        currentPiece: data.currentPiece,
                        nextPiece: data.nextPiece,
                        heldPiece: data.heldPiece,
                        canHold: data.canHold || false,
                        score: data.score || 0,
                        level: data.level || 1,
                        lines: data.lines || 0,
                        gameOver: data.gameOver || false,
                        paused: data.paused || false,
                    })
                );
            }
        },

        gameStateUpdated: (data: SocketData) => {
            console.log('게임 상태 업데이트 수신:', data);
            if (data.gameState) {
                if (data.gameState.board) {
                    dispatch(updateBoard(data.gameState.board));
                }
                if (data.gameState.currentPiece) {
                    dispatch(updateCurrentPiece(data.gameState.currentPiece));
                }
                if (data.gameState.nextPiece) {
                    dispatch(updateNextPiece(data.gameState.nextPiece));
                }
                if (data.gameState.heldPiece) {
                    dispatch(updateHeldPiece(data.gameState.heldPiece));
                }
                if (data.gameState.score !== undefined) {
                    dispatch(updateScore(data.gameState.score));
                }
                if (data.gameState.level !== undefined) {
                    dispatch(updateLevel(data.gameState.level));
                }
                if (data.gameState.linesCleared !== undefined) {
                    dispatch(updateLines(data.gameState.linesCleared));
                }
                if (data.gameState.gameOver !== undefined) {
                    dispatch(setGameOver(data.gameState.gameOver));
                }
                if (data.gameState.paused !== undefined) {
                    dispatch(setPaused(data.gameState.paused));
                }
            }
        },

        roomPlayersUpdate: (data: SocketData) => {
            if (data.players && Array.isArray(data.players)) {
                dispatch(updatePlayers(data.players));
            } else {
                console.log('플레이어 데이터가 없거나 배열이 아님:', data.players);
            }
        },

        existingPlayersState: (data: SocketData) => {
            console.log('기존 플레이어 상태 수신:', data);
            if (data.players) {
                dispatch(updatePlayers(data.players));
            }
        },

        roomGameState: (data: SocketData) => {
            console.log('룸 게임 상태 수신:', data);
            if (data.gameState) {
                dispatch(updatePlayers(data.gameState.players));
                dispatch(setGameStarted(data.gameState.gameStarted));
                dispatch(setGameOver(data.gameState.gameOver));
            }
        },

        roomInfoUpdate: (data: SocketData) => {
            console.log('룸 정보 업데이트:', data);
            if (data.roomInfo) {
                dispatch(updateRoomInfo(data.roomInfo));
            }
        },

        roomPlayerCountUpdate: (data: SocketData) => {
            console.log('룸 플레이어 수 업데이트:', data);
            if (data.playerCount !== undefined) {
                dispatch(updateRoomPlayerCount(data.playerCount));
            }
        },

        roomStateUpdate: (data: SocketData) => {
            console.log('룸 상태 업데이트:', data);
            if (data.players) {
                dispatch(updatePlayers(data.players));
            }
            if (data.gameState) {
                dispatch(setGameStarted(data.gameState.gameStarted));
                dispatch(setGameOver(data.gameState.gameOver));
            }
        },

        roomStatsUpdate: (data: SocketData) => {
            console.log('룸 통계 업데이트:', data);
            if (data.roomStats) {
                dispatch(updateRoomStats(data.roomStats));
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
        // Socket.IO 연결 설정
        const connectSocket = () => {
            const socketUrl = 'http://localhost:3000';
            socketRef.current = io(socketUrl, {
                transports: ['websocket', 'polling'],
                autoConnect: true,
            });

            setupSocketEventListeners(socketRef.current);
        };

        // 연결 시작
        connectSocket();

        // 컴포넌트 언마운트 시 연결 종료
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [dispatch]);

    // Socket.IO를 통해 메시지 전송
    const emitMessage = useCallback((event: string, data: any) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit(event, data);
        } else {
            console.error('Socket.IO가 연결되지 않았습니다.');
        }
    }, []);

    // 자동 룸 참여 (tetrs 스타일)
    const joinAutoRoom = useCallback(
        (playerName: string): Promise<{ roomId: string; player: any }> => {
            return new Promise((resolve, reject) => {
                if (!socketRef.current) {
                    reject(new Error('Socket.IO가 연결되지 않았습니다.'));
                    return;
                }

                // 서버 응답을 기다리는 리스너
                const handleJoinResponse = (response: JoinRoomResponse) => {
                    if (response.success && response.roomId) {
                        console.log(response);
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
                socketRef.current.once('joinAutoRoomResponse', handleJoinResponse);

                // 서버에 요청 전송
                emitMessage('joinAutoRoom', { name: playerName });

                // 타임아웃 설정
                setTimeout(() => {
                    socketRef.current?.off('joinAutoRoomResponse', handleJoinResponse);
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

    // 게임 입력 전송
    const sendPlayerInput = useCallback(
        (playerId: string, action: string) => {
            console.log('플레이어 입력 전송:', { playerId, action });

            emitMessage('handlePlayerInput', {
                playerId,
                action,
            });

            console.log('플레이어 입력 전송 완료');
        },
        [emitMessage]
    );

    // 게임 상태 조회
    const getPlayerGameState = useCallback(
        (playerId: string) => {
            emitMessage('getPlayerGameState', { playerId });
        },
        [emitMessage]
    );

    // 룸 통계 조회
    const getRoomStats = useCallback(() => {
        emitMessage('getRoomStats', {});
    }, [emitMessage]);

    // 룸의 모든 플레이어 정보 조회
    const getRoomPlayers = useCallback(
        (roomId: string) => {
            emitMessage('getRoomPlayers', { roomId });
        },
        [emitMessage]
    );

    // 룸 정보 조회
    const getRoomInfo = useCallback(
        (roomId: string) => {
            emitMessage('getRoomInfo', { roomId });
        },
        [emitMessage]
    );

    // 개별 플레이어 정보 조회
    const getPlayerInfo = useCallback(
        (playerId: string) => {
            emitMessage('getPlayerInfo', { playerId });
        },
        [emitMessage]
    );

    return {
        isConnected: multiplayerState.isConnected,
        socket: socketRef.current,
        emitMessage,
        joinAutoRoom,
        leaveAutoRoom,
        sendPlayerInput,
        getPlayerGameState,
        getRoomStats,
        getRoomPlayers,
        getRoomInfo,
        getPlayerInfo,
    };
};
