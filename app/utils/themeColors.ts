/**
 * 🎨 시그니처 컬러 팔레트 (Premium Antique)
 * 선생님께서 제안해주신 시그니처 색상을 정의합니다.
 */
export const SIGNATURE_COLORS = {
    // Main Base: 에이징 페이퍼 (배경색)
    agingPaper: "#F5F2ED",

    // Key Point: 로얄 인디고 (메인 컬러, 프레임)
    royalIndigo: "#1B263B",

    // Deep Action: 앤틱 버건디 (강조/클릭, 버튼)
    antiqueBurgundy: "#803030",

    // Soft Shadow: 샌드 그레이 (그림자)
    sandGray: "#C2BCB2",

    // Text Primary: 잉크 차콜 (본문 글씨)
    inkCharcoal: "#2D2D2D",
};

/**
 * 테마별 색상 반환 함수
 * 기본적으로 white 테마일 때 선생님의 시그니처 컬러를 적용합니다.
 */
export function getThemeColors(theme: "white" | "black") {
    if (theme === "black") {
        return {
            bg: "#1a1a1a",
            text: "#ffffff",
            border: "#333",
            accent: "#6366f1",
            button: "#1a1a1a",
            shadow: "rgba(0,0,0,0.3)",
        };
    }

    // Signature (White) Theme
    return {
        bg: SIGNATURE_COLORS.agingPaper,
        text: SIGNATURE_COLORS.inkCharcoal,
        border: SIGNATURE_COLORS.sandGray,
        accent: SIGNATURE_COLORS.royalIndigo,
        button: SIGNATURE_COLORS.antiqueBurgundy,
        shadow: SIGNATURE_COLORS.sandGray,
    };
}
