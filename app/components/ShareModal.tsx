"use client";

import { useState } from "react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareUrl: string;
    title: string;
    description: string;
    theme?: "white" | "black";
}

export default function ShareModal({ isOpen, onClose, shareUrl, title, description, theme = "white" }: ShareModalProps) {
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen) return null;

    const bgColor = theme === "black" ? "#1a1a1a" : "#ffffff";
    const textColor = theme === "black" ? "#ffffff" : "#1a1a1a";
    const borderColor = theme === "black" ? "#333" : "#eee";
    const mutedColor = theme === "black" ? "#a0a0a0" : "#6b7280";

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleNativeShare = () => {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: description,
                url: shareUrl,
            }).catch(console.error);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            backdropFilter: "blur(4px)"
        }} onClick={onClose}>
            <div style={{
                backgroundColor: bgColor,
                borderRadius: "24px",
                width: "100%",
                maxWidth: "400px",
                padding: "32px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                position: "relative",
                border: `1px solid ${borderColor}`
            }} onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        background: "none",
                        border: "none",
                        fontSize: "24px",
                        cursor: "pointer",
                        color: mutedColor
                    }}
                >
                    ✕
                </button>

                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        fontSize: "40px",
                        marginBottom: "16px",
                        backgroundColor: "#6366f1",
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        color: "#fff",
                        boxShadow: "0 10px 20px rgba(99, 102, 241, 0.2)"
                    }}>
                        📤
                    </div>
                    <h2 style={{ fontSize: "22px", fontWeight: 800, color: textColor, marginBottom: "8px" }}>갤러리 공유하기</h2>
                    <p style={{ color: mutedColor, fontSize: "14px", lineHeight: 1.5 }}>
                        동료 작가님이나 컬렉터분들에게<br />작가님의 작품 세계를 소개해보세요.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button
                        onClick={handleCopy}
                        style={{
                            padding: "16px",
                            borderRadius: "16px",
                            border: "none",
                            backgroundColor: isCopied ? "#22c55e" : (theme === "black" ? "#333" : "#f3f4f6"),
                            color: isCopied ? "#fff" : textColor,
                            fontSize: "16px",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                        }}
                    >
                        {isCopied ? "✓ 주소가 복사되었습니다" : "🔗 갤러리 주소 복사하기"}
                    </button>

                    {typeof navigator !== 'undefined' && (navigator as any).share && (
                        <button
                            onClick={handleNativeShare}
                            style={{
                                padding: "16px",
                                borderRadius: "16px",
                                border: `2px solid #6366f1`,
                                backgroundColor: "transparent",
                                color: "#6366f1",
                                fontSize: "16px",
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            📱 시스템 앱으로 공유 (카톡 등)
                        </button>
                    )}
                </div>

                <p style={{
                    textAlign: "center",
                    fontSize: "12px",
                    color: mutedColor,
                    marginTop: "24px"
                }}>
                    복사된 주소를 카카오톡 대화창에 붙여넣기 하시면 됩니다.
                </p>
            </div>
        </div>
    );
}
