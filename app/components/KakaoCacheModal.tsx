"use client";

import { useEffect } from "react";

interface KakaoCacheModalProps {
    isOpen: boolean;
    onClose: () => void;
    siteUrl: string;
}

export default function KakaoCacheModal({ isOpen, onClose, siteUrl }: KakaoCacheModalProps) {
    useEffect(() => {
        if (isOpen) {
            // ESC 키로 닫기
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === "Escape") onClose();
            };
            window.addEventListener("keydown", handleEsc);
            return () => window.removeEventListener("keydown", handleEsc);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* 배경 오버레이 */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    zIndex: 9998,
                    backdropFilter: "blur(4px)",
                }}
            />

            {/* 모달 */}
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "#ffffff",
                    borderRadius: "24px",
                    padding: "48px",
                    maxWidth: "480px",
                    width: "90%",
                    zIndex: 9999,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                }}
            >
                {/* 헤더 */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{ fontSize: "64px", marginBottom: "20px" }}>✅</div>
                    <h2
                        style={{
                            fontSize: "32px",
                            fontWeight: "bold",
                            color: "#1a1a1a",
                            marginBottom: "16px",
                            lineHeight: "1.3",
                        }}
                    >
                        저장 완료!
                    </h2>
                    <p
                        style={{
                            fontSize: "18px",
                            color: "#666",
                            lineHeight: "1.6",
                            marginBottom: "8px",
                        }}
                    >
                        프로필 사진이 변경되었습니다
                    </p>
                </div>

                {/* 메인 안내 */}
                <div
                    style={{
                        backgroundColor: "#F0F9FF",
                        borderRadius: "16px",
                        padding: "28px",
                        marginBottom: "28px",
                        border: "2px solid #BFDBFE",
                    }}
                >
                    <p
                        style={{
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "#1a1a1a",
                            marginBottom: "16px",
                            textAlign: "center",
                            lineHeight: "1.5",
                        }}
                    >
                        📱 카카오톡에서는
                    </p>
                    <p
                        style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                            color: "#2563EB",
                            textAlign: "center",
                            marginBottom: "12px",
                        }}
                    >
                        24시간 후
                    </p>
                    <p
                        style={{
                            fontSize: "18px",
                            color: "#666",
                            lineHeight: "1.6",
                            textAlign: "center",
                        }}
                    >
                        새 사진이 자동으로 보입니다
                    </p>
                </div>

                {/* 확인 버튼 */}
                <button
                    onClick={onClose}
                    style={{
                        width: "100%",
                        padding: "18px",
                        fontSize: "20px",
                        fontWeight: "bold",
                        backgroundColor: "#3B82F6",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#2563EB";
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 130, 246, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#3B82F6";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                    }}
                >
                    확인
                </button>

                {/* 안내 메시지 */}
                <div
                    style={{
                        marginTop: "24px",
                        padding: "16px",
                        backgroundColor: "#F9FAFB",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "#6B7280",
                        lineHeight: "1.6",
                        textAlign: "center",
                    }}
                >
                    <p style={{ margin: "0" }}>
                        💡 카카오톡이 이미지를 캐시하고 있어
                        <br />
                        하루 정도 지나면 자동으로 새 사진이 반영돼요
                    </p>
                </div>
            </div>
        </>
    );
}
