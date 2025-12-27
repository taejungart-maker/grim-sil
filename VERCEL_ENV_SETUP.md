# Vercel Environment Variables Setup Guide

## 🔥 Critical: Port One (포트원) Configuration

VIP 갤러리의 실제 결제를 위해 다음 환경변수를 Vercel에 추가해야 합니다:

### Required Variables

```
NEXT_PUBLIC_PORTONE_STORE_ID=imp00000000
```

**⚠️ 주의**: `imp00000000`은 테스트용 ID입니다. 실제 라이브 결제를 위해서는 포트원에서 발급받은 **실제 가맹점 ID**로 교체하세요.

---

## 📋 Vercel 환경변수 설정 방법

### Option 1: Vercel Dashboard (추천)

1. **Vercel Dashboard** 접속: https://vercel.com/
2. **grim-sil** 프로젝트 클릭
3. **Settings** → **Environment Variables**
4. 다음 변수 추가:
   - **Key**: `NEXT_PUBLIC_PORTONE_STORE_ID`
   - **Value**: `imp00000000` (또는 실제 가맹점 ID)
   - **Environment**: Production, Preview, Development 모두 체크
5. **Save** 클릭
6. **Deployments** → 최신 배포 → **Redeploy** 클릭

### Option 2: Vercel CLI

```bash
vercel env add NEXT_PUBLIC_PORTONE_STORE_ID
# 값 입력: imp00000000
# Environment 선택: Production, Preview, Development

# 재배포
vercel --prod
```

---

## ✅ 설정 확인

환경변수 추가 후 다음 링크에서 테스트:
- https://grim-sil.vercel.app/gallery-vip-01

"등록된 PG 설정 정보가 없습니다" 에러가 사라지고 결제 창이 정상적으로 호출되어야 합니다.

---

## 📌 현재 로컬 환경변수

로컬에서는 `.env.local`에 다음과 같이 추가되었습니다:

```env
NEXT_PUBLIC_PORTONE_STORE_ID=imp00000000
```

이제 로컬(`localhost:3000`)에서도 VIP 갤러리 결제 테스트가 가능합니다.
