```javascript
"use client";
// [FORCE_DEPLOY_20251228_0325] 핵융합 배포 - 모든 사용자 동일 버튼 크기 (36px/12px) 강제 적용
import { useState, useEffect, useMemo, useCallback, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
// [FORCE_DEPLOY_20251228_0325] 핵융합 배포 - 캐시 무력화
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
  // URL 쿼리 파라미터 읽기
  const searchParams = useSearchParams();
  const yearMonthParam = searchParams.get("yearMonth");
  const router = useRouter();

  // 실시간 동기화 훅 사용
  const { artworks, isLoading: artworksLoading, refresh: refreshArtworks } = useSyncedArtworks();
  const { settings, isLoading: settingsLoading } = useSyncedSettings();

  // 전역 인증 상태 사용
  const { isAuthenticated: isLoggedIn, logout } = useAuth();

  // 로그아웃 핸들러
  const handleLogout = () => {
    logout();
    router.push("/");
    router.refresh();
  };

  // 전역 결제 상태 사용
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

  // URL 파라미터 처리 (클라이언트에서만)
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      // URL에 showPayment=true가 있으면 모달 열기
      if (searchParams.get("showPayment") === "true") {
        setShowPaymentModal(true);
      }
    }
  }, [searchParams]);

  // 디버그 로그
  useEffect(() => {
    console.log("=== 작품 데이터 상태 ===");
    console.log("로딩 중:", artworksLoading);
    console.log("작품 개수:", artworks.length);
    if (artworks.length > 0) {
      console.log("첫 번째 작품:", artworks[0].title);
    }
  }, [artworks, artworksLoading]);

  // 데모 데이터 자동 로드 (작품이 없을 때만)
  useEffect(() => {
    if (!demoLoaded && !artworksLoading && artworks.length === 0) {
      loadDemoDataIfEmpty().then(() => {
        refreshArtworks();
        setDemoLoaded(true);
      });
    }
  }, [demoLoaded, artworksLoading, artworks.length, refreshArtworks]);

  // 연도/월 선택 초기화 (URL 파라미터 우선)
  useEffect(() => {
    if (artworks.length > 0) {
      const yearMonths = getYearMonths(artworks);

      // URL 파라미터가 있으면 해당 연도-월 선택 (목록에 있든 없든 시도)
      if (yearMonthParam) {
        // URL 파라미터 형식이 목록에 있으면 선택
        if (yearMonths.includes(yearMonthParam as YearMonthKey)) {
          setSelectedYearMonth(yearMonthParam as YearMonthKey);
          return;
        }
        // 목록에 없으면 첫 번째 탭 선택
      }

      // 기본값: 첫 번째 탭
      if (!selectedYearMonth || !yearMonths.includes(selectedYearMonth)) {
        setSelectedYearMonth(yearMonths[0]);
      }
    }
  }, [artworks, yearMonthParam]);

  const isLoading = artworksLoading || settingsLoading;

  // 테마 색상
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

  // 공유 핸들러 (시스템 공유창 우선 연동)
  const handleKakaoShare = () => {
    if (typeof window === 'undefined') return;

    const shareData = {
      title: settings.galleryNameKo || `${ settings.artistName } 작가님의 온라인 화첩`,
      text: `${ settings.artistName } 작가의 작품세계를 담은 온라인 화첩입니다.`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData)
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setShowShareModal(true);
          }
        });
    } else {
      setShowShareModal(true);
    }
  };

  if (!isMounted) return null;

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: bgColor, color: textColor }}
    >
      {/* 2층 헤더 */}
      <Header
        galleryNameKo={settings.galleryNameKo}
        theme={settings.theme}
        isLoggedIn={isLoggedIn}
        isPaid={isPaid}
        needsPayment={needsPayment}
        onLogout={handleLogout}
        onOpenPayment={() => setShowPaymentModal(true)}
        onKakaoShare={handleKakaoShare}
      />

      {/* 연도+월 네비게이션 */}
      <PaymentGate>
        {yearMonths.length > 0 && selectedYearMonth && (
          <div
            style={{
              borderTop: `1px solid ${ borderColor } `,
              background: bgColor,
            }}
          >
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

        {/* 작품 그리드 */}
        <main
          className="max-w-6xl mx-auto"
          style={{ padding: "32px 24px" }}
        >
          {isLoading ? (
            <div
              className="text-center py-20"
              style={{ color: "#888" }}
            >
              <p style={{ fontSize: "14px" }}>불러오는 중...</p>
            </div>
          ) : artworks.length === 0 ? (
            /* 작품이 없을 때 */
            <div
              className="text-center py-20"
              style={{ color: "#666" }}
            >
              <p style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>◻</p>
              <p
                style={{
                  fontSize: "15px",
                  color: "#1a1a1a",
                  marginBottom: "8px",
                }}
              >
                아직 등록된 작품이 없습니다
              </p>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>
                첫 번째 작품을 추가해보세요
              </p>
              <Link
                href="/add"
                className="inline-flex items-center justify-center"
                style={{
                  padding: "14px 32px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#fff",
                  background: "#1a1a1a",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                + 작품 추가
              </Link>
            </div>
          ) : (
            <>
              {/* 매거진 스타일 레이아웃 - 첫 작품 크게, 나머지 그리드 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: settings.gridColumns === 1
                    ? "1fr"
                    : settings.gridColumns === 3
                      ? "repeat(3, 1fr)"
                      : "repeat(4, 1fr)",
                  gridAutoRows: settings.gridColumns === 1 ? "auto" : "180px",
                  gap: settings.gridColumns === 1 ? "24px" : "8px",
                }}
              >
                {currentYearMonthArtworks.map((artwork: Artwork, index: number) => {
                  let gridStyle: React.CSSProperties = {};

                  if (settings.gridColumns >= 3 && currentYearMonthArtworks.length > 1) {
                    // 레퍼런스 패턴: 첫 작품 2행, 중간에 세로로 긴 작품들
                    if (index === 0) {
                      // 첫 번째 작품: 왼쪽에 크게 (2행 차지)
                      gridStyle = {
                        gridColumn: "span 2",
                        gridRow: "span 2",
                      };
                    } else if (index === 5) {
                      // 5번째 작품: 세로로 길게 (2행)
                      gridStyle = {
                        gridRow: "span 2",
                      };
                    } else if (index === 6) {
                      // 6번째 작품 (가방): 가로로 넓게 (2열)
                      gridStyle = {
                        gridColumn: "span 2",
                      };
                    } else if (index === 7) {
                      // 7번째 작품: 세로로 길게 (2행)
                      gridStyle = {
                        gridRow: "span 2",
                      };
                    }
                  } else if (settings.gridColumns === 1) {
                    gridStyle = { aspectRatio: "16/10" };
                  }

                  return (
                    <div key={artwork.id} style={gridStyle}>
                      <ArtworkCard
                        artwork={artwork}
                        onClick={() => handleArtworkClick(artwork, index)}
                        priority={index < 6}
                        minimal
                      />
                    </div>
                  );
                })}
              </div>

              {currentYearMonthArtworks.length === 0 && selectedYearMonth && (
                <div
                  className="text-center py-20"
                  style={{ color: "#888" }}
                >
                  <p style={{ fontSize: "14px" }}>
                    선택된 기간에 작품이 없습니다
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </PaymentGate>

      {/* [NUCLEAR_ULTRA_FIX_V4] 모든 사용자 대상 버튼 (36px / 12px) - 클라이언트 사이드 강제 렌더링 */}
      {isMounted && (
        <div
          id="ultra-nuclear-floating-container-v4"
          className="fixed z-50 flex flex-col gap-3"
          style={{
            bottom: "24px",
            right: "12px",
            width: "36px"
          }}
        >
          {/* 1. SNS 공유 센터 (파란색) */}
          {isLoggedIn ? (
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
          ) : (
            <button
              onClick={handleKakaoShare}
              className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#6366f1",
                color: "#fff",
                border: "none",
                boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)",
                cursor: "pointer"
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </button>
          )}

          {/* 2. 작품 추가 (검정색) */}
          {isLoggedIn ? (
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
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#1a1a1a",
                color: "#fff",
                fontSize: "20px",
                fontWeight: "bold",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                cursor: "pointer",
                lineHeight: 1
              }}
            >
              +
            </button>
          )}
        </div>
      )}

      {/* 풀스크린 뷰어 */}
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

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* 결제 모달 */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          // 결제 성공 시 앱 상태 업데이트
          window.location.reload();
        }}
      />

      {/* 공유 모달 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={typeof window !== 'undefined' ? window.location.origin : ''}
        title={`${ settings.artistName } 작가님의 온라인 화첩`}
        description={`${ settings.artistName } 작가의 작품세계를 담은 공간입니다.`}
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
