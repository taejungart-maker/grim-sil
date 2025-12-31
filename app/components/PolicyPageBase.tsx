"use client";

import Link from "next/link";
import { POLICY_DATA } from "../data/policies";

interface PolicyPageBaseProps {
    policyId: "terms" | "privacy" | "refund" | "exchange";
}

export default function PolicyPageBase({ policyId }: PolicyPageBaseProps) {
    const data = POLICY_DATA[policyId];

    return (
        <div style={{
            maxWidth: "850px",
            margin: "0 auto",
            padding: "60px 24px",
            fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
            lineHeight: 1.8,
            color: "#1e293b"
        }}>
            {/* 상단 네비게이션 */}
            <div style={{ marginBottom: "48px" }}>
                <Link
                    href="/"
                    style={{
                        color: "#6366f1",
                        textDecoration: "none",
                        fontSize: "15px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    <span style={{ fontSize: "20px" }}>←</span> 홈으로 돌아가기
                </Link>
            </div>

            {/* 헤더 */}
            <div style={{ marginBottom: "56px" }}>
                <h1 style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    marginBottom: "16px",
                    color: "#0f172a",
                    letterSpacing: "-0.04em"
                }}>
                    {data.title}
                </h1>
                <p style={{ color: "#64748b", fontSize: "16px" }}>
                    그림실(Grim-Sil) 서비스의 {data.title} 전문입니다.
                </p>
                <div style={{
                    marginTop: "32px",
                    height: "4px",
                    width: "80px",
                    backgroundColor: "#6366f1",
                    borderRadius: "2px"
                }} />
            </div>

            {/* 본문 콘텐츠 */}
            <div style={{
                backgroundColor: "#ffffff",
                padding: "48px 40px",
                borderRadius: "32px",
                boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.04)",
                border: "1px solid #f1f5f9",
                fontSize: "16px",
                whiteSpace: "pre-wrap"
            }}>
                {data.content.split('\n').map((line, i) => {
                    const isTitle = line.startsWith('제') && line.includes('조');
                    const isAlert = line.startsWith('🚨');
                    const hasBold = line.includes('**');

                    // 텍스트 내의 **볼드** 처리
                    const renderLine = (text: string) => {
                        if (!text.includes('**')) return text;
                        const parts = text.split(/(\*\*.*?\*\*)/g);
                        return parts.map((part, index) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={index} style={{ fontWeight: 800, color: "#0f172a" }}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                        });
                    };

                    return (
                        <p key={i} style={{
                            marginBottom: line.trim() === '' ? '16px' : '10px',
                            fontWeight: isTitle ? 800 : 400,
                            fontSize: isTitle ? '20px' : '16px',
                            color: isTitle ? "#6366f1" : isAlert ? "#ef4444" : "#334155",
                            marginTop: isTitle ? "40px" : "0",
                            paddingBottom: isTitle ? "12px" : "0",
                            borderBottom: isTitle ? "2px solid #eef2ff" : "none",
                            lineHeight: 1.8,
                            letterSpacing: "-0.01em"
                        }}>
                            {renderLine(line)}
                        </p>
                    );
                })}
            </div>

            {/* 푸터 영역 */}
            <div style={{
                marginTop: "80px",
                paddingTop: "40px",
                borderTop: "1px solid #e2e8f0",
                textAlign: "center"
            }}>
                <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                    <Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "13px" }}>이용약관</Link>
                    <Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "13px" }}>개인정보처리방침</Link>
                    <Link href="/refund" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "13px" }}>환불 정책</Link>
                    <Link href="/exchange" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "13px" }}>교환 정책</Link>
                </div>
                <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
                    상호: 태정 | 대표자: 오용택
                </div>
                <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "8px" }}>
                    Copyright © 2024-2025 Grim-Sil. All rights reserved.
                </div>
            </div>
        </div>
    );
}
