import type { Metadata } from "next";
import "./globals.css";
import { loadSettings } from "./utils/settingsDb";

export async function generateMetadata() {
  try {
    const settings = await loadSettings();
    const title = settings.siteTitle || `${settings.artistName} 작가님의 온라인 화첩`;
    const description = settings.siteDescription || `${settings.artistName} 작가의 작품세계를 담은 공간입니다.`;

    // URL: 환경 변수에서 동적으로 가져오기 (각 갤러리별로 다른 URL)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://grim-sil.vercel.app");

    // OG 이미지: 작가 프로필 사진 우선 사용 (카카오톡 공유용)
    // Supabase Storage URL은 절대 경로이므로 그대로 사용
    let image = settings.aboutmeImage;

    if (!image) {
      // Fallback: 기본 OG 이미지 (절대 URL)
      image = `${baseUrl}/og-default.png`;
    } else if (!image.startsWith('http')) {
      // 상대 경로인 경우 절대 URL로 변환
      image = `${baseUrl}${image}`;
    }
    // 이미 http로 시작하면 Supabase Storage URL이므로 그대로 사용

    return {
      title,
      description,
      metadataBase: new URL(baseUrl),
      openGraph: {
        title,
        description,
        url: baseUrl,
        siteName: title,
        images: [
          {
            url: image,
            // 실제 이미지 크기에 맞게 자동 조정 (하드코딩 제거)
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
        images: [image],
      },
      // 카카오톡 최적화를 위한 추가 메타데이터
      other: {
        // 카카오톡 공유 시 이미지 캐시 방지
        'og:image:secure_url': image,
        'og:image:type': 'image/jpeg',
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
