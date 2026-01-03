"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePayment } from "../contexts/PaymentContext";
import { isTestPaymentMode } from "../utils/deploymentMode";
import PolicyModal from "./PolicyModal";

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
    const [policyModal, setPolicyModal] = useState<{
        isOpen: boolean;
        policyId: "terms" | "privacy" | "refund" | "exchange";
    }>({
        isOpen: false,
        policyId: "terms"
    });
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
            {/* 정책 모달 */}
            <PolicyModal
                isOpen={policyModal.isOpen}
                onClose={() => setPolicyModal(prev => ({ ...prev, isOpen: false }))}
                policyId={policyModal.policyId}
                theme="white"
            />

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
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 5
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
                    WebkitBackdropFilter: 'blur(16px)',
                    animation: 'slideUp 0.4s ease'
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

                    {/* 제목 및 설명 */}
                    <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px', color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                        {isTestMode ? '프리미엄 체험하기' : '프리미엄 갤러리'}
                    </h1>
                    <p style={{ fontSize: '15px', color: '#666', marginBottom: '28px', lineHeight: 1.7 }}>
                        {isTestMode
                            ? '구독하시면 작가의 모든 작품을\n무제한으로 감상하실 수 있습니다.'
                            : '그림실 작가님의 소중한 작품들을\n프리미엄 전용 공간에서 만나보세요.'}
                    </p>

                    {/* 가격 정보 */}
                    <div style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)', borderRadius: '20px', padding: '24px', marginBottom: '28px', border: '1px solid #eef2ff' }}>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px', fontWeight: 500 }}>{isTestMode ? '시연용 테스트 결제' : '인디고 멤버십 (월간)'}</div>
                        <div style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b' }}>
                            {isTestMode ? '100 KRW' : '20,000 KRW'}
                        </div>
                    </div>

                    {/* 결제 안내 및 이용약관 동의 (중앙 데이터 연동) */}
                    <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6, textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                        결제 시 <button onClick={() => setPolicyModal({ isOpen: true, policyId: "terms" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}>이용약관</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "privacy" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}>개인정보처리방침</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "refund" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}>환불 정책</button> 및 <button onClick={() => setPolicyModal({ isOpen: true, policyId: "exchange" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}>교환 정책</button>에 동의한 것으로 간주됩니다.
                    </div>

                    {/* 버튼 그룹 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            style={{
                                width: '100%',
                                padding: '18px',
                                fontSize: '17px',
                                fontWeight: 700,
                                color: '#ffffff',
                                background: isProcessing ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                border: 'none',
                                borderRadius: '14px',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                boxShadow: isProcessing ? 'none' : '0 10px 20px rgba(99, 102, 241, 0.25)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {isProcessing ? '결제 요청 중...' : isTestMode ? '100 KRW 결제 체험하기' : '20,000 KRW 정기 구독 시작'}
                        </button>

                        <button
                            onClick={() => router.back()}
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '15px',
                                fontWeight: 600,
                                color: '#64748b',
                                background: 'transparent',
                                border: '1px solid #e2e8f0',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            뒤로 돌아가기
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
