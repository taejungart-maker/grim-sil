import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일을 강제로 읽어서 변수에 할당
const envPath = path.resolve(process.cwd(), '.env.local');
const result = dotenv.config({ path: envPath });

async function checkInspirations() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/"/g, '').trim();
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/"/g, '').trim();

    console.log('--- Configuration ---');
    console.log('Project URL:', supabaseUrl);
    console.log('Service Key (first 10):', supabaseServiceKey?.substring(0, 10) + '...');

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Env variables missing or invalid');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
        .from('inspirations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('❌ Error fetching inspirations:', error);
        return;
    }

    console.log(`\n📊 Found ${data?.length || 0} inspirations:`);
    data.forEach((item, i) => {
        const metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
        console.log(`\n[${i + 1}] ID: ${item.id}`);
        console.log(`    Memo: ${metadata?.memo || '(No Memo)'}`);
        console.log(`    Image URL: ${item.image_url}`);
        console.log(`    Blur URL: ${item.blur_image_url}`);
        console.log(`    Created: ${item.created_at}`);
    });
}

checkInspirations();
