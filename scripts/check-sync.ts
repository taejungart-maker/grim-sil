import { VercelAPI } from './vercel-api';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CONFIG_FILE = path.join(__dirname, '../config/artist-config.json');
const ENV_FILE = path.join(__dirname, '../.env.local');

async function checkSync() {
    console.log('🔍 Checking global sync status...');

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

    console.log('--------------------------------------------------');
    console.log(`${'Project'.padEnd(20)} | ${'Status'.padEnd(12)} | ${'Last Deploy Time'}`);
    console.log('--------------------------------------------------');

    for (const project of projects) {
        try {
            // Get project link info
            const projectDetails = await vercel.getProject(project.id);
            const link = projectDetails.link;
            const branch = link ? link.productionBranch : 'N/A';
            const repo = link ? link.repo : 'N/A';

            // Get latest deployments
            const response: any = await (vercel as any).request('GET', `/v6/deployments?projectId=${project.id}&limit=1`);
            const latest = response.deployments[0];

            if (latest) {
                const date = new Date(latest.created).toLocaleString();
                console.log(`${project.name.padEnd(20)} | ${latest.state.padEnd(12)} | ${date} | ${repo}:${branch}`);
            } else {
                console.log(`${project.name.padEnd(20)} | No DeploymentsFound`);
            }
        } catch (error: any) {
            console.error(`❌ Error checking ${project.name}:`, error.message);
        }
    }
}

checkSync().catch(console.error);
