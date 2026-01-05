// API Route: 영감 메타데이터 업데이트 (메모 등)
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServerSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

export async function PATCH(request: NextRequest) {
    try {
        const { inspirationId, artistId, metadata } = await request.json();

        if (!inspirationId || !artistId || !metadata) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = getServerSupabaseClient();

        // 메타데이터 업데이트 (JSONB merge)
        const { data, error } = await supabase
            .from('inspirations')
            .update({ metadata })
            .eq('id', inspirationId)
            .eq('artist_id', artistId)
            .select();

        if (error) {
            console.error('Database update failed:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Unexpected error in update API:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal server error'
        }, { status: 500 });
    }
}
