"use client";

import { useState } from "react";
import Link from "next/link";
import { processPayment } from "../utils/paymentUtils";

export default function MembershipPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const success = await processPayment();
            if (success) {
                alert('✅ 구독이 완료되었습니다!');
                window.location.href = '/';
            } else {
                alert('❌ 결제가 취소되었거나 실패했습니다.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('❌ 결제 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily: "'Noto Sans KR', sans-serif"
        }}>
            {/* 뒤로가기 */}
            <Link href="/" style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                color: "rgba(255,255,255,0.9)",
                textDecoration: "none",
                fontSize: "14px"
            }}>
                ← 돌아가기
            </Link>

            {/* 메인 카드 */}
            <div style={{
                background: "#fff",
                borderRadius: "32px",
                padding: "60px 40px",
                maxWidth: "500px",
                width: "100%",
                boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
                textAlign: "center"
            }}>
                <h1 style={{
                    fontSize: "42px",
                    fontWeight: 900,
                    marginBottom: "16px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.02em"
                }}>
                    VIP 프리미엄
                </h1>

                <p style={{
                    fontSize: "18px",
                    color: "#666",
                    marginBottom: "48px"
                }}>
                    프리미엄 작품 컬렉션에 무제한 접근
                </p>

                {/* 가격 */}
                <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "24px",
                    padding: "40px",
                    marginBottom: "40px"
                }}>
                    <div style={{
                        color: "#fff",
                        fontSize: "56px",
                        fontWeight: 900,
                        letterSpacing: "-0.03em"
                    }}>
                        ₩100
                        <span style={{
                            fontSize: "20px",
                            fontWeight: 400,
                            marginLeft: "8px"
                        }}>
                            테스트
                        </span>
                    </div>
                </div>

                {/* 구독 버튼 */}
                <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        padding: "24px",
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#fff",
                        background: isLoading
                            ? "#ccc"
                            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: "16px",
                        cursor: isLoading ? "wait" : "pointer",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                        transition: "all 0.2s"
                    }}
                >
                    {isLoading ? "처리 중..." : "💳 구독하기"}
                </button>
            </div>
        </div>
    );
}
