"use client";

import { useRouter } from "next/navigation";

interface AdminLoginProps {
    effectiveArtistId: string;
    password: string;
    setPassword: (v: string) => void;
    passwordError: boolean;
    handleLogin: () => void;
}

export default function AdminLogin({
    effectiveArtistId,
    password,
    setPassword,
    passwordError,
    handleLogin
}: AdminLoginProps) {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold text-center mb-2">관리자 로그인</h1>
                <p className="text-gray-500 text-center mb-8">테넌트 식별 ID: <span className="font-mono text-indigo-600">{effectiveArtistId}</span></p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="비밀번호 입력"
                    className="w-full p-4 text-lg border-2 rounded-xl mb-4 focus:border-indigo-500 outline-none"
                    style={{ borderColor: passwordError ? "#dc2626" : "#e5e7eb" }}
                />
                {passwordError && <p className="text-red-500 text-sm text-center mb-4">비밀번호가 틀렸습니다</p>}
                <button onClick={handleLogin} className="w-full p-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition">로그인</button>
                <button onClick={() => router.push("/")} className="w-full mt-4 text-gray-500 text-sm underline">메인으로 돌아가기</button>
            </div>
        </div>
    );
}
