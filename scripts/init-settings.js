/**
 * settings 테이블 초기화 스크립트
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeSettings() {
    console.log('🔧 settings 테이블 초기화 중...\n');

    // 1. default ID 설정 확인
    const { data: existing, error: checkError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'default')
        .single();

    if (existing) {
        console.log('✅ default 설정이 이미 존재합니다:');
        console.log('   비밀번호:', existing.admin_password);
        console.log('\n✅ 관리자 비밀번호:', existing.admin_password);
        return existing.admin_password;
    }

    // 2. default 설정이 없으면 생성
    console.log('⚠️  default 설정이 없습니다. 생성 중...\n');

    const { data: inserted, error: insertError } = await supabase
        .from('settings')
        .insert([
            {
                id: 'default',
                admin_password: '1213'
            }
        ])
        .select()
        .single();

    if (insertError) {
        console.error('❌ 삽입 실패:', insertError.message);

        // upsert 시도
        const { data: upserted, error: upsertError } = await supabase
            .from('settings')
            .upsert([
                {
                    id: 'default',
                    admin_password: '1213'
                }
            ])
            .select()
            .single();

        if (upsertError) {
            console.error('❌ upsert도 실패:', upsertError.message);
            return null;
        }

        console.log('✅ default 설정 생성 완료 (upsert)!');
        console.log('   비밀번호: 1213');
        return '1213';
    }

    console.log('✅ default 설정 생성 완료!');
    console.log('   비밀번호: 1213');
    return '1213';
}

initializeSettings();
