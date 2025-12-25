import type { Metadata } from "next";
import "./globals.css";
import { loadSettings } from "./utils/settingsDb";

export async function generateMetadata() {
  try {
    const settings = await loadSettings();
    const title = settings.siteTitle || `${settings.artistName}의 온라인 화첩`;
    const description = settings.siteDescription || `${settings.artistName} 작가의 작품세계를 담은 공간입니다.`;
    const image = settings.aboutmeImage || "/og-image.png";
    const url = "https://grim-sil.vercel.app/";

    return {
      title,
      description,
      metadataBase: new URL(url),
      openGraph: {
        title,
        description,
        url,
        siteName: title,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
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
    };
  } catch {
    return {
      title: "작가님의 온라인 화첩",
      description: "작가님의 작품세계를 담은 온라인 화첩입니다.",
    };
  }
}

import VisitorTracker from "./components/VisitorTracker";

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
      </head>
      <body suppressHydrationWarning>
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
