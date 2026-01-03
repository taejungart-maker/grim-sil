"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadSettings } from "../../utils/settingsDb";
import { SiteConfig, defaultSiteConfig } from "../../config/site";

export default function ProfileCardPage() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [isGenerating, setIsGenerating] = useState(false);

    // 작품 업로드 (3장)
    const [uploadedArtworks, setUploadedArtworks] = useState<string[]>(["", "", ""]);

    // 전시 정보
    const [exhibitionTitle, setExhibitionTitle] = useState("");
    const [exhibitionDate, setExhibitionDate] = useState("");
    const [exhibitionPlace, setExhibitionPlace] = useState("");
    const [exhibitionAddress, setExhibitionAddress] = useState("");
    const [exhibitionMessage, setExhibitionMessage] = useState("");

    // SNS & 연락처
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [youtubeHandle, setYoutubeHandle] = useState("");
    const [instagramHandle, setInstagramHandle] = useState("");

    useEffect(() => {
        loadSettings().then(setSettings);
    }, []);

    // 이미지 업로드 핸들러
    const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const newArtworks = [...uploadedArtworks];
            newArtworks[index] = event.target?.result as string;
            setUploadedArtworks(newArtworks);
        };
        reader.readAsDataURL(file);
    };

    // Helper 함수들
    const formatHandle = (handle: string) => {
        if (!handle) return "";
        return handle.startsWith("@") ? handle : `@${handle}`;
    };

    const getYoutubeUrl = (handle: string) => {
        const cleanHandle = handle.startsWith("@") ? handle : `@${handle}`;
        return `https://www.youtube.com/${cleanHandle}`;
    };

    const getInstagramUrl = (handle: string) => {
        const cleanHandle = handle.replace("@", "");
        return `https://www.instagram.com/${cleanHandle}`;
    };

    // 초대장 다운로드 (Canvas)
    const downloadCard = async () => {
        if (!canvasRef.current) return;
        if (uploadedArtworks.filter(a => a).length === 0) {
            alert("작품을 최소 1개 이상 업로드해주세요.");
            return;
        }

        setIsGenerating(true);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 고해상도 설정 (1200x1500)
        canvas.width = 1200;
        canvas.height = 1500;

        // 화이트 큐브 배경
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // === 1. Masonry 작품 배치 (상단) ===
        const imgWidth = 340;
        const imgHeight = 340;
        const gap = 30;
        const startX = (canvas.width - (imgWidth * 3 + gap * 2)) / 2;
        const topY = 60;

        for (let i = 0; i < 3; i++) {
            if (!uploadedArtworks[i]) continue;

            const img = document.createElement("img");
            img.src = uploadedArtworks[i];
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });

            const x = startX + i * (imgWidth + gap);
            // 가운데 작품만 20px 아래로
            const y = i === 1 ? topY + 20 : topY;

            // 부드럽게 바닥에 밀착된 그림자 (Guardian's precision)
            ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 5;

            ctx.drawImage(img, x, y, imgWidth, imgHeight);

            // 그림자 리셋
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
        }

        // 작품과 타이틀 사이 충분한 여백 (100px+)
        let yPos = 630;

        // === 2. 갤러리명 (작가님 GALLERY - 명품 브랜딩) ===
        ctx.font = "400 42px 'Playfair Display', 'Noto Serif KR', serif";
        ctx.fillStyle = "#B5924F"; // 뮤트 골드
        ctx.letterSpacing = "10px"; // 명품 브랜드 자간
        ctx.textAlign = "center";
        const galleryTitle = `${settings.artistName.toUpperCase()} GALLERY`;
        ctx.fillText(galleryTitle, canvas.width / 2, yPos);
        yPos += 60;

        // === 3. 작가명 (딥 차콜) ===
        ctx.font = "700 56px 'Noto Serif KR', serif";
        ctx.fillStyle = "#2a2a2a";
        ctx.letterSpacing = "0.05em";
        ctx.fillText(settings.artistName, canvas.width / 2, yPos);
        yPos += 90;

        // === 4. 전시 정보 ===
        if (exhibitionTitle) {
            ctx.font = "600 48px 'Noto Serif KR', serif";
            ctx.fillStyle = "#2a2a2a";
            ctx.letterSpacing = "0.02em";
            ctx.fillText(exhibitionTitle, canvas.width / 2, yPos);
            yPos += 60;

            // 날짜 (고딕체 - 깔끔함)
            if (exhibitionDate) {
                ctx.font = "400 32px 'Noto Sans KR', sans-serif";
                ctx.fillStyle = "#5a5a5a";
                ctx.letterSpacing = "0px"; // 고딕은 자간 정상
                ctx.fillText(exhibitionDate, canvas.width / 2, yPos);
                yPos += 50;
            }

            // 장소 (고딕체)
            if (exhibitionPlace) {
                ctx.font = "500 32px 'Noto Sans KR', sans-serif";
                ctx.fillStyle = "#4a4a4a";
                ctx.fillText(exhibitionPlace, canvas.width / 2, yPos);
                yPos += 50;
            }

            // 상세 주소 (어르신 가독성 - 고딕체)
            if (exhibitionAddress) {
                ctx.font = "400 28px 'Noto Sans KR', sans-serif";
                ctx.fillStyle = "#7a7a7a";
                ctx.fillText(exhibitionAddress, canvas.width / 2, yPos);
                yPos += 50;
            }

            // 초대 메시지
            if (exhibitionMessage) {
                ctx.font = "italic 30px 'Playfair Display', serif";
                ctx.fillStyle = "#B5924F";
                ctx.fillText(`"${exhibitionMessage}"`, canvas.width / 2, yPos);
                yPos += 70;
            }
        }

        // === 5. 연락처 ===
        yPos += 30;
        ctx.font = "400 26px 'Noto Sans KR', sans-serif";
        ctx.fillStyle = "#5a5a5a";

        if (phone) {
            ctx.fillText(`📞 ${phone}`, canvas.width / 2, yPos);
            yPos += 40;
        }
        if (email) {
            ctx.fillText(`✉️ ${email}`, canvas.width / 2, yPos);
            yPos += 40;
        }

        // === 6. SNS ===
        if (youtubeHandle) {
            ctx.fillStyle = "#B5924F";
            ctx.fillText(`🎬 ${formatHandle(youtubeHandle)}`, canvas.width / 2, yPos);
            yPos += 40;
        }
        if (instagramHandle) {
            ctx.fillStyle = "#B5924F";
            ctx.fillText(`📷 ${formatHandle(instagramHandle)}`, canvas.width / 2, yPos);
            yPos += 40;
        }

        // === 7. 하단 장식 라인 ===
        ctx.strokeStyle = "#e8e6e3";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(400, canvas.height - 80);
        ctx.lineTo(800, canvas.height - 80);
        ctx.stroke();

        // 다운로드
        const link = document.createElement("a");
        link.download = `${settings.artistName}_초대장.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        setIsGenerating(false);
    };

    const bgColor = "#f8f7f4";
    const textColor = "#2a2a2a";
    const cardBg = "#ffffff";
    const mutedGold = "#B5924F";
    const borderColor = "#e8e6e3";

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
                        color: "#888",
                        transition: "all 0.2s ease",
                    }}
                >
                    ←
                </button>
                <h1 style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    fontFamily: "'Playfair Display', 'Noto Serif KR', serif",
                    letterSpacing: "0.05em",
                }}>
                    Premium Invitation
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
                        color: mutedGold,
                        marginBottom: "24px",
                    }}>
                        PREVIEW
                    </p>

                    <div
                        style={{
                            maxWidth: "400px",
                            margin: "0 auto",
                            borderRadius: "8px",
                            overflow: "hidden",
                            background: cardBg,
                            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                            padding: "40px 32px",
                        }}
                    >
                        {/* Masonry 작품 3개 */}
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                marginBottom: "32px",
                                justifyContent: "center",
                            }}
                        >
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    style={{
                                        width: "90px",
                                        height: "90px",
                                        borderRadius: "4px",
                                        overflow: "hidden",
                                        background: "#f5f5f5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginTop: i === 1 ? "8px" : "0", // 가운데만 아래로
                                        boxShadow: uploadedArtworks[i] ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                                    }}
                                >
                                    {uploadedArtworks[i] ? (
                                        <img
                                            src={uploadedArtworks[i]}
                                            alt={`Artwork ${i + 1}`}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: "24px", color: "#ddd" }}>🖼️</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 갤러리명 */}
                        <p
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "16px",
                                letterSpacing: "0.15em",
                                color: mutedGold,
                                marginBottom: "12px",
                            }}
                        >
                            {settings.galleryNameEn || "Gallery"}
                        </p>

                        {/* 작가명 */}
                        <h3
                            style={{
                                fontSize: "32px",
                                fontWeight: 700,
                                marginBottom: "24px",
                                color: textColor,
                            }}
                        >
                            {settings.artistName}
                        </h3>

                        {/* 전시 정보 */}
                        {exhibitionTitle && (
                            <div style={{ marginBottom: "20px", textAlign: "center" }}>
                                <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{exhibitionTitle}</p>
                                {exhibitionDate && <p style={{ fontSize: "13px", color: "#666" }}>{exhibitionDate}</p>}
                                {exhibitionPlace && <p style={{ fontSize: "13px", color: "#666" }}>{exhibitionPlace}</p>}
                                {exhibitionAddress && <p style={{ fontSize: "11px", color: "#999" }}>{exhibitionAddress}</p>}
                                {exhibitionMessage && <p style={{ fontSize: "12px", color: mutedGold, fontStyle: "italic", marginTop: "8px" }}>"{exhibitionMessage}"</p>}
                            </div>
                        )}

                        {/* 연락처/SNS */}
                        <div style={{ textAlign: "center", color: "#888", fontSize: "11px", lineHeight: 1.8 }}>
                            {phone && <p>📞 {phone}</p>}
                            {email && <p>✉️ {email}</p>}
                            {youtubeHandle && <p style={{ color: mutedGold }}>🎬 {formatHandle(youtubeHandle)}</p>}
                            {instagramHandle && <p style={{ color: mutedGold }}>📷 {formatHandle(instagramHandle)}</p>}
                        </div>
                    </div>
                </section>

                {/* 작품 업로드 */}
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
                        <span style={{ fontSize: "20px" }}>🎨</span>
                        작품 업로드 (최대 3개)
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                        {[0, 1, 2].map((i) => (
                            <label
                                key={i}
                                style={{
                                    aspectRatio: "1",
                                    borderRadius: "12px",
                                    border: `2px dashed ${borderColor}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    overflow: "hidden",
                                    position: "relative",
                                    background: uploadedArtworks[i] ? "transparent" : "#fafaf8",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {uploadedArtworks[i] ? (
                                    <img
                                        src={uploadedArtworks[i]}
                                        alt={`Upload ${i + 1}`}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <span style={{ fontSize: "32px", color: "#ccc" }}>+</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(i, e)}
                                    style={{ display: "none" }}
                                />
                            </label>
                        ))}
                    </div>
                </section>

                {/* 전시 정보 */}
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
                        <span style={{ fontSize: "20px" }}>🖼️</span>
                        전시 정보
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <input
                            type="text"
                            value={exhibitionTitle}
                            onChange={(e) => setExhibitionTitle(e.target.value)}
                            placeholder="✨ 전시 제목"
                            style={{
                                padding: "18px 0",
                                fontSize: "17px",
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
                            placeholder="📅 전시 기간"
                            style={{
                                padding: "18px 0",
                                fontSize: "17px",
                                border: "none",
                                borderBottom: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                        <input
                            type="text"
                            value={exhibitionPlace}
                            onChange={(e) => setExhibitionPlace(e.target.value)}
                            placeholder="📍 전시 장소"
                            style={{
                                padding: "18px 0",
                                fontSize: "17px",
                                border: "none",
                                borderBottom: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                        <input
                            type="text"
                            value={exhibitionAddress}
                            onChange={(e) => setExhibitionAddress(e.target.value)}
                            placeholder="🗺️ 상세 주소"
                            style={{
                                padding: "18px 0",
                                fontSize: "17px",
                                border: "none",
                                borderBottom: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                        <input
                            type="text"
                            value={exhibitionMessage}
                            onChange={(e) => setExhibitionMessage(e.target.value)}
                            placeholder="💌 초대 문구"
                            style={{
                                padding: "18px 0",
                                fontSize: "17px",
                                border: "none",
                                borderBottom: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                    </div>
                </section>

                {/* 연락처 */}
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
                        연락처 & SNS
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
                                border: "none",
                                borderBottom: `1px solid ${borderColor}`,
                                background: "transparent",
                                color: textColor,
                                outline: "none",
                            }}
                        />
                    </div>
                </section>

                {/* 다운로드 버튼 */}
                <button
                    onClick={downloadCard}
                    disabled={isGenerating}
                    style={{
                        width: "100%",
                        padding: "22px",
                        fontSize: "17px",
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${mutedGold} 0%, #9d7a3f 100%)`,
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "12px",
                        cursor: isGenerating ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 8px 24px rgba(181, 146, 79, 0.25)",
                        letterSpacing: "0.05em",
                    }}
                >
                    {isGenerating ? "생성 중..." : "📥 초대장 다운로드"}
                </button>
            </main>
        </div>
    );
}
