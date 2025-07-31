import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { TETROMINO_SHAPES } from '../constants/tetrominos';
import { togglePause, startGame } from '../store/tetrisSlice';

// 레벨에 따른 드롭 간격 계산 함수 (useTetrisGame과 동일)
const calculateDropInterval = (level: number): number => {
  if (level <= 0) return 1000;
  if (level >= 29) return 50;
  
  const baseInterval = Math.pow(0.8 - ((level - 1) * 0.007), level - 1) * 1000;
  return Math.max(50, Math.min(1000, baseInterval));
};

// 보유 블록 컴포넌트
export const HeldPiece: React.FC = () => {
  const gameState = useAppSelector(state => state.tetris);

  const getTetrominoColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'I': '#00f0f0',
      'O': '#f0f000',
      'T': '#a000f0',
      'S': '#00f000',
      'Z': '#f00000',
      'J': '#0000f0',
      'L': '#f0a000'
    };
    return colorMap[type] || '#ffffff';
  };

  const renderHeldPiece = () => {
    if (!gameState.heldPiece) {
      return (
        <div className="held-piece-container">
          <div 
            className="held-piece-grid"
            style={{
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(4, 1fr)',
              width: '50px',
              height: '50px',
              border: '2px dashed #666'
            }}
          >
            {Array(16).fill(null).map((_, i) => (
              <div
                key={i}
                className="held-piece-cell"
                style={{
                  backgroundColor: 'transparent'
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    const shape = TETROMINO_SHAPES[gameState.heldPiece][0];
    const rows = shape.length;
    const cols = shape[0].length;
    
    return (
      <div className="held-piece-container">
        <div 
          className="held-piece-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            width: '50px',
            height: '50px',
            opacity: gameState.canHold ? 1 : 0.5
          }}
        >
          {shape.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`held-piece-cell ${cell ? 'filled' : ''}`}
                style={{
                  backgroundColor: cell ? getTetrominoColor(gameState.heldPiece!) : 'transparent'
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="held-piece-panel flex flex-col items-center justify-center mx-4 my-6">
      <h3 className="text-white text-lg font-semibold mb-2.5">보유 블록</h3>
      {renderHeldPiece()}
    </div>
  );
};

// 메인 UI 패널 컴포넌트
export const GameUI: React.FC = () => {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(state => state.tetris);

  const getTetrominoColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'I': '#00f0f0',
      'O': '#f0f000',
      'T': '#a000f0',
      'S': '#00f000',
      'Z': '#f00000',
      'J': '#0000f0',
      'L': '#f0a000'
    };
    return colorMap[type] || '#ffffff';
  };

  const renderNextPiece = () => {
    const shape = TETROMINO_SHAPES[gameState.nextPiece][0];
    const rows = shape.length;
    const cols = shape[0].length;
    
    return (
      <div className="next-piece-container">
        <div 
          className="next-piece-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            width: '50px',
            height: '50px'
          }}
        >
          {shape.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`next-piece-cell ${cell ? 'filled' : ''}`}
                style={{
                  backgroundColor: cell ? getTetrominoColor(gameState.nextPiece) : 'transparent'
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  const handlePause = () => {
    dispatch(togglePause());
  };

  const handleReset = () => {
    dispatch(startGame());
  };

  // 현재 레벨의 드롭 간격 계산
  const currentDropInterval = calculateDropInterval(gameState.level);
  const speedPercentage = Math.round((1000 - currentDropInterval) / 10);

  return (
    <div className="ui-panel h-full">
      <div className="mb-5">
        <h3 className="text-white text-lg font-semibold mb-2.5">점수</h3>
        <div className="text-2xl font-bold text-green-400">
          {gameState.score.toLocaleString()}
        </div>
      </div>

      <div className="mb-5">
        <h3 className="text-white text-lg font-semibold mb-2.5">레벨</h3>
        <div className="text-xl font-bold text-yellow-400">
          {gameState.level}
        </div>
        <div className="text-sm text-gray-300 mt-1">
          속도: {speedPercentage}%
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-red-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${speedPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <h3 className="text-white text-lg font-semibold mb-2.5">라인</h3>
        <div className="text-xl font-bold text-cyan-400">
          {gameState.lines}
        </div>
      </div>

      <div className="mb-5">
        <h3 className="text-white text-lg font-semibold mb-2.5">다음 블록</h3>
        {renderNextPiece()}
      </div>

      <div className="mb-5 space-y-2">
        <div
          onClick={handlePause}
          className="w-full px-4 py-2 bg-gray-600 text-white border-none rounded cursor-pointer text-sm hover:bg-gray-700 transition-colors text-center"
        >
          {gameState.paused ? '재개' : '일시정지'}
        </div>
        <div
          onClick={handleReset}
          className="w-full px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer text-sm hover:bg-red-700 transition-colors text-center"
        >
          새 게임
        </div>
      </div>
    </div>
  );
}; 