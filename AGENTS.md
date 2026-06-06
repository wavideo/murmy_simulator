# AGENTS.md

이 문서는 이 프로젝트에서 AI 작업자가 먼저 읽는 진입점이다.

이 프로젝트는 `/Users/euntaekkim/Documents/머더미스테리엔진`에서 개발 중이던 기존 프로젝트를 `AI-Workspace/projects/` 아래로 복제해 온 것이다. 새로 생성한 빈 프로젝트로 취급하지 않는다.

## 읽기 순서

1. `../../AGENTS.md`
2. `PROJECT_RULES.md`
3. `README.md`
4. `../../shared-rules/AGENTS.md`
5. 필요한 workflow와 guide 문서

## 작업 규칙

- 프로젝트별 rules를 공통 rules보다 우선한다.
- 기존 구현, 파일 구조, 실행 방식을 먼저 확인한 뒤 수정한다.
- 공통으로 재사용할 지침은 이 프로젝트가 아니라 `../../shared-rules/`에 추가한다.
- 작업과 무관한 workflow나 guide 문서는 읽지 않는다.
- 수정 전 영향 범위를 짧게 요약한다.
- 명시되지 않은 대규모 리팩터링은 하지 않는다.
- 이 프로젝트에서 실제 수정, 실행, 빌드, 테스트, 설치, 디버깅을 수행했으면 작업 종료 전 `../../ACTIVE_PROJECT.md`를 이 프로젝트 경로로 갱신한다.
- 보안 정보, API 키, `.env`, 개인정보를 커밋하지 않는다.
