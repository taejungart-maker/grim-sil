// ============================================
// 배포 모드 감지 유틸리티
// ============================================

export type DeploymentMode = 'always_free' | 'showroom' | 'commercial';

/**
 * 현재 배포 모드를 반환합니다.
 * 환경 변수 NEXT_PUBLIC_DEPLOYMENT_MODE로 제어됩니다.
 * 
 * - always_free: 무료 모드 (하현주, 문혜경, 황미경 작가)
 * - showroom: 쇼룸 모드 (grim-sil 데모, 테스트 결제 가능)
 * - commercial: 상용 모드 (유료 링크, 실제 결제 필요)
 */
export function getDeploymentMode(): DeploymentMode {
    const mode = process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;

    if (mode === 'always_free' || mode === 'showroom' || mode === 'commercial') {
        return mode;
    }

    // 클라이언트 사이드에서 호스트네임을 통한 자동 감지 (환경 변수 누락 대비)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (
            hostname.includes('hahyunju') ||
            hostname.includes('moonhyekyung') ||
            hostname.includes('hwangmikyung') ||
            hostname.includes('free')
        ) {
            return 'always_free';
        }
    }

    // 기본값: 안전하게 무료 모드
    return 'always_free';
}

/**
 * 결제가 필요한 모드인지 확인합니다.
 * @returns showroom 또는 commercial 모드일 경우 true
 */
export function isPaymentRequired(): boolean {
    const mode = getDeploymentMode();
    return mode === 'showroom' || mode === 'commercial';
}

/**
 * 테스트 결제 모드인지 확인합니다.
 * @returns showroom 모드일 경우 true
 */
export function isTestPaymentMode(): boolean {
    return getDeploymentMode() === 'showroom';
}

/**
 * 무료 모드인지 확인합니다.
 * @returns always_free 모드일 경우 true
 */
export function isAlwaysFreeMode(): boolean {
    return getDeploymentMode() === 'always_free';
}
