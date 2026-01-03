"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ShareModal from "../components/ShareModal";
import { loadSettings, loadSettingsById } from "../utils/settingsDb";
import { defaultSiteConfig, SiteConfig } from "../config/site";
import { SIGNATURE_COLORS } from "../utils/themeColors";

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
    category: string;
    description?: string;
}

const SOURCES = [
    {
        name: "ART NEWS - 전시",
        rss: "https://news.google.com/rss/search?q=%EB%AF%B8%EC%88%A0+%EC%A0%84%EC%8B%9C&hl=ko&gl=KR&ceid=KR:ko",
        category: "전시정보",
    },
    {
        name: "ART NEWS - 공모전",
        rss: "https://news.google.com/rss/search?q=%EB%AF%B8%EC%88%A0+%EA%B3%B5%EB%AA%A8%EC%A0%84&hl=ko&gl=KR&ceid=KR:ko",
        category: "공모/지원",
    }
];

const CURATED_LINKS = [
    { name: "국립현대미술관", url: "https://www.mmca.go.kr", desc: "국가 대표 미술관 전시 및 소식" },
    { name: "예술경영지원센터", url: "https://www.gokams.or.kr", desc: "예술인 지원사업 및 공모 정보" },
    { name: "서울시립미술관", url: "https://sema.seoul.go.kr", desc: "시민과 함께하는 다양한 현대미술" }
];

