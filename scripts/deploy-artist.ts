// 아티스트 자동 배포 CLI 도구
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { VercelAPI } from './vercel-api';
import { setupArtist, listArtists, removeArtist, ArtistSetup } from './setup-artist-db';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CONFIG_FILE = path.join(__dirname, '../config/artist-config.json');

interface ArtistConfig {
    id: string;
    name: string;
    galleryName: string;
    vercelProject: string;
    deploymentUrl: string;
    supabaseProject: string;
    createdAt: string;
}

interface ConfigData {
    artists: ArtistConfig[];
}

// 설정 파일 읽기
function loadConfig(): ConfigData {
    if (!fs.existsSync(CONFIG_FILE)) {
        const dir = path.dirname(CONFIG_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const initialConfig: ConfigData = { artists: [] };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(initialConfig, null, 2));
        return initialConfig;
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

// 설정 파일 저장
function saveConfig(config: ConfigData) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// 사용자 입력 받기
function prompt(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// ID 생성 (영문 소문자 + 숫자)
function generateArtistId(name: string): string {
    const normalized = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    const timestamp = Date.now().toString(36).slice(-4);
    return `${normalized}-${timestamp}`;
}

// Vercel 프로젝트명 생성
function generateProjectName(galleryName: string): string {
    return galleryName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// 새 아티스트 배포
async function deployNewArtist() {
    console.log('\n🎨 === 새 아티스트 배포 ===\n');

    // 1. 아티스트 정보 입력
    const artistName = await prompt('작가 이름: ');
    if (!artistName) {
        console.error('❌ 작가 이름을 입력해주세요.');
        return;
    }

    const galleryName = await prompt('갤러리 이름: ');
    if (!galleryName) {
        console.error('❌ 갤러리 이름을 입력해주세요.');
        return;
    }

    const adminPassword = await prompt('관리자 비밀번호: ');
    if (!adminPassword) {
        console.error('❌ 관리자 비밀번호를 입력해주세요.');
        return;
    }

    // 영문 프로젝트명 입력 (Vercel용)
    console.log('\n💡 Vercel 프로젝트명은 영문 소문자만 가능합니다.');
    console.log('   예: hahyunju-gallery, moonhyekyung-art, hwangmikyung-gallery');
    const projectNameInput = await prompt('영문 프로젝트명: ');
    if (!projectNameInput) {
        console.error('❌ 프로젝트명을 입력해주세요.');
        return;
    }

    const artistId = generateArtistId(artistName);
    const projectName = projectNameInput
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    console.log(`\n📋 배포 정보:`);
    console.log(`   Artist ID: ${artistId}`);
    console.log(`   Project Name: ${projectName}`);
    console.log(`   Gallery: ${galleryName}`);
    console.log('');

    const confirm = await prompt('배포를 진행하시겠습니까? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
        console.log('❌ 배포가 취소되었습니다.');
        return;
    }

    try {
        // 2. Supabase 데이터베이스 설정
        console.log('\n📦 Step 1/3: Setting up database...');
        const artistSetup: ArtistSetup = {
            artistId,
            artistName,
            galleryName,
            adminPassword,
        };
        await setupArtist(artistSetup);

        // 3. Vercel 프로젝트 생성 및 배포
        console.log('\n🚀 Step 2/3: Creating Vercel project...');

        const vercelToken = process.env.VERCEL_TOKEN;
        if (!vercelToken) {
            throw new Error('VERCEL_TOKEN not found in .env.local');
        }

        const vercel = new VercelAPI({ token: vercelToken });

        // 프로젝트 생성
        const project = await vercel.createProject({
            name: projectName,
            framework: 'nextjs',
        });

        // 환경 변수 설정
        await vercel.setEnvironmentVariables(project.id, [
            {
                key: 'NEXT_PUBLIC_SUPABASE_URL',
                value: process.env.NEXT_PUBLIC_SUPABASE_URL!,
                target: ['production', 'preview', 'development'],
            },
            {
                key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
                value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                target: ['production', 'preview', 'development'],
            },
            {
                key: 'NEXT_PUBLIC_ARTIST_ID',
                value: artistId,
                target: ['production', 'preview', 'development'],
            },
            {
                key: 'ADMIN_PASSWORD',
                value: adminPassword,
                target: ['production', 'preview', 'development'],
            },
        ]);

        console.log('\n📝 Step 3/3: Saving configuration...');

        // 4. 설정 저장
        const config = loadConfig();
        config.artists.push({
            id: artistId,
            name: artistName,
            galleryName,
            vercelProject: project.id,
            deploymentUrl: `https://${projectName}.vercel.app`,
            supabaseProject: 'shared',
            createdAt: new Date().toISOString(),
        });
        saveConfig(config);

        console.log('\n✨ === 배포 완료! ===\n');
        console.log(`🎨 작가: ${artistName}`);
        console.log(`🏛️  갤러리: ${galleryName}`);
        console.log(`🌐 URL: https://${projectName}.vercel.app`);
        console.log(`🔑 관리자 비밀번호: ${adminPassword}`);
        console.log('');
        console.log('⚠️  다음 단계:');
        console.log('   1. Vercel 대시보드에서 Git 저장소 연결');
        console.log('   2. 첫 배포 트리거');
        console.log('   3. 작가에게 URL과 비밀번호 전달');
        console.log('');

    } catch (error) {
        console.error('\n❌ 배포 실패:', error);
        console.error('');
        console.error('문제 해결:');
        console.error('   1. .env.local 파일에 필요한 환경 변수가 모두 설정되어 있는지 확인');
        console.error('   2. VERCEL_TOKEN이 유효한지 확인');
        console.error('   3. Supabase 데이터베이스가 초기화되어 있는지 확인 (npm run db:init)');
    }
}

// 배포 목록 조회
async function listDeployments() {
    console.log('\n📋 === 배포된 아티스트 목록 ===\n');

    const config = loadConfig();

    if (config.artists.length === 0) {
        console.log('아직 배포된 아티스트가 없습니다.');
        console.log('');
        return;
    }

    config.artists.forEach((artist, index) => {
        console.log(`${index + 1}. ${artist.name}`);
        console.log(`   갤러리: ${artist.galleryName}`);
        console.log(`   URL: ${artist.deploymentUrl}`);
        console.log(`   생성일: ${new Date(artist.createdAt).toLocaleDateString()}`);
        console.log('');
    });

    // Supabase 데이터베이스 목록도 표시
    console.log('📊 데이터베이스 아티스트:');
    await listArtists();
}

// 배포 삭제
async function removeDeployment() {
    console.log('\n🗑️  === 배포 삭제 ===\n');

    const config = loadConfig();

    if (config.artists.length === 0) {
        console.log('삭제할 배포가 없습니다.');
        return;
    }

    // 목록 표시
    config.artists.forEach((artist, index) => {
        console.log(`${index + 1}. ${artist.name} (${artist.galleryName})`);
    });
    console.log('');

    const indexStr = await prompt('삭제할 번호를 입력하세요: ');
    const index = parseInt(indexStr) - 1;

    if (index < 0 || index >= config.artists.length) {
        console.error('❌ 잘못된 번호입니다.');
        return;
    }

    const artist = config.artists[index];
    const confirm = await prompt(`정말로 "${artist.name}"를 삭제하시겠습니까? (y/n): `);

    if (confirm.toLowerCase() !== 'y') {
        console.log('❌ 삭제가 취소되었습니다.');
        return;
    }

    try {
        // 1. Supabase 데이터 삭제
        console.log('\n📦 Removing database data...');
        await removeArtist(artist.id);

        // 2. Vercel 프로젝트 삭제 (선택사항)
        const deleteVercel = await prompt('Vercel 프로젝트도 삭제하시겠습니까? (y/n): ');
        if (deleteVercel.toLowerCase() === 'y') {
            const vercelToken = process.env.VERCEL_TOKEN;
            if (vercelToken) {
                console.log('\n🚀 Deleting Vercel project...');
                const vercel = new VercelAPI({ token: vercelToken });
                await vercel.deleteProject(artist.vercelProject);
            }
        }

        // 3. 설정에서 제거
        config.artists.splice(index, 1);
        saveConfig(config);

        console.log('\n✅ 삭제 완료!');

    } catch (error) {
        console.error('\n❌ 삭제 실패:', error);
    }
}

// 메인 함수
async function main() {
    const command = process.argv[2];

    switch (command) {
        case 'deploy':
            await deployNewArtist();
            break;
        case 'list':
            await listDeployments();
            break;
        case 'remove':
            await removeDeployment();
            break;
        default:
            console.log('\n🎨 Gallery Deployment CLI\n');
            console.log('사용법:');
            console.log('  npm run deploy:artist  - 새 아티스트 배포');
            console.log('  npm run deploy:list    - 배포 목록 조회');
            console.log('  npm run deploy:remove  - 배포 삭제');
            console.log('');
    }

    process.exit(0);
}

main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
