"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
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
import PaymentGate from "../components/PaymentGate";
import VIPPaymentModal from "../components/VIPPaymentModal";
import Header from "../components/Header";
import EncouragementSection from "../components/EncouragementSection";
import ArtistPicksSection from "../components/ArtistPicksSection";
import ShareModal from "../components/ShareModal";
import { SIGNATURE_COLORS } from "../utils/themeColors";

function VIPContent() {
    const searchParams = useSearchParams();
    const yearMonthParam = searchParams.get("yearMonth");
    const router = useRouter();

    // 🔑 VIP 갤러리 고유 ID
    const VIP_ID = "vip-gallery-04";

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
    const [isMounted, setIsMounted] = useState(false);

    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            if (searchParams.get("showPayment") === "true") {
                setShowPaymentModal(true);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (!demoLoaded && !artworksLoading && artworks.length === 0) {
            loadDemoDataIfEmpty().then(() => {
                refreshArtworks();
                setDemoLoaded(true);
            });
        }
    }, [demoLoaded, artworksLoading, artworks.length, refreshArtworks]);

    useEffect(() => {
        if (artworks.length > 0) {
            const yearMonths = getYearMonths(artworks);
            if (yearMonthParam && yearMonths.includes(yearMonthParam as YearMonthKey)) {
                setSelectedYearMonth(yearMonthParam as YearMonthKey);
                return;
            }
            if (!selectedYearMonth || !yearMonths.includes(selectedYearMonth)) {
                setSelectedYearMonth(yearMonths[0]);
            }
        }
    }, [artworks, yearMonthParam]);

    const isLoading = artworksLoading || settingsLoading;
    const bgColor = settings.theme === "black" ? "#1a1a1a" : "#fafafa";
    const textColor = settings.theme === "black" ? "#ffffff" : "#1a1a1a";
    const borderColor = settings.theme === "black" ? "#333" : "#eee";

    const yearMonths = useMemo(() => getYearMonths(artworks), [artworks]);
    const artworksByYearMonth = useMemo(() => getArtworksByYearMonth(artworks), [artworks]);
    const currentYearMonthArtworks = selectedYearMonth ? artworksByYearMonth.get(selectedYearMonth) || [] : [];

    const handleArtworkClick = (artwork: Artwork, index: number) => {
        setSelectedArtwork({
            artwork,
            index,
            yearArtworks: currentYearMonthArtworks,
        });
    };

    const handleArtworkDeleted = useCallback(() => {
        setSelectedArtwork(null);
        refreshArtworks();
    }, [refreshArtworks]);

    const fallbackToCopy = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            alert('갤러리 주소가 복사되었습니다!\n카카오톡 대화창에 붙여넣기 해주세요.');
        } catch (error) {
            const userInput = prompt('갤러리 주소를 복사하세요:', url);
        }
    };

    const handleKakaoShare = async () => {
        const shareUrl = window.location.href;
        const title = `[VIP] ${settings.artistName} 작가님의 온라인 화첩`;
        const description = `프리미엄 구독 전용 갤러리입니다.`;

        if (navigator.share) {
            try {
                await navigator.share({ title, text: description, url: shareUrl });
            } catch (error: any) {
                if (error.name !== 'AbortError') await fallbackToCopy(shareUrl);
            }
        } else {
            await fallbackToCopy(shareUrl);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen pb-24" style={{ background: bgColor, color: textColor }}>
            <Header
                galleryNameKo={`${settings.galleryNameKo} VIP 04`}
                theme={settings.theme}
                isLoggedIn={isLoggedIn}
                isPaid={isPaid}
                needsPayment={needsPayment}
                onLogout={handleLogout}
                onOpenPayment={() => setShowPaymentModal(true)}
                onKakaoShare={handleKakaoShare}
                vipId={VIP_ID}
            />

            <PaymentGate forcedMode="commercial">
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

                <main className="max-w-6xl mx-auto" style={{ padding: "32px 24px" }}>
                    {isLoading ? (
                        <div className="text-center py-20" style={{ color: "#888" }}><p>불러오는 중...</p></div>
                    ) : artworks.length === 0 ? (
                        <div className="text-center py-20" style={{ color: "#666" }}>
                            <p style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>◻</p>
                            <p style={{ fontSize: "15px", color: textColor, marginBottom: "8px" }}>VIP 04 갤러리 준비 중입니다</p>
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: settings.gridColumns === 1 ? "1fr" : settings.gridColumns === 3 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
                            gridAutoRows: settings.gridColumns === 1 ? "auto" : "180px",
                            gap: settings.gridColumns === 1 ? "24px" : "8px",
                        }}>
                            {currentYearMonthArtworks.map((artwork: Artwork, index: number) => (
                                <div key={artwork.id}>
                                    <ArtworkCard
                                        artwork={artwork}
                                        onClick={() => handleArtworkClick(artwork, index)}
                                        priority={index < 6}
                                        minimal
                                    />
                                </div>
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

export default function VIPPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>불러오는 중...</p></div>}>
            <VIPContent />
        </Suspense>
    );
}
