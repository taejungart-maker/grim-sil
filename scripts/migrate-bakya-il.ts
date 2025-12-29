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

async function migrateSettings() {
    const mainId = process.env.NEXT_PUBLIC_ARTIST_ID || "-vqsk"; // Explicitly targeting the reported ID

    console.log(`🚀 Starting migration to main ID: ${mainId}`);

    // 1. Get Bakya-il settings from 'default'
    const { data: sourceData, error: fetchError } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "default")
        .single();

    if (fetchError || !sourceData) {
        console.error("❌ Failed to fetch 'default' settings:", fetchError?.message || "No data");
        return;
    }

    console.log(`✅ Found Bakya-il settings (ID: default, Name: ${sourceData.artist_name})`);

    // 2. Prepare for upsert to main ID
    const newSettings = {
        ...sourceData,
        id: mainId,
        updated_at: new Date().toISOString()
    };

    // 3. Upsert to main ID
    const { error: upsertError } = await supabase
        .from("settings")
        .upsert(newSettings, { onConflict: "id" });

    if (upsertError) {
        console.error(`❌ Failed to migrate to ${mainId}:`, upsertError.message);
        return;
    }

    console.log(`✨ Successfully migrated Bakya-il settings to ${mainId}!`);
}

migrateSettings().catch(console.error);
