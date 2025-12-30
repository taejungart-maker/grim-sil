"use client";

import Link from "next/link";

export default function RefundPage() {
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
                환불 및 교환 정책
            </h1>

            {/* 제1조 기본 원칙 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제1조 (기본 원칙)</h2>
                <p style={{ color: "#4b5563", marginBottom: "12px" }}>
                    태정(이하 "회사")는 「전자상거래 등에서의 소비자보호에 관한 법률」 및 관련 법령을 준수하며,
                    이용자의 정당한 청약철회 및 환불 요청에 성실히 응합니다.
                </p>
            </section>

            {/* 제2조 서비스 특성 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제2조 (서비스의 특성)</h2>
                <p style={{ color: "#4b5563", marginBottom: "12px" }}>
                    본 서비스는 온라인 갤러리 구독 서비스로서, 디지털 콘텐츠를 제공하는 서비스입니다.
                    이용자는 월 단위로 서비스를 구독하며, 구독 기간 동안 서비스의 모든 기능을 이용할 수 있습니다.
                </p>
                <ul style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>월 구독료: 20,000원 (VAT 포함)</li>
                    <li>결제일: 매월 구독 시작일</li>
                    <li>자동 갱신: 구독 해지 전까지 매월 자동 갱신</li>
                </ul>
            </section>

            {/* 제3조 청약철회 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제3조 (청약철회)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li><strong>청약철회 기간</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>이용자는 구독 결제일로부터 7일 이내에 청약을 철회할 수 있습니다.</li>
                            <li>단, 서비스를 실제로 이용한 경우(작품 업로드 등) 청약철회가 제한될 수 있습니다.</li>
                        </ul>
                    </li>
                    <li><strong>청약철회 방법</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>고객센터(이메일: artflow010@gmail.com)로 청약철회 의사를 표시</li>
                            <li>또는 서비스 내 '구독 관리' 메뉴에서 직접 해지</li>
                        </ul>
                    </li>
                </ol>
            </section>

            {/* 제4조 환불 정책 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제4조 (환불 정책)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li><strong>전액 환불</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>결제일로부터 7일 이내에 서비스를 전혀 이용하지 않은 경우</li>
                            <li>회사의 귀책사유로 서비스를 제공하지 못한 경우</li>
                            <li>서비스 장애가 7일 이상 지속된 경우</li>
                        </ul>
                    </li>
                    <li><strong>부분 환불</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>서비스를 일부 이용한 경우: 미사용일수에 대한 일할 계산 환불</li>
                            <li>환불 금액 = 월 구독료 × (남은 일수 / 해당 월 총일수)</li>
                            <li>단, 환불 금액이 1,000원 미만인 경우 환불되지 않을 수 있습니다.</li>
                        </ul>
                    </li>
                    <li><strong>환불 불가</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>구독 기간이 만료된 후 환불을 요청하는 경우</li>
                            <li>이용자의 귀책사유로 서비스 이용이 불가능한 경우</li>
                            <li>약관 위반으로 서비스 이용이 정지된 경우</li>
                        </ul>
                    </li>
                </ol>
            </section>

            {/* 제5조 환불 절차 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제5조 (환불 절차)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li><strong>환불 신청</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>이메일(artflow010@gmail.com) 또는 고객센터를 통해 환불 신청</li>
                            <li>환불 사유 및 환불 계좌 정보 제공</li>
                        </ul>
                    </li>
                    <li><strong>환불 심사</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>회사는 환불 신청을 접수한 날로부터 3영업일 이내에 환불 가능 여부를 심사하고 결과를 통지합니다.</li>
                        </ul>
                    </li>
                    <li><strong>환불 처리</strong>
                        <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                            <li>환불이 승인된 경우, 승인일로부터 3영업일 이내에 환불 처리됩니다.</li>
                            <li>결제 수단에 따라 환불 방법이 달라질 수 있습니다:
                                <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                                    <li>신용카드: 카드사 승인 취소 (영업일 기준 3-5일 소요)</li>
                                    <li>계좌이체: 지정 계좌로 직접 송금</li>
                                    <li>간편결제: 결제 수단의 정책에 따름</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                </ol>
            </section>

            {/* 제6조 구독 해지 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제6조 (구독 해지)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>이용자는 언제든지 구독을 해지할 수 있습니다.</li>
                    <li>구독 해지 시 즉시 서비스 이용이 중단되며, 남은 기간에 대해 부분 환불이 처리됩니다.</li>
                    <li>구독 해지 후에도 업로드한 콘텐츠는 7일간 보관되며, 7일 이내에 재구독하지 않을 경우 자동 삭제됩니다.</li>
                    <li>구독 해지는 위약금 없이 가능하며, 별도의 수수료가 부과되지 않습니다.</li>
                </ol>
            </section>

            {/* 제7조 교환 정책 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제7조 (교환 정책)</h2>
                <p style={{ color: "#4b5563", marginBottom: "12px" }}>
                    본 서비스는 디지털 구독 서비스의 특성상 일반적인 재화의 교환이 적용되지 않습니다.
                    대신 다음과 같은 경우 서비스 변경이 가능합니다:
                </p>
                <ul style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>서비스 플랜 변경: 고객센터 문의를 통해 플랜 변경 가능 (단, 현재는 단일 플랜만 제공)</li>
                    <li>계정 정보 변경: 서비스 내에서 언제든지 가능</li>
                </ul>
            </section>

            {/* 제8조 과오금 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제8조 (과오금)</h2>
                <ol style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>회사는 과오금이 발생한 경우 이용대금의 결제와 동일한 방법으로 과오금 전액을 환불하여 드립니다.
                        다만, 동일한 방법으로 환불이 불가능할 때는 이를 사전에 고지합니다.</li>
                    <li>회사의 책임 있는 사유로 과오금이 발생한 경우 과오금 전액을 환불합니다.
                        다만, 이용자의 책임 있는 사유로 과오금이 발생한 경우, 회사가 과오금을 환불하는 데 소요되는 비용은
                        합리적인 범위 내에서 이용자가 부담하여야 합니다.</li>
                </ol>
            </section>

            {/* 제9조 고객센터 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제9조 (고객센터)</h2>
                <div style={{
                    background: "#f9fafb",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                }}>
                    <p style={{ color: "#374151", marginBottom: "12px" }}>
                        환불 및 교환 관련 문의사항이 있으시면 아래 고객센터로 연락 주시기 바랍니다:
                    </p>
                    <p style={{ color: "#6b7280", marginBottom: "4px" }}><strong>이메일:</strong> artflow010@gmail.com</p>
                    <p style={{ color: "#6b7280", marginBottom: "4px" }}><strong>전화:</strong> 010-8618-3323</p>
                    <p style={{ color: "#6b7280" }}><strong>운영시간:</strong> 평일 09:00-18:00 (주말 및 공휴일 제외)</p>
                </div>
            </section>

            {/* 제10조 분쟁 해결 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>제10조 (분쟁 해결)</h2>
                <p style={{ color: "#4b5563", marginBottom: "12px" }}>
                    회사는 환불 및 교환과 관련하여 이용자로부터 제출되는 불만사항 및 의견을 우선적으로 처리합니다.
                    다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 즉시 통보해 드립니다.
                </p>
                <p style={{ color: "#4b5563", marginBottom: "12px" }}>
                    회사와 이용자 간에 발생한 전자상거래 분쟁과 관련하여 이용자의 피해구제신청이 있는 경우에는
                    공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.
                </p>
                <ul style={{ color: "#4b5563", paddingLeft: "20px" }}>
                    <li>한국소비자원 전자상거래분쟁조정위원회: (국번없이) 1372 (www.kca.go.kr)</li>
                    <li>공정거래위원회 전자문서·전자거래분쟁조정위원회: (국번없이) 1661-5636 (www.ftc.go.kr)</li>
                </ul>
            </section>

            {/* 부칙 */}
            <section style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>부칙</h2>
                <p style={{ color: "#4b5563" }}>
                    본 환불 및 교환 정책은 2025년 1월 1일부터 시행됩니다.
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
                <p>상호: 태정 | 대표자: 오용택</p>
                <p>문의: artflow010@gmail.com</p>
            </div>
        </div>
    );
}
