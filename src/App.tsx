import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TetrisRenderer } from './components/TetrisRenderer';
import { GameUI, HeldPiece } from './components/GameUI';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { useTetrisGame } from './hooks/useTetrisGame';
import { RootState } from './store';
import { startGame } from './store/tetrisSlice';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 600;
const UI_PANEL_WIDTH = 200; // UI 패널 고정 너비
const HELD_PIECE_WIDTH = 200; // 보유 블록 패널 고정 너비

function App() {
  // Redux 훅을 사용하여 게임 로직 초기화
  useTetrisGame();
  
  const gameState = useSelector((state: RootState) => state.tetris);
  const { isGameStarted, gameOver, score, level, lines } = gameState;
  const dispatch = useDispatch();
  
  const [windowSize, setWindowSize] = useState({
    width: GAME_WIDTH + UI_PANEL_WIDTH + HELD_PIECE_WIDTH + 40, // 전체 컨테이너 너비
    height: GAME_HEIGHT
  });

  useEffect(() => {
    const handleResize = () => {
      const totalWidth = GAME_WIDTH + UI_PANEL_WIDTH + HELD_PIECE_WIDTH + 40;
      const maxWidth = Math.min(window.innerWidth - 40, totalWidth);
      const maxHeight = Math.min(window.innerHeight - 40, GAME_HEIGHT);
      
      // 전체 컨테이너가 화면보다 클 경우 비율에 맞게 조정
      const scale = Math.min(maxWidth / totalWidth, maxHeight / GAME_HEIGHT);
      
      setWindowSize({
        width: Math.floor(totalWidth * scale),
        height: Math.floor(GAME_HEIGHT * scale)
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGameStart = () => {
    dispatch(startGame());
  };

  const handleGameRestart = () => {
    handleGameStart()
  };

  return (
    <div className="w-screen h-screen bg-black flex justify-center items-center overflow-hidden">
      {!isGameStarted ? (
        <StartScreen onStart={handleGameStart} />
      ) : gameOver ? (
        <GameOverScreen
          finalScore={score}
          finalLevel={level}
          finalLines={lines}
          onRestart={handleGameRestart}
        />
      ) : (
        <div 
          className="game-container flex items-center justify-center"
          style={{
            width: windowSize.width,
            height: windowSize.height
          }}
        >
          {/* 왼쪽 보유 블록 패널 */}
          <div className="flex-shrink-0 h-full" style={{ width: HELD_PIECE_WIDTH }}>
            <HeldPiece />
          </div>
          
          {/* 중앙 게임 영역 */}
          <div className="flex-shrink-0 mx-4">
            <TetrisRenderer
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
            />
          </div>
          
          {/* 오른쪽 UI 패널 */}
          <div className="flex-shrink-0" style={{ width: UI_PANEL_WIDTH }}>
            <GameUI />
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 