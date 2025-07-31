import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { TETROMINO_COLORS } from '../constants/tetrominos';
import { BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE } from '../utils/tetrisLogic';
import { PhysicsEffects, PhysicsEffectsRef } from './PhysicsEffects';
import { clearLastPlacedPiece } from '../store/tetrisSlice';

interface TetrisRendererProps {
  width: number;
  height: number;
}

export const TetrisRenderer: React.FC<TetrisRendererProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const physicsEffectsRef = useRef<PhysicsEffectsRef>(null);
  const gameState = useAppSelector(state => state.tetris);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create PIXI application
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x000000,
      antialias: true,
    });

    canvasRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [width, height]);

  // 피스 배치 감지 및 파티클 효과 트리거
  useEffect(() => {
    if (gameState.lastPlacedPiece && physicsEffectsRef.current) {
      // number[][]를 boolean[][]로 변환
      const booleanShape = gameState.lastPlacedPiece.shape.map(row => 
        row.map(cell => cell !== 0)
      );
      
      physicsEffectsRef.current.createPieceDropEffect(
        gameState.lastPlacedPiece.position.x,
        gameState.lastPlacedPiece.position.y,
        gameState.lastPlacedPiece.type,
        booleanShape
      );
      
      // 파티클 효과 트리거 후 lastPlacedPiece 초기화
      dispatch(clearLastPlacedPiece());
    }
  }, [gameState.lastPlacedPiece, dispatch]);

  useEffect(() => {
    if (!appRef.current) return;

    const app = appRef.current;
    app.stage.removeChildren();

    // Create background
    const background = new PIXI.Graphics();
    background.beginFill(0x111111);
    background.drawRect(0, 0, width, height);
    background.endFill();
    app.stage.addChild(background);

    // Draw board
    const boardGraphics = new PIXI.Graphics();
    const boardX = (width - BOARD_WIDTH * BLOCK_SIZE) / 2;
    const boardY = (height - BOARD_HEIGHT * BLOCK_SIZE) / 2;

    // Draw board background
    boardGraphics.beginFill(0x222222);
    boardGraphics.drawRect(boardX, boardY, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
    boardGraphics.endFill();

    // Draw board grid
    boardGraphics.lineStyle(1, 0x333333);
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      boardGraphics.moveTo(boardX + x * BLOCK_SIZE, boardY);
      boardGraphics.lineTo(boardX + x * BLOCK_SIZE, boardY + BOARD_HEIGHT * BLOCK_SIZE);
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      boardGraphics.moveTo(boardX, boardY + y * BLOCK_SIZE);
      boardGraphics.lineTo(boardX + BOARD_WIDTH * BLOCK_SIZE, boardY + y * BLOCK_SIZE);
    }
    app.stage.addChild(boardGraphics);

    // Draw placed blocks
    const blocksGraphics = new PIXI.Graphics();
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (gameState.board[y][x]) {
          const blockX = boardX + x * BLOCK_SIZE;
          const blockY = boardY + y * BLOCK_SIZE;
          
          blocksGraphics.beginFill(0x666666);
          blocksGraphics.drawRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
          blocksGraphics.endFill();
          
          blocksGraphics.lineStyle(1, 0x888888);
          blocksGraphics.drawRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
    app.stage.addChild(blocksGraphics);

    // Draw current piece
    if (gameState.currentPiece) {
      const pieceGraphics = new PIXI.Graphics();
      const { shape, position } = gameState.currentPiece;
      const color = TETROMINO_COLORS[gameState.currentPiece.type];

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const blockX = boardX + (position.x + x) * BLOCK_SIZE;
            const blockY = boardY + (position.y + y) * BLOCK_SIZE;
            
            pieceGraphics.beginFill(color);
            pieceGraphics.drawRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
            pieceGraphics.endFill();
            
            pieceGraphics.lineStyle(1, 0xffffff);
            pieceGraphics.drawRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
          }
        }
      }
      app.stage.addChild(pieceGraphics);
    }

    // Draw ghost piece
    if (gameState.ghostPiece && gameState.currentPiece) {
      const ghostGraphics = new PIXI.Graphics();
      const { shape, position } = gameState.ghostPiece;

      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const blockX = boardX + (position.x + x) * BLOCK_SIZE;
            const blockY = boardY + (position.y + y) * BLOCK_SIZE;
            
            // 반투명한 회색으로 고스트 블록 그리기
            ghostGraphics.beginFill(0x888888, 0.3);
            ghostGraphics.drawRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
            ghostGraphics.endFill();
            
            // 테두리는 더 진한 회색으로
            ghostGraphics.lineStyle(1, 0x666666, 0.5);
            ghostGraphics.drawRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
          }
        }
      }
      app.stage.addChild(ghostGraphics);
    }

    // Draw game over overlay
    if (gameState.gameOver) {
      const overlay = new PIXI.Graphics();
      overlay.beginFill(0x000000, 0.8);
      overlay.drawRect(0, 0, width, height);
      overlay.endFill();
      app.stage.addChild(overlay);

      const gameOverText = new PIXI.Text('게임 오버', {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xff0000,
        align: 'center',
      });
      gameOverText.anchor.set(0.5);
      gameOverText.x = width / 2;
      gameOverText.y = height / 2;
      app.stage.addChild(gameOverText);
    }

    // Draw pause overlay
    if (gameState.paused && !gameState.gameOver) {
      const overlay = new PIXI.Graphics();
      overlay.beginFill(0x000000, 0.5);
      overlay.drawRect(0, 0, width, height);
      overlay.endFill();
      app.stage.addChild(overlay);

      const pauseText = new PIXI.Text('일시정지', {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: 0xffffff,
        align: 'center',
      });
      pauseText.anchor.set(0.5);
      pauseText.x = width / 2;
      pauseText.y = height / 2;
      app.stage.addChild(pauseText);
    }

  }, [gameState, width, height]);

  return (
    <div className="relative">
      <div ref={canvasRef} />
      <PhysicsEffects
        width={width}
        height={height}
        ref={physicsEffectsRef}
      />
    </div>
  );
}; 