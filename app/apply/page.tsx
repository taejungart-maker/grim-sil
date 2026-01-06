"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as PortOne from "@portone/browser-sdk/v2";
import { SIGNATURE_COLORS } from "../utils/themeColors";

export default function ApplyPage() {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [galleryName, setGalleryName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Port One SDK 로드 확인
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.PortOne) {
            console.warn('Port One SDK not loaded yet');
        }
    }, []);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !contact.trim() || !galleryName.trim()) {
            setError("모든 항목을 입력해주세요.");
            return;
        }

        setIsProcessing(true);
        setError("");

        try {
            // 환경변수 확인
            const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
            const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_ID;

            console.log('Store ID:', storeId);
            console.log('Channel Key:', channelKey);

            if (!storeId || !channelKey) {
                setError("결제 시스템 설정이 완료되지 않았습니다. 관리자에게 문의하세요.");
                setIsProcessing(false);
                return;
            }

            // Port One 결제 요청
            const response = await PortOne.requestPayment({
                storeId: storeId,
                channelKey: channelKey,
                paymentId: `gallery-${Date.now()}`,
                orderName: `온라인 갤러리 월 구독 - ${galleryName}`,
                totalAmount: 29000,
                currency: "CURRENCY_KRW",
                payMethod: "EASY_PAY",
                customer: {
                    fullName: name.trim(),
                    phoneNumber: contact.trim(),
                },
                customData: {
                    galleryName: galleryName.trim(),
                },
            });

            console.log("결제 응답:", response);

            if (response?.code != null) {
                // 결제 실패
                setError(`결제 실패: ${response.message}`);
                setIsProcessing(false);
                return;
            }

            // 결제 성공
            console.log("✅ 결제 성공:", response?.paymentId);
            setIsSubmitted(true);

        } catch (err: any) {
            console.error("결제 오류:", err);
            setError(err.message || "결제 처리 중 오류가 발생했습니다.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isSubmitted) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                background: SIGNATURE_COLORS.agingPaper,
                fontFamily: "'Noto Sans KR', sans-serif",
            }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px",
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: SIGNATURE_COLORS.inkCharcoal }}>
                    결제가 완료되었습니다! 🎉
                </h1>
                <p style={{ fontSize: "15px", color: "#666", marginBottom: "32px", textAlign: "center", lineHeight: 1.6 }}>
                    갤러리가 생성 중입니다.<br />
                    2-3분 후 입력하신 연락처로<br />
                    <strong>갤러리 링크</strong>와 <strong>임시 비밀번호(123456)</strong>를<br />
                    문자로 발송해드립니다.
                </p>
                <div style={{
                    padding: "16px 24px",
                    background: "#fef3c7",
                    borderRadius: "12px",
                    marginBottom: "32px",
                    border: "2px solid #fbbf24",
                }}>
                    <p style={{ fontSize: "14px", color: "#92400e", margin: 0 }}>
                        💡 <strong>첫 로그인 시</strong> 비밀번호를 반드시 변경해주세요!
                    </p>
                </div>
                <Link
                    href="/"
                    style={{
                        padding: "14px 32px",
                        background: SIGNATURE_COLORS.antiqueBurgundy,
                        color: "#fff",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontSize: "15px",
                        fontWeight: 600,
                    }}
                >
                    갤러리로 돌아가기
                </Link>
            </div >
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: SIGNATURE_COLORS.agingPaper,
            fontFamily: "'Noto Sans KR', sans-serif",
        }}>
            {/* 헤더 */}
            <header style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${SIGNATURE_COLORS.sandGray}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <Link href="/" style={{ textDecoration: "none", color: SIGNATURE_COLORS.inkCharcoal }}>
                    ← 돌아가기
                </Link>
            </header>

            {/* 메인 */}
            <main style={{
                maxWidth: "480px",
                margin: "0 auto",
                padding: "48px 24px",
            }}>
                <h1 style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    marginBottom: "12px",
                    color: SIGNATURE_COLORS.inkCharcoal,
                    letterSpacing: "-0.02em",
                }}>
                    나만의 갤러리 만들기
                </h1>
                <p style={{
                    fontSize: "15px",
                    color: "#666",
                    marginBottom: "24px",
                    lineHeight: 1.6,
                }}>
                    월 29,000원으로 나만의<br />
                    온라인 갤러리를 시작하세요!
                </p>

                {/* 결제 안내 */}
                <div style={{
                    padding: "20px",
                    background: "#f0f9ff",
                    borderRadius: "12px",
                    marginBottom: "32px",
                    border: "2px solid #3b82f6",
                }}>
                    <h3 style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        marginBottom: "12px",
                        color: "#1e40af",
                    }}>
                        💳 결제 후 즉시 사용 가능!
                    </h3>
                    <ul style={{
                        margin: 0,
                        paddingLeft: "20px",
                        fontSize: "14px",
                        color: "#1e40af",
                        lineHeight: 1.8,
                    }}>
                        <li>결제 완료 후 2-3분 이내 갤러리 생성</li>
                        <li>SMS로 링크 & 비밀번호 발송</li>
                        <li>바로 작품 업로드 시작 가능</li>
                    </ul>
                </div>

                <form onSubmit={handlePayment}>
                    {/* 이름 */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: 600,
                            marginBottom: "8px",
                            color: SIGNATURE_COLORS.inkCharcoal,
                        }}>
                            작가 이름 *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="홍길동"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                fontSize: "16px",
                                border: `1px solid ${SIGNATURE_COLORS.sandGray}`,
                                borderRadius: "8px",
                                outline: "none",
                                background: "#fff",
                            }}
                        />
                    </div>

                    {/* 연락처 */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: 600,
                            marginBottom: "8px",
                            color: SIGNATURE_COLORS.inkCharcoal,
                        }}>
                            연락처 (SMS 받을 번호) *
                        </label>
                        <input
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="010-1234-5678"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                fontSize: "16px",
                                border: `1px solid ${SIGNATURE_COLORS.sandGray}`,
                                borderRadius: "8px",
                                outline: "none",
                                background: "#fff",
                            }}
                        />
                    </div>

                    {/* 갤러리 이름 */}
                    <div style={{ marginBottom: "32px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: 600,
                            marginBottom: "8px",
                            color: SIGNATURE_COLORS.inkCharcoal,
                        }}>
                            원하는 갤러리 이름 *
                        </label>
                        <input
                            type="text"
                            value={galleryName}
                            onChange={(e) => setGalleryName(e.target.value)}
                            placeholder="예: 길동이의 Gallery"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                fontSize: "16px",
                                border: `1px solid ${SIGNATURE_COLORS.sandGray}`,
                                borderRadius: "8px",
                                outline: "none",
                                background: "#fff",
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{
                            color: "#dc2626",
                            fontSize: "14px",
                            marginBottom: "16px",
                            padding: "12px",
                            background: "#fef2f2",
                            borderRadius: "8px",
                            border: "1px solid #dc2626",
                        }}>
                            {error}
                        </p>
                    )}

                    {/* 결제 버튼 */}
                    <button
                        type="submit"
                        disabled={isProcessing}
                        style={{
                            width: "100%",
                            padding: "18px",
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#fff",
                            background: isProcessing
                                ? "#999"
                                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            border: "none",
                            borderRadius: "12px",
                            cursor: isProcessing ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                        }}
                    >
                        {isProcessing ? "결제 진행 중..." : "💳 29,000원 결제하고 시작하기"}
                    </button>
                </form>

                <p style={{
                    marginTop: "24px",
                    fontSize: "12px",
                    color: "#999",
                    textAlign: "center",
                }}>
                    결제 후 언제든지 해지 가능합니다
                </p>
            </main>
        </div>
    );
}
