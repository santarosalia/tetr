import { useState, useEffect } from 'react';
import { TetrisRenderer } from './components/TetrisRenderer';
import { GameUI } from './components/GameUI';
import { useTetrisGame } from './hooks/useTetrisGame';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function App() {
  // Redux 훅을 사용하여 게임 로직 초기화
  useTetrisGame();
  
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

  return (
    <div className="w-screen h-screen bg-black flex justify-center items-center overflow-hidden">
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
    </div>
  );
}

export default App; 