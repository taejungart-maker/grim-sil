"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePayment } from "../contexts/PaymentContext";
import PolicyModal from "./PolicyModal";

interface VIPPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type PaymentStep = 'CHOICE' | 'PAYMENT' | 'SUCCESS';

/**
 * 🔒 VIP 전용 결제 모달 (시연용 Bypass 제거)
 * Group 1 (Commercial VIP) 전용으로 실제 라이브 결제만 허용
 */
export default function VIPPaymentModal({ isOpen, onClose, onSuccess }: VIPPaymentModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<PaymentStep>('CHOICE');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { processPayment } = usePayment();

    const [policyModal, setPolicyModal] = useState<{
        isOpen: boolean;
        policyId: "terms" | "privacy" | "refund" | "exchange";
    }>({
        isOpen: false,
        policyId: "terms"
    });

    useEffect(() => {
        if (isOpen) {
            setStep('CHOICE');
            setIsProcessing(false);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleStartPayment = () => {
        setStep('PAYMENT');
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
        }, 800);
    };

    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const success = await processPayment();

            if (success) {
                setStep('SUCCESS');
                if (onSuccess) onSuccess();
            } else {
                setError('결제가 취소되었거나 실패했습니다.');
                setIsProcessing(false);
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.message || '결제 처리 중 오류가 발생했습니다.');
            setIsProcessing(false);
        }
    };

    const handleFinalClose = () => {
        onClose();
        router.refresh();
    };

    return (
        <>
            {/* 정책 모달 (레이어 위 레이어) */}
            <PolicyModal
                isOpen={policyModal.isOpen}
                onClose={() => setPolicyModal(prev => ({ ...prev, isOpen: false }))}
                policyId={policyModal.policyId}
                theme="white"
            />

            {/* 배경 오버레이 */}
            <div
                onClick={step === 'SUCCESS' ? handleFinalClose : onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 9998,
                    animation: 'fadeIn 0.2s ease'
                }}
            />

            {/* 모달 */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                maxWidth: '440px',
                width: '94%',
                background: '#ffffff',
                borderRadius: '32px',
                padding: '44px 24px',
                textAlign: 'center',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.45)',
                animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden'
            }}>
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: '#f8fafc',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        display: step === 'SUCCESS' ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ×
                </button>

                {step === 'CHOICE' && (
                    <div className="animate-in fade-in duration-300">
                        <div style={{ padding: '8px 0', marginBottom: '16px' }}>
                            <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', background: '#eef2ff', padding: '4px 12px', borderRadius: '20px' }}>VIP Artist Membership</span>
                        </div>
                        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px', color: '#1e293b', letterSpacing: '-0.02em' }}>프리미엄 구독</h2>
                        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
                            나만의 온라인 갤러리를 시작하고<br />전 세계 방문자와 작품을 공유하세요.
                        </p>

                        <div style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)', borderRadius: '24px', padding: '24px', marginBottom: '32px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>VIP 구독권 (월간)</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b' }}>29,000 KRW</span>
                                <span style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '-8px' }}>/ 월</span>
                            </div>
                        </div>

                        <button
                            onClick={handleStartPayment}
                            style={{
                                width: '100%',
                                padding: '20px',
                                fontSize: '17px',
                                fontWeight: 700,
                                color: '#ffffff',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                border: 'none',
                                borderRadius: '18px',
                                cursor: 'pointer',
                                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                                transition: 'all 0.2s'
                            }}
                        >
                            구독 결제하기
                        </button>
                    </div>
                )}

                {step === 'PAYMENT' && (
                    <div className="animate-in zoom-in-95 duration-300">
                        <div style={{ padding: '4px 0', marginBottom: '20px' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Secure PortOne Checkout</span>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: '#1e293b' }}>안전한 결제</h2>

                        <div style={{
                            fontSize: '13px',
                            color: '#64748b',
                            lineHeight: 1.7,
                            marginBottom: '28px',
                            background: '#f8fafc',
                            padding: '16px',
                            borderRadius: '16px',
                            textAlign: 'left',
                            border: '1px solid #f1f5f9'
                        }}>
                            결제 시 그림실 <button onClick={() => setPolicyModal({ isOpen: true, policyId: "terms" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 'bold' }}>이용약관</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "privacy" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 'bold' }}>개인정보방침</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "refund" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 'bold' }}>환불 정책</button> 및 <button onClick={() => setPolicyModal({ isOpen: true, policyId: "exchange" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 'bold' }}>교환 정책</button>에 동의한 것으로 간주됩니다.
                        </div>

                        <button
                            onClick={handleConfirmPayment}
                            disabled={isProcessing}
                            style={{
                                width: '100%',
                                padding: '20px',
                                fontSize: '17px',
                                fontWeight: 700,
                                color: '#ffffff',
                                background: isProcessing ? '#94a3b8' : '#1e293b',
                                border: 'none',
                                borderRadius: '18px',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isProcessing ? '결제 요청 중...' : '결제 창 열기 (29,000 KRW)'}
                        </button>

                        {error && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '16px', fontWeight: 600 }}>
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {step === 'SUCCESS' && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <div style={{ width: '64px', height: '64px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10b981', fontSize: '28px' }}>
                            ✓
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: '#065f46' }}>결제가 완료되었습니다!</h2>
                        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>
                            이제 VIP 멤버십의 모든 기능을<br />자유롭게 이용하실 수 있습니다.
                        </p>
                        <button
                            onClick={handleFinalClose}
                            style={{
                                width: '100%',
                                padding: '20px',
                                fontSize: '17px',
                                fontWeight: 800,
                                color: '#ffffff',
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '18px',
                                cursor: 'pointer',
                                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Gallery 시작하기
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -40%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
            `}</style>
        </>
    );
}
