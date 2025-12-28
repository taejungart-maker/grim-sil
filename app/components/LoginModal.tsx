"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    returnPath?: string;
}

export default function LoginModal({ isOpen, onClose, onSuccess, returnPath }: LoginModalProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setPassword("");
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const success = await login(password);

            if (success) {
                // 로그인 성공
                if (onSuccess) onSuccess();
                onClose();

                // 현재 페이지 유지 (returnPath가 있으면 그곳으로, 없으면 새로고침)
                if (returnPath) {
                    router.push(returnPath);
                } else {
                    router.refresh();
                }
            } else {
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

    return (
        <>
            {/* 배경 오버레이 */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9998,
                    animation: 'fadeIn 0.2s ease'
                }}
            />

            {/* 모달 */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                maxWidth: '400px',
                width: '90%',
                background: '#ffffff',
                borderRadius: '24px',
                padding: '32px 24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                animation: 'slideUp 0.3s ease'
            }}>
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#bbb',
                        padding: '8px'
                    }}
                >
                    ×
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '24px'
                    }}>
                        🔐
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#1a1a1a' }}>
                        작가 인증 필요
                    </h2>
                    <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
                        이 기능은 작가 본인만 사용할 수 있습니다.<br />
                        관리자 비밀번호를 입력해주세요.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호"
                        disabled={isLoading}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            fontSize: '15px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            marginBottom: error ? '12px' : '20px',
                            outline: 'none',
                            background: '#fafafa'
                        }}
                    />

                    {error && (
                        <div style={{
                            padding: '12px',
                            marginBottom: '16px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#dc2626',
                            fontSize: '13px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#fff',
                            background: isLoading || !password ? '#94a3b8' : '#1a1a1a',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: isLoading || !password ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? '인증 중...' : '로그인'}
                    </button>
                </form>

                <div style={{
                    textAlign: 'center',
                    marginTop: '20px',
                }}>
                    <a
                        href="/forgot-password"
                        style={{
                            fontSize: '13px',
                            color: '#6366f1',
                            textDecoration: 'none',
                            fontWeight: 500,
                        }}
                    >
                        비밀번호를 잊으셨나요?
                    </a>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -40%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
            `}</style>
        </>
    );
}
