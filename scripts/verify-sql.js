/**
 * SQL 실행 확인 스크립트
 * - 자동으로 스키마 검증
 * - 결과 리포트
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySQLExecution() {
    console.log('🔍 SQL 실행 결과 확인 중...\n');

    try {
        // artists 테이블 확인
        const { data: artists, error } = await supabase
            .from('artists')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ artists 테이블 접근 실패:', error.message);
            return false;
        }

        if (!artists || artists.length === 0) {
            console.log('⚠️  artists 테이블이 비어있습니다.');
            return false;
        }

        const columns = Object.keys(artists[0]);
        const requiredColumns = ['link_id', 'artist_type', 'is_free', 'subscription_price'];

        console.log('✅ artists 테이블 확인 완료\n');
        console.log('현재 컬럼:', columns.join(', '), '\n');

        const missingColumns = requiredColumns.filter(col => !columns.includes(col));

        if (missingColumns.length > 0) {
            console.log('❌ 누락된 VIP 컬럼:', missingColumns.join(', '));
            console.log('\n다시 SQL을 실행해주세요!\n');
            return false;
        }

        console.log('✅ 모든 VIP 컬럼 존재 확인!\n');

        // auth_passwords 테이블 확인
        const { error: pwdError } = await supabase
            .from('auth_passwords')
            .select('*')
            .limit(1);

        if (pwdError) {
            if (pwdError.code === 'PGRST116' || pwdError.message.includes('not find')) {
                console.log('❌ auth_passwords 테이블 없음\n');
                console.log('다시 SQL을 실행해주세요!\n');
                return false;
            }
        }

        console.log('✅ auth_passwords 테이블 존재 확인!\n');
        console.log('='.repeat(60));
        console.log('🎉 SQL 실행 완료! 모든 준비가 끝났습니다!');
        console.log('='.repeat(60));
        console.log('\n다음 단계:');
        console.log('1. 브라우저에서 http://localhost:3000/admin 새로고침');
        console.log('2. VIP 링크 생성 테스트\n');

        return true;

    } catch (err) {
        console.error('❌ 오류:', err.message);
        return false;
    }
}

// 5초마다 자동 확인 (최대 10회)
let attempts = 0;
const maxAttempts = 10;

function checkWithRetry() {
    attempts++;
    console.log(`\n[시도 ${attempts}/${maxAttempts}]`);

    verifySQLExecution().then(success => {
        if (success) {
            console.log('\n✅ 검증 완료! 스크립트를 종료합니다.\n');
            process.exit(0);
        } else if (attempts < maxAttempts) {
            console.log(`\n⏳ 5초 후 다시 확인합니다... (남은 시도: ${maxAttempts - attempts}회)\n`);
            setTimeout(checkWithRetry, 5000);
        } else {
            console.log('\n❌ 최대 시도 횟수 초과. SQL을 다시 확인해주세요.\n');
            process.exit(1);
        }
    });
}

// 시작
console.log('='.repeat(60));
console.log('SQL 실행 확인 자동 모니터링 시작');
console.log('='.repeat(60));
console.log('\nSupabase Dashboard에서 SQL을 실행하세요.');
console.log('이 스크립트가 자동으로 확인합니다...\n');

checkWithRetry();
