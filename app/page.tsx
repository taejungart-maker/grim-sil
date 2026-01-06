"use client";
// ⚠️⚠️⚠️ [DESIGN_LOCKED_DEC25] 12월 25일 승인된 디자인 - 절대 변경 금지 ⚠️⚠️⚠️
// 이 파일의 그리드 레이아웃은 12월 25일에 최종 승인된 디자인입니다.
// 변경 시 반드시 사용자 승인 필요! (270-295번 라인 특히 주의)
// Timestamp: 2026-01-03 17:05:00 (KST) - Fixed pattern: 0th=2x2, 5th=1x2, 6th=2x1, 7th=1x2
import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getYearMonths, getArtworksByYearMonth, Artwork, YearMonthKey } from "./data/artworks";
import { loadSettings, quickAddPick } from "./utils/settingsDb";
import { ARTIST_ID } from "./utils/supabase";
import { getThemeColors, SIGNATURE_COLORS } from "./utils/themeColors";
import type { SiteConfig } from "./config/site";
import { loadDemoDataIfEmpty } from "./utils/demoData";
import { getLastCapturedColor } from "./utils/colorExtractor";
import { useSyncedArtworks, useSyncedSettings } from "./hooks/useSyncedArtworks";
import { useAuth } from "./contexts/AuthContext";
import GalleryFeed from "./components/GalleryFeed";
import BusinessFooter from "./components/BusinessFooter";
import ExpiredOverlay from "./components/ExpiredOverlay";
import Header from "./components/Header";
import NewsTicker from "./components/NewsTicker";
import PaymentGate from "./components/PaymentGate";
import YearMonthTabs from "./components/YearMonthTabs";
import ArtistPicksSection from "./components/ArtistPicksSection";
import EncouragementSection from "./components/EncouragementSection";
import ArtworkViewer from "./components/ArtworkViewer";
import LoginModal from "./components/LoginModal";
import PaymentModal from "./components/PaymentModal";
import ShareModal from "./components/ShareModal";
import { usePayment } from "./contexts/PaymentContext";
import { isPaymentRequired } from "./utils/deploymentMode";



function HomeContent() {
  const searchParams = useSearchParams();
  const yearMonthParam = searchParams.get("yearMonth");
  const visitorId = searchParams.get("visitor");
  const visitorName = searchParams.get("visitorName");
  const latestInspirationId = searchParams.get("latest");
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
  const [showNewsTicker, setShowNewsTicker] = useState(false); // 도록 스타일에서는 기본적으로 숨김
  const [showEncouragement, setShowEncouragement] = useState(true);
  const [showArtistPicks, setShowArtistPicks] = useState(true);
  const [quickAdded, setQuickAdded] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isMounted, setIsMounted] = useState(false);


  useEffect(() => {
    setIsMounted(true);
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
    const shareData = {
      title: `${settings.artistName} 작가님의 온라인 Gallery`,
      text: `${settings.artistName} 작가의 작품세계를 담은 공간입니다.`,
      url: typeof window !== 'undefined' ? window.location.href : ''
    };

    // Web Share API 시도
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        // 사용자가 취소한 경우는 조용히 무시
        if (err.name === 'AbortError') {
          return;
        }
        // 다른 에러는 fallback으로
      }
    }

    // Fallback: 클립보드 복사
    const message = `${shareData.text}\n\n${shareData.url}`;
    try {
      await navigator.clipboard.writeText(message);
      alert('링크가 복사되었습니다! 카카오톡이나 문자로 전송하세요.');
    } catch {
      alert('공유 기능을 사용할 수 없습니다. 링크를 직접 복사해주세요:\n' + shareData.url);
    }
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

      {/* 구독 만료 시 흐린 유리 오버레이 */}
      {needsPayment && !isPaid && (
        <ExpiredOverlay
          galleryName={settings.galleryNameKo}
          onResubscribe={() => setShowPaymentModal(true)}
        />
      )}

      {/* 🚀 동행 갤러리에서 방문한 작가에게 추천 버튼 표시 */}
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
            {quickAdded ? "✅ 등록 완료" : (isSubmitting ? "⏳ 처리 중..." : "🤝 컬렉션에 추가하기")}
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
        <GalleryFeed
          artworks={currentYearMonthArtworks}
          isLoading={isLoading}
          gridColumns={settings.gridColumns}
          onArtworkClick={(artwork, index) => handleArtworkClick(artwork, index)}
          selectedYearMonth={selectedYearMonth}
        />
      </main>

      {showArtistPicks && <ArtistPicksSection theme={settings.theme} picks={settings.artistPicks} />}

      {showEncouragement && <EncouragementSection theme={settings.theme} />}

      {/* 나도 만들기 CTA 푸터 */}
      <BusinessFooter theme={settings.theme} borderColor={borderColor} />

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
                width: "48px",
                height: "48px",
                borderRadius: "2px", // 원형 대신 사각형 혹은 아주 살짝 둥근 모서리로 중후함 부여
                background: "var(--primary)",
                color: "#fff",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                fontSize: "13px",
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
              }}
            >
              <span>공유</span>
            </Link>

            {/* 2. 작품 등록 (앤틱 버건디) */}
            <Link
              href="/add"
              className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "2px",
                background: "var(--accent)",
                color: "#fff",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                fontSize: "13px",
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
              }}
            >
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
        title={`${settings.artistName} 작가님의 온라인 Gallery`}
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
