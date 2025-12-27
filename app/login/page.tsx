"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyPassword } from "../utils/settingsDb";
import { setAuthSession, isAuthenticated } from "../utils/auth";
import { loadSettings } from "../utils/settingsDb";
import { defaultSiteConfig } from "../config/site";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState(defaultSiteConfig);

    // 이미 인증된 경우 리다이렉트
    useEffect(() => {
        if (isAuthenticated()) {
            const redirect = searchParams.get("redirect") || "/";
            router.push(redirect);
        }

        // 설정 로드
        loadSettings().then(setSettings);
    }, [router, searchParams]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // 비밀번호 검증
            const isValid = await verifyPassword(password);

            if (isValid) {
                // 인증 성공 - 세션 저장
                setAuthSession(password);

                // 리다이렉트 URL 가져오기 (기본값: /)
                const redirect = searchParams.get("redirect") || "/";
                router.push(redirect);
            } else {
                // 인증 실패
                setError("비밀번호가 올바르지 않습니다.");
                setPassword("");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("로그인 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const bgColor = settings.theme === "black" ? "#000000" : "#ffffff";
    const textColor = settings.theme === "black" ? "#ffffff" : "#000000";
    const borderColor = settings.theme === "black" ? "#333333" : "#e0e0e0";
    const inputBg = settings.theme === "black" ? "#1a1a1a" : "#fafafa";

    return (
        <div
            style={{
                minHeight: "100vh",
                background: bgColor,
                color: textColor,
                fontFamily: "'Noto Sans KR', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "400px",
                }}
            >
                {/* 헤더 */}
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <h1
                        style={{
                            fontSize: "24px",
                            fontWeight: 700,
                            marginBottom: "8px",
                            letterSpacing: "0.05em",
                        }}
                    >
                        {settings.galleryNameKo}
                    </h1>
                    <p style={{ fontSize: "14px", color: "#888", letterSpacing: "0.1em" }}>
                        관리자 로그인
                    </p>
                </div>

                {/* 로그인 폼 */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "24px" }}>
                        <label
                            htmlFor="password"
                            style={{
                                display: "block",
                                fontSize: "13px",
                                fontWeight: 500,
                                marginBottom: "8px",
                                color: "#666",
                                letterSpacing: "0.05em",
                            }}
                        >
                            비밀번호
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="관리자 비밀번호를 입력하세요"
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                fontSize: "15px",
                                border: `1px solid ${borderColor}`,
                                borderRadius: "6px",
                                background: inputBg,
                                color: textColor,
                                outline: "none",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = settings.theme === "black" ? "#555" : "#999";
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = borderColor;
                            }}
                        />
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div
                            style={{
                                padding: "12px 16px",
                                marginBottom: "24px",
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "6px",
                                color: "#ef4444",
                                fontSize: "13px",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {/* 로그인 버튼 */}
                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        style={{
                            width: "100%",
                            padding: "14px",
                            fontSize: "15px",
                            fontWeight: 600,
                            color: settings.theme === "black" ? "#000" : "#fff",
                            background: settings.theme === "black" ? "#fff" : "#1a1a1a",
                            border: "none",
                            borderRadius: "6px",
                            cursor: isLoading || !password ? "not-allowed" : "pointer",
                            opacity: isLoading || !password ? 0.5 : 1,
                            transition: "opacity 0.2s",
                            letterSpacing: "0.05em",
                        }}
                    >
                        {isLoading ? "로그인 중..." : "로그인"}
                    </button>
                </form>

                {/* 갤러리로 돌아가기 */}
                <div style={{ marginTop: "32px", textAlign: "center" }}>
                    <Link
                        href="/"
                        style={{
                            fontSize: "13px",
                            color: "#888",
                            textDecoration: "none",
                            letterSpacing: "0.05em",
                        }}
                    >
                        ← 갤러리로 돌아가기
                    </Link>
                </div>

                {/* 안내 메시지 */}
                <div
                    style={{
                        marginTop: "48px",
                        padding: "16px",
                        background: settings.theme === "black" ? "#1a1a1a" : "#f5f5f5",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#888",
                        lineHeight: "1.6",
                    }}
                >
                    <p style={{ margin: 0 }}>
                        관리자만 작품을 추가하고 수정할 수 있습니다.
                        <br />
                        비밀번호를 잊으셨다면 관리자 페이지에서 변경하세요.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <div style={{ textAlign: "center", color: "#666" }}>
                    로딩 중...
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
