// 박야일 작가 실제 데이터 찾기
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findRealData() {
    console.log('🔍 박야일 작가의 실제 데이터 찾는 중...\n');

    // 1. 모든 artworks 조회
    const { data: allArtworks, error } = await supabase
        .from('artworks')
        .select('artist_id, artist_name, title, year')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) {
        console.error('❌ 조회 실패:', error);
        return;
    }

    console.log(`📊 총 작품 수: ${allArtworks?.length || 0}개\n`);

    // artist_id별로 그룹핑
    const grouped = {};
    allArtworks?.forEach(artwork => {
        const id = artwork.artist_id || 'NULL';
        if (!grouped[id]) {
            grouped[id] = {
                count: 0,
                name: artwork.artist_name || 'Unknown',
                samples: []
            };
        }
        grouped[id].count++;
        if (grouped[id].samples.length < 3) {
            grouped[id].samples.push(artwork.title);
        }
    });

    console.log('📋 ARTIST_ID별 작품 수:\n');
    Object.entries(grouped).forEach(([artistId, info]) => {
        console.log(`${artistId.padEnd(20)} | ${info.count}개 | ${info.name}`);
        console.log(`   샘플: ${info.samples.join(', ')}`);
        console.log('');
    });

    console.log('\n💡 박야일 작가 데이터(19개)는 어떤 artist_id에 있나요?');
}

findRealData();
