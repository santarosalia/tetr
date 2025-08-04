import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { joinRoom, leaveRoom, updateCurrentPlayer } from '../store/multiplayerSlice';
import { useMultiplayer } from '../hooks/useMultiplayer';

interface Room {
    id: string;
    name: string;
    players: number;
    maxPlayers: number;
    status: 'waiting' | 'playing' | 'finished';
    createdAt: string;
}

interface MultiplayerLobbyProps {
    onJoinGame: (roomId: string) => void;
    onBack: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
    onJoinGame,
    onBack,
}) => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [playerName, setPlayerName] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
    const [roomStats, setRoomStats] = useState<any>(null);
    const dispatch = useDispatch();
    const { joinAutoRoom, leaveAutoRoom, getRoomStats, isConnected } = useMultiplayer();

    useEffect(() => {
        // 초기 플레이어 이름 설정
        setPlayerName(`Player${Math.floor(Math.random() * 1000)}`);

        // 룸 통계 가져오기
        fetchRoomStats();

        // 주기적으로 룸 통계 업데이트
        const interval = setInterval(fetchRoomStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchRoomStats = async () => {
        try {
            const response = await fetch('/api/rooms/stats');
            const data = await response.json();
            setRoomStats(data);
        } catch (error) {
            console.error('룸 통계 가져오기 실패:', error);
        }
    };

    const handleJoinAutoRoom = async () => {
        if (!playerName.trim()) {
            alert('플레이어 이름을 입력해주세요.');
            return;
        }

        setIsJoining(true);
        try {
            // Socket.IO를 통해 자동 룸 참여하고 서버에서 룸 ID와 플레이어 정보 받기
            const { roomId, player } = await joinAutoRoom(playerName);

            // 서버에서 받은 플레이어 정보를 currentPlayer로 설정
            dispatch(updateCurrentPlayer(player));

            // 서버에서 받은 실제 룸 ID로 게임 참여
            onJoinGame(roomId);
        } catch (error) {
            console.error('자동 룸 참여 실패:', error);
            alert('룸 참여에 실패했습니다.');
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeaveRoom = async () => {
        if (selectedRoom) {
            try {
                leaveAutoRoom(selectedRoom, 'temp-player-id');
                setSelectedRoom(null);
            } catch (error) {
                console.error('룸 나가기 실패:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        멀티플레이 로비
                    </h1>
                    <p className="text-gray-600">
                        자동으로 룸에 배정되어 다른 플레이어들과 함께 게임을 즐겨보세요!
                    </p>
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

                {/* 플레이어 이름 입력 */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* 자동 룸 참여 버튼 */}
                <div className="mb-6">
                    <button
                        onClick={handleJoinAutoRoom}
                        disabled={isJoining || !isConnected}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-md transition-colors"
                    >
                        {isJoining ? '룸 참여 중...' : '자동 룸 참여'}
                    </button>
                </div>

                {/* 서버 통계 정보 */}
                {roomStats && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            서버 통계
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {roomStats.totalRooms || 0}
                                </div>
                                <div className="text-sm text-gray-600">총 룸 수</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {roomStats.waitingRooms || 0}
                                </div>
                                <div className="text-sm text-gray-600">대기 중인 룸</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {roomStats.playingRooms || 0}
                                </div>
                                <div className="text-sm text-gray-600">게임 중인 룸</div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {roomStats.totalPlayers || 0}
                                </div>
                                <div className="text-sm text-gray-600">총 플레이어</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 게임 설명 */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        게임 방법
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li>
                                • 플레이어 이름을 입력하고 "자동 룸 참여" 버튼을
                                클릭하세요
                            </li>
                            <li>• 서버가 자동으로 사용 가능한 룸에 배정해드립니다</li>
                            <li>
                                • 다른 플레이어들과 함께 실시간으로 테트리스를 즐겨보세요
                            </li>
                            <li>
                                • 키보드 또는 터치 컨트롤을 사용하여 게임을 조작할 수
                                있습니다
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 뒤로 가기 버튼 */}
                <div className="text-center">
                    <button
                        onClick={onBack}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
                    >
                        뒤로 가기
                    </button>
                </div>
            </div>
        </div>
    );
};
