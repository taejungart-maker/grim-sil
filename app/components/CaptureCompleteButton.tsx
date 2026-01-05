"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAllInspirations } from "../utils/indexedDbStorage";

interface CaptureCompleteButtonProps {
    inspirationId: string;
}

export default function CaptureCompleteButton({ inspirationId }: CaptureCompleteButtonProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [blurImageUrl, setBlurImageUrl] = useState<string>("");

    useEffect(() => {
        // IndexedDB에서 블러 이미지 가져오기
        const loadBlurImage = async () => {
            try {
                const inspirations = await getAllInspirations();
                const current = inspirations.find(i => i.id === inspirationId);
                if (current?.blurImageUrl) {
                    setBlurImageUrl(current.blurImageUrl);
                }
            } catch (error) {
                console.error('Failed to load blur image:', error);
            }
        };

        loadBlurImage();

        // 입자 애니메이션 후 표시
        const showTimer = setTimeout(() => setIsVisible(true), 600);

        // 5초 후 자동 페이드아웃
        const hideTimer = setTimeout(() => setIsVisible(false), 5000);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [inspirationId]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/studio/archive?latest=${inspirationId}`);
    };

    return (
        <button
            onClick={handleClick}
            style={{
                position: "fixed",
                bottom: "40px",
                right: "40px",
                zIndex: 1000,
                padding: "12px 20px 12px 12px",
                background: "rgba(0, 0, 0, 0.85)",
                backdropFilter: "blur(20px)",
                color: "#fff",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50px",
                fontSize: "14px",
                fontWeight: 700,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                cursor: "pointer",
                transition: "all 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                pointerEvents: isVisible ? "auto" : "none",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
                e.currentTarget.style.boxShadow = "0 16px 48px rgba(0, 0, 0, 0.6)";
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.95)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.4)";
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.85)";
            }}
        >
            {/* 블러 썸네일 */}
            {blurImageUrl ? (
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        flexShrink: 0,
                    }}
                >
                    <img
                        src={blurImageUrl}
                        alt="Captured inspiration"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                </div>
            ) : (
                <div
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        flexShrink: 0,
                    }}
                >
                    ✨
                </div>
            )}

            {/* 텍스트 */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ fontSize: "13px", fontWeight: 700 }}>
                    방금 채집한 영감
                </div>
                <div style={{ fontSize: "11px", opacity: 0.7, fontWeight: 400 }}>
                    확인하기 →
                </div>
            </div>
        </button>
    );
}
