// 갤러리별 deployment mode 환경 변수 설정 스크립트
import { config } from 'dotenv';
import path from 'path';
import { VercelAPI } from './vercel-api';

config({ path: path.resolve(process.cwd(), '.env.local') });

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;

if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN not found in .env.local');
    process.exit(1);
}

// 작가별 갤러리 프로젝트 이름 (always_free)
const FREE_ARTIST_PROJECTS = [
    'hahyunju-gallery',
    'moonhyekyung-gallery',
    'hwangmikyung-gallery'
];

// 판매용 VIP 갤러리 프로젝트 이름 (commercial)
const VIP_COMMERCIAL_PROJECTS = [
    'grim-sil-vip-01',
    'grim-sil-vip-02',
    'grim-sil-vip-03',
    'grim-sil-vip-04',
    'grim-sil-vip-05'
];

async function updateDeploymentMode(apiClient: VercelAPI, projectName: string, mode: 'always_free' | 'commercial') {
    try {
        console.log(`\n🔧 Updating ${projectName} to ${mode} mode...`);

        // 프로젝트 목록에서 찾기
        const projects = await apiClient.listProjects();
        const project = projects.find((p: any) => p.name === projectName);

        if (!project) {
            console.log(`⚠️  Project ${projectName} not found, skipping...`);
            return;
        }

        console.log(`✓ Found project: ${project.name} (${project.id})`);

        // 환경 변수 설정
        await apiClient.setEnvironmentVariables(project.id, [
            {
                key: 'NEXT_PUBLIC_DEPLOYMENT_MODE',
                value: mode,
                target: ['production', 'preview', 'development']
            }
        ]);

        console.log(`✅ Updated ${projectName} to ${mode} mode`);

        // 재배포 트리거
        console.log(`🚀 Triggering redeploy for ${projectName}...`);
        const deployment = await apiClient.triggerDeployment(project.id);
        console.log(`✅ Deployment triggered: ${deployment.url}`);

    } catch (error: any) {
        console.error(`❌ Error updating ${projectName}:`, error.message);
    }
}

async function main() {
    console.log('🎨 Starting deployment mode configuration...\n');

    const apiClient = new VercelAPI({
        token: VERCEL_TOKEN!,
        teamId: VERCEL_TEAM_ID
    });

    // 작가 갤러리를 always_free로 설정
    console.log('\n📌 Setting artist galleries to ALWAYS_FREE mode:');
    for (const projectName of FREE_ARTIST_PROJECTS) {
        await updateDeploymentMode(apiClient, projectName, 'always_free');
    }

    // VIP 갤러리를 commercial로 설정
    console.log('\n📌 Setting VIP galleries to COMMERCIAL mode:');
    for (const projectName of VIP_COMMERCIAL_PROJECTS) {
        await updateDeploymentMode(apiClient, projectName, 'commercial');
    }

    console.log('\n✨ Deployment mode configuration completed!');
    console.log('\n📋 Summary:');
    console.log(`   - ${FREE_ARTIST_PROJECTS.length} artist galleries → always_free (NO subscription button)`);
    console.log(`   - ${VIP_COMMERCIAL_PROJECTS.length} VIP galleries → commercial (WITH subscription button)`);
}

main().catch(console.error);
