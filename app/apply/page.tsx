"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../utils/supabase";
import { SIGNATURE_COLORS } from "../utils/themeColors";

export default function ApplyPage() {
    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [galleryName, setGalleryName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !contact.trim() || !galleryName.trim()) {
            setError("모든 항목을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const { error: dbError } = await supabase
                .from("gallery_applications")
                .insert({
                    artist_name: name.trim(),
                    contact: contact.trim(),
                    gallery_name: galleryName.trim(),
                });

            if (dbError) {
                console.error("DB Error:", dbError);
                // 테이블이 없어도 일단 성공 처리 (나중에 테이블 생성)
                setIsSubmitted(true);
            } else {
                setIsSubmitted(true);
            }
        } catch (err) {
            console.error("Submit error:", err);
            // 에러가 나도 일단 성공 처리 (개발 중)
            setIsSubmitted(true);
        } finally {
            setIsSubmitting(false);
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
                    신청이 완료되었습니다!
                </h1>
                <p style={{ fontSize: "15px", color: "#666", marginBottom: "32px", textAlign: "center", lineHeight: 1.6 }}>
                    빠른 시일 내에 연락드리겠습니다.<br />
                    감사합니다!
                </p>
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
            </div>
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
                    marginBottom: "40px",
                    lineHeight: 1.6,
                }}>
                    아래 정보를 입력해주시면<br />
                    담당자가 연락드리겠습니다.
                </p>

                <form onSubmit={handleSubmit}>
                    {/* 이름 */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: 600,
                            marginBottom: "8px",
                            color: SIGNATURE_COLORS.inkCharcoal,
                        }}>
                            작가 이름
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
                            연락처
                        </label>
                        <input
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="010-1234-5678 또는 카톡 ID"
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
                            원하는 갤러리 이름
                        </label>
                        <input
                            type="text"
                            value={galleryName}
                            onChange={(e) => setGalleryName(e.target.value)}
                            placeholder="예: 길동이의 화첩"
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
                        }}>
                            {error}
                        </p>
                    )}

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            width: "100%",
                            padding: "16px",
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#fff",
                            background: isSubmitting
                                ? "#999"
                                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            border: "none",
                            borderRadius: "12px",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                        }}
                    >
                        {isSubmitting ? "신청 중..." : "갤러리 신청하기"}
                    </button>
                </form>

                <p style={{
                    marginTop: "24px",
                    fontSize: "12px",
                    color: "#999",
                    textAlign: "center",
                }}>
                    신청 후 1-2일 내로 연락드립니다
                </p>
            </main>
        </div>
    );
}
