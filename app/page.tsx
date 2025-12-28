"use client";
// [GLOBAL_SYNC_TRIGGER_V1] Triggering automatic redeploy for all artist galleries via GitHub webhook
// Timestamp: 2025-12-28 04:50:00 (KST)
import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getYearMonths, getArtworksByYearMonth, Artwork, YearMonthKey } from "./data/artworks";
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


function HomeContent() {
  const searchParams = useSearchParams();
  const yearMonthParam = searchParams.get("yearMonth");
  const router = useRouter();

  const { artworks, isLoading: artworksLoading, refresh: refreshArtworks } = useSyncedArtworks();
  const { settings, isLoading: settingsLoading } = useSyncedSettings();
  const { isAuthenticated: isLoggedIn, logout } = useAuth();
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

  const handleKakaoShare = async () => {
    if (typeof window === 'undefined') return;

    const shareData = {
      title: settings.galleryNameKo || `${settings.artistName} 작가님의 온라인 화첩`,
      text: `${settings.artistName} 작가의 작품세계를 담은 온라인 화첩입니다.`,
      url: window.location.href,
    };

    // Native Share API 우선 사용
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        // 사용자가 취소한 경우 (AbortError)는 무시
        if (err.name !== 'AbortError') {
          // Native Share 실패 시 클립보드 복사
          try {
            await navigator.clipboard.writeText(window.location.href);
            alert('갤러리 주소가 복사되었습니다!\n카카오톡 대화창에 붙여넣기 해주세요.');
          } catch {
            prompt('갤러리 주소를 복사하세요:', window.location.href);
          }
        }
      }
    } else {
      // Native Share API 미지원 브라우저 → 클립보드 복사
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('갤러리 주소가 복사되었습니다!\n카카오톡 대화창에 붙여넣기 해주세요.');
      } catch {
        prompt('갤러리 주소를 복사하세요:', window.location.href);
      }
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
      </PaymentGate>

      {/* [FINAL_VISIBILITY_FIX] 작가(로그인) 전용 부유식 버튼 (36px / 12px) */}
      {isMounted && isLoggedIn && (
        <div
          id="author-only-floating-v7"
          className="fixed z-50 flex flex-col gap-3"
          style={{
            bottom: "24px",
            right: "12px",
            width: "36px"
          }}
        >
          {/* 1. SNS 공유 센터 (파란색) */}
          <Link
            href="/share"
            className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#6366f1",
              color: "#fff",
              textDecoration: "none",
              border: "none",
              boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>

          {/* 2. 작품 추가 (검정색) */}
          <Link
            href="/add"
            className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#1a1a1a",
              color: "#fff",
              fontSize: "20px",
              fontWeight: "bold",
              textDecoration: "none",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              lineHeight: 1
            }}
          >
            +
          </Link>
        </div>
      )}

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
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>불러오는 중...</p></div>}>
      <HomeContent />
    </Suspense>
  );
}
