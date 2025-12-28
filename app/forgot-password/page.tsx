"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { savePassword } from "../utils/settingsDb";
import { SIGNATURE_COLORS } from "../utils/themeColors";

type Step = "phone" | "verify" | "newPassword" | "complete";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [testCode, setTestCode] = useState<string | null>(null);

    // 전화번호 포맷팅 (010-1234-5678)
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    // 인증번호 발송
    const handleSendCode = async () => {
        if (!phone.replace(/-/g, "").match(/^01[0-9]{8,9}$/)) {
            setError("올바른 전화번호를 입력해주세요.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, action: "send" }),
            });

            const data = await response.json();

            if (data.success) {
                setStep("verify");
                if (data.testMode && data.testCode) {
                    setTestCode(data.testCode);
                }
            } else {
                setError(data.message || "인증번호 발송에 실패했습니다.");
            }
        } catch (err) {
            setError("서버 연결에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // 인증번호 확인
    const handleVerifyCode = async () => {
        if (verificationCode.length !== 6) {
            setError("6자리 인증번호를 입력해주세요.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, action: "verify", inputCode: verificationCode }),
            });

            const data = await response.json();

            if (data.success && data.verified) {
                setStep("newPassword");
            } else {
                setError(data.message || "인증번호가 일치하지 않습니다.");
            }
        } catch (err) {
            setError("서버 연결에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    // 새 비밀번호 설정
    const handleSetNewPassword = async () => {
        if (newPassword.length < 4) {
            setError("비밀번호는 4자 이상이어야 합니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await savePassword(newPassword);
            setStep("complete");
        } catch (err) {
            setError("비밀번호 변경에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: SIGNATURE_COLORS.agingPaper,
            fontFamily: "'Noto Sans KR', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
        }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
                background: "#fff",
                borderRadius: "24px",
                padding: "40px 32px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}>
                {/* 헤더 */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: step === "complete"
                            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                            : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        fontSize: "28px",
                    }}>
                        {step === "complete" ? "✓" : "🔐"}
                    </div>
                    <h1 style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: SIGNATURE_COLORS.inkCharcoal,
                        marginBottom: "8px",
                    }}>
                        {step === "phone" && "비밀번호 찾기"}
                        {step === "verify" && "인증번호 입력"}
                        {step === "newPassword" && "새 비밀번호 설정"}
                        {step === "complete" && "비밀번호 변경 완료"}
                    </h1>
                    <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.5 }}>
                        {step === "phone" && "등록된 전화번호로 인증번호를 보내드립니다."}
                        {step === "verify" && "문자로 받은 6자리 인증번호를 입력하세요."}
                        {step === "newPassword" && "새로운 비밀번호를 입력해주세요."}
                        {step === "complete" && "비밀번호가 성공적으로 변경되었습니다."}
                    </p>
                </div>

                {/* 전화번호 입력 단계 */}
                {step === "phone" && (
                    <>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(formatPhone(e.target.value))}
                            placeholder="010-1234-5678"
                            style={{
                                width: "100%",
                                padding: "16px 18px",
                                fontSize: "18px",
                                border: `2px solid ${error ? "#dc2626" : "#e5e7eb"}`,
                                borderRadius: "12px",
                                marginBottom: "16px",
                                outline: "none",
                                textAlign: "center",
                                letterSpacing: "1px",
                            }}
                        />
                        {error && (
                            <p style={{ color: "#dc2626", fontSize: "14px", marginBottom: "16px", textAlign: "center" }}>
                                {error}
                            </p>
                        )}
                        <button
                            onClick={handleSendCode}
                            disabled={isLoading || phone.length < 12}
                            style={{
                                width: "100%",
                                padding: "16px",
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#fff",
                                background: isLoading || phone.length < 12 ? "#94a3b8" : "#4f46e5",
                                border: "none",
                                borderRadius: "12px",
                                cursor: isLoading || phone.length < 12 ? "not-allowed" : "pointer",
                            }}
                        >
                            {isLoading ? "발송 중..." : "인증번호 받기"}
                        </button>
                    </>
                )}

                {/* 인증번호 입력 단계 */}
                {step === "verify" && (
                    <>
                        {testCode && (
                            <div style={{
                                padding: "12px",
                                marginBottom: "16px",
                                background: "#fef3c7",
                                border: "1px solid #f59e0b",
                                borderRadius: "8px",
                                textAlign: "center",
                                fontSize: "14px",
                            }}>
                                <strong>테스트 모드</strong> - 인증번호: <strong>{testCode}</strong>
                            </div>
                        )}
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            style={{
                                width: "100%",
                                padding: "16px 18px",
                                fontSize: "24px",
                                fontWeight: 700,
                                border: `2px solid ${error ? "#dc2626" : "#e5e7eb"}`,
                                borderRadius: "12px",
                                marginBottom: "16px",
                                outline: "none",
                                textAlign: "center",
                                letterSpacing: "8px",
                            }}
                        />
                        {error && (
                            <p style={{ color: "#dc2626", fontSize: "14px", marginBottom: "16px", textAlign: "center" }}>
                                {error}
                            </p>
                        )}
                        <button
                            onClick={handleVerifyCode}
                            disabled={isLoading || verificationCode.length !== 6}
                            style={{
                                width: "100%",
                                padding: "16px",
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#fff",
                                background: isLoading || verificationCode.length !== 6 ? "#94a3b8" : "#4f46e5",
                                border: "none",
                                borderRadius: "12px",
                                cursor: isLoading || verificationCode.length !== 6 ? "not-allowed" : "pointer",
                            }}
                        >
                            {isLoading ? "확인 중..." : "인증하기"}
                        </button>
                        <button
                            onClick={() => { setStep("phone"); setError(""); setVerificationCode(""); setTestCode(null); }}
                            style={{
                                width: "100%",
                                marginTop: "12px",
                                padding: "12px",
                                fontSize: "14px",
                                color: "#666",
                                background: "transparent",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                cursor: "pointer",
                            }}
                        >
                            다시 받기
                        </button>
                    </>
                )}

                {/* 새 비밀번호 설정 단계 */}
                {step === "newPassword" && (
                    <>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호"
                            style={{
                                width: "100%",
                                padding: "16px 18px",
                                fontSize: "16px",
                                border: "2px solid #e5e7eb",
                                borderRadius: "12px",
                                marginBottom: "12px",
                                outline: "none",
                            }}
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 확인"
                            style={{
                                width: "100%",
                                padding: "16px 18px",
                                fontSize: "16px",
                                border: `2px solid ${error ? "#dc2626" : "#e5e7eb"}`,
                                borderRadius: "12px",
                                marginBottom: "16px",
                                outline: "none",
                            }}
                        />
                        {error && (
                            <p style={{ color: "#dc2626", fontSize: "14px", marginBottom: "16px", textAlign: "center" }}>
                                {error}
                            </p>
                        )}
                        <button
                            onClick={handleSetNewPassword}
                            disabled={isLoading || !newPassword || !confirmPassword}
                            style={{
                                width: "100%",
                                padding: "16px",
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#fff",
                                background: isLoading || !newPassword || !confirmPassword ? "#94a3b8" : "#4f46e5",
                                border: "none",
                                borderRadius: "12px",
                                cursor: isLoading || !newPassword || !confirmPassword ? "not-allowed" : "pointer",
                            }}
                        >
                            {isLoading ? "변경 중..." : "비밀번호 변경하기"}
                        </button>
                    </>
                )}

                {/* 완료 단계 */}
                {step === "complete" && (
                    <Link
                        href="/admin"
                        style={{
                            display: "block",
                            width: "100%",
                            padding: "16px",
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "#fff",
                            background: "#10b981",
                            border: "none",
                            borderRadius: "12px",
                            textAlign: "center",
                            textDecoration: "none",
                        }}
                    >
                        로그인하러 가기
                    </Link>
                )}

                {/* 돌아가기 버튼 */}
                {step !== "complete" && (
                    <div style={{ textAlign: "center", marginTop: "24px" }}>
                        <Link
                            href="/admin"
                            style={{
                                fontSize: "14px",
                                color: "#666",
                                textDecoration: "none",
                            }}
                        >
                            ← 로그인으로 돌아가기
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
