# Supabase Storage 설정 가이드

## ❗ 에러: "Failed to upload image to storage"

이 에러는 Supabase Storage 버킷이 생성되지 않았거나 권한 설정이 안 되어 발생합니다.

---

## 1️⃣ 버킷 생성 (필수)

### 단계별 가이드

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Storage 메뉴 클릭**
   - 왼쪽 사이드바 → **Storage** 클릭

3. **새 버킷 생성**
   - **"Create a new bucket"** 버튼 클릭
   
4. **버킷 설정**
   ```
   Bucket name: inspirations-blur
   Public bucket: ✅ ON (체크 필수!)
   File size limit: 50 MB (기본값)
   Allowed MIME types: image/* (기본값)
   ```

5. **Create bucket** 클릭

### ⚠️ 중요: Public bucket을 반드시 ON으로 설정하세요!
Public으로 설정해야 업로드된 이미지의 공개 URL을 바로 사용할 수 있습니다.

---

## 2️⃣ RLS (Row Level Security) 정책 확인

### Storage RLS 정책 설정

1. **Storage 메뉴에서 버킷 선택**
   - `inspirations-blur` 버킷 클릭

2. **Policies 탭 클릭**

3. **Insert 정책 추가**

#### Option A: 모든 사용자 업로드 허용 (개발 단계 추천)
```sql
-- Policy Name: Allow public uploads
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'inspirations-blur');
```

#### Option B: 인증된 사용자만 업로드 허용 (프로덕션 추천)
```sql
-- Policy Name: Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'inspirations-blur');
```

4. **Select 정책 추가 (공개 읽기)**
```sql
-- Policy Name: Allow public read
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'inspirations-blur');
```

### 빠른 설정 (UI에서)

1. **Policies 탭**에서 **"New Policy"** 클릭
2. **Template 선택**:
   - "Allow public access" 또는
   - "Allow authenticated users"
3. **Operations 선택**:
   - ✅ INSERT
   - ✅ SELECT
4. **Create policy** 클릭

---

## 3️⃣ 버킷 이름 확인

### 현재 코드에서 사용 중인 버킷 이름

#### [app/api/inspirations/upload/route.ts](file:///d:/테스트/grim-sil/app/api/inspirations/upload/route.ts)
```typescript
// Line 33
.from('inspirations-blur')  // ✅ 버킷 이름: inspirations-blur
```

**버킷 이름이 정확히 일치해야 합니다!**

---

## 4️⃣ 확인 체크리스트

설정이 완료되면 다음을 확인하세요:

- [ ] Supabase Dashboard → Storage 메뉴에 `inspirations-blur` 버킷이 보임
- [ ] 버킷 설정에서 "Public bucket" = ✅ ON
- [ ] Policies 탭에 INSERT 정책이 있음
- [ ] Policies 탭에 SELECT 정책이 있음

---

## 5️⃣ 테스트 방법

### Supabase Dashboard에서 직접 테스트

1. **Storage** → `inspirations-blur` 버킷 클릭
2. **"Upload file"** 버튼으로 테스트 이미지 업로드
3. 업로드 성공 → 권한 설정 완료! ✅
4. 업로드 실패 → RLS 정책 다시 확인 필요

---

## 🔧 트러블슈팅

### 에러: "new row violates row-level security policy"
- **원인**: RLS 정책이 없거나 잘못 설정됨
- **해결**: INSERT 정책 추가 (위 2️⃣ 참조)

### 에러: "Bucket not found"
- **원인**: 버킷 이름 오타 또는 미생성
- **해결**: 버킷 이름이 정확히 `inspirations-blur`인지 확인

### 에러: "The resource already exists"
- **원인**: 같은 파일명으로 재업로드 시도
- **해결**: 코드에서 `upsert: true` 옵션 확인 (이미 설정됨)

---

## 📋 빠른 설정 요약

```bash
# 1. Supabase Dashboard 접속
# 2. Storage → Create bucket
# 3. Name: inspirations-blur, Public: ON
# 4. Policies → New Policy
# 5. Allow public uploads (INSERT)
# 6. Allow public read (SELECT)
# 7. 완료!
```

설정 완료 후 앱에서 다시 영감 채집을 시도해보세요! 🚀
