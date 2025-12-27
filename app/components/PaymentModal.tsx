"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePayment } from "../contexts/PaymentContext";
import { isTestPaymentMode } from "../utils/deploymentMode";

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
        // 가상 결제 대기 시간 시뮬레이션
        setTimeout(() => {
            setIsProcessing(false);
        }, 1500);
    };

    const handleConfirmPayment = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            // "4242" 입력 시 가상 성공 처리 (시연용)
            if (cardNumber.includes("4242")) {
                await new Promise(resolve => setTimeout(resolve, 800)); // 짧은 대기 시간
                localStorage.setItem('payment_status', 'paid');
                setStep('SUCCESS');
                if (onSuccess) onSuccess();
                return;
            }

            // 실제 결제 프로세스 시작
            const success = await processPayment();
            if (success) {
                setStep('SUCCESS');
                if (onSuccess) onSuccess();
            } else {
                // 결제 실패 시 (PG 설정 오류 포함)
                setError('결제 정보를 불러올 수 없거나 취소되었습니다.');
                setIsProcessing(false);
            }
        } catch (err: any) {
            console.error('Payment error:', err);
            // PG 설정 오류 등이 발생해도 시연이 가능하도록 에러 상태 저장
            setError(err.message || '등록된 PG 설정 정보가 없습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    // 강제 가상 성공 처리 (시연용 비상 버튼)
    const handleForceSuccess = () => {
        localStorage.setItem('payment_status', 'paid');
        setStep('SUCCESS');
        if (onSuccess) onSuccess();
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
                            <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Member Special</span>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>프리미엄 구독</h2>
                        <p style={{ fontSize: '15px', color: '#666', marginBottom: '30px', lineHeight: 1.6 }}>
                            작품 무제한 등록 및 편집,<br />고급 통계 기능을 즉시 시작하세요.
                        </p>

                        <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>그림실 프리미엄 (월간)</div>
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
                        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', color: '#1a1a1a' }}>가상 결제창</h2>

                        <div style={{ textAlign: 'left', marginBottom: '32px', border: '1px solid #eee', borderRadius: '16px', padding: '20px' }}>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>카드 번호 (시연: 4242 포함)</div>
                            <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="**** **** **** 4242"
                                style={{
                                    width: '100%',
                                    height: '45px',
                                    background: '#f3f4f6',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    border: '1px solid #ddd',
                                    padding: '0 12px',
                                    color: '#444',
                                    fontSize: '16px',
                                    outline: 'none'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, height: '45px', background: '#f3f4f6', borderRadius: '8px', padding: '12px', color: '#444' }}>12/27</div>
                                <div style={{ flex: 1, height: '45px', background: '#f3f4f6', borderRadius: '8px', padding: '12px', color: '#444' }}>***</div>
                            </div>
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
                            {isProcessing ? '승인 요청 중...' : '20,000원 결제 승인'}
                        </button>

                        {/* PG 오류 발생 시 나타나는 시연용 비상 버튼 */}
                        {error && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px', fontWeight: 500 }}>
                                    {error} (시연용 가맹점 설정 필요)
                                </p>
                                <button
                                    onClick={handleForceSuccess}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#374151',
                                        background: '#f3f4f6',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
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
                        <div style={{ width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#10b981', fontWeight: 900, fontSize: '20px' }}>
                            OK
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#065f46' }}>결제 완료!</h2>
                        <p style={{ fontSize: '15px', color: '#666', marginBottom: '32px', lineHeight: 1.6 }}>
                            프리미엄 구독이 활성화되었습니다.<br />이제 모든 기능을 자유롭게 사용하세요.
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

