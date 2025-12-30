"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePayment } from "../contexts/PaymentContext";

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
        }, 1500);
    };

    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // 🔥 VIP 전용: 실제 결제만 허용 (Bypass 로직 완전 제거)
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
            {/* 배경 오버레이 */}
            <div
                onClick={step === 'SUCCESS' ? handleFinalClose : onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
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
                width: '90%',
                background: '#ffffff',
                borderRadius: '28px',
                padding: '40px 24px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation: 'slideUp 0.3s ease',
                overflow: 'hidden'
            }}>
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#bbb',
                        padding: '8px',
                        display: step === 'SUCCESS' ? 'none' : 'block'
                    }}
                >
                    ×
                </button>

                {step === 'CHOICE' && (
                    <div className="animate-in fade-in duration-300">
                        <div style={{ padding: '8px 0', marginBottom: '12px' }}>
                            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>VIP Gallery Access</span>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>VIP 구독</h2>
                        <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                            프리미엄 작품 컬렉션에 접근하려면<br />구독을 시작해주세요.
                        </p>

                        <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>VIP 프리미엄 (월간)</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b' }}>₩20,000</span>
                                <span style={{ fontSize: '14px', color: '#94a3b8' }}>/ 월</span>
                            </div>
                        </div>

                        <button
                            onClick={handleStartPayment}
                            style={{
                                width: '100%',
                                padding: '18px',
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#ffffff',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                border: 'none',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                transition: 'transform 0.2s'
                            }}
                        >
                            구독하기
                        </button>
                    </div>
                )}

                {step === 'PAYMENT' && (
                    <div className="animate-in zoom-in-95 duration-300">
                        <div style={{ padding: '4px 0', marginBottom: '20px' }}>
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Secure Checkout</span>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: '#1a1a1a' }}>안전한 결제</h2>

                        <p style={{ fontSize: "14px", color: '#666', marginBottom: "20px", lineHeight: 1.6 }}>
                            결제 버튼을 클릭하면 포트원 결제창이 열립니다.
                        </p>

                        <div style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            lineHeight: 1.6,
                            marginBottom: '24px',
                            background: '#f8fafc',
                            padding: '12px',
                            borderRadius: '12px',
                            textAlign: 'left'
                        }}>
                            결제 시 그림실 <a href="/terms" target="_blank" style={{ color: '#6366f1', textDecoration: 'underline' }}>이용약관</a> 및 <a href="/refund" target="_blank" style={{ color: '#6366f1', textDecoration: 'underline' }}>환불정책</a>에 동의한 것으로 간주되며, <a href="/privacy" target="_blank" style={{ color: '#6366f1', textDecoration: 'underline' }}>개인정보처리방침</a>에 따라 결제 정보가 처리됩니다.
                        </div>

                        <button
                            onClick={handleConfirmPayment}
                            disabled={isProcessing}
                            style={{
                                width: '100%',
                                padding: '18px',
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#ffffff',
                                background: isProcessing ? '#94a3b8' : '#1e293b',
                                border: 'none',
                                borderRadius: '14px',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                marginBottom: error ? '16px' : '0'
                            }}
                        >
                            {isProcessing ? '결제 처리 중...' : '20,000원 결제하기'}
                        </button>

                        {/* 오류 표시 (Bypass 버튼 없음) */}
                        {error && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '12px', fontWeight: 500 }}>
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {step === 'SUCCESS' && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <div style={{ width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#10b981', fontWeight: 900, fontSize: '20px' }}>
                            OK
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#065f46' }}>결제 완료!</h2>
                        <p style={{ fontSize: '15px', color: '#666', marginBottom: '32px', lineHeight: 1.6 }}>
                            VIP 구독이 활성화되었습니다.<br />프리미엄 작품을 감상하세요.
                        </p>
                        <button
                            onClick={handleFinalClose}
                            style={{
                                width: '100%',
                                padding: '18px',
                                fontSize: '16px',
                                fontWeight: 700,
                                color: '#ffffff',
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                            }}
                        >
                            시작하기
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
                        transform: translate(-50%, -40%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
            `}</style>
        </>
    );
}
