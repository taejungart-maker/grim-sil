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

    const handleOpenKakaoCache = () => {
        // 카카오 캐시 삭제 페이지를 새 창으로 열기
        const kakaoUrl = `https://developers.kakao.com/tool/clear/og?url=${encodeURIComponent(siteUrl)}`;
        window.open(kakaoUrl, "_blank", "width=800,height=600");
    };

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
                    padding: "40px",
                    maxWidth: "500px",
                    width: "90%",
                    zIndex: 9999,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                }}
            >
                {/* 헤더 */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                    <h2
                        style={{
                            fontSize: "28px",
                            fontWeight: "bold",
                            color: "#1a1a1a",
                            marginBottom: "12px",
                        }}
                    >
                        저장 완료!
                    </h2>
                    <p
                        style={{
                            fontSize: "16px",
                            color: "#666",
                            lineHeight: "1.6",
                        }}
                    >
                        🖼️ 프로필 사진이 변경되었습니다
                    </p>
                </div>

                {/* 메인 안내 */}
                <div
                    style={{
                        backgroundColor: "#FFF9E6",
                        borderRadius: "16px",
                        padding: "24px",
                        marginBottom: "24px",
                        border: "2px solid #FFE066",
                    }}
                >
                    <p
                        style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#1a1a1a",
                            marginBottom: "16px",
                            textAlign: "center",
                        }}
                    >
                        카카오톡에서 새 사진을 보려면?
                    </p>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#666",
                            lineHeight: "1.6",
                            textAlign: "center",
                        }}
                    >
                        카톡이 이전 이미지를 캐시하고 있어서
                        <br />
                        한 번만 캐시를 삭제하면 새 이미지가 바로 보여요!
                    </p>
                </div>

                {/* 큰 버튼 */}
                <button
                    onClick={handleOpenKakaoCache}
                    style={{
                        width: "100%",
                        padding: "20px",
                        fontSize: "20px",
                        fontWeight: "bold",
                        backgroundColor: "#FFE500",
                        color: "#000000",
                        border: "none",
                        borderRadius: "16px",
                        cursor: "pointer",
                        marginBottom: "12px",
                        transition: "all 0.2s",
                        boxShadow: "0 4px 12px rgba(255, 229, 0, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 229, 0, 0.6)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 229, 0, 0.4)";
                    }}
                >
                    📱 카톡 캐시 삭제하기
                    <br />
                    <span style={{ fontSize: "14px", fontWeight: "normal", opacity: 0.8 }}>
                        (10초면 끝!)
                    </span>
                </button>

                {/* 나중에 버튼 */}
                <button
                    onClick={onClose}
                    style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "14px",
                        color: "#999",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "underline",
                    }}
                >
                    나중에 (24시간 후 자동 반영)
                </button>

                {/* 안내 메시지 */}
                <div
                    style={{
                        marginTop: "24px",
                        padding: "16px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "12px",
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: "1.6",
                    }}
                >
                    <p style={{ marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                        💡 버튼을 누르면:
                    </p>
                    <p style={{ margin: "4px 0" }}>1️⃣ 새 창이 열립니다</p>
                    <p style={{ margin: "4px 0" }}>2️⃣ 카카오 로그인 (간편 로그인 가능)</p>
                    <p style={{ margin: "4px 0" }}>3️⃣ "초기화" 버튼 클릭</p>
                    <p style={{ margin: "4px 0" }}>4️⃣ 완료! 🎉</p>
                </div>
            </div>
        </>
    );
}
