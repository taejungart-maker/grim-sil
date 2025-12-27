"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
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

  // 클립보드 복사 폴백 함수
  const fallbackToCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('갤러리 주소가 복사되었습니다!\n카카오톡 대화창에 붙여넣기 해주세요.');
    } catch (error) {
      // 클립보드 API도 실패한 경우 수동 복사 안내
      const userInput = prompt('갤러리 주소를 복사하세요:', url);
      if (userInput === null) {
        console.log('공유 취소됨');
      }
    }
  };

  // 네이티브 공유 핸들러 (스마트폰 공유 메뉴)
  const handleKakaoShare = async () => {
    const shareUrl = window.location.origin;
    const title = `${settings.artistName} 작가님의 온라인 화첩`;
    const description = `${settings.artistName} 작가의 작품세계를 담은 공간입니다.`;

    // 네이티브 공유 API 사용 (모바일에서 카카오톡 포함)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
        // 공유 성공 (사용자가 공유를 완료함)
        console.log('공유 완료');
      } catch (error: any) {
        // AbortError는 사용자가 공유를 취소한 경우 (정상 동작)
        if (error.name !== 'AbortError') {
          console.error('공유 실패:', error);
          // 공유 실패 시 클립보드 복사로 폴백
          await fallbackToCopy(shareUrl);
        }
      }
    } else {
      // 데스크톱 또는 Web Share API 미지원: URL 복사
      await fallbackToCopy(shareUrl);
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
              borderTop: `1px solid ${borderColor}`,
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

      {/* 플로팅 버튼들 */}
      {
        artworks.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
            {/* SNS 공유 센터 버튼 */}
            <Link
              href="/share"
              className="flex items-center justify-center shadow-lg"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#6366f1", // 고급스러운 보라빛 파랑
                color: "#fff",
                fontSize: "22px",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
              aria-label="SNS 공유 센터"
              title="SNS 공유 센터로 이동"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </Link>

            {/* 작품 추가 버튼 - 결제 필요 모드에서는 결제 완료 시에만 노출 */}
            {(!needsPayment || isPaid) && (
              <Link
                href="/add"
                className="flex items-center justify-center shadow-lg"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: settings.theme === "black" ? "#fff" : "#1a1a1a",
                  color: settings.theme === "black" ? "#1a1a1a" : "#fff",
                  fontSize: "24px",
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                aria-label="작품 추가"
              >
                +
              </Link>
            )}
          </div>
        )
      }

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

      {/* 결제 모달 */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          // 결제 성공 시 앱 상태 업데이트
          window.location.reload();
        }}
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
