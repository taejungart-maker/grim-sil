import { VercelAPI } from './vercel-api';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CONFIG_FILE = path.join(__dirname, '../config/artist-config.json');
const ENV_FILE = path.join(__dirname, '../.env.local');

async function forceHookTrigger() {
    console.log('🔧 Force-triggering Vercel deployments via Hook API...');

    let vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken && fs.existsSync(ENV_FILE)) {
        const envContent = fs.readFileSync(ENV_FILE, 'utf-8').replace(/^\uFEFF/, '');
        const lines = envContent.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.includes('VERCEL_TOKEN')) {
                const parts = trimmedLine.split('=');
                if (parts.length >= 2) {
                    vercelToken = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
                    break;
                }
            }
        }
    }

    if (!vercelToken) {
        console.error('❌ VERCEL_TOKEN not found');
        return;
    }

    const vercel = new VercelAPI({
        token: vercelToken,
        teamId: 'team_4ztRVDdkXblDU2Qj8WpBSvk5'
    });

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    const projects = [
        { name: 'Main (grim-sil)', id: 'prj_j11HisNeWNqtLxlnAUv7SAoVZkNg' },
        ...config.artists.map((a: any) => ({ name: a.name, id: a.vercelProject }))
    ];

    for (const project of projects) {
        try {
            console.log(`\n⏳ Creating deploy hook for ${project.name}...`);

            // Create a deploy hook
            const hook: any = await (vercel as any).request('POST', `/v1/projects/${project.id}/deploy-hooks`, {
                name: `auto-sync-${Date.now()}`,
                ref: 'main'
            });

            console.log(`✅ Hook created: ${hook.url}`);
            console.log(`🚀 Triggering deployment...`);

            // Trigger the hook
            const https = require('https');
            const url = new URL(hook.url);

            await new Promise((resolve, reject) => {
                const req = https.request({
                    hostname: url.hostname,
                    path: url.pathname + url.search,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }, (res: any) => {
                    let body = '';
                    res.on('data', (chunk: any) => body += chunk);
                    res.on('end', () => {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            console.log(`✅ Deployment triggered for ${project.name}`);
                            resolve(body);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                        }
                    });
                });
                req.on('error', reject);
                req.end();
            });

            // Clean up the hook
            await (vercel as any).request('DELETE', `/v1/projects/${project.id}/deploy-hooks/${hook.id}`);
            console.log(`🗑️  Cleaned up temporary hook`);

        } catch (error: any) {
            console.error(`❌ Failed for ${project.name}:`, error.message);
        }
    }

    console.log('\n✨ Force hook trigger sequence complete.');
}

forceHookTrigger().catch(console.error);
