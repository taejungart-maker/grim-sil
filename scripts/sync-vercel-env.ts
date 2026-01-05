import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ENV_FILE = path.join(process.cwd(), '.env.local');

async function syncEnv() {
    console.log('🔄 Syncing .env.local to Vercel...');

    if (!fs.existsSync(ENV_FILE)) {
        console.error('❌ .env.local not found');
        return;
    }

    const envContent = fs.readFileSync(ENV_FILE, 'utf-8').replace(/^\uFEFF/, '');
    const lines = envContent.split('\n');

    const varsMap: Record<string, string> = {};

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const parts = trimmedLine.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
                varsMap[key] = value;
            }
        }
    }

    const keysToSync = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'NEXT_PUBLIC_ARTIST_ID',
        'ADMIN_PASSWORD'
    ];

    for (const key of keysToSync) {
        if (varsMap[key]) {
            console.log(`📡 Adding ${key}...`);
            try {
                // Use Vercel CLI to add environment variables
                // echo "value" | vercel env add KEY production
                execSync(`echo "${varsMap[key]}" | vercel env add ${key} production`, { stdio: 'inherit' });
                execSync(`echo "${varsMap[key]}" | vercel env add ${key} preview`, { stdio: 'inherit' });
                execSync(`echo "${varsMap[key]}" | vercel env add ${key} development`, { stdio: 'inherit' });
            } catch (error) {
                console.warn(`⚠️  Failed to add ${key} (might already exist):`, error.message);
            }
        } else {
            console.warn(`⚠️  ${key} not found in .env.local`);
        }
    }

    console.log('🚀 Triggering final redeploy...');
    execSync('vercel deploy --prod --yes', { stdio: 'inherit' });
    console.log('✨ Environment sync and redeploy complete.');
}

syncEnv().catch(console.error);
