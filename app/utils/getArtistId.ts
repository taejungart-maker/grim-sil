/**
 * 도메인 기반 ARTIST_ID 자동 매핑 (환경변수 완전 제거 버전)
 * "환경 변수를 믿지 말고, 현재 접속한 URL 주소를 믿어라"
 */

const DOMAIN_ARTIST_MAPPING: Record<string, string> = {
    'grim-sil.vercel.app': '-vqsk',
    'grim-sil.com': '-vqsk',
    'www.grim-sil.com': '-vqsk',
    'hahyunju-gallery.vercel.app': '-hyunju',
    'hahyunju-gallery-ten.vercel.app': '-hyunju',
    'hahyunju.com': '-hyunju',
    'www.hahyunju.com': '-hyunju',
    'moonhyekyung-gallery.vercel.app': '-3ibp',
    'hwangmikyung-gallery.vercel.app': '-5e4p',
    'localhost': '-vqsk',
};

/**
 * 서버 사이드 전용: 비동기 헤더 처리를 포함한 아티스트 ID 식별
 * Next.js 15/16의 비동기 headers() 대응
 */
export async function getServerArtistId(): Promise<string> {
    if (typeof window !== 'undefined') {
        throw new Error("getServerArtistId must be called on the server side.");
    }

    const { headers } = require('next/headers');
    const headerList = await headers(); // [V11_FIX] Next.js 16 비동기 헤더 강제 적용
    const artistId = headerList.get('x-artist-id');

    if (artistId) return artistId;

    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "";
    const lowerHost = host.toLowerCase();

    if (lowerHost.includes('hahyunju') || lowerHost.includes('artflow')) return '-hyunju';
    if (lowerHost.includes('moonhyekyung')) return '-3ibp';
    if (lowerHost.includes('hwangmikyung')) return '-5e4p';
    if (lowerHost.includes('grim-sil')) return '-vqsk';
    if (lowerHost.includes('localhost')) return '-vqsk';

    // [V11_FAILSAFE] 식별 불가 시 기본값으로 복구 (빌드 타임 및 미탐지 호스트 대응)
    console.warn(`[FAILSAFE] Identification failed for host: "${host}". Falling back to default '-vqsk'.`);
    return '-vqsk';
}

/**
 * 클라이언트 사이드 전용: window.location 기반 ID 식별 (동기)
 */
export function getClientArtistId(): string {
    if (typeof window === 'undefined') {
        // 서버에서 호출 시 경고 (동기 호출은 더 이상 서버에서 유효하지 않음)
        console.warn("getClientArtistId called on server. Use getServerArtistId instead for accurate identification.");
        return '-vqsk'; // 정적 빌드 시점 등을 위한 임시 허용
    }

    const host = window.location.hostname.toLowerCase();

    // VIP 경로 판별
    const pathname = window.location.pathname;
    const vipMatch = pathname.match(/^\/gallery-vip-(\d+)/);
    if (vipMatch) return `vip-gallery-${vipMatch[1].padStart(2, '0')}`;

    if (DOMAIN_ARTIST_MAPPING[host]) return DOMAIN_ARTIST_MAPPING[host];

    if (host.includes('hahyunju')) return '-hyunju';
    if (host.includes('moonhyekyung')) return '-3ibp';
    if (host.includes('hwangmikyung')) return '-5e4p';
    if (host.includes('grim-sil')) return '-vqsk';

    return '-vqsk';
}

export function debugArtistId() {
    const artistId = getClientArtistId();
    if (typeof window !== 'undefined') {
        console.log(`[ArtistId Audit] Host: ${window.location.hostname}, ID: ${artistId}`);
    }
    return artistId;
}
