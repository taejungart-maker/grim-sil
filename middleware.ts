import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // [V8_FIX] headers('host') 대신 nextUrl.hostname을 사용하여 포트 간섭 및 프록시 오염 차단
    const host = request.nextUrl.hostname;

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
        'localhost': '-vqsk',
    };

    let artistId = artistMap[host.toLowerCase()] || "";

    // 키워드 매핑 (Fallback - 브랜치/프리뷰 도메인 대응)
    if (!artistId) {
        const lowerHost = host.toLowerCase();
        if (lowerHost.includes('hahyunju') || lowerHost.includes('artflow')) artistId = '-hyunju';
        else if (lowerHost.includes('moonhyekyung')) artistId = '-3ibp';
        else if (lowerHost.includes('hwangmikyung')) artistId = '-5e4p';
        else if (lowerHost.includes('grim-sil')) artistId = '-vqsk';
    }

    // 최종 기본값 (박야일)
    if (!artistId) artistId = '-vqsk';

    // 새로운 헤더와 함께 요청 전달
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-artist-id', artistId);

    // console.log(`[Middleware V8] Host: ${host} -> x-artist-id: ${artistId}`);

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
