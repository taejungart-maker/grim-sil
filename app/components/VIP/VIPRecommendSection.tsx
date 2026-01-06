"use client";

import { SIGNATURE_COLORS } from "../../utils/themeColors";

interface VIPRecommendSectionProps {
    isLoggedIn: boolean;
    isRecommending: boolean;
    isRecommended: boolean;
    handleRecommendArtist: () => void;
    colors: {
        bg: string;
        text: string;
        border: string;
    };
}

export default function VIPRecommendSection({
    isLoggedIn,
    isRecommending,
    isRecommended,
    handleRecommendArtist,
    colors
}: VIPRecommendSectionProps) {
    if (!isLoggedIn) return null;

    return (
        <div style={{ padding: "12px 24px", textAlign: "center", borderBottom: `1px solid ${colors.border}`, background: colors.bg }}>
            <button
                onClick={handleRecommendArtist}
                disabled={isRecommending || isRecommended}
                style={{
                    padding: "8px 24px",
                    borderRadius: "4px",
                    border: `1px solid ${isRecommended ? "var(--border)" : "var(--primary)"}`,
                    background: isRecommended ? "transparent" : "var(--primary)",
                    color: isRecommended ? "var(--text-muted)" : "#fff",
                    fontSize: "14px",
                    fontFamily: "var(--font-serif)",
                    fontWeight: 500,
                    cursor: isRecommending || isRecommended ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    opacity: isRecommending || isRecommended ? 0.7 : 1,
                }}
            >
                {isRecommending ? "추천 중..." : isRecommended ? "추천 완료" : "동행 작가로 추천"}
            </button>
        </div>
    );
}
