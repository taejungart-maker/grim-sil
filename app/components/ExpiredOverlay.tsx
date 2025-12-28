"use client";

import { SIGNATURE_COLORS } from "../utils/themeColors";

interface ExpiredOverlayProps {
    onResubscribe: () => void;
    galleryName?: string;
}

/**
 * 구독 만료 시 화면에 표시되는 흐린 유리(Glassmorphism) 오버레이
 * - 갤러리 콘텐츠가 흐릿하게 보이면서
 * - "다시 구독하기" 버튼이 중앙에 표시됨
 */
export default function ExpiredOverlay({ onResubscribe, galleryName }: ExpiredOverlayProps) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // 흐린 유리 효과 (Glassmorphism)
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    padding: "48px 32px",
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "24px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    maxWidth: "90%",
                    width: "400px",
                }}
            >
                {/* 아이콘 */}
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>
                    🔒
                </div>

                {/* 제목 */}
                <h2 style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: SIGNATURE_COLORS.royalIndigo,
                    marginBottom: "12px",
                    fontFamily: "'Noto Sans KR', sans-serif",
                }}>
                    구독이 만료되었습니다
                </h2>

                {/* 설명 */}
                <p style={{
                    fontSize: "15px",
                    color: "#666",
                    marginBottom: "8px",
                    lineHeight: 1.6,
                    fontFamily: "'Noto Sans KR', sans-serif",
                }}>
                    {galleryName ? `'${galleryName}'의 ` : ""}구독 기간이 종료되었습니다.
                </p>
                <p style={{
                    fontSize: "14px",
                    color: "#888",
                    marginBottom: "32px",
                    lineHeight: 1.6,
                    fontFamily: "'Noto Sans KR', sans-serif",
                }}>
                    다시 구독하시면 모든 기능을 이용하실 수 있습니다.
                </p>

                {/* 다시 구독하기 버튼 */}
                <button
                    onClick={onResubscribe}
                    style={{
                        padding: "16px 48px",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#fff",
                        background: `linear-gradient(135deg, ${SIGNATURE_COLORS.royalIndigo} 0%, ${SIGNATURE_COLORS.antiqueBurgundy} 100%)`,
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                        transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(99, 102, 241, 0.3)";
                    }}
                >
                    💎 다시 구독하기
                </button>

                {/* 문의 링크 */}
                <p style={{
                    marginTop: "24px",
                    fontSize: "13px",
                    color: "#999",
                }}>
                    문의: support@example.com
                </p>
            </div>
        </div>
    );
}
