const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function getData() {
    const { data: artworks } = await supabase
        .from('artworks')
        .select('title, year, month, dimensions, medium, image_url, description')
        .eq('artist_id', '-vqsk')
        .limit(5);

    console.log(JSON.stringify(artworks, null, 2));
}

getData();
