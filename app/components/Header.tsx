"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { isAlwaysFreeMode } from "../utils/deploymentMode";

interface HeaderProps {
    galleryNameKo: string;
    theme: "white" | "black";
    isLoggedIn: boolean;
    isPaid: boolean;
    needsPayment: boolean;
    onLogout: () => void;
    onOpenPayment: () => void;
    onKakaoShare: () => void;
}

export default function Header({
    galleryNameKo,
    theme,
    isLoggedIn,
    isPaid,
    needsPayment,
    onLogout,
    onOpenPayment,
    onKakaoShare
}: HeaderProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // [절대 금지 구역] 하현주, 문혜경, 황미경 작가님 사이트에서는 어떤 경우에도 구독 버튼이 보이지 않도록 이중 보안
    const isFreeArtistHost = typeof window !== 'undefined' &&
        (window.location.hostname.includes('hahyunju') ||
            window.location.hostname.includes('moonhyekyung') ||
            window.location.hostname.includes('hwangmikyung'));

    if (!isMounted) return null;

    const bgColor = theme === "black" ? "#1a1a1a" : "#fafafa";
    const textColor = theme === "black" ? "#ffffff" : "#1a1a1a";
    const borderColor = theme === "black" ? "#333" : "#eee";

    return (
        <header
            className="sticky top-0 z-30"
            style={{
                background: bgColor,
                borderBottom: `1px solid ${borderColor}`,
            }}
        >
            {/* 상단: 로고 + 설정 */}
            <div
                className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6"
                style={{
                    paddingTop: "16px",
                    paddingBottom: "12px",
                }}
            >
                {/* 로고 - 브랜드 컬러 */}
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
                    <span
                        className="text-xl sm:text-2xl"
                        style={{
                            fontFamily: "'Noto Sans KR', sans-serif",
                            fontWeight: 600,
                            letterSpacing: "0.03em",
                            color: theme === "black" ? "#ffffff" : "#8b7355",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {galleryNameKo}
                    </span>
                </Link>

                {/* 설정 + 로그아웃 버튼 */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* 로그아웃 버튼 (로그인 시 & 마운트 시에만 표시) */}
                    {isMounted && isLoggedIn && (
                        <button
                            onClick={onLogout}
                            style={{
                                padding: "0",
                                fontSize: "13px",
                                fontFamily: "'Noto Sans KR', sans-serif",
                                fontWeight: 500,
                                color: theme === "black" ? "#999" : "#999",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                            }}
                            aria-label="로그아웃"
                        >
                            Logout
                        </button>
                    )}

                    <Link
                        href="/admin"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            color: theme === "black" ? "#888" : "#666",
                            textDecoration: "none",
                        }}
                        aria-label="설정"
                        title="갤러리 설정"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* 하단: 작가소개 + 미술 소식 + 구독하기 + 화첩 공유 */}
            <div
                className="max-w-6xl mx-auto px-4 sm:px-6"
                style={{
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    borderTop: `1px solid ${borderColor}`,
                }}
            >
                <div
                    className="flex items-center justify-between sm:justify-start"
                    style={{ gap: "12px" }}
                >
                    {/* 왼쪽 그룹: 작가소개 + 미술 소식 */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* 작가소개 */}
                        <Link
                            href="/about"
                            className="text-sm sm:text-base"
                            style={{
                                textDecoration: "none",
                                fontFamily: "'Noto Sans KR', sans-serif",
                                color: theme === "black" ? "#ffffff" : "#2a2a2a",
                                fontWeight: 500,
                                letterSpacing: "0.02em",
                                whiteSpace: "nowrap"
                            }}
                        >
                            작가소개
                        </Link>

                        {/* 미술 소식 */}
                        <Link
                            href="/newsroom"
                            className="text-sm sm:text-base"
                            style={{
                                textDecoration: "none",
                                fontFamily: "'Noto Sans KR', sans-serif",
                                color: theme === "black" ? "#ffffff" : "#2a2a2a",
                                fontWeight: 500,
                                letterSpacing: "0.02em",
                                whiteSpace: "nowrap"
                            }}
                        >
                            미술 소식
                        </Link>
                    </div>

                    {/* [ZERO_CACHE_FORCE] 구조 변경으로 캐시 무력화 */}
                    <div id="nav-actions-container-v2" className="flex items-center gap-2 sm:gap-3 sm:ml-auto">
                        {/* 구독하기 버튼 - 호스트네임 하드 가드 (V2) */}
                        {isMounted && !isPaid && !isAlwaysFreeMode() && !isFreeArtistHost && (
                            <button
                                id="force-sub-btn-v2"
                                onClick={onOpenPayment}
                                className="flex items-center gap-1"
                                style={{
                                    padding: "7px 14px",
                                    backgroundColor: "#6366f1",
                                    backgroundImage: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    color: "#ffffff",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    letterSpacing: "0.01em",
                                    whiteSpace: "nowrap",
                                    boxShadow: "0 4px 10px rgba(99, 102, 241, 0.3)",
                                }}
                            >
                                <span className="hidden sm:inline">구독하기</span>
                                <span className="sm:hidden">구독</span>
                            </button>
                        )}

                        {/* 화첩 공유 버튼 (Native API 우선) */}
                        <button
                            id="header-share-btn-v2"
                            onClick={onKakaoShare}
                            className="flex items-center gap-1.5"
                            style={{
                                padding: "6px 12px",
                                background: "#FEE500",
                                color: "#2a2a2a",
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "'Noto Sans KR', sans-serif",
                                fontWeight: 500,
                                fontSize: "13px",
                                letterSpacing: "0.02em",
                                whiteSpace: "nowrap",
                                boxShadow: "0 2px 6px rgba(254, 229, 0, 0.3)",
                            }}
                            aria-label="화첩 공유"
                        >
                            <span className="hidden sm:inline">화첩 공유</span>
                            <span className="sm:hidden">공유</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
