import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TetrisRenderer } from './TetrisRenderer';
import { GameUI, HeldPiece, NextPiece } from './GameUI';
import { GameOverScreen } from './GameOverScreen';
import { TouchControls } from './TouchControls';
import { RootState } from '../store';
import { startGame } from '../store/tetrisSlice';
import { isMobile, isPortrait, getScreenSize } from '../utils/mobileDetection';

const GAME_WIDTH = 300;
const GAME_HEIGHT = 600;
const UI_PANEL_WIDTH = 200; // UI 패널 고정 너비
const HELD_PIECE_WIDTH = 200; // 보유 블록 패널 고정 너비

export const GameScreen = () => {
    const navigate = useNavigate();
    const gameState = useSelector((state: RootState) => state.tetris);
    const { isGameStarted, gameOver, score, level, lines } = gameState;
    const dispatch = useDispatch();

    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [_isPortraitMode, setIsPortraitMode] = useState(false);
    const [_screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>('large');

    const [windowSize, setWindowSize] = useState({
        width: GAME_WIDTH + UI_PANEL_WIDTH + HELD_PIECE_WIDTH + 40, // 전체 컨테이너 너비
        height: GAME_HEIGHT,
    });

    useEffect(() => {
        // 게임이 시작되지 않았으면 게임 시작
        if (!isGameStarted) {
            handleGameStart();
        }
    }, [isGameStarted]);

    useEffect(() => {
        const handleResize = () => {
            // 모바일 감지
            setIsMobileDevice(isMobile());
            setIsPortraitMode(isPortrait());
            setScreenSize(getScreenSize());

            if (isMobile()) {
                // 모바일에서는 게임 영역을 화면에 맞게 조정
                const mobileGameWidth = Math.min(window.innerWidth - 20, 300);
                const mobileGameHeight = Math.min(window.innerHeight - 200, 600); // 터치 컨트롤 공간 확보

                setWindowSize({
                    width: mobileGameWidth,
                    height: mobileGameHeight,
                });
            } else {
                // 데스크톱에서는 기존 로직 사용
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

    const handleGameStart = () => {
        dispatch(startGame());
    };

    const handleBackToMenu = () => {
        navigate('/');
    };

    const handleGameRestart = () => {
        handleGameStart();
    };

    return (
        <div>
            {gameOver ? (
                <GameOverScreen
                    finalScore={score}
                    finalLevel={level}
                    finalLines={lines}
                    onRestart={handleGameRestart}
                    onBackToMenu={handleBackToMenu}
                />
            ) : (
                <>
                    {isMobileDevice ? (
                        // 모바일 레이아웃
                        <div className="w-full h-full flex flex-col items-center justify-center relative">
                            {/* 게임 영역 */}
                            <div className="flex-shrink-0">
                                <TetrisRenderer
                                    width={windowSize.width}
                                    height={windowSize.height}
                                />
                            </div>
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
                            <div className="flex-shrink-0 mx-4">
                                <TetrisRenderer width={GAME_WIDTH} height={GAME_HEIGHT} />
                            </div>

                            {/* 오른쪽 UI 패널 */}
                            <div
                                className="flex-shrink-0"
                                style={{ width: UI_PANEL_WIDTH }}
                            >
                                <GameUI />
                            </div>
                        </div>
                    )}

                    {/* 모바일에서 보유 블록과 다음 블록을 캔버스 바깥에 표시 */}
                    {isMobileDevice && isGameStarted && !gameOver && (
                        <>
                            {/* 보유 블록 - 좌상단 */}
                            <div className="fixed top-4 left-4 z-20">
                                <HeldPiece />
                            </div>

                            {/* 다음 블록 - 우상단 */}
                            <div className="fixed top-4 right-4 z-20">
                                <NextPiece />
                            </div>
                        </>
                    )}
                </>
            )}

            {/* 터치 컨트롤 (모바일에서만 표시) */}
            <TouchControls isVisible={isMobileDevice && isGameStarted && !gameOver} />
        </div>
    );
};
