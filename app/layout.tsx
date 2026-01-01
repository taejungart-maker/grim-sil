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

    const { headers } = require('next/headers');
    const h = headers();
    const domain = h.get('x-forwarded-host') || h.get('host') || "grim-sil.vercel.app";
    const baseUrl = `https://${domain}`;

    // 이미지 경로 캐시 방지 (도메인 + 시간을 조합하여 고유성 확보)
    let finalImageUrl = settings.aboutmeImage || `${baseUrl}/og-default.png`;
    const cacheBuster = `v=${artistId}-${Date.now().toString().slice(-6)}`;
    finalImageUrl += finalImageUrl.includes('?') ? `&${cacheBuster}` : `?${cacheBuster}`;

    return {
      title,
      description,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: baseUrl,
      },
      openGraph: {
        title,
        description,
        url: baseUrl,
        siteName: title,
        images: [{ url: finalImageUrl, width: 800, height: 400 }],
        type: "website",
      },
      // 테넌트 식별 확인용 (헤드에 남음)
      other: {
        'x-artist-id-tenant': artistId,
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
