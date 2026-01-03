// 환율 API - 하루 1회 캐싱
let cachedRate: number | null = null;
let cacheDate: string | null = null;

const FALLBACK_RATE = 1400; // API 실패 시 기본값

export async function getExchangeRate(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    // 오늘 이미 캐싱된 값이 있으면 사용
    if (cachedRate && cacheDate === today) {
        return cachedRate;
    }

    try {
        // 무료 환율 API (Frankfurt School 제공)
        const response = await fetch(
            'https://api.frankfurter.app/latest?from=USD&to=KRW',
            { next: { revalidate: 86400 } } // 24시간 캐싱
        );

        if (!response.ok) {
            throw new Error('Exchange rate API failed');
        }

        const data = await response.json();
        const rate = data.rates?.KRW;

        if (rate && typeof rate === 'number') {
            cachedRate = rate;
            cacheDate = today;
            return rate;
        }

        throw new Error('Invalid rate data');
    } catch (error) {
        console.error('Exchange rate fetch error:', error);
        // API 실패 시 기본값 사용
        return cachedRate || FALLBACK_RATE;
    }
}

// KRW를 USD로 변환 (반올림)
export function convertKRWtoUSD(krwAmount: number, rate: number): number {
    return Math.round(krwAmount / rate);
}
