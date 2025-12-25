// Supabase 설정 확인 스크립트 (dotenv 사용)
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 환경 변수가 설정되지 않았습니다.');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
    console.log('🔍 Supabase 설정 확인 중...\n');

    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'default')
        .single();

    if (error) {
        console.error('❌ 오류:', error);
        return;
    }

    if (!data) {
        console.log('⚠️ 설정 데이터가 없습니다.');
        return;
    }

    console.log('✅ 현재 저장된 설정:\n');
    console.log('갤러리 영문명:', data.gallery_name_en);
    console.log('갤러리 한글명:', data.gallery_name_ko);
    console.log('작가 이름:', data.artist_name);
    console.log('사이트 제목:', data.site_title);
    console.log('사이트 설명:', data.site_description);
    console.log('\n마지막 업데이트:', data.updated_at);
}

checkSettings();
