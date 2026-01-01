import { Suspense } from "react";
import VIPPageClient from "../components/VIPPageClient";
import { loadSettingsById } from "../utils/settingsDb";

// [DATA_SYNC_FIX] 홍보용 데이터를 03번 링크에서 보여주기 위해 ID를 고정함
const VIP_ID = "-vqsk";

export async function generateMetadata() {
    try {
        const settings = await loadSettingsById(VIP_ID);
        const title = settings.siteTitle || `${settings.artistName} 작가님의 온라인 화첩 [VIP]`;
        const description = settings.siteDescription || `${settings.artistName} 작가의 작품세계를 담은 공간입니다.`;

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://grim-sil.vercel.app");

        let image = settings.aboutmeImage;

        if (!image) {
            image = `${baseUrl}/og-default.png`;
        } else if (!image.startsWith('http')) {
            image = `${baseUrl}${image}`;
        }

        const finalImageUrl = `${image}${image.includes('?') ? '&' : '?'}v=${Date.now()}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: `${baseUrl}/gallery-vip-03`,
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
        };
    } catch (error) {
        return {
            title: "VIP 온라인 화첩",
            description: "작가님의 작품세계를 담은 VIP 공간입니다.",
        };
    }
}

export default function VIPPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>불러오는 중...</p></div>}>
            <VIPPageClient VIP_ID={VIP_ID} isAlwaysFree={false} />
        </Suspense>
    );
}
