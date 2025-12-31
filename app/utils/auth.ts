// 세션 기반 인증 유틸리티

const AUTH_KEY_BASE = 'admin_auth_session';
const OWNER_ID_KEY_BASE = 'admin_owner_id';

/**
 * Artist ID 기반 고유 localStorage 키 생성
 * 각 갤러리의 세션을 완전히 독립적으로 관리
 */
function getStorageKey(baseKey: string): string {
    if (typeof window === 'undefined') return baseKey;

    // 동적으로 Artist ID 가져오기 (순환 참조 방지)
    const { getClientArtistId } = require('./getArtistId');
    const artistId = getClientArtistId();

    return `${baseKey}__${artistId}`;
}

/**
 * 관리자 인증 세션 저장
 * @param password 검증된 비밀번호
 * @param artistId 작가 고유 ID
 */
export function setAuthSession(password: string, artistId?: string): void {
    if (typeof window !== 'undefined') {
        const authKey = getStorageKey(AUTH_KEY_BASE);
        const ownerKey = getStorageKey(OWNER_ID_KEY_BASE);

        localStorage.setItem(authKey, password);
        if (artistId) {
            localStorage.setItem(ownerKey, artistId);
        }
    }
}

/**
 * 저장된 인증 세션 가져오기
 */
export function getAuthSession(): string | null {
    if (typeof window !== 'undefined') {
        const authKey = getStorageKey(AUTH_KEY_BASE);
        return localStorage.getItem(authKey);
    }
    return null;
}

/**
 * 저장된 관리자의 작가 ID 가져오기
 */
export function getOwnerId(): string | null {
    if (typeof window !== 'undefined') {
        const ownerKey = getStorageKey(OWNER_ID_KEY_BASE);
        return localStorage.getItem(ownerKey);
    }
    return null;
}

/**
 * 인증 세션 삭제 (로그아웃)
 */
export function clearAuthSession(): void {
    if (typeof window !== 'undefined') {
        const authKey = getStorageKey(AUTH_KEY_BASE);
        const ownerKey = getStorageKey(OWNER_ID_KEY_BASE);

        localStorage.removeItem(authKey);
        localStorage.removeItem(ownerKey);
    }
}

/**
 * 현재 인증 상태 확인
 * @returns 인증 여부
 */
export function isAuthenticated(): boolean {
    return getAuthSession() !== null;
}

/**
 * 인증 세션 검증
 * 저장된 세션이 있고 유효한지 확인
 */
export async function validateAuthSession(): Promise<boolean> {
    const session = getAuthSession();
    if (!session) {
        return false;
    }

    // 세션이 있으면 유효한 것으로 간주
    // 추가 검증이 필요하면 여기서 verifyPassword 호출 가능
    return true;
}
