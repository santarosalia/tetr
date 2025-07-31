import React from 'react';
import { useDispatch } from 'react-redux';
import { resetGame } from '../store/tetrisSlice';

interface GameOverScreenProps {
  finalScore: number;
  finalLevel: number;
  finalLines: number;
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ 
  finalScore, 
  finalLevel, 
  finalLines, 
  onRestart 
}) => {
  const dispatch = useDispatch();

  const handleRestart = () => {
    dispatch(resetGame());
    onRestart();
  };

  return (
    <div className="w-full h-full bg-black bg-opacity-90 flex flex-col justify-center items-center">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full mx-4">
        {/* 게임 오버 제목 */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-red-500 mb-2">GAME OVER</h1>
          <p className="text-gray-400">게임이 종료되었습니다</p>
        </div>

        {/* 최종 결과 */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">최종 점수:</span>
            <span className="text-2xl font-bold text-green-400">
              {finalScore.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">최종 레벨:</span>
            <span className="text-xl font-bold text-yellow-400">
              {finalLevel}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">완성한 라인:</span>
            <span className="text-xl font-bold text-cyan-400">
              {finalLines}
            </span>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={handleRestart}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200"
          >
            다시 시작
          </button>
          <button
            onClick={() => dispatch(resetGame())}
            className="w-full px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all duration-200"
          >
            메인 화면으로
          </button>
        </div>
      </div>
    </div>
  );
}; 