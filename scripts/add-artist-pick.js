/**
 * 동행 작가 추가 스크립트  
 * "문혜경" 작가를 artistPicks에 추가합니다
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ofzvskfrvlezpqnnegke.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9menZza2ZydmxlenBxbm5lZ2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MTE4MzcsImV4cCI6MjA0ODA4NzgzN30.SxbYJGEwmPx2qR3s-7d0zQ_sZWLX-TjOOVZR0f6kL40';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addArtistPick() {
    try {
        console.log('📝 동행 작가 목록에 "문혜경" 작가 추가 중...');

        // 현재 설정 가져오기
        const { data: settings, error: fetchError } = await supabase
            .from('site_settings')
            .select('*')
            .eq('artist_id', '-vqsk')
            .single();

        if (fetchError) {
            console.error('❌ 설정 조회 실패:', fetchError);
            return;
        }

        // 기존 artistPicks 가져오기
        let artistPicks = [];
        try {
            artistPicks = settings.artist_picks ? JSON.parse(settings.artist_picks) : [];
        } catch (e) {
            artistPicks = settings.artist_picks || [];
        }

        // "문혜경" 작가가 이미 있는지 확인
        const exists = artistPicks.some(pick => pick.name === '문혜경 작가');
        if (exists) {
            console.log('✅ "문혜경" 작가가 이미 등록되어 있습니다.');
            return;
        }

        // "문혜경" 작가 추가
        artistPicks.push({
            name: '문혜경 작가',
            archiveUrl: 'http://localhost:3000/gallery-vip-02',
            imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
        });

        // 데이터베이스 업데이트
        const { error: updateError } = await supabase
            .from('site_settings')
            .update({ artist_picks: JSON.stringify(artistPicks) })
            .eq('artist_id', '-vqsk');

        if (updateError) {
            console.error('❌ 업데이트 실패:', updateError);
            return;
        }

        console.log(`✅ "문혜경" 작가가 성공적으로 추가되었습니다!`);
        console.log(`📊 현재 등록된 동행 작가: ${artistPicks.length}명`);
        artistPicks.forEach((pick, i) => {
            console.log(`   ${i + 1}. ${pick.name}`);
        });

    } catch (error) {
        console.error('❌ 오류 발생:', error);
    }
}

addArtistPick();
