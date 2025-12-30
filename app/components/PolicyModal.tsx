"use client";

import { useState, useEffect } from "react";

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policyId: "terms" | "privacy" | "refund";
    theme?: "white" | "black";
}

// ──────────────────────────────────────────────────────────────────────────────
// 📄 정책 전문 데이터 (표준 약관 및 법적 근거 기반)
// ──────────────────────────────────────────────────────────────────────────────
const POLICY_DATA = {
    terms: {
        title: "이용약관",
        content: `제1조 (목적)
본 약관은 오용택(이하 "회사")이 운영하는 온라인 갤러리 서비스 "그림실"(이하 "서비스")을 이용함에 있어 "회사"와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 작품 전시, 작가 화첩 열람, 디지털 콘텐츠 제공 및 이와 관련된 제반 서비스를 의미합니다.
2. "이용자"란 서비스를 이용하는 회원 및 비회원을 말합니다.
3. "회원"이란 회사와 이용계약을 체결하고 이용자 아이디(ID)를 부여받아 서비스를 이용하는 자를 의미합니다.

제3조 (약관의 명시와 개정)
1. 회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
2. 회사는 「약관의 규제에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
3. 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 적용일 7일 전부터 공지합니다.

제4조 (서비스의 제공 및 변경)
1. 회사는 다음의 업무를 수행합니다.
   가. 디지털 예술 작품 전시 및 작가 화첩 제공
   나. 디지털 콘텐츠 구매 및 정기 결제 서비스 제공
   다. 기타 회사가 정하는 업무
2. 서비스의 변경이 필요한 경우 변경 전 해당 내용을 공지사항으로 안내합니다.

제5조 (서비스의 중단)
회사는 정보통신설비의 보수점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.

제6조 (구매신청 및 결제)
1. 이용자는 서비스를 통해 유료 콘텐츠 또는 정기 구독권을 구매할 수 있습니다.
2. 결제 방법은 신용카드, 계좌이체, 간편결제(카카오페이 등) 중 선택할 수 있습니다.

제7조 (이용요금 및 환불)
1. 유료 서비스 이용요금은 별도 표시된 가격 정책에 따릅니다.
2. 환불은 본 약관 및 별도의 '환불 및 교환 정책'에 따르며, 디지털 콘텐츠의 특성상 이용이 개시된 경우 환불이 제한될 수 있습니다.

제8조 (회사의 의무)
회사는 관련 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를 제공하기 위해 최선을 다합니다.

제9조 (이용자의 의무)
이용자는 서비스 이용 시 타인의 정보를 도용하거나 회사의 저작권을 침해하는 행위를 해서는 안 됩니다.

제10조 (저작권의 귀속 및 이용제한)
1. 회사가 작성한 저작물에 대한 저작권 및 기타 지식재산권은 회사에 귀속됩니다.
2. 이용자는 서비스를 이용하며 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 배포 등을 해서는 안 됩니다.

제11조 (분쟁해결)
본 약관과 관련하여 발생한 분쟁에 대해서는 대한민국 법령을 적용하며, 관할 법원은 회사의 소재지 관할 법원으로 합니다.

부칙
공고일자: 2024년 12월 24일
시행일자: 2024년 12월 31일
상호: 태정 (그림실)
대표자: 오용택`
    },
    privacy: {
        title: "개인정보처리방침",
        content: `제1조 (개인정보의 처리 목적)
오용택(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 관련 법령에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
1. 홈페이지 회원 가입 및 관리: 서비스 이용 의사 확인, 본인 식별·인증, 회원자격 유지·관리
2. 재화 또는 서비스 제공: 물품 배송, 서비스 제공, 청구서 발송, 콘텐츠 제공, 맞춤 서비스 제공, 요금 결제·정산
3. 고충 처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지

제2조 (개정사항의 수집 항목 및 방법)
회사는 서비스 제공을 위해 아래와 같은 개인정보를 수집할 수 있습니다.
1. 수집 항목: 성명, 전자우편주소(이메일), 휴대전화번호, 결제 정보(계좌번호, 카드정보 등), 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보
2. 수집 방법: 홈페이지 회원가입, 서면 양식, 전화/이메일을 통한 상담, 생성 정보 수집 도구를 통한 자동 수집

제3조 (개인정보의 처리 및 보유 기간)
1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 이용자로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
2. 상법 및 전자상거래법 등 관련 법령의 규정에 의하여 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 개인정보를 보관합니다.
   가. 계약 또는 청약철회 등에 관한 기록: 5년
   나. 대금결제 및 재화 등의 공급에 관한 기록: 5년
   다. 소비자의 불만 또는 분쟁처리에 관한 기록: 3년

제4조 (개인정보의 파기 절차 및 방법)
1. 파기 절차: 회사는 보유기간이 경과하거나 처리 목적이 달성된 개인정보를 지체 없이 파기합니다.
2. 파기 방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.

제5조 (이용자 및 법정대리인의 권리와 그 행사방법)
1. 이용자는 언제든지 자신의 개인정보를 열람하거나 수정할 수 있으며, 수집·이용에 대한 동의 철회 또는 가입 해지를 요청할 수 있습니다.
2. 이용자가 개인정보의 오류에 대한 정정을 요청한 경우 정정을 완료하기 전까지 당해 개인정보를 이용 또는 제공하지 않습니다.

제6조 (개인정보 보호책임자)
회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 고충처리 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.

성명: 오용택 (대표)
연락처: 010-8618-3323
전자우편: artflow010@gmail.com

제7조 (개인정보처리방침의 변경)
이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 교정이 있는 경우에는 공지사항을 통해 고지할 것입니다.

부칙
시행일자: 2024년 12월 31일`
    },
    refund: {
        title: "환불 및 교환 정책",
        content: `🚨 **[필독] 디지털 콘텐츠 이용 및 청약철회 정책**

오용택(그림실)에서 제공하는 서비스는 「전자상거래 등에서의 소비자보호에 관한 법률」을 준수하며, 디지털 콘텐츠의 특성을 고려하여 다음과 같은 환불 정책을 운영합니다.

**제1조 (청약철회권의 행사 - 법 제17조 제1항)**
1. 이용자는 유료 서비스 결제 완료 후 **7일 이내**에 청약철회(환불)를 요청할 수 있습니다.
2. 단, 전자상거래법 제17조 제2항 제5호에 따라 **"디지털 콘텐츠의 제공이 개시된 경우"**에는 소비자의 청약철회가 제한됩니다.

**제2조 (청약철회 제한 조건)**
1. 온라인 갤러리의 작품 열람 서비스는 결제 후 **최초 1회라도 열람(콘텐츠 스트리밍/보기)을 시작한 경우** 상품의 가치가 소비된 것으로 간주되어 환불이 불가능합니다.
2. 구매 후 7일이 경과한 경우 환불이 제한됩니다.

**제3조 (환불 절차 및 소요 기간)**
1. 청약철회 조건에 부합하는 경우, 고객센터(010-8618-3323) 또는 이메일(artflow010@gmail.com)로 신청해 주시기 바랍니다.
2. 환불은 신청 접수 및 확인 후 **3영업일 이내**에 결제 수단별로 취소 처리됩니다.
3. 카드사 또는 PG사의 사정에 따라 실제 환불 금액 입금까지 추가 기간이 소요될 수 있습니다.

**제4조 (교환 및 하자 처리)**
서비스 자체의 중대한 시스템 오류로 인해 기간 내 서비스를 정상적으로 이용하지 못한 경우, 회사는 이용 기간 연장 또는 환불 등 적절한 조치를 취합니다.

부칙
본 정책은 2024년 12월 31일부터 시행됩니다.
상호: 태정 (그림실)
대표자: 오용택`
    }
};

