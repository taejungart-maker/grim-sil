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

        // 프리미엄 미색 배경 (디자인 가이드라인)
        ctx.fillStyle = "#FDFDFB";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // === 1. 작품 3개 수평 배치 (레퍼런스 스타일) ===
        const imgWidth = 340;
        const imgHeight = 280;
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
            // 모두 같은 높이 (레퍼런스와 동일)
            const y = topY;

            // 그림자 없음 (레퍼런스와 동일)
            ctx.drawImage(img, x, y, imgWidth, imgHeight);
        }

        // 작품과 타이틀 사이 여백 (레퍼런스 분석)
        let yPos = 480;

        // === 2. 갤러리명 (이탤릭, Deep Gold - 고대비 표준) ===
        ctx.font = "italic 36px 'Playfair Display', 'Noto Serif KR', serif";
        ctx.fillStyle = "#9A6F00"; // Deep Gold (WCAG 2.1 AA)
        ctx.letterSpacing = "18px"; // 0.5em ≈ 18px at 36px font
        ctx.textAlign = "center";
        const galleryTitle = `${settings.artistName} GALLERY`;
        ctx.fillText(galleryTitle, canvas.width / 2, yPos);
        yPos += 80;

        // === 3. 작가명 (68px - 절제의 미학) ===
        ctx.font = "700 68px 'Noto Serif KR', serif";
        ctx.fillStyle = "#2a2a2a";
        ctx.letterSpacing = "1.36px"; // 0.02em = 68px * 0.02
        ctx.fillText(settings.artistName, canvas.width / 2, yPos);
        yPos += 30;

        // 언더라인 (레퍼런스)
        const lineWidth = 100;
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - lineWidth / 2, yPos);
        ctx.lineTo(canvas.width / 2 + lineWidth / 2, yPos);
        ctx.stroke();
        yPos += 70;

        // === 4. 전시 정보 (레퍼런스 스타일) ===
        if (exhibitionTitle) {
            ctx.font = "700 50px 'Noto Sans KR', sans-serif";
            ctx.fillStyle = "#2a2a2a";
            ctx.letterSpacing = "2px";
            ctx.fillText(exhibitionTitle, canvas.width / 2, yPos);
            yPos += 80;

            // 날짜 (얼은 국고딕)
            if (exhibitionDate) {
                ctx.font = "300 32px 'Noto Sans KR', sans-serif";
                ctx.fillStyle = "#6a6a6a";
                ctx.letterSpacing = "4px";
                ctx.fillText(exhibitionDate, canvas.width / 2, yPos);
                yPos += 50;
            }

            // 장소 (중간 국고딕)
            if (exhibitionPlace) {
                ctx.font = "400 34px 'Noto Sans KR', sans-serif";
                ctx.fillStyle = "#4a4a4a";
                ctx.letterSpacing = "0px";
                ctx.fillText(exhibitionPlace, canvas.width / 2, yPos);
                yPos += 50;
            }

            // 상세 주소 (얼은 국고딕)
            if (exhibitionAddress) {
                ctx.font = "300 28px 'Noto Sans KR', sans-serif";
                ctx.fillStyle = "#8a8a8a";
                ctx.letterSpacing = "2px";
                ctx.fillText(exhibitionAddress, canvas.width / 2, yPos);
                yPos += 60;
            }

            // 초대 메시지 (마지막에 배치)
            if (exhibitionMessage) {
                yPos += 20;
                ctx.font = "italic 28px 'Playfair Display', serif";
                ctx.fillStyle = "#6a6a6a";
                ctx.letterSpacing = "1px";
                ctx.fillText(`"${exhibitionMessage}"`, canvas.width / 2, yPos);
                yPos += 60;
            }
        }

        // === 5. 연락처 & SNS (레퍼런스 스타일) ===
        yPos += 40;
        ctx.font = "300 24px 'Noto Sans KR', sans-serif";
        ctx.fillStyle = "#6a6a6a";
        ctx.letterSpacing = "2px";

        if (phone) {
            ctx.fillText(`T. ${phone}`, canvas.width / 2, yPos);
            yPos += 36;
        }
        if (email) {
            ctx.fillText(email, canvas.width / 2, yPos);
            yPos += 36;
        }

        // SNS (더 얼은 색)
        ctx.font = "300 22px 'Noto Sans KR', sans-serif";
        ctx.fillStyle = "#9a9a9a";
        if (youtubeHandle) {
            ctx.fillText(formatHandle(youtubeHandle), canvas.width / 2, yPos);
            yPos += 32;
        }
        if (instagramHandle) {
            ctx.fillText(formatHandle(instagramHandle), canvas.width / 2, yPos);
            yPos += 32;
        }



        // 다운로드
        const link = document.createElement("a");
        link.download = `${settings.artistName}_초대장.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        setIsGenerating(false);
    };

    const bgColor = "#FDFDFB"; // 프리미엄 미색 (디자인 가이드라인)
    const textColor = "#2a2a2a";
    const cardBg = "#ffffff";
    const deepGold = "#9A6F00"; // Deep Gold (WCAG 2.1 AA 준수)
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
                        color: deepGold,
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
                                        marginTop: "0", // 모두 같은 높이 (레퍼런스)
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

                        {/* 갤러리명 (이탤릭, Deep Gold - 고대비 표준) */}
                        <p
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: "16px",
                                letterSpacing: "0.5em", // 정밀 자간 조정
                                fontStyle: "italic",
                                color: deepGold,
                                marginBottom: "12px",
                                textAlign: "center",
                            }}
                        >
                            {settings.artistName} GALLERY
                        </p>

                        {/* 작가명 + 언더라인 (68px 비율 유지) */}
                        <div style={{ marginBottom: "24px", textAlign: "center" }}>
                            <h3
                                style={{
                                    fontSize: "32px", // 68px의 비율 유지 (미리보기용)
                                    fontWeight: 700,
                                    marginBottom: "8px",
                                    color: textColor,
                                    letterSpacing: "0.02em", // 정밀 자간 조정
                                    textAlign: "center",
                                }}
                            >
                                {settings.artistName}
                            </h3>
                            {/* 언더라인 */}
                            <div style={{
                                width: "40px",
                                height: "2px",
                                backgroundColor: textColor,
                                margin: "0 auto",
                            }} />
                        </div>

                        {/* 전시 정보 */}
                        {exhibitionTitle && (
                            <div style={{ marginBottom: "20px", textAlign: "center" }}>
                                <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{exhibitionTitle}</p>
                                {exhibitionDate && <p style={{ fontSize: "13px", color: "#666" }}>{exhibitionDate}</p>}
                                {exhibitionPlace && <p style={{ fontSize: "13px", color: "#666" }}>{exhibitionPlace}</p>}
                                {exhibitionAddress && <p style={{ fontSize: "11px", color: "#999" }}>{exhibitionAddress}</p>}
                                {exhibitionMessage && <p style={{ fontSize: "12px", color: deepGold, fontStyle: "italic", marginTop: "8px" }}>"{exhibitionMessage}"</p>}
                            </div>
                        )}

                        {/* 연락처/SNS */}
                        <div style={{ textAlign: "center", color: "#888", fontSize: "11px", lineHeight: 1.8 }}>
                            {phone && <p>📞 {phone}</p>}
                            {email && <p>✉️ {email}</p>}
                            {youtubeHandle && <p style={{ color: deepGold }}>🎬 {formatHandle(youtubeHandle)}</p>}
                            {instagramHandle && <p style={{ color: deepGold }}>📷 {formatHandle(instagramHandle)}</p>}
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
                        background: `linear-gradient(135deg, ${deepGold} 0%, #7a5600 100%)`,
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
