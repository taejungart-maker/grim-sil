
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanupTestData() {
    console.log("🧹 Starting Test Data Cleanup...");

    // 1. Find test artworks
    // We look for titles containing "TEST" or "STRESS"
    const { data: testArtworks, error: findError } = await supabase
        .from('artworks')
        .select('id, title, image_url')
        .or('title.ilike.%TEST%,title.ilike.%STRESS%');

    if (findError) {
        console.error("❌ Error finding test artworks:", findError);
        return;
    }

    if (!testArtworks || testArtworks.length === 0) {
        console.log("✅ No test artworks found to delete.");
    } else {
        console.log(`🔍 Found ${testArtworks.length} test artworks.`);

        for (const artwork of testArtworks) {
            console.log(`🗑️ Deleting: [${artwork.id}] ${artwork.title}`);

            // Delete from database
            const { error: dbDeleteError } = await supabase
                .from('artworks')
                .delete()
                .eq('id', artwork.id);

            if (dbDeleteError) {
                console.error(`❌ DB Delete failed for ${artwork.id}:`, dbDeleteError);
                continue;
            }

            // Delete from storage if it's a Supabase URL
            if (artwork.image_url && artwork.image_url.includes('storage/v1/object/public/artworks/')) {
                const pathParts = artwork.image_url.split('/storage/v1/object/public/artworks/');
                if (pathParts.length === 2) {
                    const filePath = pathParts[1];
                    console.log(`📦 Deleting from storage: ${filePath}`);
                    const { error: storageError } = await supabase.storage
                        .from('artworks')
                        .remove([filePath]);

                    if (storageError) {
                        console.warn(`⚠️ Storage Removal failed for ${filePath}:`, storageError);
                    }
                }
            }
        }
        console.log("✅ Cleanup of test records and images complete.");
    }

    // 2. Final Audit of Valid Rooms
    console.log("\n📊 Final Room Integrity Audit:");
    const { data: counts } = await supabase.from('artworks').select('artist_id');
    const stats = {};
    counts?.forEach(c => stats[c.artist_id] = (stats[c.artist_id] || 0) + 1);

    console.log(JSON.stringify(stats, null, 2));
    console.log("\n✨ System is now clean and isolated.");
}

cleanupTestData();
