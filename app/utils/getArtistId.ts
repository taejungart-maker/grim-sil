// 도메인별 ARTIST_ID 자동 감지 (간소화 버전)
// Vercel 프로젝트별 환경변수를 최우선으로 사용

/**
 * 도메인 → ARTIST_ID 매핑 (Fallback용)
 */
const DOMAIN_TO_ARTIST_ID: Record<string, string> = {
    'artflow-gallery.vercel.app': 'vip-gallery-01',
    'hahyunju-gallery.vercel.app': 'vip-gallery-01',
    'grim-sil.vercel.app': '-vqsk',
    'localhost:3000': process.env.NEXT_PUBLIC_ARTIST_ID || '-vqsk',
    'localhost': process.env.NEXT_PUBLIC_ARTIST_ID || '-vqsk',
};

/**
 * ARTIST_ID 감지 (환경변수 최우선)
 */
export function getClientArtistId(): string {
    // ✅ 1순위: 환경변수가 있으면 무조건 사용
    const envArtistId = process.env.NEXT_PUBLIC_ARTIST_ID;
    if (envArtistId && envArtistId !== 'default') {
        console.log(`[ARTIST_ID] Using env variable: ${envArtistId}`);
        return envArtistId;
    }

    // ✅ 2순위: 클라이언트에서 도메인 체크
    if (typeof window !== 'undefined') {
        const host = window.location.host;
        const artistId = DOMAIN_TO_ARTIST_ID[host];

        if (artistId) {
            console.log(`[ARTIST_ID] CLIENT detected from domain ${host}: ${artistId}`);
            return artistId;
        }
    }

    // ✅ 3순위: 서버에서 Vercel URL 체크
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
        const cleanHost = vercelUrl.replace(/^https?:\/\//, '');

        // grim-sil로 시작하면 박야일
        if (cleanHost.startsWith('grim-sil')) {
            console.log(`[ARTIST_ID] SERVER detected grim-sil project: -vqsk`);
            return '-vqsk';
        }

        // artflow 또는 hahyunju로 시작하면 VIP
        if (cleanHost.startsWith('artflow') || cleanHost.startsWith('hahyunju')) {
            console.log(`[ARTIST_ID] SERVER detected artflow/hahyunju project: vip-gallery-01`);
            return 'vip-gallery-01';
        }
    }

    // Fallback
    console.warn('[ARTIST_ID] Using fallback: -vqsk');
    return '-vqsk';
}

/**
 * 런타임 도메인 확인 (디버깅용)
 */
export function debugArtistId(): void {
    if (typeof window !== 'undefined') {
        console.log('=== ARTIST ID DEBUG ===');
        console.log('Current Host:', window.location.host);
        console.log('Env Variable:', process.env.NEXT_PUBLIC_ARTIST_ID);
        console.log('Detected Artist ID:', getClientArtistId());
        console.log('======================');
    }
}
