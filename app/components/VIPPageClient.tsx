"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getYearMonths, getArtworksByYearMonth, Artwork, YearMonthKey } from "../data/artworks";
import { loadDemoDataIfEmpty } from "../utils/demoData";
import { useSyncedArtworks, useSyncedSettings } from "../hooks/useSyncedArtworks";
import { useAuth } from "../contexts/AuthContext";
import YearMonthTabs from "../components/YearMonthTabs";
import ArtworkCard from "../components/ArtworkCard";
import ArtworkViewer from "../components/ArtworkViewer";
import { isPaymentRequired } from "../utils/deploymentMode";
import { usePayment } from "../contexts/PaymentContext";
import { SIGNATURE_COLORS } from "../utils/themeColors";
import PaymentGate from "../components/PaymentGate";
import VIPPaymentModal from "../components/VIPPaymentModal";
import Header from "../components/Header";
import ShareModal from "../components/ShareModal";
import EncouragementSection from "../components/EncouragementSection";
import ArtistPicksSection from "../components/ArtistPicksSection";

interface VIPPageClientProps {
    VIP_ID: string;
    isAlwaysFree?: boolean;
}

export default function VIPPageClient({ VIP_ID, isAlwaysFree = false }: VIPPageClientProps) {
    const searchParams = useSearchParams();
    const yearMonthParam = searchParams.get("yearMonth");
    const router = useRouter();

    const { artworks, isLoading: artworksLoading, refresh: refreshArtworks } = useSyncedArtworks(VIP_ID);
    const { settings, isLoading: settingsLoading } = useSyncedSettings(VIP_ID);
    const { isAuthenticated: isLoggedIn, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push("/");
        router.refresh();
    };

    const { isPaid } = usePayment();
    const needsPayment = isPaymentRequired();

    const [selectedYearMonth, setSelectedYearMonth] = useState<YearMonthKey | null>(null);
    const [selectedArtwork, setSelectedArtwork] = useState<{
        artwork: Artwork;
        index: number;
        yearArtworks: Artwork[];
    } | null>(null);
    const [demoLoaded, setDemoLoaded] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!demoLoaded && !artworksLoading && artworks.length === 0) {
            loadDemoDataIfEmpty(VIP_ID).then(() => {
                refreshArtworks();
                setDemoLoaded(true);
            });
        }
    }, [demoLoaded, artworksLoading, artworks.length, refreshArtworks, VIP_ID]);

    useEffect(() => {
        if (artworks.length > 0) {
            const yearMonths = getYearMonths(artworks);
            if (yearMonthParam) {
                if (yearMonths.includes(yearMonthParam as YearMonthKey)) {
                    setSelectedYearMonth(yearMonthParam as YearMonthKey);
                    return;
                }
            }
            if (!selectedYearMonth || !yearMonths.includes(selectedYearMonth)) {
                setSelectedYearMonth(yearMonths[0]);
            }
        }
    }, [artworks, yearMonthParam, selectedYearMonth]);

    const handleArtworkClick = (artwork: Artwork, index: number) => {
        const yearArtworks = artworks.filter(a => a.yearMonth === selectedYearMonth);
        setSelectedArtwork({ artwork, index, yearArtworks });
    };

    const handleArtworkDeleted = () => {
        refreshArtworks();
        setSelectedArtwork(null);
    };

    const handleKakaoShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `[VIP] ${settings.artistName} 작가님의 온라인 화첩`,
                    text: '프리미엄 구독 전용 공간입니다.',
                    url: url,
                });
            } catch (error) {
                fallbackToCopy(url);
            }
        } else {
            fallbackToCopy(url);
        }
    };

    const fallbackToCopy = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            alert("링크가 복사되었습니다. 카카오톡에 붙여넣어 공유해 보세요!");
        }).catch(err => {
            console.error('클립보드 복사 실패:', err);
        });
    };

    const isLoading = artworksLoading || settingsLoading;
    const yearMonths = getYearMonths(artworks);
    const currentYearMonthArtworks = selectedYearMonth ? getArtworksByYearMonth(artworks, selectedYearMonth) : [];

    const colors = {
        bg: settings.theme === "black" ? "#000000" : "#ffffff",
        text: settings.theme === "black" ? "#ffffff" : "#000000",
        border: settings.theme === "black" ? "#222222" : "#f0f0f0"
    };

    const bgColor = colors.bg;
    const textColor = colors.text;
    const borderColor = colors.border;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: bgColor }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" style={{ borderColor: textColor }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: bgColor, color: textColor }}>
            <Header
                galleryNameKo={settings.galleryNameKo}
                theme={settings.theme}
                isLoggedIn={isLoggedIn}
                isPaid={isPaid}
                needsPayment={needsPayment}
                onLogout={handleLogout}
                onOpenPayment={() => setShowPaymentModal(true)}
                onKakaoShare={handleKakaoShare}
                vipId={VIP_ID}
            />
            <PaymentGate forcedMode={isAlwaysFree ? "always_free" : "commercial"}>

                {yearMonths.length > 0 && selectedYearMonth && (
                    <div style={{ borderTop: `1px solid ${borderColor}`, background: bgColor }}>
                        <div className="max-w-6xl mx-auto">
                            <YearMonthTabs
                                yearMonths={yearMonths}
                                selectedYearMonth={selectedYearMonth}
                                onYearMonthSelect={setSelectedYearMonth}
                                theme={settings.theme}
                            />
                        </div>
                    </div>
                )}

                <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                    {artworks.length === 0 ? (
                        <div className="text-center py-24">
                            <p style={{ color: "#888", fontSize: "18px" }}>아직 등록된 작품이 없습니다.</p>
                        </div>
                    ) : (
                        <div className={`grid gap-6 sm:gap-8 ${settings.gridColumns === 1 ? 'grid-cols-1 max-w-2xl mx-auto' :
                            settings.gridColumns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                            }`}>
                            {currentYearMonthArtworks.map((artwork, index) => (
                                <ArtworkCard
                                    key={artwork.id}
                                    artwork={artwork}
                                    onClick={() => handleArtworkClick(artwork, index)}
                                    showPrice={settings.showPrice}
                                    theme={settings.theme}
                                />
                            ))}
                        </div>
                    )}
                </main>

                {/* 응원 메시지 섹션 */}
                <EncouragementSection theme={settings.theme} />

                {/* 추천 작가 섹션 */}
                {settings.artistPicks && settings.artistPicks.length > 0 && (
                    <ArtistPicksSection picks={settings.artistPicks} theme={settings.theme} />
                )}

            </PaymentGate>

            {selectedArtwork && (
                <ArtworkViewer
                    artworks={selectedArtwork.yearArtworks}
                    initialIndex={selectedArtwork.index}
                    onClose={() => setSelectedArtwork(null)}
                    onDelete={handleArtworkDeleted}
                    showPrice={settings.showPrice}
                    theme={settings.theme}
                />
            )}

            <VIPPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={() => window.location.reload()}
            />

            {/* 하단 플로팅 액션 버튼 (로그인 시에만 노출) */}
            {
                isMounted && isLoggedIn && (
                    <div
                        id="author-only-floating-v9"
                        className="fixed z-50 flex flex-col gap-3"
                        style={{
                            bottom: "30px",
                            right: "20px",
                        }}
                    >
                        {/* 1. SNS 공유 (로얄 인디고) */}
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                            style={{
                                width: "46px",
                                height: "46px",
                                borderRadius: "50%",
                                background: settings.theme === "black" ? "#4f46e5" : SIGNATURE_COLORS.royalIndigo,
                                color: "#fff",
                                textDecoration: "none",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                                fontSize: "12px",
                                fontWeight: 800,
                                lineHeight: 1.1,
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            <span>공유</span>
                        </button>

                        {/* 2. 작품 등록 (앤틱 버건디) */}
                        <Link
                            href={`/add?vipId=${VIP_ID}`}
                            className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                            style={{
                                width: "46px",
                                height: "46px",
                                borderRadius: "50%",
                                background: settings.theme === "black" ? "#1a1a1a" : SIGNATURE_COLORS.antiqueBurgundy,
                                color: "#fff",
                                textDecoration: "none",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                                fontSize: "12px",
                                fontWeight: 800,
                                lineHeight: 1.1,
                            }}
                        >
                            <span style={{ fontSize: "14px", marginBottom: "-2px" }}>+</span>
                            <span>등록</span>
                        </Link>
                    </div>
                )
            }

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                title={`[VIP] ${settings.artistName} 작가님의 온라인 화첩`}
                description={`프리미엄 구독 전용 공간입니다.`}
                theme={settings.theme}
            />
        </div>
    );
}
