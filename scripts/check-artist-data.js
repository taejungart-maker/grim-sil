// 박야일 작가 데이터 긴급 복구 스크립트
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 환경변수가 없습니다!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndRestoreData() {
    console.log('🔍 박야일 작가 데이터 확인 중...\n');

    // 1. 박야일 작가의 작품 확인
    const { data: artworks, error: artworkError } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', '-vqsk');

    if (artworkError) {
        console.error('❌ 데이터 조회 실패:', artworkError);
        return;
    }

    console.log(`📊 현재 박야일 작가의 작품 수: ${artworks?.length || 0}개\n`);

    if (artworks && artworks.length > 0) {
        console.log('✅ 박야일 작가 데이터가 존재합니다!');
        console.log('\n작품 목록:');
        artworks.forEach((artwork, index) => {
            console.log(`${index + 1}. ${artwork.title} (${artwork.year}년)`);
        });
        console.log('\n⚠️  데이터는 있는데 화면에 안보인다면:');
        console.log('   - 브라우저 캐시 문제');
        console.log('   - Vercel 환경변수가 아직 적용 안됨');
        console.log('   - RLS 정책 문제');
    } else {
        console.log('❌ 박야일 작가 데이터가 없습니다!');
        console.log('📦 샘플 데이터 삽입 중...\n');

        // 샘플 데이터 삽입
        const sampleArtwork = {
            artist_id: '-vqsk',
            title: '테스트 작품',
            year: 2025,
            month: 1,
            medium: '캔버스에 유화',
            dimensions: '100x80cm',
            image_url: 'https://via.placeholder.com/800x600',
            description: '박야일 작가 데이터 복구 테스트',
            price: '500,000원',
            artist_name: '박야일'
        };

        const { error: insertError } = await supabase
            .from('artworks')
            .insert([sampleArtwork]);

        if (insertError) {
            console.error('❌ 샘플 데이터 삽입 실패:', insertError);
        } else {
            console.log('✅ 샘플 데이터 삽입 성공!');
        }
    }

    // 2. Settings 확인
    const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('artist_id', '-vqsk')
        .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('\n❌ Settings 조회 실패:', settingsError);
    } else if (!settings) {
        console.log('\n⚠️  Settings 데이터가 없습니다.');
    } else {
        console.log('\n✅ Settings 존재:', settings.artistName);
    }
}

checkAndRestoreData()
    .then(() => {
        console.log('\n✅ 점검 완료!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ 오류 발생:', error);
        process.exit(1);
    });
