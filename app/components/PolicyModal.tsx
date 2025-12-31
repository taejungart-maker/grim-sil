"use client";

import { useState, useEffect } from "react";
import { POLICY_DATA } from "../data/policies";

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policyId: "terms" | "privacy" | "refund" | "exchange";
    theme?: "white" | "black";
}

export default function PolicyModal({ isOpen, onClose, policyId, theme = "white" }: PolicyModalProps) {
    const data = POLICY_DATA[policyId];

    // 테마 기반 색상 설정
    const colors = {
        bg: theme === "black" ? "#0f0f0f" : "#ffffff",
        text: theme === "black" ? "#e5e5e5" : "#1a1a1a",
        headerBg: theme === "black" ? "#1a1a1a" : "#fcfcfc",
        border: theme === "black" ? "#262626" : "#eeeeee",
        contentBg: theme === "black" ? "#0a0a0a" : "#fafafa",
        accent: "#6366f1"
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
            animation: "fadeIn 0.3s ease"
        }}>
            <div style={{
                backgroundColor: colors.bg,
                color: colors.text,
                width: "100%",
                maxWidth: "600px",
                maxHeight: "85vh",
                borderRadius: "28px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.5)",
                border: `1px solid ${colors.border}`,
                animation: "modalUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            }}>
                {/* 헤더 */}
                <div style={{
                    padding: "24px 28px",
                    borderBottom: `1px solid ${colors.border}`,
                    backgroundColor: colors.headerBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                }}>
                    <h2 style={{ fontSize: "20px", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                        {data.title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: colors.border,
                            border: "none",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            fontSize: "22px",
                            color: colors.text,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s"
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* 콘텐츠 영역 (스크롤) */}
                <div style={{
                    padding: "32px 28px",
                    overflowY: "auto",
                    flex: 1,
                    fontSize: "15px",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    backgroundColor: colors.contentBg,
                    fontFamily: "'Inter', 'Noto Sans KR', sans-serif"
                }}>
                    {data.content.split('\n').map((line, i) => {
                        const isTitle = line.startsWith('제') && line.includes('조');
                        const isAlert = line.startsWith('🚨');

                        // 텍스트 내의 **볼드** 처리
                        const renderLine = (text: string) => {
                            if (!text.includes('**')) return text;
                            const parts = text.split(/(\*\*.*?\*\*)/g);
                            return parts.map((part, index) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={index} style={{ fontWeight: 800, color: theme === 'black' ? '#fff' : '#000' }}>{part.slice(2, -2)}</strong>;
                                }
                                return part;
                            });
                        };

                        return (
                            <p key={i} style={{
                                marginBottom: line.trim() === '' ? '12px' : '8px',
                                fontWeight: isTitle ? 700 : 400,
                                fontSize: isTitle ? '17px' : '15px',
                                color: isTitle ? colors.accent : isAlert ? "#ef4444" : colors.text,
                                borderLeft: isTitle ? `4px solid ${colors.accent}` : 'none',
                                paddingLeft: isTitle ? '12px' : '0',
                                marginTop: isTitle ? '24px' : '0'
                            }}>
                                {renderLine(line)}
                            </p>
                        );
                    })}
                </div>

                {/* 푸터 */}
                <div style={{
                    padding: "20px 28px",
                    borderTop: `1px solid ${colors.border}`,
                    backgroundColor: colors.headerBg,
                    display: "flex",
                    justifyContent: "flex-end"
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: colors.accent,
                            color: "#fff",
                            border: "none",
                            padding: "12px 36px",
                            borderRadius: "14px",
                            fontSize: "16px",
                            fontWeight: 700,
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)"
                        }}
                    >
                        확인
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                /* 스크롤바 커스텀 */
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: ${theme === "black" ? "#333" : "#ddd"};
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: ${colors.accent};
                }
            `}</style>
        </div>
    );
}
