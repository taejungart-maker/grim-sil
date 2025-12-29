
import { VercelAPI } from './vercel-api';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import https from 'https';

dotenv.config({ path: '.env.local' });

const CONFIG_FILE = path.join(__dirname, '../config/artist-config.json');

async function checkDeployments() {
    console.log('\n🔍 === 실시간 배포 상태 확인 ===\n');

    const token = process.env.VERCEL_TOKEN;
    if (!token) {
        console.error('❌ VERCEL_TOKEN이 .env.local에 설정되어 있지 않습니다.');
        return;
    }

    if (!fs.existsSync(CONFIG_FILE)) {
        console.error('❌ 설정 파일을 찾을 수 없습니다.');
        return;
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    const vercel = new VercelAPI({ token });

    for (const artist of config.artists) {
        console.log(`👤 작가: ${artist.name}`);
        try {
            // 프로젝트의 최신 배포 목록 가져오기
            const response = await vercelRequest(token, `/v6/deployments?projectId=${artist.vercelProject}&limit=1`);
            const latest = response.deployments[0];

            if (latest) {
                console.log(`   상태: ${latest.readyState === 'READY' ? '✅ 배포 완료' : '⏳ 진행 중 (' + latest.readyState + ')'}`);
                console.log(`   URL: https://${latest.url}`);
                console.log(`   업데이트 시각: ${new Date(latest.createdAt).toLocaleString()}`);
            } else {
                console.log(`   ❌ 배포 기록 없음`);
            }
        } catch (error: any) {
            console.error(`   ❌ 상태 확인 실패: ${error.message}`);
        }
        console.log('');
    }
}

async function vercelRequest(token: string, path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.vercel.com',
            path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

checkDeployments().catch(console.error);
