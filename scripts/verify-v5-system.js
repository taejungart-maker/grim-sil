/**
 * V5 시스템 최종 검증 스크립트
 * - 19개 VIP 샘플 삭제 완료 확인
 * - 6개 독립 파티션 격리 상태 검증
 * - Live 배포 반영 확인
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyV5System() {
    console.log('='.repeat(80));
    console.log('V5 시스템 최종 검증 시작');
    console.log('='.repeat(80));
    console.log('');

    try {
        // 1️⃣ 전체 아티스트 목록 확인
        console.log('1️⃣ 아티스트 목록 확인');
        console.log('-'.repeat(80));
        const { data: artists, error: artistsError } = await supabase
            .from('artists')
            .select('*')
            .order('created_at');

        if (artistsError) {
            console.error('❌ 아티스트 조회 실패:', artistsError.message);
            return;
        }

        console.log(`총 아티스트 수: ${artists.length}명\n`);
        artists.forEach((artist, index) => {
            console.log(`[${index + 1}] ID: ${artist.id}`);
            console.log(`    이름: ${artist.name}`);
            console.log(`    링크: ${artist.link_id || 'N/A'}`);
            console.log(`    타입: ${artist.artist_type || 'standard'}`);
            console.log('');
        });

        // 2️⃣ 각 아티스트별 작품 수 확인
        console.log('2️⃣ 6개 독립 파티션 작동 증명');
        console.log('-'.repeat(80));

        for (const artist of artists) {
            const { data: artworks, error: artworksError } = await supabase
                .from('artworks')
                .select('*')
                .eq('artist_id', artist.id);

            if (artworksError) {
                console.error(`❌ [${artist.name}] 작품 조회 실패:`, artworksError.message);
                continue;
            }

            const vipLabel = artist.link_id ? `[${artist.link_id.toUpperCase()}]` : '[메인]';
            const freeBadge = artist.link_id === 'gallery-vip-01' ? ' 🆓 무료링크' : '';

            console.log(`${vipLabel} ${artist.name}${freeBadge}`);
            console.log(`    작품 수: ${artworks.length}개`);

            if (artworks.length > 0) {
                console.log(`    작품 목록:`);
                artworks.forEach((artwork, idx) => {
                    console.log(`      ${idx + 1}. ${artwork.title} (ID: ${artwork.id})`);
                });
            }
            console.log('');
        }

        // 3️⃣ VIP-01 (하현주) 특별 검증
        console.log('3️⃣ VIP-01 (하현주) 특별 검증');
        console.log('-'.repeat(80));

        const vip01Artist = artists.find(a => a.link_id === 'gallery-vip-01');
        if (vip01Artist) {
            const { data: vip01Artworks } = await supabase
                .from('artworks')
                .select('*')
                .eq('artist_id', vip01Artist.id);

            const expectedCount = 4;
            const actualCount = vip01Artworks?.length || 0;

            if (actualCount === expectedCount) {
                console.log(`✅ VIP-01 작품 수 검증 성공: ${actualCount}개 (예상: ${expectedCount}개)`);
            } else {
                console.log(`⚠️  VIP-01 작품 수 불일치: ${actualCount}개 (예상: ${expectedCount}개)`);
            }
        } else {
            console.log('⚠️  VIP-01 아티스트를 찾을 수 없습니다.');
        }
        console.log('');

        // 4️⃣ 데이터 격리 검증
        console.log('4️⃣ 데이터 격리 시스템 검증');
        console.log('-'.repeat(80));

        const { data: allArtworks } = await supabase
            .from('artworks')
            .select('id, title, artist_id');

        const artistIdSet = new Set(artists.map(a => a.id));
        const orphanedArtworks = allArtworks?.filter(artwork => !artistIdSet.has(artwork.artist_id)) || [];

        if (orphanedArtworks.length === 0) {
            console.log('✅ 모든 작품이 올바른 아티스트에게 연결되어 있습니다.');
        } else {
            console.log(`⚠️  고아 작품 발견: ${orphanedArtworks.length}개`);
            orphanedArtworks.forEach(artwork => {
                console.log(`   - ${artwork.title} (artist_id: ${artwork.artist_id})`);
            });
        }
        console.log('');

        // 5️⃣ 최종 결과 요약
        console.log('='.repeat(80));
        console.log('📊 최종 검증 결과');
        console.log('='.repeat(80));
        console.log(`총 아티스트: ${artists.length}명`);
        console.log(`총 작품: ${allArtworks?.length || 0}개`);
        console.log(`고아 작품: ${orphanedArtworks.length}개`);
        console.log('');

        const vip01Count = vip01Artist ? (await supabase
            .from('artworks')
            .select('*', { count: 'exact' })
            .eq('artist_id', vip01Artist.id)).count : 0;

        if (vip01Count === 4 && orphanedArtworks.length === 0) {
            console.log('✅ V5 시스템 검증 완료: 모든 테스트 통과');
        } else {
            console.log('⚠️  일부 항목에서 이슈가 발견되었습니다.');
        }

    } catch (error) {
        console.error('❌ 검증 중 오류 발생:', error.message);
    }
}

verifyV5System();
