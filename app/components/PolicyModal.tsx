"use client";

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policyId: "terms" | "privacy" | "refund";
    theme?: "white" | "black";
}

// ──────────────────────────────────────────────────────────────────────────────
// 📄 정책 전문 데이터 (하드코딩)
// ──────────────────────────────────────────────────────────────────────────────
const POLICY_DATA = {
    terms: {
        title: "이용약관",
        content: `제1조 (목적)
본 약관은 오용택(이하 "회사")가 운영하는 "그림실" 온라인 갤러리(이하 "사이트")에서 제공하는 서비스(이하 "서비스")를 이용함에 있어 "사이트"와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. "사이트"란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 등을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.
2. "이용자"란 "사이트"에 접속하여 이 약관에 따라 "사이트"가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
3. "회원"이라 함은 "사이트"에 개인정보를 제공하여 회원등록을 한 자로서, "사이트"의 정보를 지속적으로 제공받으며 "사이트"가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.

제3조 (약관의 명시와 개정)
1. "사이트"는 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소, 전화번호, 전자우편주소, 사업자등록번호, 통신판매업신고번호 등을 이용자가 쉽게 알 수 있도록 초기 서비스화면에 게시합니다.
2. "사이트"는 약관의 규제에 관한 법률 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
3. "사이트"가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 사이트의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.

제4조 (서비스의 제공 및 변경)
1. "사이트"는 다음의 업무를 수행합니다.
   가. 디지털 콘텐츠(작품 전시)에 대한 정보 제공 및 구매계약의 체결
   나. 구매계약이 체결된 서비스의 제공
   다. 기타 "사이트"가 정하는 업무
2. "사이트"는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 서비스의 내용을 변경할 수 있습니다.

제5조 (서비스의 중단)
1. "사이트"는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.

제6조 (구매신청 및 결제)
1. 이용자는 "사이트"상에서 다음 또는 이와 유사한 방법에 의하여 구매를 신청하며, "사이트"는 이용자가 구매신청을 함에 있어서 다음의 각 내용을 알기 쉽게 제공하여야 합니다.
   가. 재화 등의 검색 및 선택
   나. 성명, 전화번호, 전자우편주소 등의 입력
   다. 약관내용, 청약철회권이 제한되는 서비스, 비용부담과 관련한 내용에 대한 확인
   라. 이 약관에 동의하고 위 다.항의 사항을 확인하거나 거부하는 표시 (예, 마우스 클릭)
2. 결제 방법은 "사이트"에서 제공하는 결제수단(신용카드, 계좌이체, 카카오페이, 토스페이 등) 중 가용한 방법으로 할 수 있습니다.

제7조 (계약의 성립)
1. "사이트"는 구매신청에 대하여 승낙한 시점에 계약이 성립한 것으로 봅니다.
2. "사이트"는 구매신청이 허위, 기재누락, 오기가 있는 경우 승낙하지 않을 수 있습니다.

제8조 (청약철회 및 환불)
1. "그림실"의 서비스는 「전자상거래 등에서의 소비자보호에 관한 법률」에 따른 디지털 콘텐츠 서비스로, 이용자가 결제 후 서비스를 이용(작품 열람 등)한 경우에는 청약철회가 제한됩니다.
2. 이용자는 구매 후 7일 이내이며 서비스를 전혀 이용하지 않은 경우에 한하여 청약철회를 요청할 수 있습니다.
3. 환불은 이용자의 신청 후 영업일 기준 3~5일 이내에 처리됩니다.

제9조 (분쟁해결)
1. "사이트"는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.
2. "사이트"와 이용자 간에 발생한 전자상거래 분쟁과 관련하여 이용자의 피해구제신청이 있는 경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.

부칙
본 약관은 2024년 12월 31일부터 시행됩니다.`
    },
    privacy: {
        title: "개인정보처리방침",
        content: `제1조 (개인정보의 처리 목적)
오용택(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다.
1. 홈페이지 회원 가입 및 관리
2. 재화 또는 서비스 제공 (콘텐츠 제공, 요금 결제 등)
3. 고객 서비스 및 고충 처리

제2조 (개인정보의 처리 및 보유 기간)
1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 이용자로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
   가. 계약 및 청약철회 등에 관한 기록: 5년
   나. 대금결제 및 재화 등의 공급에 관한 기록: 5년
   다. 소비자의 불만 또는 분쟁처리에 관한 기록: 3년

제3조 (수집하는 개인정보 항목)
1. 회사는 다음의 개인정보 항목을 수집하고 있습니다.
   가. 필수항목: 이름, 연락처, 이메일 주소, 결제 정보
   나. 자동수집항목: IP 주소, 쿠키, 서비스 이용 기록, 기기 정보

제4조 (개인정보 보호책임자)
성명: 오용택
연락처: 010-8618-3323
이메일: artflow010@gmail.com

부칙
본 개인정보처리방침은 2024년 12월 31일부터 시행됩니다.`
    },
    refund: {
        title: "환불 및 교환 정책",
        content: `🚨 **[필독] 디지털 콘텐츠 이용 및 환불 정책**

오용택(그림실)에서 제공하는 서비스는 디지털 콘텐츠 특성상 다음과 같은 환불 정책을 적용합니다.

**제1조 (환불 불가의 원칙)**
1. 본 사이트에서 제공하는 작품 전시 및 화첩 서비스는 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항 제5호에 따른 "디지털 콘텐츠"에 해당합니다.
2. **서비스를 결제한 후 콘텐츠를 열람하거나 이용을 개시한 경우에는 청약철회(환불)가 불가능합니다.**
3. 디지털 콘텐츠의 특성상 데이터의 열람 시 상품 가치가 즉시 소비된 것으로 간주됩니다.

**제2조 (청약철회가 가능한 경우)**
1. 결제 완료 후 7일 이내이며, **콘텐츠를 전혀 열람하지 않은 경우**에 한하여 전액 환불이 가능합니다.
2. 시스템의 중대한 오류로 인해 서비스를 정상적으로 이용할 수 없는 상태가 지속되어 회사 측의 과실이 인정되는 경우 환불 처리가 가능합니다.

**제3조 (환불 신청 방법)**
1. 환불이 가능한 조건에 해당하는 경우, 이메일(artflow010@gmail.com) 또는 고객센터(010-8618-3323)를 통해 신청해 주시기 바랍니다.
2. 신청 시 성함, 결제 일자, 환불 사유를 기재해 주십시오.

부칙
본 정책은 2024년 12월 31일부터 시행됩니다.`
    }
};

