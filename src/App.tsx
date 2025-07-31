import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TetrisRenderer } from './components/TetrisRenderer';
import { GameUI } from './components/GameUI';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { useTetrisGame } from './hooks/useTetrisGame';
import { RootState } from './store';
import { startGame } from './store/tetrisSlice';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function App() {
  // Redux 훅을 사용하여 게임 로직 초기화
  useTetrisGame();
  
  const gameState = useSelector((state: RootState) => state.tetris);
  const { isGameStarted, gameOver, score, level, lines } = gameState;
  const dispatch = useDispatch();
  
  const [windowSize, setWindowSize] = useState({
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  });

  useEffect(() => {
    const handleResize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, GAME_WIDTH);
      const maxHeight = Math.min(window.innerHeight - 40, GAME_HEIGHT);
      setWindowSize({
        width: maxWidth,
        height: maxHeight
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
          className="game-container"
          style={{
            width: windowSize.width,
            height: windowSize.height
          }}
        >
          <TetrisRenderer
            width={windowSize.width}
            height={windowSize.height}
          />
          <GameUI />
        </div>
      )}
    </div>
  );
}

export default App; 