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
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [autoLogin, setAutoLogin] = useState(true); // 기본값: 자동 로그인 활성화
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    // 자동 로그인 상태 불러오기
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedAutoLogin = localStorage.getItem('auto_login');
            if (savedAutoLogin !== null) {
                setAutoLogin(savedAutoLogin === 'true');
            }
            // 저장된 휴대폰 번호 불러오기
            const savedPhone = localStorage.getItem('saved_phone');
            if (savedPhone) {
                setPhoneNumber(savedPhone);
            }
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setPassword("");
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // 휴대폰 번호 포맷팅 (010-1234-5678)
    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // 자동 로그인 설정 저장
            if (typeof window !== 'undefined') {
                localStorage.setItem('auto_login', autoLogin.toString());
                if (autoLogin) {
                    localStorage.setItem('saved_phone', phoneNumber);
                }
            }

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

    // 카카오톡 문의 링크 (실제 카카오톡 채널 링크로 변경 가능)
    const handleForgotPassword = () => {
        // 카카오톡 채널 또는 SMS로 연결
        const contactMessage = encodeURIComponent("안녕하세요, 비밀번호를 잊어버려서 연락드립니다.");
        // 카카오톡 채널이 있으면 아래 URL 사용:
        // window.open("https://pf.kakao.com/_xYourChannelId/chat", "_blank");
        // SMS 연결:
        window.location.href = `sms:01012345678?body=${contactMessage}`;
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
                        작가 로그인
                    </h2>
                    <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
                        휴대폰 번호와 비밀번호를 입력해주세요.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* 휴대폰 번호 입력 */}
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="휴대폰 번호 (010-1234-5678)"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            fontSize: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            marginBottom: '12px',
                            outline: 'none',
                            background: '#fafafa'
                        }}
                    />

                    {/* 비밀번호 입력 */}
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
                            fontSize: '16px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            outline: 'none',
                            background: '#fafafa'
                        }}
                    />

                    {/* 자동 로그인 체크박스 - 크게 만들기 */}
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px',
                            cursor: 'pointer',
                            padding: '14px 16px',
                            background: autoLogin ? '#f0fdf4' : '#f9fafb',
                            border: autoLogin ? '2px solid #22c55e' : '2px solid #e5e7eb',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={autoLogin}
                            onChange={(e) => setAutoLogin(e.target.checked)}
                            style={{
                                width: '24px',
                                height: '24px',
                                accentColor: '#22c55e',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: autoLogin ? '#166534' : '#374151'
                        }}>
                            🔒 자동 로그인 (다시 비밀번호 입력 안 해도 됨!)
                        </span>
                    </label>

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
                        disabled={isLoading || !password || !phoneNumber}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#fff',
                            background: isLoading || !password || !phoneNumber ? '#94a3b8' : '#1a1a1a',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: isLoading || !password || !phoneNumber ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                {/* 비밀번호 분실 - 카카오톡/문자 연결 */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '20px',
                }}>
                    <button
                        onClick={handleForgotPassword}
                        style={{
                            fontSize: '14px',
                            color: '#6366f1',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 600,
                            textDecoration: 'underline',
                            padding: '8px 16px'
                        }}
                    >
                        💬 비밀번호를 잊으셨나요? (문자로 문의)
                    </button>
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
