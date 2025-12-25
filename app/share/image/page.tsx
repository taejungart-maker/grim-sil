"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loadSettings } from "../../utils/settingsDb";
import { SiteConfig, defaultSiteConfig } from "../../config/site";
import { getAllArtworks } from "../../utils/db";
import { Artwork } from "../../data/artworks";

// SNS 플랫폼별 크기
const platforms = [
    { id: "instagram-square", name: "인스타그램 정사각형", width: 1080, height: 1080, icon: "📸" },
    { id: "instagram-portrait", name: "인스타그램 세로", width: 1080, height: 1350, icon: "📱" },
    { id: "facebook", name: "페이스북", width: 1200, height: 630, icon: "👍" },
    { id: "tiktok", name: "틱톡/릴스", width: 1080, height: 1920, icon: "🎵" },
];

export default function SNSImagePage() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        loadSettings().then(setSettings);
        getAllArtworks().then((data) => {
            setArtworks(data);
            if (data.length > 0) setSelectedArtwork(data[0]);
        });
    }, []);

    const bgColor = settings.theme === "black" ? "#1a1a1a" : "#fafafa";
    const textColor = settings.theme === "black" ? "#ffffff" : "#1a1a1a";

    // 이미지 다운로드
    const downloadImage = async () => {
        if (!selectedArtwork || !canvasRef.current) return;

        setIsGenerating(true);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = selectedPlatform.width;
        canvas.height = selectedPlatform.height;

        // 배경
        ctx.fillStyle = settings.theme === "black" ? "#1a1a1a" : "#fafafa";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 작품 이미지 로드 및 그리기
        const img = document.createElement("img");
        img.crossOrigin = "anonymous";
        img.src = selectedArtwork.imageUrl;

        await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });

        // 이미지를 중앙에 맞추기
        const isFacebook = selectedPlatform.id === "facebook";

        let padding, maxWidth, maxHeight, x, y, imgWidth, imgHeight;

        if (isFacebook) {
            // 페이스북: 오른쪽에 크게, 텍스트는 왼쪽
            padding = 40;
            maxWidth = canvas.width * 0.70;  // 오른쪽 70%
            maxHeight = canvas.height - padding * 2;

            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            imgWidth = img.width * scale;
            imgHeight = img.height * scale;
            x = canvas.width - imgWidth - padding;  // 오른쪽 배치
            y = (canvas.height - imgHeight) / 2;
        } else {
            // 기본 레이아웃
            padding = 60;
            maxWidth = canvas.width - padding * 2;
            maxHeight = canvas.height - padding * 2 - 100;

            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            imgWidth = img.width * scale;
            imgHeight = img.height * scale;
            x = (canvas.width - imgWidth) / 2;
            y = (canvas.height - imgHeight - 80) / 2;
        }

        // 그림자
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
        ctx.shadowColor = "transparent";

        // 작가 정보
        if (isFacebook) {
            // 페이스북: 왼쪽 중앙에 텍스트
            const textX = padding + 20;
            const textY = canvas.height / 2;

            ctx.textAlign = "left";
            ctx.fillStyle = textColor;
            ctx.font = "bold 28px sans-serif";
            ctx.fillText(selectedArtwork.title, textX, textY - 20);

            ctx.font = "20px sans-serif";
            ctx.fillStyle = settings.theme === "black" ? "#bbb" : "#666";
            ctx.fillText(settings.artistName, textX, textY + 15);
            ctx.fillText(settings.galleryNameKo, textX, textY + 45);
        } else {
            // 기본 (인스타/릴스 등): 하단 중앙에 텍스트 (다중 라인으로 변경하여 가독성 업)
            ctx.textAlign = "center";

            // 작품 제목
            ctx.fillStyle = textColor;
            ctx.font = "bold 32px sans-serif";
            ctx.fillText(selectedArtwork.title, canvas.width / 2, canvas.height - 110);

            // 작가명
            ctx.font = "24px sans-serif";
            ctx.fillStyle = settings.theme === "black" ? "#bbb" : "#666";
            ctx.fillText(settings.artistName, canvas.width / 2, canvas.height - 70);

            // 갤러리명
            ctx.font = "20px sans-serif";
            ctx.fillText(settings.galleryNameKo, canvas.width / 2, canvas.height - 35);
        }

        // 다운로드
        const link = document.createElement("a");
        link.download = `${selectedArtwork.title}_${selectedPlatform.id}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        setIsGenerating(false);
    };

    return (
        <div
            className="min-h-screen"
            style={{ background: bgColor, color: textColor }}
        >
            {/* 숨겨진 캔버스 */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* 헤더 */}
            <header
                style={{
                    padding: "20px 24px",
                    borderBottom: `1px solid ${settings.theme === "black" ? "#333" : "#eee"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                }}
            >
                <button
                    onClick={() => router.push("/share")}
                    style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: settings.theme === "black" ? "#333" : "#f3f4f6",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "20px",
                    }}
                >
                    ←
                </button>
                <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
                    📸 SNS 이미지 저장
                </h1>
            </header>

            <main
                className="max-w-2xl mx-auto"
                style={{ padding: "24px" }}
            >
                {/* 1. 작품 선택 */}
                <section style={{ marginBottom: "32px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
                        1️⃣ 작품 선택
                    </h2>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "8px",
                        }}
                    >
                        {artworks.slice(0, 8).map((artwork) => (
                            <button
                                key={artwork.id}
                                onClick={() => setSelectedArtwork(artwork)}
                                style={{
                                    aspectRatio: "1",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    border: selectedArtwork?.id === artwork.id
                                        ? "3px solid #2196f3"
                                        : "2px solid transparent",
                                    cursor: "pointer",
                                    padding: 0,
                                    position: "relative",
                                }}
                            >
                                <Image
                                    src={artwork.imageUrl}
                                    alt={artwork.title}
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </button>
                        ))}
                    </div>
                </section>

                {/* 2. 플랫폼 선택 */}
                <section style={{ marginBottom: "32px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
                        2️⃣ SNS 플랫폼 선택
                    </h2>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "12px",
                        }}
                    >
                        {platforms.map((platform) => (
                            <button
                                key={platform.id}
                                onClick={() => setSelectedPlatform(platform)}
                                style={{
                                    padding: "16px",
                                    borderRadius: "12px",
                                    border: selectedPlatform.id === platform.id
                                        ? "2px solid #2196f3"
                                        : `2px solid ${settings.theme === "black" ? "#333" : "#e5e7eb"}`,
                                    background: settings.theme === "black" ? "#2a2a2a" : "#fff",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                <span style={{ fontSize: "24px" }}>{platform.icon}</span>
                                <p style={{ fontSize: "14px", fontWeight: 600, marginTop: "8px", color: textColor }}>
                                    {platform.name}
                                </p>
                                <p style={{ fontSize: "12px", color: "#888" }}>
                                    {platform.width} × {platform.height}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 미리보기 */}
                {selectedArtwork && (
                    <section style={{ marginBottom: "32px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
                            👀 미리보기
                        </h2>
                        <div
                            style={{
                                aspectRatio: `${selectedPlatform.width}/${selectedPlatform.height}`,
                                maxHeight: "300px",
                                borderRadius: "12px",
                                overflow: "hidden",
                                background: bgColor,
                                border: `1px solid ${settings.theme === "black" ? "#333" : "#e5e7eb"}`,
                                display: "flex",
                                flexDirection: selectedPlatform.id === "facebook" ? "row" : "column",
                                alignItems: "center",
                                justifyContent: selectedPlatform.id === "facebook" ? "flex-end" : "center",
                                padding: "20px",
                                margin: "0 auto",
                                position: "relative",
                            }}
                        >
                            {/* 페이스북일 때 왼쪽 텍스트 */}
                            {selectedPlatform.id === "facebook" && (
                                <div style={{
                                    position: "absolute",
                                    left: "20px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    textAlign: "left",
                                }}>
                                    <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px", color: textColor }}>
                                        {selectedArtwork.title}
                                    </p>
                                    <p style={{ fontSize: "10px", color: settings.theme === "black" ? "#bbb" : "#888" }}>
                                        {settings.artistName}
                                    </p>
                                    <p style={{ fontSize: "10px", color: settings.theme === "black" ? "#bbb" : "#888" }}>
                                        {settings.galleryNameKo}
                                    </p>
                                </div>
                            )}

                            <div
                                style={{
                                    width: selectedPlatform.id === "facebook" ? "70%" : "85%",
                                    height: selectedPlatform.id === "facebook" ? "90%" : "75%",
                                    position: "relative",
                                }}
                            >
                                <Image
                                    src={selectedArtwork.imageUrl}
                                    alt={selectedArtwork.title}
                                    fill
                                    style={{ objectFit: "contain" }}
                                />
                            </div>

                            {/* 페이스북 아닐 때 하단 텍스트 */}
                            {selectedPlatform.id !== "facebook" && (
                                <div style={{
                                    marginTop: "12px",
                                    textAlign: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "2px"
                                }}>
                                    <p style={{ fontSize: "14px", fontWeight: 600 }}>
                                        {selectedArtwork.title}
                                    </p>
                                    <p style={{ fontSize: "11px", color: "#888" }}>
                                        {settings.artistName}
                                    </p>
                                    <p style={{ fontSize: "10px", color: "#a0a0a0" }}>
                                        {settings.galleryNameKo}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* 다운로드 버튼 */}
                <button
                    onClick={downloadImage}
                    disabled={!selectedArtwork || isGenerating}
                    style={{
                        width: "100%",
                        padding: "20px",
                        fontSize: "20px",
                        fontWeight: 700,
                        background: selectedArtwork ? "#2196f3" : "#ccc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "16px",
                        cursor: selectedArtwork ? "pointer" : "not-allowed",
                    }}
                >
                    {isGenerating ? "생성 중..." : "📥 이미지 다운로드"}
                </button>
            </main>
        </div>
    );
}
