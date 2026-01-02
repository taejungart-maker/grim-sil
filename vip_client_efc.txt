"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getYearMonths, getGroupedArtworksByYearMonth, Artwork, YearMonthKey, createYearMonthKey } from "../data/artworks";
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
import PolicyModal from "../components/PolicyModal";

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
    const [policyModal, setPolicyModal] = useState<{
        isOpen: boolean;
        policyId: "terms" | "privacy" | "refund" | "exchange";
    }>({
        isOpen: false,
        policyId: "terms"
    });

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
        const yearArtworks = artworks.filter(a => createYearMonthKey(a.year, a.month) === selectedYearMonth);
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
                    title: `[VIP] ${settings.artistName} ?묎??섏쓽 ?⑤씪???붿꺽`,
                    text: '?꾨━誘몄뾼 援щ룆 ?꾩슜 怨듦컙?낅땲??',
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
            alert("留곹겕媛 蹂듭궗?섏뿀?듬땲?? 移댁뭅?ㅽ넚??遺숈뿬?ｌ뼱 怨듭쑀??蹂댁꽭??");
        }).catch(err => {
            console.error('?대┰蹂대뱶 蹂듭궗 ?ㅽ뙣:', err);
        });
    };

    const isLoading = artworksLoading || settingsLoading;
    const yearMonths = getYearMonths(artworks);

    // Group artworks by year/month
    const groupedArtworks = useMemo(() => getGroupedArtworksByYearMonth(artworks), [artworks]);
    const currentYearMonthArtworks = selectedYearMonth ? (groupedArtworks.get(selectedYearMonth) || []) : [];

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
                isAlwaysFree={isAlwaysFree}
            />

            {/* [PG_SCREENING_FIX] ?곷떒 諛곕꼫 ?쒓굅 (Header??'援щ룆踰꾪듉'?쇰줈 ?쇱썝?뷀븯??肄섑뀗痢?媛?쒖꽦 ?뺣낫) */}

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
                            <p style={{ color: "#888", fontSize: "18px" }}>?꾩쭅 ?깅줉???묓뭹???놁뒿?덈떎.</p>
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
                                />
                            ))}
                        </div>
                    )}
                </main>

                {/* ?묒썝 硫붿떆吏 ?뱀뀡 */}
                {!policyModal.isOpen && <EncouragementSection theme={settings.theme} />}

                {/* 異붿쿇 ?묎? ?뱀뀡 */}
                {!policyModal.isOpen && settings.artistPicks && settings.artistPicks.length > 0 && (
                    <ArtistPicksSection picks={settings.artistPicks} theme={settings.theme} />
                )}

            </PaymentGate>

            {/* ?섎룄 留뚮뱾湲?CTA ?명꽣 */}
            <footer
                style={{
                    padding: "48px 24px 24px",
                    textAlign: "center",
                    borderTop: `1px solid ${borderColor}`,
                    background: settings.theme === "black" ? "#111" : "rgba(194, 188, 178, 0.1)",
                }}
            >
                <p
                    style={{
                        fontSize: "14px",
                        color: settings.theme === "black" ? "#888" : "#666",
                        marginBottom: "16px",
                        fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                >
                    ??媛ㅻ윭由ш? 留덉쓬???쒖뀲?섏슂?
                </p>
                <Link
                    href="/apply"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "14px 28px",
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: "#fff",
                        borderRadius: "50px",
                        textDecoration: "none",
                        fontSize: "15px",
                        fontWeight: 700,
                        fontFamily: "'Noto Sans KR', sans-serif",
                        boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                        transition: "transform 0.2s ease",
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    ?섎룄 媛ㅻ윭由?留뚮뱾湲?                </Link>
                <p
                    style={{
                        marginTop: "16px",
                        fontSize: "12px",
                        color: settings.theme === "black" ? "#555" : "#999",
                        fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                >
                    ?묎??섎쭔???⑤씪???붿꺽??留뚮뱾?대낫?몄슂
                </p>

                {/* ?ъ뾽???뺣낫 諛??뺤콉 (PG ?ъ궗 ?꾩닔) */}
                <div
                    style={{
                        marginTop: "48px",
                        paddingTop: "32px",
                        borderTop: `1px solid ${borderColor}`,
                        fontSize: "13px",
                        color: settings.theme === "black" ? "#666" : "#888",
                        lineHeight: 1.9,
                        fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                >
                    {/* ?뚯궗 ?뺣낫 */}
                    <div style={{ marginBottom: "20px" }}>
                        <div style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}>
                            <strong>?곹샇:</strong> ?쒖젙
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                            <strong>??쒖옄:</strong> ?ㅼ슜??                        </div>
                        <div style={{ marginBottom: "6px" }}>
                            <strong>?ъ뾽?먮벑濡앸쾲??</strong> 205-53-72177
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                            <strong>?듭떊?먮ℓ???좉퀬:</strong> ??025-?쒖슱以묎뎄-XXXX??(?좉퀬 ?덉젙)
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                            <strong>二쇱냼:</strong> ?쒖슱?밸퀎??以묎뎄 ?숉샇濡?1諛붽만 34, 101???좊떦??
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                            <strong>??쒖쟾??</strong> 010-8618-3323
                        </div>
                        <div>
                            <strong>?대찓??</strong> artflow010@gmail.com
                        </div>
                    </div>

                    {/* ?뺤콉 留곹겕 (PG ?ъ궗 ?꾩닔) */}
                    <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px" }}>
                        <button onClick={() => setPolicyModal({ isOpen: true, policyId: "terms" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>?댁슜?쎄?</button>
                        <span style={{ margin: "0 4px", opacity: 0.3 }}>|</span>
                        <button onClick={() => setPolicyModal({ isOpen: true, policyId: "privacy" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>媛쒖씤?뺣낫泥섎━諛⑹묠</button>
                        <span style={{ margin: "0 4px", opacity: 0.3 }}>|</span>
                        <button onClick={() => setPolicyModal({ isOpen: true, policyId: "refund" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>?섎텋 ?뺤콉</button>
                        <span style={{ margin: "0 4px", opacity: 0.3 }}>|</span>
                        <button onClick={() => setPolicyModal({ isOpen: true, policyId: "exchange" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>援먰솚 ?뺤콉</button>
                    </div>

                    <div style={{ fontSize: "12px", opacity: 0.5 }}>
                        &copy; 2024-{new Date().getFullYear()} {settings.galleryNameKo}. All rights reserved.
                    </div>
                </div>

                {/* 寃곗젣 諛?援щℓ ?덈궡 */}
                <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: `1px solid ${borderColor}`, textAlign: "center" }}>
                    <div style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
                        寃곗젣 ?덈궡
                    </div>
                    <div style={{ fontSize: "12px", color: settings.theme === "black" ? "#777" : "#999", lineHeight: 1.6 }}>
                        蹂??쒕퉬?ㅻ뒗 ??20,000?먯쓽 援щ룆 ?쒕퉬?ㅼ엯?덈떎. 寃곗젣??Port One???듯빐 ?덉쟾?섍쾶 泥섎━?⑸땲??
                        <br />
                        寃곗젣 ??<button onClick={() => setPolicyModal({ isOpen: true, policyId: "terms" })} style={{ textDecoration: 'underline', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>?댁슜?쎄?</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "privacy" })} style={{ textDecoration: 'underline', color: 'inherit' }}>媛쒖씤?뺣낫諛⑹묠</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "refund" })} style={{ textDecoration: 'underline', color: 'inherit' }}>?섎텋 ?뺤콉</button> 諛?<button onClick={() => setPolicyModal({ isOpen: true, policyId: "exchange" })} style={{ textDecoration: 'underline', color: 'inherit' }}>援먰솚 ?뺤콉</button>???숈쓽??寃껋쑝濡?媛꾩＜?⑸땲??
                        <br />
                        援щ룆 痍⑥냼 ???꾩빟湲??놁씠 利됱떆 ?댁? 媛?ν븯硫? ?⑥? 湲곌컙?????遺遺??섎텋? ?댁슜?쎄????곕쫭?덈떎.
                    </div>
                </div>
            </footer>

            {selectedArtwork && (
                <ArtworkViewer
                    artworks={selectedArtwork.yearArtworks}
                    initialIndex={selectedArtwork.index}
                    onClose={() => setSelectedArtwork(null)}
                    onDelete={handleArtworkDeleted}
                    theme={settings.theme as "white" | "black"}
                />
            )}

            <VIPPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={() => window.location.reload()}
            />

            {/* ?섎떒 ?뚮줈???≪뀡 踰꾪듉 (濡쒓렇???쒖뿉留??몄텧 & ?쎄? 紐⑤떖???ロ??덉쓣 ?뚮쭔) */}
            {isMounted && isLoggedIn && !policyModal.isOpen && (
                <div
                    id="author-only-floating-v9"
                    className="fixed z-50 flex flex-col gap-3"
                    style={{
                        bottom: "30px",
                        right: "20px",
                    }}
                >
                    {/* 1. SNS 怨듭쑀 */}
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                        style={{
                            width: "46px",
                            height: "46px",
                            borderRadius: "50%",
                            background: settings.theme === "black" ? "#4f46e5" : SIGNATURE_COLORS.royalIndigo,
                            color: "#fff",
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
                        <span>怨듭쑀</span>
                    </button>

                    {/* 2. ?묓뭹 ?깅줉 */}
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
                        <span>?깅줉</span>
                    </Link>
                </div>
            )}

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                title={`[VIP] ${settings.artistName} ?묎??섏쓽 ?⑤씪???붿꺽`}
                description={`?꾨━誘몄뾼 援щ룆 ?꾩슜 怨듦컙?낅땲??`}
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