export default function PolicyModal({ isOpen, onClose, policyId, theme = "white" }: PolicyModalProps) {
    const data = POLICY_DATA[policyId];

    // 테마 기반 색상 설정
    const colors = {
        bg: theme === "black" ? "#0f0f0f" : "#ffffff",
        text: theme === "black" ? "#e5e5e5" : "#1a1a1a",
        headerBg: theme === "black" ? "#1a1a1a" : "#fcfcfc",
        border: theme === "black" ? "#262626" : "#eeeeee",
        accent: "#4f46e5"
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
            {/* 배경 흐림 처리 (Backdrop) */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 모달 본체 (Modal Container) */}
            <div
                className="relative w-full max-w-2xl h-full md:h-auto md:max-h-[85vh] overflow-hidden rounded-none md:rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col scale-in-center"
                style={{ background: colors.bg, color: colors.text }}
            >
                {/* 헤더 섹션 */}
                <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: colors.border, background: colors.headerBg }}>
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                        {data.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all active:scale-90"
                        aria-label="창 닫기"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 본문 에리어 - 스크롤 시스템 핵심 */}
                <div
                    className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar"
                    style={{
                        scrollBehavior: "smooth",
                        WebkitOverflowScrolling: "touch"
                    }}
                >
                    <div
                        className="prose prose-sm max-w-none"
                        style={{
                            color: colors.text,
                            fontSize: "15.5px",
                            lineHeight: "2.0",
                            fontFamily: "'Noto Sans KR', 'Pretendard', system-ui, sans-serif",
                            wordBreak: "keep-all"
                        }}
                    >
                        {/* 텍스트 렌더링 엔진: 전문 하드코딩 데이터를 한 줄씩 정밀 렌더링 */}
                        {data.content.split('\n').map((line, i) => {
                            const trimLine = line.trim();

                            // 1. 중요 강조 감지
                            const isImportant = trimLine.includes('[중요]') || trimLine.includes('⚠️') || trimLine.includes('🚨') || trimLine.startsWith('**');

                            // 2. 조항 제목 감지 (제n조, 부칙 등) - 폰트 사이즈 및 여백 차별화
                            const isHeader = /^제\s*\d+\s*조/.test(trimLine) || /^\d+\./.test(trimLine) || /^[가-힣]\./.test(trimLine) || trimLine.startsWith("부칙");

                            // 3. 텍스트 내 볼드태그 및 색상 후처리
                            const processedLine = trimLine
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\[중요\]/g, '<span style="color: #ef4444; font-weight: 900;">[중요]</span>');

                            if (!trimLine && i !== 0) return <div key={i} className="h-8" />;

                            return (
                                <div
                                    key={i}
                                    className={`
                                        mb-4
                                        ${isImportant ? 'text-blue-700 dark:text-blue-300 font-bold bg-blue-500/5 p-3 rounded-lg border-l-4 border-blue-500' : ''}
                                        ${line.includes('환불') || line.includes('결제') || line.includes('이용료') || line.includes('청약철회') ? 'font-bold' : ''}
                                        ${isHeader ? 'font-black text-[20px] mt-16 mb-8 text-gray-900 dark:text-white border-b-2 pb-3' : ''}
                                    `}
                                    style={isHeader ? { borderColor: colors.border } : {}}
                                >
                                    <p
                                        style={{ wordBreak: "keep-all" }}
                                        dangerouslySetInnerHTML={{ __html: processedLine }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 푸터 버튼 - 확인 버튼 하나에만 집중 */}
                <div className="p-6 border-t text-center bg-white/50 dark:bg-black/50 backdrop-blur-sm" style={{ borderColor: colors.border }}>
                    <button
                        onClick={onClose}
                        className="w-full md:w-auto px-20 py-4 bg-[#111] dark:bg-white text-white dark:text-black rounded-xl font-black text-lg hover:opacity-90 transition-all shadow-xl active:scale-95"
                    >
                        확인
                    </button>
                </div>

                {/* 스크롤바 커스텀 스타일 */}
                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: ${theme === "black" ? "#0a0a0a" : "#f8f9fa"};
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: ${theme === "black" ? "#333" : "#cbd5e1"};
                        border-radius: 10px;
                        border: 2px solid ${theme === "black" ? "#0a0a0a" : "#f8f9fa"};
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: ${theme === "black" ? "#444" : "#94a3b8"};
                    }
                    @keyframes scale-in-center {
                        0% { transform: scale(0.95); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .scale-in-center {
                        animation: scale-in-center 0.25s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                    }
                `}</style>
            </div>
        </div>
    );
}
