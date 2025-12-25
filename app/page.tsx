"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getYearMonths, getArtworksByYearMonth, Artwork, YearMonthKey } from "./data/artworks";
import { loadDemoDataIfEmpty } from "./utils/demoData";
import { useSyncedArtworks, useSyncedSettings } from "./hooks/useSyncedArtworks";
import YearMonthTabs from "./components/YearMonthTabs";
import ArtworkCard from "./components/ArtworkCard";
import ArtworkViewer from "./components/ArtworkViewer";

function HomeContent() {
  // URL 쿼리 파라미터 읽기
  const searchParams = useSearchParams();
  const yearMonthParam = searchParams.get("yearMonth");

  // 실시간 동기화 훅 사용
  const { artworks, isLoading: artworksLoading, refresh: refreshArtworks } = useSyncedArtworks();
  const { settings, isLoading: settingsLoading } = useSyncedSettings();

  const [selectedYearMonth, setSelectedYearMonth] = useState<YearMonthKey | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<{
    artwork: Artwork;
    index: number;
    yearArtworks: Artwork[];
  } | null>(null);
  const [demoLoaded, setDemoLoaded] = useState(false);

  // 디버그 로그
  useEffect(() => {
    console.log("=== 작품 데이터 상태 ===");
    console.log("로딩 중:", artworksLoading);
    console.log("작품 개수:", artworks.length);
    if (artworks.length > 0) {
      console.log("첫 번째 작품:", artworks[0].title);
    }
  }, [artworks, artworksLoading]);

  // 데모 데이터 로드 비활성화 (Supabase에 이미 데이터가 있음)
  // useEffect(() => {
  //   if (!demoLoaded && !artworksLoading && artworks.length === 0) {
  //     loadDemoDataIfEmpty().then(() => {
  //       refreshArtworks();
  //       setDemoLoaded(true);
  //     });
  //   }
  // }, [demoLoaded, artworksLoading, artworks.length, refreshArtworks]);

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

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: bgColor, color: textColor }}
    >
      {/* 미니멀 헤더 */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: bgColor,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div
          className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6"
          style={{
            paddingTop: "12px",
            paddingBottom: "12px",
          }}
        >
          {/* 로고 - 영문 + 한글 조합 (클릭시 홈으로) */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <span
              className="text-xl sm:text-2xl"
              style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: textColor,
                whiteSpace: "nowrap",
              }}
            >
              {settings.galleryNameKo}
            </span>
          </Link>

          {/* 작가소개 + 설정 버튼 */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/about"
              className="text-sm sm:text-base"
              style={{
                textDecoration: "none",
                fontFamily: "'Noto Sans KR', sans-serif",
                color: settings.theme === "black" ? "#ffffff" : "#000000",
                fontWeight: 600,
                letterSpacing: "0.03em",
                borderBottom: `2px solid ${settings.theme === "black" ? "#ffffff" : "#000000"}`,
                paddingBottom: "2px",
                whiteSpace: "nowrap"
              }}
            >
              작가소개
            </Link>


            {/* 미술 소식 (신규) */}
            <Link
              href="/newsroom"
              className="text-sm sm:text-base"
              style={{
                textDecoration: "none",
                fontFamily: "'Noto Sans KR', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.03em",
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                paddingBottom: "2px",
                whiteSpace: "nowrap"
              }}
            >
              미술 소식 ✨
            </Link>
            {/* 설정 버튼 */}
            <Link
              href="/admin"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: settings.theme === "black" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                color: settings.theme === "black" ? "#888" : "#666",
                textDecoration: "none",
              }}
              aria-label="설정"
              title="갤러리 설정"
            >
              ⚙
            </Link>
          </div>
        </div>

        {/* 연도+월 네비게이션 */}
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
      </header>

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

      {/* 플로팅 버튼들 */}
      {artworks.length > 0 && (
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
            📤
          </Link>

          {/* 작품 추가 버튼 */}
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
        </div>
      )}

      {/* 풀스크린 뷰어 */}
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
