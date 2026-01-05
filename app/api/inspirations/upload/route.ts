// API Route: 영감 업로드 (SERVICE_ROLE_KEY 사용)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 서버사이드 전용 Supabase 클라이언트 (RLS 우회)
function getServerSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('\n🔑 [ENV CHECK] Supabase configuration:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ MISSING');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ MISSING');

    if (!supabaseUrl) {
        throw new Error('❌ 환경 변수 설정이 필요합니다: NEXT_PUBLIC_SUPABASE_URL이 없습니다.');
    }

    if (!supabaseServiceKey) {
        throw new Error('❌ 환경 변수 설정이 필요합니다: SUPABASE_SERVICE_ROLE_KEY가 없습니다. .env.local 파일을 확인하세요.');
    }

    console.log('✅ Creating Supabase client with SERVICE_ROLE_KEY (RLS bypass enabled)');

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
        const inspirationId = formData.get('inspirationId') as string;
        const artistId = formData.get('artistId') as string;
        const colorPaletteStr = formData.get('colorPalette') as string;
        const metadataStr = formData.get('metadata') as string;

        console.log('📝 Received:');
        console.log('  - Image:', blurImage ? `✅ ${blurImage.size} bytes` : '❌ Missing');
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
        // Step 4: Storage 업로드
        // ========================================
        console.log('\n📸 [STEP 4/6] Uploading to storage...');
        const fileName = `${artistId}/${inspirationId}_blur.jpg`;
        console.log('  - Path:', fileName);

        const arrayBuffer = await blurImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('inspirations-blur')
            .upload(fileName, buffer, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (uploadError) {
            console.error('\n❌ Storage upload failed!');
            console.error('  Message:', uploadError.message);
            console.error('  Error:', JSON.stringify(uploadError, null, 2));

            let hint = 'Check storage permissions';
            if (uploadError.message.includes('Bucket')) {
                hint = 'Create "inspirations-blur" bucket in Supabase Storage (set as Public)';
            }

            return NextResponse.json(
                {
                    error: 'Failed to upload image to storage',
                    details: uploadError.message,
                    hint
                },
                { status: 500 }
            );
        }

        console.log('✅ Storage upload success');

        // ========================================
        // Step 5: 공개 URL
        // ========================================
        console.log('\n🔗 [STEP 5/6] Getting public URL...');
        const { data: urlData } = supabase.storage
            .from('inspirations-blur')
            .getPublicUrl(fileName);

        const blurImageUrl = urlData.publicUrl;
        console.log('  - URL:', blurImageUrl);

        // ========================================
        // Step 6: DB 저장
        // ========================================
        console.log('\n💾 [STEP 6/6] Saving to database...');

        const insertData = {
            id: inspirationId,
            artist_id: artistId,
            blur_image_url: blurImageUrl,
            color_palette: colorPalette,
            metadata: metadata,
        };

        console.log('  - Data:', insertData);

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
