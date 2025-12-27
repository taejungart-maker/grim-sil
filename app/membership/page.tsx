"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MembershipPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white">
            {/* 헤더 */}
            <header
                className="sticky top-0 z-30 bg-white border-b"
                style={{ padding: "20px 24px" }}
            >
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push("/")}
                        style={{
                            padding: "8px 16px",
                            fontSize: "14px",
                            fontWeight: 500,
                            background: "#f3f4f6",
                            color: "#2a2a2a",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontFamily: "'Noto Sans KR', sans-serif",
                        }}
                    >
                        ← 돌아가기
                    </button>
                </div>
            </header>

            {/* 멤버십 안내 */}
            <main className="max-w-2xl mx-auto px-6 py-12">
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <span style={{ fontSize: "48px", marginBottom: "16px", display: "block" }}>👑</span>
                    <h1 style={{
                        fontSize: "32px",
                        fontWeight: 700,
                        marginBottom: "12px",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: "#2a2a2a"
                    }}>
                        프리미엄 멤버십
                    </h1>
                    <p style={{ fontSize: "16px", color: "#666", fontFamily: "'Noto Sans KR', sans-serif" }}>
                        작가님의 작품 세계를 더 깊이 경험하세요
                    </p>
                </div>

                {/* 가격 */}
                <div
                    style={{
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        color: "#fff",
                        padding: "32px",
                        borderRadius: "16px",
                        textAlign: "center",
                        marginBottom: "32px",
                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                    }}
                >
                    <p style={{ fontSize: "18px", marginBottom: "8px", opacity: 0.9, fontFamily: "'Noto Sans KR', sans-serif" }}>월 구독료</p>
                    <p style={{ fontSize: "48px", fontWeight: 700, fontFamily: "'Noto Sans KR', sans-serif" }}>₩20,000</p>
                    <p style={{ fontSize: "14px", opacity: 0.8, fontFamily: "'Noto Sans KR', sans-serif" }}>부가세 포함</p>
                </div>

                {/* 혜택 */}
                <div style={{ marginBottom: "32px" }}>
                    <h2 style={{
                        fontSize: "20px",
                        fontWeight: 600,
                        marginBottom: "16px",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: "#2a2a2a"
                    }}>
                        멤버십 혜택
                    </h2>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        {[
                            "🎨 신작 작품 우선 공개",
                            "📚 작가 노트 및 제작 과정 공유",
                            "💬 작가와의 1:1 대화 기회",
                            "🎁 월 1회 한정판 디지털 아트 제공",
                            "🏛️ 오프라인 전시회 초대권",
                        ].map((benefit, index) => (
                            <li
                                key={index}
                                style={{
                                    padding: "12px 0",
                                    borderBottom: "1px solid #eee",
                                    fontSize: "15px",
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                    color: "#2a2a2a",
                                }}
                            >
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 결제 시스템 안내 */}
                <div style={{
                    background: "#f9fafb",
                    padding: "24px",
                    borderRadius: "12px",
                    marginBottom: "24px",
                    border: "1px solid #e5e7eb"
                }}>
                    <h3 style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        marginBottom: "12px",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: "#2a2a2a"
                    }}>
                        💳 결제 시스템 준비 중
                    </h3>
                    <p style={{
                        fontSize: "14px",
                        color: "#666",
                        lineHeight: "1.6",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        marginBottom: "8px"
                    }}>
                        포트원(PortOne) API를 통한 안전한 결제 시스템을 준비하고 있습니다.
                    </p>
                    <p style={{
                        fontSize: "14px",
                        color: "#666",
                        lineHeight: "1.6",
                        fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                        • 카카오페이<br />
                        • 신용/체크카드<br />
                        • 간편결제
                    </p>
                </div>

                {/* 구독 버튼 (준비 중) */}
                <button
                    disabled
                    style={{
                        width: "100%",
                        padding: "18px",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#fff",
                        background: "#ccc",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "not-allowed",
                        fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                >
                    곧 오픈 예정입니다
                </button>

                <p style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#999",
                    marginTop: "16px",
                    fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                    결제 시스템이 준비되는 대로 바로 알려드리겠습니다!
                </p>
            </main>
        </div>
    );
}
