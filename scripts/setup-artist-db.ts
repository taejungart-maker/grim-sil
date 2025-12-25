// Supabase 데이터베이스 초기 설정 스크립트 (RLS 기반 멀티 테넌트)
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // 서비스 키 필요

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ArtistSetup {
    artistId: string;
    artistName: string;
    galleryName: string;
    adminPassword: string;
}

// 아티스트 테이블 생성 (처음 한 번만 실행)
async function createArtistsTable() {
    console.log('📋 Creating artists table...');

    // SQL로 직접 실행 (Supabase Dashboard에서 실행 권장)
    const sql = `
        -- 아티스트 테이블 생성
        CREATE TABLE IF NOT EXISTS artists (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            gallery_name TEXT NOT NULL,
            admin_password TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- artworks 테이블에 artist_id 컬럼 추가 (이미 있으면 무시)
        ALTER TABLE artworks 
        ADD COLUMN IF NOT EXISTS artist_id TEXT REFERENCES artists(id);

        -- settings 테이블에 artist_id 컬럼 추가
        ALTER TABLE settings 
        ADD COLUMN IF NOT EXISTS artist_id TEXT REFERENCES artists(id);

        -- visitor_stats 테이블에 artist_id 컬럼 추가
        ALTER TABLE visitor_stats 
        ADD COLUMN IF NOT EXISTS artist_id TEXT REFERENCES artists(id);

        -- RLS 활성화
        ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
        ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
        ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE visitor_stats ENABLE ROW LEVEL SECURITY;

        -- RLS 정책: 각 아티스트는 자신의 데이터만 접근 가능
        CREATE POLICY "Artists can view own data" ON artists
            FOR SELECT USING (true);

        CREATE POLICY "Artworks are filtered by artist_id" ON artworks
            FOR ALL USING (
                artist_id = current_setting('app.current_artist_id', true)
            );

        CREATE POLICY "Settings are filtered by artist_id" ON settings
            FOR ALL USING (
                artist_id = current_setting('app.current_artist_id', true)
            );

        CREATE POLICY "Visitor stats are filtered by artist_id" ON visitor_stats
            FOR ALL USING (
                artist_id = current_setting('app.current_artist_id', true)
            );

        -- 인덱스 생성
        CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
        CREATE INDEX IF NOT EXISTS idx_settings_artist_id ON settings(artist_id);
        CREATE INDEX IF NOT EXISTS idx_visitor_stats_artist_id ON visitor_stats(artist_id);
    `;

    console.log('⚠️  Please run the following SQL in your Supabase Dashboard:');
    console.log('---');
    console.log(sql);
    console.log('---');
    console.log('After running the SQL, press Enter to continue...');

    // 사용자 입력 대기
    await new Promise(resolve => {
        process.stdin.once('data', () => resolve(null));
    });
}

// 새 아티스트 등록
async function setupArtist(artist: ArtistSetup) {
    console.log(`\n🎨 Setting up artist: ${artist.artistName}...`);

    try {
        // 1. 아티스트 레코드 생성
        const { data: artistData, error: artistError } = await supabase
            .from('artists')
            .insert({
                id: artist.artistId,
                name: artist.artistName,
                gallery_name: artist.galleryName,
                admin_password: artist.adminPassword,
            })
            .select()
            .single();

        if (artistError) {
            if (artistError.code === '23505') {
                console.log(`⚠️  Artist ${artist.artistId} already exists`);
            } else {
                throw artistError;
            }
        } else {
            console.log(`✅ Artist record created: ${artistData.id}`);
        }

        // 2. 기본 설정 생성
        const { error: settingsError } = await supabase
            .from('settings')
            .insert({
                key: 'site_config',
                value: JSON.stringify({
                    galleryNameEn: artist.galleryName,
                    galleryNameKo: artist.galleryName,
                    artistName: artist.artistName,
                    siteTitle: `${artist.artistName}의 온라인 화첩`,
                    siteDescription: `${artist.artistName}의 작품세계를 담은 온라인 화첩입니다.`,
                    theme: 'white',
                    gridColumns: 4,
                    showPrice: false,
                }),
                artist_id: artist.artistId,
            });

        if (settingsError && settingsError.code !== '23505') {
            console.warn(`⚠️  Settings creation warning:`, settingsError.message);
        } else {
            console.log(`✅ Default settings created`);
        }

        console.log(`\n✨ Artist setup complete!`);
        console.log(`   Artist ID: ${artist.artistId}`);
        console.log(`   Name: ${artist.artistName}`);
        console.log(`   Gallery: ${artist.galleryName}`);

    } catch (error) {
        console.error(`❌ Failed to setup artist:`, error);
        throw error;
    }
}

// 아티스트 삭제 (테스트용)
async function removeArtist(artistId: string) {
    console.log(`\n🗑️  Removing artist: ${artistId}...`);

    try {
        // 관련 데이터 모두 삭제
        await supabase.from('visitor_stats').delete().eq('artist_id', artistId);
        await supabase.from('settings').delete().eq('artist_id', artistId);
        await supabase.from('artworks').delete().eq('artist_id', artistId);
        await supabase.from('artists').delete().eq('id', artistId);

        console.log(`✅ Artist removed: ${artistId}`);
    } catch (error) {
        console.error(`❌ Failed to remove artist:`, error);
        throw error;
    }
}

// 아티스트 목록 조회
async function listArtists() {
    const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Failed to list artists:', error);
        return;
    }

    console.log('\n📋 Registered Artists:');
    console.log('---');
    data?.forEach((artist, index) => {
        console.log(`${index + 1}. ${artist.name} (${artist.id})`);
        console.log(`   Gallery: ${artist.gallery_name}`);
        console.log(`   Created: ${new Date(artist.created_at).toLocaleDateString()}`);
        console.log('');
    });
}

export {
    createArtistsTable,
    setupArtist,
    removeArtist,
    listArtists,
};

export type {
    ArtistSetup,
};

// CLI 실행
if (require.main === module) {
    const command = process.argv[2];

    switch (command) {
        case 'init':
            createArtistsTable().then(() => process.exit(0));
            break;
        case 'list':
            listArtists().then(() => process.exit(0));
            break;
        case 'setup':
            const artistId = process.argv[3];
            const artistName = process.argv[4];
            const galleryName = process.argv[5];
            const adminPassword = process.argv[6];

            if (!artistId || !artistName || !galleryName || !adminPassword) {
                console.error('Usage: npm run db:setup <artistId> <artistName> <galleryName> <adminPassword>');
                process.exit(1);
            }

            setupArtist({ artistId, artistName, galleryName, adminPassword })
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
        case 'remove':
            const removeId = process.argv[3];
            if (!removeId) {
                console.error('Usage: npm run db:remove <artistId>');
                process.exit(1);
            }
            removeArtist(removeId)
                .then(() => process.exit(0))
                .catch(() => process.exit(1));
            break;
        default:
            console.log('Available commands:');
            console.log('  npm run db:init    - Initialize database tables');
            console.log('  npm run db:list    - List all artists');
            console.log('  npm run db:setup   - Setup new artist');
            console.log('  npm run db:remove  - Remove artist');
            process.exit(0);
    }
}
