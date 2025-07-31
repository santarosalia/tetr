import React, { useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
    movePiece,
    rotatePiece,
    hardDrop,
    holdPiece,
    togglePause,
} from '../store/tetrisSlice';

interface TouchControlsProps {
    isVisible: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ isVisible }) => {
    const dispatch = useAppDispatch();
    const gameState = useAppSelector((state) => state.tetris);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    const handleMoveLeft = useCallback(() => {
        dispatch(movePiece({ offsetX: -1, offsetY: 0 }));
    }, [dispatch]);

    const handleMoveRight = useCallback(() => {
        dispatch(movePiece({ offsetX: 1, offsetY: 0 }));
    }, [dispatch]);

    const handleMoveDown = useCallback(() => {
        dispatch(movePiece({ offsetX: 0, offsetY: 1 }));
    }, [dispatch]);

    const handleRotate = useCallback(() => {
        dispatch(rotatePiece());
    }, [dispatch]);

    const handleHardDrop = useCallback(() => {
        dispatch(hardDrop());
    }, [dispatch]);

    const handleHold = useCallback(() => {
        dispatch(holdPiece());
    }, [dispatch]);

    const handlePause = useCallback(() => {
        dispatch(togglePause());
    }, [dispatch]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }, []);

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (!touchStartRef.current) return;

            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;
            const minSwipeDistance = 50;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 수평 스와이프
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        handleMoveRight();
                    } else {
                        handleMoveLeft();
                    }
                }
            } else {
                // 수직 스와이프
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        handleMoveDown();
                    } else {
                        handleRotate();
                    }
                }
            }

            touchStartRef.current = null;
        },
        [handleMoveLeft, handleMoveRight, handleMoveDown, handleRotate]
    );

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-10 pointer-events-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* 게임 영역 터치 감지 */}
            <div className="absolute inset-0 pointer-events-auto" />

            {/* 컨트롤 버튼들 */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-auto">
                {/* 왼쪽: 방향키 */}
                <div className="flex gap-4">
                    <button
                        onClick={handleMoveLeft}
                        className="w-12 h-12 bg-blue-500 bg-opacity-80 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg active:bg-blue-600 transition-colors"
                    >
                        ←
                    </button>
                    <button
                        onClick={handleMoveRight}
                        className="w-12 h-12 bg-blue-500 bg-opacity-80 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg active:bg-blue-600 transition-colors"
                    >
                        →
                    </button>
                </div>

                {/* 오른쪽: 나머지 버튼들 */}
                <div className="flex gap-4">
                    <button
                        onClick={handleRotate}
                        className="w-12 h-12 bg-green-500 bg-opacity-80 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg active:bg-green-600 transition-colors"
                    >
                        ↻
                    </button>
                    <button
                        onClick={handleMoveDown}
                        className="w-12 h-12 bg-yellow-500 bg-opacity-80 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg active:bg-yellow-600 transition-colors"
                    >
                        ↓
                    </button>
                    <button
                        onClick={handleHardDrop}
                        className="w-12 h-12 bg-red-500 bg-opacity-80 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg active:bg-red-600 transition-colors"
                    >
                        ⬇
                    </button>
                    <button
                        onClick={handleHold}
                        className="w-12 h-12 bg-purple-500 bg-opacity-80 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg active:bg-purple-600 transition-colors"
                    >
                        H
                    </button>
                </div>
            </div>

            {/* 일시정지 버튼 (상단 가운데) */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
                <button
                    onClick={handlePause}
                    className="w-12 h-12 bg-gray-600 bg-opacity-80 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg active:bg-gray-700 transition-colors"
                >
                    {gameState.paused ? '▶' : '⏸'}
                </button>
            </div>
        </div>
    );
};
