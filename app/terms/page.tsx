"use client";

import Link from "next/link";

export default function TermsPage() {
    return (
        <div style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "40px 20px",
            fontFamily: "'Noto Sans KR', sans-serif",
            lineHeight: 1.8,
        }}>
            {/* 헤더 */}
            <div style={{ marginBottom: "40px" }}>
                <Link
                    href="/"
                    style={{
                        color: "#6366f1",
                        textDecoration: "none",
                        fontSize: "14px",
                    }}
                >
                    ← 홈으로 돌아가기
                </Link>
            </div>

            <h1 style={{
                fontSize: "28px",
                fontWeight: 700,
                marginBottom: "32px",
                borderBottom: "2px solid #e5e7eb",
                paddingBottom: "16px",
            }}>
                이용약관
            </h1>

            {/* 제1조 목적 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제1조 (목적)</h2>
                <p style={{ color: "#4b5563" }}>
                    본 약관은 태정(이하 "회사")가 제공하는 온라인 갤러리 구독 서비스(이하 "서비스")의 이용과 관련하여
                    회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                </p>
            </section>

            {/* 제2조 정의 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제2조 (정의)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>"서비스"란 회사가 제공하는 온라인 갤러리 플랫폼 및 관련 제반 서비스를 의미합니다.</li>
                    <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 개인 또는 법인을 말합니다.</li>
                    <li>"구독"이란 월 단위로 서비스 이용 권한을 부여받는 계약을 의미합니다.</li>
                    <li>"콘텐츠"란 이용자가 서비스를 이용하면서 게시, 전송, 업로드하는 부호, 문자, 음성, 음향,
                        화상, 동영상 등의 정보를 말합니다.</li>
                </ol>
            </section>

            {/* 제3조 약관의 효력 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제3조 (약관의 효력 및 변경)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</li>
                    <li>회사는 필요하다고 인정되는 경우 본 약관을 변경할 수 있으며, 약관이 변경되는 경우
                        변경된 약관의 시행일자 및 변경 사유를 명시하여 서비스 내 공지합니다.</li>
                    <li>이용자가 변경된 약관에 동의하지 않을 경우, 서비스 이용을 중단하고 이용계약을 해지할 수 있습니다.</li>
                </ol>
            </section>

            {/* 제4조 서비스의 제공 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제4조 (서비스의 제공)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>회사는 다음과 같은 서비스를 제공합니다:
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>온라인 갤러리 공간 제공</li>
                            <li>작품 업로드 및 관리 기능</li>
                            <li>갤러리 공유 및 링크 생성</li>
                            <li>기타 회사가 추가 개발하거나 제공하는 제반 서비스</li>
                        </ul>
                    </li>
                    <li>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</li>
                    <li>회사는 시스템 점검, 보수, 교체 등 필요한 경우 서비스 제공을 일시적으로 중단할 수 있으며,
                        이 경우 사전에 공지합니다.</li>
                </ol>
            </section>

            {/* 제5조 이용계약의 성립 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제5조 (이용계약의 성립)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>이용계약은 이용자가 본 약관에 동의하고 서비스 이용신청을 하여 회사가 이를 승낙함으로써 성립합니다.</li>
                    <li>회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다:
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>타인의 명의를 도용한 경우</li>
                            <li>허위 정보를 기재한 경우</li>
                            <li>사회의 안녕질서 또는 미풍양속을 저해할 목적으로 신청한 경우</li>
                            <li>기타 회사가 정한 이용신청요건이 미비한 경우</li>
                        </ul>
                    </li>
                </ol>
            </section>

            {/* 제6조 구독 및 결제 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제6조 (구독 및 결제)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>서비스 이용료는 월 20,000원이며, 매월 구독일에 자동으로 결제됩니다.</li>
                    <li>결제는 신용카드, 간편결제 등 회사가 제공하는 결제 수단을 통해 이루어집니다.</li>
                    <li>이용자는 언제든지 구독을 해지할 수 있으며, 해지 시 즉시 서비스 이용이 중단됩니다.</li>
                    <li>구독료는 환불 정책에 따라 환불될 수 있습니다.</li>
                </ol>
            </section>

            {/* 제7조 이용자의 의무 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제7조 (이용자의 의무)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>이용자는 다음 행위를 하여서는 안 됩니다:
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>타인의 정보 도용</li>
                            <li>회사가 게시한 정보의 변경</li>
                            <li>회사가 정한 정보 이외의 정보 등의 송신 또는 게시</li>
                            <li>회사 또는 제3자의 저작권 등 지적재산권에 대한 침해</li>
                            <li>회사 또는 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                            <li>외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                        </ul>
                    </li>
                </ol>
            </section>

            {/* 제8조 저작권 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제8조 (저작권의 귀속 및 이용제한)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
                    <li>이용자가 서비스 내에 게시한 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.</li>
                    <li>이용자는 서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포,
                        방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
                </ol>
            </section>

            {/* 제9조 면책조항 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제9조 (면책조항)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
                        서비스 제공에 관한 책임이 면제됩니다.</li>
                    <li>회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
                    <li>회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며,
                        그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
                    <li>회사는 이용자가 게재한 정보, 자료, 사실의 신뢰도, 정확성 등 내용에 관하여는 책임을 지지 않습니다.</li>
                </ol>
            </section>

            {/* 제10조 분쟁해결 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제10조 (분쟁해결)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여
                        피해보상처리기구를 설치·운영합니다.</li>
                    <li>본 약관과 관련하여 회사와 이용자 간에 발생한 분쟁에 대해서는 대한민국 법을 적용하며,
                        본 분쟁으로 인한 소송은 민사소송법상의 관할법원에 제기합니다.</li>
                </ol>
            </section>

            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>부칙</h2>
                <p style={{ color: "#4b5563" }}>
                    본 약관은 2024년 12월 31일부터 시행됩니다.
                </p>
            </section>

            {/* 푸터 */}
            <div style={{
                marginTop: "64px",
                paddingTop: "24px",
                borderTop: "2px solid #e5e7eb",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "14px",
            }}>
                <p>상호: 그림실 | 대표자: 오용택</p>
                <p>문의: artflow010@gmail.com | 연락처: 010-8618-3323</p>
            </div>
        </div>
    );
}
