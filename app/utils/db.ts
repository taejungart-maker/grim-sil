// Supabase 유틸리티 - 작품 데이터 저장소 (클라우드 동기화)
import { Artwork } from "../data/artworks";
import { supabase, ArtworkRow, ARTIST_ID } from "./supabase";

// ID 생성
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Row를 Artwork로 변환
function rowToArtwork(row: ArtworkRow): Artwork & { createdAt?: number } {
    return {
        id: row.id,
        title: row.title,
        year: row.year,
        month: row.month ?? undefined,
        dimensions: row.dimensions,
        medium: row.medium,
        imageUrl: row.image_url,
        description: row.description ?? undefined,
        price: row.price ?? undefined,
        artistName: row.artist_name ?? undefined,
        createdAt: new Date(row.created_at).getTime(),
    };
}

// Artist ID 유효성 검사 (절대 격리용)
export function validateArtistId(id?: string): string {
    // vip-gallery 로 시작하는 ID이거나 default 인 경우만 유효
    if (id && (id.startsWith("vip-gallery-") || id === "default")) {
        return id;
    }

    // 이외의 경우(undefined, null, 빈 문자열 등)는 
    // 전역 ARTIST_ID로 가되, 이것이 default인지 확인 루틴 거침
    if (!id || id === "undefined" || id === "null") {
        return ARTIST_ID || "default";
    }

    return id;
}

// Artwork를 Row 형태로 변환
function artworkToRow(artwork: Artwork & { createdAt?: number }, ownerId?: string): Partial<ArtworkRow> {
    const targetId = validateArtistId(ownerId);
    return {
        id: artwork.id,
        title: artwork.title,
        year: artwork.year,
        month: artwork.month ?? null,
        dimensions: artwork.dimensions,
        medium: artwork.medium,
        image_url: artwork.imageUrl,
        description: artwork.description ?? null,
        price: artwork.price ?? null,
        artist_name: artwork.artistName ?? null,
        artist_id: targetId, // 절대 격리: 강제 할당
    };
}

// 모든 작품 가져오기 (Storage URL만 포함, Base64는 제외)
export async function getAllArtworks(ownerId?: string): Promise<Artwork[]> {
    try {
        const targetArtistId = validateArtistId(ownerId);
        console.log(`=== [ISOLATION AUDIT] Fetching artworks for ID: ${targetArtistId} ===`);

        // 메타데이터 로드 (image_url 포함하되, Base64는 처리 시 건너뜀)
        const { data, error, status } = await supabase
            .from("artworks")
            .select("id, title, year, month, dimensions, medium, description, price, created_at, image_url, artist_name")
            .eq("artist_id", targetArtistId) // 현재 작가의 데이터만 가져오기
            .order("created_at", { ascending: false });

        console.log("Supabase response status:", status);

        if (error) {
            console.error("Failed to fetch artworks:", error);
            return [];
        }

        console.log("Fetched artworks count:", data?.length || 0);

        return (data || []).map(row => ({
            id: row.id,
            title: row.title,
            year: row.year,
            month: row.month ?? undefined,
            dimensions: row.dimensions,
            medium: row.medium,
            imageUrl: row.image_url || "",
            description: row.description ?? undefined,
            price: row.price ?? undefined,
            artistName: row.artist_name ?? undefined,
        }));
    } catch (err) {
        console.error("Exception in getAllArtworks:", err);
        return [];
    }
}

// 작품 추가
export async function addArtwork(artwork: Omit<Artwork, "id"> & { id?: string }, ownerId?: string): Promise<Artwork> {
    // ownerId가 명시되지 않은 경우, 현재 시스템의 ARTIST_ID를 사용하되 
    // 명시적으로 지정된 경우(VIP 룸) 그 ID를 최우선으로 함
    const targetArtistId = validateArtistId(ownerId);

    console.log(`=== [ISOLATION AUDIT] Adding/Updating artwork for ID: ${targetArtistId} ===`);

    const newArtwork = {
        ...artwork,
        id: artwork.id || generateId(),
    };

    const row = artworkToRow(newArtwork as Artwork, targetArtistId);

    const { data, error } = await supabase
        .from("artworks")
        .insert(row)
        .select()
        .single();

    if (error) {
        console.error("Failed to add artwork:", error);
        throw error;
    }

    return rowToArtwork(data);
}

