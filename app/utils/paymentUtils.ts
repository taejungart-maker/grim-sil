// ============================================
// 결제 상태 관리 유틸리티 (localStorage 기반)
// ============================================

import { isTestPaymentMode } from "./deploymentMode";

/**
 * 결제 상태 확인 (클라이언트 전용)
 */
export function checkPaymentStatus(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    const status = localStorage.getItem('payment_status');
    return status === 'paid';
}

/**
 * 결제 처리 (PORT ONE 연동)
 */
export async function processPayment(): Promise<boolean> {
    if (typeof window === 'undefined' || !(window as any).IMP) {
        console.error('Port One SDK not loaded or window undefined');
        return false;
    }

    const { IMP } = window as any;
    // 가맹점 식별코드 (환경 변수 사용 권장)
    const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'imp00000000';

    try {
        // 🔥 PG 설정 오류 무시 (테스트/개발 환경)
        IMP.init(STORE_ID);
    } catch (initError) {
        // PG 설정이 없어도 테스트 환경에서는 계속 진행
        console.warn('Port One initialization warning (safe to ignore in test mode):', initError);
    }

    try {
        const isTest = isTestPaymentMode();

        return new Promise((resolve) => {
            IMP.request_pay({
                pg: "kakaopay.TC0ONETIME", // 테스트용 카카오페이
                pay_method: "card",
                merchant_uid: `mid_${new Date().getTime()}`,
                name: "그림실 프리미엄 멤버십",
                amount: isTest ? 100 : 20000, // 테스트 모드에선 100원
                buyer_name: "작가님",
                // 결제 성공 시 콜백
            }, function (rsp: any) {
                if (rsp.success) {
                    localStorage.setItem('payment_status', 'paid');
                    resolve(true);
                } else {
                    console.error('Payment failed:', rsp.error_msg);
                    resolve(false);
                }
            });
        });
    } catch (error) {
        console.error('Payment processing exception:', error);
        return false;
    }
}

/**
 * 결제 상태 초기화 (테스트용)
 */
export function resetPaymentStatus(): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.removeItem('payment_status');
}
