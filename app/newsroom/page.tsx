"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadSettings } from "../utils/settingsDb";
import { defaultSiteConfig, SiteConfig } from "../config/site";

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
        name: "미술 소식 - 전시",
        rss: "https://news.google.com/rss/search?q=%EB%AF%B8%EC%88%A0+%EC%A0%84%EC%8B%9C&hl=ko&gl=KR&ceid=KR:ko",
        category: "전시정보",
    },
    {
        name: "미술 소식 - 공모전",
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
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);

    useEffect(() => {
        async function fetchNews() {
            try {
                const siteData = await loadSettings();
                setSettings(siteData);

                let allNews: NewsItem[] = [];

                for (const src of SOURCES) {
                    try {
                        // AllOrigins 프록시를 사용하여 CORS 문제 해결 및 XML 자체 파싱
                        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(src.rss)}`);
                        if (!response.ok) continue;

                        const data = await response.json();
                        const xmlContent = data.contents;

                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
                        const items = xmlDoc.querySelectorAll("item");

                        const parsedItems = Array.from(items).slice(0, 10).map((item) => {
                            const title = item.querySelector("title")?.textContent || "제목 없음";
                            const link = item.querySelector("link")?.textContent || "#";
                            const pubDate = item.querySelector("pubDate")?.textContent || new Date().toISOString();

                            // 제목에서 " - 출처" 부분 제거 (구글 뉴스 특유의 포맷)
                            const cleanTitle = title.split(" - ")[0];
                            const sourceFromTitle = title.split(" - ")[1] || src.name;

                            return {
                                title: cleanTitle,
                                link: link,
                                pubDate: pubDate,
                                source: sourceFromTitle,
                                category: src.category,
                                description: ""
                            };
                        });
                        allNews.push(...parsedItems);
                    } catch (e) {
                        console.error(`Failed to fetch from ${src.name}:`, e);
                    }
                }

                // 중복 제거 및 정렬
                const uniqueNews = Array.from(new Map(allNews.map(item => [item.title, item])).values());
                uniqueNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
                setNews(uniqueNews.slice(0, 15));
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNews();
    }, []);

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
                <Link href="/" style={{ textDecoration: "none", color: textColor, display: "flex", alignItems: "center", width: "40px" }}>
                    <span style={{ fontSize: "20px" }}>🏠</span>
                </Link>
                <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>미술계 소식통</h1>
                <div style={{ width: "40px" }} />
            </header>

            <main style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
                <div style={{ marginBottom: "48px" }}>
                    <p style={{
                        fontSize: "14px",
                        color: "#6366f1",
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
                            borderTopColor: "#6366f1",
                            borderRadius: "50%",
                            margin: "0 auto 20px",
                            animation: "spin 1s linear infinite"
                        }} />
                        <p style={{ color: mutedColor }}>소식을 불러오는 중입니다...</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {news.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", border: `2px dashed ${borderColor}`, borderRadius: "24px" }}>
                                    <p style={{ color: mutedColor }}>현재 업데이트된 소식이 없습니다.</p>
                                </div>
                            ) : (
                                news.map((item, idx) => (
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
                                                backgroundColor: "#6366f1",
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
                                            <span style={{ fontSize: "14px", fontWeight: 600, color: "#6366f1" }}>원문 보기 →</span>
                                        </div>
                                    </a>
                                ))
                            )}
                        </div>

                        <div style={{ marginTop: "64px" }}>
                            <h4 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>🏛️ 주요 미술 기관 바로가기</h4>
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
                                        <span style={{ color: "#6366f1" }}>↗</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
