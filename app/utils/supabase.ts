// Supabase 클라이언트 설정 (멀티 테넌트 지원)
import { createClient } from "@supabase/supabase-js";
import { getClientArtistId } from "./getArtistId";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수 검증 (Safe Guard)
if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [];
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

    console.warn(`⚠️ [SUPABASE] Missing Environment Variables: ${missing.join(", ")}`);
    // 빌드 타임이나 서버 타임에는 에러를 던지지 않고 런타임에 getSupabaseClient에서 체크하도록 유도 가능하나,
    // 클라이언트 사이드에서는 초기 로드시 알리는 것이 좋음.
}

// 아티스트 ID (도메인 기반 자동 감지)
export const ARTIST_ID = getClientArtistId(); // 🔥 12월 30일 디자인 복구를 위해 재활성화

// [SECURITY_KILL] 전역 싱글톤 사살. "싱글톤 클라이언트를 즉시 사살하라"
export function getSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("❌ Supabase configuration is missing. Check your environment variables.");
    }

    // [STABILITY_FIX] Top-level import 대신 내부 호출로 하되 require 제거
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
    thumbnail_url: string | null;
    description: string | null;
    price: string | null;
    artist_name: string | null;
    artist_id: string; // 멀티 테넌트 지원
    created_at: string;
}

// 영감 테이블 타입
export interface InspirationRow {
    id: string;
    artist_id: string;
    image_url: string; // ✅ 추가: 고화질 또는 대표 이미지 URL
    blur_image_url: string;
    color_palette: string[]; // JSONB 배열
    metadata: {
        timestamp: number;
        location?: string;
        weather?: string;
        original_filename: string;
    };
    created_at: string;
}

