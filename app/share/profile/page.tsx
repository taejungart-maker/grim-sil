"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadSettings } from "../../utils/settingsDb";
import { SiteConfig, defaultSiteConfig } from "../../config/site";
import { getAllArtworks } from "../../utils/db";
import { Artwork } from "../../data/artworks";
import Image from "next/image";
import QRCode from "qrcode";

export default function ProfileCardPage() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [phone, setPhone] = useState("");  // 전화번호 (선택)
    const [email, setEmail] = useState("");  // 이메일 (선택)
    const [youtubeHandle, setYoutubeHandle] = useState(""); // @핸들명만 입력
    const [instagramHandle, setInstagramHandle] = useState(""); // @핸들명만 입력
    const [isGenerating, setIsGenerating] = useState(false);

    // 전시 초대 정보
    const [showExhibition, setShowExhibition] = useState(false);
    const [exhibitionTitle, setExhibitionTitle] = useState("");
    const [exhibitionDate, setExhibitionDate] = useState("");
    const [exhibitionPlace, setExhibitionPlace] = useState("");
    const [exhibitionMessage, setExhibitionMessage] = useState("");

    // 카카오맵 URL 생성
    const getMapUrl = (place: string) => {
        return `https://map.kakao.com/?q=${encodeURIComponent(place)}`;
    };

    // 유튜브 핸들에서 @ 제거 후 URL 생성
    const getYoutubeUrl = (handle: string) => {
        const cleanHandle = handle.startsWith("@") ? handle : `@${handle}`;
        return `https://www.youtube.com/${cleanHandle}`;
    };

    // 인스타그램 핸들에서 @ 제거 후 URL 생성
    const getInstagramUrl = (handle: string) => {
        const cleanHandle = handle.replace("@", "");
        return `https://www.instagram.com/${cleanHandle}`;
    };

    // 핸들 표시명 (@ 붙여서)
    const formatHandle = (handle: string) => {
        if (!handle) return "";
        return handle.startsWith("@") ? handle : `@${handle}`;
    };

    useEffect(() => {
        loadSettings().then(setSettings);
        getAllArtworks().then(setArtworks);
    }, []);

    const bgColor = settings.theme === "black" ? "#0f0f0f" : "#f8f7f4";
    const textColor = settings.theme === "black" ? "#f5f5f5" : "#1a1a1a";
    const cardBg = settings.theme === "black" ? "#1a1a1a" : "#ffffff";
    const mutedColor = settings.theme === "black" ? "#666" : "#888";
    const borderColor = settings.theme === "black" ? "#2a2a2a" : "#e8e6e3";

    // 초대장 다운로드
    const downloadCard = async () => {
        if (!canvasRef.current) return;

        setIsGenerating(true);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 1080;
        canvas.height = showExhibition && exhibitionTitle ? 1350 : 1080;

        // 배경 순백색으로 통일
        if (settings.theme === "black") {
            ctx.fillStyle = "#1a1a1a";
        } else {
            ctx.fillStyle = "#ffffff";  // 순백색
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 골드 프레임 + 블루 꽃 코너 장식 이미지 로드
        const frameImg = document.createElement("img");
        frameImg.crossOrigin = "anonymous";
        frameImg.src = "/frame-deco.png";
        await new Promise((resolve) => {
            frameImg.onload = resolve;
            frameImg.onerror = resolve;
        });

        // 프레임 그리기
        const frameWidth = canvas.width - 200;  // 좌우 여백 100px
        const frameHeight = canvas.height - 420;
        const frameX = 100;
        const frameY = 390;
        ctx.globalAlpha = settings.theme === "black" ? 0.9 : 1.0;
        ctx.drawImage(frameImg, frameX, frameY, frameWidth, frameHeight);
        ctx.globalAlpha = 1.0;

        // 대표 작품 이미지들 (상단)
        const topArtworks = artworks.slice(0, 3);
        const imgWidth = 280;
        const imgGap = 10;
        const startX = (canvas.width - (imgWidth * 3 + imgGap * 2)) / 2;

        for (let i = 0; i < topArtworks.length; i++) {
            const artwork = topArtworks[i];
            const img = document.createElement("img");
            img.crossOrigin = "anonymous";
            img.src = artwork.imageUrl;

            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });

            const x = startX + i * (imgWidth + imgGap);
            ctx.drawImage(img, x, 30, imgWidth, imgWidth);
        }

        // 갤러리명 (크게 + 그림자 효과)
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#b8860b";  // 금색 (Dark Goldenrod)
        ctx.font = "bold 60px 'Georgia', 'Noto Serif KR', serif";
        ctx.textAlign = "center";
        ctx.fillText(settings.galleryNameKo || settings.galleryNameEn, canvas.width / 2, 420);
        ctx.restore();

        // 전시 초대 섹션 (프레임 안 - 정확히 중앙)
        const textCenterX = canvas.width / 2;  // 540px 중앙
        ctx.textAlign = "center";  // 가운데 정렬!
        let yPos = 620; // 560에서 620으로 내려서 중앙 안정감 확보

        if (showExhibition && exhibitionTitle) {
            // 전시 제목 (글씨 크기 확대)
            ctx.font = "bold 56px 'Georgia', 'Noto Serif KR', serif";
            ctx.fillStyle = "#1a1a1a";  // 검정
            ctx.fillText(exhibitionTitle, textCenterX, yPos);
            yPos += 75; // 행간 넉넉히

            // 날짜/장소 (글씨 크기 확대 및 행간 조정)
            ctx.font = "400 34px 'Pretendard', 'Nanum Gothic', sans-serif";
            ctx.fillStyle = "#1a1a1a";

            if (exhibitionDate) {
                ctx.fillText(exhibitionDate, textCenterX, yPos);
                yPos += 48;
            }
            if (exhibitionPlace) {
                ctx.fillText(exhibitionPlace, textCenterX, yPos);
                yPos += 48;
            }

            // 초대 메시지 (이탤릭, 크기 확대)
            if (exhibitionMessage) {
                yPos += 30;
                ctx.font = "italic 30px 'Georgia', serif";
                ctx.fillStyle = "#333";
                ctx.fillText(`"${exhibitionMessage}"`, textCenterX, yPos);
                yPos += 65;
            }

            yPos += 30;
        }

        // 연락처 (산세리프 - 깔끔하게)
        ctx.font = "400 22px 'Pretendard', 'Nanum Gothic', sans-serif";
        ctx.fillStyle = "#444";

        if (phone) {
            ctx.fillText(phone, textCenterX, yPos);
            yPos += 34;
        }
        if (email) {
            ctx.fillText(email, textCenterX, yPos);
            yPos += 34;
        }

        // QR 코드 생성 (유튜브, 인스타그램)
        const qrSize = 90;
        const qrY = yPos + 20;
        const qrOptions = {
            width: qrSize,
            margin: 1,
            color: {
                dark: settings.theme === "black" ? "#ffffff" : "#1a1a1a",
                light: settings.theme === "black" ? "#1a1a1a" : "#f8f9fa",
            },
        };

        const hasYoutube = !!youtubeHandle;
        const hasInstagram = !!instagramHandle;

        if (hasYoutube || hasInstagram) {
            ctx.font = "12px sans-serif";
            ctx.fillStyle = settings.theme === "black" ? "#888" : "#666";

            if (hasYoutube && hasInstagram) {
                // 2개 QR - 나란히 배치
                const gap = 60;
                const leftX = canvas.width / 2 - qrSize - gap / 2;
                const rightX = canvas.width / 2 + gap / 2;

                // 유튜브 QR (왼쪽)
                try {
                    const ytQr = await QRCode.toDataURL(getYoutubeUrl(youtubeHandle), qrOptions);
                    const ytImg = document.createElement("img");
                    ytImg.src = ytQr;
                    await new Promise(r => { ytImg.onload = r; });
                    ctx.drawImage(ytImg, leftX, qrY, qrSize, qrSize);
                    ctx.fillText("🎬 YouTube", leftX + qrSize / 2, qrY + qrSize + 20);
                } catch { }

                // 인스타그램 QR (오른쪽)
                try {
                    const igQr = await QRCode.toDataURL(getInstagramUrl(instagramHandle), qrOptions);
                    const igImg = document.createElement("img");
                    igImg.src = igQr;
                    await new Promise(r => { igImg.onload = r; });
                    ctx.drawImage(igImg, rightX, qrY, qrSize, qrSize);
                    ctx.fillText("📷 Instagram", rightX + qrSize / 2, qrY + qrSize + 20);
                } catch { }

            } else {
                // 1개 QR - 중앙 배치
                const centerX = (canvas.width - qrSize) / 2;
                const qrUrl = hasYoutube ? getYoutubeUrl(youtubeHandle) : getInstagramUrl(instagramHandle);
                const label = hasYoutube ? "🎬 YouTube" : "📷 Instagram";

                try {
                    const qrData = await QRCode.toDataURL(qrUrl, qrOptions);
                    const qrImg = document.createElement("img");
                    qrImg.src = qrData;
                    await new Promise(r => { qrImg.onload = r; });
                    ctx.drawImage(qrImg, centerX, qrY, qrSize, qrSize);
                    ctx.fillText(label, canvas.width / 2, qrY + qrSize + 20);
                } catch { }
            }

            // 하단 안내
            ctx.font = "11px sans-serif";
            ctx.fillStyle = settings.theme === "black" ? "#555" : "#999";
            ctx.fillText("스캔하여 채널 방문", canvas.width / 2, qrY + qrSize + 45);
        } else {
            // QR 없으면 하단 장식선
            ctx.strokeStyle = settings.theme === "black" ? "#333" : "#ddd";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(340, yPos + 30);
            ctx.lineTo(740, yPos + 30);
            ctx.stroke();
        }

        // 다운로드
        const link = document.createElement("a");
        link.download = `${settings.artistName}_초대장.png`;
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
                    padding: "32px 24px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                }}
            >
                <button
                    onClick={() => router.push("/share")}
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "transparent",
                        border: `1px solid ${borderColor}`,
                        cursor: "pointer",
                        fontSize: "18px",
                        color: mutedColor,
                        transition: "all 0.2s ease",
                    }}
                >
                    ←
                </button>
                <h1 style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    fontFamily: "'Georgia', 'Noto Serif KR', serif",
                    letterSpacing: "0.05em",
                }}>
                    초대장 만들기
                </h1>
            </header>

            <main
                className="max-w-2xl mx-auto"
                style={{ padding: "32px 24px 48px" }}
            >
                {/* 미리보기 */}
                <section style={{ marginBottom: "48px" }}>
                    <p style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        color: mutedColor,
                        marginBottom: "12px",
                    }}>
                        초대장 미리보기
                    </p>
                    <p style={{ fontSize: "12px", color: "#999", marginBottom: "24px" }}>
                        아래 정보를 입력하면 초대장에 실시간으로 반영됩니다.
                    </p>
                    <div
                        style={{
                            aspectRatio: "1",
                            maxWidth: "380px",
                            margin: "0 auto",
                            borderRadius: "4px",
                            overflow: "hidden",
                            background: cardBg,
                            boxShadow: settings.theme === "black"
                                ? "0 25px 50px -12px rgba(0,0,0,0.5)"
                                : "0 25px 50px -12px rgba(0,0,0,0.15)",
                            padding: "32px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        {/* 대표 작품 */}
                        <div
                            style={{
                                display: "flex",
                                gap: "8px",
                                marginBottom: "24px",
                            }}
                        >
                            {artworks.slice(0, 3).map((artwork) => (
                                <div
                                    key={artwork.id}
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        position: "relative",
                                    }}
                                >
                                    <Image
                                        src={artwork.imageUrl}
                                        alt={artwork.title}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* 갤러리명 */}
                        <p
                            style={{
                                fontFamily: "'Georgia', serif",
                                fontSize: "14px",
                                letterSpacing: "0.2em",
                                color: textColor,
                            }}
                        >
                            {settings.galleryNameEn}
                        </p>
                        <p
                            style={{
                                fontSize: "11px",
                                color: "#888",
                                marginBottom: "16px",
                            }}
                        >
                            {settings.galleryNameKo}
                        </p>

                        {/* 작가명 */}
                        <h3
                            style={{
                                fontSize: "28px",
                                fontWeight: 700,
                                marginBottom: "16px",
                            }}
                        >
                            {settings.artistName}
                        </h3>

                        {/* 연락처/SNS 핸들 */}
                        <div style={{ textAlign: "center", color: "#888", fontSize: "12px" }}>
                            {phone && <p>📞 {phone}</p>}
                            {email && <p>✉️ {email}</p>}
                            {youtubeHandle && (
                                <a
                                    href={getYoutubeUrl(youtubeHandle)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#ff0000", textDecoration: "none" }}
                                >
                                    🎬 {formatHandle(youtubeHandle)}
                                </a>
                            )}
                            {instagramHandle && (
                                <a
                                    href={getInstagramUrl(instagramHandle)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#e91e63", textDecoration: "none", display: "block", marginTop: "4px" }}
                                >
                                    📷 {formatHandle(instagramHandle)}
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* 🎪 전시 초대 정보 */}
                <section style={{ marginBottom: "48px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <p style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: textColor,
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}>
                            <span style={{ fontSize: "20px" }}>🖼️</span>
                            전시 초대
                        </p>
                        <button
                            onClick={() => setShowExhibition(!showExhibition)}
                            style={{
                                padding: "10px 20px",
                                fontSize: "14px",
                                fontWeight: 500,
                                background: showExhibition ? textColor : "transparent",
                                color: showExhibition ? bgColor : mutedColor,
                                border: `1px solid ${showExhibition ? textColor : borderColor}`,
                                borderRadius: "24px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {showExhibition ? "✓ 표시" : "숨김"}
                        </button>
                    </div>

                    {showExhibition && (
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            padding: "24px",
                            background: settings.theme === "black" ? "#1f1f1f" : "#fafaf8",
                            borderRadius: "16px",
                        }}>
                            <input
                                type="text"
                                value={exhibitionTitle}
                                onChange={(e) => setExhibitionTitle(e.target.value)}
                                placeholder="✨ 전시 제목"
                                style={{
                                    padding: "18px 0",
                                    fontSize: "17px",
                                    fontWeight: 400,
                                    border: "none",
                                    borderBottom: `1px solid ${borderColor}`,
                                    background: "transparent",
                                    color: textColor,
                                    outline: "none",
                                }}
                            />
                            <input
                                type="text"
                                value={exhibitionDate}
                                onChange={(e) => setExhibitionDate(e.target.value)}
                                placeholder="📅 전시 기간 (예: 2025.03.15 ~ 03.25)"
                                style={{
                                    padding: "18px 0",
                                    fontSize: "17px",
                                    fontWeight: 400,
                                    border: "none",
                                    borderBottom: `1px solid ${borderColor}`,
                                    background: "transparent",
                                    color: textColor,
                                    outline: "none",
                                }}
                            />
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <input
                                    type="text"
                                    value={exhibitionPlace}
                                    onChange={(e) => setExhibitionPlace(e.target.value)}
                                    placeholder="📍 전시 장소"
                                    style={{
                                        flex: 1,
                                        padding: "18px 0",
                                        fontSize: "17px",
                                        fontWeight: 400,
                                        border: "none",
                                        borderBottom: `1px solid ${borderColor}`,
                                        background: "transparent",
                                        color: textColor,
                                        outline: "none",
                                    }}
                                />
                                {exhibitionPlace && (
                                    <a
                                        href={getMapUrl(exhibitionPlace)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            padding: "14px 20px",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            background: settings.theme === "black" ? "#333" : "#1a1a1a",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "24px",
                                            textDecoration: "none",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        🗺️ 길찾기
                                    </a>
                                )}
                            </div>
                            <input
                                type="text"
                                value={exhibitionMessage}
                                onChange={(e) => setExhibitionMessage(e.target.value)}
                                placeholder="💌 초대 문구 (예: 여러분을 초대합니다)"
                                style={{
                                    padding: "18px 0",
                                    fontSize: "17px",
                                    fontWeight: 400,
                                    border: "none",
                                    borderBottom: `1px solid ${borderColor}`,
                                    background: "transparent",
                                    color: textColor,
                                    outline: "none",
                                }}
                            />
                        </div>
                    )}
                </section>

                {/* 📞 연락처 */}
                <section style={{ marginBottom: "48px" }}>
                    <p style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: textColor,
                        marginBottom: "24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}>
                        <span style={{ fontSize: "20px" }}>📬</span>
                        연락처
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="📞 전화번호"
                            style={{
                                padding: "18px 0",
                                fontSize: "17px",
                                fontWeight: 400,
                                border: "none",
                                borderBottom: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="✉️ 이메일"
                            style={{
                                padding: "18px 0",
                                fontSize: "17px",
                                fontWeight: 400,
                                border: "none",
                                borderBottom: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                        <input
                            type="text"
                            value={youtubeHandle}
                            onChange={(e) => setYoutubeHandle(e.target.value)}
                            placeholder="🎬 유튜브 @핸들"
                            style={{
                                padding: "18px 0",
                                fontSize: "17px",
                                fontWeight: 400,
                                border: "none",
                                borderBottom: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                        <input
                            type="text"
                            value={instagramHandle}
                            onChange={(e) => setInstagramHandle(e.target.value)}
                            placeholder="📷 인스타그램 @핸들"
                            style={{
                                padding: "18px 0",
                                fontSize: "17px",
                                fontWeight: 400,
                                border: "none",
                                borderBottom: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                    </div>
                </section>

                {/* 버튼들 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "32px" }}>
                    <button
                        onClick={downloadCard}
                        disabled={isGenerating}
                        style={{
                            width: "100%",
                            padding: "20px",
                            fontSize: "16px",
                            fontWeight: 600,
                            background: textColor,
                            color: bgColor,
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}>
                        {isGenerating ? "생성 중..." : "📥 초대장 다운로드"}
                    </button>

                </div>
            </main>
        </div>
    );
}
