// Vercel API 통합 유틸리티
import https from 'https';

interface VercelAPIConfig {
    token: string;
    teamId?: string;
}

interface CreateProjectParams {
    name: string;
    framework: string;
    gitRepository?: {
        type: string;
        repo: string;
    };
}

interface EnvironmentVariable {
    key: string;
    value: string;
    target: ('production' | 'preview' | 'development')[];
    type?: 'plain' | 'secret' | 'encrypted';
}

interface DeploymentResponse {
    id: string;
    url: string;
    readyState: string;
}

export class VercelAPI {
    private token: string;
    private teamId?: string;
    private baseUrl = 'api.vercel.com';

    constructor(config: VercelAPIConfig) {
        this.token = config.token;
        this.teamId = config.teamId;
    }

    private async request<T>(
        method: string,
        path: string,
        data?: any
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.baseUrl,
                path: this.teamId ? `${path}?teamId=${this.teamId}` : path,
                method,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            };

            const req = https.request(options, (res) => {
                let body = '';

                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(body);
                        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(response);
                        } else {
                            reject(new Error(`API Error: ${response.error?.message || body}`));
                        }
                    } catch (error) {
                        reject(new Error(`Failed to parse response: ${body}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    // 프로젝트 생성
    async createProject(params: CreateProjectParams): Promise<any> {
        console.log(`📦 Creating Vercel project: ${params.name}...`);

        const response = await this.request('POST', '/v9/projects', {
            name: params.name,
            framework: params.framework,
            gitRepository: params.gitRepository,
        });

        console.log(`✅ Project created: ${params.name}`);
        return response;
    }

    // 환경 변수 설정
    async setEnvironmentVariables(
        projectId: string,
        variables: EnvironmentVariable[]
    ): Promise<void> {
        console.log(`🔧 Setting environment variables for project ${projectId}...`);

        for (const variable of variables) {
            try {
                await this.request('POST', `/v10/projects/${projectId}/env`, {
                    key: variable.key,
                    value: variable.value,
                    target: variable.target,
                    type: variable.type || 'plain',
                });
                console.log(`  ✓ Set ${variable.key}`);
            } catch (error) {
                console.error(`  ✗ Failed to set ${variable.key}:`, error);
                throw error;
            }
        }

        console.log(`✅ Environment variables configured`);
    }

    // 프로젝트 정보 조회
    async getProject(projectId: string): Promise<any> {
        return await this.request('GET', `/v9/projects/${projectId}`);
    }

    // 배포 트리거 (Git 기반 지원)
    async triggerDeployment(projectId: string): Promise<DeploymentResponse> {
        console.log(`🚀 Checking project details for ${projectId}...`);

        const project = await this.getProject(projectId);
        const deployData: any = {
            name: project.name,
            target: 'production',
        };

        // Git 연결이 되어 있으면 Git 소스 사용
        if (project.link) {
            deployData.gitSource = {
                type: project.link.type,
                repoId: project.link.repoId,
                ref: 'main', // 기본값 main
            };
            console.log(`🔗 Found Git link: ${project.link.repo} (${project.link.type})`);
        } else {
            console.log(`⚠️ No Git link found for ${projectId}. Manual deployment might be needed.`);
            // Git 링크가 없으면 어쩔 수 없이 빈 파일이라도 보내야 하지만,
            // 이 프로젝트들은 Git 기반이므로 link가 있어야 함.
        }

        console.log(`🚀 Triggering deployment for project ${project.name}...`);

        const response = await this.request<DeploymentResponse>(
            'POST',
            `/v13/deployments`,
            deployData
        );

        console.log(`✅ Deployment triggered: ${response.url}`);
        return response;
    }

    // 배포 상태 확인
    async getDeploymentStatus(deploymentId: string): Promise<DeploymentResponse> {
        return await this.request<DeploymentResponse>(
            'GET',
            `/v13/deployments/${deploymentId}`
        );
    }

    // 배포 완료 대기
    async waitForDeployment(
        deploymentId: string,
        maxWaitTime = 300000 // 5분
    ): Promise<DeploymentResponse> {
        console.log(`⏳ Waiting for deployment to complete...`);

        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitTime) {
            const status = await this.getDeploymentStatus(deploymentId);

            if (status.readyState === 'READY') {
                console.log(`✅ Deployment ready: https://${status.url}`);
                return status;
            } else if (status.readyState === 'ERROR') {
                throw new Error('Deployment failed');
            }

            // 5초 대기
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        throw new Error('Deployment timeout');
    }

    // 프로젝트 삭제
    async deleteProject(projectId: string): Promise<void> {
        console.log(`🗑️  Deleting project ${projectId}...`);

        await this.request('DELETE', `/v9/projects/${projectId}`);

        console.log(`✅ Project deleted`);
    }

    // 프로젝트 목록 조회
    async listProjects(): Promise<any[]> {
        const response = await this.request<{ projects: any[] }>(
            'GET',
            '/v9/projects'
        );
        return response.projects;
    }
}
