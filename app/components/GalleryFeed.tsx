"use client";

import { CSSProperties } from "react";
import Link from "next/link";
import ArtworkCard from "./ArtworkCard";
import { Artwork } from "../data/artworks";

interface GalleryFeedProps {
    artworks: Artwork[];
    isLoading: boolean;
    gridColumns: number;
    onArtworkClick: (artwork: Artwork, index: number) => void;
    selectedYearMonth: string | null;
}

export default function GalleryFeed({
    artworks,
    isLoading,
    gridColumns,
    onArtworkClick,
    selectedYearMonth,
}: GalleryFeedProps) {
    if (isLoading) {
        return (
            <div className="text-center py-20" style={{ color: "#888" }}>
                <p style={{ fontSize: "14px" }}>불러오는 중...</p>
            </div>
        );
    }

    if (artworks.length === 0) {
        return (
            <div className="text-center py-20" style={{ color: "#666" }}>
                <p style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>◻</p>
                <p style={{ fontSize: "15px", color: "#1a1a1a", marginBottom: "8px" }}>
                    {selectedYearMonth ? "선택된 기간에 작품이 없습니다" : "아직 등록된 작품이 없습니다"}
                </p>
                {!selectedYearMonth && (
                    <>
                        <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>첫 번째 작품을 추가해보세요</p>
                        <Link href="/add" className="inline-flex items-center justify-center" style={{ padding: "14px 32px", fontSize: "14px", fontWeight: 500, color: "#fff", background: "#1a1a1a", borderRadius: "6px", textDecoration: "none" }}>+ 작품 추가</Link>
                    </>
                )}
            </div>
        );
    }

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: gridColumns === 1 ? "1fr" : gridColumns === 3 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
            gridAutoRows: gridColumns === 1 ? "auto" : "180px",
            gap: gridColumns === 1 ? "24px" : "8px",
        }}>
            {artworks.map((artwork, index) => {
                let gridStyle: CSSProperties = {};

                // ⚠️⚠️⚠️ [CRITICAL] 12월 25일 승인된 디자인 패턴 - 절대 수정 금지 ⚠️⚠️⚠️
                if (gridColumns >= 3 && artworks.length > 1) {
                    if (index === 0) {
                        gridStyle = {
                            gridColumn: "span 2",
                            gridRow: "span 2",
                        };
                    } else if (index === 5) {
                        gridStyle = {
                            gridRow: "span 2",
                        };
                    } else if (index === 6) {
                        gridStyle = {
                            gridColumn: "span 2",
                        };
                    } else if (index === 7) {
                        gridStyle = {
                            gridRow: "span 2",
                        };
                    }
                } else if (gridColumns === 1) {
                    gridStyle = { aspectRatio: "16/10" };
                }

                return (
                    <div key={artwork.id} style={gridStyle}>
                        <ArtworkCard
                            artwork={artwork}
                            onClick={() => onArtworkClick(artwork, index)}
                            priority={index < 6}
                            minimal
                        />
                    </div>
                );
            })}
        </div>
    );
}
