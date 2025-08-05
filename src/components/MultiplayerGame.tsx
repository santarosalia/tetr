import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TetrisRenderer } from './TetrisRenderer';
import { GameUI, HeldPiece, NextPiece } from './GameUI';
import { TouchControls } from './TouchControls';
import { GameOverScreen } from './GameOverScreen';
import { RootState } from '../store';
import { leaveRoom, startMultiplayerGame } from '../store/multiplayerSlice';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { isMobile, isPortrait, getScreenSize } from '../utils/mobileDetection';

interface Player {
    id: string;
    name: string;
    score: number;
    level: number;
    lines: number;
    gameOver: boolean;
    gameState?: {
        score: number;
        level: number;
        linesCleared: number;
        gameOver: boolean;
        gameStarted: boolean;
    };
}

interface MultiplayerGameProps {
    roomId: string;
    onBackToMenu: () => void;
}

const GAME_WIDTH = 300;
const GAME_HEIGHT = 600;
const UI_PANEL_WIDTH = 200;
const HELD_PIECE_WIDTH = 200;

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
    roomId,
    onBackToMenu,
}) => {
    const dispatch = useDispatch();
    const multiplayerState = useSelector((state: RootState) => state.multiplayer);
    const { players, currentPlayer, gameStarted, gameOver, gameState, roomInfo } =
        multiplayerState;
    const { sendPlayerInput, leaveAutoRoom, isConnected, getRoomPlayers, getRoomInfo } =
        useMultiplayer();

    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [isPortraitMode, setIsPortraitMode] = useState(false);
    const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>('large');
    const [windowSize, setWindowSize] = useState({
        width: GAME_WIDTH + UI_PANEL_WIDTH + HELD_PIECE_WIDTH + 40,
        height: GAME_HEIGHT,
    });

    // 디바운싱을 위한 ref
    const getRoomPlayersTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 플레이어 정보 업데이트 (룸 변경 시에만)
    useEffect(() => {
        if (!roomId || !isConnected) return;

        // 이전 타임아웃 클리어
        if (getRoomPlayersTimeoutRef.current) {
            clearTimeout(getRoomPlayersTimeoutRef.current);
        }

        // 디바운싱으로 연속 호출 방지
        getRoomPlayersTimeoutRef.current = setTimeout(() => {
            getRoomPlayers(roomId);
            getRoomInfo(roomId);
        }, 100);

        return () => {
            if (getRoomPlayersTimeoutRef.current) {
                clearTimeout(getRoomPlayersTimeoutRef.current);
            }
        };
    }, [roomId, isConnected]); // getRoomPlayers 의존성 제거

    // 주기적으로 룸 정보와 플레이어 정보 업데이트
    useEffect(() => {
        if (!roomId || !isConnected) return;

        const interval = setInterval(() => {
            getRoomInfo(roomId);
            getRoomPlayers(roomId);
        }, 3000); // 3초마다 룸 정보와 플레이어 정보 업데이트

        return () => clearInterval(interval);
    }, [roomId, isConnected, getRoomInfo, getRoomPlayers]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileDevice(isMobile());
            setIsPortraitMode(isPortrait());
            setScreenSize(getScreenSize());

            if (isMobile()) {
                const mobileGameWidth = Math.min(window.innerWidth - 20, 300);
                const mobileGameHeight = Math.min(window.innerHeight - 200, 600);

                setWindowSize({
                    width: mobileGameWidth,
                    height: mobileGameHeight,
                });
            } else {
                const totalWidth = GAME_WIDTH + UI_PANEL_WIDTH + HELD_PIECE_WIDTH + 40;
                const maxWidth = Math.min(window.innerWidth - 40, totalWidth);
                const maxHeight = Math.min(window.innerHeight - 40, GAME_HEIGHT);

                const scale = Math.min(maxWidth / totalWidth, maxHeight / GAME_HEIGHT);

                setWindowSize({
                    width: Math.floor(totalWidth * scale),
                    height: Math.floor(GAME_HEIGHT * scale),
                });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // 게임 시작
        if (!gameStarted) {
            dispatch(startMultiplayerGame({ roomId }));
        }
    }, [dispatch, roomId, gameStarted]);

    // 키보드 이벤트 처리
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!gameStarted || gameOver) return;

            // 멀티플레이어에서는 서버로 입력을 전송
            switch (event.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    event.preventDefault();
                    handleInput('move_left');
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    event.preventDefault();
                    handleInput('move_right');
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    event.preventDefault();
                    handleInput('soft_drop');
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    event.preventDefault();
                    handleInput('rotate');
                    break;
                case 'Space':
                    event.preventDefault();
                    handleInput('hard_drop');
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    event.preventDefault();
                    handleInput('hold');
                    break;
                case 'KeyP':
                    event.preventDefault();
                    handleInput('pause');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameStarted, gameOver]);

    const handleInput = (action: string) => {
        console.log('키보드 입력 처리:', {
            action,
            gameStarted,
            gameOver,
            playerId: currentPlayer?.id,
        });
        if (gameStarted && !gameOver && currentPlayer?.id) {
            sendPlayerInput(currentPlayer.id, action);
        }
    };

    const handleLeaveRoom = () => {
        if (roomId && currentPlayer?.id) {
            leaveAutoRoom(roomId, currentPlayer.id);
        }
        dispatch(leaveRoom());
        onBackToMenu();
    };

    const handleGameRestart = () => {
        dispatch(startMultiplayerGame({ roomId }));
    };

    return (
        <div className="w-screen h-screen bg-black flex justify-center items-center overflow-hidden">
            {/* 헤더 */}
            <div className="absolute top-0 left-0 right-0 bg-white shadow-lg p-4 z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">
                            멀티플레이 테트리스
                        </h1>
                        <p className="text-sm text-gray-600">룸: {roomId}</p>
                        {roomInfo && (
                            <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-600">
                                    플레이어: {roomInfo.playerCount}/{roomInfo.maxPlayers}
                                </span>
                                <span className="text-xs text-gray-600">
                                    상태: {roomInfo.roomStatus}
                                </span>
                            </div>
                        )}
                        <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                isConnected
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                        >
                            <div
                                className={`w-1 h-1 rounded-full mr-1 ${
                                    isConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}
                            ></div>
                            {isConnected ? '연결됨' : '연결 중...'}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleLeaveRoom}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                            룸 나가기
                        </button>

                        {gameOver && (
                            <button
                                onClick={handleGameRestart}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                                다시 시작
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 게임 영역 */}
            <div className="w-full h-full flex justify-center items-center pt-16">
                {isMobileDevice ? (
                    // 모바일 레이아웃
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                        {/* 게임 영역 */}
                        <div className="flex-shrink-0 relative">
                            <TetrisRenderer
                                width={windowSize.width}
                                height={windowSize.height}
                            />

                            {/* 게임 상태 오버레이 */}
                        </div>

                        {/* 모바일에서 보유 블록과 다음 블록을 캔버스 바깥에 표시 */}
                        {gameStarted && !gameOver && (
                            <>
                                {/* 보유 블록 - 좌상단 */}
                                <div className="fixed top-20 left-4 z-20">
                                    <HeldPiece />
                                </div>

                                {/* 다음 블록 - 우상단 */}
                                <div className="fixed top-20 right-4 z-20">
                                    <NextPiece />
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    // 데스크톱 레이아웃
                    <div
                        className="game-container flex items-center justify-center"
                        style={{
                            width: windowSize.width,
                            height: windowSize.height,
                        }}
                    >
                        {/* 왼쪽 보유 블록 패널 */}
                        <div
                            className="flex-shrink-0 h-full"
                            style={{ width: HELD_PIECE_WIDTH }}
                        >
                            <HeldPiece />
                        </div>

                        {/* 중앙 게임 영역 */}
                        <div className="flex-shrink-0 mx-4 relative">
                            <TetrisRenderer width={GAME_WIDTH} height={GAME_HEIGHT} />

                            {/* 게임 상태 오버레이 */}
                        </div>

                        {/* 오른쪽 UI 패널 */}
                        <div className="flex-shrink-0" style={{ width: UI_PANEL_WIDTH }}>
                            <GameUI />
                        </div>
                    </div>
                )}
            </div>

            {/* 플레이어 목록 (데스크톱에서만) */}
            {!isMobileDevice && (
                <div className="absolute right-4 top-20 w-64 bg-white shadow-lg rounded-lg p-4 max-h-96 overflow-y-auto">
                    <h2 className="text-lg font-bold mb-3">플레이어 목록</h2>
                    <div className="space-y-2">
                        {players.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 text-sm">
                                플레이어가 없습니다.
                            </p>
                        ) : (
                            players.map((player: Player) => (
                                <div
                                    key={player.id}
                                    className={`p-2 rounded border text-sm ${
                                        player.id === currentPlayer?.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium text-gray-800">
                                                {player.name}
                                                {player.id === currentPlayer?.id && (
                                                    <span className="ml-1 text-blue-600 text-xs">
                                                        (나)
                                                    </span>
                                                )}
                                            </span>
                                            <div className="text-xs text-gray-600">
                                                점수:{' '}
                                                {player.gameState?.score ||
                                                    player.score ||
                                                    0}{' '}
                                                | 레벨:{' '}
                                                {player.gameState?.level ||
                                                    player.level ||
                                                    1}{' '}
                                                | 라인:{' '}
                                                {player.gameState?.linesCleared ||
                                                    player.lines ||
                                                    0}
                                            </div>
                                        </div>
                                        <div>
                                            {player.gameOver ? (
                                                <span className="px-1 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                                                    게임 오버
                                                </span>
                                            ) : (
                                                <span className="px-1 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                                                    진행 중
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* 터치 컨트롤 (모바일에서만 표시) */}
            <TouchControls
                isVisible={isMobileDevice && gameStarted && !gameOver}
                onMoveLeft={() => handleInput('move_left')}
                onMoveRight={() => handleInput('move_right')}
                onMoveDown={() => handleInput('soft_drop')}
                onRotate={() => handleInput('rotate')}
                onHardDrop={() => handleInput('hard_drop')}
                onHold={() => handleInput('hold')}
            />

            {/* 게임 오버 화면 */}
            {gameOver && (
                <div className="fixed inset-0 z-50">
                    <GameOverScreen
                        finalScore={gameState?.score || 0}
                        finalLevel={gameState?.level || 1}
                        finalLines={gameState?.lines || 0}
                        onRestart={handleGameRestart}
                    />
                </div>
            )}
        </div>
    );
};
