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
    const [invitationMessage, setInvitationMessage] = useState("");

    // [V13] URL이 변경될 때마다 초대 메시지 동기화
    useEffect(() => {
        setInvitationMessage(`선생님, 평안하신지요?\n작가 정성스럽게 준비한 온라인 아트를 초대합니다.\n\nGallery 방문하기:\n${shareUrl}`);
    }, [shareUrl]);

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

    // [V13] 통합 공유 로직: 내장 공유 시도 -> 실패 시 클립보드 복사
    const handleSmartShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: description,
                    url: shareUrl, // V12 캐시 방지 URL 적용
                });
                return;
            } catch (err) {
                console.log("Native share cancelled or failed, falling back to clipboard.");
            }
        }

        // 클립보드 복사 (내장 공유 실패 시나 데스크톱 환경)
        copyToClipboard();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationMessage);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            backdropFilter: "blur(8px)"
        }} onClick={onClose}>
            <div style={{
                backgroundColor: bgColor,
                borderRadius: "28px",
                width: "100%",
                maxWidth: "400px",
                padding: "36px",
                boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
                position: "relative",
                border: `1px solid ${borderColor}`,
                animation: "modalAppear 0.3s ease-out"
            }} onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="hover:scale-110 transition-transform"
                    style={{
                        position: "absolute",
                        top: "24px",
                        right: "24px",
                        background: "none",
                        border: "none",
                        fontSize: "24px",
                        cursor: "pointer",
                        color: mutedColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: 700, color: textColor, marginBottom: "28px", letterSpacing: "-0.02em" }}>Gallery 정중히 공유하기</h2>

                    {/* QR Code Section */}
                    {qrCodeUrl && (
                        <div style={{
                            backgroundColor: "#fff",
                            padding: "16px",
                            borderRadius: "20px",
                            margin: "0 auto 28px",
                            width: "180px",
                            height: "180px",
                            boxShadow: `0 12px 40px ${theme === "black" ? "rgba(255,255,255,0.08)" : "rgba(194, 188, 178, 0.3)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `1px solid ${SIGNATURE_COLORS.sandGray}`
                        }}>
                            <img src={qrCodeUrl} alt="Gallery QR Code" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                    )}

                    {/* Invitation Message Section */}
                    <div style={{ marginBottom: "28px", textAlign: "left" }}>
                        <label style={{ fontSize: "12px", color: mutedColor, marginBottom: "10px", display: "block", marginLeft: "4px", fontWeight: 500 }}>
                            작가 소중히 담은 초대장
                        </label>
                        <div style={{ position: "relative" }}>
                            <textarea
                                value={invitationMessage}
                                onChange={(e) => setInvitationMessage(e.target.value)}
                                style={{
                                    width: "100%",
                                    height: "140px",
                                    padding: "20px",
                                    borderRadius: "16px",
                                    border: `1px solid ${borderColor}`,
                                    backgroundColor: theme === "black" ? "#222" : "rgba(194, 188, 178, 0.08)",
                                    color: textColor,
                                    fontSize: "14px",
                                    lineHeight: "1.7",
                                    resize: "none",
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                    outline: "none"
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* 통합된 메인 버튼 */}
                    <button
                        onClick={handleSmartShare}
                        style={{
                            padding: "18px",
                            borderRadius: "18px",
                            border: "none",
                            backgroundColor: isCopied ? "#10b981" : (theme === "black" ? "#FEE500" : SIGNATURE_COLORS.royalIndigo),
                            color: isCopied ? "#fff" : (theme === "black" ? "#000" : "#fff"),
                            fontSize: "17px",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            boxShadow: isCopied ? "none" : `0 8px 20px ${theme === "black" ? "rgba(254, 229, 0, 0.2)" : "rgba(27, 38, 59, 0.2)"}`
                        }}
                    >
                        {isCopied ? (
                            <>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                복사 완료! 지인에게 전송하세요
                            </>
                        ) : (
                            <>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                    <polyline points="16 6 12 2 8 6" />
                                    <line x1="12" y1="2" x2="12" y2="15" />
                                </svg>
                                Gallery 초대장 보내기 (카카오톡·문자)
                            </>
                        )}
                    </button>

                    <button
                        onClick={onClose}
                        style={{
                            padding: "14px",
                            borderRadius: "14px",
                            border: "none",
                            backgroundColor: "transparent",
                            color: mutedColor,
                            fontSize: "14px",
                            fontWeight: 500,
                            cursor: "pointer",
                            textDecoration: "underline",
                            opacity: 0.8
                        }}
                    >
                        닫기
                    </button>
                </div>

                <style jsx>{`
                    @keyframes modalAppear {
                        from { opacity: 0; transform: translateY(20px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>
            </div>
        </div>
    );
}
