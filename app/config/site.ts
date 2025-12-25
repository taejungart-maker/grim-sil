// ============================================
// 🎨 갤러리 설정 파일
// 관리자 페이지에서 수정 가능합니다!
// ============================================

// 기본 설정값 (처음 설치 시 사용)
export const defaultSiteConfig = {
    // 갤러리 영문 이름 (로고)
    galleryNameEn: "Online Gallery",

    // 갤러리 한글 이름
    galleryNameKo: "온라인 갤러리",

    // 작가 이름
    artistName: "작가님",

    // 사이트 타이틀 (브라우저 탭에 표시)
    siteTitle: "작가님의 온라인 화첩",

    // 사이트 설명 (SEO용)
    siteDescription: "작가님의 작품세계를 담은 온라인 화첩입니다.",

    // 테마 색상: "white" 또는 "black"
    theme: "white" as "white" | "black",

    // 작품 그리드 열 수: 1, 3, 4
    gridColumns: 4 as 1 | 3 | 4,

    // 가격 표시 여부
    showPrice: false as boolean,

    // 대표 작가노트 (새 작품 등록 시 자동 적용)
    defaultArtistNote: "" as string,

    // 작가 소개 및 평론 설정
    showArtistNote: true as boolean,
    showCritique: false as boolean,
    showHistory: false as boolean,
    aboutmeNote: "" as string,
    aboutmeCritique: "" as string,
    aboutmeHistory: "" as string,
    aboutmeImage: "" as string,
};

// 관리자 비밀번호 (구매 후 변경하세요!)
export const ADMIN_PASSWORD = "admin1234";

// 설정 타입
export type SiteConfig = typeof defaultSiteConfig;

// 하위 호환성을 위한 export
export const siteConfig = defaultSiteConfig;
