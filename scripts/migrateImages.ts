// Base64 이미지 → Supabase Storage 마이그레이션 CLI 스크립트
// 사용: npx tsx scripts/migrateImages.ts

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// .env.local 파일에서 환경 변수 로드
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("Supabase URL:", supabaseUrl ? "✅ 로드됨" : "❌ 없음");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Base64 → Blob 변환
function base64ToBlob(base64: string): { blob: Blob; mimeType: string } | null {
    try {
        const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) return null;

        const mimeType = matches[1];
        const data = matches[2];
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        return { blob: new Blob([byteArray], { type: mimeType }), mimeType };
    } catch {
        return null;
    }
}

function getExtension(mimeType: string): string {
    const map: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
    };
    return map[mimeType] || "jpg";
}

async function migrateImages() {
    console.log("🚀 이미지 마이그레이션 시작...\n");

    // 1. 작품 ID만 먼저 가져오기 (타임아웃 방지)
    const { data: artworkIds, error: listError } = await supabase
        .from("artworks")
        .select("id, title");

    if (listError) {
        console.error("❌ 작품 목록 조회 실패:", listError);
        return;
    }

    console.log(`📋 총 ${artworkIds?.length || 0}개 작품 발견\n`);

    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    // 2. 각 작품을 개별적으로 처리
    for (const artwork of artworkIds || []) {
        // 개별 작품의 image_url 가져오기
        const { data: artworkData, error: fetchError } = await supabase
            .from("artworks")
            .select("image_url")
            .eq("id", artwork.id)
            .single();

        if (fetchError) {
            console.log(`⚠️ ${artwork.title}: 조회 실패 - ${fetchError.message}`);
            failed++;
            continue;
        }

        const imageUrl = artworkData?.image_url;

        // Base64가 아니면 건너뛰기
        if (!imageUrl?.startsWith("data:image")) {
            console.log(`⏭️ ${artwork.title}: 이미 Storage URL 또는 빈 이미지 - 건너뜀`);
            skipped++;
            continue;
        }

        // Base64 → Blob 변환
        const result = base64ToBlob(imageUrl);
        if (!result) {
            console.log(`❌ ${artwork.title}: Base64 변환 실패`);
            failed++;
            continue;
        }

        // Storage 업로드
        const extension = getExtension(result.mimeType);
        const filePath = `artworks/${artwork.id}.${extension}`;

        const { error: uploadError } = await supabase.storage
            .from("artworks")
            .upload(filePath, result.blob, {
                contentType: result.mimeType,
                upsert: true,
            });

        if (uploadError) {
            console.log(`❌ ${artwork.title}: 업로드 실패 - ${uploadError.message}`);
            failed++;
            continue;
        }

        // 공개 URL 가져오기
        const { data: publicUrlData } = supabase.storage
            .from("artworks")
            .getPublicUrl(filePath);

        // DB 업데이트
        const { error: updateError } = await supabase
            .from("artworks")
            .update({ image_url: publicUrlData.publicUrl })
            .eq("id", artwork.id);

        if (updateError) {
            console.log(`❌ ${artwork.title}: DB 업데이트 실패 - ${updateError.message}`);
            failed++;
            continue;
        }

        console.log(`✅ ${artwork.title}: 마이그레이션 완료`);
        migrated++;
    }

    console.log("\n=== 마이그레이션 결과 ===");
    console.log(`✅ 성공: ${migrated}`);
    console.log(`⏭️ 건너뜀: ${skipped}`);
    console.log(`❌ 실패: ${failed}`);
}

migrateImages().catch(console.error);
