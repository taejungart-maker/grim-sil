/**
 * 첫 로그인 비밀번호 변경 강제 팝업
 * - VIP 사용자 첫 접속 시 자동 표시
 * - 임시 비밀번호 → 본인 비밀번호 변경
 */

"use client";

import { useState } from "react";

interface FirstLoginPasswordChangeProps {
    artistId: string;
    onPasswordChanged: () => void;
    onClose: () => void;
}

export default function FirstLoginPasswordChange({
    artistId,
    onPasswordChanged,
    onClose,
}: FirstLoginPasswordChangeProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChanging, setIsChanging] = useState(false);
    const [error, setError] = useState("");

    const handleChangePassword = async () => {
        setError("");

        // 유효성 검사
        if (newPassword.length < 4) {
            setError("비밀번호는 4자 이상이어야 합니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsChanging(true);

        try {
            // API 호출: 비밀번호 변경
            const response = await fetch("/api/password/change", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    artist_id: artistId,
                    new_password: newPassword,
                }),
            });

            if (!response.ok) {
                throw new Error("비밀번호 변경 실패");
            }

            alert("비밀번호가 성공적으로 변경되었습니다!");
            onPasswordChanged();
        } catch (err: any) {
            setError(err.message || "비밀번호 변경 중 오류가 발생했습니다.");
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: "20px",
            }}
        >
            <div
                style={{
                    background: "#fff",
                    borderRadius: "24px",
                    padding: "40px",
                    maxWidth: "500px",
                    width: "100%",
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "32px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "48px",
                            marginBottom: "16px",
                        }}
                    >
                        🔐
                    </div>
                    <h2
                        style={{
                            fontSize: "24px",
                            fontWeight: 800,
                            marginBottom: "8px",
                            color: "#1a1a1a",
                        }}
                    >
                        비밀번호 변경 필수
                    </h2>
                    <p
                        style={{
                            fontSize: "15px",
                            color: "#666",
                            lineHeight: 1.6,
                        }}
                    >
                        보안을 위해 임시 비밀번호를<br />
                        본인만의 비밀번호로 변경해주세요.
                    </p>
                </div>

                {error && (
                    <div
                        style={{
                            padding: "12px 16px",
                            background: "#fef2f2",
                            border: "2px solid #dc2626",
                            borderRadius: "12px",
                            color: "#dc2626",
                            fontSize: "14px",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: "20px" }}>
                    <label
                        style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: 600,
                            marginBottom: "8px",
                            color: "#1a1a1a",
                        }}
                    >
                        새 비밀번호
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="4자 이상 입력"
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            fontSize: "16px",
                            border: "2px solid #e5e7eb",
                            borderRadius: "12px",
                            outline: "none",
                        }}
                        onFocus={(e) => {
                            e.target.style.border = "2px solid #6366f1";
                        }}
                        onBlur={(e) => {
                            e.target.style.border = "2px solid #e5e7eb";
                        }}
                    />
                </div>

                <div style={{ marginBottom: "32px" }}>
                    <label
                        style={{
                            display: "block",
                            fontSize: "14px",
                            fontWeight: 600,
                            marginBottom: "8px",
                            color: "#1a1a1a",
                        }}
                    >
                        비밀번호 확인
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="다시 한 번 입력"
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            fontSize: "16px",
                            border: "2px solid #e5e7eb",
                            borderRadius: "12px",
                            outline: "none",
                        }}
                        onFocus={(e) => {
                            e.target.style.border = "2px solid #6366f1";
                        }}
                        onBlur={(e) => {
                            e.target.style.border = "2px solid #e5e7eb";
                        }}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                handleChangePassword();
                            }
                        }}
                    />
                </div>

                <button
                    onClick={handleChangePassword}
                    disabled={isChanging}
                    style={{
                        width: "100%",
                        padding: "16px",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#fff",
                        background: isChanging ? "#9ca3af" : "#6366f1",
                        border: "none",
                        borderRadius: "12px",
                        cursor: isChanging ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        if (!isChanging) {
                            e.currentTarget.style.background = "#4f46e5";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isChanging) {
                            e.currentTarget.style.background = "#6366f1";
                        }
                    }}
                >
                    {isChanging ? "변경 중..." : "비밀번호 변경"}
                </button>

                <p
                    style={{
                        marginTop: "16px",
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#9ca3af",
                    }}
                >
                    이 단계는 건너뛸 수 없습니다
                </p>
            </div>
        </div>
    );
}
