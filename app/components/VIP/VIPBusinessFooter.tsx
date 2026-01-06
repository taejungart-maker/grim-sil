"use client";

import Link from "next/link";
import { YearMonthKey } from "../../data/artworks";

interface VIPBusinessFooterProps {
    theme: string;
    galleryNameKo: string;
    borderColor: string;
    setPolicyModal: (modal: { isOpen: boolean; policyId: "terms" | "privacy" | "refund" | "exchange" }) => void;
}

export default function VIPBusinessFooter({ theme, galleryNameKo, borderColor, setPolicyModal }: VIPBusinessFooterProps) {
    return (
        <footer
            style={{
                padding: "48px 24px 24px",
                textAlign: "center",
                borderTop: `1px solid ${borderColor}`,
                background: theme === "black" ? "#111" : "rgba(194, 188, 178, 0.1)",
            }}
        >
            <p
                style={{
                    fontSize: "14px",
                    color: theme === "black" ? "#888" : "#666",
                    marginBottom: "16px",
                    fontFamily: "'Noto Sans KR', sans-serif",
                }}
            >
                이 갤러리가 마음에 드셨나요?
            </p>
            <Link
                href="/apply"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 28px",
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "#fff",
                    borderRadius: "50px",
                    textDecoration: "none",
                    fontSize: "15px",
                    fontWeight: 700,
                    fontFamily: "'Noto Sans KR', sans-serif",
                    boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                    transition: "transform 0.2s ease",
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                나도 갤러리 만들기
            </Link>
            <p
                style={{
                    marginTop: "16px",
                    fontSize: "12px",
                    color: theme === "black" ? "#555" : "#999",
                    fontFamily: "'Noto Sans KR', sans-serif",
                }}
            >
                작가님만의 온라인 Gallery를 만들어보세요
            </p>

            {/* 사업자 정보 및 정책 (PG 심사 필수) */}
            <div
                style={{
                    marginTop: "48px",
                    paddingTop: "32px",
                    borderTop: `1px solid ${borderColor}`,
                    fontSize: "13px",
                    color: theme === "black" ? "#666" : "#888",
                    lineHeight: 1.9,
                    fontFamily: "'Noto Sans KR', sans-serif",
                }}
            >
                <div style={{ marginBottom: "20px" }}>
                    <div style={{ marginBottom: "6px", fontWeight: 600, fontSize: "14px" }}>
                        <strong>상호:</strong> 태정
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                        <strong>대표자:</strong> 오용택
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                        <strong>사업자등록번호:</strong> 205-53-72177
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                        <strong>통신판매업 신고:</strong> 제2025-서울중구-XXXX호 (신고 예정)
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                        <strong>주소:</strong> 서울특별시 중구 동호로11바길 34, 101호(신당동)
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                        <strong>대표전화:</strong> 010-8618-3323
                    </div>
                    <div>
                        <strong>이메일:</strong> artflow010@gmail.com
                    </div>
                </div>

                <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px" }}>
                    <button onClick={() => setPolicyModal({ isOpen: true, policyId: "terms" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>이용약관</button>
                    <span style={{ margin: "0 4px", opacity: 0.3 }}>|</span>
                    <button onClick={() => setPolicyModal({ isOpen: true, policyId: "privacy" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>개인정보처리방침</button>
                    <span style={{ margin: "0 4px", opacity: 0.3 }}>|</span>
                    <button onClick={() => setPolicyModal({ isOpen: true, policyId: "refund" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>환불 정책</button>
                    <span style={{ margin: "0 4px", opacity: 0.3 }}>|</span>
                    <button onClick={() => setPolicyModal({ isOpen: true, policyId: "exchange" })} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontSize: "12px" }}>교환 정책</button>
                </div>

                <div style={{ fontSize: "12px", opacity: 0.5 }}>
                    &copy; 2024-{new Date().getFullYear()} {galleryNameKo}. All rights reserved.
                </div>
                {/* [RECOVERY_TAG] Ver. 1.1.5 (Aesthetic Final Stability) */}
                <div style={{ marginTop: "12px", opacity: 0.3, fontSize: "10px" }}>
                    v1.1.5 (Aesthetic Final Stability)
                </div>
            </div>

            {/* 결제 및 구매 안내 */}
            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: `1px solid ${borderColor}`, textAlign: "center" }}>
                <div style={{ marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
                    결제 안내
                </div>
                <div style={{ fontSize: "12px", color: theme === "black" ? "#777" : "#999", lineHeight: 1.6 }}>
                    본 서비스는 월 20,000원의 구독 서비스입니다. 결제는 Port One을 통해 안전하게 처리됩니다.
                    <br />
                    결제 시 <button onClick={() => setPolicyModal({ isOpen: true, policyId: "terms" })} style={{ textDecoration: 'underline', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>이용약관</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "privacy" })} style={{ textDecoration: 'underline', color: 'inherit' }}>개인정보방침</button>, <button onClick={() => setPolicyModal({ isOpen: true, policyId: "refund" })} style={{ textDecoration: 'underline', color: 'inherit' }}>환불 정책</button> 및 <button onClick={() => setPolicyModal({ isOpen: true, policyId: "exchange" })} style={{ textDecoration: 'underline', color: 'inherit' }}>교환 정책</button>에 동의한 것으로 간주됩니다.
                    <br />
                    구독 취소 시 위약금 없이 즉시 해지 가능하며, 남은 기간에 대한 부분 환불은 이용약관에 따릅니다.
                </div>
            </div>
        </footer>
    );
}
