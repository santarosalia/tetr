import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { TETROMINO_SHAPES } from '../constants/tetrominos';
import { startGame } from '../store/tetrisSlice';
import { isMobile } from '../utils/mobileDetection';

// 보유 블록 컴포넌트
export const HeldPiece: React.FC = () => {
    const gameState = useAppSelector((state) => state.tetris);

    const getTetrominoColor = (type: string) => {
        const colorMap: Record<string, string> = {
            I: '#00f0f0',
            O: '#f0f000',
            T: '#a000f0',
            S: '#00f000',
            Z: '#f00000',
            J: '#0000f0',
            L: '#f0a000',
        };
        return colorMap[type] || '#ffffff';
    };

    const renderHeldPiece = () => {
        if (!gameState.heldPiece) {
            return (
                <div className="next-piece-container">
                    <div
                        className="next-piece-grid"
                        style={{
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gridTemplateRows: 'repeat(4, 1fr)',
                            width: '50px',
                            height: '50px',
                            border: '2px dashed #666',
                        }}
                    >
                        {Array(16)
                            .fill(null)
                            .map((_, i) => (
                                <div
                                    key={i}
                                    className="next-piece-cell"
                                    style={{
                                        backgroundColor: 'transparent',
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
            <div className="next-piece-container">
                <div
                    className="next-piece-grid"
                    style={{
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        gridTemplateRows: `repeat(${rows}, 1fr)`,
                        width: '50px',
                        height: '50px',
                        opacity: gameState.canHold ? 1 : 0.5,
                    }}
                >
                    {shape.map((row, y) =>
                        row.map((cell, x) => (
                            <div
                                key={`${x}-${y}`}
                                className={`next-piece-cell ${cell ? 'filled' : ''}`}
                                style={{
                                    backgroundColor: cell
                                        ? getTetrominoColor(gameState.heldPiece!)
                                        : 'transparent',
                                }}
                            />
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="next-piece-panel flex flex-col items-center justify-center mx-4 my-6">
            {renderHeldPiece()}
        </div>
    );
};

// 다음 블록 컴포넌트
export const NextPiece: React.FC = () => {
    const gameState = useAppSelector((state) => state.multiplayer.gameState);

    const getTetrominoColor = (type: string) => {
        const colorMap: Record<string, string> = {
            I: '#00f0f0',
            O: '#f0f000',
            T: '#a000f0',
            S: '#00f000',
            Z: '#f00000',
            J: '#0000f0',
            L: '#f0a000',
        };
        return colorMap[type] || '#ffffff';
    };

    const renderNextPiece = () => {
        // 서버에서 받은 nextPieces 배열이 있으면 첫 번째 요소를 사용
        // 없으면 기존 nextPiece를 사용 (하위 호환성)
        const nextPieceType =
            gameState?.nextPieces && gameState.nextPieces.length > 0
                ? gameState.nextPieces[0]
                : gameState?.nextPiece;

        if (!nextPieceType) {
            return null;
        }

        const shape = TETROMINO_SHAPES[nextPieceType][0];
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
                        height: '50px',
                    }}
                >
                    {shape.map((row, y) =>
                        row.map((cell, x) => (
                            <div
                                key={`${x}-${y}`}
                                className={`next-piece-cell ${cell ? 'filled' : ''}`}
                                style={{
                                    backgroundColor: cell
                                        ? getTetrominoColor(nextPieceType)
                                        : 'transparent',
                                }}
                            />
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="next-piece-panel flex flex-col items-center justify-center mx-4 my-6">
            {renderNextPiece()}
        </div>
    );
};

// 메인 UI 패널 컴포넌트
export const GameUI: React.FC = () => {
    const dispatch = useAppDispatch();
    const gameState = useAppSelector((state) => state.tetris);

    const handlePause = () => {};

    const handleReset = () => {
        dispatch(startGame());
    };

    // 현재 레벨의 드롭 간격 계산

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
                <div className="text-xl font-bold text-yellow-400">{gameState.level}</div>
            </div>

            <div className="mb-5">
                <h3 className="text-white text-lg font-semibold mb-2.5">라인</h3>
                <div className="text-xl font-bold text-cyan-400">{gameState.lines}</div>
            </div>

            <div className="mb-5">
                <h3 className="text-white text-lg font-semibold mb-2.5">다음 블록</h3>
                <NextPiece />
            </div>

            <div className="mb-5 space-y-2">
                <div
                    onClick={handlePause}
                    className={`w-full px-4 py-2 bg-gray-600 text-white border-none rounded cursor-pointer text-sm hover:bg-gray-700 transition-colors text-center ${
                        isMobile() ? 'py-3 text-base' : ''
                    }`}
                >
                    {gameState.paused ? '재개' : '일시정지'}
                </div>
                <div
                    onClick={handleReset}
                    className={`w-full px-4 py-2 bg-red-600 text-white border-none rounded cursor-pointer text-sm hover:bg-red-700 transition-colors text-center ${
                        isMobile() ? 'py-3 text-base' : ''
                    }`}
                >
                    새 게임
                </div>
            </div>
        </div>
    );
};
