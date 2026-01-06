import type { Metadata } from "next";
import "./globals.css";
import { loadSettings, loadSettingsById } from "./utils/settingsDb";
import { getClientArtistId } from "./utils/getArtistId";
import { unstable_noStore as noStore } from "next/cache";

// [CACHE_BUST] 2026-01-06 23:05:00
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  noStore();

  try {
    // [V11_ASYNC] Next.js 16 비동기 헤더 및 ID 식별 강제 적용
    const { getServerArtistId } = require('./utils/getArtistId');
    const artistId = await getServerArtistId();

    const settings = await loadSettingsById(artistId);

    const title = settings.siteTitle || `${settings.artistName} 작가님의 온라인 Gallery`;
    const description = settings.siteDescription || `${settings.artistName} 작가의 작품세계를 담은 공간입니다.`;

    const { headers } = require('next/headers');
    const h = await headers(); // [V11_FIX] await headers() 적용
    const domain = h.get('x-forwarded-host') || h.get('host') || "hahyunju.com";
    const baseUrl = `https://${domain}`;

    // [V12] 정밀한 캐시 방지: 설정 수정 시마다 새로운 고유 URL 생성
    const version = settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now();
    const ogUrl = `${baseUrl}?artist=${artistId}&v=${version}`;

    let finalImageUrl = settings.aboutmeImage || `${baseUrl}/og-default.png`;
    finalImageUrl += finalImageUrl.includes('?') ? `&v=${version}` : `?v=${version}`;

    return {
      title,
      description,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: baseUrl,
      },
      openGraph: {
        title: title,
        description: description,
        url: ogUrl,
        siteName: title,
        images: [{
          url: finalImageUrl,
          width: 800,
          height: 400
        }],
        type: "website",
      },
      // 테넌트 식별 확인용 (헤드에 남음)
      other: {
        'x-artist-id-tenant': artistId,
        'x-diag-host': domain,
        'x-diag-time': new Date().toISOString(),
      }
    };
  } catch (error) {
    console.error("Metadata generation failed [CRITICAL]:", error);
    // [V11_SECURITY] 식별 실패 시 빈 객체나 최소한의 정보만 반환하여 데이터 혼입 차단
    return {
      title: "작가 온라인 Gallery",
      description: "로딩 중이거나 접근이 거부되었습니다."
    };
  }
}

import VisitorTracker from "./components/VisitorTracker";
import { AuthProvider } from "./contexts/AuthContext";
import { PaymentProvider } from "./contexts/PaymentContext";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Noto Sans KR - 시니어 친화적 가독성 높은 폰트 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;900&family=Noto+Serif+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* 포트원 SDK V1 - 기존 구독 결제 */}
        <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="beforeInteractive" />
        {/* 포트원 SDK V2 - 나도 갤러리 만들기 결제 */}
        <Script src="https://cdn.portone.io/v2/browser-sdk.js" strategy="beforeInteractive" />
      </head>
      <body suppressHydrationWarning>
        <PaymentProvider>
          <AuthProvider>
            <VisitorTracker />
            {children}
          </AuthProvider>
        </PaymentProvider>
      </body>
    </html>
  );
}
