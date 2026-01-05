import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkSchema() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Env variables missing');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 테이블 정보 조회
    const { data: columns, error } = await supabase
        .rpc('get_columns_info', { table_name: 'inspirations' });

    if (error) {
        // RPC가 없을 수 있으므로 직접 쿼리 시도
        console.warn('⚠️ RPC failed, trying generic query...');
        const { data: testData, error: testError } = await supabase
            .from('inspirations')
            .select('*')
            .limit(1);

        if (testError) {
            console.error('❌ Table "inspirations" check failed:', testError.message);
        } else {
            console.log('✅ Table "inspirations" exists.');
            console.log('Sample Data Key Names:', testData.length > 0 ? Object.keys(testData[0]) : 'No data to show keys');
        }
    } else {
        console.log('📊 Columns:', columns);
    }
}

checkSchema();
