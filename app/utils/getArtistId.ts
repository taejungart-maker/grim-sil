// 도메인별 ARTIST_ID 자동 감지
// 하현주-박야일 갤러리 데이터 격리 문제 해결

/**
 * 도메인 → ARTIST_ID 매핑
 * 
 * - artflow-gallery.vercel.app: ARTFLOW 갤러리 (VIP 시스템)
 * - hahyunju-gallery.vercel.app: 레거시 지원
 * - grim-sil.vercel.app: -vqsk (박야일 작가)
 */
const DOMAIN_TO_ARTIST_ID: Record<string, string> = {
    // ARTFLOW 갤러리 (신규)
    'artflow-gallery.vercel.app': 'vip-gallery-01',

    // 레거시 지원 (기존 링크 호환성)
    'hahyunju-gallery.vercel.app': 'vip-gallery-01',

    // 박야일 작가 (메인)
    'grim-sil.vercel.app': '-vqsk',

    // 로컬 개발 (환경변수 우선)
    'localhost:3000': process.env.NEXT_PUBLIC_ARTIST_ID || '-vqsk',
    'localhost': process.env.NEXT_PUBLIC_ARTIST_ID || '-vqsk',
};

/**
 * 클라이언트/서버 모두 사용 가능: 도메인 기반 ARTIST_ID
 */
export function getClientArtistId(): string {
    if (typeof window === 'undefined') {
        // 서버에서 호출되면 환경변수 반환
        return process.env.NEXT_PUBLIC_ARTIST_ID || 'default';
    }

    const host = window.location.host;

    // 도메인 매핑에서 찾기
    const artistId = DOMAIN_TO_ARTIST_ID[host];

    if (artistId) {
        return artistId;
    }

    // 매핑에 없으면 환경변수 사용
    return process.env.NEXT_PUBLIC_ARTIST_ID || 'default';
}
