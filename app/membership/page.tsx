"use client";

import { useState } from "react";
import Link from "next/link";

export default function MembershipPage() {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            // Port One V2 SDK 동적 로드
            const PortOne = await import('@portone/browser-sdk/v2');

            // 결제 요청
            const response = await PortOne.requestPayment({
                storeId: 'store-69b1a422-27db-4295-818d-84a9a7e5136e',
                channelKey: 'channel-key-4f2a8b54-c09c-4575-9a1c-de33285b2b20',
                paymentId: `payment-${Date.now()}`,
                orderName: 'VIP 프리미엄 구독',
                totalAmount: 100,
                currency: 'CURRENCY_KRW' as const,
                payMethod: 'CARD',
            });

            // 성공 처리
            if (response && typeof response === 'object' && !('code' in response)) {
                localStorage.setItem('payment_status', 'paid');
                alert('✅ 구독이 완료되었습니다!');
                window.location.href = '/';
            } else {
                alert('결제가 취소되었습니다.');
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
            minHeight: "100vh",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
        }}>
            <Link href="/" style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                color: "#666",
                textDecoration: "none"
            }}>
                ← 돌아가기
            </Link>

            <div style={{ textAlign: "center" }}>
                <h1 style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    color: "#1a1a1a"
                }}>
                    VIP 프리미엄
                </h1>

                <p style={{
                    fontSize: "48px",
                    fontWeight: 900,
                    color: "#6366f1",
                    marginBottom: "40px"
                }}>
                    ₩100
                </p>

                <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    style={{
                        padding: "20px 60px",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#fff",
                        background: isProcessing ? "#ccc" : "#1a1a1a",
                        border: "none",
                        borderRadius: "12px",
                        cursor: isProcessing ? "wait" : "pointer"
                    }}
                >
                    {isProcessing ? "처리 중..." : "구독하기"}
                </button>
            </div>
        </div>
    );
}
