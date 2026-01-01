/**
 * 비밀번호 변경 API
 * - VIP 첫 로그인 시 임시 비밀번호 변경
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
    // 매 요청마다 새로운 클라이언트 생성 (사살된 싱글톤 대체)
    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
    });

    try {
        const { artist_id, new_password } = await request.json();

        // 유효성 검사
        if (!artist_id || !new_password) {
            return NextResponse.json(
                { error: 'artist_id와 new_password가 필요합니다.' },
                { status: 400 }
            );
        }

        if (new_password.length < 4) {
            return NextResponse.json(
                { error: '비밀번호는 4자 이상이어야 합니다.' },
                { status: 400 }
            );
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // auth_passwords 테이블 업데이트
        const { error } = await supabase
            .from('auth_passwords')
            .update({
                password_hash: hashedPassword,
                updated_at: new Date().toISOString(),
            })
            .eq('artist_id', artist_id);

        if (error) {
            console.error('비밀번호 변경 실패:', error);
            return NextResponse.json(
                { error: '비밀번호 변경에 실패했습니다.' },
                { status: 500 }
            );
        }

        console.log(`✅ 비밀번호 변경 완료: ${artist_id}`);

        return NextResponse.json({
            success: true,
            message: '비밀번호가 성공적으로 변경되었습니다.',
        });
    } catch (error: any) {
        console.error('비밀번호 변경 에러:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
