import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/app/utils/supabase';
import { getOwnerId } from '@/app/utils/auth';

export async function POST(request: Request) {
    try {
        // 로그인 확인
        const ownerId = getOwnerId();
        if (!ownerId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 요청 데이터 파싱
        const { artistName, artistUrl, imageUrl } = await request.json();

        if (!artistName || !artistUrl) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseClient();

        // 현재 설정 가져오기
        const { data: settings, error: fetchError } = await supabase
            .from('site_settings')
            .select('artist_picks')
            .eq('artist_id', ownerId)
            .single();

        if (fetchError) {
            console.error('Failed to fetch settings:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch settings' },
                { status: 500 }
            );
        }

        // 기존 artistPicks 파싱
        let artistPicks = [];
        try {
            artistPicks = settings?.artist_picks
                ? (typeof settings.artist_picks === 'string'
                    ? JSON.parse(settings.artist_picks)
                    : settings.artist_picks)
                : [];
        } catch (e) {
            console.error('Failed to parse artist_picks:', e);
            artistPicks = [];
        }

        // 중복 체크
        const exists = artistPicks.some(
            (pick: any) => pick.name === artistName || pick.archiveUrl === artistUrl
        );

        if (exists) {
            return NextResponse.json(
                { error: 'Artist already recommended' },
                { status: 409 }
            );
        }

        // 새 작가 추가
        artistPicks.push({
            name: artistName,
            archiveUrl: artistUrl,
            imageUrl: imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
        });

        // 데이터베이스 업데이트
        const { error: updateError } = await supabase
            .from('site_settings')
            .update({ artist_picks: JSON.stringify(artistPicks) })
            .eq('artist_id', ownerId);

        if (updateError) {
            console.error('Failed to update settings:', updateError);
            return NextResponse.json(
                { error: 'Failed to update settings' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Artist recommended successfully',
            totalPicks: artistPicks.length
        });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
