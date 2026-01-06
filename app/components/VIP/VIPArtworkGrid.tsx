"use client";

import { Artwork } from "../../data/artworks";
import ArtworkCard from "../ArtworkCard";

interface VIPArtworkGridProps {
    artworks: Artwork[];
    shuffledArtworks: Artwork[];
    gridColumns: number;
    onArtworkClick: (artwork: Artwork, index: number) => void;
}

export default function VIPArtworkGrid({
    artworks,
    shuffledArtworks,
    gridColumns,
    onArtworkClick
}: VIPArtworkGridProps) {
    if (artworks.length === 0) {
        return (
            <div className="text-center py-24">
                <p style={{ color: "#888", fontSize: "18px" }}>아직 등록된 작품이 없습니다.</p>
            </div>
        );
    }

    return (
        <div
            className={`gap-6 sm:gap-8 ${gridColumns === 1 ? 'columns-1 max-w-2xl mx-auto' :
                gridColumns === 3 ? 'columns-1 sm:columns-2 lg:columns-3' :
                    'columns-1 sm:columns-2 lg:columns-4'
                }`}
            style={{ columnGap: '24px' }}
        >
            {shuffledArtworks.map((artwork, index) => (
                <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    onClick={() => onArtworkClick(artwork, index)}
                />
            ))}
        </div>
    );
}
