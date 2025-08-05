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

interface SocketData {
    players?: any[];
    playerId?: string;
    score?: number;
    level?: number;
    lines?: number;
    linesCleared?: number;
    gameState?: {
        players: any[];
        gameStarted: boolean;
        gameOver: boolean;
        roomStatus?: string;
        averageScore?: number;
        highestScore?: number;
        board?: number[][];
        currentPiece?: any;
        nextPiece?: any;
        heldPiece?: any;
        score?: number;
        level?: number;
        linesCleared?: number;
        paused?: boolean;
    };
    board?: number[][];
    currentPiece?: any;
    nextPiece?: any;
    heldPiece?: any;
    canHold?: boolean;
    paused?: boolean;
    gameOver?: boolean;
    playerInfo?: any; // 추가된 필드
    roomState?: {
        players: any[];
        gameState: any;
        timestamp: number;
    };
    roomInfo?: {
        roomId: string;
        playerCount: number;
        maxPlayers: number;
        roomStatus: string;
        averageScore?: number;
        highestScore?: number;
        createdAt?: string;
    };
    playerCount?: number;
    roomStatus?: string;
    averageScore?: number;
    highestScore?: number;
    roomStats?: {
        averageScore?: number;
        highestScore?: number;
    };
    timestamp?: number;
    finalScore?: number;
    finalLevel?: number;
    finalLines?: number;
}

