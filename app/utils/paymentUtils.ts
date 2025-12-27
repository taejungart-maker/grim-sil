// ============================================
// 결제 상태 관리 유틸리티 (localStorage 기반)
// Port One V2 SDK 사용
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
 * 결제 처리 (PORT ONE V2 SDK)
 */
export async function processPayment(): Promise<boolean> {
    if (typeof window === 'undefined') {
        console.error('Window is undefined - cannot process payment');
        return false;
    }

    try {
        // Port One V2 SDK 동적 로드
        const PortOne = await import('@portone/browser-sdk/v2');

        // 가맹점 식별코드 (V2 형식: store-xxxx...)
        const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'store-test';

        console.log(
            '%c포트원 V2 결제 시작',
            'color: #4CAF50; font-weight: bold; font-size: 14px;',
            '\n상점 ID:', STORE_ID
        );

        const isTest = isTestPaymentMode();

        // V2 SDK를 사용한 결제 요청
        const response = await PortOne.requestPayment({
            storeId: STORE_ID,
            channelKey: 'channel-key-6cb40ac0-03da-4cc7-b0ef-f0f47da83c64', // 카카오페이 채널 (실제 값으로 교체 필요)
            paymentId: `payment-${Date.now()}`,
            orderName: '그림실 프리미엄 멤버십',
            totalAmount: isTest ? 100 : 20000,
            currency: 'CURRENCY_KRW' as const,
            payMethod: 'CARD',
            customer: {
                fullName: '작가님',
            },
        });

        // 결제 완료 처리
        if (response && typeof response === 'object' && 'code' in response) {
            // 에러 발생
            console.error('Payment error:', response);
            return false;
        }

        // 성공
        localStorage.setItem('payment_status', 'paid');
        console.log('%c결제 성공!', 'color: #4CAF50; font-weight: bold;');
        return true;

    } catch (error) {
        console.error(
            '%c결제 처리 오류',
            'color: #f44336; font-weight: bold; font-size: 14px;',
            '\n에러:', error
        );

        // 사용자 친화적 에러 처리
        if (error instanceof Error) {
            if (error.message.includes('User cancelled')) {
                console.log('사용자가 결제를 취소했습니다.');
                return false;
            }
        }

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
