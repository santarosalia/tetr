import { useEffect, useRef } from 'react';
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
} from '../store/multiplayerSlice';

interface SocketData {
    players?: any[];
    playerId?: string;
    score?: number;
    level?: number;
    lines?: number;
    gameState?: {
        players: any[];
        gameStarted: boolean;
        gameOver: boolean;
    };
    board?: number[][];
    currentPiece?: any;
    nextPiece?: any;
    heldPiece?: any;
    canHold?: boolean;
    paused?: boolean;
    gameOver?: boolean;
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
                dispatch(setConnectionStatus(true));
            });

            socketRef.current.on('disconnect', () => {
                console.log('Socket.IO 연결 종료');
                dispatch(setConnectionStatus(false));
            });

            socketRef.current.on('connect_error', (error: any) => {
                console.error('Socket.IO 연결 오류:', error);
                dispatch(setConnectionStatus(false));
            });

            // 서버로부터 받는 이벤트들
            socketRef.current.on('playerJoined', (data: SocketData) => {
                console.log('플레이어 참여:', data);
                if (data.players) {
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

            socketRef.current.on('playerGameOver', (data: SocketData) => {
                console.log('플레이어 게임 오버:', data);
                if (data.playerId) {
                    dispatch(setPlayerGameOver(data.playerId));
                }
            });

            socketRef.current.on('gameStateUpdate', (data: SocketData) => {
                console.log('게임 상태 업데이트:', data);
                if (data.gameState) {
                    dispatch(updatePlayers(data.gameState.players));
                    dispatch(setGameStarted(data.gameState.gameStarted));
                    dispatch(setGameOver(data.gameState.gameOver));
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
    const joinAutoRoom = (playerName: string) => {
        emitMessage('joinAutoRoom', { name: playerName });
    };

    // 룸 나가기
    const leaveAutoRoom = (roomId: string, playerId: string) => {
        emitMessage('leaveAutoRoom', { roomId, playerId });
    };

    // 게임 입력 전송
    const sendPlayerInput = (playerId: string, action: string) => {
        emitMessage('handlePlayerInput', {
            playerId,
            action,
        });
    };

    // 게임 상태 조회
    const getPlayerGameState = (playerId: string) => {
        emitMessage('getPlayerGameState', { playerId });
    };

    // 룸 통계 조회
    const getRoomStats = () => {
        emitMessage('getRoomStats', {});
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
    };
};
