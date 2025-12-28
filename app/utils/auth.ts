// 세션 기반 인증 유틸리티

const AUTH_KEY = 'admin_auth_session';
const OWNER_ID_KEY = 'admin_owner_id';

/**
 * 관리자 인증 세션 저장
 * @param password 검증된 비밀번호
 * @param artistId 작가 고유 ID
 */
export function setAuthSession(password: string, artistId?: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, password);
        if (artistId) {
            localStorage.setItem(OWNER_ID_KEY, artistId);
        }
    }
}

/**
 * 저장된 인증 세션 가져오기
 */
export function getAuthSession(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(AUTH_KEY);
    }
    return null;
}

/**
 * 저장된 관리자의 작가 ID 가져오기
 */
export function getOwnerId(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(OWNER_ID_KEY);
    }
    return null;
}

/**
 * 인증 세션 삭제 (로그아웃)
 */
export function clearAuthSession(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(OWNER_ID_KEY);
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
