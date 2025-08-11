import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useAppSelector } from '../hooks/redux';
import { TETROMINO_COLORS } from '../constants/tetrominos';
import { BOARD_WIDTH, BOARD_HEIGHT, BLOCK_SIZE } from '../utils/tetrisLogic';
import { PhysicsEffects, PhysicsEffectsRef } from './PhysicsEffects';
import { TetrominoType } from '../types/shared';

interface TetrisRendererProps {
    width: number;
    height: number;
}

export const TetrisRenderer: React.FC<TetrisRendererProps> = ({ width, height }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const physicsEffectsRef = useRef<PhysicsEffectsRef>(null);
    const gameState = useAppSelector((state) => state.multiplayer.gameState);
    const animationRef = useRef<number | null>(null);
    const timeRef = useRef<number>(0);

    // 이전 currentPiece와 board 정보를 저장할 ref들
    const prevCurrentPieceRef = useRef<any>(null);
    const prevBoardRef = useRef<number[][] | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Create PIXI application
        const app = new PIXI.Application({
            width,
            height,
            antialias: true,
        });

        canvasRef.current.appendChild(app.view as HTMLCanvasElement);
        appRef.current = app;

        return () => {
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [width, height]);

    // 피스 배치 감지 및 파티클 효과 트리거 (board 변경 감지 기반)
    useEffect(() => {
        if (!gameState?.board || !physicsEffectsRef.current) return;

        const currentBoard = gameState.board;
        const prevBoard = prevBoardRef.current;
        const prevCurrentPiece = prevCurrentPieceRef.current;

        // board가 변경되었고, 이전 currentPiece가 있는 경우에만 파티클 효과 생성
        if (
            prevBoard &&
            prevCurrentPiece &&
            JSON.stringify(currentBoard) !== JSON.stringify(prevBoard)
        ) {
            // board에서 새로 추가된 블록들을 찾기
            const newBlocks: { x: number; y: number; type: string }[] = [];

            for (let y = 0; y < BOARD_HEIGHT; y++) {
                for (let x = 0; x < BOARD_WIDTH; x++) {
                    // 이전 board에는 없었지만 현재 board에는 있는 블록
                    if (currentBoard[y]?.[x] && !prevBoard[y]?.[x]) {
                        newBlocks.push({ x, y, type: prevCurrentPiece.type });
                    }
                }
            }

            // 새로 추가된 블록들에 대해 파티클 효과 생성
            if (newBlocks.length > 0 && physicsEffectsRef.current) {
                newBlocks.forEach((block) => {
                    // 단일 블록을 위한 shape 생성
                    const singleBlockShape = [[true]];

                    physicsEffectsRef.current!.createPieceDropEffect(
                        block.x,
                        block.y,
                        block.type,
                        singleBlockShape
                    );
                });
            }
        }

        // 현재 상태를 이전 상태로 저장
        prevCurrentPieceRef.current = gameState.currentPiece;
        prevBoardRef.current = JSON.parse(JSON.stringify(currentBoard));
    }, [gameState?.board, gameState?.currentPiece]);

    // 배경 애니메이션 함수
    const animateBackground = (time: number) => {
        if (!appRef.current) return;

        const app = appRef.current;
        timeRef.current = time * 0.001; // 초 단위로 변환

        // 기존 배경 제거
        const existingBackground = app.stage.children.find(
            (child) => child.name === 'animatedBackground'
        );
        if (existingBackground) {
            app.stage.removeChild(existingBackground);
        }

        // 새로운 배경 생성
        const background = new PIXI.Graphics();
        background.name = 'animatedBackground';

        // 좌에서 우로 흐르는 형형색색 그라데이션
        const segments = 200; // 더 많은 세그먼트로 부드러운 그라데이션
        for (let i = 0; i <= segments; i++) {
            const progress = i / segments;

            // 시간에 따라 변하는 색상들 (형형색색)
            const hue1 = (timeRef.current * 0.1 + 0.2) % 1; // 빨강-주황
            const hue2 = (timeRef.current * 0.1 + 0.2) % 1; // 주황-노랑
            const hue3 = (timeRef.current * 0.1 + 0.2) % 1; // 노랑-초록
            const hue4 = (timeRef.current * 0.1 + 0.2) % 1; // 초록-파랑

            // HSL을 RGB로 변환하는 함수
            const hslToRgb = (
                h: number,
                s: number,
                l: number
            ): [number, number, number] => {
                const hue = h * 360;
                const sat = s * 100;
                const light = l * 100;

                const c = ((1 - Math.abs((2 * light) / 100 - 1)) * sat) / 100;
                const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
                const m = light / 100 - c / 2;

                let r = 0,
                    g = 0,
                    b = 0;

                if (hue < 60) {
                    r = c;
                    g = x;
                    b = 0;
                } else if (hue < 120) {
                    r = x;
                    g = c;
                    b = 0;
                } else if (hue < 180) {
                    r = 0;
                    g = c;
                    b = x;
                } else if (hue < 240) {
                    r = 0;
                    g = x;
                    b = c;
                } else if (hue < 300) {
                    r = x;
                    g = 0;
                    b = c;
                } else {
                    r = c;
                    g = 0;
                    b = x;
                }

                return [
                    Math.round((r + m) * 255),
                    Math.round((g + m) * 255),
                    Math.round((b + m) * 255),
                ];
            };

            // 현재 위치에 따른 색상 계산
            let currentColor;
            if (progress < 0.25) {
                const t = progress / 0.25;
                const color1 = hslToRgb(hue1, 0.9, 0.2);
                const color2 = hslToRgb(hue2, 0.9, 0.2);
                const r = Math.round(color1[0] * (1 - t) + color2[0] * t);
                const g = Math.round(color1[1] * (1 - t) + color2[1] * t);
                const b = Math.round(color1[2] * (1 - t) + color2[2] * t);
                currentColor = (r << 16) | (g << 8) | b;
            } else if (progress < 0.5) {
                const t = (progress - 0.25) / 0.25;
                const color2 = hslToRgb(hue2, 0.9, 0.2);
                const color3 = hslToRgb(hue3, 0.9, 0.2);
                const r = Math.round(color2[0] * (1 - t) + color3[0] * t);
                const g = Math.round(color2[1] * (1 - t) + color3[1] * t);
                const b = Math.round(color2[2] * (1 - t) + color3[2] * t);
                currentColor = (r << 16) | (g << 8) | b;
            } else if (progress < 0.75) {
                const t = (progress - 0.5) / 0.25;
                const color3 = hslToRgb(hue3, 0.9, 0.2);
                const color4 = hslToRgb(hue4, 0.9, 0.2);
                const r = Math.round(color3[0] * (1 - t) + color4[0] * t);
                const g = Math.round(color3[1] * (1 - t) + color4[1] * t);
                const b = Math.round(color3[2] * (1 - t) + color4[2] * t);
                currentColor = (r << 16) | (g << 8) | b;
            } else {
                const t = (progress - 0.75) / 0.25;
                const color4 = hslToRgb(hue4, 0.9, 0.2);
                const color1 = hslToRgb(hue1, 0.9, 0.2);
                const r = Math.round(color4[0] * (1 - t) + color1[0] * t);
                const g = Math.round(color4[1] * (1 - t) + color1[1] * t);
                const b = Math.round(color4[2] * (1 - t) + color1[2] * t);
                currentColor = (r << 16) | (g << 8) | b;
            }

            const x = (width / segments) * i;
            const nextX = (width / segments) * (i + 1);

            background.beginFill(currentColor);
            background.drawRect(x, 0, nextX - x, height);
            background.endFill();
        }

        // 배경을 맨 뒤로 보내기
        app.stage.addChildAt(background, 0);

        animationRef.current = requestAnimationFrame(animateBackground);
    };

    // 배경 애니메이션 시작
    useEffect(() => {
        if (appRef.current) {
            animationRef.current = requestAnimationFrame(animateBackground);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [width, height]);

    useEffect(() => {
        if (!appRef.current) return;

        const app = appRef.current;

        // 배경을 제외한 모든 자식 요소 제거
        const childrenToRemove = app.stage.children.filter(
            (child) => child.name !== 'animatedBackground'
        );
        childrenToRemove.forEach((child) => app.stage.removeChild(child));

        // Draw board
        const boardGraphics = new PIXI.Graphics();
        const boardX = (width - BOARD_WIDTH * BLOCK_SIZE) / 2;
        const boardY = (height - BOARD_HEIGHT * BLOCK_SIZE) / 2;

        // Draw board background with transparency
        boardGraphics.beginFill(0x222222, 0.8);
        boardGraphics.drawRect(
            boardX,
            boardY,
            BOARD_WIDTH * BLOCK_SIZE,
            BOARD_HEIGHT * BLOCK_SIZE
        );
        boardGraphics.endFill();

        // Draw board grid
        boardGraphics.lineStyle(1, 'white');
        for (let x = 0; x <= BOARD_WIDTH; x++) {
            boardGraphics.moveTo(boardX + x * BLOCK_SIZE, boardY);
            boardGraphics.lineTo(
                boardX + x * BLOCK_SIZE,
                boardY + BOARD_HEIGHT * BLOCK_SIZE
            );
        }
        for (let y = 0; y <= BOARD_HEIGHT; y++) {
            boardGraphics.moveTo(boardX, boardY + y * BLOCK_SIZE);
            boardGraphics.lineTo(
                boardX + BOARD_WIDTH * BLOCK_SIZE,
                boardY + y * BLOCK_SIZE
            );
        }
        app.stage.addChild(boardGraphics);

        // Draw placed blocks
        const blocksGraphics = new PIXI.Graphics();
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (gameState?.board?.[y]?.[x]) {
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
        if (gameState?.currentPiece) {
            const pieceGraphics = new PIXI.Graphics();
            const { shape, position } = gameState.currentPiece;
            const color = TETROMINO_COLORS[gameState.currentPiece.type as TetrominoType];

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
        } else {
            console.log('currentPiece가 없습니다:', gameState?.currentPiece);
        }

        // Draw ghost piece
        if (gameState?.ghostPiece && gameState?.currentPiece) {
            const ghostGraphics = new PIXI.Graphics();
            const { shape, position } = gameState?.ghostPiece;

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
        if (gameState?.gameOver) {
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
        if (gameState?.paused && !gameState?.gameOver) {
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
            <PhysicsEffects width={width} height={height} ref={physicsEffectsRef} />
        </div>
    );
};
