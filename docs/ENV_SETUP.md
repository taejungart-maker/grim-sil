# 환경 변수 설정 가이드

## 필수 Supabase 환경 변수

`.env.local` 파일에 다음 변수들이 필요합니다:

```env
# Supabase 기본 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# API Route용 (중요!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 환경 변수 가져오는 방법

1. **Supabase Dashboard** 접속
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Settings → API** 메뉴 클릭

3. **Project URL** 복사
   ```
   NEXT_PUBLIC_SUPABASE_URL=여기에_붙여넣기
   ```

4. **Project API keys** 섹션에서:
   - `anon` `public` 키 복사
     ```
     NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_붙여넣기
     ```
   
   - `service_role` `secret` 키 복사 (중요!)
     ```
     SUPABASE_SERVICE_ROLE_KEY=여기에_붙여넣기
     ```

## ⚠️ 중요

- `service_role` 키는 **절대 공개하면 안 됩니다**!
- `.env.local` 파일은 `.gitignore`에 포함되어야 합니다
- 키 복사 시 앞뒤 공백 제거

## 설정 후

1. 개발 서버 재시작:
   ```bash
   # Ctrl+C로 서버 중단
   npm run dev
   ```

2. API route가 `SUPABASE_SERVICE_ROLE_KEY`를 사용하도록 수정 필요
