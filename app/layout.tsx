import type { Metadata } from "next";
import "./globals.css";
import { loadSettings, loadSettingsById } from "./utils/settingsDb";
import { getClientArtistId } from "./utils/getArtistId";
import { unstable_noStore as noStore } from "next/cache";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  noStore();
  const artistId = getClientArtistId();

  try {
    // [V9_FIX] 강화된 getClientArtistId()를 통해 어떤 환경에서도 정확한 ID 추출
    const settings = await loadSettingsById(artistId);

    const title = settings.siteTitle || `${settings.artistName} 작가님의 온라인 화첩`;
    const description = settings.siteDescription || `${settings.artistName} 작가의 작품세계를 담은 공간입니다.`;

    // [V10_FIX] 사용자 명령: OG 태그에 테넌트 식별자 강제 주입 & 환경변수 100% 배제
    const { headers } = require('next/headers');
    const h = headers();
    const domain = h.get('x-forwarded-host') || h.get('host') || "grim-sil.vercel.app";
    const baseUrl = `https://${domain}`;

    // 카카오톡 인식용 고유 URL (도메인 뒤에 파라미터를 붙여 다른 링크로 강제 인식)
    const ogUrl = `${baseUrl}?artist=${artistId}`;

    // 이미지 경로 캐시 강제 갱신 (사용자 명령: ?v=${artistId})
    let finalImageUrl = settings.aboutmeImage || `${baseUrl}/og-default.png`;
    finalImageUrl += finalImageUrl.includes('?') ? `&v=${artistId}` : `?v=${artistId}`;

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
        url: ogUrl, // [CRITICAL] 카톡이 서로 다른 링크로 인식하게 함
        siteName: title,
        images: [{
          url: finalImageUrl, // [CRITICAL] 이미지 캐시 강제 갱신
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
    console.error("Metadata generation failed:", error);
    return { title: "온라인 화첩" };
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
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;900&display=swap"
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
