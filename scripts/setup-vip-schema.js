/**
 * Supabase VIP 시스템 스키마 자동 설정 스크립트
 * - artists 테이블에 VIP 컬럼 추가
 * - auth_passwords 테이블 생성
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupVipSchema() {
    console.log('='.repeat(80));
    console.log('🔧 Supabase VIP 시스템 스키마 설정 시작');
    console.log('='.repeat(80));
    console.log('');

    try {
        // 1. artists 테이블에 VIP 컬럼 추가
        console.log('1️⃣ artists 테이블에 VIP 컬럼 추가 중...');

        const alterTableSQL = `
      ALTER TABLE artists 
      ADD COLUMN IF NOT EXISTS link_id TEXT,
      ADD COLUMN IF NOT EXISTS artist_type TEXT DEFAULT 'standard',
      ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS subscription_price INTEGER;
    `;

        const { error: alterError } = await supabase.rpc('exec_sql', {
            sql: alterTableSQL
        }).single();

        if (alterError) {
            console.log('⚠️  RPC 방식 실패, 직접 확인 방식으로 전환...');

            // 대안: 테이블 구조 확인
            const { data: columns, error: columnsError } = await supabase
                .from('artists')
                .select('*')
                .limit(1);

            if (columnsError) {
                console.error('❌ artists 테이블 접근 실패:', columnsError.message);
            } else {
                console.log('✅ artists 테이블 접근 성공');

                if (columns && columns.length > 0) {
                    const firstRow = columns[0];
                    console.log('현재 컬럼:', Object.keys(firstRow).join(', '));

                    const hasLinkId = 'link_id' in firstRow;
                    const hasArtistType = 'artist_type' in firstRow;
                    const hasIsFree = 'is_free' in firstRow;
                    const hasSubscriptionPrice = 'subscription_price' in firstRow;

                    if (hasLinkId && hasArtistType && hasIsFree && hasSubscriptionPrice) {
                        console.log('✅ 모든 VIP 컬럼이 이미 존재합니다!');
                    } else {
                        console.log('⚠️  일부 VIP 컬럼이 누락됨:');
                        if (!hasLinkId) console.log('   - link_id 없음');
                        if (!hasArtistType) console.log('   - artist_type 없음');
                        if (!hasIsFree) console.log('   - is_free 없음');
                        if (!hasSubscriptionPrice) console.log('   - subscription_price 없음');
                        console.log('');
                        console.log('⚠️  수동으로 Supabase Dashboard에서 컬럼을 추가해야 합니다.');
                    }
                }
            }
        } else {
            console.log('✅ artists 테이블 컬럼 추가 완료');
        }
        console.log('');

        // 2. auth_passwords 테이블 확인
        console.log('2️⃣ auth_passwords 테이블 확인 중...');

        const { data: passwordsData, error: passwordsError } = await supabase
            .from('auth_passwords')
            .select('*')
            .limit(1);

        if (passwordsError) {
            if (passwordsError.code === '42P01') { // relation does not exist
                console.log('⚠️  auth_passwords 테이블이 존재하지 않습니다.');
                console.log('');
                console.log('📝 수동 생성 필요: Supabase Dashboard → SQL Editor에서 실행:');
                console.log('');
                console.log('CREATE TABLE auth_passwords (');
                console.log('    id SERIAL PRIMARY KEY,');
                console.log('    artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,');
                console.log('    password_hash TEXT NOT NULL,');
                console.log('    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
                console.log('    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
                console.log('    UNIQUE(artist_id)');
                console.log(');');
            } else {
                console.error('❌ auth_passwords 테이블 확인 실패:', passwordsError.message);
            }
        } else {
            console.log('✅ auth_passwords 테이블이 존재합니다!');
            console.log(`   현재 ${passwordsData?.length || 0}개의 비밀번호 저장됨`);
        }
        console.log('');

        // 3. 최종 스키마 확인
        console.log('3️⃣ 최종 스키마 확인');
        console.log('-'.repeat(80));

        const { data: artists, error: artistsCheckError } = await supabase
            .from('artists')
            .select('*')
            .limit(1);

        if (artists && artists.length > 0) {
            console.log('✅ artists 테이블 컬럼 목록:');
            Object.keys(artists[0]).forEach((col, idx) => {
                console.log(`   ${idx + 1}. ${col}`);
            });
        }
        console.log('');

        // 4. 결과 요약
        console.log('='.repeat(80));
        console.log('📊 스키마 설정 결과');
        console.log('='.repeat(80));

        const hasAllColumns = artists && artists.length > 0 &&
            'link_id' in artists[0] &&
            'artist_type' in artists[0] &&
            'is_free' in artists[0] &&
            'subscription_price' in artists[0];

        if (hasAllColumns && !passwordsError) {
            console.log('✅ VIP 시스템 스키마 설정 완료!');
            console.log('');
            console.log('다음 단계:');
            console.log('1. 브라우저에서 http://localhost:3000/admin 새로고침');
            console.log('2. VIP 링크 생성 테스트');
        } else {
            console.log('⚠️  일부 설정이 완료되지 않았습니다.');
            console.log('');
            console.log('📝 수동 설정이 필요합니다:');
            console.log('1. Supabase Dashboard 접속');
            console.log('2. SQL Editor에서 setup-vip-schema.sql 실행');
            console.log('');
            console.log('파일 위치: scripts/setup-vip-schema.sql');
        }

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    }
}

setupVipSchema();
