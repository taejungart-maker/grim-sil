
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSettings() {
    console.log('Checking settings for -hyunju, -3ibp, -5e4p...');

    const ids = ['-hyunju', '-3ibp', '-5e4p'];

    for (const id of ids) {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching settings for ${id}:`, error.message);
        } else {
            console.log(`Settings for ${id}:`, {
                artist_name: data.artist_name,
                gallery_name_ko: data.gallery_name_ko,
                site_title: data.site_title
            });
        }
    }
}

checkSettings();
