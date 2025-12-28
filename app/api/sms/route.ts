import { NextRequest, NextResponse } from 'next/server';

// 알리고 SMS API 연동
// 가입: https://smartsms.aligo.in
// API 키는 환경변수에 설정: ALIGO_API_KEY, ALIGO_USER_ID, ALIGO_SENDER

// 인증번호 임시 저장 (실제로는 Redis나 DB 사용 권장)
const verificationCodes = new Map<string, { code: string; expires: number }>();

export async function POST(request: NextRequest) {
    try {
        const { phone, action } = await request.json();

        if (action === 'send') {
            // 6자리 인증번호 생성
            const code = Math.floor(100000 + Math.random() * 900000).toString();

            // 5분 후 만료
            verificationCodes.set(phone, {
                code,
                expires: Date.now() + 5 * 60 * 1000,
            });

            // 알리고 API 호출
            const apiKey = process.env.ALIGO_API_KEY;
            const userId = process.env.ALIGO_USER_ID;
            const sender = process.env.ALIGO_SENDER;

            if (!apiKey || !userId || !sender) {
                // API 키 없으면 테스트 모드 (콘솔에 출력)
                console.log(`[TEST MODE] 인증번호 발송: ${phone} -> ${code}`);
                return NextResponse.json({
                    success: true,
                    message: '인증번호가 발송되었습니다.',
                    testMode: true,
                    testCode: code, // 테스트용으로만 반환
                });
            }

            // 실제 알리고 API 호출
            const formData = new FormData();
            formData.append('key', apiKey);
            formData.append('user_id', userId);
            formData.append('sender', sender);
            formData.append('receiver', phone.replace(/-/g, ''));
            formData.append('msg', `[그림실] 인증번호: ${code} (5분 내 입력)`);

            const response = await fetch('https://apis.aligo.in/send/', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.result_code === '1') {
                return NextResponse.json({
                    success: true,
                    message: '인증번호가 발송되었습니다.',
                });
            } else {
                console.error('Aligo API Error:', result);
                return NextResponse.json({
                    success: false,
                    message: 'SMS 발송에 실패했습니다.',
                }, { status: 500 });
            }
        }

        if (action === 'verify') {
            const { inputCode } = await request.json();
            const stored = verificationCodes.get(phone);

            if (!stored) {
                return NextResponse.json({
                    success: false,
                    message: '인증번호를 먼저 요청해주세요.',
                }, { status: 400 });
            }

            if (Date.now() > stored.expires) {
                verificationCodes.delete(phone);
                return NextResponse.json({
                    success: false,
                    message: '인증번호가 만료되었습니다. 다시 요청해주세요.',
                }, { status: 400 });
            }

            if (stored.code !== inputCode) {
                return NextResponse.json({
                    success: false,
                    message: '인증번호가 일치하지 않습니다.',
                }, { status: 400 });
            }

            verificationCodes.delete(phone);
            return NextResponse.json({
                success: true,
                message: '인증되었습니다.',
                verified: true,
            });
        }

        return NextResponse.json({
            success: false,
            message: '잘못된 요청입니다.',
        }, { status: 400 });

    } catch (error) {
        console.error('SMS API Error:', error);
        return NextResponse.json({
            success: false,
            message: '서버 오류가 발생했습니다.',
        }, { status: 500 });
    }
}
