/**
 * 도메인 기반 ARTIST_ID 자동 매핑 (환경변수 의존 완전 탈피)
 * 각 도메인은 고유한 방(Room) ID를 가집니다.
 */

// 도메인 → ARTIST_ID 완전 매핑 테이블
const DOMAIN_ARTIST_MAPPING: Record<string, string> = {
    // ========== 박야일 홍보 사이트 ==========
    'grim-sil.vercel.app': '-vqsk',

    // ========== 무료 개인 브랜드 갤러리 (각각 고유 ID) ==========
    'hahyunju-gallery.vercel.app': '-hyunju',         // 하현주 (고유 ID) ✅ 수정됨
    'moonhyekyung-gallery.vercel.app': '-3ibp',       // 문혜경 (고유 ID)
    'hwangmikyung-gallery.vercel.app': '-5e4p',       // 황미경 (고유 ID)

    // ========== 로컬 개발 환경 ==========
    'localhost:3000': '-vqsk',
    'localhost': '-vqsk',
};

/**
 * 현재 접속 도메인에서 ARTIST_ID 자동 감지
 * 환경변수에 의존하지 않고 100% 도메인 기반으로 작동
 */
export function getClientArtistId(): string {
    // ✅ 클라이언트 사이드: 브라우저 URL에서 직접 도메인 추출
    if (typeof window !== 'undefined') {
        const host = window.location.host;
        const pathname = window.location.pathname;

        // VIP 갤러리 경로 체크 (/gallery-vip-XX)
        const vipMatch = pathname.match(/^\/gallery-vip-(\d+)/);
        if (vipMatch) {
            const vipId = `vip-gallery-${vipMatch[1].padStart(2, '0')}`;
            console.log(`[ARTIST_ID] VIP Gallery detected: ${vipId}`);
            return vipId;
        }

        // 도메인 매핑 테이블에서 찾기
        const mappedId = DOMAIN_ARTIST_MAPPING[host];
        if (mappedId) {
            console.log(`[ARTIST_ID] Domain mapped: ${host} → ${mappedId}`);
            return mappedId;
        }

        // Vercel Preview URL 처리 (grim-sil-xxx.vercel.app 형태)
        if (host.includes('grim-sil') && host.endsWith('.vercel.app')) {
            console.log(`[ARTIST_ID] Vercel preview detected: -vqsk (박야일)`);
            return '-vqsk';
        }
        if (host.includes('hahyunju') && host.endsWith('.vercel.app')) {
            console.log(`[ARTIST_ID] Vercel preview detected: -hyunju (하현주)`);
            return '-hyunju';
        }
        if (host.includes('moonhyekyung') && host.endsWith('.vercel.app')) {
            console.log(`[ARTIST_ID] Vercel preview detected: -3ibp (문혜경)`);
            return '-3ibp';
        }
        if (host.includes('hwangmikyung') && host.endsWith('.vercel.app')) {
            console.log(`[ARTIST_ID] Vercel preview detected: -5e4p (황미경)`);
            return '-5e4p';
        }

        console.warn(`[ARTIST_ID] Unknown domain: ${host}, using fallback`);
    }

    // ✅ 서버 사이드: VERCEL_URL 환경변수에서 도메인 추출
    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) {
        const cleanHost = vercelUrl.replace(/^https?:\/\//, '');

        // Preview URL 패턴 매칭
        if (cleanHost.includes('grim-sil')) return '-vqsk';
        if (cleanHost.includes('hahyunju')) return '-hyunju';
        if (cleanHost.includes('moonhyekyung')) return '-3ibp';
        if (cleanHost.includes('hwangmikyung')) return '-5e4p';
    }

    // 최종 Fallback (박야일 홍보용)
    return '-vqsk';
}

/**
 * 현재 Artist ID 및 도메인 디버그 정보 출력
 */
export function debugArtistId(): { host: string; artistId: string; source: string } {
    const artistId = getClientArtistId();
    const host = typeof window !== 'undefined' ? window.location.host : 'server';
    const source = typeof window !== 'undefined' ? 'client' : 'server';

    console.log('=== ARTIST ID DEBUG ===');
    console.log(`Host: ${host}`);
    console.log(`Artist ID: ${artistId}`);
    console.log(`Source: ${source}`);
    console.log('=======================');

    return { host, artistId, source };
}
