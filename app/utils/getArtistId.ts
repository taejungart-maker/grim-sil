// 도메인별 ARTIST_ID 자동 감지 (서버/클라이언트 통합)
// 최우선 순위: 도메인 > 환경변수

/**
 * 도메인 → ARTIST_ID 매핑
 */
const DOMAIN_TO_ARTIST_ID: Record<string, string> = {
    // ARTFLOW 갤러리 (VIP 시스템)
    'artflow-gallery.vercel.app': 'vip-gallery-01',

    // 레거시 지원 (하현주 작가)
    'hahyunju-gallery.vercel.app': 'vip-gallery-01',

    // 박야일 작가 (홍보용)
    'grim-sil.vercel.app': '-vqsk',

    // 로컬 개발
    'localhost:3000': process.env.NEXT_PUBLIC_ARTIST_ID || '-vqsk',
    'localhost': process.env.NEXT_PUBLIC_ARTIST_ID || '-vqsk',
};

/**
 * 서버/클라이언트 통합: 도메인 우선 감지
 */
export function getClientArtistId(): string {
    // 클라이언트 사이드
    if (typeof window !== 'undefined') {
        const host = window.location.host;
        const artistId = DOMAIN_TO_ARTIST_ID[host];

        if (artistId) {
            console.log(`[CLIENT] Domain: ${host} → Artist ID: ${artistId}`);
            return artistId;
        }

        console.warn(`[CLIENT] Domain not mapped: ${host}, using env: ${process.env.NEXT_PUBLIC_ARTIST_ID}`);
        return process.env.NEXT_PUBLIC_ARTIST_ID || 'default';
    }

    // 서버 사이드: headers에서 host 추출 시도
    try {
        // Next.js에서 headers()는 async이므로 직접 사용 불가
        // 대신 환경변수 사용 (Vercel 자동 설정)
        const vercelUrl = process.env.VERCEL_URL;

        if (vercelUrl) {
            // Vercel URL에서 도메인 추출
            const cleanHost = vercelUrl.replace(/^https?:\/\//, '');
            const artistId = DOMAIN_TO_ARTIST_ID[cleanHost];

            if (artistId) {
                console.log(`[SERVER] Vercel URL: ${cleanHost} → Artist ID: ${artistId}`);
                return artistId;
            }
        }

        // 환경변수 fallback
        const envArtistId = process.env.NEXT_PUBLIC_ARTIST_ID || 'default';
        console.warn(`[SERVER] No domain match, using env: ${envArtistId}`);
        return envArtistId;

    } catch (error) {
        console.error('[SERVER] Failed to detect domain:', error);
        return process.env.NEXT_PUBLIC_ARTIST_ID || 'default';
    }
}

/**
 * 런타임 도메인 확인 (디버깅용)
 */
export function debugArtistId(): void {
    if (typeof window !== 'undefined') {
        console.log('=== ARTIST ID DEBUG ===');
        console.log('Current Host:', window.location.host);
        console.log('Detected Artist ID:', getClientArtistId());
        console.log('Domain Mapping:', DOMAIN_TO_ARTIST_ID);
        console.log('======================');
    }
}
