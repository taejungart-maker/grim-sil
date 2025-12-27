"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePayment } from "../contexts/PaymentContext";
import { isTestPaymentMode } from "../utils/deploymentMode";

export default function PaymentRequiredPage() {
    const router = useRouter();
    const { processPayment } = usePayment();
    const [isProcessing, setIsProcessing] = useState(false);
    const isTestMode = isTestPaymentMode();

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const success = await processPayment();
            if (success) {
                // 결제 성공 시 페이지 새로고침하여 게이트 통과
                window.location.reload();
            } else {
                alert('결제 처리에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('결제 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa',
            padding: '24px'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                background: '#ffffff',
                borderRadius: '24px',
                padding: '48px 32px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
                {/* 아이콘 */}
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>

                {/* 제목 */}
                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    marginBottom: '16px',
                    color: '#1a1a1a',
                    fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                    {isTestMode ? '데모 모드' : '프리미엄 기능'}
                </h1>

                {/* 설명 */}
                <p style={{
                    fontSize: '16px',
                    color: '#666',
                    marginBottom: '32px',
                    lineHeight: 1.6,
                    fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                    {isTestMode
                        ? '이 기능을 사용하려면 테스트 결제를 진행해주세요. (실제 결제되지 않습니다)'
                        : '작품 추가 및 편집 기능은 프리미엄 구독 후 이용 가능합니다.'}
                </p>

                {/* 가격 정보 */}
                {!isTestMode && (
                    <div style={{
                        background: '#f0f0f0',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            color: '#888',
                            marginBottom: '8px',
                            fontFamily: "'Noto Sans KR', sans-serif"
                        }}>
                            월 구독료
                        </div>
                        <div style={{
                            fontSize: '36px',
                            fontWeight: 700,
                            color: '#1a1a1a',
                            fontFamily: "'Noto Sans KR', sans-serif"
                        }}>
                            ₩20,000
                        </div>
                    </div>
                )}

                {/* 버튼 그룹 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#ffffff',
                            background: isProcessing ? '#999' : '#1a1a1a',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            fontFamily: "'Noto Sans KR', sans-serif"
                        }}
                    >
                        {isProcessing
                            ? '처리 중...'
                            : isTestMode
                                ? '테스트 결제하기'
                                : '구독하기'}
                    </button>

                    <button
                        onClick={() => router.back()}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#666',
                            background: 'transparent',
                            border: '2px solid #e0e0e0',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontFamily: "'Noto Sans KR', sans-serif"
                        }}
                    >
                        돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}
