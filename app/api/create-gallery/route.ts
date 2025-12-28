// 구독 완료 시 갤러리 자동 생성 API
import { NextRequest, NextResponse } from "next/server";

// Vercel API 설정
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const GITHUB_REPO = "taejungart-maker/grim-sil";

interface CreateGalleryRequest {
    artistName: string;         // 작가 이름 (예: "김화문")
    artistId: string;           // 고유 ID (UUID)
    email?: string;             // 이메일 (선택)
}

interface CreateGalleryResponse {
    success: boolean;
    galleryUrl?: string;
    projectName?: string;
    message: string;
}

// 프로젝트 이름 생성 (영문 변환)
function generateProjectName(artistName: string, artistId: string): string {
    // 간단히 artist ID 기반으로 생성
    const shortId = artistId.replace(/-/g, '').substring(0, 8);
    return `gallery-${shortId}`;
}

// Vercel API 호출 함수
async function vercelRequest(method: string, path: string, data?: any) {
    const baseUrl = "https://api.vercel.com";
    const separator = path.includes("?") ? "&" : "?";
    const url = VERCEL_TEAM_ID
        ? `${baseUrl}${path}${separator}teamId=${VERCEL_TEAM_ID}`
        : `${baseUrl}${path}`;

    const response = await fetch(url, {
        method,
        headers: {
            "Authorization": `Bearer ${VERCEL_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Vercel API Error: ${error}`);
    }

    return response.json();
}

// 1. Vercel 프로젝트 생성
async function createVercelProject(projectName: string) {
    console.log(`📦 Creating Vercel project: ${projectName}...`);

    const project = await vercelRequest("POST", "/v9/projects", {
        name: projectName,
        framework: "nextjs",
        gitRepository: {
            type: "github",
            repo: GITHUB_REPO,
        },
    });

    console.log(`✅ Project created: ${projectName}`);
    return project;
}

// 2. 환경 변수 설정
async function setEnvironmentVariables(projectId: string, artistId: string, artistName: string) {
    console.log(`🔧 Setting environment variables...`);

    const variables = [
        { key: "NEXT_PUBLIC_ARTIST_ID", value: artistId },
        { key: "NEXT_PUBLIC_ARTIST_NAME", value: artistName },
        { key: "NEXT_PUBLIC_SUPABASE_URL", value: process.env.NEXT_PUBLIC_SUPABASE_URL || "" },
        { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "" },
        { key: "NEXT_PUBLIC_DEPLOYMENT_MODE", value: "commercial" },
    ];

    for (const variable of variables) {
        await vercelRequest("POST", `/v10/projects/${projectId}/env`, {
            key: variable.key,
            value: variable.value,
            target: ["production", "preview", "development"],
            type: "plain",
        });
        console.log(`  ✓ Set ${variable.key}`);
    }

    console.log(`✅ Environment variables configured`);
}

// 3. 배포 트리거
async function triggerDeployment(projectId: string, projectName: string) {
    console.log(`🚀 Triggering deployment...`);

    const project = await vercelRequest("GET", `/v9/projects/${projectId}`);

    const deployData: any = {
        name: projectName,
        target: "production",
    };

    if (project.link) {
        deployData.gitSource = {
            type: project.link.type,
            repoId: project.link.repoId,
            ref: "main",
        };
    }

    const deployment = await vercelRequest("POST", "/v13/deployments", deployData);
    console.log(`✅ Deployment triggered: ${deployment.url}`);

    return deployment;
}

// 4. Supabase에 gallery_url 저장
async function saveGalleryUrl(artistId: string, galleryUrl: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn("⚠️ Supabase credentials not found");
        return;
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/settings?artist_id=eq.${artistId}`, {
        method: "PATCH",
        headers: {
            "apikey": supabaseKey,
            "Authorization": `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        body: JSON.stringify({ gallery_url: galleryUrl }),
    });

    if (!response.ok) {
        console.error("Failed to save gallery_url:", await response.text());
    } else {
        console.log(`✅ Saved gallery_url for ${artistId}`);
    }
}

// API 핸들러
export async function POST(request: NextRequest) {
    try {
        // 토큰 검증
        if (!VERCEL_TOKEN) {
            return NextResponse.json<CreateGalleryResponse>({
                success: false,
                message: "VERCEL_TOKEN not configured",
            }, { status: 500 });
        }

        // 요청 데이터 파싱
        const body: CreateGalleryRequest = await request.json();

        if (!body.artistName || !body.artistId) {
            return NextResponse.json<CreateGalleryResponse>({
                success: false,
                message: "artistName and artistId are required",
            }, { status: 400 });
        }

        console.log(`\n🎨 Creating gallery for: ${body.artistName}`);
        console.log(`   Artist ID: ${body.artistId}`);

        // 1. 프로젝트 이름 생성
        const projectName = generateProjectName(body.artistName, body.artistId);
        console.log(`   Project Name: ${projectName}`);

        // 2. Vercel 프로젝트 생성
        const project = await createVercelProject(projectName);

        // 3. 환경 변수 설정
        await setEnvironmentVariables(project.id, body.artistId, body.artistName);

        // 4. 배포 트리거
        const deployment = await triggerDeployment(project.id, projectName);

        // 5. 갤러리 URL 결정
        const galleryUrl = `https://${projectName}.vercel.app`;

        // 6. Supabase에 URL 저장
        await saveGalleryUrl(body.artistId, galleryUrl);

        console.log(`\n🎉 Gallery created successfully!`);
        console.log(`   URL: ${galleryUrl}\n`);

        return NextResponse.json<CreateGalleryResponse>({
            success: true,
            galleryUrl,
            projectName,
            message: `갤러리가 성공적으로 생성되었습니다! ${galleryUrl}`,
        });

    } catch (error) {
        console.error("❌ Error creating gallery:", error);

        return NextResponse.json<CreateGalleryResponse>({
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}

// 상태 확인용 GET 핸들러
export async function GET() {
    return NextResponse.json({
        status: "ready",
        message: "Gallery Auto-Creation API is ready",
        vercelConfigured: !!VERCEL_TOKEN,
    });
}
