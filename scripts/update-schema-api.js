/**
 * Supabase REST API를 사용한 스키마 업데이트
 * - PostgreSQL DDL을 직접 실행
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
    process.exit(1);
}

// Supabase Project Reference 추출
const projectRef = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/)?.[1];

if (!projectRef) {
    console.error('❌ Supabase URL 형식이 올바르지 않습니다.');
    process.exit(1);
}

console.log('='.repeat(80));
console.log('🔧 Supabase 스키마 업데이트 (REST API)');
console.log('='.repeat(80));
console.log('');
console.log(`Project: ${projectRef}`);
console.log('');

const sqlStatements = [
    // 1. artists 테이블에 컬럼 추가
    `ALTER TABLE artists ADD COLUMN IF NOT EXISTS link_id TEXT;`,
    `ALTER TABLE artists ADD COLUMN IF NOT EXISTS artist_type TEXT DEFAULT 'standard';`,
    `ALTER TABLE artists ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;`,
    `ALTER TABLE artists ADD COLUMN IF NOT EXISTS subscription_price INTEGER;`,

    // 2. auth_passwords 테이블 생성
    `CREATE TABLE IF NOT EXISTS auth_passwords (
    id SERIAL PRIMARY KEY,
    artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

    // 3. 유니크 제약
    `DO $$ 
  BEGIN
    ALTER TABLE auth_passwords ADD CONSTRAINT unique_artist_password UNIQUE (artist_id);
  EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN duplicate_object THEN NULL;
  END $$;`,

    // 4. 기존 데이터 업데이트
    `UPDATE artists SET artist_type = 'standard' WHERE artist_type IS NULL;`
];

async function executeSQL(sql, index) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ query: sql });

        const options = {
            hostname: `${projectRef}.supabase.co`,
            port: 443,
            path: '/rest/v1/rpc/exec',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    console.log(`✅ [${index + 1}/${sqlStatements.length}] 실행 성공`);
                    resolve(data);
                } else {
                    console.log(`⚠️  [${index + 1}/${sqlStatements.length}] 상태 코드: ${res.statusCode}`);
                    resolve(data); // 계속 진행
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ [${index + 1}/${sqlStatements.length}] 실패:`, e.message);
            resolve(null); // 계속 진행
        });

        req.write(postData);
        req.end();
    });
}

async function main() {
    console.log('📝 SQL 실행 중...');
    console.log('');

    for (let i = 0; i < sqlStatements.length; i++) {
        await executeSQL(sqlStatements[i], i);
        // 잠시 대기 (API rate limit 방지)
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('');
    console.log('⚠️  Supabase Anon Key로는 DDL 명령을 실행할 수 없습니다.');
    console.log('');
    console.log('✅ 안전한 방법: Supabase Dashboard 사용');
    console.log('');
    console.log('1. https://supabase.com/dashboard 접속');
    console.log('2. 프로젝트 선택');
    console.log('3. SQL Editor 클릭');
    console.log('4. 다음 SQL 복사 & 붙여넣기:');
    console.log('');
    console.log('─'.repeat(80));
    console.log('');
    console.log(sqlStatements.join('\n\n'));
    console.log('');
    console.log('─'.repeat(80));
    console.log('');
    console.log('5. "Run" 버튼 클릭');
    console.log('');
}

main();
