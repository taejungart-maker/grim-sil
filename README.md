# 🎨 Grim-Sil Gallery - 자동 배포 시스템

여러 아티스트를 위한 온라인 갤러리 앱을 자동으로 배포하는 시스템입니다.

## 🚀 빠른 시작

### 1. 환경 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VERCEL_TOKEN=your_vercel_token
NEXT_PUBLIC_ARTIST_ID=default
```

### 2. 데이터베이스 초기화

```bash
npm run db:init
```

출력된 SQL을 Supabase Dashboard에서 실행하세요.

### 3. 새 아티스트 배포

```bash
npm run deploy:artist
```

## 📚 문서

- [배포 가이드](docs/DEPLOYMENT_GUIDE.md) - 완전한 배포 가이드

## 🛠️ 사용 가능한 명령어

### 배포 관리
- `npm run deploy:artist` - 새 아티스트 배포
- `npm run deploy:list` - 배포 목록 조회
- `npm run deploy:remove` - 배포 삭제

### 데이터베이스 관리
- `npm run db:init` - 데이터베이스 초기화
- `npm run db:list` - 아티스트 목록
- `npm run db:setup` - 아티스트 수동 등록
- `npm run db:remove` - 아티스트 삭제

### 개발
- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행

## 🏗️ 아키텍처

**멀티 테넌트 전략**: 단일 Supabase + RLS (Row Level Security)

- 모든 아티스트가 같은 Supabase 프로젝트 공유
- RLS 정책으로 데이터 자동 격리
- 각 아티스트는 고유한 Vercel 프로젝트와 URL

## 📦 프로젝트 구조

```
grim-sil/
├── scripts/
│   ├── deploy-artist.ts      # 메인 배포 CLI
│   ├── vercel-api.ts          # Vercel API 통합
│   └── setup-artist-db.ts     # Supabase 설정
├── config/
│   ├── artist-config.json     # 배포된 아티스트 목록
│   └── deployment-template.env # 환경 변수 템플릿
├── docs/
│   └── DEPLOYMENT_GUIDE.md    # 배포 가이드
└── app/
    └── utils/
        ├── supabase.ts        # Supabase 클라이언트 (멀티 테넌트)
        └── db.ts              # 데이터베이스 유틸리티
```

## 🔒 보안

- `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요
- `VERCEL_TOKEN`은 안전하게 보관하세요
- 각 아티스트마다 고유한 비밀번호 사용

## 📞 지원

문제가 발생하면 [배포 가이드](docs/DEPLOYMENT_GUIDE.md)의 문제 해결 섹션을 참고하세요.

---

## 🔗 GitHub 자동 배포 (2025-12-25 연동 완료)

### 연결된 저장소
- **GitHub**: `taejungart-maker/grim-sil`
- **Branch**: `main`

### 배포된 갤러리
1. **하현주 갤러리** - https://hahyunju-gallery.vercel.app
2. **문혜경 갤러리** - https://moonhyekyung-gallery.vercel.app
3. **황미경 갤러리** - https://hwangmikyung-gallery.vercel.app

### 자동 배포 사용법

코드를 수정하고 GitHub에 push하면 자동으로 모든 갤러리가 업데이트됩니다:

```bash
git add .
git commit -m "업데이트 내용"
git push
```

Vercel이 자동으로 3개 갤러리를 모두 배포합니다! 🚀
