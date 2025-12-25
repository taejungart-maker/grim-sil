# 🎨 갤러리 자동 배포 시스템 가이드

여러 아티스트를 위한 갤러리 앱을 자동으로 배포하는 시스템입니다.

## 📋 사전 준비사항

### 1. Vercel API 토큰 발급

1. [Vercel 대시보드](https://vercel.com/account/tokens)에 접속
2. "Create Token" 클릭
3. 토큰 이름 입력 (예: "Gallery Deployment")
4. Scope: Full Account 선택
5. 생성된 토큰 복사

### 2. Supabase 설정

1. [Supabase 대시보드](https://app.supabase.com)에서 프로젝트 선택
2. Settings → API에서 다음 정보 확인:
   - Project URL
   - anon public key
   - service_role key (⚠️ 절대 공개하지 마세요!)

### 3. 환경 변수 설정

프로젝트 루트의 `.env.local` 파일에 다음 내용 추가:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Vercel
VERCEL_TOKEN=your_vercel_token

# 기본 아티스트 ID (로컬 개발용)
NEXT_PUBLIC_ARTIST_ID=default
```

## 🚀 초기 설정

### 1. 데이터베이스 초기화

처음 한 번만 실행하여 멀티 테넌트 테이블 구조를 생성합니다:

```bash
npm run db:init
```

이 명령은 SQL 스크립트를 출력합니다. **Supabase Dashboard의 SQL Editor에서 해당 SQL을 실행**해주세요.

SQL은 다음을 수행합니다:
- `artists` 테이블 생성
- 기존 테이블에 `artist_id` 컬럼 추가
- RLS (Row Level Security) 정책 설정
- 인덱스 생성

## 📦 새 아티스트 배포

### 명령어

```bash
npm run deploy:artist
```

### 배포 프로세스

1. **아티스트 정보 입력**
   - 작가 이름
   - 갤러리 이름
   - 관리자 비밀번호

2. **자동 처리**
   - ✅ Supabase에 아티스트 레코드 생성
   - ✅ Vercel 프로젝트 생성
   - ✅ 환경 변수 자동 설정
   - ✅ 배포 설정 저장

3. **수동 단계 (Vercel 대시보드에서)**
   - Git 저장소 연결
   - 첫 배포 트리거

### 예시

```
🎨 === 새 아티스트 배포 ===

작가 이름: 황미경
갤러리 이름: 미경 갤러리
관리자 비밀번호: mikyung2024!

📋 배포 정보:
   Artist ID: hwang-mikyung-a1b2
   Project Name: mikyung-gallery
   Gallery: 미경 갤러리

배포를 진행하시겠습니까? (y/n): y

✨ === 배포 완료! ===

🎨 작가: 황미경
🏛️  갤러리: 미경 갤러리
🌐 URL: https://mikyung-gallery.vercel.app
🔑 관리자 비밀번호: mikyung2024!
```

## 📊 배포 관리

### 배포 목록 조회

```bash
npm run deploy:list
```

현재 배포된 모든 아티스트 목록을 확인할 수 있습니다.

### 배포 삭제

```bash
npm run deploy:remove
```

대화형 프롬프트로 삭제할 아티스트를 선택할 수 있습니다.

⚠️ **주의**: 이 작업은 되돌릴 수 없습니다!

## 🔧 데이터베이스 직접 관리

### 아티스트 목록 조회

```bash
npm run db:list
```

### 아티스트 수동 등록

```bash
npm run db:setup <artistId> <artistName> <galleryName> <adminPassword>
```

예시:
```bash
npm run db:setup test-artist "테스트작가" "테스트갤러리" "test1234"
```

### 아티스트 삭제

```bash
npm run db:remove <artistId>
```

## 🏗️ 아키텍처

### 멀티 테넌트 전략

**옵션 A: 단일 Supabase + RLS (현재 구현)**

```
┌─────────────────────────────────────┐
│         Supabase Database           │
│  ┌──────────────────────────────┐   │
│  │ artists                      │   │
│  │ - id (PK)                    │   │
│  │ - name                       │   │
│  │ - gallery_name               │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ artworks                     │   │
│  │ - id (PK)                    │   │
│  │ - artist_id (FK) ← RLS 필터  │   │
│  │ - title, year, etc.          │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
         ↑          ↑          ↑
         │          │          │
    ┌────┴───┐ ┌───┴────┐ ┌───┴────┐
    │ Artist │ │ Artist │ │ Artist │
    │   A    │ │   B    │ │   C    │
    └────────┘ └────────┘ └────────┘
```

각 아티스트는:
- 고유한 Vercel 프로젝트
- 고유한 `NEXT_PUBLIC_ARTIST_ID` 환경 변수
- 같은 Supabase 프로젝트 (RLS로 데이터 격리)

### 데이터 격리

RLS (Row Level Security) 정책이 자동으로 각 아티스트의 데이터를 필터링합니다:

```sql
CREATE POLICY "Artworks are filtered by artist_id" ON artworks
    FOR ALL USING (
        artist_id = current_setting('app.current_artist_id', true)
    );
```

## 🐛 문제 해결

### 배포 실패

**증상**: `Failed to create Vercel project`

**해결**:
1. `VERCEL_TOKEN`이 `.env.local`에 올바르게 설정되어 있는지 확인
2. Vercel 토큰이 만료되지 않았는지 확인
3. Vercel 계정에 프로젝트 생성 권한이 있는지 확인

### 데이터베이스 초기화 실패

**증상**: `Failed to setup artist`

**해결**:
1. `npm run db:init` 실행 후 SQL을 Supabase Dashboard에서 실행했는지 확인
2. `SUPABASE_SERVICE_ROLE_KEY`가 올바른지 확인
3. Supabase 프로젝트가 활성 상태인지 확인

### 작품이 보이지 않음

**증상**: 배포 후 작품이 표시되지 않음

**해결**:
1. Vercel 환경 변수에 `NEXT_PUBLIC_ARTIST_ID`가 올바르게 설정되어 있는지 확인
2. Supabase RLS 정책이 활성화되어 있는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

## 💡 베스트 프랙티스

### 1. 아티스트 ID 명명 규칙

- 영문 소문자 + 하이픈 사용
- 작가 이름 기반으로 생성 (자동)
- 예: `hwang-mikyung-a1b2`

### 2. 비밀번호 관리

- 각 아티스트마다 고유한 비밀번호 사용
- 최소 8자 이상 권장
- 배포 후 아티스트에게 안전하게 전달

### 3. 백업

정기적으로 아티스트 설정 백업:
```bash
cp config/artist-config.json config/artist-config.backup.json
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. `.env.local` 파일의 모든 환경 변수
2. Supabase Dashboard의 RLS 정책
3. Vercel Dashboard의 환경 변수
4. 브라우저 개발자 도구의 콘솔 로그
