// 색상 추출 및 저장 유틸리티
// Zero-Latency를 위해 localStorage 사용

export interface ColorPalette {
    colors: string[];
    timestamp: number;
}

/**
 * 현재 그라디언트에서 색상 추출
 * 실제로는 미리 정의된 조화로운 그라디언트 색상 반환
 */
export function getCurrentGradientColors(): string[] {
    // 부드럽고 조화로운 그라디언트 색상 세트
    const gradientSets = [
        ['#667eea', '#764ba2'], // Purple to Pink
        ['#f093fb', '#f5576c'], // Pink to Red
        ['#4facfe', '#00f2fe'], // Blue to Cyan
        ['#43e97b', '#38f9d7'], // Green to Teal
        ['#fa709a', '#fee140'], // Pink to Yellow
        ['#30cfd0', '#330867'], // Cyan to Purple
        ['#a8edea', '#fed6e3'], // Mint to Pink
        ['#ff9a9e', '#fecfef'], // Coral to Light Pink
    ];

    // 현재 시간 기반으로 그라디언트 선택 (매번 다른 색상)
    const index = Math.floor(Date.now() / 10000) % gradientSets.length;
    return gradientSets[index];
}

/**
 * 색상 팔레트를 히스토리에 저장
 */
export function saveColorPalette(colors: string[], timestamp: number): void {
    try {
        const history = getColorHistory();
        const newPalette: ColorPalette = { colors, timestamp };

        // 최대 50개까지만 저장
        const updatedHistory = [newPalette, ...history].slice(0, 50);

        localStorage.setItem('colorPaletteHistory', JSON.stringify(updatedHistory));
    } catch (error) {
        console.error('Failed to save color palette:', error);
    }
}

/**
 * Visual Continuity를 위해 마지막 채집 색상 저장
 */
export function saveCapturedColor(color: string): void {
    try {
        localStorage.setItem('lastCapturedColor', color);
    } catch (error) {
        console.error('Failed to save captured color:', error);
    }
}

/**
 * 마지막 채집 색상 가져오기 (Archive 페이지에서 사용)
 */
export function getLastCapturedColor(): string | null {
    try {
        return localStorage.getItem('lastCapturedColor');
    } catch (error) {
        console.error('Failed to get last captured color:', error);
        return null;
    }
}

/**
 * 색상 팔레트 히스토리 가져오기
 */
export function getColorHistory(): ColorPalette[] {
    try {
        const history = localStorage.getItem('colorPaletteHistory');
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Failed to get color history:', error);
        return [];
    }
}

/**
 * 두 색상 간 부드러운 블렌드
 */
export function blendColors(color1: string, color2: string, ratio: number = 0.5): string {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);

    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);

    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
