const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getData() {
    const { data: artworks } = await supabase
        .from('artworks')
        .select('title, year, month, dimensions, medium, image_url, description')
        .eq('artist_id', '-vqsk')
        .limit(10);

    const { data: settings } = await supabase
        .from('settings')
        .select('*')
        .eq('id', '-vqsk')
        .single();

    console.log('--- CLEAN_ARTWORKS ---');
    console.log(JSON.stringify(artworks, null, 2));
    console.log('--- CLEAN_SETTINGS ---');
    console.log(JSON.stringify(settings, null, 2));
}

getData();
