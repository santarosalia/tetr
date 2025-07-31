import React from 'react';
import { useDispatch } from 'react-redux';
import { startGame } from '../store/tetrisSlice';

interface StartScreenProps {
    onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
    const dispatch = useDispatch();

    const handleStartGame = () => {
        dispatch(startGame());
        onStart();
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

            {/* 시작 버튼 */}
            <button
                onClick={handleStartGame}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xl font-bold rounded-lg shadow-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 animate-pulse"
            >
                게임 시작
            </button>
        </div>
    );
};
