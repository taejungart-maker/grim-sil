/**
 * Port One V1 결제 처리 (IMP SDK)
 */

// IMP 타입 정의
declare global {
    interface Window {
        IMP?: any;
    }
}

/**
 * Artist ID 기반 고유 localStorage 키 생성
 */
function getPaymentStorageKey(): string {
    if (typeof window === 'undefined') return 'payment_status';

    // 동적으로 Artist ID 가져오기
    const { getClientArtistId } = require('./getArtistId');
    const artistId = getClientArtistId();

    return `payment_status__${artistId}`;
}

// PortOne V1 스크립트 로드
function loadPortOneScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.IMP) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.iamport.kr/v1/iamport.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PortOne script'));
        document.head.appendChild(script);
    });
}

export async function startSubscription(): Promise<boolean> {
    try {
        // 브라우저 환경 체크
        if (typeof window === 'undefined') {
            console.error('Window is undefined');
            return false;
        }

        console.log('Starting V1 payment process...');

        // PortOne V1 스크립트 로드
        await loadPortOneScript();

        if (!window.IMP) {
            throw new Error('IMP object not found');
        }

        // 가맹점 식별코드로 IMP 초기화
        const IMP = window.IMP;
        IMP.init('imp51454837'); // 실제 가맹점 식별코드

        console.log('IMP initialized');

        // 고유 주문번호 생성
        const merchant_uid = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return new Promise((resolve) => {
            // 결제 요청
            IMP.request_pay({
                pg: 'kakaopay.TC0ONETIME', // 카카오페이 테스트
                pay_method: 'card',
                merchant_uid: merchant_uid,
                name: 'VIP 프리미엄 구독',
                amount: 20000,
                buyer_email: 'test@example.com',
                buyer_name: '테스트',
                buyer_tel: '010-0000-0000',
                m_redirect_url: window.location.origin + '/subscription', // 모바일 결제 후 리디렉션 URL

            }, (response: any) => {
                console.log('Payment response:', response);

                if (response.success) {
                    console.log('Payment successful!', response);
                    const paymentKey = getPaymentStorageKey();
                    localStorage.setItem(paymentKey, 'paid');
                    resolve(true);
                } else {
                    console.error('Payment failed:', response.error_msg);
                    if (response.error_msg) {
                        alert(`결제 실패: ${response.error_msg}`);
                    }
                    resolve(false);
                }
            });
        });

    } catch (error) {
        console.error('Payment error:', error);
        alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        return false;
    }
}

// 하위 호환성을 위한 alias
export const processPayment = startSubscription;

// 결제 상태 확인
export function checkPaymentStatus(): boolean {
    if (typeof window === 'undefined') return false;
    const paymentKey = getPaymentStorageKey();
    return localStorage.getItem(paymentKey) === 'paid';
}

// 결제 상태 초기화
export function resetPaymentStatus(): void {
    if (typeof window === 'undefined') return;
    const paymentKey = getPaymentStorageKey();
    localStorage.removeItem(paymentKey);
}

