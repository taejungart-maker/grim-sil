"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ParticleEffect from "../components/ParticleEffect";
import {
    getCurrentGradientColors,
    saveColorPalette,
    saveCapturedColor,
} from "../utils/colorExtractor";

export default function InspirationCapturePage() {
    const router = useRouter();
    const [gradientColors, setGradientColors] = useState<string[]>([]);
    const [triggerParticles, setTriggerParticles] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // 컴포넌트 마운트 시 그라디언트 색상 가져오기
    useEffect(() => {
        const colors = getCurrentGradientColors();
        setGradientColors(colors);
    }, []);

    // 셔터 버튼 클릭: 색상 채집
    const handleCaptureClick = () => {
        if (isTransitioning) return;

        const timestamp = Date.now();

        // 색상 팔레트 저장
        saveColorPalette(gradientColors, timestamp);

        // Visual Continuity를 위해 첫 번째 색상 저장
        if (gradientColors.length > 0) {
            saveCapturedColor(gradientColors[0]);
        }

        // 입자 효과 트리거
        setTriggerParticles(true);
        setTimeout(() => setTriggerParticles(false), 100);
    };

    // 배경 클릭: 아카이브로 이동
    const handleBackgroundClick = () => {
        if (isTransitioning) return;

        setIsTransitioning(true);

        // 페이드 아웃 후 이동
        setTimeout(() => {
            router.push("/archive");
        }, 300);
    };

    const gradientStyle = gradientColors.length >= 2
        ? `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`
        : "#667eea";

    return (
        <div
            onClick={handleBackgroundClick}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: gradientStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "opacity 300ms ease-out",
                opacity: isTransitioning ? 0 : 1,
            }}
        >
            {/* 중앙 셔터 버튼 */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // 배경 클릭 이벤트 막기
                    handleCaptureClick();
                }}
                style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: "3px solid rgba(255, 255, 255, 0.9)",
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    cursor: "pointer",
                    transition: "all 200ms ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 6px 30px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
                }}
                onMouseDown={(e) => {
                    e.currentTarget.style.transform = "scale(0.95)";
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                }}
                aria-label="영감 채집"
            >
                <div
                    style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.8)",
                        transition: "all 200ms ease",
                    }}
                />
            </button>

            {/* 입자 효과 */}
            <ParticleEffect trigger={triggerParticles} />

            {/* 하단 힌트 텍스트 (에센셜리즘: 최소한의 가이드) */}
            <div
                style={{
                    position: "absolute",
                    bottom: "40px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "14px",
                    fontWeight: 300,
                    letterSpacing: "0.05em",
                    pointerEvents: "none",
                    textAlign: "center",
                }}
            >
                <div>영감 채집</div>
                <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.6 }}>
                    배경을 클릭하여 갤러리로 이동
                </div>
            </div>
        </div>
    );
}
