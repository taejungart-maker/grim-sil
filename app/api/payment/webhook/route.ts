/**
 * 결제 웹훅 API
 * - Port One 결제 완료 시 자동 VIP 생성
 * - 데이터 격리 V5 적용
 * - 박야일 19개 작품 보호
 */

import { NextRequest, NextResponse } from 'next/server';
import { createVipArtist } from '@/app/utils/vipArtistDb';
import { sendLoginInfoSms, sendLoginInfoEmail } from '@/app/utils/notificationService';

// 중장년 작가를 위한 고정 임시 비밀번호
function generateTempPassword(): string {
    return "123456";
}

export async function POST(request: NextRequest) {
    try {
        // 1. 웹훅 페이로드 파싱
        const payload = await request.json();

        console.log('🔔 결제 웹훅 수신:', payload);

        // 2. Port One 서명 검증 (보안)
        // TODO: 실제 Port One 웹훅 서명 검증 로직 추가
        const signature = request.headers.get('x-portone-signature');
        if (!signature) {
            console.error('❌ 서명 누락');
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        // 3. 결제 상태 확인
        const { status, transaction_id, customer } = payload;

        if (status !== 'paid') {
            console.log('⚠️ 결제 미완료 상태:', status);
            return NextResponse.json({ status: 'ignored' }, { status: 200 });
        }

        // 4. 고객 정보 추출
        const customerName = customer?.name || '익명';
        const customerEmail = customer?.email;
        const customerPhone = customer?.phone;

        console.log('✅ 결제 완료:', customerName);

        // 5. 임시 비밀번호 생성
        const tempPassword = generateTempPassword();

        // 6. VIP 아티스트 자동 생성 (데이터 격리 V5 적용)
        const newArtist = await createVipArtist(
            customerName,
            tempPassword,
            false, // 결제형
            29000  // 구독 가격
        );

        console.log('🎉 VIP 갤러리 자동 생성:', newArtist.link_id);

        // 7. 링크 URL 생성
        const galleryUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://grim-sil.vercel.app'}/${newArtist.link_id}`;

        // 8. SMS/이메일 발송 (시뮬레이션 호출)
        await sendLoginInfoSms({
            to: customerPhone || '',
            artistName: customerName,
            galleryUrl: galleryUrl,
            tempPassword: tempPassword
        });

        await sendLoginInfoEmail({
            to: customerEmail || '',
            artistName: customerName,
            galleryUrl: galleryUrl,
            tempPassword: tempPassword
        });

        // 9. 응답
        return NextResponse.json({
            success: true,
            artist_id: newArtist.id,
            link_id: newArtist.link_id,
            gallery_url: galleryUrl,
            temp_password: tempPassword, // 실제 환경에서는 로그에만 기록
        }, { status: 200 });

    } catch (error: any) {
        console.error('❌ 웹훅 처리 실패:', error);
        return NextResponse.json({
            error: error.message,
        }, { status: 500 });
    }
}

// GET 요청 (테스트용)
export async function GET() {
    return NextResponse.json({
        message: '결제 웹훅 엔드포인트',
        method: 'POST only',
    });
}
