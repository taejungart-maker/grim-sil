// ============================================
// 결제 상태 관리 유틸리티 (localStorage 기반)
// Port One V2 SDK + 시뮬레이션 모드
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
 * 결제 처리 (PORT ONE V2 SDK + 시뮬레이션 모드)
 */
export async function processPayment(): Promise<boolean> {
    if (typeof window === 'undefined') {
        console.error('Window is undefined - cannot process payment');
        return false;
    }

    // 🔥 시뮬레이션 모드 활성화 (실제 결제 연동 전까지)
    const ENABLE_SIMULATION = true; // Port One 설정 완료 시 false로 변경

    if (ENABLE_SIMULATION) {
        console.log(
            '%c💳 결제 시뮬레이션 모드',
            'color: #FF9800; font-weight: bold; font-size: 16px; background: #FFF3E0; padding: 8px; border-radius: 4px;',
            '\n\n✅ 테스트용 가상 결제가 진행됩니다.',
            '\n💡 실제 결제를 원하시면 paymentUtils.ts 파일에서',
            '\n   ENABLE_SIMULATION을 false로 변경하세요.'
        );

        // 사용자 확인 후 승인
        return new Promise((resolve) => {
            setTimeout(() => {
                const userConfirmed = window.confirm(
                    '💎 VIP 프리미엄 멤버십\n\n' +
                    '결제 금액: ₩20,000 / 월\n\n' +
                    '━━━━━━━━━━━━━━━━━━━\n\n' +
                    '⚠️ 현재 시뮬레이션 모드입니다.\n' +
                    '실제 결제는 진행되지 않습니다.\n\n' +
                    '테스트 결제를 진행하시겠습니까?'
                );

                if (userConfirmed) {
                    localStorage.setItem('payment_status', 'paid');
                    console.log(
                        '%c✅ 시뮬레이션 결제 완료!',
                        'color: #4CAF50; font-weight: bold; font-size: 14px; background: #E8F5E9; padding: 8px; border-radius: 4px;',
                        '\n\nVIP 멤버십이 활성화되었습니다 (테스트).'
                    );
                    alert('✅ 결제가 완료되었습니다!\n\nVIP 갤러리를 이용하실 수 있습니다.');
                    resolve(true);
                } else {
                    console.log('사용자가 결제를 취소했습니다.');
                    resolve(false);
                }
            }, 300);
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 실제 Port One V2 결제 (ENABLE_SIMULATION = false)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    try {
        const PortOne = await import('@portone/browser-sdk/v2');
        const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'store-test';
        const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || 'channel-key-6cb40ac0-03da-4cc7-b0ef-f0f47da83c64';

        console.log(
            '%c포트원 V2 결제 시작',
            'color: #4CAF50; font-weight: bold; font-size: 14px;',
            '\n상점 ID:', STORE_ID,
            '\n채널 키:', CHANNEL_KEY.substring(0, 20) + '...'
        );

        const isTest = isTestPaymentMode();

        const response = await PortOne.requestPayment({
            storeId: STORE_ID,
            channelKey: CHANNEL_KEY,
            paymentId: `payment-${Date.now()}`,
            orderName: '그림실 프리미엄 멤버십',
            totalAmount: isTest ? 100 : 20000,
            currency: 'CURRENCY_KRW' as const,
            payMethod: 'CARD',
            customer: {
                fullName: '작가님',
            },
        });

        if (response && typeof response === 'object' && 'code' in response) {
            console.error('Payment error:', response);
            return false;
        }

        localStorage.setItem('payment_status', 'paid');
        console.log('%c결제 성공!', 'color: #4CAF50; font-weight: bold;');
        return true;

    } catch (error) {
        console.error(
            '%c결제 처리 오류',
            'color: #f44336; font-weight: bold; font-size: 14px;',
            '\n에러:', error
        );

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
