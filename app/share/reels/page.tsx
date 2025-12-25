"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { loadSettings } from "../../utils/settingsDb";
import { SiteConfig, defaultSiteConfig } from "../../config/site";
import { getAllArtworks } from "../../utils/db";
import { Artwork } from "../../data/artworks";

export default function ReelsPage() {
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement>(null);

    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [animationPhase, setAnimationPhase] = useState(0);
    const [selectedBgColor, setSelectedBgColor] = useState("#f5f5f0"); // 기본: 오프화이트

    useEffect(() => {
        loadSettings().then(setSettings);
        getAllArtworks().then((data) => {
            setArtworks(data);
            if (data.length > 0) setSelectedArtwork(data[0]);
        });
    }, []);

    const bgColor = settings.theme === "black" ? "#1a1a1a" : "#fafafa";
    const textColor = settings.theme === "black" ? "#ffffff" : "#1a1a1a";
    const cardBg = settings.theme === "black" ? "#2a2a2a" : "#ffffff";

    // 풀스크린 애니메이션 시작
    const startFullscreen = () => {
        setShowInstructions(false);
        setIsFullscreen(true);
        setAnimationPhase(0);

        // 배경 음악 재생
        if (audioRef.current) {
            audioRef.current.volume = 1.0;  // 볼륨 최대
            audioRef.current.muted = false; // 음소거 해제
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((e) => {
                console.log("오디오 재생 실패:", e);
            });
        }

        // 애니메이션 타이밍 (15초)
        // 0-3s: 줌아웃, 3-5s: 줌인왼쪽, 5-7s: 오른쪽팬, 7-9s: 중앙, 9-13s: 작가정보, 13s: 페이드아웃
        const phases = [0, 3000, 5000, 7000, 9000, 13000];
        phases.forEach((delay, index) => {
            setTimeout(() => setAnimationPhase(index), delay);
        });

        // 17초 후 종료 (15초까지 검은화면 유지, 녹화 끊을 시간 여유)
        setTimeout(() => {
            setIsFullscreen(false);
            if (audioRef.current) audioRef.current.pause();
        }, 17000);
    };

    // 풀스크린 모드 - 작품 중심 줌인/줌아웃/팬 애니메이션
    if (isFullscreen && selectedArtwork) {
        // 애니메이션 단계별 스타일
        const getAnimationStyle = () => {
            switch (animationPhase) {
                case 0: // 페이드인 + 줌아웃
                    return { scale: 1.3, x: 0, y: 0 };
                case 1: // 줌인 + 왼쪽으로 팬
                    return { scale: 1.5, x: -10, y: 0 };
                case 2: // 오른쪽으로 팬
                    return { scale: 1.4, x: 10, y: -5 };
                case 3: // 줌아웃 + 중앙
                    return { scale: 1.1, x: 0, y: 0 };
                case 4: // 작가 정보와 함께
                    return { scale: 1, x: 0, y: 0 };
                case 5: // 페이드아웃
                    return { scale: 1, x: 0, y: 0 };
                default:
                    return { scale: 1, x: 0, y: 0 };
            }
        };

        const anim = getAnimationStyle();
        const isFadingOut = animationPhase >= 5;  // 마지막 페이즈에서 페이드아웃

        // 배경색에 따라 텍스트 색상 결정 (밝은 배경 = 어두운 글씨)
        const isDarkBg = selectedBgColor === "#1a1a1a" || selectedBgColor === "#2d3436";
        const overlayTextColor = isDarkBg ? "#ffffff" : "#1a1a1a";
        const overlayTextShadow = isDarkBg
            ? "0 2px 20px rgba(0,0,0,0.9)"
            : "0 2px 10px rgba(255,255,255,0.8)";
        const overlaySubColor = isDarkBg ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: selectedBgColor,
                    zIndex: 9999,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onClick={() => {
                    setIsFullscreen(false);
                    if (audioRef.current) audioRef.current.pause();
                }}
            >
                {/* 페이드아웃 오버레이 (검은 화면만) */}
                {isFadingOut && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "#000",
                            opacity: 1,
                            transition: "opacity 1.5s ease",
                            zIndex: 10000,
                        }}
                    />
                )}
                {/* 배경 음악 */}
                <audio
                    ref={audioRef}
                    src="/bgm.mp3"
                    preload="auto"
                    loop
                />

                {/* 작품 (프레임 없이 줌인/줌아웃/팬 애니메이션) */}
                <div
                    style={{
                        position: "relative",
                        width: "min(80vw, 80vh)",
                        height: "min(80vw, 80vh)",
                        transition: "all 3s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: `scale(${anim.scale}) translate(${anim.x}%, ${anim.y}%)`,
                        opacity: animationPhase >= 0 ? 1 : 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Image
                        src={selectedArtwork.imageUrl}
                        alt={selectedArtwork.title}
                        fill
                        style={{
                            objectFit: "contain",
                            filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.8))",
                        }}
                        priority
                    />
                </div>

                {/* 작가 정보 오버레이 */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "120px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        textAlign: "center",
                        color: overlayTextColor,
                        textShadow: overlayTextShadow,
                        opacity: animationPhase >= 4 ? 1 : 0,
                        transition: "opacity 1.5s ease",
                    }}
                >
                    <p style={{ fontSize: "28px", fontWeight: 300, marginBottom: "12px", letterSpacing: "0.05em" }}>
                        {selectedArtwork.title}
                    </p>
                    <p style={{ fontSize: "18px", opacity: 0.8, letterSpacing: "0.1em" }}>
                        {settings.artistName}
                    </p>
                    <p style={{ fontSize: "14px", opacity: 0.6, marginTop: "8px" }}>
                        {settings.galleryNameEn}
                    </p>
                </div>

                {/* 탭하여 종료 안내 */}
                <div
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        color: overlaySubColor,
                        fontSize: "14px",
                    }}
                >
                    탭하여 종료
                </div>
            </div>
        );
    }

    // 녹화 안내 팝업
    if (showInstructions) {
        return (
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.9)",
                    zIndex: 9999,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                    color: "#fff",
                }}
            >
                <h2 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "32px" }}>
                    📱 화면 녹화 방법
                </h2>

                <div
                    style={{
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "24px",
                        padding: "32px",
                        maxWidth: "500px",
                        width: "100%",
                    }}
                >
                    {/* 아이폰 */}
                    <div style={{ marginBottom: "32px" }}>
                        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
                            🍎 아이폰
                        </h3>
                        <ol style={{ fontSize: "18px", lineHeight: 2, paddingLeft: "24px" }}>
                            <li>화면 오른쪽 위에서 <strong>아래로 쓸어내리기</strong></li>
                            <li><strong>⏺ 녹화 버튼</strong>을 길게 누르기</li>
                            <li>마이크 켜기 → 녹화 시작</li>
                        </ol>
                    </div>

                    {/* 안드로이드 */}
                    <div>
                        <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
                            🤖 안드로이드
                        </h3>
                        <ol style={{ fontSize: "18px", lineHeight: 2, paddingLeft: "24px" }}>
                            <li>화면 위에서 <strong>아래로 두 번 쓸어내리기</strong></li>
                            <li><strong>화면 녹화</strong> 버튼 누르기</li>
                            <li>미디어 소리 녹음 선택</li>
                        </ol>
                    </div>
                </div>

                <p
                    style={{
                        marginTop: "32px",
                        fontSize: "16px",
                        color: "rgba(255,255,255,0.7)",
                        textAlign: "center",
                        lineHeight: 1.6,
                    }}
                >
                    녹화를 먼저 시작한 후 아래 버튼을 눌러주세요<br />
                    <strong style={{ color: "#ffd700" }}>⚠️ 화면이 어두워지면 녹화를 중지하세요!</strong>
                </p>

                <button
                    onClick={startFullscreen}
                    style={{
                        marginTop: "24px",
                        padding: "20px 48px",
                        fontSize: "20px",
                        fontWeight: 700,
                        background: "#e91e63",
                        color: "#fff",
                        border: "none",
                        borderRadius: "16px",
                        cursor: "pointer",
                    }}
                >
                    🎬 영상 시작하기
                </button>

                <button
                    onClick={() => router.push("/share")}
                    style={{
                        marginTop: "16px",
                        padding: "12px 24px",
                        fontSize: "16px",
                        background: "transparent",
                        color: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: "12px",
                        cursor: "pointer",
                    }}
                >
                    ← 돌아가기
                </button>
            </div>
        );
    }

    // 메인 UI
    return (
        <div
            className="min-h-screen"
            style={{ background: bgColor, color: textColor }}
        >
            {/* 배경 음악 (숨김) */}
            <audio
                ref={audioRef}
                src="/bgm.mp3"
                preload="auto"
                loop
            />

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
                    🎬 릴스/숏츠 만들기
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
                                        ? "3px solid #e91e63"
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

                {/* 2. 배경색 선택 */}
                <section style={{ marginBottom: "32px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
                        2️⃣ 배경색 선택
                    </h2>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {[
                            { color: "#f5f5f0", name: "갤러리 화이트" },
                            { color: "#1a1a1a", name: "블랙" },
                            { color: "#f8f4e8", name: "베이지" },
                            { color: "#e8e8e8", name: "라이트 그레이" },
                            { color: "#2d3436", name: "다크 그레이" },
                        ].map((bg) => (
                            <button
                                key={bg.color}
                                onClick={() => setSelectedBgColor(bg.color)}
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "12px",
                                    background: bg.color,
                                    border: selectedBgColor === bg.color
                                        ? "3px solid #e91e63"
                                        : `2px solid ${bg.color === "#1a1a1a" || bg.color === "#2d3436" ? "#555" : "#ddd"}`,
                                    cursor: "pointer",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                }}
                                title={bg.name}
                            />
                        ))}
                    </div>
                    <p style={{ marginTop: "8px", fontSize: "14px", color: "#888" }}>
                        선택: {selectedBgColor === "#f5f5f0" ? "갤러리 화이트" :
                            selectedBgColor === "#1a1a1a" ? "블랙" :
                                selectedBgColor === "#f8f4e8" ? "베이지" :
                                    selectedBgColor === "#e8e8e8" ? "라이트 그레이" : "다크 그레이"}
                    </p>
                </section>

                {/* 미리보기 */}
                {selectedArtwork && (
                    <section style={{ marginBottom: "32px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
                            👀 미리보기
                        </h2>
                        <div
                            style={{
                                aspectRatio: "9/16",
                                maxHeight: "300px",
                                borderRadius: "16px",
                                overflow: "hidden",
                                background: selectedBgColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto",
                            }}
                        >
                            {/* 작품 (프레임 없이) */}
                            <div
                                style={{
                                    position: "relative",
                                    width: "80%",
                                    height: "80%",
                                }}
                            >
                                <Image
                                    src={selectedArtwork.imageUrl}
                                    alt={selectedArtwork.title}
                                    fill
                                    style={{
                                        objectFit: "contain",
                                        filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.6))",
                                    }}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* 녹화 준비 버튼 */}
                <button
                    onClick={() => setShowInstructions(true)}
                    disabled={!selectedArtwork}
                    style={{
                        width: "100%",
                        padding: "20px",
                        fontSize: "20px",
                        fontWeight: 700,
                        background: selectedArtwork ? "#e91e63" : "#ccc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "16px",
                        cursor: selectedArtwork ? "pointer" : "not-allowed",
                    }}
                >
                    🎬 녹화 준비
                </button>

                <p
                    style={{
                        marginTop: "12px",
                        textAlign: "center",
                        fontSize: "14px",
                        color: "#888",
                    }}
                >
                    버튼을 누르면 녹화 안내가 나타납니다
                </p>
            </main>
        </div>
    );
}
