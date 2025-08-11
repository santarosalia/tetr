import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Matter from 'matter-js';
import { BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE } from '../utils/tetrisLogic';

interface PhysicsEffectsProps {
    width: number;
    height: number;
    onEffectComplete?: () => void;
}

export interface PhysicsEffectsRef {
    createLineEffect: (lineY: number, blocks: boolean[]) => void;
    createPieceDropEffect: (
        pieceX: number,
        pieceY: number,
        pieceType: string,
        shape: boolean[][]
    ) => void;
}

export const PhysicsEffects = forwardRef<PhysicsEffectsRef, PhysicsEffectsProps>(
    ({ width, height }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const engineRef = useRef<Matter.Engine | null>(null);
        const renderRef = useRef<Matter.Render | null>(null);

        useEffect(() => {
            if (!containerRef.current) return;

            // 키보드 이벤트 완전 차단
            const preventKeyboardEvents = (e: KeyboardEvent) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            };

            const container = containerRef.current;
            container.addEventListener('keydown', preventKeyboardEvents, true);
            container.addEventListener('keyup', preventKeyboardEvents, true);
            container.addEventListener('keypress', preventKeyboardEvents, true);
            container.tabIndex = -1;
            container.style.outline = 'none';

            // Create engine
            const engine = Matter.Engine.create({
                enableSleeping: false,
                constraintIterations: 2,
                positionIterations: 6,
                velocityIterations: 4,
            });
            engineRef.current = engine;

            // Matter.js 키보드 이벤트 비활성화
            if (engine.render && engine.render.canvas) {
                engine.render.canvas.tabIndex = -1;
                engine.render.canvas.style.outline = 'none';
                engine.render.canvas.addEventListener(
                    'keydown',
                    (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    },
                    true
                );
            }

            // Create renderer
            const render = Matter.Render.create({
                element: containerRef.current,
                engine: engine,
                options: {
                    width: width,
                    height: height,
                    wireframes: false,
                    background: 'transparent',
                    showAngleIndicator: false,
                    showCollisions: false,
                    showVelocity: false,
                    hasBounds: false,
                },
            });
            renderRef.current = render;

            // Start the engine and renderer
            Matter.Engine.run(engine);
            Matter.Render.run(render);

            // 파티클이 자연스럽게 화면 밖으로 나갈 때까지 지속
            // 자동 제거 타이머 제거 - 파티클이 물리 법칙에 따라 자연스럽게 사라짐

            return () => {
                // 이벤트 리스너 제거
                container.removeEventListener('keydown', preventKeyboardEvents, true);
                container.removeEventListener('keyup', preventKeyboardEvents, true);
                container.removeEventListener('keypress', preventKeyboardEvents, true);

                if (renderRef.current) {
                    Matter.Render.stop(renderRef.current);
                    renderRef.current.canvas.remove();
                    renderRef.current.textures = {};
                }
                if (engineRef.current) {
                    Matter.Engine.clear(engineRef.current);
                }
            };
        }, [width, height]);

        const createBlock = (
            x: number,
            y: number,
            color: string,
            size: number = BLOCK_SIZE - 2
        ) => {
            if (!engineRef.current) return;

            const block = Matter.Bodies.rectangle(x, y, size, size, {
                render: {
                    fillStyle: color,
                    strokeStyle: '#fff',
                    lineWidth: 1,
                },
                restitution: 0.3,
                friction: 0.1,
                density: 0.001,
            });

            // 초기 속도 추가 (위로 튀어오르는 효과)
            Matter.Body.setVelocity(block, {
                x: (Math.random() - 0.5) * 5,
                y: -Math.random() * 3 - 2,
            });

            Matter.World.add(engineRef.current.world, block);
            return block;
        };

        const createPieceDropEffect = (
            pieceX: number,
            pieceY: number,
            pieceType: string,
            shape: boolean[][]
        ) => {
            if (!engineRef.current) return;

            const boardX = (width - BOARD_WIDTH * BLOCK_SIZE) / 2;
            const boardY = (height - BOARD_HEIGHT * BLOCK_SIZE) / 2;

            // 피스 타입에 따른 색상
            const colorMap: Record<string, string> = {
                I: '#00f0f0',
                O: '#f0f000',
                T: '#a000f0',
                S: '#00f000',
                Z: '#f00000',
                J: '#0000f0',
                L: '#f0a000',
            };

            const baseColor = colorMap[pieceType] || '#ffffff';

            // 각 블록에 대해 파티클 생성
            shape.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell) {
                        // 실제 블록의 왼쪽 상단 모서리 위치 계산
                        const blockLeftX = boardX + (pieceX + x) * BLOCK_SIZE;
                        const blockTopY = boardY + (pieceY + y) * BLOCK_SIZE;

                        // 블록의 중심 위치 (파티클 생성 위치)
                        const centerX = blockLeftX + BLOCK_SIZE / 2;
                        const centerY = blockTopY + BLOCK_SIZE / 2;

                        // 메인 블록 파티클
                        createBlock(centerX, centerY, baseColor);

                        // 추가 파티클들 (더 작은 크기)
                        for (let i = 0; i < 3; i++) {
                            const offsetX = (Math.random() - 0.5) * BLOCK_SIZE;
                            const offsetY = (Math.random() - 0.5) * BLOCK_SIZE;
                            const particleSize = Math.random() * 8 + 4;

                            createBlock(
                                centerX + offsetX,
                                centerY + offsetY,
                                baseColor,
                                particleSize
                            );
                        }
                    }
                });
            });

            // 파티클이 자연스럽게 화면 밖으로 나갈 때까지 지속
            // 자동 제거 타이머 제거
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
                    const colors = [
                        '#ff0000',
                        '#00ff00',
                        '#0000ff',
                        '#ffff00',
                        '#ff00ff',
                        '#00ffff',
                    ];
                    const color = colors[Math.floor(Math.random() * colors.length)];

                    createBlock(worldX, worldY, color);
                }
            });

            // 파티클이 자연스럽게 화면 밖으로 나갈 때까지 지속
            // 자동 제거 타이머 제거
        };

        // Expose methods to parent component
        useImperativeHandle(ref, () => ({
            createLineEffect,
            createPieceDropEffect,
        }));

        return (
            <div
                ref={containerRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                    width: width,
                    height: height,
                    zIndex: 5,
                    opacity: 0.8,
                    pointerEvents: 'none',
                }}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                onKeyPress={(e) => e.stopPropagation()}
            />
        );
    }
);
