/**
 * 토스페이먼츠 통합 결제 처리
 * - PortOne(아임포트) V1 SDK를 통한 토스페이먼츠 연동
 * - 신용카드, 계좌이체, 카카오페이, 네이버페이 등 모든 결제수단 지원
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

/**
 * PortOne V1 스크립트 로드
 */
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

/**
 * 토스페이먼츠 통합 결제 시작
 * - 결제수단: 신용카드, 계좌이체, 카카오페이, 토스페이, 네이버페이 등
 * - 사용자가 결제창에서 직접 선택
 */
export async function startSubscription(): Promise<boolean> {
    try {
        // 브라우저 환경 체크
        if (typeof window === 'undefined') {
            console.error('Window is undefined');
            return false;
        }

        console.log('🚀 토스페이먼츠 통합 결제 시작...');

        // PortOne V1 스크립트 로드
        await loadPortOneScript();

        if (!window.IMP) {
            throw new Error('IMP object not found');
        }

        // 가맹점 식별코드로 IMP 초기화
        const IMP = window.IMP;
        IMP.init('imp51454837'); // 실제 가맹점 식별코드

        console.log('✅ IMP 초기화 완료');

        // 고유 주문번호 생성
        const merchant_uid = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return new Promise((resolve) => {
            // 토스페이먼츠 통합 결제 요청
            IMP.request_pay({
                pg: 'tosspayments', // 토스페이먼츠 PG사
                pay_method: '', // 빈값 = 결제창에서 사용자가 결제수단 선택
                merchant_uid: merchant_uid,
                name: 'VIP 프리미엄 구독 (월간)',
                amount: 29000, // 29,000원
                buyer_email: 'customer@example.com',
                buyer_name: '고객',
                buyer_tel: '010-0000-0000',
                m_redirect_url: window.location.origin + '/payment/complete', // 모바일 결제 후 리디렉션
                // 테스트 모드에서는 실결제 되지 않음

            }, (response: any) => {
                console.log('💳 결제 응답:', response);

                if (response.success) {
                    // 결제 성공
                    console.log('🎉 결제 성공!', response);
                    console.log('   - 결제 ID:', response.imp_uid);
                    console.log('   - 주문번호:', response.merchant_uid);
                    console.log('   - 결제수단:', response.pay_method);

                    // 로컬 결제 상태 저장
                    const paymentKey = getPaymentStorageKey();
                    localStorage.setItem(paymentKey, 'paid');

                    resolve(true);
                } else {
                    // 결제 실패 또는 취소
                    console.error('❌ 결제 실패:', response.error_msg);
                    if (response.error_msg) {
                        alert(`결제 실패: ${response.error_msg}`);
                    }
                    resolve(false);
                }
            });
        });

    } catch (error) {
        console.error('❌ 결제 처리 오류:', error);
        alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        return false;
    }
}

// 하위 호환성을 위한 alias
export const processPayment = startSubscription;

/**
 * 결제 상태 확인
 */
export function checkPaymentStatus(): boolean {
    if (typeof window === 'undefined') return false;
    const paymentKey = getPaymentStorageKey();
    return localStorage.getItem(paymentKey) === 'paid';
}

/**
 * 결제 상태 초기화 (구독 취소 시 사용)
 */
export function resetPaymentStatus(): void {
    if (typeof window === 'undefined') return;
    const paymentKey = getPaymentStorageKey();
    localStorage.removeItem(paymentKey);
    console.log('🔄 결제 상태 초기화 완료');
}
