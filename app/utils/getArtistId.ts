/**
 * ARTIST_ID 감지 (환경변수 100% 신뢰)
 * 도메인 하드코딩 매핑을 완전히 제거하여 데이터 충돌을 원천 차단합니다.
 */
export function getClientArtistId(): string {
    // ✅ 1순위: Vercel 환경변수 (가장 중요)
    const envArtistId = process.env.NEXT_PUBLIC_ARTIST_ID;

    if (envArtistId && envArtistId !== 'default') {
        // console.log(`[ARTIST_ID] Using env variable: ${envArtistId}`);
        return envArtistId;
    }

    // ✅ 2순위: 로컬 개발 환경용 Fallback
    if (typeof window !== 'undefined') {
        const host = window.location.host;
        if (host.includes('localhost')) {
            return 'grim-sil-main'; // 로컬은 메인 홍보용으로 고정
        }
    }

    // ✅ 3순위: 최종 Fallback (절대 다른 작가 ID를 쓰지 않음)
    return 'grim-sil-main';
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
