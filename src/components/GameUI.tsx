import React from 'react';
import { GameState } from '../types/tetris';
import { TETROMINO_SHAPES } from '../constants/tetrominos';

interface GameUIProps {
  gameState: GameState;
  onReset: () => void;
  onPause: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ gameState, onReset, onPause }) => {
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
            width: `${cols * 20}px`,
            height: `${rows * 20}px`
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

  return (
    <div className="ui-panel">
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
        <button
          onClick={onPause}
          className="w-full px-4 py-2 bg-gray-600 text-white border-none rounded cursor-pointer text-sm hover:bg-gray-700 transition-colors"
        >
          {gameState.paused ? '재개' : '일시정지'}
        </button>
        <button
          onClick={onReset}
          className="w-full px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer text-sm hover:bg-red-700 transition-colors"
        >
          새 게임
        </button>
      </div>

      <div className="text-xs text-gray-300 leading-relaxed">
        <div className="font-bold text-white mb-1">조작법:</div>
        <div>← → : 이동</div>
        <div>↓ : 빠른 하강</div>
        <div>↑ : 회전</div>
        <div>스페이스 : 즉시 하강</div>
        <div>P : 일시정지</div>
      </div>
    </div>
  );
}; 