export default function PolicyModal({ isOpen, onClose, policyId, theme = "white" }: PolicyModalProps) {
    const data = POLICY_DATA[policyId];
    const colors = {
        bg: theme === "black" ? "#111" : "#ffffff",
        text: theme === "black" ? "#eee" : "#222",
        headerBg: theme === "black" ? "#1a1a1a" : "#f8f9fa",
        border: theme === "black" ? "#333" : "#e9ecef",
        accent: "#4f46e5"
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl h-full md:h-auto md:max-h-[85vh] overflow-hidden rounded-none md:rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col"
                style={{ background: colors.bg, color: colors.text }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: colors.border, background: colors.headerBg }}>
                    <h2 className="text-lg font-bold tracking-tight">{data.title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Area - FIXED HEIGHT & SCROLL */}
                <div
                    className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-white dark:bg-[#111]"
                    style={{
                        scrollBehavior: "smooth"
                    }}
                >
                    <div
                        className="prose prose-sm max-w-none"
                        style={{
                            color: colors.text,
                            fontSize: "15px",
                            lineHeight: "1.9",
                            fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
                            wordBreak: "keep-all"
                        }}
                    >
                        {/* 정책 내용 렌더링: 제목 강조 및 문단 간격 처리 */}
                        {data.content.split('\n').map((line, i) => {
                            const trimLine = line.trim();

                            // 1. 중요 강조 ([중요], 🚨, ** 포함 시)
                            const isImportant = trimLine.includes('[중요]') || trimLine.includes('⚠️') || trimLine.includes('🚨') || trimLine.startsWith('**');

                            // 2. 조항 제목 감지 (제n조, n., 가. 등)
                            const isHeader = /^제\s*\d+\s*조/.test(trimLine) || /^\d+\./.test(trimLine) || /^[가-힣]\./.test(trimLine) || trimLine.startsWith("부칙");

                            // 3. 볼드 텍스트 수동 처리
                            const processedLine = trimLine
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\[중요\]/g, '<span style="color: #ef4444; font-weight: 800;">[중요]</span>');

                            if (!trimLine && i !== 0) return <div key={i} className="h-6" />;

                            return (
                                <div
                                    key={i}
                                    className={`
                                        mb-3
                                        ${isImportant ? 'text-blue-700 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded' : ''}
                                        ${line.includes('환불') || line.includes('결제') || line.includes('이용료') || line.includes('청약철회') ? 'font-bold' : ''}
                                        ${isHeader ? 'font-black text-[18px] mt-12 mb-6 text-gray-950 dark:text-gray-50 border-b-2 pb-2' : ''}
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

                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 12px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: ${theme === "black" ? "#0a0a0a" : "#f1f3f5"};
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: ${theme === "black" ? "#444" : "#adb5bd"};
                        border-radius: 6px;
                        border: 3px solid ${theme === "black" ? "#0a0a0a" : "#f1f3f5"};
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: ${theme === "black" ? "#666" : "#868e96"};
                    }
                `}</style>

                {/* Footer */}
                <div className="p-4 border-t text-center bg-gray-50 dark:bg-gray-900" style={{ borderColor: colors.border }}>
                    <button
                        onClick={onClose}
                        className="px-16 py-3.5 bg-[#4f46e5] text-white rounded-lg font-bold hover:bg-[#4338ca] transition-all shadow-lg active:scale-95"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}

