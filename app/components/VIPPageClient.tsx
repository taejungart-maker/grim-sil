"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createYearMonthKey } from "../data/artworks";
import { isPaymentRequired } from "../utils/deploymentMode";
import { usePayment } from "../contexts/PaymentContext";
import { SIGNATURE_COLORS } from "../utils/themeColors";
import PaymentGate from "../components/PaymentGate";
import VIPPaymentModal from "../components/VIPPaymentModal";
import Header from "../components/Header";
import ShareModal from "../components/ShareModal";
import EncouragementSection from "../components/EncouragementSection";
import ArtistPicksSection from "../components/ArtistPicksSection";
import PolicyModal from "../components/PolicyModal";
import YearMonthTabs from "../components/YearMonthTabs";
import ArtworkCard from "../components/ArtworkCard";
import ArtworkViewer from "../components/ArtworkViewer";

// Modularized Hooks & Components
import { useVIPData } from "../hooks/useVIPData";
import { useVIPActions } from "../hooks/useVIPActions";
import VIPBusinessFooter from "./VIP/VIPBusinessFooter";
import VIPFloatingActions from "./VIP/VIPFloatingActions";
import VIPRecommendSection from "./VIP/VIPRecommendSection";
import VIPArtworkGrid from "./VIP/VIPArtworkGrid";

interface VIPPageClientProps {
    VIP_ID: string;
    isAlwaysFree?: boolean;
}

export default function VIPPageClient({ VIP_ID, isAlwaysFree = false }: VIPPageClientProps) {
    const router = useRouter();
    const { isPaid } = usePayment();
    const needsPayment = isPaymentRequired();

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    // 1. Data Hook
    const {
        artworks,
        settings,
        isLoggedIn,
        logout,
        isLoading,
        selectedYearMonth,
        setSelectedYearMonth,
        selectedArtwork,
        setSelectedArtwork,
        yearMonths,
        handleArtworkClick,
        handleArtworkDeleted,
        refreshArtworks
    } = useVIPData(VIP_ID);

    // 2. Action Hook
    const {
        isRecommending,
        isRecommended,
        handleKakaoShare,
        handleRecommendArtist
    } = useVIPActions({
        artistName: settings.artistName,
        galleryNameKo: settings.galleryNameKo,
        aboutmeImage: settings.aboutmeImage
    });

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [policyModal, setPolicyModal] = useState<{
        isOpen: boolean;
        policyId: "terms" | "privacy" | "refund" | "exchange";
    }>({
        isOpen: false,
        policyId: "terms"
    });

    const handleLogout = () => {
        logout();
        router.push("/");
        router.refresh();
    };

    // [카탈로그 스타일] 작품 순서: 랜덤 셔플 제거 및 최신순/등록순 정렬
    const sortedArtworks = useMemo(() => {
        const currentYearMonthArtworks = selectedYearMonth ?
            artworks.filter(a => createYearMonthKey(a.year, a.month) === selectedYearMonth) : [];
        if (!currentYearMonthArtworks || currentYearMonthArtworks.length === 0) return [];
        // 정갈한 배치를 위해 역순(최신순) 정렬
        return [...currentYearMonthArtworks].reverse();
    }, [artworks, selectedYearMonth]);

    const colors = {
        bg: settings.theme === "black" ? "#000000" : "var(--background)",
        text: settings.theme === "black" ? "#ffffff" : "var(--foreground)",
        border: settings.theme === "black" ? "#222222" : "var(--border)"
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bg }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" style={{ borderColor: colors.text }}></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: colors.bg, color: colors.text }}>
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
                isAlwaysFree={isAlwaysFree}
            />

            {/* 동행 작가 추천 섹션 */}
            {!policyModal.isOpen && (
                <VIPRecommendSection
                    isLoggedIn={isLoggedIn}
                    isRecommending={isRecommending}
                    isRecommended={isRecommended}
                    handleRecommendArtist={handleRecommendArtist}
                    colors={colors}
                />
            )}

            <PaymentGate forcedMode={isAlwaysFree ? "always_free" : "commercial"}>
                {yearMonths.length > 0 && selectedYearMonth && (
                    <div style={{ borderTop: `1px solid ${colors.border}`, background: colors.bg }}>
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

                <main className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
                    <VIPArtworkGrid
                        artworks={artworks}
                        shuffledArtworks={sortedArtworks}
                        gridColumns={settings.gridColumns}
                        onArtworkClick={handleArtworkClick}
                    />
                </main>

                {!policyModal.isOpen && <EncouragementSection theme={settings.theme} />}
                {!policyModal.isOpen && settings.artistPicks && settings.artistPicks.length > 0 && (
                    <ArtistPicksSection picks={settings.artistPicks} theme={settings.theme} />
                )}
            </PaymentGate>

            <VIPBusinessFooter
                theme={settings.theme}
                galleryNameKo={settings.galleryNameKo}
                borderColor={colors.border}
                setPolicyModal={setPolicyModal}
            />

            {selectedArtwork && (
                <ArtworkViewer
                    artworks={selectedArtwork.yearArtworks}
                    initialIndex={selectedArtwork.index}
                    onClose={() => setSelectedArtwork(null)}
                    onDelete={handleArtworkDeleted}
                    theme={settings.theme as "white" | "black"}
                />
            )}

            <VIPPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onSuccess={() => window.location.reload()} />

            {isMounted && isLoggedIn && !policyModal.isOpen && (
                <VIPFloatingActions theme={settings.theme} vipId={VIP_ID} onShareClick={() => setShowShareModal(true)} />
            )}

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                title={`[VIP] ${settings.artistName} 작가님의 온라인 Gallery`}
                description={`프리미엄 구독 전용 공간입니다.`}
                theme={settings.theme}
            />

            <PolicyModal
                isOpen={policyModal.isOpen}
                onClose={() => setPolicyModal(prev => ({ ...prev, isOpen: false }))}
                policyId={policyModal.policyId}
                theme={settings.theme as "white" | "black"}
            />
        </div>
    );
}
