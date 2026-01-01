"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getYearMonths, getArtworksByYearMonth, Artwork, YearMonthKey, createYearMonthKey } from "../data/artworks";
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

    // Group artworks by year/month
    const groupedArtworks = useMemo(() => getArtworksByYearMonth(artworks), [artworks]);
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

            {/* [PG_SCREENING_FIX] 상단 배너 제거 (Header의 '구독버튼'으로 일원화하여 콘텐츠 가시성 확보) */}

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
                                />
                            ))}
                        </div>
                    )}
                </main>

                {/* 응원 메시지 섹션 */}
                {!policyModal.isOpen && <EncouragementSection theme={settings.theme} />}

                {/* 추천 작가 섹션 */}
                {!policyModal.isOpen && settings.artistPicks && settings.artistPicks.length > 0 && (
                    <ArtistPicksSection picks={settings.artistPicks} theme={settings.theme} />
                )}

            </PaymentGate>

            {/* 나도 만들기 CTA 푸터 */}
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
                    이 갤러리가 마음에 드셨나요?
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
                    나도 갤러리 만들기
                </Link>
                <p
                    style={{
                        marginTop: "16px",
                        fontSize: "12px",
                        color: settings.theme === "black" ? "#555" : "#999",
                        fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                >
                    작가님만의 온라인 화첩을 만들어보세요
                </p>

                {/* 사업자 정보 및 정책 (PG 심사 필수) */}
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
                    {/* 회사 정보 */}
                    <div style={{ marginBottom: "20px" }}>
                        <div style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}>
                            <strong>상호:</strong> 태정
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                            <strong>대표자:</strong> 오용택
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                            <strong>사업자등록번호:</strong> 205-53-72177
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                            <strong>통신판매업 신고:</strong> 제2025-서울중구-XXXX호 (신고 예정)
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                            <strong>주소:</strong> 서울특별시 중구 동호로11바길 34, 101호(신당동)
                        </div>
                        <div style={{ marginBottom: "6px" }}>
                            <strong>대표전화:</strong> 010-8618-3323
                        </div>
                        <div>
                            <strong>이메일:</strong> artflow010@gmail.com
                        </div>
                    </div>

                    {/* 정책 링크 (PG 심사 필수) */}
                    <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px" }}>
                        <button onClick={() => setPolicyModal({ isOpen: true, policyId: "terms" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>이용약관</button>
                        <span style={{ margin: "0 4px", opacity: 0.3 }}>|</span>
                        <button onClick={() => setPolicyModal({ isOpen: true, policyId: "privacy" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>개인정보처리방침</button>
                        <span style={{ margin: "0 4px", opacity: 0.3 }}>|</span>
                        <button onClick={() => setPolicyModal({ isOpen: true, policyId: "refund" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>환불 정책</button>
                        <span style={{ margin: "0 4px", opacity: 0.3 }}>|</span>
                        <button onClick={() => setPolicyModal({ isOpen: true, policyId: "exchange" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>교환 정책</button>
                    </div>

                    <div style={{ fontSize: "12px", opacity: 0.5 }}>
                        &copy; 2024-{new Date().getFullYear()} {settings.galleryNameKo}. All rights reserved.
                    </div>
                </div>

                {/* 결제 및 구매 안내 */}
                <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: `1px solid ${borderColor}`, textAlign: "center" }}>
                    <div style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
                        결제 안내
                    </div>
                    <div style={{ fontSize: "12px", color: settings.theme === "black" ? "#777" : "#999", lineHeight: 1.6 }}>
                        본 서비스는 월 20,000원의 구독 서비스입니다. 결제는 Port One을 통해 안전하게 처리됩니다.
                        <br />
                        결제 시 <button onClick={() => setPolicyModal({ isOpen: true, policyId: "terms" })} style={{ textDecoration: 'underline', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>이용약관</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "privacy" })} style={{ textDecoration: 'underline', color: 'inherit' }}>개인정보방침</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "refund" })} style={{ textDecoration: 'underline', color: 'inherit' }}>환불 정책</button> 및 <button onClick={() => setPolicyModal({ isOpen: true, policyId: "exchange" })} style={{ textDecoration: 'underline', color: 'inherit' }}>교환 정책</button>에 동의한 것으로 간주됩니다.
                        <br />
                        구독 취소 시 위약금 없이 즉시 해지 가능하며, 남은 기간에 대한 부분 환불은 이용약관에 따릅니다.
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

            {/* 하단 플로팅 액션 버튼 (로그인 시에만 노출 & 약관 모달이 닫혀있을 때만) */}
            {isMounted && isLoggedIn && !policyModal.isOpen && (
                <div
                    id="author-only-floating-v9"
                    className="fixed z-50 flex flex-col gap-3"
                    style={{
                        bottom: "30px",
                        right: "20px",
                    }}
                >
                    {/* 1. SNS 공유 */}
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
                        <span>공유</span>
                    </button>

                    {/* 2. 작품 등록 */}
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
            )}

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
                title={`[VIP] ${settings.artistName} 작가님의 온라인 화첩`}
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
