import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE } from '../utils/tetrisLogic';

interface PhysicsEffectsProps {
  width: number;
  height: number;
  onEffectComplete?: () => void;
}

export const PhysicsEffects: React.FC<PhysicsEffectsProps> = ({ 
  width, 
  height, 
  onEffectComplete 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create engine
    const engine = Matter.Engine.create();
    engineRef.current = engine;

    // Create renderer
    const render = Matter.Render.create({
      element: containerRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'transparent'
      }
    });
    renderRef.current = render;

    // Create ground
    const ground = Matter.Bodies.rectangle(
      width / 2,
      height - 10,
      width,
      20,
      { isStatic: true }
    );

    // Create walls
    const leftWall = Matter.Bodies.rectangle(
      -10,
      height / 2,
      20,
      height,
      { isStatic: true }
    );
    const rightWall = Matter.Bodies.rectangle(
      width + 10,
      height / 2,
      20,
      height,
      { isStatic: true }
    );

    // Add bodies to world
    Matter.World.add(engine.world, [ground, leftWall, rightWall]);

    // Start the engine and renderer
    Matter.Engine.run(engine);
    Matter.Render.run(render);

    return () => {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        renderRef.current.canvas.remove();
        renderRef.current.canvas = null;
        renderRef.current.context = null;
        renderRef.current.textures = {};
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, [width, height]);

  const createBlock = (x: number, y: number, color: string) => {
    if (!engineRef.current) return;

    const block = Matter.Bodies.rectangle(
      x,
      y,
      BLOCK_SIZE - 2,
      BLOCK_SIZE - 2,
      {
        render: {
          fillStyle: color,
          strokeStyle: '#fff',
          lineWidth: 1
        }
      }
    );

    Matter.World.add(engineRef.current.world, block);
  };

  const createLineEffect = (lineY: number, blocks: boolean[]) => {
    if (!engineRef.current) return;

    const boardX = (width - BOARD_WIDTH * BLOCK_SIZE) / 2;
    const boardY = (height - BOARD_HEIGHT * BLOCK_SIZE) / 2;

    blocks.forEach((hasBlock, x) => {
      if (hasBlock) {
        const worldX = boardX + x * BLOCK_SIZE + BLOCK_SIZE / 2;
        const worldY = boardY + lineY * BLOCK_SIZE + BLOCK_SIZE / 2;
        
        // Random color for effect
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        createBlock(worldX, worldY, color);
      }
    });

    // Remove blocks after effect
    setTimeout(() => {
      if (engineRef.current) {
        const bodies = Matter.Composite.allBodies(engineRef.current.world);
        bodies.forEach(body => {
          if (body.position.y > boardY + lineY * BLOCK_SIZE - 10 && 
              body.position.y < boardY + lineY * BLOCK_SIZE + 10) {
            Matter.World.remove(engineRef.current!.world, body);
          }
        });
      }
      if (onEffectComplete) {
        onEffectComplete();
      }
    }, 2000);
  };

  // Expose methods to parent component
  React.useImperativeHandle(React.useRef(), () => ({
    createLineEffect
  }));

  return (
    <div 
      ref={containerRef}
      className="absolute top-0 left-0 pointer-events-none z-10"
      style={{
        width: width,
        height: height
      }}
    />
  );
}; 