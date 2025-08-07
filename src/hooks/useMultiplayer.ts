import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { socketService } from '../services/socketService';

export const useMultiplayer = () => {
    const dispatch = useDispatch();
    const multiplayerState = useSelector((state: RootState) => state.multiplayer);
    const tetrisState = useSelector((state: RootState) => state.tetris);

    // 자동 룸 참여
    const joinAutoRoom = useCallback(
        (playerName: string): Promise<{ roomId: string; player: any }> => {
            return socketService.joinAutoRoom(playerName);
        },
        []
    );

    // 룸 나가기
    const leaveAutoRoom = useCallback((roomId: string, playerId: string) => {
        socketService.leaveAutoRoom(roomId, playerId);
    }, []);

    // 게임 입력 전송
    const sendPlayerInput = useCallback((playerId: string, action: string) => {
        socketService.sendPlayerInput(playerId, action);
    }, []);

    // 게임 상태 동기화
    const syncPlayerGameState = useCallback((playerId: string, gameState: any) => {
        socketService.syncPlayerGameState(playerId, gameState);
    }, []);

    // 게임 입력 처리 (멀티플레이어용)
    const handleInput = useCallback(
        (action: string) => {
            console.log(multiplayerState);
            if (multiplayerState.currentPlayer?.id) {
                sendPlayerInput(multiplayerState.currentPlayer.id, action);
            }
        },
        [sendPlayerInput, multiplayerState.currentPlayer?.id]
    );

    return {
        isConnected: multiplayerState.isConnected,
        joinAutoRoom,
        leaveAutoRoom,
        sendPlayerInput,
        syncPlayerGameState,
        handleInput,
    };
};
