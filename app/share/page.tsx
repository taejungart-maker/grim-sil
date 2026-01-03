"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { loadSettings } from "../utils/settingsDb";
import { SiteConfig, defaultSiteConfig } from "../config/site";

export default function SharePage() {
    const router = useRouter();
    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);

    useEffect(() => {
        loadSettings().then(setSettings);
    }, []);

    const bgColor = settings.theme === "black" ? "#1a1a1a" : "#fafafa";
    const textColor = settings.theme === "black" ? "#ffffff" : "#1a1a1a";
    const cardBg = settings.theme === "black" ? "#2a2a2a" : "#ffffff";

    const features = [
        {
            icon: "🎬",
            title: "릴스/숏츠 만들기",
            description: "작품을 멋진 거실에 걸어보고 영상으로 녹화하세요",
            href: "/share/reels",
            color: "#e91e63",
        },
        {
            icon: "📸",
            title: "SNS 이미지 저장",
            description: "인스타그램, 페이스북에 딱 맞는 크기로 저장",
            href: "/share/image",
            color: "#2196f3",
        },
        {
            icon: "🪪",
            title: "초대장 만들기",
            description: "전시 소식을 담은 예쁜 초대장을 만들어 공유하세요",
            href: "/share/profile",
            color: "#9c27b0",
        },
    ];

    return (
        <div
            className="min-h-screen"
            style={{ background: bgColor, color: textColor }}
        >
            {/* 헤더 */}
            <header
                style={{
                    padding: "20px 24px",
                    borderBottom: `1px solid ${settings.theme === "black" ? "#333" : "#eee"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                }}
            >
                <button
                    onClick={() => router.push("/")}
                    style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: settings.theme === "black" ? "#333" : "#f3f4f6",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "20px",
                    }}
                >
                    ←
                </button>
                <h1 style={{ fontSize: "28px", fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}>
                    📤 SNS 공유 센터
                </h1>
            </header>

            {/* 메인 */}
            <main
                className="max-w-2xl mx-auto"
                style={{ padding: "32px 24px" }}
            >
                <p
                    style={{
                        fontSize: "18px",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: settings.theme === "black" ? "#999" : "#666",
                        marginBottom: "32px",
                        lineHeight: 1.6,
                    }}
                >
                    작품을 SNS에 쉽게 공유하세요!<br />
                    아래 기능 중 하나를 선택해주세요.
                </p>

                {/* 기능 카드들 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {features.map((feature) => (
                        <Link
                            key={feature.href}
                            href={feature.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                                padding: "24px",
                                background: cardBg,
                                borderRadius: "16px",
                                textDecoration: "none",
                                color: textColor,
                                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                                transition: "transform 0.2s",
                            }}
                        >
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "16px",
                                    background: `${feature.color}20`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "28px",
                                    flexShrink: 0,
                                }}
                            >
                                {feature.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "6px", fontFamily: "'Noto Sans KR', sans-serif" }}>
                                    {feature.title}
                                </h3>
                                <p style={{ fontSize: "16px", color: settings.theme === "black" ? "#888" : "#666" }}>
                                    {feature.description}
                                </p>
                            </div>
                            <span style={{ marginLeft: "auto", fontSize: "20px", color: "#888" }}>
                                →
                            </span>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
