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

    // 각 섹션 표시 여부 (하위 호환성 및 빌드 오류 방지)
    showArtistNote: true as boolean,
    showCritique: true as boolean,
    showHistory: true as boolean,

    // 대표 작가노트 (새 작품 등록 시 자동 적용)
    defaultArtistNote: "" as string,

    aboutmeNote: "" as string,
    aboutmeCritique: "" as string,
    aboutmeHistory: "" as string,
    aboutmeImage: "" as string,

    // 동료 작가 추천 (Artist's Pick)
    artistPicks: [] as { name: string; archiveUrl: string; imageUrl?: string }[],

    // 실시간 뉴스 문구
    newsText: "🎨 작가님의 새로운 소식과 전시 일정을 전해드립니다. 방문해 주신 모든 분들을 환영합니다. ✨" as string,
};

// 관리자 비밀번호 (구매 후 변경하세요!)
export const ADMIN_PASSWORD = "admin1234";

// 설정 타입
export interface SiteConfig {
    galleryNameEn: string;
    galleryNameKo: string;
    artistName: string;
    siteTitle: string;
    siteDescription: string;
    theme: "white" | "black";
    gridColumns: 1 | 3 | 4;
    showPrice: boolean;
    showArtistNote: boolean;
    showCritique: boolean;
    showHistory: boolean;
    defaultArtistNote: string;
    aboutmeNote: string;
    aboutmeCritique: string;
    aboutmeHistory: string;
    aboutmeImage: string;
    artistPicks: { name: string; archiveUrl: string; imageUrl?: string }[];
    newsText: string;
}

export type SiteConfigType = typeof defaultSiteConfig;

// 하위 호환성을 위한 export
export const siteConfig = defaultSiteConfig;
