import { NextRequest, NextResponse } from 'next/server';
import { loadSettingsById } from '../utils/settingsDb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        // 1. 도메인 기반 아티스트 ID 감지
        const { getClientArtistId } = require("../utils/getArtistId");
        const artistId = getClientArtistId();
        const settings = await loadSettingsById(artistId);

        // 2. 프로필 이미지 URL 확인
        const imageUrl = settings?.aboutmeImage || "https://grim-sil.vercel.app/demo1.png";

        // 3. 실제 이미지 데이터 가져오기 (Proxy)
        const response = await fetch(imageUrl, {
            next: { revalidate: 0 },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch original image: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const buffer = await response.arrayBuffer();

        // 4. 요청된 파일명(parkyail_og.jpg)으로 이미지 반환
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error("OG Proxy Error:", error);
        // 폴백 이미지 (시스템 기본 이미지)
        return NextResponse.redirect(new URL('/og-default.png', request.url));
    }
}
