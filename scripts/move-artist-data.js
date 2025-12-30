// default → -vqsk로 데이터 이동
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function moveData() {
    console.log('🔄 박야일 작가 데이터 이동 중...\n');
    console.log('   default → -vqsk\n');

    // 1. default의 모든 작품을 -vqsk로 변경
    const { error: updateError } = await supabase
        .from('artworks')
        .update({ artist_id: '-vqsk' })
        .eq('artist_id', 'default');

    if (updateError) {
        console.error('❌ 데이터 이동 실패:', updateError);
        return;
    }

    console.log('✅ 작품 데이터 이동 완료!');

    // 2. 확인
    const { data: movedData } = await supabase
        .from('artworks')
        .select('title, year')
        .eq('artist_id', '-vqsk');

    console.log(`\n📊 -vqsk에 있는 작품: ${movedData?.length || 0}개`);
    console.log('\n🎉 박야일 작가 데이터 복구 완료!');
    console.log('\n🎯 이제 grim-sil.vercel.app를 시크릿 모드로 열어보세요!');
}

moveData();
