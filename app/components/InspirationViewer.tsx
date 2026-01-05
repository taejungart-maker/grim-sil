"use client";

import { useState } from "react";
import { InspirationData } from "../utils/indexedDbStorage";

interface InspirationViewerProps {
    inspiration: InspirationData;
    onClose: () => void;
}

export default function InspirationViewer({ inspiration, onClose }: InspirationViewerProps) {
    const { blurImageUrl, colorPalette, metadata, originalFileName, createdAt } = inspiration;
    const [showOriginalHint, setShowOriginalHint] = useState(false);

    // 날짜 포맷
    const date = new Date(createdAt);
    const dateStr = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    // 배경 그라디언트 생성
    const backgroundGradient = colorPalette.length >= 2
        ? `linear-gradient(135deg, ${colorPalette[0]} 0%, ${colorPalette[1]} 50%, ${colorPalette[2] || colorPalette[0]} 100%)`
        : colorPalette[0] || '#667eea';

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: backgroundGradient,
                zIndex: 10000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "fadeIn 500ms ease-out",
                padding: "40px 24px",
                backdropFilter: "blur(20px)",
            }}
        >
            {/* 메인 컨텐츠 */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: "900px",
                    width: "100%",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    animation: "scaleIn 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
            >
                {/* 블러 이미지 */}
                <div
                    style={{
                        width: "100%",
                        aspectRatio: "4/3",
                        borderRadius: "24px",
                        overflow: "hidden",
                        boxShadow: "0 30px 80px rgba(0, 0, 0, 0.4)",
                        marginBottom: "32px",
                        background: "#fff",
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
                                background: `linear-gradient(135deg, ${colorPalette[0]} 0%, ${colorPalette[1]} 100%)`,
                            }}
                        />
                    )}
                </div>

                {/* 메타데이터 카드 */}
                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.98)",
                        backdropFilter: "blur(30px)",
                        borderRadius: "24px",
                        padding: "32px",
                        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    {/* 날짜/시간 */}
                    <div style={{ marginBottom: "28px", textAlign: "center" }}>
                        <div
                            style={{
                                fontSize: "28px",
                                fontWeight: 700,
                                color: "#1a1a1a",
                                marginBottom: "8px",
                            }}
                        >
                            {dateStr}
                        </div>
                        <div
                            style={{
                                fontSize: "16px",
                                color: "#666",
                                letterSpacing: "0.05em",
                            }}
                        >
                            {timeStr}
                        </div>
                    </div>

                    {/* 색상 팔레트 */}
                    <div style={{ marginBottom: "28px" }}>
                        <div
                            style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#999",
                                marginBottom: "16px",
                                letterSpacing: "0.1em",
                                textAlign: "center",
                            }}
                        >
                            COLOR PALETTE
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: "16px",
                                justifyContent: "center",
                                flexWrap: "wrap",
                            }}
                        >
                            {colorPalette.map((color, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        textAlign: "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "12px",
                                            background: color,
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                                            marginBottom: "8px",
                                            transition: "transform 200ms ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "scale(1.15) rotate(5deg)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                                        }}
                                    />
                                    <div
                                        style={{
                                            fontSize: "11px",
                                            fontFamily: "monospace",
                                            color: "#666",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {color.toUpperCase()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 위치 */}
                    {metadata.location && (
                        <div style={{ marginBottom: "24px", textAlign: "center" }}>
                            <div
                                style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "#999",
                                    marginBottom: "8px",
                                    letterSpacing: "0.1em",
                                }}
                            >
                                LOCATION
                            </div>
                            <div style={{ fontSize: "15px", color: "#333", fontWeight: 500 }}>
                                📍 {metadata.location}
                            </div>
                        </div>
                    )}

                    {/* 원본 보기 버튼 */}
                    {originalFileName && (
                        <div style={{ marginTop: "28px" }}>
                            <button
                                onClick={() => setShowOriginalHint(true)}
                                style={{
                                    width: "100%",
                                    padding: "18px",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "16px",
                                    fontSize: "15px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                                    transition: "all 300ms ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(102, 126, 234, 0.3)";
                                }}
                            >
                                🖼 원본 보기
                            </button>

                            {/* 원본 안내 모달 */}
                            {showOriginalHint && (
                                <div
                                    onClick={() => setShowOriginalHint(false)}
                                    style={{
                                        position: "fixed",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        background: "rgba(0, 0, 0, 0.8)",
                                        backdropFilter: "blur(10px)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        zIndex: 10001,
                                        animation: "fadeIn 300ms ease-out",
                                    }}
                                >
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            maxWidth: "450px",
                                            background: "#fff",
                                            padding: "32px",
                                            borderRadius: "20px",
                                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                                            animation: "scaleIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "48px",
                                                textAlign: "center",
                                                marginBottom: "16px",
                                            }}
                                        >
                                            📁
                                        </div>
                                        <h3
                                            style={{
                                                fontSize: "20px",
                                                fontWeight: 700,
                                                color: "#1a1a1a",
                                                marginBottom: "12px",
                                                textAlign: "center",
                                            }}
                                        >
                                            원본 파일 위치
                                        </h3>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                lineHeight: 1.7,
                                                color: "#666",
                                                marginBottom: "20px",
                                                textAlign: "center",
                                            }}
                                        >
                                            원본 고해상도 이미지는 다운로드 폴더에 안전하게 저장되어 있습니다.
                                        </p>
                                        <div
                                            style={{
                                                background: "#f5f5f5",
                                                padding: "16px",
                                                borderRadius: "12px",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "11px",
                                                    color: "#999",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                파일명
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    fontFamily: "monospace",
                                                    color: "#333",
                                                    fontWeight: 600,
                                                    wordBreak: "break-all",
                                                }}
                                            >
                                                {originalFileName}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowOriginalHint(false)}
                                            style={{
                                                width: "100%",
                                                padding: "14px",
                                                background: "#1a1a1a",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "10px",
                                                fontSize: "14px",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            확인
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 닫기 버튼 */}
            <button
                onClick={onClose}
                style={{
                    position: "absolute",
                    top: "32px",
                    right: "32px",
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    color: "#333",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                    transition: "all 300ms ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.15) rotate(90deg)";
                    e.currentTarget.style.background = "#fff";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
                }}
            >
                ✕
            </button>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
