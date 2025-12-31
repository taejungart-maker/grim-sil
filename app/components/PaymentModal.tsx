"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePayment } from "../contexts/PaymentContext";
import { isTestPaymentMode } from "../utils/deploymentMode";
import { checkPaymentStatus } from "../utils/paymentUtils";
import PolicyModal from "./PolicyModal";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

type PaymentStep = 'CHOICE' | 'PAYMENT' | 'SUCCESS';

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<PaymentStep>('CHOICE');
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardNumber, setCardNumber] = useState("");
    const [error, setError] = useState<string | null>(null);
    const isTestMode = isTestPaymentMode();
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
            setCardNumber("");
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
            if (cardNumber.includes("4242")) {
                await new Promise(resolve => setTimeout(resolve, 800));
                // Payment will be handled by processPayment which uses Artist ID-based key
                const success = await processPayment();
                if (success) {
                    setStep('SUCCESS');
                    if (onSuccess) onSuccess();
                }
                return;
            }

            const success = await processPayment();
            if (success) {
                setStep('SUCCESS');
                if (onSuccess) onSuccess();
            } else {
                setError('결제 정보가 유효하지 않거나 취소되었습니다.');
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.message || '결제 처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleForceSuccess = async () => {
        // Use processPayment to ensure Artist ID-based key is used
        await processPayment();
        setStep('SUCCESS');
        if (onSuccess) onSuccess();
    };

    const handleFinalClose = () => {
        onClose();
        router.refresh();
    };

    return (
        <>
            {/* 정책 모달 */}
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
                            <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', background: '#eef2ff', padding: '4px 12px', borderRadius: '20px' }}>Premium Membership</span>
                        </div>
                        <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px', color: '#1e293b', letterSpacing: '-0.02em' }}>프리미엄 구독</h2>
                        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
                            작가의 소중한 작품들을<br />무제한으로 감상하고 간직하세요.
                        </p>

                        <div style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)', borderRadius: '24px', padding: '24px', marginBottom: '32px', border: '1px solid #f1f5f9' }}>
                            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>그림실 프리미엄 (월간)</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '32px', fontWeight: 900, color: '#1e293b' }}>₩20,000</span>
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
                            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Secure Checkout</span>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: '#1e293b' }}>가상 결제창</h2>

                        <div style={{ textAlign: 'left', marginBottom: '24px', border: '1px solid #f1f5f9', borderRadius: '20px', padding: '24px', background: '#f8fafc' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px', fontWeight: 600 }}>카드 번호 (시연용: 4242 포함)</div>
                            <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="**** **** **** 4242"
                                style={{
                                    width: '100%',
                                    height: '50px',
                                    background: '#ffffff',
                                    borderRadius: '12px',
                                    marginBottom: '12px',
                                    border: '1px solid #e2e8f0',
                                    padding: '0 16px',
                                    color: '#1e293b',
                                    fontSize: '18px',
                                    outline: 'none',
                                    letterSpacing: '0.1em'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, height: '50px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 16px', color: '#94a3b8', fontSize: '15px' }}>유효기간 (MM/YY)</div>
                                <div style={{ flex: 1, height: '50px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 16px', color: '#94a3b8', fontSize: '15px' }}>CVC (***)</div>
                            </div>
                        </div>

                        <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '24px', lineHeight: 1.6, textAlign: 'left', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                            결제 시 그림실 <button onClick={() => setPolicyModal({ isOpen: true, policyId: "terms" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }}>이용약관</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "privacy" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }}>개인정보방침</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "refund" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }}>환불 정책</button> 및 <button onClick={() => setPolicyModal({ isOpen: true, policyId: "exchange" })} style={{ color: '#6366f1', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 'bold', fontSize: 'inherit' }}>교환 정책</button>에 동의한 것으로 간주됩니다.
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
                            {isProcessing ? '승인 처리 중...' : '20,000원 결제 요청'}
                        </button>

                        {error && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '16px', fontWeight: 600 }}>
                                    {error}
                                </p>
                                <button
                                    onClick={handleForceSuccess}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: '#64748b',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        marginTop: '12px'
                                    }}
                                >
                                    시연용 강제 승인 처리 (Bypass)
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {step === 'SUCCESS' && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <div style={{ width: '64px', height: '64px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10b981', fontSize: '28px' }}>
                            ✓
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: '#065f46' }}>구독이 시작되었습니다!</h2>
                        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>
                            이제부터 화첩의 모든 작품을<br />제한 없이 감상하실 수 있습니다.
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
                            갤러리 입장하기
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

