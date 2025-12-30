/**
 * VIP 알림 서비스 유틸리티
 * - 결제 완료 후 아티스트에게 링크 및 비밀번호 자동 발송
 * - SMS(알리고 등) 및 이메일(Nodemailer 등) 연동을 위한 구조
 */

interface SendParams {
    to: string;
    artistName: string;
    galleryUrl: string;
    tempPassword: string;
}

/**
 * SMS 발송 (알리고 API 등 연동 예정)
 */
export async function sendLoginInfoSms({ to, artistName, galleryUrl, tempPassword }: SendParams) {
    if (!to) return;

    const message = `[그림실] ${artistName} 작가님, VIP 갤러리 생성이 완료되었습니다.\n\n🔗 링크: ${galleryUrl}\n🔑 임시비빌번호: ${tempPassword}\n\n첫 로그인 후 비밀번호를 꼭 변경해 주세요.`;

    console.log('📱 SMS 발송 시뮬레이션:', { to, message });

    // TODO: 실제 SMS API 호출 (예: Aligo)
    /*
    const response = await fetch('https://apis.aligo.in/send/', {
        method: 'POST',
        body: new URLSearchParams({
            key: process.env.ALIGO_API_KEY!,
            user_id: process.env.ALIGO_USER_ID!,
            sender: process.env.ALIGO_SENDER_NUMBER!,
            receiver: to,
            msg: message,
        })
    });
    return response.json();
    */

    return { success: true, method: 'SMS' };
}

/**
 * 이메일 발송 (Nodemailer, SendGrid 등 연동 예정)
 */
export async function sendLoginInfoEmail({ to, artistName, galleryUrl, tempPassword }: SendParams) {
    if (!to) return;

    const subject = `[그림실] ${artistName} 작가님의 온라인 화첩 생성이 완료되었습니다.`;
    const html = `
        <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #6366f1;">축하합니다! ${artistName} 작가님</h2>
            <p>작가님만의 독창적인 온라인 화첩이 성공적으로 생성되었습니다.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>🔗 갤러리 링크:</strong> <a href="${galleryUrl}">${galleryUrl}</a></p>
                <p><strong>🔑 임시 비밀번호:</strong> ${tempPassword}</p>
            </div>
            <p style="color: #ef4444; font-size: 14px;">* 보안을 위해 로그인 후 반드시 비밀번호를 변경해 주세요.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #888; font-size: 12px;">본 메일은 발신전용입니다. 문의사항은 artflow010@gmail.com으로 연락주시기 바랍니다.</p>
        </div>
    `;

    console.log('📧 이메일 발송 시뮬레이션:', { to, subject });

    // TODO: 실제 Email API 호출 (예: Nodemailer)
    /*
    const transporter = nodemailer.createTransport({...});
    await transporter.sendMail({ from, to, subject, html });
    */

    return { success: true, method: 'EMAIL' };
}
