"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPayment } from "../utils/paymentUtils";

export default function MembershipPage() {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = async () => {
        setIsProcessing(true);
        try {
            const success = await requestPayment();
            if (success) {
                alert('✅ 구독 완료!');
                window.location.href = '/';
            } else {
                alert('결제 취소 또는 실패');
            }
        } catch (error) {
            console.error(error);
            alert('오류 발생');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f5f5"
        }}>
            <Link href="/" style={{
                position: "absolute",
                top: "20px",
                left: "20px",
                color: "#666",
                textDecoration: "none"
            }}>
                ← 뒤로
            </Link>

            <button
                onClick={handleClick}
                disabled={isProcessing}
                style={{
                    padding: "24px 80px",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#fff",
                    background: isProcessing ? "#999" : "#000",
                    border: "none",
                    borderRadius: "12px",
                    cursor: isProcessing ? "wait" : "pointer"
                }}
            >
                구독하기
            </button>
        </div>
    );
}
