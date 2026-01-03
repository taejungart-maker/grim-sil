"use client";

import { useMemo, useState } from "react";

import { SIGNATURE_COLORS } from "../utils/themeColors";

interface ArtistPick {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    archiveUrl: string;
}

interface ArtistPicksSectionProps {
    theme: "white" | "black";
    picks?: { name: string; archiveUrl: string; imageUrl?: string }[];
    isAuthenticated?: boolean;
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop";

const MOCK_PICKS = [
    {
        name: "문혜경 작가",
        archiveUrl: "#",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"
    },
    {
        name: "황미경 작가",
        archiveUrl: "#",
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
    },
    {
        name: "김화문 작가",
        archiveUrl: "#",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
    }
];

export default function ArtistPicksSection({ theme, picks = [], isAuthenticated = false }: ArtistPicksSectionProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const displayPicks = useMemo(() => {
        const basePicks = picks.length > 0 ? picks : MOCK_PICKS;
        return [...basePicks].sort(() => Math.random() - 0.5);
    }, [picks]);

    // 검색어로 필터링
    const filteredPicks = useMemo(() => {
        if (!searchQuery.trim()) return displayPicks;
        return displayPicks.filter(pick =>
            pick.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [displayPicks, searchQuery]);

    const bgColor = theme === "black" ? "#1a1a1a" : SIGNATURE_COLORS.agingPaper;
    const textColor = theme === "black" ? "#ffffff" : SIGNATURE_COLORS.inkCharcoal;
    const borderColor = theme === "black" ? "#333" : SIGNATURE_COLORS.sandGray;

    return (
        <section
            style={{
                padding: "48px 24px",
                backgroundColor: bgColor,
                borderTop: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
            }}
        >
            <div className="max-w-6xl mx-auto">
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <h2
                        style={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: textColor,
                            fontFamily: "'Noto Sans KR', sans-serif",
                            marginBottom: "8px"
                        }}
                    >
                        함께 활동하는 동행 작가
                    </h2>
                    <p style={{ color: SIGNATURE_COLORS.sandGray, fontSize: "12px", marginBottom: "20px" }}>
                        서로 응원하며 함께 성장하는 작가 네트워크입니다.
                    </p>

                    {/* 검색 입력란 */}
                    <div style={{
                        maxWidth: "400px",
                        margin: "0 auto",
                        position: "relative"
                    }}>
                        <input
                            type="text"
                            placeholder="작가 이름으로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 40px 12px 16px",
                                borderRadius: "24px",
                                border: `2px solid ${borderColor}`,
                                backgroundColor: theme === "black" ? "#2a2a2a" : "#ffffff",
                                color: textColor,
                                fontSize: "14px",
                                outline: "none",
                                transition: "all 0.2s ease",
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = SIGNATURE_COLORS.royalIndigo;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = borderColor;
                            }}
                        />
                        {/* 검색 아이콘 버튼 */}
                        <div
                            style={{
                                position: "absolute",
                                right: "8px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                backgroundColor: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#e8e8e8";
                                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#f0f0f0";
                                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={searchQuery.trim() ? SIGNATURE_COLORS.royalIndigo : "#666"}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    transition: "stroke 0.3s ease"
                                }}
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* 검색 결과가 없을 때 */}
                {filteredPicks.length === 0 && (
                    <div style={{
                        textAlign: "center",
                        padding: "48px 24px",
                        color: SIGNATURE_COLORS.sandGray,
                        fontSize: "14px"
                    }}>
                        <p>"{searchQuery}"에 해당하는 작가가 없습니다.</p>
                    </div>
                )}

                {/* 4열 그리드 레이아웃 (모바일: 2열) */}
                {filteredPicks.length > 0 && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "16px"
                        }}
                        className="grid-cols-2 sm:grid-cols-4"
                    >
                        {filteredPicks.slice(0, 8).map((pick, index) => (
                            <div
                                key={index}
                                style={{
                                    backgroundColor: theme === "black" ? "#2a2a2a" : "#ffffff",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    boxShadow: `0 2px 12px ${theme === "black" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)"}`,
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                    border: `1px solid ${borderColor}`
                                }}
                                className="group hover:-translate-y-1 hover:shadow-lg"
                                onClick={() => {
                                    if (pick.archiveUrl && pick.archiveUrl !== "#") {
                                        window.open(pick.archiveUrl, "_blank");
                                    } else {
                                        alert(`${pick.name}님의 아카이브 주소가 아직 등록되지 않았습니다.`);
                                    }
                                }}
                            >
                                {/* 컴팩트한 원형 프로필 이미지 */}
                                <div style={{
                                    padding: "16px 16px 8px 16px",
                                    display: "flex",
                                    justifyContent: "center"
                                }}>
                                    <div style={{
                                        position: "relative",
                                        width: "64px",
                                        height: "64px",
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        border: `2px solid ${borderColor}`
                                    }}>
                                        <img
                                            src={pick.imageUrl ? `${pick.imageUrl}?t=${Date.now()}` : DEFAULT_IMAGE}
                                            alt={pick.name}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                transition: "transform 0.3s ease"
                                            }}
                                            className="group-hover:scale-110"
                                        />
                                    </div>
                                </div>
                                {/* 컴팩트한 텍스트 영역 */}
                                <div style={{ padding: "8px 12px 16px 12px", textAlign: "center" }}>
                                    <h3 style={{
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        marginBottom: "4px",
                                        color: textColor,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {pick.name}
                                    </h3>
                                    <div style={{
                                        fontSize: "11px",
                                        fontWeight: 500,
                                        color: SIGNATURE_COLORS.royalIndigo,
                                        opacity: 0.8
                                    }}>
                                        방문 →
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
