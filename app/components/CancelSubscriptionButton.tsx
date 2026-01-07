"use client";

import { useState } from "react";
import { resetPaymentStatus } from "../utils/paymentUtils";

interface CancelSubscriptionButtonProps {
    theme?: "white" | "black";
}

/**
 * 구독 취소 버튼 컴포넌트
 * - 심사 통과를 위한 필수 기능
 * - 확인 팝업 후 구독 해지 처리
 */
export default function CancelSubscriptionButton({ theme = "white" }: CancelSubscriptionButtonProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleCancel = async () => {
        setIsProcessing(true);

        try {
            // 1. 로컬 결제 상태 초기화
            resetPaymentStatus();

            // 2. TODO: Supabase에서 구독 상태 업데이트
            // await updateSubscriptionStatus(userId, 'cancelled');

            // 3. 성공 처리
            setIsSuccess(true);
            setTimeout(() => {
                setIsConfirmOpen(false);
                setIsSuccess(false);
                // 메인 페이지로 이동하여 헤더에서 구독 버튼 확인 가능
                window.location.href = '/';
            }, 2000);

        } catch (error) {
            console.error("구독 취소 실패:", error);
            alert("구독 취소 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsProcessing(false);
        }
    };

    const isBlack = theme === "black";
    const textColor = isBlack ? "#fff" : "#333";
    const bgColor = isBlack ? "#333" : "#fff";
    const borderColor = isBlack ? "#555" : "#ddd";

    return (
        <>
            {/* 구독 취소 버튼 */}
            <button
                onClick={() => setIsConfirmOpen(true)}
                style={{
                    padding: "12px 24px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#dc2626",
                    background: "transparent",
                    border: "1px solid #dc2626",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                }}
            >
                구독 취소
            </button>

            {/* 확인 모달 */}
            {isConfirmOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                    onClick={() => !isProcessing && setIsConfirmOpen(false)}
                >
                    <div
                        style={{
                            background: bgColor,
                            color: textColor,
                            borderRadius: "16px",
                            padding: "32px",
                            maxWidth: "400px",
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isSuccess ? (
                            <>
                                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>
                                    구독이 취소되었습니다
                                </h3>
                                <p style={{ fontSize: "14px", color: isBlack ? "#aaa" : "#666" }}>
                                    이용해 주셔서 감사합니다.
                                </p>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>
                                    정말 취소하시겠습니까?
                                </h3>
                                <p style={{
                                    fontSize: "14px",
                                    color: isBlack ? "#aaa" : "#666",
                                    marginBottom: "24px",
                                    lineHeight: 1.6
                                }}>
                                    구독을 취소하시면 프리미엄 기능 이용이<br />
                                    즉시 중단됩니다. 남은 기간에 대한<br />
                                    환불은 이용약관에 따릅니다.
                                </p>

                                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                    <button
                                        onClick={() => setIsConfirmOpen(false)}
                                        disabled={isProcessing}
                                        style={{
                                            padding: "12px 24px",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: textColor,
                                            background: "transparent",
                                            border: `1px solid ${borderColor}`,
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        유지하기
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isProcessing}
                                        style={{
                                            padding: "12px 24px",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: "#fff",
                                            background: "#dc2626",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: isProcessing ? "not-allowed" : "pointer",
                                            opacity: isProcessing ? 0.7 : 1,
                                        }}
                                    >
                                        {isProcessing ? "처리 중..." : "구독 취소"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