// 작품 수정
export async function updateArtwork(artwork: Artwork, ownerId?: string): Promise<Artwork> {
    const row = artworkToRow(artwork, ownerId);
    const targetArtistId = ownerId || ARTIST_ID;

    const { data, error } = await supabase
        .from("artworks")
        .update(row)
        .eq("id", artwork.id)
        .eq("artist_id", targetArtistId) // 현재 작가의 데이터만 수정
        .select()
        .single();

    if (error) {
        console.error("Failed to update artwork:", error);
        throw error;
    }

    return rowToArtwork(data);
}

// 작품 삭제
export async function deleteArtwork(id: string, ownerId?: string): Promise<void> {
    const targetArtistId = ownerId || ARTIST_ID;
    const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", id)
        .eq("artist_id", targetArtistId); // 현재 작가의 데이터만 삭제

    if (error) {
        console.error("Failed to delete artwork:", error);
        throw error;
    }
}

// 단일 작품 가져오기
export async function getArtwork(id: string, ownerId?: string): Promise<Artwork | undefined> {
    const targetArtistId = ownerId || ARTIST_ID;
    const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("id", id)
        .eq("artist_id", targetArtistId) // 현재 작가의 데이터만 가져오기
        .single();

    if (error) {
        console.error("Failed to get artwork:", error);
        return undefined;
    }

    return rowToArtwork(data);
}

// 이미지를 Base64로 변환 (자동 리사이징 포함) - 레거시 지원용
const MAX_IMAGE_SIZE = 2400;
const IMAGE_QUALITY = 0.85;

export function imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                let { width, height } = img;

                if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
                    if (width > height) {
                        height = Math.round((height / width) * MAX_IMAGE_SIZE);
                        width = MAX_IMAGE_SIZE;
                    } else {
                        width = Math.round((width / height) * MAX_IMAGE_SIZE);
                        height = MAX_IMAGE_SIZE;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Canvas context not available"));
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
                resolve(base64);
            };

            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target?.result as string;
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// ====================================
// Supabase Storage 이미지 업로드
// ====================================

const STORAGE_BUCKET = "artworks";

// 이미지 리사이징 후 Blob 반환
function resizeImageToBlob(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                let { width, height } = img;

                // 리사이징
                if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
                    if (width > height) {
                        height = Math.round((height / width) * MAX_IMAGE_SIZE);
                        width = MAX_IMAGE_SIZE;
                    } else {
                        width = Math.round((width / height) * MAX_IMAGE_SIZE);
                        height = MAX_IMAGE_SIZE;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Canvas context not available"));
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Failed to create blob"));
                        }
                    },
                    "image/jpeg",
                    IMAGE_QUALITY
                );
            };

            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target?.result as string;
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// Supabase Storage에 이미지 업로드
export async function uploadImageToStorage(file: File): Promise<string> {
    // 이미지 리사이징
    const resizedBlob = await resizeImageToBlob(file);

    // 고유 파일명 생성
    const fileExt = "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `images/${fileName}`;

    // Supabase Storage에 업로드
    const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, resizedBlob, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        console.error("Failed to upload image:", uploadError);
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
    }

    // Public URL 가져오기
    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

// Storage에서 이미지 삭제
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
    // Storage URL인지 확인
    if (!imageUrl.includes("supabase") || !imageUrl.includes("/storage/")) {
        return; // Storage URL이 아니면 무시 (Base64 또는 외부 URL)
    }

    try {
        // URL에서 파일 경로 추출
        const urlParts = imageUrl.split("/storage/v1/object/public/artworks/");
        if (urlParts.length !== 2) return;

        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([filePath]);

        if (error) {
            console.error("Failed to delete image from storage:", error);
        }
    } catch (error) {
        console.error("Error deleting image:", error);
    }
}

// Base64인지 확인
export function isBase64Image(url: string): boolean {
    return url.startsWith("data:image");
}

// ====================================
// 데이터 내보내기/가져오기 기능
// ====================================

