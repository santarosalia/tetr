# 테트리스 게임

Vite + React + TypeScript + Pixi.js + Matter.js를 사용하여 만든 현대적인 테트리스 게임입니다.

## 🎮 게임 특징

- **Pixi.js 렌더링**: 부드러운 그래픽과 애니메이션
- **Matter.js 물리 효과**: 라인이 제거될 때 물리 효과
- **반응형 디자인**: 다양한 화면 크기에 대응
- **키보드 조작**: 직관적인 키보드 컨트롤
- **점수 시스템**: 레벨과 라인에 따른 점수 계산

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 16 이상
- pnpm (권장)

### 설치
```bash
# 의존성 설치
pnpm install
```

### 개발 서버 실행
```bash
# 개발 모드로 실행
pnpm dev
```

### 빌드
```bash
# 프로덕션 빌드
pnpm build
```

## 🎯 게임 조작법

| 키 | 동작 |
|---|---|
| ← → | 좌우 이동 |
| ↓ | 빠른 하강 |
| ↑ | 블록 회전 |
| 스페이스바 | 즉시 하강 |
| P | 일시정지/재개 |

## 🛠️ 기술 스택

- **Vite**: 빠른 개발 환경
- **React 18**: 사용자 인터페이스
- **TypeScript**: 타입 안전성
- **Pixi.js**: 2D 렌더링 엔진
- **Matter.js**: 물리 엔진
- **pnpm**: 패키지 매니저

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── TetrisRenderer.tsx    # Pixi.js 렌더링
│   ├── GameUI.tsx           # 게임 UI
│   └── PhysicsEffects.tsx   # Matter.js 물리 효과
├── hooks/              # 커스텀 훅
│   └── useTetrisGame.ts     # 게임 로직
├── utils/              # 유틸리티 함수
│   └── tetrisLogic.ts       # 테트리스 게임 로직
├── constants/          # 상수 정의
│   └── tetrominos.ts        # 테트로미노 모양과 색상
├── types/              # TypeScript 타입 정의
│   └── tetris.ts           # 게임 타입
├── App.tsx             # 메인 앱 컴포넌트
└── main.tsx            # 앱 진입점
```

## 🎨 게임 기능

### 기본 테트리스 규칙
- 7가지 테트로미노 블록 (I, O, T, S, Z, J, L)
- 라인 완성 시 제거
- 레벨에 따른 속도 증가
- 게임 오버 시스템

### 추가 기능
- **물리 효과**: 라인 제거 시 블록이 물리적으로 분해
- **다음 블록 미리보기**: 다음에 나올 블록 표시
- **점수 시스템**: 라인 수와 레벨에 따른 점수
- **일시정지**: 게임 중단/재개 기능

## 🔧 개발

### 코드 스타일
- TypeScript 엄격 모드 사용
- ESLint를 통한 코드 품질 관리
- 함수형 컴포넌트와 훅 사용

### 성능 최적화
- React.memo를 통한 불필요한 리렌더링 방지
- useCallback과 useMemo를 통한 메모이제이션
- Pixi.js의 효율적인 렌더링

## 📝 라이선스

MIT License

## 🤝 기여

버그 리포트나 기능 제안은 이슈를 통해 해주세요! 