"use client";

import Link from "next/link";

export default function PrivacyPage() {
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
                개인정보처리방침
            </h1>

            {/* 제1조 개인정보의 처리 목적 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제1조 (개인정보의 처리 목적)</h2>
                <p style={{ color: "#4b5563", marginBottom: "12px" }}>
                    태정(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.
                    처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
                    이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                </p>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li><strong>서비스 제공</strong>: 온라인 갤러리 서비스 제공, 콘텐츠 제공, 맞춤 서비스 제공</li>
                    <li><strong>회원 관리</strong>: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지</li>
                    <li><strong>결제 서비스</strong>: 구독료 결제, 요금정산</li>
                    <li><strong>마케팅 및 광고</strong>: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공</li>
                </ol>
            </section>

            {/* 제2조 처리하는 개인정보 항목 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제2조 (처리하는 개인정보의 항목)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li><strong>필수항목</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>이름</li>
                            <li>연락처 (전화번호)</li>
                            <li>갤러리명</li>
                            <li>결제정보 (신용카드 번호, 은행계좌 정보 등)</li>
                        </ul>
                    </li>
                    <li><strong>자동 수집 항목</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>IP 주소, 쿠키, 서비스 이용 기록, 방문 기록</li>
                            <li>불량 이용 방지를 위한 기기정보</li>
                        </ul>
                    </li>
                </ol>
            </section>

            {/* 제3조 개인정보의 처리 및 보유기간 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제3조 (개인정보의 처리 및 보유 기간)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
                        동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</li>
                    <li>각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li><strong>회원 가입 및 관리</strong>: 서비스 이용계약 해지 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지)</li>
                            <li><strong>재화 또는 서비스 제공</strong>: 재화·서비스 공급완료 및 요금결제·정산 완료 시까지 (단, 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 계약 또는 청약철회 등에 관한 기록은 5년, 대금결제 및 재화 등의 공급에 관한 기록은 5년, 소비자의 불만 또는 분쟁처리에 관한 기록은 3년 보관)</li>
                        </ul>
                    </li>
                </ol>
            </section>

            {/* 제4조 개인정보의 제3자 제공 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제4조 (개인정보의 제3자 제공)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며,
                        정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</li>
                    <li>회사는 다음과 같이 개인정보를 제3자에게 제공하고 있습니다:
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li><strong>제공받는 자</strong>: Port One (결제대행 서비스)</li>
                            <li><strong>제공받는 자의 이용 목적</strong>: 결제 처리</li>
                            <li><strong>제공하는 개인정보 항목</strong>: 이름, 연락처, 결제정보</li>
                            <li><strong>제공받는 자의 보유·이용기간</strong>: 거래 종료 후 5년</li>
                        </ul>
                    </li>
                </ol>
            </section>

            {/* 제5조 개인정보처리의 위탁 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제5조 (개인정보처리의 위탁)</h2>
                <p style={{ color: "#4b5563", marginBottom: "12px" }}>
                    회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
                </p>
                <ul style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li><strong>수탁업체</strong>: Vercel Inc., Supabase Inc.</li>
                    <li><strong>위탁업무 내용</strong>: 시스템 운영 및 데이터 보관</li>
                </ul>
            </section>

            {/* 제6조 정보주체의 권리·의무 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제6조 (정보주체의 권리·의무 및 행사방법)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>개인정보 열람요구</li>
                            <li>오류 등이 있을 경우 정정 요구</li>
                            <li>삭제요구</li>
                            <li>처리정지 요구</li>
                        </ul>
                    </li>
                    <li>제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며
                        회사는 이에 대해 지체 없이 조치하겠습니다.</li>
                    <li>정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를
                        완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
                </ol>
            </section>

            {/* 제7조 개인정보의 파기 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제7조 (개인정보의 파기)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
                        지체없이 해당 개인정보를 파기합니다.</li>
                    <li>개인정보 파기의 절차 및 방법은 다음과 같습니다:
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li><strong>파기절차</strong>: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류)
                                내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</li>
                            <li><strong>파기방법</strong>: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.
                                종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
                        </ul>
                    </li>
                </ol>
            </section>

            {/* 제8조 개인정보의 안전성 확보조치 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제8조 (개인정보의 안전성 확보 조치)</h2>
                <p style={{ color: "#4b5563", marginBottom: "12px" }}>
                    회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
                </p>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고
                        주기적인 갱신·점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적/물리적으로 감시 및 차단하고 있습니다.</li>
                    <li>개인정보의 안전한 저장·전송을 위하여 암호화 조치를 하고 있습니다.</li>
                    <li>개인정보에 대한 접근권한을 최소한의 인원으로 제한하고 있습니다.</li>
                </ol>
            </section>

            {/* 제9조 개인정보 보호책임자 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제9조 (개인정보 보호책임자)</h2>
                <p style={{ color: "#4b5563", marginBottom: "12px" }}>
                    회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여
                    아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                </p>
                <div style={{
                    background: "#f9fafb",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                }}>
                    <p style={{ color: "#374151", marginBottom: "8px" }}><strong>개인정보 보호책임자</strong></p>
                    <p style={{ color: "#6b7280", marginBottom: "4px" }}>성명: 오용택</p>
                    <p style={{ color: "#6b7280", marginBottom: "4px" }}>연락처: 010-8618-3323</p>
                    <p style={{ color: "#6b7280" }}>이메일: artflow010@gmail.com</p>
                </div>
            </section>

            {/* 제10조 권익침해 구제방법 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제10조 (권익침해 구제방법)</h2>
                <p style={{ color: "#4b5563", marginBottom: "12px" }}>
                    정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원
                    개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
                </p>
                <ul style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
                    <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
                    <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
                    <li>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
                </ul>
            </section>

            {/* 제11조 개인정보 처리방침 변경 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제11조 (개인정보 처리방침 변경)</h2>
                <p style={{ color: "#4b5563" }}>
                    이 개인정보처리방침은 2024년 12월 31일부터 적용됩니다.
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
