"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ShareModal from "../components/ShareModal";
import { loadSettings, loadSettingsById } from "../utils/settingsDb";
import { defaultSiteConfig, SiteConfig } from "../config/site";

export default function AboutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vipId = searchParams.get("vipId") || "";
    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [isLoading, setIsLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentYear, setCurrentYear] = useState(2025); // 기본값

    useEffect(() => {
        const fetchSettings = vipId ? loadSettingsById(vipId) : loadSettings();
        fetchSettings.then((s) => {
            setSettings(s);
            setIsLoading(false);
        });
        // 클라이언트에서만 현재 연도 설정
        setCurrentYear(new Date().getFullYear());
    }, [vipId]);

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
                    <Link href={vipId ? `/gallery-${vipId}` : "/"} style={{ textDecoration: "none" }}>
                        <span style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: textColor
                        }}>
                            {settings.galleryNameKo}
                        </span>
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <button
                            onClick={async () => {
                                const shareData = {
                                    title: `${settings.artistName} 작가님 소개`,
                                    text: `${settings.artistName} 작가의 작품 세계와 작가 노트를 만나보세요.`,
                                    url: window.location.href,
                                };
                                if (navigator.share) {
                                    try {
                                        await navigator.share(shareData);
                                    } catch (error: any) {
                                        if (error.name !== 'AbortError') setShowShareModal(true);
                                    }
                                } else {
                                    setShowShareModal(true);
                                }
                            }}
                            style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                cursor: "pointer",
                                color: mutedColor,
                                display: "flex",
                                alignItems: "center"
                            }}
                            aria-label="공유"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                        </button>
                        <Link href={vipId ? `/gallery-${vipId}` : "/"} style={{
                            fontSize: "15px",
                            fontWeight: 500,
                            color: mutedColor,
                            textDecoration: "none"
                        }}>
                            닫기 ✕
                        </Link>
                    </div>
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
                                src={`${settings.aboutmeImage}?t=${Date.now()}`}
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

            {/* 공유 모달 */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                title={`${settings.artistName} 작가님 소개`}
                description={`${settings.artistName} 작가의 작품 세계와 작가 노트를 만나보세요.`}
                theme={settings.theme}
            />

            <footer className="py-20 text-center" style={{ borderTop: `1px solid ${borderColor}`, marginTop: "64px" }}>
                <p style={{ fontSize: "14px", color: mutedColor }}>
                    © {currentYear} {settings.artistName}. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
