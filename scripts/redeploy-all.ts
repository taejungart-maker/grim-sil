import { VercelAPI } from './vercel-api';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CONFIG_FILE = path.join(__dirname, '../config/artist-config.json');
const ENV_FILE = path.join(__dirname, '../.env.local');

async function redeployAll() {
    console.log('🚀 Starting Nuclear Redeploy for all artists...');

    let vercelToken = process.env.VERCEL_TOKEN;

    // Manually parse .env.local if not in process.env (Handling potential BOM)
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
        teamId: 'team_4ztRVDdkXblDU2Qj8WpBSvk5' // Updated to the correct Team ID from metadata
    });

    if (!fs.existsSync(CONFIG_FILE)) {
        console.error('❌ Config file not found');
        return;
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

    // Add the main project to the list as well
    const projectsToRedeploy = [
        { name: 'Main (grim-sil)', id: 'prj_j11HisNeWNqtLxlnAUv7SAoVZkNg' },
        ...config.artists.map((a: any) => ({ name: a.name, id: a.vercelProject }))
    ];

    for (const project of projectsToRedeploy) {
        try {
            console.log(`\n⏳ Redeploying ${project.name} (${project.id})...`);
            // Triggering a deployment via Vercel API with production target
            const deployment = await vercel.triggerDeployment(project.id);
            console.log(`✅ Success! Deployment ID: ${deployment.id}`);
            console.log(`🔗 URL: ${deployment.url}`);
        } catch (error: any) {
            console.error(`❌ Failed to redeploy ${project.name}:`, error.message);
        }
    }

    console.log('\n✨ Nuclear Redeploy sequence complete.');
}

redeployAll().catch(console.error);
