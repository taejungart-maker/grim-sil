"use client";
// [GLOBAL_SYNC_TRIGGER_V1] Triggering automatic redeploy for all artist galleries via GitHub webhook
// Timestamp: 2025-12-28 04:50:00 (KST)
import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getYearMonths, getArtworksByYearMonth, Artwork, YearMonthKey } from "./data/artworks";
import { loadSettings, quickAddPick } from "./utils/settingsDb";
import { ARTIST_ID } from "./utils/supabase";
import { getThemeColors, SIGNATURE_COLORS } from "./utils/themeColors";
import type { SiteConfig } from "./config/site";
import { loadDemoDataIfEmpty } from "./utils/demoData";
import { useSyncedArtworks, useSyncedSettings } from "./hooks/useSyncedArtworks";
import { useAuth } from "./contexts/AuthContext";
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


function HomeContent() {
  const searchParams = useSearchParams();
  const yearMonthParam = searchParams.get("yearMonth");
  const visitorId = searchParams.get("visitor");
  const visitorName = searchParams.get("visitorName");
  const router = useRouter();

  const { artworks, isLoading: artworksLoading, refresh: refreshArtworks } = useSyncedArtworks();
  const { settings, isLoading: settingsLoading } = useSyncedSettings();
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
  const [showNewsTicker, setShowNewsTicker] = useState(true);
  const [showEncouragement, setShowEncouragement] = useState(true);
  const [showArtistPicks, setShowArtistPicks] = useState(true);
  const [quickAdded, setQuickAdded] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

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
  }, [artworks, yearMonthParam]);

  const isLoading = artworksLoading || settingsLoading;
  const colors = getThemeColors(settings.theme);
  const bgColor = colors.bg;
  const textColor = colors.text;
  const borderColor = colors.border;

  const yearMonths = useMemo(() => getYearMonths(artworks), [artworks]);
  const artworksByYearMonth = useMemo(() => getArtworksByYearMonth(artworks), [artworks]);
  const currentYearMonthArtworks = selectedYearMonth ? artworksByYearMonth.get(selectedYearMonth) || [] : [];

  const handleQuickAdd = async () => {
    if (isSubmitting) return;

    let currentOwnerId = ownerId;

    // 🛠 강력 보정: context에 없으면 직접 storage에서 꺼내옴
    if (!currentOwnerId && typeof window !== 'undefined') {
      currentOwnerId = localStorage.getItem('admin_owner_id');
    }

    // 방문자 ID 결정: URL 파라미터 우선, 그다음 ownerId
    const effectiveVisitorId = visitorId || ownerId;

    if (!effectiveVisitorId) {
      alert("로그인 정보가 부족합니다. 관리자 페이지에서 다시 로그인해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await quickAddPick(effectiveVisitorId, {
        name: settings.artistName,
        archiveUrl: window.location.href,
        imageUrl: settings.aboutmeImage
      });
      setQuickAdded(true);
      setTimeout(() => setShowQuickAdd(false), 3000);
    } catch (error) {
      console.error("Failed to quick add pick:", error);
      alert("추천 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleKakaoShare = async () => {
    setShowShareModal(true);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen pb-24" style={{ background: bgColor, color: textColor }}>
      <Header
        galleryNameKo={settings.galleryNameKo}
        theme={settings.theme}
        isLoggedIn={isLoggedIn}
        isPaid={isPaid}
        needsPayment={needsPayment}
        onLogout={() => { logout(); router.push("/"); router.refresh(); }}
        onOpenPayment={() => setShowPaymentModal(true)}
        onKakaoShare={handleKakaoShare}
      />

      {showNewsTicker && <NewsTicker theme={settings.theme} newsText={settings.newsText} />}

      {/* 🚀 동료 갤러리에서 방문한 작가에게 추천 버튼 표시 */}
      {showQuickAdd && (visitorId || (isLoggedIn && ownerId && ownerId !== ARTIST_ID)) && (
        <div style={{
          position: "fixed",
          bottom: "100px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          width: "90%",
          maxWidth: "400px",
          touchAction: "manipulation"
        }}>
          <button
            onClick={handleQuickAdd}
            type="button"
            disabled={quickAdded || isSubmitting}
            style={{
              width: "100%",
              padding: "20px",
              background: quickAdded ? "#22c55e" : (isSubmitting ? "#4a5568" : SIGNATURE_COLORS.antiqueBurgundy),
              color: "#fff",
              border: "none",
              borderRadius: "50px",
              fontSize: "18px",
              fontWeight: 800,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              cursor: quickAdded ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              animation: (quickAdded || isSubmitting) ? "none" : "pulse 2s infinite",
              transition: "all 0.1s",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
              transform: isSubmitting ? "scale(0.98)" : "none"
            }}
          >
            {quickAdded ? "✅ 내 화첩에 추천되었습니다!" : (isSubmitting ? "⏳ 등록 중..." : "🤝 내 화첩에 이 작가 추천하기")}
          </button>

          <style jsx>{`
            @keyframes pulse {
              0% { transform: scale(1); box-shadow: 0 10px 30px rgba(128, 48, 48, 0.3); }
              50% { transform: scale(1.05); box-shadow: 0 15px 40px rgba(128, 48, 48, 0.5); }
              100% { transform: scale(1); box-shadow: 0 10px 30px rgba(128, 48, 48, 0.3); }
            }
          `}</style>
        </div>
      )}

      <PaymentGate>
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
      </PaymentGate>

      <main className="max-w-6xl mx-auto" style={{ padding: "32px 24px" }}>
        {isLoading ? (
          <div className="text-center py-20" style={{ color: "#888" }}>
            <p style={{ fontSize: "14px" }}>불러오는 중...</p>
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20" style={{ color: "#666" }}>
            <p style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>◻</p>
            <p style={{ fontSize: "15px", color: "#1a1a1a", marginBottom: "8px" }}>아직 등록된 작품이 없습니다</p>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>첫 번째 작품을 추가해보세요</p>
            <Link href="/add" className="inline-flex items-center justify-center" style={{ padding: "14px 32px", fontSize: "14px", fontWeight: 500, color: "#fff", background: "#1a1a1a", borderRadius: "6px", textDecoration: "none" }}>+ 작품 추가</Link>
          </div>
        ) : (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: settings.gridColumns === 1 ? "1fr" : settings.gridColumns === 3 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
              gridAutoRows: settings.gridColumns === 1 ? "auto" : "180px",
              gap: settings.gridColumns === 1 ? "24px" : "8px",
            }}>
              {currentYearMonthArtworks.map((artwork: Artwork, index: number) => {
                let gridStyle: React.CSSProperties = {};
                if (settings.gridColumns >= 3 && currentYearMonthArtworks.length > 1) {
                  if (index === 0) gridStyle = { gridColumn: "span 2", gridRow: "span 2" };
                  else if (index === 5) gridStyle = { gridRow: "span 2" };
                  else if (index === 6) gridStyle = { gridColumn: "span 2" };
                  else if (index === 7) gridStyle = { gridRow: "span 2" };
                } else if (settings.gridColumns === 1) {
                  gridStyle = { aspectRatio: "16/10" };
                }
                return (
                  <div key={artwork.id} style={gridStyle}>
                    <ArtworkCard artwork={artwork} onClick={() => handleArtworkClick(artwork, index)} priority={index < 6} minimal />
                  </div>
                );
              })}
            </div>
            {currentYearMonthArtworks.length === 0 && selectedYearMonth && (
              <div className="text-center py-20" style={{ color: "#888" }}><p style={{ fontSize: "14px" }}>선택된 기간에 작품이 없습니다</p></div>
            )}
          </>
        )}
      </main>

      {showArtistPicks && <ArtistPicksSection theme={settings.theme} picks={settings.artistPicks} />}

      {showEncouragement && <EncouragementSection theme={settings.theme} />}

      {/* [FINAL_VISIBILITY_FIX] 작가(로그인) 전용 부유식 버튼 (원형 디자인 복원: 텍스트 직관성 강화) */}
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
            <Link
              href="/share"
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
              }}
            >
              <span>공유</span>
            </Link>

            {/* 2. 작품 등록 (앤틱 버건디) */}
            <Link
              href="/add"
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

      {
        selectedArtwork && (
          <ArtworkViewer
            artworks={selectedArtwork.yearArtworks}
            initialIndex={selectedArtwork.index}
            onClose={() => setSelectedArtwork(null)}
            onDelete={handleArtworkDeleted}
            showPrice={settings.showPrice}
            theme={settings.theme}
          />
        )
      }

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => router.refresh()} />
      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} onSuccess={() => window.location.reload()} />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={typeof window !== 'undefined' ? window.location.origin : ''}
        title={`${settings.artistName} 작가님의 온라인 화첩`}
        description={`${settings.artistName} 작가의 작품세계를 담은 공간입니다.`}
        theme={settings.theme}
      />
    </div >
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>불러오는 중...</p></div>}>
      <HomeContent />
    </Suspense>
  );
}
