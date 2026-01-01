/**
 * 도메인 기반 ARTIST_ID 자동 매핑 (환경변수 완전 제거 버전)
 * "환경 변수를 믿지 말고, 현재 접속한 URL 주소를 믿어라"
 */

const DOMAIN_ARTIST_MAPPING: Record<string, string> = {
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

export function getClientArtistId(): string {
    // 1. 서버 사이드: Middleware가 주입한 x-artist-id 헤더만 절대 신뢰
    if (typeof window === 'undefined') {
        try {
            const { headers } = require('next/headers');
            const headerList = headers();
            const artistId = headerList.get('x-artist-id');

            if (artistId) return artistId;

            // [FAILSAFE] 만약 미들웨어가 작동하지 않는 환경(특수 API 등)이라면 
            // 직접 호스트 분석을 수행하되 환경변수는 절대 보지 않음
            const host = headerList.get('host') || "";
            const cleanHost = host.split(':')[0].toLowerCase();

            if (cleanHost.includes('hahyunju')) return '-hyunju';
            if (cleanHost.includes('moonhyekyung')) return '-3ibp';
            if (cleanHost.includes('hwangmikyung')) return '-5e4p';
            if (cleanHost.includes('grim-sil')) return '-vqsk';
        } catch (e) { }
    } else {
        // 2. 클라이언트 사이드: window.location.hostname 절대 신뢰
        const host = window.location.hostname.toLowerCase();

        // VIP 경로 판별 (클라이언트 사이드 호환성 유지)
        const pathname = window.location.pathname;
        const vipMatch = pathname.match(/^\/gallery-vip-(\d+)/);
        if (vipMatch) return `vip-gallery-${vipMatch[1].padStart(2, '0')}`;

        if (DOMAIN_ARTIST_MAPPING[host]) return DOMAIN_ARTIST_MAPPING[host];

        if (host.includes('hahyunju')) return '-hyunju';
        if (host.includes('moonhyekyung')) return '-3ibp';
        if (host.includes('hwangmikyung')) return '-5e4p';
        if (host.includes('grim-sil')) return '-vqsk';
    }

    // 최종 Fallback: 어떤 방법으로도 식별 불가 시 안전하게 기본값 반환 (절대 하현주 ID 아님)
    return '-vqsk';
}

export function debugArtistId() {
    const artistId = getClientArtistId();
    console.log(`[ArtistId Audit] ID: ${artistId}`);
    return artistId;
}
