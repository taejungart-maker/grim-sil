# CLAUDE.md - Project Guidelines & Rules

## 13 Core Principles for Efficiency & Stability
1.  **병렬 실행 (Parallel Execution)**: 필요시 세션을 나눠 작업할 것.
2.  **알림 활용 (Notifications)**: 내 피드백이 필요하면 즉시 알릴 것.
3.  **최상위 모델 (Top-tier model)**: 항상 Thinking 모드로 깊게 생각할 것.
4.  **CLAUDE.md**: 프로젝트 규칙을 기록하고 공유할 것.
5.  **PR 검증 (PR Verification)**: 코드 수정 후엔 반드시 검증 절차를 거칠 것.
6.  **플랜 모드 (Plan Mode)**: 코드부터 쓰지 말고 '수정 계획'부터 말할 것.
7.  **커맨드 저장 (Command Storage)**: 반복 작업은 명령어로 자동화할 것.
8.  **서브 에이전트 (Sub-agents)**: 코드 정리와 검증 역할을 분산할 것.
9.  **포스트 툴 훅 (Post-tool hooks)**: 작성 후 자동 포매팅할 것.
10. **권한 관리 (Permission management)**: 자주 쓰는 명령어 권한을 미리 요청할 것.
11. **툴 권한 (Tool permissions)**: DB나 로그 확인 툴을 적극 쓸 것.
12. **롱 러닝 작업 (Long-running tasks)**: 긴 작업은 백그라운드에서 돌릴 것.
13. **자기 검증 (Self-verification)**: 결과물을 스스로 피드백할 것.

## Project Structure Rules
- **Components**: `app/components/` for shared UI. Complex components should have sub-folders (e.g., `app/components/admin/`).
- **Hooks**: `app/hooks/` for all side effects and state logic. No complex logic in components.
- **Utils**: `app/utils/` for pure functions and DB helpers.
- **Services**: `lib/services/` for core business logic and external API/DB orchestrations.
- **Scripts**: `scripts/` for maintenance and deployment utilities.

## 공식 아키텍처 가이드 (Data-UI-Admin 분리)
모든 주요 기능은 다음의 3계층 구조를 엄격히 준수한다:
1. **Data Layer (Hook/Service)**:
   - 비즈니스 로직, 상태 관리, DB 통신을 담당.
   - 예: `useAdminActions.ts`, `encouragementService.ts`.
   - UI 코드 포함 절대 금지.
2. **UI Layer (Component)**:
   - 순수하게 화면 렌더링과 사용자 인터랙션만 담당.
   - 복잡한 로직은 훅이나 서비스에서 주입받아 사용.
   - 파일당 최대 300라인을 권장하며, 섹션별 서브 컴포넌트화를 적극 활용.
3. **Admin Layer (Management)**:
   - 관리자 기능(`AdminClient`)은 복잡도가 높으므로 반드시 '기능별 컴포넌트'와 '전용 액션 훅'으로 분리한다.

## Common Commands
- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Lint**: `npm run lint`
- **Database**: Check `scripts/` for various DB audit and cleanup scripts.

## Coding Patterns
- Use **functional components** and **hooks**.
- **Theming**: Use `getThemeColors(theme)` from `utils/themeColors`.
- **Data Fetching**: Use `useSyncedArtworks` and `useSyncedSettings` for real-time synchronization.
