"use client";

import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getYearMonths, getArtworksByYearMonth, Artwork, YearMonthKey } from "./data/artworks";
import { loadSettingsById, quickAddPick } from "./utils/settingsDb";
import { getThemeColors, SIGNATURE_COLORS } from "./utils/themeColors";
import type { SiteConfig } from "./config/site";
import { loadDemoDataIfEmpty } from "./utils/demoData";
import { useSyncedArtworks, useSyncedSettings } from "./hooks/useSyncedArtworks";
import { useAuth } from "./contexts/AuthContext";
import { getOwnerId } from "./utils/auth";
import YearMonthTabs from "./components/YearMonthTabs";
import ArtworkCard from "./components/ArtworkCard";
import ArtworkViewer from "./components/ArtworkViewer";
import { isPaymentRequired } from "./utils/deploymentMode";
import { usePayment } from "./contexts/PaymentContext";
import PaymentGate from "./components/PaymentGate";
import PaymentModal from "./components/PaymentModal";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal";
import ShareModal from "./components/ShareModal";
import NewsTicker from "./components/NewsTicker";
import EncouragementSection from "./components/EncouragementSection";
import ArtistPicksSection from "./components/ArtistPicksSection";
import ExpiredOverlay from "./components/ExpiredOverlay";
import PolicyModal from "./components/PolicyModal";

interface HomeClientProps {
    injectedArtistId: string;
}

export default function HomeClient({ injectedArtistId }: HomeClientProps) {
    const searchParams = useSearchParams();
    const yearMonthParam = searchParams.get("yearMonth");

    // [V8_FIX] 서버에서 주입된 테넌트 ID 사용
    const { artworks, isLoading: artworksLoading, refresh: refreshArtworks } = useSyncedArtworks(injectedArtistId);
    const { settings, isLoading: settingsLoading } = useSyncedSettings(injectedArtistId);

    const { isAuthenticated: isLoggedIn, ownerId, logout } = useAuth();
    const { isPaid, isLoading: paymentLoading } = usePayment();
    const needsPayment = isPaymentRequired();

    const [selectedYearMonth, setSelectedYearMonth] = useState<YearMonthKey | null>(null);
    const [selectedArtwork, setSelectedArtwork] = useState<{
        artwork: Artwork;
        index: number;
        yearArtworks: Artwork[];
    } | null>(null);

    const [demoLoaded, setDemoLoaded] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [policyModal, setPolicyModal] = useState<{
        isOpen: boolean;
        policyId: "terms" | "privacy" | "refund" | "exchange";
    }>({
        isOpen: false,
        policyId: "terms"
    });

    // UI 필터링 및 렌더링 로직 (기존 HomeContent와 동일)
    const filteredArtworks = useMemo(() => {
        if (!selectedYearMonth) return [];
        return getArtworksByYearMonth(artworks, selectedYearMonth);
    }, [artworks, selectedYearMonth]);

    const yearMonths = useMemo(() => getYearMonths(artworks), [artworks]);

    useEffect(() => {
        if (yearMonths.length > 0 && !selectedYearMonth) {
            setSelectedYearMonth(yearMonths[0]);
        }
    }, [yearMonths, selectedYearMonth]);

    // 데모 데이터 로딩
    useEffect(() => {
        if (!demoLoaded && !artworksLoading && artworks.length === 0) {
            loadDemoDataIfEmpty().then(() => {
                refreshArtworks();
                setDemoLoaded(true);
            });
        }
    }, [demoLoaded, artworksLoading, artworks.length, refreshArtworks]);

    const themeColors = getThemeColors(settings.theme);

    if (settingsLoading || artworksLoading) {
        return <div className="min-h-screen flex items-center justify-center"><p>불러오는 중...</p></div>;
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: themeColors.bg, color: themeColors.text }}>
            <Header
                galleryNameKo={settings.galleryNameKo}
                theme={settings.theme}
                isLoggedIn={isLoggedIn}
                isPaid={isPaid}
                needsPayment={needsPayment}
                onLogout={logout}
                onOpenPayment={() => setShowPaymentModal(true)}
                onKakaoShare={() => setShowShareModal(true)}
            />

            {settings.newsText && (
                <NewsTicker newsText={settings.newsText} theme={settings.theme} />
            )}

            <main className="max-w-7xl mx-auto px-4 py-8">
                <YearMonthTabs
                    yearMonths={yearMonths}
                    selectedYearMonth={selectedYearMonth || ""}
                    onYearMonthSelect={setSelectedYearMonth}
                    theme={settings.theme}
                />

                <div className={`grid mt-8 gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-${settings.gridColumns}`}>
                    {filteredArtworks.map((artwork, idx) => (
                        <ArtworkCard
                            key={artwork.id}
                            artwork={artwork}
                            onClick={() => setSelectedArtwork({ artwork, index: idx, yearArtworks: filteredArtworks })}
                        />
                    ))}
                </div>

                {settings.showArtistNote && <EncouragementSection theme={settings.theme} />}
                <ArtistPicksSection theme={settings.theme} picks={settings.artistPicks} />
            </main>

            {/* 모달들 */}
            {selectedArtwork && (
                <ArtworkViewer
                    artworks={selectedArtwork.yearArtworks}
                    initialIndex={selectedArtwork.index}
                    onClose={() => setSelectedArtwork(null)}
                    showPrice={settings.showPrice}
                    theme={settings.theme}
                />
            )}

            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareUrl={typeof window !== 'undefined' ? window.location.origin : ''}
                title={settings.siteTitle}
                description={settings.siteDescription || ""}
                theme={settings.theme}
            />
        </div>
    );
}
