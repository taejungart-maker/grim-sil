import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkInspirations() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔗 Connecting to:', supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
        .from('inspirations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('❌ Error fetching inspirations:', error);
        return;
    }

    console.log(`\n📊 Found ${data?.length || 0} inspirations:`);
    data.forEach((item, i) => {
        console.log(`\n[${i + 1}] ID: ${item.id}`);
        console.log(`    Artist: ${item.artist_id}`);
        console.log(`    Image URL: ${item.image_url}`);
        console.log(`    Blur URL: ${item.blur_image_url}`);
        console.log(`    Memo: ${typeof item.metadata === 'string' ? JSON.parse(item.metadata).memo : item.metadata?.memo}`);
        console.log(`    Created: ${item.created_at}`);
    });
}

checkInspirations();
