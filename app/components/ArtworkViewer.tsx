"use client";

import Image from "next/image";
import Link from "next/link";
import { Artwork } from "../data/artworks";
import { deleteArtwork } from "../utils/db";
import { getExchangeRate, convertKRWtoUSD } from "../utils/exchangeRate";
import { useState, useEffect, useRef } from "react";
import { useImageProtection, useDevToolsDetection } from "../hooks/useImageProtection";

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
    theme = "white"
}: ArtworkViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [showCaption, setShowCaption] = useState(false); // 처음엔 캡션 숨김
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showHint, setShowHint] = useState(true); // 진입 시 안내 문구
    const [hasOpenedCaption, setHasOpenedCaption] = useState(false); // 측션을 한 번이라도 열었는지
    const [showWiggle, setShowWiggle] = useState(true); // 이미지 움질 효과
    const [exchangeRate, setExchangeRate] = useState<number>(1400); // 기본값 1400원
    const captionRef = useRef<HTMLDivElement>(null);

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
    // 측션을 열어본 사용자는 시간 절반 (1.2초), 처음은 2초
    useEffect(() => {
        setShowHint(true);
        setShowWiggle(true);
        setShowFullDescription(false);

        const hintDuration = hasOpenedCaption ? 1200 : 2000;
        const timer = setTimeout(() => {
            setShowHint(false);
            setShowWiggle(false);
        }, hintDuration);
        return () => clearTimeout(timer);
    }, [currentIndex, hasOpenedCaption]);

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

    // 작품 이미지 터치 → 캡션이 열려있으면 닫기, 없으면 열기
    const handleImageClick = () => {
        if (!showDeleteConfirm) {
            if (showCaption) {
                // 캡션이 열려있으면 닫기만
                setShowCaption(false);
            } else {
                // 캡션이 닫혀있으면 열기
                setShowCaption(true);
                setShowHint(false);
                setShowWiggle(false);
                setHasOpenedCaption(true);
            }
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
                <Link
                    href={`/edit/${currentArtwork.id}`}
                    className="touch-target flex items-center justify-center gap-2"
                    style={{
                        minWidth: "52px",
                        height: "52px",
                        padding: "0 14px",
                        background: buttonBg,
                        borderRadius: "26px",
                        textDecoration: "none",
                        color: iconColor,
                        fontFamily: "'Noto Sans KR', sans-serif",
                        fontSize: "15px",
                        fontWeight: 600,
                    }}
                    aria-label="수정하기"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>수정</span>
                </Link>

                <button
                    onClick={onClose}
                    className="touch-target flex items-center justify-center gap-2"
                    style={{
                        minWidth: "52px",
                        height: "52px",
                        padding: "0 14px",
                        background: buttonBg,
                        borderRadius: "26px",
                        border: "none",
                        cursor: "pointer",
                        color: iconColor,
                        fontFamily: "'Noto Sans KR', sans-serif",
                        fontSize: "15px",
                        fontWeight: 600,
                    }}
                    aria-label="닫기"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    <span>닫기</span>
                </button>
            </div>

            {/* 작품 이미지 - 전체 화면, 터치하면 캡션 토글 */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                    padding: "70px 16px 40px 16px",
                    touchAction: showCaption ? "none" : "manipulation",
                }}
                onClick={handleImageClick}
                onTouchStart={handleImageTouchStart}
                onTouchEnd={handleImageTouchEnd}
            >
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
                        transform: slideDirection === 'left' ? 'translateX(-30px)' :
                            slideDirection === 'right' ? 'translateX(30px)' : 'translateX(0)',
                        opacity: slideDirection ? 0.3 : 1,
                        animation: showWiggle && !slideDirection ? 'wiggle 0.6s ease-in-out' : 'none',
                    }}
                >
                    <Image
                        src={currentArtwork.imageUrl}
                        alt={currentArtwork.title}
                        fill
                        priority
                        style={{
                            objectFit: "contain",
                            userSelect: "none",
                            pointerEvents: "none"
                        }}
                        sizes="100vw"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                    />
                </div>
            </div>

            {/* 페이지 인디케이터 - 하단에 항상 표시 */}
            {!showCaption && (
                <div
                    className="absolute bottom-4 left-0 right-0 z-30 flex justify-center"
                    style={{ pointerEvents: "none" }}
                >
                    <span
                        style={{
                            fontFamily: "'Noto Sans KR', sans-serif",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: theme === "black" ? "#666" : "#aaa",
                        }}
                    >
                        {currentIndex + 1} / {artworks.length}
                    </span>
                </div>
            )}

            {/* 이전/다음 버튼 (데스크톱) */}
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

            {/* 미술관 캡션 - 하단에서 슬라이드 업 (블러 효과) */}
            <div
                ref={captionRef}
                onTouchStart={handleCaptionTouchStart}
                onTouchEnd={handleCaptionTouchEnd}
                onClick={handleCaptionClick}
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 45,
                    background: theme === "black"
                        ? "rgba(20, 20, 20, 0.75)"
                        : "rgba(255, 255, 255, 0.75)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                    boxShadow: "0 -8px 30px rgba(0,0,0,0.15)",
                    padding: "24px 24px 32px 24px",
                    maxHeight: "60vh",
                    overflowY: "auto",
                    transform: showCaption ? "translateY(0)" : "translateY(100%)",
                    transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* 드래그 핸들 */}
                <div
                    style={{
                        width: "40px",
                        height: "4px",
                        background: theme === "black" ? "#555" : "#d0d0d0",
                        borderRadius: "2px",
                        margin: "0 auto 20px auto",
                    }}
                />

                {/* 작품명 */}
                <h2
                    style={{
                        fontFamily: "'Noto Sans KR', serif",
                        fontSize: "24px",
                        fontWeight: 600,
                        color: titleColor,
                        marginBottom: "16px",
                        lineHeight: 1.3,
                        letterSpacing: "-0.02em",
                    }}
                >
                    {currentArtwork.title}
                </h2>

                {/* 작품 정보 - 미술관 캡션 형식 */}
                <div
                    style={{
                        fontFamily: "'Noto Sans KR', sans-serif",
                        fontSize: "15px",
                        fontWeight: 400,
                        color: infoColor,
                        lineHeight: 1.8,
                    }}
                >
                    <p style={{ marginBottom: "4px" }}>
                        {currentArtwork.medium}
                    </p>
                    <p style={{ marginBottom: "4px", color: secondaryColor }}>
                        {currentArtwork.dimensions}
                    </p>
                    <p style={{ marginBottom: "12px", color: secondaryColor }}>
                        {currentArtwork.year}
                    </p>


                    {/* 가격 */}
                    {showPrice && currentArtwork.price && (() => {
                        const priceNum = parseInt(currentArtwork.price.replace(/[^\d]/g, ''));
                        const usdPrice = convertKRWtoUSD(priceNum, exchangeRate);
                        return (
                            <div style={{ marginBottom: "12px" }}>
                                <p style={{
                                    color: "#8B7355",
                                    fontWeight: 600,
                                    fontSize: "17px",
                                }}>
                                    ₩{priceNum.toLocaleString()}
                                </p>
                                <p style={{
                                    color: "#9a8a7a",
                                    fontWeight: 500,
                                    fontSize: "14px",
                                    marginTop: "2px",
                                }}>
                                    (${usdPrice.toLocaleString()} USD)
                                </p>
                            </div>
                        );
                    })()}

                    {/* 작가 노트 / 작품 설명 - 200자 제한 */}
                    {currentArtwork.description && (() => {
                        const MAX_LENGTH = 200;
                        const desc = currentArtwork.description;
                        const isLong = desc.length > MAX_LENGTH;
                        const displayText = showFullDescription || !isLong
                            ? desc
                            : desc.slice(0, MAX_LENGTH) + "...";

                        return (
                            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: `1px solid ${theme === "black" ? "#3a3a3a" : "#e8e8e5"}` }}>
                                <p style={{
                                    color: infoColor,
                                    fontSize: "15px",
                                    fontWeight: 400,
                                    lineHeight: 1.9,
                                }}>
                                    {displayText}
                                </p>
                                {isLong && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowFullDescription(!showFullDescription);
                                        }}
                                        style={{
                                            marginTop: "12px",
                                            padding: "8px 16px",
                                            background: "transparent",
                                            border: `1px solid ${theme === "black" ? "#555" : "#d0d0d0"}`,
                                            borderRadius: "6px",
                                            color: secondaryColor,
                                            fontSize: "14px",
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            fontFamily: "'Noto Sans KR', sans-serif",
                                        }}
                                    >
                                        {showFullDescription ? "접기" : "더 보기"}
                                    </button>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* 하단 액션 버튼 */}
                <div
                    style={{
                        marginTop: "24px",
                        paddingTop: "20px",
                        borderTop: `1px solid ${theme === "black" ? "#3a3a3a" : "#e8e8e5"}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            fontFamily: "'Noto Sans KR', sans-serif",
                            fontSize: "14px",
                            fontWeight: 500,
                            color: secondaryColor,
                        }}
                    >
                        {currentIndex + 1} / {artworks.length}
                    </span>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{
                            padding: "10px 18px",
                            background: "transparent",
                            border: `1px solid rgba(200, 50, 50, 0.4)`,
                            borderRadius: "8px",
                            color: "#c83232",
                            fontFamily: "'Noto Sans KR', sans-serif",
                            fontSize: "14px",
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        삭제
                    </button>
                </div>
            </div>

            {/* 삭제 확인 모달 */}
            {showDeleteConfirm && (
                <div
                    className="absolute inset-0 z-60 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.85)" }}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: "16px",
                            maxWidth: "360px",
                            margin: "0 24px",
                            padding: "32px 28px",
                            textAlign: "center",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "'Noto Sans KR', sans-serif",
                                fontSize: "20px",
                                fontWeight: 600,
                                color: "#1a1a1a",
                                marginBottom: "12px",
                            }}
                        >
                            작품을 삭제할까요?
                        </p>
                        <p
                            style={{
                                fontFamily: "'Noto Sans KR', sans-serif",
                                fontSize: "15px",
                                fontWeight: 400,
                                color: "#666",
                                marginBottom: "28px",
                                lineHeight: 1.5,
                            }}
                        >
                            "{currentArtwork.title}"을(를) 삭제하면<br />복구할 수 없습니다.
                        </p>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                style={{
                                    flex: 1,
                                    height: "52px",
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    color: "#333",
                                    background: "#f3f4f6",
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: isDeleting ? "not-allowed" : "pointer",
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
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    background: "#dc2626",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: isDeleting ? "not-allowed" : "pointer",
                                    opacity: isDeleting ? 0.7 : 1,
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
