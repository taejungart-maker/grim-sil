
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// VIP 갤러리 ID 목록 (샘플 데이터 삭제 대상)
const VIP_GALLERY_IDS = [
    'vip-gallery-01',
    'vip-gallery-02',
    'vip-gallery-03',
    'vip-gallery-04',
    'vip-gallery-05'
];

async function cleanupVIPSamples() {
    console.log('🧹 Cleaning up VIP gallery sample artworks...\n');
    console.log('⚠️  This will delete ALL artworks from VIP galleries (vip-gallery-01 ~ 05)');
    console.log('✅ Main gallery (default) artworks will be preserved\n');

    // 각 VIP 갤러리별로 작품 조회 및 삭제
    let totalDeleted = 0;

    for (const galleryId of VIP_GALLERY_IDS) {
        console.log(`\n📂 Processing ${galleryId}...`);

        // 해당 갤러리의 모든 작품 조회
        const { data: artworks, error: fetchError } = await supabase
            .from('artworks')
            .select('id, title, artist_id')
            .eq('artist_id', galleryId);

        if (fetchError) {
            console.error(`❌ Error fetching artworks for ${galleryId}:`, fetchError);
            continue;
        }

        if (!artworks || artworks.length === 0) {
            console.log(`   ✓ Already empty (0 artworks)`);
            continue;
        }

        console.log(`   Found ${artworks.length} artworks to delete:`);

        // 각 작품 삭제
        for (const artwork of artworks) {
            const { error: deleteError } = await supabase
                .from('artworks')
                .delete()
                .eq('id', artwork.id)
                .eq('artist_id', galleryId);

            if (deleteError) {
                console.error(`   ❌ Failed to delete ${artwork.id}:`, deleteError.message);
            } else {
                console.log(`   ✓ Deleted: ${artwork.title} (${artwork.id})`);
                totalDeleted++;
            }
        }
    }

    console.log(`\n\n✅ Cleanup complete!`);
    console.log(`   Total VIP artworks deleted: ${totalDeleted}`);
    console.log(`   Main gallery (default) artworks: Preserved ✅\n`);
}

// 확인 메시지
async function showPreview() {
    console.log('📊 Current database state:\n');

    // 모든 갤러리의 작품 수 확인
    const { data: allArtworks } = await supabase
        .from('artworks')
        .select('artist_id');

    const counts = {};
    allArtworks?.forEach(a => {
        counts[a.artist_id] = (counts[a.artist_id] || 0) + 1;
    });

    console.log('Main Gallery:');
    console.log(`  default: ${counts['default'] || 0} artworks ✅ (will be KEPT)\n`);

    console.log('VIP Galleries:');
    VIP_GALLERY_IDS.forEach(id => {
        console.log(`  ${id}: ${counts[id] || 0} artworks ❌ (will be DELETED)`);
    });

    const vipTotal = VIP_GALLERY_IDS.reduce((sum, id) => sum + (counts[id] || 0), 0);
    console.log(`\nTotal VIP artworks to delete: ${vipTotal}\n`);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--delete')) {
        await cleanupVIPSamples();
    } else {
        await showPreview();
        console.log('───────────────────────────────────────');
        console.log('To proceed with deletion, run:');
        console.log('node scripts/cleanup-vip-samples.js --delete');
    }
}

main();
