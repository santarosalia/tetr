import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import {
    setConnectionStatus,
    setGameState,
    updateRoomState,
} from '../store/multiplayerSlice';
import { JoinRoomResponse, RoomState, GameState } from '../types/multiplayer';

class SocketService {
    private socket: Socket | null = null;
    private isConnecting = false;
    private maxReconnectAttempts = 5;
    // 기본 소켓 이벤트 핸들러들
    private socketEventHandlers = {
        connect: () => {
            console.log('Socket.IO 연결됨');
            console.log('소켓 ID:', this.socket?.id);
            this.isConnecting = false;
            store.dispatch(setConnectionStatus(true));
        },

        disconnect: () => {
            console.log('Socket.IO 연결 종료');
            console.log('연결 해제 이유:', this.socket?.disconnected);
            store.dispatch(setConnectionStatus(false));
        },

        connect_error: (error: any) => {
            console.error('Socket.IO 연결 오류:', error);
            console.error('오류 메시지:', error.message);
            console.error('오류 코드:', error.code);
            this.isConnecting = false;
            store.dispatch(setConnectionStatus(false));
        },
    };

    // 멀티플레이어 소켓 이벤트 핸들러들
    private multiplayerEventHandlers = {
        gameStateUpdate: (data: GameState) => {
            // console.log('게임 상태 업데이트:', data);
            if (data) {
                store.dispatch(setGameState(data));
            }
        },
        roomStateUpdate: (data: RoomState) => {
            // console.log('룸 상태 업데이트:', data);
            if (data) {
                store.dispatch(updateRoomState(data));
            }
        },
    };

    // 소켓 이벤트 리스너 등록
    private setupSocketEventListeners(socket: Socket) {
        // 기본 이벤트 리스너 등록
        Object.entries(this.socketEventHandlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        // 멀티플레이어 이벤트 리스너 등록
        Object.entries(this.multiplayerEventHandlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });
    }

    // 멀티플레이어 이벤트 리스너 해제
    private removeMultiplayerEventListeners() {
        if (this.socket) {
            Object.keys(this.multiplayerEventHandlers).forEach((event) => {
                this.socket!.off(event);
            });
        }
    }

    // 소켓 연결
    connect(): Promise<Socket> {
        return new Promise((resolve, reject) => {
            // 이미 연결되어 있으면 기존 소켓 반환
            if (this.socket && this.socket.connected) {
                resolve(this.socket);
                return;
            }

            // 이미 연결 중이면 대기
            if (this.isConnecting) {
                const checkConnection = () => {
                    if (this.socket && this.socket.connected) {
                        resolve(this.socket);
                    } else if (!this.isConnecting) {
                        reject(new Error('연결 실패'));
                    } else {
                        setTimeout(checkConnection, 100);
                    }
                };
                checkConnection();
                return;
            }

            this.isConnecting = true;
            const socketUrl = 'http://localhost:3000';

            const socket = io(socketUrl, {
                transports: ['websocket', 'polling'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                timeout: 20000,
            });

            this.socket = socket;
            this.setupSocketEventListeners(socket);

            // 연결 성공 시 resolve
            socket.once('connect', () => {
                resolve(socket);
            });

            // 연결 실패 시 reject
            socket.once('connect_error', (error) => {
                this.isConnecting = false;
                reject(error);
            });
        });
    }

    // 소켓 연결 해제
    disconnect() {
        if (this.socket) {
            this.removeMultiplayerEventListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnecting = false;
    }

    // 메시지 전송
    emit(event: string, data: any) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        } else {
            throw new Error('Socket.IO가 연결되지 않았습니다.');
        }
    }

    // 이벤트 리스너 등록
    on(event: string, handler: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.on(event, handler);
        }
    }

    // 이벤트 리스너 해제
    off(event: string, handler?: (...args: any[]) => void) {
        if (this.socket) {
            if (handler) {
                this.socket.off(event, handler);
            } else {
                this.socket.off(event);
            }
        }
    }

    // 한 번만 실행되는 이벤트 리스너 등록
    once(event: string, handler: (...args: any[]) => void) {
        if (this.socket) {
            this.socket.once(event, handler);
        }
    }

    // 연결 상태 확인
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // 소켓 인스턴스 반환
    getSocket(): Socket | null {
        return this.socket;
    }

    // 자동 룸 참여
    joinAutoRoom(playerName: string): Promise<{ roomId: string; player: any }> {
        return new Promise((resolve, reject) => {
            if (!this.isConnected()) {
                reject(new Error('Socket.IO가 연결되지 않았습니다.'));
                return;
            }

            const handleJoinResponse = (response: JoinRoomResponse) => {
                if (response.success && response.roomId) {
                    console.log('룸 참여 성공:', response);

                    resolve({ roomId: response.roomId, player: response.player });
                } else {
                    reject(
                        new Error(response.error?.message || '룸 참여에 실패했습니다.')
                    );
                }
            };

            this.once('joinAutoRoomResponse', handleJoinResponse);
            this.emit('joinAutoRoom', { name: playerName });

            setTimeout(() => {
                this.off('joinAutoRoomResponse', handleJoinResponse);
                reject(new Error('룸 참여 요청이 시간 초과되었습니다.'));
            }, 10000);
        });
    }

    // 룸 나가기
    leaveAutoRoom(roomId: string, playerId: string) {
        this.emit('leaveAutoRoom', { roomId, playerId });
    }

    // 게임 입력 전송
    sendPlayerInput(playerId: string, action: string) {
        this.emit('handlePlayerInput', { playerId, action });
    }

    // 게임 상태 동기화
    syncPlayerGameState(playerId: string, gameState: any) {
        this.emit('syncGameState', { playerId, gameState });
    }
}

// 싱글톤 인스턴스 생성
export const socketService = new SocketService();
