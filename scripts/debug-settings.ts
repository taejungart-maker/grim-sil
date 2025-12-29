import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSettings() {
    console.log('🔍 === Supabase Settings Table Check ===\n');

    const { data, error } = await supabase
        .from("settings")
        .select("id, artist_name, site_title, aboutme_image")
        .order('id');

    if (error) {
        console.error('❌ Error fetching settings:', error.message);
        return;
    }

    console.table(data);

    const mainArtistId = process.env.NEXT_PUBLIC_ARTIST_ID || "default";
    console.log(`\n📌 Current Main Artist ID (NEXT_PUBLIC_ARTIST_ID): ${mainArtistId}`);

    const mainSettings = data.find(s => s.id === mainArtistId);
    if (mainSettings) {
        console.log(`✅ Main site is currently showing: ${mainSettings.artist_name} (${mainSettings.site_title})`);
    } else {
        console.log(`⚠️ No settings found for ID: ${mainArtistId}`);
    }
}

debugSettings().catch(console.error);
