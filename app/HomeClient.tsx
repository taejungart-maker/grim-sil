"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getThemeColors, SIGNATURE_COLORS } from "./utils/themeColors";
import { isPaymentRequired } from "./utils/deploymentMode";
import { usePayment } from "./contexts/PaymentContext";
import { useHomeData } from "./hooks/useHomeData";
import YearMonthTabs from "./components/YearMonthTabs";
import ArtworkCard from "./components/ArtworkCard";
import ArtworkViewer from "./components/ArtworkViewer";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal";
import ShareModal from "./components/ShareModal";
import NewsTicker from "./components/NewsTicker";
import EncouragementSection from "./components/EncouragementSection";
import ArtistPicksSection from "./components/ArtistPicksSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

interface HomeClientProps {
    injectedArtistId: string;
}

export default function HomeClient({ injectedArtistId }: HomeClientProps) {
    const {
        settings,
        isLoggedIn,
        logout,
        isLoading,
        selectedYearMonth,
        setSelectedYearMonth,
        selectedArtwork,
        setSelectedArtwork,
        filteredArtworks,
        yearMonths,
        handleArtworkDeleted
    } = useHomeData(injectedArtistId);

    const { isPaid } = usePayment();
    const needsPayment = isPaymentRequired();

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const themeColors = getThemeColors(settings.theme);

    if (isLoading) {
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

                <div
                    className="grid mt-8 gap-6"
                    style={{
                        gridTemplateColumns: settings.gridColumns === 1
                            ? "1fr"
                            : `repeat(${settings.gridColumns}, 1fr)`
                    }}
                >
                    {filteredArtworks.map((artwork, idx) => (
                        <ArtworkCard
                            key={artwork.id}
                            artwork={artwork}
                            onClick={() => setSelectedArtwork({ artwork, index: idx, yearArtworks: filteredArtworks })}
                        />
                    ))}
                </div>

                {settings.showArtistNote && <EncouragementSection theme={settings.theme} />}
                <ArtistPicksSection theme={settings.theme} picks={settings.artistPicks} isAuthenticated={isLoggedIn} />
            </main>

            <CTASection theme={settings.theme} />
            <Footer theme={settings.theme} />

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

            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareUrl={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}${window.location.pathname}?artist=${injectedArtistId}&v=${settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now()}` : ""}
                title={`${settings.galleryNameKo} 초대`}
                description={`${settings.artistName} 작가님의 온라인 Gallery에 초대합니다.`}
                theme={settings.theme}
            />

            {isLoggedIn && (
                <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-40">
                    <Link
                        href="/share"
                        className="flex items-center justify-center w-14 h-14 shadow-2xl hover:scale-110 active:scale-95 transition-all"
                        style={{
                            backgroundColor: "#6366f1",
                            borderRadius: "50%",
                            color: "#ffffff"
                        }}
                        title="SNS 공유 센터"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                    </Link>

                    <Link
                        href={injectedArtistId.startsWith('vip') ? `/add?vipId=${injectedArtistId}` : "/add"}
                        className="flex items-center justify-center w-14 h-14 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all"
                        style={{
                            backgroundColor: settings.theme === "black" ? "#10b981" : SIGNATURE_COLORS.antiqueBurgundy,
                            borderRadius: "50%"
                        }}
                        title="새 작품 등록"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
}
