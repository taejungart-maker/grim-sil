/**
 * 인앱 브라우저 감지 유틸리티
 */

export function isKakaoTalkInAppBrowser(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent.toLowerCase();
    return userAgent.includes('kakaotalk');
}

export function isNaverInAppBrowser(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent.toLowerCase();
    return userAgent.includes('naver') && userAgent.includes('inapp');
}

export function isFacebookInAppBrowser(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent.toLowerCase();
    return userAgent.includes('fban') || userAgent.includes('fbav');
}

export function isAnyInAppBrowser(): boolean {
    return isKakaoTalkInAppBrowser() || isNaverInAppBrowser() || isFacebookInAppBrowser();
}

export function isIOS(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
}

export function isAndroid(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent.toLowerCase();
    return /android/.test(userAgent);
}

/**
 * 외부 브라우저로 현재 URL 열기
 */
export function openInExternalBrowser(url: string = window.location.href): void {
    if (isIOS()) {
        // iOS: location.href를 변경하면 Safari로 자동 전환됨
        window.location.href = url;
    } else if (isAndroid()) {
        // Android: Intent URL 사용하여 기본 브라우저로 열기
        const intentUrl = `intent://${url.replace(/https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
        window.location.href = intentUrl;

        // Intent가 작동하지 않을 경우를 대비한 fallback
        setTimeout(() => {
            window.location.href = url;
        }, 500);
    } else {
        // 기타 플랫폼: 그냥 현재 URL 새로고침
        window.location.href = url;
    }
}
