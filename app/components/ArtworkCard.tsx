"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Artwork } from "../data/artworks";
import { SIGNATURE_COLORS } from "../utils/themeColors";

interface ArtworkCardProps {
    artwork: Artwork;
    onClick: () => void;
    priority?: boolean;
    minimal?: boolean;
    showInfo?: boolean;
}

export default function ArtworkCard({
    artwork,
    onClick,
    priority = false,
    minimal = false,
    showInfo = true // 도록 스타일에서는 정보를 기본적으로 표시하는 것이 더 정중함
}: ArtworkCardProps) {
    const [imageUrl, setImageUrl] = useState(artwork.imageUrl);
    const [imageLoading, setImageLoading] = useState(false); // 이미지 로딩 비활성화

    // 이미지 로딩 비활성화 (Base64가 너무 커서 타임아웃)
    // TODO: Supabase Storage로 마이그레이션 후 재활성화
    useEffect(() => {
        // 우선적으로 썸네일 사용, 없으면 원본 이미지 사용
        setImageUrl(artwork.thumbnailUrl || artwork.imageUrl);
    }, [artwork.imageUrl, artwork.thumbnailUrl]);

    // 원본 이미지 프리패칭 함수
    const prefetchOriginal = () => {
        if (artwork.imageUrl && artwork.thumbnailUrl) {
            const img = new (window as any).Image();
            img.src = artwork.imageUrl;
        }
    };

    if (minimal) {
        // 미니멀 스타일 - PKM Gallery Masonry 레이아웃용 (시니어 친화적 개선)
        return (
            <button
                onClick={onClick}
                onMouseEnter={prefetchOriginal}
                className="group"
                aria-label={`${artwork.title} 보기`}
                style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    background: SIGNATURE_COLORS.agingPaper,
                    overflow: "hidden",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                }}
            >
                {imageLoading ? (
                    <div style={{ width: "100%", height: "100%", background: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#999" }}>로딩...</span>
                    </div>
                ) : imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={artwork.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        priority={priority}
                        style={{
                            objectFit: "cover",
                            transition: "transform 0.3s ease",
                            userSelect: "none"
                        }}
                        className="group-hover:scale-105"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", background: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "#999" }}>이미지 없음</span>
                    </div>
                )}
                {/* 정보 오버레이 - 잡지 레이아웃처럼 정갈하게 */}
                <div
                    className={showInfo ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "32px 24px",
                        background: "linear-gradient(transparent, rgba(245, 242, 237, 0.95))", // 에이징 페이퍼 색상 반영
                        transition: "opacity 0.4s ease",
                    }}
                >
                    <p style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--foreground)",
                        fontSize: "22px",
                        fontWeight: 600,
                        marginBottom: "8px",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.3,
                    }}>
                        {artwork.title}
                    </p>
                    <p style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--text-muted)",
                        fontSize: "16px",
                        fontWeight: 400,
                        fontStyle: "italic",
                    }}>
                        {artwork.year}
                    </p>
                </div>
            </button>
        );
    }

    // 기존 스타일 (큰 오버레이) - 시니어 친화적 개선
    return (
        <button
            className="artwork-card"
            onClick={onClick}
            onMouseEnter={prefetchOriginal}
            aria-label={`${artwork.title} 보기`}
        >
            {imageLoading ? (
                <div style={{ position: "absolute", inset: 0, background: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#999" }}>로딩...</span>
                </div>
            ) : imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={artwork.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    priority={priority}
                    style={{
                        objectFit: "cover",
                        userSelect: "none"
                    }}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                />
            ) : (
                <div style={{ position: "absolute", inset: 0, background: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#999" }}>이미지 없음</span>
                </div>
            )}
            <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                    background: "linear-gradient(transparent, var(--background))",
                    padding: "32px 24px",
                }}
            >
                <p
                    style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--foreground)",
                        fontSize: "24px",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.4,
                    }}
                >
                    {artwork.title}
                </p>
                <p
                    style={{
                        fontFamily: "var(--font-serif)",
                        color: "var(--text-muted)",
                        fontSize: "16px",
                        fontWeight: 400,
                        marginTop: "6px",
                    }}
                >
                    {artwork.year} · {artwork.medium}
                </p>
            </div>
        </button>
    );
}
