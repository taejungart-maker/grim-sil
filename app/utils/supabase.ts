// Supabase 클라이언트 설정 (멀티 테넌트 지원)
import { createClient } from "@supabase/supabase-js";
import { getClientArtistId } from "./getArtistId";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 아티스트 ID (도메인 기반 자동 감지)
export const ARTIST_ID = getClientArtistId(); // 🔥 12월 30일 디자인 복구를 위해 재활성화

// [SECURITY_KILL] 전역 싱글톤 사살. "싱글톤 클라이언트를 즉시 사살하라"
// 파일 최상단에서 supabase를 정의하면 Vercel Lambda가 메모리에 구형 ID를 보관하므로 절대 금지.
export function getSupabaseClient() {
    const { getClientArtistId } = require("./getArtistId");
    const artistId = getClientArtistId();

    // 매번 새로운 인스턴스 생성 (createServerClient 개념의 동적 생성)
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
            headers: { 'X-Artist-Id': artistId },
        },
    });
}

// 데이터베이스 테이블 타입
export interface ArtworkRow {
    id: string;
    title: string;
    year: number;
    month: number | null;
    dimensions: string;
    medium: string;
    image_url: string;
    description: string | null;
    price: string | null;
    artist_name: string | null;
    artist_id: string; // 멀티 테넌트 지원
    created_at: string;
}
