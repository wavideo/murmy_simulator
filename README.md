# murmy_simulator

머더 미스터리 시나리오 `열린 교회 닫힌 문`을 디지털 보드 형태로 진행하기 위한 React + Vite 기반 웹 앱이다.

## 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

빌드 결과물은 `dist/`에 생성된다.

## 저장소 운영 원칙

- 이 프로젝트는 `main` 하나를 기준으로 개발 소스와 배포 산출물을 함께 관리할 수 있다.
- `src/`, `assets/`, `package.json` 등은 개발 소스다.
- `dist/`는 같은 소스에서 `npm run build`로 생성되는 배포용 정적 산출물이다.
- 별도의 `gh-pages` 전용 브랜치나 별도 저장소를 기본값으로 요구하지 않는다.
- 배포 산출물까지 함께 관리할 때는 소스 변경 후 `npm run build`를 실행해 `dist/`를 최신 상태로 유지한다.
