
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 유효한 artist_id 목록
const VALID_ARTIST_IDS = [
    'default',
    'vip-gallery-01',
    'vip-gallery-02',
    'vip-gallery-03',
    'vip-gallery-04',
    'vip-gallery-05'
];

async function identifyCorruptedArtworks() {
    console.log('🔍 Identifying corrupted artworks...\n');

    // 모든 작품 가져오기
    const { data: allArtworks, error } = await supabase
        .from('artworks')
        .select('id, title, artist_id, image_url, created_at');

    if (error) {
        console.error('Error fetching artworks:', error);
        return;
    }

    // 비정상적인 artist_id를 가진 작품들 필터링
    const corruptedArtworks = allArtworks.filter(
        artwork => !VALID_ARTIST_IDS.includes(artwork.artist_id)
    );

    console.log(`📊 Total artworks in database: ${allArtworks.length}`);
    console.log(`✅ Valid artworks: ${allArtworks.length - corruptedArtworks.length}`);
    console.log(`❌ Corrupted artworks: ${corruptedArtworks.length}\n`);

    if (corruptedArtworks.length > 0) {
        console.log('--- Corrupted Artworks Details ---\n');

        // artist_id별로 그룹화
        const groupedByArtistId = {};
        corruptedArtworks.forEach(artwork => {
            if (!groupedByArtistId[artwork.artist_id]) {
                groupedByArtistId[artwork.artist_id] = [];
            }
            groupedByArtistId[artwork.artist_id].push(artwork);
        });

        // 각 그룹 출력
        Object.entries(groupedByArtistId).forEach(([artistId, artworks]) => {
            console.log(`\n🚨 artist_id: "${artistId}" (${artworks.length} artworks)`);
            artworks.forEach(artwork => {
                console.log(`   - ID: ${artwork.id}`);
                console.log(`     Title: ${artwork.title}`);
                console.log(`     Created: ${new Date(artwork.created_at).toLocaleDateString('ko-KR')}`);
                console.log(`     Image: ${artwork.image_url.substring(0, 60)}...`);
            });
        });

        console.log('\n\n--- Cleanup Options ---');
        console.log('To delete these corrupted artworks, run: node scripts/cleanup-corrupted.js --delete');
        console.log('To export list to JSON, run: node scripts/cleanup-corrupted.js --export');
    } else {
        console.log('✨ No corrupted artworks found! Database is clean.\n');
    }
}

async function deleteCorruptedArtworks() {
    console.log('🗑️  Deleting corrupted artworks...\n');

    // 모든 작품 가져오기
    const { data: allArtworks, error } = await supabase
        .from('artworks')
        .select('id, artist_id');

    if (error) {
        console.error('Error fetching artworks:', error);
        return;
    }

    // 비정상적인 artist_id를 가진 작품들 필터링
    const corruptedArtworks = allArtworks.filter(
        artwork => !VALID_ARTIST_IDS.includes(artwork.artist_id)
    );

    if (corruptedArtworks.length === 0) {
        console.log('✨ No corrupted artworks to delete.\n');
        return;
    }

    console.log(`Found ${corruptedArtworks.length} corrupted artworks to delete...`);

    // 각 작품 삭제
    let deletedCount = 0;
    for (const artwork of corruptedArtworks) {
        const { error: delError } = await supabase
            .from('artworks')
            .delete()
            .eq('id', artwork.id);

        if (delError) {
            console.error(`Failed to delete ${artwork.id}:`, delError);
        } else {
            deletedCount++;
            console.log(`✓ Deleted: ${artwork.id} (artist_id: ${artwork.artist_id})`);
        }
    }

    console.log(`\n✅ Successfully deleted ${deletedCount}/${corruptedArtworks.length} corrupted artworks.\n`);
}

async function exportCorruptedList() {
    const { data: allArtworks, error } = await supabase
        .from('artworks')
        .select('*');

    if (error) {
        console.error('Error fetching artworks:', error);
        return;
    }

    const corruptedArtworks = allArtworks.filter(
        artwork => !VALID_ARTIST_IDS.includes(artwork.artist_id)
    );

    const fs = require('fs');
    const exportData = {
        exportDate: new Date().toISOString(),
        totalCorrupted: corruptedArtworks.length,
        artworks: corruptedArtworks
    };

    fs.writeFileSync('corrupted-artworks.json', JSON.stringify(exportData, null, 2));
    console.log('✅ Exported corrupted artworks to corrupted-artworks.json\n');
}

// 메인 실행
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--delete')) {
        await deleteCorruptedArtworks();
    } else if (args.includes('--export')) {
        await exportCorruptedList();
    } else {
        await identifyCorruptedArtworks();
    }
}

main();
