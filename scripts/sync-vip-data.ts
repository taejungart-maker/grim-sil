import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';


dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SOURCE_ID = '-vqsk';
const TARGET_ID = 'vip-gallery-03';

async function syncData() {
    console.log(`\n🔄 Syncing data from ${SOURCE_ID} to ${TARGET_ID}...`);

    try {
        // 1. 설정 복제
        console.log('⚙️  Syncing settings...');
        const { data: settingsData, error: settingsError } = await supabase
            .from('settings')
            .select('*')
            .eq('id', SOURCE_ID)
            .single();

        if (settingsError) throw settingsError;

        const { error: upsertSettingsError } = await supabase
            .from('settings')
            .upsert({
                ...settingsData,
                id: TARGET_ID,
                updated_at: new Date().toISOString()
            });

        if (upsertSettingsError) throw upsertSettingsError;
        console.log('✅ Settings synced.');

        // 2. 작품 데이터 복제
        console.log('🖼️  Syncing artworks...');

        // 기존 타겟 작품 삭제 (중복 방지)
        await supabase.from('artworks').delete().eq('artist_id', TARGET_ID);

        const { data: artworksData, error: artworksError } = await supabase
            .from('artworks')
            .select('*')
            .eq('artist_id', SOURCE_ID);

        if (artworksError) throw artworksError;

        if (artworksData && artworksData.length > 0) {
            const newArtworks = artworksData.map(art => ({
                ...art,
                id: undefined, // Let DB generate new ID or use a placeholder to ensure it's a new row
                artist_id: TARGET_ID,
                created_at: new Date().toISOString()
            }));

            // Insert in chunks to avoid any potential limits
            const { error: insertError } = await supabase
                .from('artworks')
                .insert(newArtworks);

            if (insertError) throw insertError;
            console.log(`✅ ${artworksData.length} artworks synced.`);
        } else {
            console.log('ℹ️  No artworks to sync.');
        }

        console.log('\n✨ Data sync complete for vip-gallery-03!');

    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncData();
