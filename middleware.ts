import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || "";

    // 도메인별 ID 매핑 (이것이 완벽한 격리의 핵심)
    const artistMap: Record<string, string> = {
        'grim-sil.vercel.app': '-vqsk',
        'grim-sil.com': '-vqsk',
        'www.grim-sil.com': '-vqsk',
        'hahyunju-gallery.vercel.app': '-hyunju',
        'hahyunju.com': '-hyunju',
        'www.hahyunju.com': '-hyunju',
        'moonhyekyung-gallery.vercel.app': '-3ibp',
        'hwangmikyung-gallery.vercel.app': '-5e4p',
        'localhost:3000': '-vqsk',
        'localhost': '-vqsk',
    };

    // 호스트명 그대로 매칭 시도
    let artistId = artistMap[host] || "";

    // 포트 제거 후 매칭 시도 (Fallback)
    if (!artistId) {
        const cleanHost = host.split(':')[0].toLowerCase();
        artistId = artistMap[cleanHost] || "";
    }

    // 키워드 매핑 (Fallback 2 - 브랜치/프리뷰 도메인 대응)
    if (!artistId) {
        const lowerHost = host.toLowerCase();
        if (lowerHost.includes('hahyunju')) artistId = '-hyunju';
        else if (lowerHost.includes('moonhyekyung')) artistId = '-3ibp';
        else if (lowerHost.includes('hwangmikyung')) artistId = '-5e4p';
        else if (lowerHost.includes('grim-sil')) artistId = '-vqsk';
    }

    // 최종 기본값 (절대 하현주 ID 보지 않음)
    if (!artistId) artistId = '-vqsk';

    // 헤더에 ID 주입
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-artist-id', artistId);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
