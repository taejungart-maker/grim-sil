// 박야일 작가 Settings 강제 업데이트
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function forceUpdate() {
    console.log('🔧 박야일 작가 Settings 강제 업데이트 중...\n');

    // UPDATE로 직접 수정
    const { error } = await supabase
        .from('settings')
        .update({
            artist_name: '박야일',
            gallery_name_ko: '박야일 갤러리',
            site_title: '박야일 작가의 온라인 화첩'
        })
        .eq('artist_id', '-vqsk');

    if (error) {
        console.error('❌ 업데이트 실패:', error);
        process.exit(1);
    }

    console.log('✅ Settings 업데이트 완료!');
    console.log('\n🎯 이제 확인:');
    console.log('1. 시크릿 모드로 grim-sil.vercel.app 접속');
    console.log('2. 박야일 작가 작품 확인');
}

forceUpdate();
