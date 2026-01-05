import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getServerSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase environment variables missing');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
}

export async function POST(request: NextRequest) {
    try {
        const { inspirationId, artistId } = await request.json();

        if (!inspirationId || !artistId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = getServerSupabaseClient();
        const BUCKET_NAME = 'inspiration-images';

        console.log(`🗑️ Deleting inspiration ${inspirationId} for artist ${artistId}`);

        // 1. Storage 파일 삭제 시도
        const blurPath = `${artistId}/${inspirationId}_blur.jpg`;
        const originalPath = `${artistId}/${inspirationId}_original.jpg`;

        const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([blurPath, originalPath]);

        if (storageError) {
            console.warn('⚠️ Storage deletion warning:', storageError.message);
        }

        // 2. Database 레코드 삭제
        const { error: dbError } = await supabase
            .from('inspirations')
            .delete()
            .eq('id', inspirationId)
            .eq('artist_id', artistId);

        if (dbError) {
            console.error('❌ DB deletion error:', dbError.message);
            return NextResponse.json({ error: 'Failed to delete from database', details: dbError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: '✅ 삭제 성공' });

    } catch (error) {
        console.error('❌ Delete API error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
