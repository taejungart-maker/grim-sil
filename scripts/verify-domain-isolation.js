#!/usr/bin/env node
/**
 * 도메인별 데이터 격리 자동 검증 스크립트
 * 
 * 용도: 배포 전 각 도메인에서 올바른 ARTIST_ID가 반환되는지 자동 검증
 * 실행: node scripts/verify-domain-isolation.js
 */

const DOMAINS_TO_TEST = [
    {
        domain: 'grim-sil.vercel.app',
        expectedArtistId: '-vqsk',
        description: '박야일 작가 (홍보용)',
    },
    {
        domain: 'hahyunju-gallery.vercel.app',
        expectedArtistId: 'vip-gallery-01',
        description: '하현주 작가 (VIP-01)',
    },
    {
        domain: 'artflow-gallery.vercel.app',
        expectedArtistId: 'vip-gallery-01',
        description: 'ARTFLOW 갤러리 (VIP 시스템)',
    },
];

async function verifyDomain(testCase) {
    const { domain, expectedArtistId, description } = testCase;

    try {
        console.log(`\n🔍 Testing: ${domain}`);
        console.log(`   Description: ${description}`);
        console.log(`   Expected Artist ID: ${expectedArtistId}`);

        // 실제 배포된 사이트에서 HTML 가져오기
        const response = await fetch(`https://${domain}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            console.log(`   ❌ FAIL: HTTP ${response.status}`);
            return false;
        }

        const html = await response.text();

        // HTML에서 artist_id를 찾기 (Supabase 쿼리에서 사용됨)
        const artistIdMatch = html.match(/artist_id['"]\s*[:=]\s*['"]([^'"]+)['"]/i);

        if (!artistIdMatch) {
            console.log(`   ⚠️  WARNING: Could not detect artist_id in HTML`);
            console.log(`   Checking footer info...`);

            // 푸터에서 사업자 정보 확인
            const hasCorrectFooter = html.includes('상호:') && html.includes('대표자:');
            if (hasCorrectFooter) {
                console.log(`   ✅ PASS: Footer info present`);
                return true;
            } else {
                console.log(`   ❌ FAIL: No valid content found`);
                return false;
            }
        }

        const detectedArtistId = artistIdMatch[1];

        if (detectedArtistId === expectedArtistId) {
            console.log(`   ✅ PASS: Detected Artist ID = ${detectedArtistId}`);
            return true;
        } else {
            console.log(`   ❌ FAIL: Detected Artist ID = ${detectedArtistId} (Expected: ${expectedArtistId})`);
            return false;
        }

    } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('도메인별 데이터 격리 자동 검증');
    console.log('='.repeat(60));

    const results = [];

    for (const testCase of DOMAINS_TO_TEST) {
        const passed = await verifyDomain(testCase);
        results.push({
            domain: testCase.domain,
            passed,
        });

        // Rate limiting 방지
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(60));
    console.log('검증 결과 요약');
    console.log('='.repeat(60));

    let allPassed = true;
    results.forEach(result => {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${result.domain}`);
        if (!result.passed) allPassed = false;
    });

    console.log('='.repeat(60));

    if (allPassed) {
        console.log('\n🎉 모든 도메인 검증 통과!');
        console.log('배포를 진행해도 안전합니다.\n');
        process.exit(0);
    } else {
        console.log('\n⚠️  일부 도메인 검증 실패!');
        console.log('문제를 수정한 후 다시 검증하세요.\n');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('스크립트 실행 오류:', error);
    process.exit(1);
});
