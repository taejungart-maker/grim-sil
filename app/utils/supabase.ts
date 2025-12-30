// Supabase 클라이언트 설정 (멀티 테넌트 지원)
import { createClient } from "@supabase/supabase-js";
import { getClientArtistId } from "./getArtistId";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 아티스트 ID (도메인 기반 자동 감지)
export const ARTIST_ID = getClientArtistId();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        headers: {
            // RLS 정책에서 사용할 아티스트 ID 설정
            'X-Artist-Id': ARTIST_ID,
        },
    },
});

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
