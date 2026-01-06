"use client";

import { YearMonthKey, parseYearMonthKey } from "../data/artworks";
import { getThemeColors, SIGNATURE_COLORS } from "../utils/themeColors";

interface YearMonthTabsProps {
    yearMonths: YearMonthKey[];
    selectedYearMonth: YearMonthKey;
    onYearMonthSelect: (yearMonth: YearMonthKey) => void;
    theme?: "white" | "black";
}

export default function YearMonthTabs({ yearMonths, selectedYearMonth, onYearMonthSelect, theme = "white" }: YearMonthTabsProps) {
    // [V1.1.7_DEBUG] 브라우저 콘솔에서 확인 가능
    if (typeof window !== 'undefined') {
        console.log("Round Button Style Applied (YearTabs)!");
    }

    // 연도 탭 색상 - 사용자 요구사항에 맞춘 색상
    const colors = getThemeColors(theme);
    const activeTextColor = theme === "black" ? "#ffffff" : "#ffffff";
    const inactiveTextColor = theme === "black" ? "#6B7280" : SIGNATURE_COLORS.sandGray;
    const activeBgColor = theme === "black" ? "#6366f1" : "rgba(27, 38, 59, 0.05)"; // 도록 느낌의 아주 연한 배경
    const activeBorderColor = theme === "black" ? "transparent" : SIGNATURE_COLORS.royalIndigo;
    const activeTextColorFixed = theme === "black" ? "#ffffff" : SIGNATURE_COLORS.royalIndigo;
    const hoverBgColor = theme === "black" ? "rgba(255,255,255,0.08)" : "rgba(194, 188, 178, 0.2)";

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
                            className="force-circle"
                            style={{
                                // 최소 48dp x 48dp 터치 영역 확보
                                minWidth: "52px",
                                minHeight: "52px",
                                padding: "10px 16px",

                                background: isSelected ? activeBgColor : "transparent",
                                border: isSelected ? `1.5px solid ${activeBorderColor}` : "1px solid #ddd",
                                borderRadius: "9999px", // [BRUTE_FORCE] 인라인 스타일 주입

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
                                    fontFamily: "'Noto Serif KR', serif !important",
                                    fontSize: month ? "13px" : "20px", // 월은 작게 13px, 연도만 있으면 20px
                                    fontWeight: isSelected ? 700 : 400,
                                    color: isSelected ? activeTextColorFixed : inactiveTextColor,
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
                                        fontFamily: "'Noto Serif KR', serif !important",
                                        fontSize: "18px", // 연도 크게
                                        fontWeight: isSelected ? 800 : 400, // 선택 시에만 Bold
                                        color: isSelected ? activeTextColorFixed : inactiveTextColor,
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
