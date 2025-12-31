// 프로필 데이터 독립성 검증 스크립트
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 확인할 ARTIST_ID 목록
const ARTIST_IDS = [
    '-vqsk',           // 박야일 홍보용
    '-hyunju',         // 하현주 무료 갤러리
    '-3ibp',           // 문혜경 무료 갤러리
    '-5e4p',           // 황미경 무료 갤러리
    'vip-gallery-01',  // VIP-01
    'vip-gallery-02',  // VIP-02
    'vip-gallery-03',  // VIP-03
    'vip-gallery-04',  // VIP-04
    'vip-gallery-05',  // VIP-05
];

async function checkProfileIsolation() {
    console.log('🔍 프로필 데이터 독립성 검증 시작...\n');

    for (const artistId of ARTIST_IDS) {
        console.log(`\n📋 ARTIST_ID: ${artistId}`);
        console.log('─'.repeat(60));

        try {
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('id', artistId)
                .single();

            if (error || !data) {
                console.log(`❌ 프로필 없음 (기본값 사용)`);
                continue;
            }

            console.log(`✅ 프로필 발견`);
            console.log(`   작가명: ${data.artist_name || '미설정'}`);
            console.log(`   갤러리명(한글): ${data.gallery_name_ko || '미설정'}`);
            console.log(`   갤러리명(영문): ${data.gallery_name_en || '미설정'}`);
            console.log(`   테마: ${data.theme || '기본값'}`);
            console.log(`   최종 수정: ${data.updated_at || '없음'}`);
        } catch (err) {
            console.error(`❌ 오류: ${err}`);
        }
    }

    console.log('\n\n✅ 검증 완료!');
}

checkProfileIsolation();
