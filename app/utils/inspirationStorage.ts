// 영감 채집 통합 저장 로직 (로컬 우선 + 상세 로깅)
import { v4 as uuidv4 } from 'uuid';
import { applyGaussianBlur } from './gaussianBlur';
import { extractDominantColors } from './colorExtraction';
import { saveToIndexedDB, InspirationData } from './indexedDbStorage';

export interface SaveInspirationResult {
    success: boolean;
    inspirationId?: string;
    error?: string;
}

// 원본 이미지를 로컬에 다운로드
export function downloadOriginalImage(imageData: string, filename: string): void {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 영감 저장 (하이브리드 방식 - 로컬 저장 우선)
export async function saveInspiration(
    imageData: string,
    artistId: string
): Promise<SaveInspirationResult> {
    const inspirationId = uuidv4();
    const timestamp = Date.now();

    console.log('💾 Starting inspiration save:', { inspirationId, artistId });

    // 파일명: GrimSil_YYYYMMDD_HHMM.jpg
    const now = new Date(timestamp);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const originalFileName = `GrimSil_${year}${month}${day}_${hours}${minutes}.jpg`;

    try {
        // 1. 원본 이미지 로컬 다운로드 (최우선)
        console.log('📥 Downloading original image:', originalFileName);
        downloadOriginalImage(imageData, originalFileName);

        // 2. 블러 이미지 생성
        console.log('🌫 Applying gaussian blur...');
        const blurBlob = await applyGaussianBlur(imageData, 30);

        // ✅ 데이터 유효성 검증: blob이 없거나 크기가 0이면 즉시 중단
        if (!blurBlob || blurBlob.size === 0) {
            console.error('❌ Blob validation failed: Invalid or empty blob');
            throw new Error('블러 이미지 생성에 실패했습니다. 다시 시도해주세요.');
        }

        console.log('✅ Blur created:', blurBlob.size, 'bytes');
        console.log('📊 Blob verification:');
        console.log('  - Blob type:', blurBlob.type);
        console.log('  - Blob instanceof:', blurBlob instanceof Blob);
        console.log('  - Blob constructor:', blurBlob.constructor.name);

        // 3. 색상 추출
        console.log('🎨 Extracting colors...');
        const colorPalette = await extractDominantColors(imageData, 5);
        console.log('✅ Colors extracted:', colorPalette);

        // 4. 메타데이터 수집
        const metadata = {
            timestamp,
            location: await getLocation().catch(() => undefined),
            weather: undefined,
            original_filename: originalFileName,
        };
        console.log('📝 Metadata:', metadata);

        // 5. IndexedDB에 로컬 메타데이터 먼저 저장 (서버 실패해도 유지)
        const inspirationData: InspirationData = {
            id: inspirationId,
            originalFileName,
            blurImageUrl: '', // 서버 업로드 후 업데이트
            colorPalette,
            metadata,
            localPath: `downloads/${originalFileName}`,
            createdAt: timestamp,
        };

        console.log('💾 Saving to IndexedDB...');
        await saveToIndexedDB(inspirationData);
        console.log('✅ IndexedDB save complete');

        // 6. 서버에 블러 이미지 + 메타데이터 업로드 (선택적)
        try {
            console.log('🌐 Uploading to server...');

            // 📊 전송 데이터 체크
            console.log('📊 전송 데이터 체크:');
            console.log('  - Blob size:', blurBlob.size, 'bytes');
            console.log('  - Blob type:', blurBlob.type);
            console.log('  - Blob instance:', blurBlob instanceof Blob);
            console.log('  - Color palette:', colorPalette.length, 'colors');
            console.log('  - Original filename:', metadata.original_filename);

            // ✅ 최종 blob 유효성 재검증 (업로드 전)
            if (!blurBlob || blurBlob.size === 0) {
                throw new Error('Invalid blob for upload');
            }

            const blurImageUrl = await uploadToSupabase(
                blurBlob,
                inspirationId,
                artistId,
                colorPalette,
                metadata
            );

            console.log('✅ Server upload success:', blurImageUrl);

            // 서버 업로드 성공 시 IndexedDB 업데이트
            inspirationData.blurImageUrl = blurImageUrl;
            await saveToIndexedDB(inspirationData);

            return {
                success: true,
                inspirationId,
            };
        } catch (serverError: unknown) {
            console.error('⚠️ Server upload failed:', serverError);
            console.error('Error details:', serverError instanceof Error ? serverError.message : String(serverError));

            // 서버 업로드 실패해도 로컬 저장은 성공
            // 🔥 강제 성공 처리: 로컬에 저장되었으므로 무조건 성공
            return {
                success: true,
                inspirationId,
                error: '서버 저장에 실패했습니다. 원본은 로컬에 안전하게 저장되었습니다.',
            };
        }
    } catch (error) {
        console.error('❌ Failed to save inspiration:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// 위치 정보 가져오기 (선택사항)
async function getLocation(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            },
            (error) => {
                reject(error);
            },
            { timeout: 5000 }
        );
    });
}

// Supabase에 업로드 (상세 로깅)
async function uploadToSupabase(
    blurBlob: Blob,
    inspirationId: string,
    artistId: string,
    colorPalette: string[],
    metadata: InspirationRow['metadata']
): Promise<string> {
    // JSONB 형식 확인: 배열로 깔끔하게 전송
    console.log('📤 Preparing upload data:');
    console.log('  - Blob size:', blurBlob.size);
    console.log('  - Color palette (array):', colorPalette);
    console.log('  - Metadata:', metadata);

    // FormData 생성
    const formData = new FormData();
    formData.append('blurImage', blurBlob, `${inspirationId}_blur.jpg`);
    formData.append('inspirationId', inspirationId);
    formData.append('artistId', artistId);
    formData.append('colorPalette', JSON.stringify(colorPalette)); // 배열을 JSON 문자열로
    formData.append('metadata', JSON.stringify(metadata)); // 객체를 JSON 문자열로

    console.log('🌐 Calling API: /api/inspirations/upload');

    // API 호출
    const response = await fetch('/api/inspirations/upload', {
        method: 'POST',
        body: formData,
    });

    console.log('📡 API response status:', response.status);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API error response:', errorData);

        if (response.status === 403) {
            throw new Error('RLS 권한 오류. fix-rls-policies.sql을 실행하세요.');
        }

        throw new Error(errorData.error || errorData.details || 'Failed to upload to server');
    }

    const data = await response.json();
    console.log('✅ API success response:', data);

    if (data.message) {
        console.log('💬', data.message);
    }

    return data.blurImageUrl;
}
