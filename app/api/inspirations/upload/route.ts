// API Route: 영감 업로드 (SERVICE_ROLE_KEY 사용)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서버사이드 전용 Supabase 클라이언트 (RLS 우회)
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getServerSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase environment variables missing');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
export async function POST(request: NextRequest) {
    console.log('\n==========================================');
    console.log('📤 [API START] Upload request received');
    console.log('  Time:', new Date().toISOString());
    console.log('==========================================\n');

    try {
        // ========================================
        // Step 1: 데이터 수신
        // ========================================
        console.log('📥 [STEP 1/6] Parsing form data...');
        const formData = await request.formData();

        const blurImage = formData.get('blurImage') as File;
        const originalImage = formData.get('originalImage') as File;
        const inspirationId = formData.get('inspirationId') as string;
        const artistId = formData.get('artistId') as string;
        const colorPaletteStr = formData.get('colorPalette') as string;
        const metadataStr = formData.get('metadata') as string;

        console.log('📝 Received:');
        console.log('  - Blur Image:', blurImage ? `✅ ${blurImage.size} bytes` : '❌ Missing');
        console.log('  - Original Image:', originalImage ? `✅ ${originalImage.size} bytes` : '❌ Missing');
        console.log('  - ID:', inspirationId || '❌ Missing');
        console.log('  - Artist:', artistId || '❌ Missing');

        if (!blurImage || !inspirationId || !artistId) {
            console.error('❌ Missing required fields!');
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // ========================================
        // Step 2: JSON 파싱
        // ========================================
        console.log('\n📝 [STEP 2/6] Parsing JSON...');
        let colorPalette: string[];
        let metadata: any;

        try {
            colorPalette = JSON.parse(colorPaletteStr);
            metadata = JSON.parse(metadataStr);
            console.log('  - Colors:', colorPalette);
            console.log('  - Metadata:', metadata);
        } catch (parseError) {
            console.error('❌ JSON parse failed:', parseError);
            return NextResponse.json(
                {
                    error: 'Invalid JSON data',
                    details: parseError instanceof Error ? parseError.message : 'Unknown'
                },
                { status: 400 }
            );
        }

        // ========================================
        // Step 3: Supabase 클라이언트 초기화
        // ========================================
        console.log('\n🔑 [STEP 3/6] Initializing Supabase...');
        let supabase;

        try {
            supabase = getServerSupabaseClient();
            console.log('✅ Supabase client ready (using SERVICE_ROLE_KEY)');
        } catch (envError) {
            console.error('\n❌ CRITICAL: Environment configuration error!');
            console.error('  Error:', envError instanceof Error ? envError.message : envError);
            console.error('  → Check .env.local file');
            console.error('  → Restart dev server after adding SUPABASE_SERVICE_ROLE_KEY\n');

            return NextResponse.json(
                {
                    error: '환경 변수 설정이 필요합니다',
                    details: envError instanceof Error ? envError.message : 'Unknown',
                    hint: '.env.local 파일에 SUPABASE_SERVICE_ROLE_KEY를 추가하고 서버를 재시작하세요.'
                },
                { status: 500 }
            );
        }

        // ========================================
        // Step 4: Storage 업로드 (단일 버킷: inspiration-images)
        // ========================================
        const BUCKET_NAME = 'inspiration-images'; // ✅ 사용자 요청에 따른 버킷명 통합

        console.log(`\n📸 [STEP 4/6] Uploading to storage (${BUCKET_NAME})...`);
        const blurPath = `${artistId}/${inspirationId}_blur.jpg`;
        const originalPath = `${artistId}/${inspirationId}_original.jpg`;

        // 1. 블러 이미지 업로드
        const arrayBuffer = await blurImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(blurPath, buffer, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (uploadError) {
            console.error('\n❌ Blur upload failed:', uploadError.message);
            return NextResponse.json(
                {
                    error: 'Failed to upload image to storage',
                    details: uploadError.message,
                    hint: `Supabase Storage에 "${BUCKET_NAME}" 버킷이 생성되어 있고 Public으로 설정되어 있는지 확인하세요.`
                },
                { status: 500 }
            );
        }

        const { data: blurUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(blurPath);
        const blurImageUrl = blurUrlData.publicUrl;
        console.log('✅ Blur upload success:', blurImageUrl);

        // 2. 원본 이미지 업로드 (있을 경우)
        let originalImageUrl = '';
        if (originalImage) {
            const originalArrayBuffer = await originalImage.arrayBuffer();
            const originalBuffer = Buffer.from(originalArrayBuffer);

            const { error: originalUploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(originalPath, originalBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (originalUploadError) {
                console.error('⚠️ Original upload failed (non-critical):', originalUploadError.message);
            } else {
                const { data: originalUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(originalPath);
                originalImageUrl = originalUrlData.publicUrl;
                console.log('✅ Original upload success:', originalImageUrl);
            }
        }

        // ========================================
        // Step 6: 메타데이터 강화 및 image_url 결정
        // ========================================
        console.log('\n🔗 [STEP 6/7] Finalizing metadata and image_url...');

        // 대표 이미지(image_url)는 원본이 있으면 원본, 없으면 블러를 사용
        const mainImageUrl = originalImageUrl || blurImageUrl;

        if (originalImageUrl) {
            metadata.original_image_url = originalImageUrl;
        }

        // ========================================
        // Step 7: DB 저장 (image_url 필드 포함)
        // ========================================
        console.log('\n💾 [STEP 7/7] Saving to database...');

        const insertData = {
            id: inspirationId,
            artist_id: artistId,
            image_url: mainImageUrl, // ✅ 새로운 통합 이미지 필드
            blur_image_url: blurImageUrl,
            color_palette: colorPalette,
            metadata: metadata,
        };

        console.log('  - Insert Data:', insertData);

        const { data: insertedData, error: dbError } = await supabase
            .from('inspirations')
            .insert(insertData)
            .select();

        if (dbError) {
            console.error('\n❌ Database insert failed!');
            console.error('  Code:', dbError.code);
            console.error('  Message:', dbError.message);
            console.error('  Error:', JSON.stringify(dbError, null, 2));

            // RLS 오류
            if (dbError.code === '42501') {
                console.error('  → This is an RLS (Row Level Security) error');
                console.error('  → SERVICE_ROLE_KEY should bypass RLS');
                console.error('  → Run fix-rls-policies.sql or check key configuration');

                return NextResponse.json(
                    {
                        error: 'Permission denied',
                        details: dbError.message,
                        hint: 'RLS 정책 오류. fix-rls-policies.sql을 실행하거나 SERVICE_ROLE_KEY를 확인하세요.'
                    },
                    { status: 403 }
                );
            }

            // 테이블 없음
            if (dbError.code === '42P01') {
                console.error('  → Table "inspirations" does not exist');
                console.error('  → Run create-inspirations-table.sql');

                return NextResponse.json(
                    {
                        error: 'Table does not exist',
                        details: dbError.message,
                        hint: 'create-inspirations-table.sql을 먼저 실행하세요.'
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                {
                    error: 'Failed to save to database',
                    details: dbError.message,
                    code: dbError.code
                },
                { status: 500 }
            );
        }

        console.log('✅ Database insert success!');
        console.log('  - Inserted:', insertedData);

        console.log('\n==========================================');
        console.log('🎉 [SUCCESS] Upload complete!');
        console.log('==========================================\n');

        return NextResponse.json({
            success: true,
            imageUrl: mainImageUrl, // ✅ 추가
            blurImageUrl,
            inspirationId,
            message: '✅ 서버 저장 성공!',
        });

    } catch (error) {
        console.error('\n==========================================');
        console.error('❌ [CRITICAL ERROR] Unexpected error!');
        console.error('==========================================');
        console.error('Error:', error);
        console.error('Type:', typeof error);
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
        console.error('==========================================\n');

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : String(error),
                hint: '서버 터미널 로그를 확인하세요.'
            },
            { status: 500 }
        );
    }
}
