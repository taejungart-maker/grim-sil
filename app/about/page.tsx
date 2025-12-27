"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { loadSettings } from "../utils/settingsDb";
import { defaultSiteConfig, SiteConfig } from "../config/site";

export default function AboutPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [isLoading, setIsLoading] = useState(true);
    const [currentYear, setCurrentYear] = useState(2025); // 기본값

    useEffect(() => {
        loadSettings().then((s) => {
            setSettings(s);
            setIsLoading(false);
        });
        // 클라이언트에서만 현재 연도 설정
        setCurrentYear(new Date().getFullYear());
    }, []);

    const bgColor = settings.theme === "black" ? "#000000" : "#ffffff";
    const textColor = settings.theme === "black" ? "#ffffff" : "#000000";
    const mutedColor = settings.theme === "black" ? "#888888" : "#666666";
    const borderColor = settings.theme === "black" ? "#222222" : "#f0f0f0";

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: bgColor }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" style={{ borderColor: textColor }}></div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen transition-colors duration-500"
            style={{
                background: bgColor,
                color: textColor,
                fontFamily: "'Noto Sans KR', sans-serif"
            }}
        >
            {/* 미니멀 헤더 */}
            <header
                className="sticky top-0 z-30"
                style={{
                    background: bgColor,
                    borderBottom: `1px solid ${borderColor}`,
                }}
            >
                <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-4">
                    <Link href="/" style={{ textDecoration: "none" }}>
                        <span style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: textColor
                        }}>
                            {settings.galleryNameKo}
                        </span>
                    </Link>
                    <Link href="/" style={{
                        fontSize: "15px",
                        fontWeight: 500,
                        color: mutedColor,
                        textDecoration: "none"
                    }}>
                        닫기 ✕
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
                {/* 프로필 이미지 섹션 */}
                {settings.aboutmeImage && (
                    <div className="mb-20 flex justify-center">
                        <div style={{
                            position: "relative",
                            width: "100%",
                            maxWidth: "400px",
                            aspectRatio: "3/4",
                            overflow: "hidden",
                            borderRadius: "2px",
                            boxShadow: settings.theme === "black"
                                ? "0 20px 40px rgba(255,255,255,0.05)"
                                : "0 20px 40px rgba(0,0,0,0.05)"
                        }}>
                            <Image
                                src={settings.aboutmeImage}
                                alt={settings.artistName}
                                fill
                                priority
                                style={{ objectFit: "cover" }}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-24">
                    {/* 작가 이름 */}
                    <div className="text-center">
                        <h1 style={{
                            fontSize: "32px",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            marginBottom: "12px"
                        }}>
                            {settings.artistName}
                        </h1>
                        <p style={{ color: mutedColor, fontSize: "16px", letterSpacing: "0.05em" }}>
                            ARTIST
                        </p>
                    </div>

                    {/* 작가노트 */}
                    {settings.showArtistNote && settings.aboutmeNote && (
                        <section>
                            <h2 style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                letterSpacing: "0.2em",
                                color: mutedColor,
                                marginBottom: "32px",
                                textAlign: "center",
                                borderBottom: `1px solid ${borderColor}`,
                                paddingBottom: "12px"
                            }}>
                                ARTIST NOTE
                            </h2>
                            <div style={{
                                fontSize: "17px",
                                lineHeight: "2.2",
                                whiteSpace: "pre-wrap",
                                textAlign: "justify",
                                wordBreak: "keep-all"
                            }}>
                                {settings.aboutmeNote}
                            </div>
                        </section>
                    )}

                    {/* 평론 */}
                    {settings.showCritique && settings.aboutmeCritique && (
                        <section>
                            <h2 style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                letterSpacing: "0.2em",
                                color: mutedColor,
                                marginBottom: "32px",
                                textAlign: "center",
                                borderBottom: `1px solid ${borderColor}`,
                                paddingBottom: "12px"
                            }}>
                                CRITIQUE
                            </h2>
                            <div style={{
                                fontSize: "17px",
                                lineHeight: "2.2",
                                whiteSpace: "pre-wrap",
                                textAlign: "justify",
                                wordBreak: "keep-all"
                            }}>
                                {settings.aboutmeCritique}
                            </div>
                        </section>
                    )}

                    {/* 약력 */}
                    {settings.showHistory && settings.aboutmeHistory && (
                        <section>
                            <h2 style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                letterSpacing: "0.2em",
                                color: mutedColor,
                                marginBottom: "32px",
                                textAlign: "center",
                                borderBottom: `1px solid ${borderColor}`,
                                paddingBottom: "12px"
                            }}>
                                HISTORY
                            </h2>
                            <div style={{
                                fontSize: "16px",
                                lineHeight: "1.9",
                                whiteSpace: "pre-wrap",
                                textAlign: "left",
                                wordBreak: "keep-all"
                            }}>
                                {settings.aboutmeHistory}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <footer className="py-20 text-center" style={{ borderTop: `1px solid ${borderColor}`, marginTop: "64px" }}>
                <p style={{ fontSize: "14px", color: mutedColor }}>
                    © {currentYear} {settings.artistName}. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
