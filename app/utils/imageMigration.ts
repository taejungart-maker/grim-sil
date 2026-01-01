// Base64 이미지 → Supabase Storage 마이그레이션 스크립트
import { getSupabaseClient } from "./supabase";

export interface MigrationProgress {
    total: number;
    completed: number;
    failed: number;
    currentArtwork: string;
    errors: string[];
}

export type ProgressCallback = (progress: MigrationProgress) => void;

// Base64 문자열을 Blob으로 변환
function base64ToBlob(base64: string): Blob | null {
    try {
        // data:image/png;base64, 부분 제거
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
        return new Blob([byteArray], { type: mimeType });
    } catch (error) {
        console.error("Base64 to Blob conversion failed:", error);
        return null;
    }
}

// 파일 확장자 추출
function getExtension(mimeType: string): string {
    const map: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
    };
    return map[mimeType] || "jpg";
}

// 단일 작품 이미지 마이그레이션
async function migrateArtworkImage(
    artworkId: string,
    base64Image: string
): Promise<{ success: boolean; newUrl?: string; error?: string }> {
    // Base64 → Blob 변환
    const blob = base64ToBlob(base64Image);
    if (!blob) {
        return { success: false, error: "Base64 변환 실패" };
    }

    // 파일명 생성
    const extension = getExtension(blob.type);
    const fileName = `${artworkId}.${extension}`;
    const filePath = `artworks/${fileName}`;

    // Storage에 업로드
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
        .from("artworks")
        .upload(filePath, blob, {
            contentType: blob.type,
            upsert: true, // 이미 있으면 덮어쓰기
        });

    if (error) {
        return { success: false, error: error.message };
    }

    // 공개 URL 생성
    const { data: publicUrlData } = supabase.storage
        .from("artworks")
        .getPublicUrl(filePath);

    return { success: true, newUrl: publicUrlData.publicUrl };
}

// 전체 이미지 마이그레이션
export async function migrateAllImagesToStorage(
    onProgress?: ProgressCallback
): Promise<MigrationProgress> {
    const progress: MigrationProgress = {
        total: 0,
        completed: 0,
        failed: 0,
        currentArtwork: "",
        errors: [],
    };

    try {
        const supabase = getSupabaseClient();
        // Base64 이미지가 있는 작품만 가져오기 (한 번에 하나씩 처리)
        const { data: artworks, error } = await supabase
            .from("artworks")
            .select("id, title, image_url")
            .like("image_url", "data:image%"); // Base64로 시작하는 것만

        if (error) {
            progress.errors.push(`작품 목록 조회 실패: ${error.message}`);
            return progress;
        }

        if (!artworks || artworks.length === 0) {
            console.log("마이그레이션할 Base64 이미지가 없습니다.");
            return progress;
        }

        progress.total = artworks.length;
        onProgress?.(progress);

        // 각 작품 처리
        for (const artwork of artworks) {
            progress.currentArtwork = artwork.title;
            onProgress?.(progress);

            console.log(`마이그레이션 중: ${artwork.title} (${artwork.id})`);

            // 이미지 마이그레이션
            const result = await migrateArtworkImage(artwork.id, artwork.image_url);

            if (result.success && result.newUrl) {
                const supabase = getSupabaseClient();
                // DB 업데이트
                const { error: updateError } = await supabase
                    .from("artworks")
                    .update({ image_url: result.newUrl })
                    .eq("id", artwork.id);

                if (updateError) {
                    progress.failed++;
                    progress.errors.push(`${artwork.title}: DB 업데이트 실패 - ${updateError.message}`);
                } else {
                    progress.completed++;
                    console.log(`완료: ${artwork.title} → ${result.newUrl}`);
                }
            } else {
                progress.failed++;
                progress.errors.push(`${artwork.title}: ${result.error}`);
            }

            onProgress?.(progress);
        }

        progress.currentArtwork = "";
        onProgress?.(progress);

        console.log(`마이그레이션 완료: ${progress.completed}/${progress.total} 성공, ${progress.failed} 실패`);
        return progress;

    } catch (error) {
        progress.errors.push(`마이그레이션 오류: ${error}`);
        return progress;
    }
}

// Base64 이미지 개수 확인
export async function countBase64Images(): Promise<number> {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
        .from("artworks")
        .select("*", { count: "exact", head: true })
        .like("image_url", "data:image%");

    if (error) {
        console.error("Base64 이미지 개수 조회 실패:", error);
        return 0;
    }

    return count || 0;
}
