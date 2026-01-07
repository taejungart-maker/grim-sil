"use client";

import CancelSubscriptionButton from "../CancelSubscriptionButton";

interface AdminSecuritySectionProps {
    passwordChangeSuccess: boolean;
    passwordChangeError: string;
    newPassword: string;
    setNewPassword: (v: string) => void;
    confirmPassword: string;
    setConfirmPassword: (v: string) => void;
    handlePasswordChange: () => void;
    theme?: "white" | "black";
}

export default function AdminSecuritySection({
    passwordChangeSuccess,
    passwordChangeError,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    handlePasswordChange,
    theme = "white"
}: AdminSecuritySectionProps) {
    return (
        <>
            {/* 비밀번호 변경 섹션 */}
            <section className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 mt-8" style={{ borderColor: "#fee2e2" }}>
                <h2 className="text-lg font-bold mb-4">🔐 비밀번호 변경</h2>
                {passwordChangeSuccess && <p className="mb-4 text-green-600 font-bold">비밀번호가 변경되었습니다.</p>}
                {passwordChangeError && <p className="mb-4 text-red-600 font-bold">{passwordChangeError}</p>}
                <div className="space-y-3">
                    <input type="password" placeholder="새 비밀번호" className="w-full p-3 border-2 rounded-xl text-black" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <input type="password" placeholder="비밀번호 확인" className="w-full p-3 border-2 rounded-xl text-black" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    <button onClick={handlePasswordChange} className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">비밀번호 변경</button>
                </div>
            </section>

            {/* 구독 취소 섹션 - 비밀번호 변경과 동일한 스타일 */}
            <section className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 mt-4" style={{ borderColor: "#fee2e2" }}>
                <h2 className="text-lg font-bold mb-4">📛 구독 관리</h2>
                <p className="text-sm text-gray-600 mb-4">
                    구독을 취소하시면 VIP 프리미엄 기능이 즉시 중단됩니다.
                </p>
                <CancelSubscriptionButton theme={theme} />
            </section>
        </>
    );
}
