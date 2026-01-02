"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Artwork } from "../data/artworks";
import { supabase } from "../utils/supabase";
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
    showInfo = false
}: ArtworkCardProps) {
    const [imageUrl, setImageUrl] = useState(artwork.imageUrl);
    const [imageLoading, setImageLoading] = useState(false); // 이미지 로딩 비활성화

    // 이미지 로딩 비활성화 (Base64가 너무 커서 타임아웃)
    // TODO: Supabase Storage로 마이그레이션 후 재활성화
    useEffect(() => {
        // 이미지가 있으면 사용, 없으면 그냥 빈 상태로 둠
        if (artwork.imageUrl) {
            setImageUrl(artwork.imageUrl);
        }
    }, [artwork.imageUrl]);

    if (minimal) {
        // 미니멀 스타일 - PKM Gallery Masonry 레이아웃용 (시니어 친화적 개선)
        return (
            <button
                onClick={onClick}
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
                {/* 정보 오버레이 - showInfo이면 항상 표시, 아니면 호버 시만 */}
                <div
                    className={showInfo ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: showInfo ? "24px" : "20px",
                        background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                        transition: "opacity 0.3s ease",
                    }}
                >
                    <p style={{
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: "#fff",
                        fontSize: showInfo ? "20px" : "17px",
                        fontWeight: 600,
                        marginBottom: "6px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.4,
                    }}>
                        {artwork.title}
                    </p>
                    <p style={{
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: "rgba(255,255,255,0.9)",
                        fontSize: showInfo ? "16px" : "14px",
                        fontWeight: 500,
                    }}>
                        {artwork.year}년
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
                    background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                    padding: "24px 20px",
                }}
            >
                <p
                    className="text-white font-semibold truncate"
                    style={{
                        fontFamily: "'Noto Sans KR', sans-serif",
                        fontSize: "20px",
                        fontWeight: 600,
                        lineHeight: 1.4,
                    }}
                >
                    {artwork.title}
                </p>
                <p
                    style={{
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: "rgba(255,255,255,0.85)",
                        fontSize: "15px",
                        fontWeight: 500,
                        marginTop: "4px",
                    }}
                >
                    {artwork.year}년 · {artwork.medium}
                </p>
            </div>
        </button>
    );
}
