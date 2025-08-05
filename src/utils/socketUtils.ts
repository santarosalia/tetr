import { Socket } from 'socket.io-client';
import { SocketData } from '../types/multiplayer';

// 소켓 연결 상태 확인
export const isSocketConnected = (socket: Socket | null): boolean => {
    return socket?.connected || false;
};

// 소켓 이벤트 리스너 등록 헬퍼
export const addSocketListener = (
    socket: Socket,
    event: string,
    handler: (data: any) => void
): void => {
    if (socket) {
        socket.on(event, handler);
    }
};

// 소켓 이벤트 리스너 제거 헬퍼
export const removeSocketListener = (
    socket: Socket,
    event: string,
    handler: (data: any) => void
): void => {
    if (socket) {
        socket.off(event, handler);
    }
};

// 소켓 메시지 전송 헬퍼
export const emitSocketMessage = (
    socket: Socket | null,
    event: string,
    data: any
): boolean => {
    if (socket && socket.connected) {
        socket.emit(event, data);
        return true;
    }
    console.error('Socket.IO가 연결되지 않았습니다.');
    return false;
};

// 소켓 연결 설정
export const createSocketConnection = (url: string): Socket => {
    const { io } = require('socket.io-client');
    return io(url, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
    });
};

// 소켓 데이터 유효성 검사
export const validateSocketData = (data: SocketData): boolean => {
    return data && typeof data === 'object';
};

// 소켓 에러 처리
export const handleSocketError = (error: any, context: string): void => {
    console.error(`Socket.IO ${context} 오류:`, error);
    console.error('오류 메시지:', error.message);
    console.error('오류 코드:', error.code);
};

// 소켓 연결 상태 로깅
export const logSocketConnection = (
    socket: Socket | null,
    status: 'connected' | 'disconnected'
): void => {
    if (status === 'connected') {
        console.log('Socket.IO 연결됨');
        console.log('소켓 ID:', socket?.id);
    } else {
        console.log('Socket.IO 연결 종료');
        console.log('연결 해제 이유:', socket?.disconnected);
    }
};

// 소켓 타임아웃 설정
export const createSocketTimeout = (
    timeout: number,
    onTimeout: () => void
): NodeJS.Timeout => {
    return setTimeout(onTimeout, timeout);
};

// 소켓 이벤트 디바운싱
export const debounceSocketEvent = (func: Function, delay: number): (() => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// 소켓 재연결 로직
export const setupSocketReconnection = (
    socket: Socket,
    onReconnect: () => void
): void => {
    socket.on('disconnect', () => {
        console.log('소켓 연결이 끊어졌습니다. 재연결을 시도합니다...');
    });

    socket.on('reconnect', () => {
        console.log('소켓 재연결 성공');
        onReconnect();
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
        console.log(`재연결 시도 ${attemptNumber}번째`);
    });

    socket.on('reconnect_error', (error: any) => {
        console.error('재연결 오류:', error);
    });
};
