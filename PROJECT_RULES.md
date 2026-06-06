# PROJECT_RULES

이 문서는 이 프로젝트에만 적용되는 rules를 기록한다.

## 프로젝트 성격

- `/Users/euntaekkim/Documents/머더미스테리엔진`에서 개발 중이던 기존 프로젝트를 복제해 온 것이다.
- 신규 스캐폴딩 프로젝트로 취급하지 말고, 기존 README와 구현을 기준으로 작업한다.

## 프로젝트 목표

- `murmy_simulator` / `multiverse-boardgame-mvp` React 기반 보드게임 MVP를 유지한다.

## 기술 스택

- React
- Vite
- Tailwind CSS
- lucide-react

## 검증 방법

- 의존성 설치: `npm install`
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 미리보기: `npm run preview`

## 작업 원칙

- 기존 assets와 `src/` 컴포넌트 구조를 먼저 확인한다.
- 배포 산출물 `dist/`와 개발 소스의 차이를 구분한다.
- 이 프로젝트는 기술적 필요가 없는 한 `main` 하나에서 개발 소스와 `dist/` 산출물을 함께 관리한다.
- 배포 가능한 상태로 정리하는 작업에서는 소스 변경 후 `npm run build`로 `dist/`를 최신 상태로 맞춘다.
- 보안 정보, API 키, `.env`, 개인정보를 커밋하지 않는다.
