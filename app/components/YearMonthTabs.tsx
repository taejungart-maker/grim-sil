"use client";

import { YearMonthKey, parseYearMonthKey } from "../data/artworks";

interface YearMonthTabsProps {
    yearMonths: YearMonthKey[];
    selectedYearMonth: YearMonthKey;
    onYearMonthSelect: (yearMonth: YearMonthKey) => void;
    theme?: "white" | "black";
}

export default function YearMonthTabs({ yearMonths, selectedYearMonth, onYearMonthSelect, theme = "white" }: YearMonthTabsProps) {
    // 고대비 색상 - 국립현대미술관 수준
    const activeTextColor = theme === "black" ? "#ffffff" : "#000000"; // 순수 검정
    const inactiveTextColor = theme === "black" ? "#d0d0d0" : "#000000"; // 비활성도 검정
    const activeBgColor = theme === "black" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";
    const hoverBgColor = theme === "black" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)";

    return (
        <div
            className="w-full overflow-x-auto"
            style={{
                padding: "12px 24px",
                // 스크롤바 숨기기
                scrollbarWidth: "none",
                msOverflowStyle: "none",
            }}
        >
            <div
                className="flex"
                style={{
                    minWidth: "max-content",
                    gap: "8px", // 탭 간 간격
                }}
            >
                {yearMonths.map((ym) => {
                    const { year, month } = parseYearMonthKey(ym);
                    const isSelected = selectedYearMonth === ym;

                    return (
                        <button
                            key={ym}
                            onClick={() => onYearMonthSelect(ym)}
                            style={{
                                // 최소 48dp x 48dp 터치 영역 확보
                                minWidth: "52px",
                                minHeight: "52px",
                                padding: "10px 16px",

                                // 배경 및 테두리
                                background: isSelected ? activeBgColor : "transparent",
                                border: "none",
                                borderRadius: "12px",

                                // 커서 및 트랜지션
                                cursor: "pointer",
                                transition: "all 0.2s ease",

                                // 플렉스 레이아웃 (연도/월 세로 배치)
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "2px",
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = hoverBgColor;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = "transparent";
                                }
                            }}
                            aria-pressed={isSelected}
                        >
                            {/* 월 (보조 정보, 작고 희미하게) */}
                            <span
                                style={{
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                    fontSize: month ? "13px" : "20px", // 월은 작게 13px, 연도만 있으면 20px
                                    fontWeight: isSelected ? 600 : 500, // 조금 가볍게
                                    color: isSelected
                                        ? (theme === "black" ? "#c0c0c0" : "#666666")
                                        : (theme === "black" ? "#888888" : "#888888"),
                                    letterSpacing: "0.02em",
                                    lineHeight: 1.2,
                                    order: 2, // 연도 아래에 표시
                                }}
                            >
                                {month ? `${month}월` : `${year}년`}
                            </span>

                            {/* 연도 (메인 정보, 크고 진하게) */}
                            {month && (
                                <span
                                    style={{
                                        fontFamily: "'Noto Sans KR', sans-serif",
                                        fontSize: "18px", // 연도 크게
                                        fontWeight: 700, // Bold
                                        color: isSelected
                                            ? (theme === "black" ? "#ffffff" : "#000000")
                                            : (theme === "black" ? "#d0d0d0" : "#1a1a1a"),
                                        letterSpacing: "0.01em",
                                        lineHeight: 1.2,
                                        order: 1, // 위에 표시
                                    }}
                                >
                                    {year}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
