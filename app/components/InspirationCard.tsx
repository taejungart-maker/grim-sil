"use client";

import { InspirationData } from "../utils/indexedDbStorage";

interface InspirationCardProps {
    inspiration: InspirationData;
    onClick: () => void;
    isNew?: boolean; // 새로 추가된 영감인지 표시
}

export default function InspirationCard({ inspiration, onClick, isNew = false }: InspirationCardProps) {
    const { blurImageUrl, colorPalette, metadata, createdAt } = inspiration;

    // 날짜 포맷
    const date = new Date(createdAt);
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    return (
        <div
            onClick={onClick}
            style={{
                position: "relative",
                borderRadius: "20px",
                overflow: "hidden",
                background: "#fff",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                transition: "all 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                animation: isNew ? "slideInScale 600ms cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.1)";
            }}
        >
            {/* 블러 이미지 - 캔버스 위의 작품처럼 */}
            <div
                style={{
                    width: "100%",
                    aspectRatio: "4/3",
                    overflow: "hidden",
                    borderRadius: "16px 16px 0 0",
                    position: "relative",
                }}
            >
                {blurImageUrl ? (
                    <img
                        src={blurImageUrl}
                        alt="Inspiration"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            background: `linear-gradient(135deg, ${colorPalette[0] || '#667eea'} 0%, ${colorPalette[1] || '#764ba2'} 100%)`,
                        }}
                    />
                )}

                {/* 새 영감 배지 */}
                {isNew && (
                    <div
                        style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            background: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(10px)",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            color: "#667eea",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        ✨ NEW
                    </div>
                )}
            </div>

            {/* 하단: 색상 팔레트 + 메타데이터 */}
            <div style={{ padding: "16px" }}>
                {/* 색상 팔레트 - 원형 칩 */}
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "12px",
                        justifyContent: "center",
                    }}
                >
                    {colorPalette.slice(0, 5).map((color, idx) => (
                        <div
                            key={idx}
                            style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: color,
                                border: "3px solid #fff",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                transition: "transform 200ms ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.2)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                            }}
                        />
                    ))}
                </div>

                {/* 날짜/시간 - 최소화된 텍스트 */}
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#1a1a1a",
                            marginBottom: "2px",
                        }}
                    >
                        {dateStr}
                    </div>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#888",
                        }}
                    >
                        {timeStr}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideInScale {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.9);
                    }
                    60% {
                        transform: translateY(5px) scale(1.05);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
