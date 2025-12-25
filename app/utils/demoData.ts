// 데모 데이터 유틸리티
import { addArtwork, getAllArtworks } from "./db";

// 데모 작품 데이터
const demoArtworks = [
    {
        title: "산수유람",
        year: 2024,
        month: 3,
        dimensions: "90 × 60 cm",
        medium: "한지에 수묵",
        description: "안개 낀 산과 고요한 강의 풍경을 담은 산수화입니다. 자연의 평온함과 고요함을 표현했습니다.",
        imageUrl: "/demo1.png",
    },
    {
        title: "화조도",
        year: 2024,
        month: 6,
        dimensions: "80 × 80 cm",
        medium: "한지에 채색",
        description: "모란과 국화를 주제로 한 전통 화조화입니다. 꽃의 아름다움과 생명력을 담았습니다.",
        imageUrl: "/demo2.png",
    },
    {
        title: "가을 사찰",
        year: 2024,
        month: 10,
        dimensions: "100 × 70 cm",
        medium: "한지에 수묵담채",
        description: "단풍으로 물든 산속 사찰의 가을 풍경입니다. 자연과 조화를 이루는 한국의 전통 건축을 담았습니다.",
        imageUrl: "/demo3.png",
    },
];

// 이미지를 Base64로 변환
async function imageUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// 데모 데이터 로드 (작품이 없을 때만)
export async function loadDemoDataIfEmpty(): Promise<boolean> {
    const existingArtworks = await getAllArtworks();

    // 이미 작품이 있으면 로드하지 않음
    if (existingArtworks.length > 0) {
        return false;
    }

    // 데모 작품 추가
    for (const artwork of demoArtworks) {
        try {
            const base64Image = await imageUrlToBase64(artwork.imageUrl);
            await addArtwork({
                ...artwork,
                imageUrl: base64Image,
            });
        } catch (error) {
            console.error("Failed to load demo artwork:", error);
        }
    }

    return true;
}

// 데모 데이터 초기화 (모든 데이터 삭제 후 재로드)
export async function resetToDemo(): Promise<void> {
    // 기존 데이터는 유지하고 데모만 추가하고 싶다면 이 함수는 사용하지 마세요
    // 이 함수는 관리자용입니다
}
