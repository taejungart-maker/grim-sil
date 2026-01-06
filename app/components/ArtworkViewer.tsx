"use client";

import Image from "next/image";
import Link from "next/link";
import { Artwork } from "../data/artworks";
import { deleteArtwork } from "../utils/db";
import { getExchangeRate, convertKRWtoUSD } from "../utils/exchangeRate";
import { useState, useEffect, useRef } from "react";
import { useImageProtection, useDevToolsDetection } from "../hooks/useImageProtection";
import { useAuth } from "../contexts/AuthContext";

interface ArtworkViewerProps {
    artworks: Artwork[];
    initialIndex: number;
    onClose: () => void;
    onDelete?: () => void;
    showPrice?: boolean;
    theme?: "white" | "black";
}

export default function ArtworkViewer({
    artworks,
    initialIndex,
    onClose,
    onDelete,
    showPrice = false,
    theme = "white",
}: ArtworkViewerProps) {
    const { isAuthenticated: isLoggedIn } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [showCaption, setShowCaption] = useState(false); // 처음엔 캡션 숨김
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showWiggle, setShowWiggle] = useState(false); // 도록 스타일에서는 과한 움직임 제거
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [exchangeRate, setExchangeRate] = useState<number>(1400);
    const captionRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    const currentArtwork = artworks[currentIndex];

    // Level 1 이미지 보호 활성화
    useImageProtection();
    useDevToolsDetection();

    // 실시간 환율 가져오기
    useEffect(() => {
        getExchangeRate().then(rate => {
            setExchangeRate(rate);
        });
    }, []);

    // 안내 문구 표시 및 자동 숨김 (매 작품마다 재표시)
    useEffect(() => {
        setShowFullDescription(false);
        setIsZoomed(false); // 작품 이동 시 줌 초기화
    }, [currentIndex]);

    // 상세정보 표시 시 핀치 줌 방지
    useEffect(() => {
        if (!showCaption) return;

        const preventZoom = (e: TouchEvent) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        };

        document.addEventListener("touchmove", preventZoom, { passive: false });
        return () => document.removeEventListener("touchmove", preventZoom);
    }, [showCaption]);

    // 키보드 네비게이션
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showDeleteConfirm) return;

            if (e.key === "Escape") {
                if (showCaption) {
                    setShowCaption(false);
                } else {
                    onClose();
                }
            }
            if (e.key === "ArrowLeft" && currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                setShowCaption(false);
            }
            if (e.key === "ArrowRight" && currentIndex < artworks.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setShowCaption(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, artworks.length, onClose, showDeleteConfirm, showCaption]);

    // 작품 이미지 터치/클릭 로직
    const handleImageClick = (e: React.MouseEvent | React.TouchEvent) => {
        if (showDeleteConfirm) return;

        // 더블 클릭/터치 시 줌 토글
        if (!isZoomed) {
            setIsZoomed(true);
            // 클릭 위치를 줌 중심으로 설정
            const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
            const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

            if (imageContainerRef.current) {
                const rect = imageContainerRef.current.getBoundingClientRect();
                setZoomPos({
                    x: ((clientX - rect.left) / rect.width) * 100,
                    y: ((clientY - rect.top) / rect.height) * 100
                });
            }
        } else {
            setIsZoomed(false);
        }
    };

    // 캡션 터치 - 스크롤용 (스와이프 닫기 제거됨)
    const handleCaptionTouchStart = (e: React.TouchEvent) => {
        setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };

    const handleCaptionTouchEnd = () => {
        setTouchStart(null);
    };

    // 캡션 클릭 시 닫기
    const handleCaptionClick = () => {
        if (!showDeleteConfirm) {
            setShowCaption(false);
        }
    };

    // 이미지 좌우 스와이프 핸들러
    const handleImageTouchStart = (e: React.TouchEvent) => {
        if (showDeleteConfirm) return;
        setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };

    const handleImageTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart || showDeleteConfirm || isAnimating) return;

        const dx = touchStart.x - e.changedTouches[0].clientX;
        const dy = Math.abs(touchStart.y - e.changedTouches[0].clientY);

        // 수평 스와이프가 수직보다 클 때만
        if (Math.abs(dx) > 50 && Math.abs(dx) > dy) {
            if (dx > 0 && currentIndex < artworks.length - 1) {
                setSlideDirection('left');
                setIsAnimating(true);
                setTimeout(() => {
                    setCurrentIndex(currentIndex + 1);
                    setSlideDirection(null);
                    setIsAnimating(false);
                    setShowCaption(false);
                }, 200);
            } else if (dx < 0 && currentIndex > 0) {
                setSlideDirection('right');
                setIsAnimating(true);
                setTimeout(() => {
                    setCurrentIndex(currentIndex - 1);
                    setSlideDirection(null);
                    setIsAnimating(false);
                    setShowCaption(false);
                }, 200);
            }
        }
        setTouchStart(null);
    };

    const goToPrev = () => {
        if (currentIndex > 0 && !isAnimating) {
            setSlideDirection('right');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex(currentIndex - 1);
                setSlideDirection(null);
                setIsAnimating(false);
                setShowCaption(false);
            }, 200);
        }
    };

    const goToNext = () => {
        if (currentIndex < artworks.length - 1 && !isAnimating) {
            setSlideDirection('left');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setSlideDirection(null);
                setIsAnimating(false);
                setShowCaption(false);
            }, 200);
        }
    };

    // 삭제 핸들러
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteArtwork(currentArtwork.id);
            setShowDeleteConfirm(false);
            onDelete?.();
        } catch (error) {
            console.error("Failed to delete artwork:", error);
            setIsDeleting(false);
        }
    };

    // 고대비 시니어 친화적 색상 - 국립현대미술관 수준
    const bgColor = theme === "black" ? "#0a0a0a" : "#f5f5f3"; // 배경
    const captionBg = theme === "black" ? "#1a1a1a" : "#ffffff"; // 캡션 배경 (불투명 흰색)
    const titleColor = theme === "black" ? "#ffffff" : "#000000"; // 순수 검정
    const infoColor = theme === "black" ? "#e0e0e0" : "#000000"; // 진한 검정
    const secondaryColor = theme === "black" ? "#c0c0c0" : "#1a1a1a";
    const iconColor = theme === "black" ? "#ffffff" : "#000000";
    const buttonBg = theme === "black" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";

    return (
        <div
            className="fade-in"
            style={{
                position: "fixed",
                inset: 0,
                background: bgColor,
                zIndex: 50,
            }}
        >
            {/* 상단 버튼들 - 항상 표시 */}
            <div className="absolute top-4 left-4 right-4 z-50 flex justify-between">
                <div className="flex gap-3">
                    {isLoggedIn && (
                        <Link
                            href={`/edit/${currentArtwork.id}`}
                            className="touch-target flex items-center justify-center gap-2"
                            style={{
                                height: "48px",
                                padding: "0 18px",
                                background: buttonBg,
                                border: "none",
                                borderRadius: "2px",
                                textDecoration: "none",
                                color: iconColor,
                                fontFamily: "var(--font-serif)",
                                fontSize: "14px",
                                fontWeight: 500,
                            }}
                            aria-label="수정하기"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>수정</span>
                        </Link>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="touch-target flex items-center justify-center gap-2"
                    style={{
                        height: "48px",
                        padding: "0 18px",
                        background: buttonBg,
                        borderRadius: "2px",
                        border: "none",
                        cursor: "pointer",
                        color: iconColor,
                        fontFamily: "var(--font-serif)",
                        fontSize: "14px",
                        fontWeight: 500,
                    }}
                    aria-label="닫기"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    <span>닫기</span>
                </button>
            </div>

            {/* 작품 이미지 - 줌 기능 추가 */}
            <div
                ref={imageContainerRef}
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{
                    padding: "80px 24px 100px 24px", // 하단 푸터 공간 확보
                    touchAction: "none", // 스와이프를 위한 터치 액션 제어
                    cursor: "default",
                }}
                onTouchStart={handleImageTouchStart}
                onTouchEnd={handleImageTouchEnd}
            >
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        transition: "transform 0.4s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.3s ease",
                        transform: isZoomed
                            ? `scale(2.5) translate(${50 - zoomPos.x}%, ${50 - zoomPos.y}%)`
                            : slideDirection === 'left' ? 'translateX(-30px)' :
                                slideDirection === 'right' ? 'translateX(30px)' : 'translateX(0)',
                        transformOrigin: "center",
                        opacity: slideDirection ? 0.3 : 1,
                    }}
                >
                    <Image
                        src={currentArtwork.imageUrl}
                        alt={currentArtwork.title}
                        fill
                        priority
                        placeholder={currentArtwork.thumbnailUrl ? "blur" : "empty"}
                        blurDataURL={currentArtwork.thumbnailUrl || undefined}
                        style={{
                            objectFit: "contain",
                            userSelect: "none"
                        }}
                        sizes="100vw"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                    />
                </div>
            </div>

            {/* 하단 고정 푸터: 작품정보클릭/정보닫기 + 작품삭제 (완벽한 위치 일치) */}
            {!isZoomed && (
                <div
                    className="absolute bottom-6 left-0 right-0 z-[60] flex justify-center px-6"
                    style={{ pointerEvents: "none" }}
                >
                    <div
                        className="flex items-center gap-4 py-2 px-4"
                        style={{
                            pointerEvents: "auto",
                            background: "rgba(245, 242, 237, 0.7)", // 조금 더 선명하게
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            borderRadius: "40px !important", // 강제 원형 레이아웃
                        }}
                    >
                        <button
                            onClick={() => setShowCaption(!showCaption)}
                            style={{
                                height: "48px",
                                padding: "0 24px",
                                background: "var(--primary)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "24px !important", // 강제 원형
                                fontFamily: "var(--font-serif)",
                                fontSize: "15px",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                                transition: "all 0.3s ease",
                            }}
                        >
                            {showCaption ? "정보닫기" : "작품정보 클릭"}
                        </button>

                        {isLoggedIn && showCaption && (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                style={{
                                    height: "48px",
                                    padding: "0 20px",
                                    background: "transparent",
                                    color: "#dc2626",
                                    border: "1.5px solid rgba(220, 38, 38, 0.4)",
                                    borderRadius: "24px !important", // 강제 원형
                                    fontFamily: "var(--font-serif)",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                작품삭제
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 자연스러운 캡션 배경 (중앙) - [REVISION] 컬렉터 감상 방해 방지를 위해 상시 텍스트 제거 */}

            {/* 이전/다음 버튼 (데스크톱 전용) */}
            {currentIndex > 0 && !showCaption && (
                <button
                    onClick={goToPrev}
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-40 items-center justify-center"
                    style={{
                        width: "48px",
                        height: "48px",
                        background: buttonBg,
                        borderRadius: "24px",
                        border: "none",
                        cursor: "pointer",
                    }}
                    aria-label="이전 작품"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
            )}

            {currentIndex < artworks.length - 1 && !showCaption && (
                <button
                    onClick={goToNext}
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-40 items-center justify-center"
                    style={{
                        width: "48px",
                        height: "48px",
                        background: buttonBg,
                        borderRadius: "24px",
                        border: "none",
                        cursor: "pointer",
                    }}
                    aria-label="다음 작품"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            )}

            {/* 작품 정보 창 - 하단 오버레이로 원상 복구 */}
            <div
                ref={captionRef}
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 45,
                    background: "rgba(245, 242, 237, 0.98)", // SIGNATURE_COLORS.agingPaper
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderTopLeftRadius: "32px",
                    borderTopRightRadius: "32px",
                    padding: "48px 32px 60px 32px",
                    maxHeight: "75vh",
                    overflowY: "auto",
                    transition: "transform 0.4s ease-out, opacity 0.3s ease",
                    transform: showCaption ? "translateY(0)" : "translateY(100%)",
                    opacity: showCaption ? 1 : 0,
                    pointerEvents: showCaption ? "auto" : "none",
                }}
            >
                <div onClick={(e) => e.stopPropagation()}>
                    {/* 드래그 핸들 (모바일/데스크톱 공통) */}
                    <div
                        style={{
                            width: "40px",
                            height: "4px",
                            background: theme === "black" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
                            borderRadius: "2px",
                            margin: "0 auto 24px auto",
                        }}
                    />

                    {/* 작품 정보 */}
                    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                        <h2
                            style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: "28px",
                                fontWeight: 700,
                                color: titleColor,
                                marginBottom: "16px",
                                letterSpacing: "-0.03em",
                            }}
                        >
                            {currentArtwork.title}
                        </h2>

                        <div
                            style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: "17px",
                                color: infoColor,
                                lineHeight: 1.8,
                            }}
                        >
                            <p style={{ marginBottom: "6px" }}>{currentArtwork.medium}</p>
                            <p style={{ marginBottom: "6px", opacity: 0.8 }}>{currentArtwork.dimensions}</p>
                            <p style={{ marginBottom: "24px", opacity: 0.8 }}>{currentArtwork.year}</p>

                            {/* 가격 정보 */}
                            {showPrice && currentArtwork.price && (() => {
                                const priceNum = parseInt(currentArtwork.price.replace(/[^\d]/g, ''));
                                const usdPrice = convertKRWtoUSD(priceNum, exchangeRate);
                                return (
                                    <div style={{ marginBottom: "16px", fontWeight: 600 }}>
                                        <p style={{ color: "#8B7355" }}>{priceNum.toLocaleString()} KRW</p>
                                        <p style={{ fontSize: "13px", opacity: 0.6 }}>({usdPrice.toLocaleString()} USD)</p>
                                    </div>
                                );
                            })()}

                            {/* 상세 설명 */}
                            {currentArtwork.description && (
                                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${theme === "black" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}` }}>
                                    <p style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>{currentArtwork.description}</p>
                                </div>
                            )}
                        </div>

                        {/* 정보창 내부의 도구 row 제거 (하단 고정 푸터로 이전됨) */}
                        <div style={{ height: "40px" }} />
                    </div>
                </div>
            </div>

            {/* 삭제 확인 모달 */}
            {showDeleteConfirm && (
                <div
                    className="absolute inset-0 z-[100] flex items-center justify-center p-6"
                    style={{ background: "rgba(0,0,0,0.85)" }}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: "16px",
                            maxWidth: "360px",
                            width: "100%",
                            padding: "32px 28px",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ fontSize: "20px", fontWeight: 600, color: "#1a1a1a", marginBottom: "12px" }}>
                            작품을 삭제할까요?
                        </p>
                        <p style={{ fontSize: "15px", color: "#666", marginBottom: "28px", lineHeight: 1.5 }}>
                            "{currentArtwork.title}"을(를) 삭제하면<br />복구할 수 없습니다.
                        </p>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    height: "52px",
                                    background: "#f3f4f6",
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    height: "52px",
                                    background: "#dc2626",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                }}
                            >
                                {isDeleting ? "삭제 중..." : "삭제"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

