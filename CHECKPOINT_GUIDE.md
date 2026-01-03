# 🔖 체크포인트 관리 가이드

## 개념

작업 중 디자인이나 기능이 완벽하게 작동할 때 **체크포인트**를 생성합니다. 
나중에 문제가 생기면 이 체크포인트로 즉시 돌아갈 수 있습니다.

## 📍 현재 체크포인트

### checkpoint-dec25-design-locked
- **날짜**: 2026-01-03 19:06 KST
- **상태**: ✅ 안전 (12월 25일 디자인 복원 + 보호 완료)
- **커밋**: `c055c2a`
- **설명**: 
  - 12월 25일 승인된 그리드 디자인 완벽 복원
  - 모든 빌드 오류 해결 완료
  - Vercel 프로덕션 배포 성공
  - 디자인 보호 장치 추가 (DESIGN_LOCKED.md + 경고 주석)

## 🔄 체크포인트로 복원하는 방법

### 방법 1: 완전 초기화 (모든 변경 사항 버림)
```bash
# ⚠️ 경고: 현재 작업 내용이 모두 삭제됩니다!
git reset --hard checkpoint-dec25-design-locked
git push origin main --force
```

### 방법 2: 안전한 복원 (현재 작업 백업 후 복원)
```bash
# 1. 현재 상태 백업
git checkout -b backup-before-restore-$(date +%Y%m%d-%H%M%S)
git push origin backup-before-restore-$(date +%Y%m%d-%H%M%S)

# 2. 메인 브랜치로 돌아가서 체크포인트로 복원
git checkout main
git reset --hard checkpoint-dec25-design-locked
git push origin main --force
```

### 방법 3: 특정 파일만 복원
```bash
# 디자인 파일만 복원 (다른 변경사항은 유지)
git checkout checkpoint-dec25-design-locked -- app/page.tsx
git commit -m "RESTORE: Revert to Dec 25 design from checkpoint"
```

## 📌 새 체크포인트 만드는 방법

### 언제 만들어야 할까?
- ✅ 새로운 기능이 완벽하게 작동할 때
- ✅ 디자인 변경이 성공적으로 배포되었을 때
- ✅ 중요한 버그 수정이 완료되었을 때
- ✅ 배포 전 안정적인 상태일 때

### 체크포인트 생성 명령어
```bash
# 1. 현재 상태를 커밋 (아직 안 했다면)
git add .
git commit -m "설명"

# 2. 체크포인트 태그 생성
git tag -a "checkpoint-기능명-날짜" -m "✅ SAFE CHECKPOINT: 설명 (날짜)"

# 3. 원격 저장소에 푸시
git push origin checkpoint-기능명-날짜
```

### 예시
```bash
git tag -a "checkpoint-payment-system" -m "✅ SAFE CHECKPOINT: Payment system fully working (2026-01-10)"
git push origin checkpoint-payment-system
```

## 📋 체크포인트 목록 확인

```bash
# 모든 체크포인트 보기
git tag -l "checkpoint-*"

# 체크포인트 상세 정보
git show checkpoint-dec25-design-locked
```

## ⚠️ 주의사항

### 복원 전 확인사항
1. **백업 생성**: 현재 작업을 브랜치로 백업
2. **팀원 확인**: 다른 사람이 작업 중이라면 협의
3. **배포 영향**: Vercel 재배포가 필요함

### 복원 후 해야 할 일
1. **로컬 테스트**: `npm run dev`로 작동 확인
2. **Vercel 재배포**: `git push`로 자동 배포 트리거
3. **검증**: 라이브 사이트에서 디자인 확인

## 🎯 추천 워크플로우

### 안전한 작업 방식
```bash
# 1. 새 기능 개발 시작 전 - 현재 상태가 완벽하다면 체크포인트 생성
git tag -a "checkpoint-before-new-feature" -m "✅ SAFE"

# 2. 작업 진행...

# 3. 문제 발생 시 - 즉시 체크포인트로 복원
git reset --hard checkpoint-before-new-feature

# 4. 새 기능 완성 후 - 새 체크포인트 생성
git tag -a "checkpoint-new-feature-done" -m "✅ SAFE"
```

## 🔖 체크포인트 네이밍 규칙

```
checkpoint-[기능명]-[상태]
```

예시:
- `checkpoint-dec25-design-locked` ✅ 현재
- `checkpoint-payment-working`
- `checkpoint-before-major-refactor`
- `checkpoint-all-tests-passing`

---

**마지막 업데이트**: 2026-01-03 19:06 KST  
**현재 안전 체크포인트**: `checkpoint-dec25-design-locked`
