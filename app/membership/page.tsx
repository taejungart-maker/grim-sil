"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePayment } from "../contexts/PaymentContext";
import PaymentModal from "../components/PaymentModal";

export default function MembershipPage() {
    const router = useRouter();
    const { isPaid } = usePayment();
    const [showModal, setShowModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

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
                    {isPaid && (
                        <span style={{ fontSize: '14px', color: '#6366f1', fontWeight: 600 }}>
                            멤버십 활성 상태
                        </span>
                    )}
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
                        💳 시연용 결제 시스템
                    </h3>
                    <p style={{
                        fontSize: "14px",
                        color: "#666",
                        lineHeight: "1.6",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        marginBottom: "8px"
                    }}>
                        시연을 위해 카드번호에 <strong>4242</strong>를 입력하면 가상 승인 처리됩니다.
                    </p>
                    <p style={{
                        fontSize: "14px",
                        color: "#666",
                        lineHeight: "1.6",
                        fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                        • 테스트 결제 지원<br />
                        • 즉시 가입 확인 가능
                    </p>
                </div>

                {/* 구독 버튼 */}
                <button
                    onClick={() => setShowModal(true)}
                    disabled={isPaid}
                    style={{
                        width: "100%",
                        padding: "18px",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#fff",
                        background: isPaid ? "#94a3b8" : "#1a1a1a",
                        border: "none",
                        borderRadius: "12px",
                        cursor: isPaid ? "not-allowed" : "pointer",
                        fontFamily: "'Noto Sans KR', sans-serif",
                    }}
                >
                    {isPaid ? "이미 구독 중입니다" : "구독하기"}
                </button>

                <p style={{
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#999",
                    marginTop: "16px",
                    fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                    시연을 위한 가상 결제 시스템입니다.
                </p>
            </main>

            <PaymentModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    alert("멤버십 구독이 성공적으로 완료되었습니다!");
                    window.location.reload();
                }}
            />
        </div>
    );
}