export async function exportAllData(): Promise<void> {
    const artworks = await getAllArtworks();

    const exportData = {
        version: 1,
        exportDate: new Date().toISOString(),
        artworksCount: artworks.length,
        artworks: artworks,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const filename = `artflow_backup_${new Date().toISOString().split("T")[0]}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";

    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        window.open(url, "_blank");
    } else {
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 3000);
}

export async function exportToClipboard(): Promise<{ success: boolean; count: number }> {
    const artworks = await getAllArtworks();

    const exportData = {
        version: 1,
        exportDate: new Date().toISOString(),
        artworksCount: artworks.length,
        artworks: artworks,
    };

    const jsonString = JSON.stringify(exportData);

    try {
        await navigator.clipboard.writeText(jsonString);
        return { success: true, count: artworks.length };
    } catch {
        const textArea = document.createElement("textarea");
        textArea.value = jsonString;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        return { success: true, count: artworks.length };
    }
}

export async function importFromClipboard(): Promise<{ success: boolean; count: number; message: string }> {
    try {
        const jsonString = await navigator.clipboard.readText();
        const importData = JSON.parse(jsonString);

        if (!importData.version || !importData.artworks) {
            return { success: false, count: 0, message: "올바르지 않은 데이터입니다." };
        }

        const artworks = importData.artworks as Artwork[];
        let importedCount = 0;

        for (const artwork of artworks) {
            try {
                await addArtwork(artwork);
                importedCount++;
            } catch {
                try {
                    await updateArtwork(artwork);
                    importedCount++;
                } catch (e) {
                    console.error("Failed to import:", e);
                }
            }
        }

        return { success: true, count: importedCount, message: `${importedCount}개의 작품을 가져왔습니다!` };
    } catch (error) {
        console.error("Import error:", error);
        return { success: false, count: 0, message: "클립보드에서 데이터를 읽을 수 없습니다." };
    }
}

export async function importAllData(file: File): Promise<{ success: boolean; count: number; message: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const jsonString = e.target?.result as string;
                const importData = JSON.parse(jsonString);

                if (!importData.version || !importData.artworks) {
                    resolve({ success: false, count: 0, message: "올바르지 않은 백업 파일입니다." });
                    return;
                }

                const artworks = importData.artworks as Artwork[];
                let importedCount = 0;

                for (const artwork of artworks) {
                    try {
                        await addArtwork(artwork);
                        importedCount++;
                    } catch {
                        try {
                            await updateArtwork(artwork);
                            importedCount++;
                        } catch (updateError) {
                            console.error("Failed to import artwork:", artwork.id, updateError);
                        }
                    }
                }

                resolve({
                    success: true,
                    count: importedCount,
                    message: `${importedCount}개의 작품을 성공적으로 가져왔습니다!`
                });
            } catch (error) {
                console.error("Import error:", error);
                resolve({ success: false, count: 0, message: "파일을 읽는 중 오류가 발생했습니다." });
            }
        };

        reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
        reader.readAsText(file);
    });
}

// --- 통계 관련 유틸리티 ---

// 방문자 수 증가 (오늘 날짜 기준)
export async function incrementVisitorCount() {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 오늘 날짜의 데이터가 있는지 확인
        const { data, error } = await supabase
            .from('visitor_stats')
            .select('count')
            .eq('date', today)
            .eq('artist_id', ARTIST_ID) // 현재 작가의 통계만 가져오기
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            throw error;
        }

        if (data) {
            // 있으면 업데이트
            await supabase
                .from('visitor_stats')
                .update({ count: data.count + 1 })
                .eq('date', today)
                .eq('artist_id', ARTIST_ID); // 현재 작가의 통계만 업데이트
        } else {
            // 없으면 새로 생성
            await supabase
                .from('visitor_stats')
                .insert([{ date: today, count: 1, artist_id: ARTIST_ID }]); // artist_id 포함
        }
    } catch (error) {
        console.error("Failed to increment visitor count:", error);
    }
}

// 최근 방문자 통계 가져오기 (최근 7일)
export async function getVisitorStats(days = 7) {
    try {
        const { data, error } = await supabase
            .from('visitor_stats')
            .select('*')
            .eq('artist_id', ARTIST_ID) // 현재 작가의 통계만 가져오기
            .order('date', { ascending: false })
            .limit(days);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Failed to fetch visitor stats:", error);
        return [];
    }
}
