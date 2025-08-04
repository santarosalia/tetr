import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { startGame } from '../store/tetrisSlice';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { updateCurrentPlayer } from '../store/multiplayerSlice';

interface StartScreenProps {
    onStart: () => void;
    onMultiplayer: (roomId: string) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onMultiplayer }) => {
    const dispatch = useDispatch();
    const { joinAutoRoom, isConnected } = useMultiplayer();
    const [playerName, setPlayerName] = useState(
        `Player${Math.floor(Math.random() * 1000)}`
    );
    const [isJoining, setIsJoining] = useState(false);

    const handleStartGame = () => {
        dispatch(startGame());
        onStart();
    };

    const handleMultiplayer = async () => {
        if (!playerName.trim()) {
            alert('플레이어 이름을 입력해주세요.');
            return;
        }

        setIsJoining(true);
        try {
            const { roomId, player } = await joinAutoRoom(playerName);
            dispatch(updateCurrentPlayer(player));
            onMultiplayer(roomId);
        } catch (error) {
            console.error('멀티플레이 게임 시작 실패:', error);
            alert('멀티플레이 게임 시작에 실패했습니다.');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="w-full h-full bg-gradient-to-b from-blue-900 via-purple-900 to-indigo-900 flex flex-col justify-center items-center">
            {/* 테트리스 로고 */}
            <div className="mb-8">
                <h1 className="text-6xl font-bold text-white mb-4 tracking-wider text-center">
                    DON'T RIS
                </h1>
                <div className="flex justify-center space-x-2">
                    {['I', 'O', 'T', 'S', 'Z', 'J', 'L'].map((type, index) => (
                        <div
                            key={type}
                            className="w-8 h-8 bg-white rounded-sm opacity-80 animate-bounce"
                            style={{
                                animationDelay: `${index * 0.1}s`,
                                backgroundColor:
                                    type === 'I'
                                        ? 'cyan'
                                        : type === 'O'
                                        ? 'yellow'
                                        : type === 'T'
                                        ? 'purple'
                                        : type === 'S'
                                        ? 'green'
                                        : type === 'Z'
                                        ? 'red'
                                        : type === 'J'
                                        ? 'blue'
                                        : type === 'L'
                                        ? 'orange'
                                        : 'white',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* 플레이어 이름 입력 */}
            <div className="mb-6 w-full max-w-md">
                <label className="block text-sm font-medium text-white mb-2">
                    플레이어 이름
                </label>
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="플레이어 이름을 입력하세요"
                />
            </div>

            {/* 연결 상태 */}
            <div className="mb-6">
                <div
                    className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                        isConnected
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                            isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}
                    ></div>
                    {isConnected ? '서버에 연결됨' : '서버에 연결 중...'}
                </div>
            </div>

            {/* 게임 설명 */}
            <div className="text-center text-white mb-8">
                <p className="text-sm opacity-80">라인을 완성하여 점수를 얻으세요!</p>
            </div>

            {/* 컨트롤 설명 */}
            <div className="text-center text-white mb-8">
                <h3 className="text-lg font-semibold mb-4">조작법</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p>
                            <span className="font-bold">← →</span> 이동
                        </p>
                        <p>
                            <span className="font-bold">↓</span> 빠른 하강
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="font-bold">↑</span> 회전
                        </p>
                        <p>
                            <span className="font-bold">스페이스</span> 즉시 하강
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="font-bold">Shift</span> 블럭 홀드
                        </p>
                    </div>
                </div>
            </div>

            {/* 게임 모드 선택 */}
            <div className="flex flex-col space-y-4 mb-8">
                <button
                    onClick={handleStartGame}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xl font-bold rounded-lg shadow-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 animate-pulse"
                >
                    🎮 싱글플레이
                </button>

                <button
                    onClick={handleMultiplayer}
                    disabled={isJoining || !isConnected}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isJoining ? '게임 참여 중...' : '🌐 멀티플레이'}
                </button>
            </div>
        </div>
    );
};
