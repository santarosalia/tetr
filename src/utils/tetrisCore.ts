import { TetrominoType, Tetromino } from '../types/shared';
import {
    TETROMINO_SHAPES,
    TETROMINO_SPAWN_POSITIONS,
    SRS_WALL_KICK_DATA,
} from '../constants/tetrominos';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BLOCK_SIZE = 30;

// 서버 권위적: 클라이언트는 서버에서 받은 피스만 사용하므로 7-bag 시스템 제거

export function createEmptyBoard(): number[][] {
    return Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(0));
}

// 테트리스 표준: 테트로미노 생성 (스폰 위치에서 시작) - 렌더링용
export function createTetromino(type: TetrominoType): Tetromino {
    const spawnPos = TETROMINO_SPAWN_POSITIONS[type];
    return {
        type,
        position: { x: spawnPos.x, y: spawnPos.y },
        rotation: 0,
        shape: TETROMINO_SHAPES[type][0],
    };
}

// 서버 권위적: 랜덤 테트로미노 타입 가져오기 (서버에서 관리)
export function getRandomTetrominoType(): TetrominoType {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    return types[Math.floor(Math.random() * types.length)];
}

// 렌더링용 회전 함수
export function rotateTetromino(tetromino: Tetromino): Tetromino {
    const newRotation = (tetromino.rotation + 1) % 4;
    return {
        ...tetromino,
        rotation: newRotation,
        shape: TETROMINO_SHAPES[tetromino.type][newRotation],
    };
}

// SRS (Super Rotation System) 벽킥 구현 - 렌더링용
export function rotateTetrominoWithWallKick(
    tetromino: Tetromino,
    board: number[][]
): Tetromino | null {
    const rotatedPiece = rotateTetromino(tetromino);

    // 기본 회전이 가능한지 확인
    if (isValidPosition(rotatedPiece, board)) {
        return rotatedPiece;
    }

    // SRS 벽킥 데이터 가져오기
    const wallKickData = SRS_WALL_KICK_DATA[tetromino.type];
    if (!wallKickData || wallKickData.length === 0) {
        // O 피스는 회전하지 않으므로 null 반환
        return null;
    }

    // 현재 회전에서 다음 회전으로의 벽킥 테스트
    const currentRotation = tetromino.rotation;
    const nextRotation = rotatedPiece.rotation;
    const kickIndex = currentRotation * 2 + (nextRotation > currentRotation ? 0 : 1);

    if (kickIndex < wallKickData.length) {
        const kicks = wallKickData[kickIndex];

        for (const [offsetX, offsetY] of kicks) {
            const kickedPiece = {
                ...rotatedPiece,
                position: {
                    x: rotatedPiece.position.x + offsetX,
                    y: rotatedPiece.position.y + offsetY,
                },
            };

            if (isValidPosition(kickedPiece, board)) {
                return kickedPiece;
            }
        }
    }

    // 벽킥이 실패하면 null 반환
    return null;
}

// 렌더링용 위치 검증 함수
export function isValidPosition(
    tetromino: Tetromino,
    board: number[][],
    offsetX: number = 0,
    offsetY: number = 0
): boolean {
    const { shape, position } = tetromino;
    const newX = position.x + offsetX;
    const newY = position.y + offsetY;

    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardX = newX + x;
                const boardY = newY + y;

                if (
                    boardX < 0 ||
                    boardX >= BOARD_WIDTH ||
                    boardY >= BOARD_HEIGHT ||
                    (boardY >= 0 && board[boardY][boardX])
                ) {
                    return false;
                }
            }
        }
    }
    return true;
}

// 렌더링용 고스트 피스 계산 함수
export function getGhostPiece(tetromino: Tetromino, board: number[][]): Tetromino {
    // 현재 피스의 떨어질 위치를 계산
    const ghostPosition = { ...tetromino.position };

    // 아래로 이동할 수 있는 최대 거리를 찾음
    while (
        isValidPosition(tetromino, board, 0, ghostPosition.y - tetromino.position.y + 1)
    ) {
        ghostPosition.y++;
    }

    return {
        ...tetromino,
        position: ghostPosition,
    };
}
