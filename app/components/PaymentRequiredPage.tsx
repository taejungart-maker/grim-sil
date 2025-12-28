"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePayment } from "../contexts/PaymentContext";
import { isTestPaymentMode } from "../utils/deploymentMode";

// 샘플 아트워크 색상 (실제 이미지 대신 그라데이션 박스 사용)
const sampleArtworks = [
    { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
    { gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
    { gradient: 'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)' },
    { gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { gradient: 'linear-gradient(135deg, #96e6a1 0%, #d4fc79 100%)' },
];

export default function PaymentRequiredPage() {
    const router = useRouter();
    const { processPayment } = usePayment();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const isTestMode = isTestPaymentMode();

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden'
        }}>
            {/* 배경: 블러 처리된 갤러리 미리보기 */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                padding: '8px',
                filter: 'blur(12px)',
                opacity: isMounted ? 0.7 : 0,
                transform: 'scale(1.1)',
                transition: 'opacity 0.5s ease-in-out'
            }}>
                {sampleArtworks.concat(sampleArtworks).concat(sampleArtworks).map((art, index) => (
                    <div
                        key={index}
                        style={{
                            background: art.gradient,
                            borderRadius: '8px',
                            aspectRatio: '1',
                            minHeight: '100px'
                        }}
                    />
                ))}
            </div>

            {/* 반투명 오버레이 (glassmorphism 효과) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
            }} />

            {/* 콘텐츠 카드 */}
            <div style={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                zIndex: 10
            }}>
                <div style={{
                    maxWidth: '460px',
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '24px',
                    padding: '48px 32px',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)'
                }}>
                    {/* 잠금 아이콘 */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)'
                    }}>
                        <svg
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>

                    {/* 제목 */}
                    <h1 style={{
                        fontSize: '26px',
                        fontWeight: 700,
                        marginBottom: '12px',
                        color: '#1a1a1a',
                        fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                        {isTestMode ? '갤러리 체험하기' : '프리미엄 갤러리'}
                    </h1>

                    {/* 설명 */}
                    <p style={{
                        fontSize: '15px',
                        color: '#666',
                        marginBottom: '28px',
                        lineHeight: 1.7,
                        fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                        {isTestMode
                            ? '구독하시면 작가의 모든 작품을\n감상하실 수 있습니다.'
                            : '작가의 아름다운 작품들을\n프리미엄 구독으로 만나보세요.'}
                    </p>

                    {/* 가격 정보 */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '28px',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            color: '#888',
                            marginBottom: '4px',
                            fontFamily: "'Noto Sans KR', sans-serif"
                        }}>
                            {isTestMode ? '테스트 결제' : '월 구독료'}
                        </div>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 700,
                            color: '#1a1a1a',
                            fontFamily: "'Noto Sans KR', sans-serif"
                        }}>
                            {isTestMode ? '₩100' : '₩20,000'}
                        </div>
                        {isTestMode && (
                            <div style={{
                                fontSize: '12px',
                                color: '#667eea',
                                marginTop: '4px',
                                fontFamily: "'Noto Sans KR', sans-serif"
                            }}>
                                실제 결제되지 않습니다
                            </div>
                        )}
                    </div>

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
                                background: isProcessing
                                    ? '#999'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                fontFamily: "'Noto Sans KR', sans-serif",
                                boxShadow: isProcessing
                                    ? 'none'
                                    : '0 4px 16px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isProcessing
                                ? '처리 중...'
                                : isTestMode
                                    ? '체험하기'
                                    : '구독하기'}
                        </button>

                        <button
                            onClick={() => router.back()}
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: '15px',
                                fontWeight: 500,
                                color: '#666',
                                background: 'transparent',
                                border: '2px solid #e8e8e8',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontFamily: "'Noto Sans KR', sans-serif",
                                transition: 'all 0.2s ease'
                            }}
                        >
                            돌아가기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
