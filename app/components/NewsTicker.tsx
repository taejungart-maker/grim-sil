"use client";

import { useEffect, useState } from "react";
import { getThemeColors, SIGNATURE_COLORS } from "../utils/themeColors";
import { loadRecentNews } from "../utils/networkDb";

interface NewsItem {
    id: string;
    text: string;
}

interface NewsTickerProps {
    theme: "white" | "black";
    newsText?: string;
}

const MOCK_NEWS: NewsItem[] = [
    { id: "1", text: "상생 네트워크가 전하는 최신 전시 소식입니다." },
];

export default function NewsTicker({ theme, newsText }: NewsTickerProps) {
    const [automatedNews, setAutomatedNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        loadRecentNews().then(news => {
            if (news && news.length > 0) {
                setAutomatedNews(news);
            }
        });
    }, []);

    const displayNews = newsText
        ? [{ id: "custom", text: newsText }]
        : (automatedNews.length > 0 ? automatedNews : MOCK_NEWS);

    if (displayNews.length === 0) return null;

    const colors = getThemeColors(theme);
    const bgColor = colors.bg;
    const textColor = colors.text;
    const accentColor = theme === "black" ? "#666" : SIGNATURE_COLORS.royalIndigo;

    return (
        <div
            style={{
                width: "100%",
                backgroundColor: bgColor,
                padding: "8px 0",
                overflow: "hidden",
                position: "relative",
                borderBottom: `1px solid ${theme === "black" ? "#333" : "#e5e5e5"}`,
            }}
        >
            <div
                style={{
                    display: "flex",
                    whiteSpace: "nowrap",
                    animation: "ticker 30s linear infinite",
                    paddingLeft: "100%",
                }}
            >
                {displayNews.map((item, index) => (
                    <span
                        key={item.id}
                        style={{
                            paddingRight: "60px",
                            fontSize: "14px",
                            fontFamily: "'Noto Sans KR', sans-serif",
                            color: textColor,
                            display: "flex",
                            alignItems: "center",
                            fontWeight: 500,
                        }}
                    >
                        <span style={{ marginRight: "12px", color: accentColor, opacity: 0.5 }}>|</span>
                        {item.text}
                    </span>
                ))}
                {/* 무한 반복을 위한 충분한 복제 */}
                {Array.from({ length: 10 }).map((_, i) =>
                    displayNews.map((item) => (
                        <span
                            key={`${item.id}-dup-${i}`}
                            style={{
                                paddingRight: "60px",
                                fontSize: "14px",
                                fontFamily: "'Noto Sans KR', sans-serif",
                                color: textColor,
                                display: "flex",
                                alignItems: "center",
                                fontWeight: 500,
                            }}
                        >
                            <span style={{ marginRight: "12px", color: accentColor, opacity: 0.5 }}>|</span>
                            {item.text}
                        </span>
                    ))
                )}
            </div>

            <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    );
}
