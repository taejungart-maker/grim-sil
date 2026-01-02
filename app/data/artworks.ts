// 작품 데이터 타입 정의
export interface Artwork {
    id: string;
    title: string;           // 작품 제목
    year: number;            // 제작 연도
    month?: number;          // 제작 월 (1-12, 선택)
    dimensions: string;      // 크기 (예: "100 x 80 cm")
    medium: string;          // 재료 (예: "캔버스에 유채")
    imageUrl: string;        // 이미지 경로
    description?: string;    // 작품 설명 (선택)
    price?: string;          // 가격 (선택, 예: "1,500,000원")
    artistName?: string;     // 작가 이름 (선택)
}

// 연도+월 키 타입 (예: "2023-5")
export type YearMonthKey = string;

// 연도+월 키 생성
export function createYearMonthKey(year: number, month?: number): YearMonthKey {
    return month ? `${year}-${month}` : `${year}`;
}

// 연도+월 키 파싱
export function parseYearMonthKey(key: YearMonthKey): { year: number; month?: number } {
    const parts = key.split("-");
    return {
        year: parseInt(parts[0]),
        month: parts[1] ? parseInt(parts[1]) : undefined,
    };
}

// 연도+월 표시 문자열 (예: "2023년 5월")
export function formatYearMonth(key: YearMonthKey): string {
    const { year, month } = parseYearMonthKey(key);
    return month ? `${year}년 ${month}월` : `${year}년`;
}

// 샘플 작품 데이터 (테스트용)
export const sampleArtworks: Artwork[] = [
    {
        id: "1",
        title: "봄날의 정원",
        year: 2024,
        month: 3,
        dimensions: "100 × 80 cm",
        medium: "캔버스에 유채",
        imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
        description: "따뜻한 봄날의 정원을 담은 작품"
    },
    {
        id: "2",
        title: "고요한 바다",
        year: 2024,
        month: 1,
        dimensions: "120 × 90 cm",
        medium: "캔버스에 아크릴",
        imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
        description: "새벽녘 고요한 바다의 풍경"
    },
    {
        id: "3",
        title: "가을 산책",
        year: 2024,
        month: 3,
        dimensions: "80 × 60 cm",
        medium: "캔버스에 유채",
        imageUrl: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80",
    },
    {
        id: "4",
        title: "도시의 밤",
        year: 2023,
        month: 5,
        dimensions: "150 × 100 cm",
        medium: "캔버스에 혼합재료",
        imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
    },
    {
        id: "5",
        title: "꽃과 나비",
        year: 2023,
        month: 5,
        dimensions: "60 × 60 cm",
        medium: "캔버스에 유채",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    },
    {
        id: "6",
        title: "겨울 풍경",
        year: 2023,
        month: 12,
        dimensions: "100 × 70 cm",
        medium: "캔버스에 아크릴",
        imageUrl: "https://images.unsplash.com/photo-1551913902-c92207136625?w=800&q=80",
    },
    {
        id: "7",
        title: "추상 No.1",
        year: 2022,
        dimensions: "90 × 90 cm",
        medium: "캔버스에 혼합재료",
        imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80",
    },
    {
        id: "8",
        title: "자연의 숨결",
        year: 2022,
        dimensions: "120 × 80 cm",
        medium: "캔버스에 유채",
        imageUrl: "https://images.unsplash.com/photo-1502318217862-aa4e294ba657?w=800&q=80",
    },
];

// 연도+월별로 작품 그룹화
export function getArtworksByYearMonth(artworks: Artwork[]): Map<YearMonthKey, Artwork[]> {
    const grouped = new Map<YearMonthKey, Artwork[]>();

    artworks.forEach(artwork => {
        const key = createYearMonthKey(artwork.year, artwork.month);
        const existing = grouped.get(key) || [];
        grouped.set(key, [...existing, artwork]);
    });

    // 정렬: 연도 내림차순, 월 내림차순
    return new Map([...grouped.entries()].sort((a, b) => {
        const aData = parseYearMonthKey(a[0]);
        const bData = parseYearMonthKey(b[0]);
        if (aData.year !== bData.year) return bData.year - aData.year;
        return (bData.month || 0) - (aData.month || 0);
    }));
}

// 연도+월 목록 추출
export function getYearMonths(artworks: Artwork[]): YearMonthKey[] {
    const keys = new Set<YearMonthKey>();
    artworks.forEach(artwork => {
        keys.add(createYearMonthKey(artwork.year, artwork.month));
    });

    // 정렬: 연도 내림차순, 월 내림차순
    return [...keys].sort((a, b) => {
        const aData = parseYearMonthKey(a);
        const bData = parseYearMonthKey(b);
        if (aData.year !== bData.year) return bData.year - aData.year;
        return (bData.month || 0) - (aData.month || 0);
    });
}

// 기존 함수 유지 (하위 호환성)
export function getArtworksByYear(artworks: Artwork[]): Map<number, Artwork[]> {
    const grouped = new Map<number, Artwork[]>();

    artworks.forEach(artwork => {
        const existing = grouped.get(artwork.year) || [];
        grouped.set(artwork.year, [...existing, artwork]);
    });

    return new Map([...grouped.entries()].sort((a, b) => b[0] - a[0]));
}

export function getYears(artworks: Artwork[]): number[] {
    const years = [...new Set(artworks.map(a => a.year))];
    return years.sort((a, b) => b - a);
}

