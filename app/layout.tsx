import type { Metadata } from "next";
import "./globals.css";
import { loadSettings } from "./utils/settingsDb";
import { unstable_noStore as noStore } from "next/cache";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  noStore(); // 🔥 절대 캐시하지 않음 (상용 제품 수준의 실시간성 확보)
  try {
    const settings = await loadSettings();
    const runtimeId = process.env.NEXT_PUBLIC_ARTIST_ID || "default";
    const title = settings.siteTitle || `${settings.artistName} 작가님의 온라인 화첩`;
    const description = settings.siteDescription || `${settings.artistName} 작가의 작품세계를 담은 공간입니다.`;

    // URL: 환경 변수에서 동적으로 가져오기 (각 갤러리별로 다른 URL)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://grim-sil.vercel.app");

    // OG 이미지: 작가 프로필 사진 우선 사용 (카카오톡 공유용)
    // 💡 작가님 요청에 따라 파일명을 'parkyail_og.jpg'로 고정 인식되도록 강화합니다.
    let image = settings.aboutmeImage;

    if (!image || runtimeId === "-vqsk" || runtimeId === "default") {
      // 🚀 박야일 작가님 또는 기본 상태일 경우, 플랫폼 캐시 강제 갱신을 위해 전용 파일명 사용
      image = `${baseUrl}/parkyail_og.jpg`;
    } else if (!image.startsWith('http')) {
      // 상대 경로인 경우 절대 URL로 변환
      image = `${baseUrl}${image}`;
    }

    // 🔥 플랫폼 캐시 완벽 방지: 파일명을 바꿔도 혹시 모를 기억을 지우기 위해 숫자를 붙입니다.
    const finalImageUrl = `${image}${image.includes('?') ? '&' : '?'}v=${Date.now()}`;

    return {
      title,
      description,
      metadataBase: new URL(baseUrl),
      openGraph: {
        title,
        description,
        url: baseUrl,
        siteName: `${settings.artistName} 작가님의 온라인 화첩`,
        images: [
          {
            url: finalImageUrl,
            width: 800,
            height: 400,
            alt: `${settings.artistName} 작가 프로필`,
          }
        ],
        type: "website",
        locale: "ko_KR",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [finalImageUrl],
      },
      // 카카오톡 최적화를 위한 추가 메타데이터
      other: {
        // 카카오톡 공유 시 이미지 캐시 방지
        'og:image:secure_url': finalImageUrl,
        'og:image:type': 'image/jpeg',
        'og:site_name': `${settings.artistName} 작가님의 온라인 화첩`,
        'debug-artist-id': runtimeId,
        'debug-crawled-at': new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Failed to generate metadata:", error);
    return {
      title: "작가님의 온라인 화첩",
      description: "작가님의 작품세계를 담은 온라인 화첩입니다.",
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
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
        {/* 포트원 SDK - 결제 기능을 위해 필요 */}
        <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="beforeInteractive" />
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