export default function NewsroomPage() {
    const searchParams = useSearchParams();
    const vipId = searchParams.get("vipId") || "";
    const [allNews, setAllNews] = useState<NewsItem[]>([]);
    const [displayedNews, setDisplayedNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [itemsToShow, setItemsToShow] = useState(10);

    useEffect(() => {
        async function fetchNews() {
            try {
                // 사이트 설정 로드
                const siteData = await (vipId ? loadSettingsById(vipId) : loadSettings());
                setSettings(siteData);

                // 최적화된 내부 API 호출 (ISR 적용됨)
                const response = await fetch('/api/news');
                if (!response.ok) throw new Error("Failed to fetch news");

                const data = await response.json();

                setAllNews(data);
                // 광속 로딩을 위해 처음에는 5개만 즉시 표시
                setDisplayedNews(data.slice(0, 5));
                setItemsToShow(5);
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNews();
        fetchNews();
    }, [vipId]);

    const borderColor = settings.theme === "black" ? "#333" : "#eee";
    const textColor = settings.theme === "black" ? "#fff" : "#000";
    const mutedColor = settings.theme === "black" ? "#888" : "#666";
    const bgColor = settings.theme === "black" ? "#000" : "#fff";
    const cardBgColor = settings.theme === "black" ? "#111" : "#fafafa";

    return (
        <div style={{ minHeight: "100vh", backgroundColor: bgColor, color: textColor, paddingBottom: "100px", fontFamily: "'Noto Sans KR', sans-serif" }}>
            <header style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${borderColor}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                backgroundColor: bgColor,
                zIndex: 100
            }}>
                <Link href={vipId ? `/gallery-${vipId}` : "/"} style={{ textDecoration: "none", color: textColor, display: "flex", alignItems: "center", width: "40px" }}>
                    <span style={{ fontSize: "20px" }}>🏠</span>
                </Link>
                <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>미술계 소식통</h1>
                <div style={{ display: "flex", justifyContent: "flex-end", width: "40px" }}>
                    <button
                        onClick={async () => {
                            const shareData = {
                                title: "미술계 소식통 - 실시간 미술 정보",
                                text: "작가님들을 위한 실시간 미술계 동향과 전시/공모전 소식을 확인해보세요.",
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
                            color: textColor
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
                <div style={{ marginBottom: "48px" }}>
                    <p style={{
                        fontSize: "14px",
                        color: SIGNATURE_COLORS.antiqueBurgundy,
                        fontWeight: 700,
                        marginBottom: "12px",
                        letterSpacing: "0.05em"
                    }}>
                        REAL-TIME ART FEED
                    </p>
                    <h2 style={{
                        fontSize: "32px",
                        fontWeight: 800,
                        lineHeight: 1.25,
                        letterSpacing: "-0.03em",
                        wordBreak: "keep-all"
                    }}>
                        작가님을 위한<br />
                        실시간 미술계 동향
                    </h2>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "100px 0" }}>
                        <div style={{
                            width: "40px",
                            height: "40px",
                            border: `3px solid ${borderColor}`,
                            borderTopColor: SIGNATURE_COLORS.antiqueBurgundy,
                            borderRadius: "50%",
                            margin: "0 auto 20px",
                            animation: "spin 1s linear infinite"
                        }} />
                        <p style={{ color: mutedColor }}>소식을 불러오는 중입니다...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {displayedNews.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", border: `2px dashed ${borderColor}`, borderRadius: "24px" }}>
                                    <p style={{ color: mutedColor }}>현재 업데이트된 소식이 없습니다.</p>
                                </div>
                            ) : (
                                displayedNews.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            textDecoration: "none",
                                            color: "inherit",
                                            padding: "28px",
                                            borderRadius: "24px",
                                            border: `1px solid ${borderColor}`,
                                            display: "block",
                                            backgroundColor: cardBgColor,
                                            transition: "transform 0.2s ease"
                                        }}
                                    >
                                        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
                                            <span style={{
                                                fontSize: "11px",
                                                fontWeight: 800,
                                                padding: "3px 8px",
                                                borderRadius: "6px",
                                                backgroundColor: SIGNATURE_COLORS.antiqueBurgundy,
                                                color: "#fff"
                                            }}>
                                                {item.category}
                                            </span>
                                            <span style={{ fontSize: "12px", color: mutedColor }}>{item.source}</span>
                                        </div>
                                        <h3 style={{
                                            fontSize: "19px",
                                            fontWeight: 700,
                                            lineHeight: 1.5,
                                            margin: "0 0 16px 0",
                                            wordBreak: "keep-all"
                                        }}>
                                            {item.title}
                                        </h3>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "13px", color: mutedColor }}>
                                                {new Date(item.pubDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                                            </span>
                                            <span style={{ fontSize: "14px", fontWeight: 500, color: mutedColor }}>원문 보기 →</span>
                                        </div>
                                    </a>
                                ))
                            )}
                        </div>

                        {/* 더 보기 버튼 */}
                        {displayedNews.length < allNews.length && (
                            <div style={{ textAlign: "center", marginTop: "32px" }}>
                                <button
                                    onClick={() => {
                                        const nextItems = itemsToShow + 10;
                                        setItemsToShow(nextItems);
                                        setDisplayedNews(allNews.slice(0, nextItems));
                                    }}
                                    style={{
                                        padding: "16px 48px",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        color: "#fff",
                                        background: SIGNATURE_COLORS.antiqueBurgundy,
                                        border: "none",
                                        borderRadius: "12px",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        boxShadow: "0 4px 12px rgba(128, 48, 48, 0.3)"
                                    }}
                                >
                                    더 많은 소식 보기 ({allNews.length - displayedNews.length}개)
                                </button>
                            </div>
                        )}

                        <div style={{ marginTop: "64px" }}>
                            <h4 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>주요 미술 기관 바로가기</h4>
                            <div style={{ display: "grid", gap: "12px" }}>
                                {CURATED_LINKS.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            textDecoration: "none",
                                            color: "inherit",
                                            padding: "20px",
                                            borderRadius: "20px",
                                            border: `1px solid ${borderColor}`,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 2px 0" }}>{link.name}</p>
                                            <p style={{ fontSize: "12px", color: mutedColor, margin: 0 }}>{link.desc}</p>
                                        </div>
                                        <span style={{ color: SIGNATURE_COLORS.antiqueBurgundy }}>↗</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* 공유 모달 */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                title="미술계 소식통 - 실시간 미술 정보"
                description="작가님들을 위한 실시간 미술계 동향과 전시/공모전 소식을 확인해보세요."
                theme={settings.theme}
            />
        </div>
    );
}
