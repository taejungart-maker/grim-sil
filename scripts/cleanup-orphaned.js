/**
 * 고아 작품 정리 스크립트
 * - artist_id가 존재하지 않는 artists 테이블의 작품 삭제
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupOrphanedArtworks() {
    console.log('🧹 고아 작품 정리 시작');
    console.log('-'.repeat(80));

    try {
        // 1. 모든 아티스트 ID 가져오기
        const { data: artists, error: artistsError } = await supabase
            .from('artists')
            .select('id');

        if (artistsError) {
            console.error('❌ 아티스트 조회 실패:', artistsError.message);
            return;
        }

        const validArtistIds = new Set(artists.map(a => a.id));
        console.log(`✓ 유효한 아티스트 ID: ${validArtistIds.size}개\n`);

        // 2. 모든 작품 가져오기
        const { data: artworks, error: artworksError } = await supabase
            .from('artworks')
            .select('*');

        if (artworksError) {
            console.error('❌ 작품 조회 실패:', artworksError.message);
            return;
        }

        console.log(`총 작품 수: ${artworks.length}개\n`);

        // 3. 고아 작품 찾기
        const orphanedArtworks = artworks.filter(artwork =>
            !validArtistIds.has(artwork.artist_id)
        );

        if (orphanedArtworks.length === 0) {
            console.log('✅ 고아 작품이 없습니다!');
            return;
        }

        console.log(`⚠️  고아 작품 발견: ${orphanedArtworks.length}개\n`);

        orphanedArtworks.forEach((artwork, idx) => {
            console.log(`${idx + 1}. ${artwork.title}`);
            console.log(`   ID: ${artwork.id}`);
            console.log(`   artist_id: ${artwork.artist_id}`);
            console.log('');
        });

        // 4. 삭제 실행
        let deletedCount = 0;
        for (const artwork of orphanedArtworks) {
            const { error: deleteError } = await supabase
                .from('artworks')
                .delete()
                .eq('id', artwork.id);

            if (deleteError) {
                console.error(`❌ 삭제 실패 [${artwork.title}]:`, deleteError.message);
            } else {
                console.log(`✓ 삭제 완료: ${artwork.title}`);
                deletedCount++;
            }
        }

        console.log('');
        console.log('='.repeat(80));
        console.log(`✅ 정리 완료: ${deletedCount}개 작품 삭제`);
        console.log('='.repeat(80));

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    }
}

cleanupOrphanedArtworks();
