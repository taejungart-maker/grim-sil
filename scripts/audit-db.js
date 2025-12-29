
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRows() {
    console.log("--- Settings Table Audit ---");
    const { data: settings, error: sError } = await supabase.from('settings').select('*');
    if (sError) console.error(sError);
    else {
        settings.forEach(s => {
            console.log(`ID: ${s.artist_id} | Name: ${s.artist_name_ko} | Title: ${s.site_title}`);
        });
    }

    console.log("\n--- Artworks Count Audit ---");
    const { data: artworks, error: aError } = await supabase.from('artworks').select('artist_id');
    if (aError) console.error(aError);
    else {
        const counts = {};
        artworks.forEach(a => counts[a.artist_id] = (counts[a.artist_id] || 0) + 1);
        console.log(JSON.stringify(counts, null, 2));
    }
}

checkRows();
