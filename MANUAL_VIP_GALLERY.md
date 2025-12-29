# VIP 갤러리 추가 및 관리 표준 매뉴얼 (V1)

이 매뉴얼은 새로운 작가 또는 VIP 룸을 추가할 때 데이터 격리(Isolation)를 보장하고 시스템 혼선을 방지하기 위한 표준 절차를 정의합니다.

## 1. 데이터베이스 파티션 정의 (Supabase)

모든 데이터는 `artist_id`를 기준으로 격리됩니다. 새로운 갤러리를 추가할 때는 다음 형식을 엄격히 준수해야 합니다.

- **메인 갤러리**: `default`
- **VIP 갤러리**: `vip-gallery-XX` (예: `vip-gallery-06`)

> [!IMPORTANT]
> `artist_id`는 하이픈(-)을 포함한 소문자 영문과 숫자로만 구성하며, 공백이나 특수문자를 허용하지 않습니다.

## 2. 신규 룸 등록 절차

### 단계 1: `settings` 테이블 레코드 생성
`settings` 테이블에 새로운 룸 정보를 삽입합니다. 이때 `id`와 `artist_id`는 반드시 동일한 값으로 설정되어야 합니다.

```sql
INSERT INTO settings (id, artist_id, artist_name, gallery_name_ko, ...)
VALUES ('vip-gallery-06', 'vip-gallery-06', '신규작가명', '신규 갤러리명', ...);
```

### 단계 2: 코드 상의 라우팅 추가
`next.config.js` 또는 `app/` 디렉토리 구조에 맞춰 해당 ID에 대한 접근 경로를 확보합니다. (현재는 `gallery-[id]` 패턴을 사용 중)

### 단계 3: 데이터 유효성 검증
`db.ts`의 `validateArtistId` 함수가 새로운 ID 형식을 지원하는지 확인합니다.

---

## 3. 운영 및 유지보수 수칙 (Fail-Safe)

1. **ID 기본값(Fallback) 금지**: 모든 비즈니스 로직(업로드, 조회)에서 `artist_id`가 누락될 경우 자동으로 `default`로 저장되지 않도록 명시적인 에러 핸들링을 유지합니다.
2. **배포 전 데이터 감사**: 새로운 룸 추가 후 반드시 `/check-data` 페이지를 통해 해당 룸의 데이터 카운트가 타 룸과 독립적으로 운영되는지 확인합니다.
3. **데모 데이터 관리**: `demoData.ts` 로직이 실행될 때 반드시 대상 `artistId`를 인자로 전달하여 엉뚱한 방에 데모 데이터가 들어가는 것을 방지합니다.

---

## 4. 장애 대응 (Isolation Breach)

만약 다른 방의 데이터가 섞여 보이는 현상이 발생할 경우:
1. `check-data` 페이지의 **Isolation Self-Test** 결과를 확인합니다.
2. `scripts/audit-db.js`를 실행하여 `settings` 테이블의 중복 여부를 파악합니다.
3. 필요 시 `scripts/enforce-isolation.js`를 수정하여 DB 정합성을 강제 복구합니다.