export const useMultiplayer = () => {
    const dispatch = useDispatch();
    const multiplayerState = useSelector((state: RootState) => state.multiplayer);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Socket.IO 연결 설정
        const connectSocket = () => {
            const socketUrl = 'http://localhost:3000';
            socketRef.current = io(socketUrl, {
                transports: ['websocket', 'polling'],
                autoConnect: true,
            });

            socketRef.current.on('connect', () => {
                console.log('Socket.IO 연결됨');
                console.log('소켓 ID:', socketRef.current?.id);
                console.log('연결 URL:', socketUrl);
                dispatch(setConnectionStatus(true));
            });

            socketRef.current.on('disconnect', () => {
                console.log('Socket.IO 연결 종료');
                console.log('연결 해제 이유:', socketRef.current?.disconnected);
                dispatch(setConnectionStatus(false));
            });

            socketRef.current.on('connect_error', (error: any) => {
                console.error('Socket.IO 연결 오류:', error);
                console.error('오류 메시지:', error.message);
                console.error('오류 코드:', error.code);
                dispatch(setConnectionStatus(false));
            });

            // 서버로부터 받는 이벤트들
            socketRef.current.on('playerJoined', (data: SocketData) => {
                console.log('플레이어 참여:', data);
                if (data.roomState && data.roomState.players) {
                    dispatch(updatePlayers(data.roomState.players));
                } else if (data.players) {
                    dispatch(updatePlayers(data.players));
                }
            });

            socketRef.current.on('playerLeft', (data: SocketData) => {
                console.log('플레이어 퇴장:', data);
                if (data.players) {
                    dispatch(updatePlayers(data.players));
                }
            });

            socketRef.current.on('gameStarted', (data: SocketData) => {
                console.log('게임 시작:', data);
                dispatch(setGameStarted(true));
                if (data.players) {
                    dispatch(updatePlayers(data.players));
                }
            });

            socketRef.current.on('gameOver', (data: SocketData) => {
                console.log('게임 종료:', data);
                dispatch(setGameOver(true));

                // 게임 오버 시 최종 점수 정보 업데이트
                if (
                    data.finalScore !== undefined &&
                    data.finalLevel !== undefined &&
                    data.finalLines !== undefined
                ) {
                    dispatch(updateScore(data.finalScore));
                    dispatch(updateLevel(data.finalLevel));
                    dispatch(updateLines(data.finalLines));
                }

                // 게임 오버된 플레이어 정보 업데이트
                if (data.playerId) {
                    dispatch(setPlayerGameOver(data.playerId));
                }
            });

            socketRef.current.on('playerScoreUpdate', (data: SocketData) => {
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
            });

            socketRef.current.on('playerGameStateChanged', (data: SocketData) => {
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
            });

            socketRef.current.on('playerGameOver', (data: SocketData) => {
                console.log('플레이어 게임 오버:', data);
                if (data.playerId) {
                    dispatch(setPlayerGameOver(data.playerId));
                }
            });

            socketRef.current.on('gameStateUpdate', (data: SocketData) => {
                console.log('게임 상태 업데이트:', data);
                if (data.gameState) {
                    // 전체 게임 상태 업데이트
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
            });

            // 게임 상태 업데이트 이벤트들
            socketRef.current.on('boardUpdate', (data: SocketData) => {
                console.log('보드 업데이트:', data);
                if (data.board) {
                    dispatch(updateBoard(data.board));
                }
            });

            socketRef.current.on('currentPieceUpdate', (data: SocketData) => {
                console.log('현재 조각 업데이트:', data);
                if (data.currentPiece) {
                    dispatch(updateCurrentPiece(data.currentPiece));
                }
            });

            socketRef.current.on('nextPieceUpdate', (data: SocketData) => {
                console.log('다음 조각 업데이트:', data);
                if (data.nextPiece) {
                    dispatch(updateNextPiece(data.nextPiece));
                }
            });

            socketRef.current.on('heldPieceUpdate', (data: SocketData) => {
                console.log('보유 조각 업데이트:', data);
                if (data.heldPiece) {
                    dispatch(updateHeldPiece(data.heldPiece));
                }
            });

            socketRef.current.on('scoreUpdate', (data: SocketData) => {
                console.log('점수 업데이트:', data);
                if (data.score !== undefined) {
                    dispatch(updateScore(data.score));
                }
            });

            socketRef.current.on('levelUpdate', (data: SocketData) => {
                console.log('레벨 업데이트:', data);
                if (data.level !== undefined) {
                    dispatch(updateLevel(data.level));
                }
            });

            socketRef.current.on('linesUpdate', (data: SocketData) => {
                console.log('라인 업데이트:', data);
                if (data.lines !== undefined) {
                    dispatch(updateLines(data.lines));
                }
            });

            socketRef.current.on('pauseUpdate', (data: SocketData) => {
                console.log('일시정지 업데이트:', data);
                if (data.paused !== undefined) {
                    dispatch(setPaused(data.paused));
                }
            });

            socketRef.current.on('fullGameStateUpdate', (data: SocketData) => {
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
            });

            socketRef.current.on('gameStateUpdated', (data: SocketData) => {
                console.log('게임 상태 업데이트 수신:', data);
                if (data.gameState) {
                    // 전체 게임 상태 업데이트
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
            });

            // 플레이어 정보 업데이트 이벤트들
            socketRef.current.on('roomPlayersUpdate', (data: SocketData) => {
                if (data.players && Array.isArray(data.players)) {
                    dispatch(updatePlayers(data.players));
                } else {
                    console.log('플레이어 데이터가 없거나 배열이 아님:', data.players);
                }
            });

            // 기존 플레이어들의 상태 수신 (신규 플레이어 입장 시)
            socketRef.current.on('existingPlayersState', (data: SocketData) => {
                console.log('기존 플레이어 상태 수신:', data);
                if (data.players) {
                    dispatch(updatePlayers(data.players));
                }
            });

            // 룸 게임 상태 수신 (신규 플레이어 입장 시)
            socketRef.current.on('roomGameState', (data: SocketData) => {
                console.log('룸 게임 상태 수신:', data);
                if (data.gameState) {
                    dispatch(updatePlayers(data.gameState.players));
                    dispatch(setGameStarted(data.gameState.gameStarted));
                    dispatch(setGameOver(data.gameState.gameOver));
                }
            });

            // 룸 정보 업데이트 이벤트
            socketRef.current.on('roomInfoUpdate', (data: SocketData) => {
                console.log('룸 정보 업데이트:', data);
                if (data.roomInfo) {
                    dispatch(updateRoomInfo(data.roomInfo));
                }
            });

            // 룸 플레이어 수 업데이트 이벤트
            socketRef.current.on('roomPlayerCountUpdate', (data: SocketData) => {
                console.log('룸 플레이어 수 업데이트:', data);
                if (data.playerCount !== undefined) {
                    dispatch(updateRoomPlayerCount(data.playerCount));
                }
            });

            // 룸 상태 업데이트 이벤트 (신규 플레이어 입장 시 기존 플레이어들에게 전송)
            socketRef.current.on('roomStateUpdate', (data: SocketData) => {
                console.log('룸 상태 업데이트:', data);
                if (data.players) {
                    dispatch(updatePlayers(data.players));
                }
                if (data.gameState) {
                    dispatch(setGameStarted(data.gameState.gameStarted));
                    dispatch(setGameOver(data.gameState.gameOver));
                }
            });

            // 룸 통계 업데이트 이벤트
            socketRef.current.on('roomStatsUpdate', (data: SocketData) => {
                console.log('룸 통계 업데이트:', data);
                if (data.roomStats) {
                    dispatch(updateRoomStats(data.roomStats));
                }
            });
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
    const emitMessage = (event: string, data: any) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit(event, data);
        } else {
            console.error('Socket.IO가 연결되지 않았습니다.');
        }
    };

    // 자동 룸 참여 (tetrs 스타일)
    const joinAutoRoom = (
        playerName: string
    ): Promise<{ roomId: string; player: any }> => {
        return new Promise((resolve, reject) => {
            if (!socketRef.current) {
                reject(new Error('Socket.IO가 연결되지 않았습니다.'));
                return;
            }

            // 서버 응답을 기다리는 리스너
            const handleJoinResponse = (response: any) => {
                if (response.success && response.roomId) {
                    console.log(response);
                    resolve({ roomId: response.roomId, player: response.player });
                } else {
                    reject(
                        new Error(response.error?.message || '룸 참여에 실패했습니다.')
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
    };

    // 룸 나가기
    const leaveAutoRoom = (roomId: string, playerId: string) => {
        emitMessage('leaveAutoRoom', { roomId, playerId });
    };

    // 게임 입력 전송
    const sendPlayerInput = (playerId: string, action: string) => {
        console.log('플레이어 입력 전송:', { playerId, action });

        emitMessage('handlePlayerInput', {
            playerId,
            action,
        });

        console.log('플레이어 입력 전송 완료');
    };

    // 게임 상태 조회
    const getPlayerGameState = (playerId: string) => {
        emitMessage('getPlayerGameState', { playerId });
    };

    // 룸 통계 조회
    const getRoomStats = () => {
        emitMessage('getRoomStats', {});
    };

    // 룸의 모든 플레이어 정보 조회
    const getRoomPlayers = useCallback((roomId: string) => {
        emitMessage('getRoomPlayers', { roomId });
    }, []);

    // 룸 정보 조회
    const getRoomInfo = useCallback((roomId: string) => {
        emitMessage('getRoomInfo', { roomId });
    }, []);

    // 개별 플레이어 정보 조회
    const getPlayerInfo = (playerId: string) => {
        emitMessage('getPlayerInfo', { playerId });
    };

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
