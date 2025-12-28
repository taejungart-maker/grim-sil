"use client";

import { useState, useEffect } from "react";
import { toDataURL } from "qrcode";
import { SIGNATURE_COLORS, getThemeColors } from "../utils/themeColors";

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
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [invitationMessage, setInvitationMessage] = useState(`선생님, 평안하신지요?\n작가 정성스럽게 준비한 온라인 아트를 초대합니다.\n\n화첩 방문하기:\n${shareUrl}`);

    useEffect(() => {
        if (isOpen && shareUrl) {
            toDataURL(shareUrl, {
                width: 256,
                margin: 2,
                color: {
                    dark: theme === "black" ? "#ffffff" : SIGNATURE_COLORS.royalIndigo,
                    light: theme === "black" ? "#00000000" : "#ffffff",
                },
            })
                .then((url) => setQrCodeUrl(url))
                .catch((err) => console.error("QR Code error:", err));
        }
    }, [isOpen, shareUrl, theme]);

    if (!isOpen) return null;

    const colors = getThemeColors(theme);
    const bgColor = colors.bg;
    const textColor = colors.text;
    const borderColor = colors.border;
    const mutedColor = theme === "black" ? "#a0a0a0" : SIGNATURE_COLORS.sandGray;

    const handleCopy = () => {
        navigator.clipboard.writeText(invitationMessage);
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
                        color: mutedColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="12"></line>
                    </svg>
                </button>

                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: textColor, marginBottom: "24px" }}>화첩 정중히 공유하기</h2>

                    {/* QR Code Section */}
                    {qrCodeUrl && (
                        <div style={{
                            backgroundColor: "#fff",
                            padding: "12px",
                            borderRadius: "16px",
                            margin: "0 auto 24px",
                            width: "160px",
                            height: "160px",
                            boxShadow: `0 8px 30px ${theme === "black" ? "rgba(255,255,255,0.1)" : "rgba(194, 188, 178, 0.4)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `2px solid ${SIGNATURE_COLORS.sandGray}`
                        }}>
                            <img src={qrCodeUrl} alt="Gallery QR Code" style={{ width: "100%", height: "100%" }} />
                        </div>
                    )}

                    {/* Invitation Message Section */}
                    <div style={{ marginBottom: "24px", textAlign: "left" }}>
                        <label style={{ fontSize: "12px", color: mutedColor, marginBottom: "8px", display: "block", marginLeft: "4px" }}>
                            초대 메시지 (수정 가능)
                        </label>
                        <textarea
                            value={invitationMessage}
                            onChange={(e) => setInvitationMessage(e.target.value)}
                            style={{
                                width: "100%",
                                height: "120px",
                                padding: "16px",
                                borderRadius: "12px",
                                border: `1px solid ${borderColor}`,
                                backgroundColor: theme === "black" ? "#2a2a2a" : "rgba(194, 188, 178, 0.1)",
                                color: textColor,
                                fontSize: "14px",
                                lineHeight: "1.6",
                                resize: "none",
                                fontFamily: "'Noto Sans KR', sans-serif"
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button
                        onClick={handleCopy}
                        style={{
                            padding: "16px",
                            borderRadius: "16px",
                            border: "none",
                            backgroundColor: isCopied ? "#22c55e" : (theme === "black" ? "#333" : SIGNATURE_COLORS.royalIndigo),
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: isCopied ? "none" : `0 4px 12px ${theme === "black" ? "rgba(0,0,0,0.4)" : "rgba(27, 38, 59, 0.3)"}`
                        }}
                    >
                        {isCopied ? (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                메시지가 복사되었습니다
                            </>
                        ) : "메시지 및 주소 복사하기"}
                    </button>

                    {typeof navigator !== 'undefined' && (navigator as any).share && (
                        <button
                            onClick={handleNativeShare}
                            style={{
                                padding: "16px",
                                borderRadius: "16px",
                                border: `2px solid ${SIGNATURE_COLORS.antiqueBurgundy}`,
                                backgroundColor: "transparent",
                                color: SIGNATURE_COLORS.antiqueBurgundy,
                                fontSize: "15px",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            카카오톡·문자 띄우기
                        </button>
                    )}
                </div>

                <p style={{
                    textAlign: "center",
                    fontSize: "11px",
                    color: mutedColor,
                    marginTop: "24px"
                }}>
                    복사된 내용을 지인에게 붙여넣어 보내주세요.
                </p>
            </div>
        </div>
    );
}
