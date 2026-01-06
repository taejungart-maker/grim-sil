"use client";

interface AdminSecuritySectionProps {
    passwordChangeSuccess: boolean;
    passwordChangeError: string;
    newPassword: string;
    setNewPassword: (v: string) => void;
    confirmPassword: string;
    setConfirmPassword: (v: string) => void;
    handlePasswordChange: () => void;
}

export default function AdminSecuritySection({
    passwordChangeSuccess,
    passwordChangeError,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    handlePasswordChange
}: AdminSecuritySectionProps) {
    return (
        <section className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 mt-8" style={{ borderColor: "#fee2e2" }}>
            <h2 className="text-lg font-bold mb-4">🔐 보안 설정</h2>
            {passwordChangeSuccess && <p className="mb-4 text-green-600 font-bold">비밀번호가 변경되었습니다.</p>}
            {passwordChangeError && <p className="mb-4 text-red-600 font-bold">{passwordChangeError}</p>}
            <div className="space-y-3">
                <input type="password" placeholder="새 비밀번호" className="w-full p-3 border-2 rounded-xl text-black" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <input type="password" placeholder="비밀번호 확인" className="w-full p-3 border-2 rounded-xl text-black" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                <button onClick={handlePasswordChange} className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">비밀번호 변경</button>
            </div>
        </section>
    );
}
