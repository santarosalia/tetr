import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GameState } from '../types/tetris';
import { TETROMINO_COLORS } from '../constants/tetrominos';
import { BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE } from '../utils/tetrisLogic';

interface TetrisRendererProps {
  gameState: GameState;
  width: number;
  height: number;
}

export const TetrisRenderer: React.FC<TetrisRendererProps> = ({ gameState, width, height }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

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

  return <div ref={canvasRef} />;
}; 