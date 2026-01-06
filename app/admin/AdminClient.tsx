"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminActions } from "../hooks/useAdminActions";

// Components
import AdminLogin from "../components/admin/AdminLogin";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSettingsSection from "../components/admin/AdminSettingsSection";
import AdminContentSection from "../components/admin/AdminContentSection";
import AdminSecuritySection from "../components/admin/AdminSecuritySection";
import KakaoCacheModal from "../components/KakaoCacheModal";

interface AdminClientProps {
    injectedArtistId: string;
}

export default function AdminClient({ injectedArtistId }: AdminClientProps) {
    const searchParams = useSearchParams();
    const vipId = searchParams.get("vipId") || "";
    const effectiveArtistId = vipId || injectedArtistId;

    const {
        isAuthenticated,
        logout,
        settings,
        setSettings,
        isSaving,
        saveSuccess,
        showCacheModal,
        setShowCacheModal,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        passwordChangeError,
        passwordChangeSuccess,
        password,
        setPassword,
        passwordError,
        handleLogin,
        handleSave,
        handlePasswordChange
    } = useAdminActions(effectiveArtistId);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    if (!isMounted) return null;

    if (!isAuthenticated) {
        return (
            <AdminLogin
                effectiveArtistId={effectiveArtistId}
                password={password}
                setPassword={setPassword}
                passwordError={passwordError}
                handleLogin={handleLogin}
            />
        );
    }

    const themeColors = {
        bg: settings.theme === "black" ? "#1a1a1a" : "#ffffff",
        text: settings.theme === "black" ? "#ffffff" : "#1a1a1a",
        border: settings.theme === "black" ? "#333" : "#e5e7eb",
        muted: settings.theme === "black" ? "#a0a0a0" : "#6b7280"
    };

    return (
        <div className="min-h-screen" style={{ background: themeColors.bg, color: themeColors.text }}>
            <AdminHeader
                effectiveArtistId={effectiveArtistId}
                theme={settings.theme}
                isSaving={isSaving}
                handleSave={handleSave}
                borderColor={themeColors.border}
            />

            <main className="max-w-3xl mx-auto p-4 md:p-10 mb-20">
                {saveSuccess && (
                    <div className="p-4 mb-6 bg-green-500 text-white rounded-xl text-center font-bold text-sm md:text-base animate-fade-in">
                        성공적으로 저장되었습니다!
                    </div>
                )}

                <div className="space-y-12">
                    {/* 1. 설정 (기본 정보, SEO, 테마) */}
                    <AdminSettingsSection
                        settings={settings}
                        setSettings={setSettings}
                        borderColor={themeColors.border}
                    />

                    {/* 2. 콘텐츠 관리 (작가 소개, 뉴스) */}
                    <AdminContentSection
                        settings={settings}
                        setSettings={setSettings}
                        effectiveArtistId={effectiveArtistId}
                        borderColor={themeColors.border}
                    />

                    {/* 4. 보안 설정 */}
                    <AdminSecuritySection
                        passwordChangeSuccess={passwordChangeSuccess}
                        passwordChangeError={passwordChangeError}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                        handlePasswordChange={handlePasswordChange}
                    />

                    {/* 하단 로그아웃 */}
                    <div className="pt-10 text-center opacity-50 space-y-4">
                        <button onClick={() => logout()} className="text-red-500 font-bold underline">관리자 로그아웃</button>
                        <p className="text-sm">저장 후 페이지를 새로고침하면 변경사항이 반영됩니다.</p>
                    </div>
                </div>
            </main>

            <KakaoCacheModal
                isOpen={showCacheModal}
                onClose={() => setShowCacheModal(false)}
                siteUrl={typeof window !== 'undefined' ? window.location.origin : ''}
            />
        </div>
    );
}
