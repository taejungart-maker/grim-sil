"use client";

import { useState, useEffect, useCallback } from "react";
import { SiteConfig, defaultSiteConfig } from "../config/site";
import { loadSettingsById, saveSettings, savePasswordById } from "../utils/settingsDb";
import { getVisitorStats } from "../utils/db";
import { useAuth } from "../contexts/AuthContext";
import QRCode from "qrcode";

export function useAdminActions(effectiveArtistId: string) {
    const { isAuthenticated, login, logout } = useAuth();

    // settings
    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showCacheModal, setShowCacheModal] = useState(false);

    // password change
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordChangeError, setPasswordChangeError] = useState("");
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

    // stats
    const [visitorStats, setVisitorStats] = useState<{ date: string, count: number }[]>([]);
    const [totalViews, setTotalViews] = useState(0);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    // login
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);

    useEffect(() => {
        loadSettingsById(effectiveArtistId).then(setSettings);

        if (isAuthenticated) {
            const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
            if (currentUrl) {
                // simple gallery URL logic
                const isVip = effectiveArtistId.startsWith("vip-");
                const galleryUrl = isVip ? `${currentUrl}/gallery-${effectiveArtistId}` : currentUrl;
                QRCode.toDataURL(galleryUrl, {
                    width: 400,
                    margin: 2,
                    color: { dark: "#000000", light: "#ffffff" }
                }).then(setQrCodeUrl).catch(console.error);
            }

            getVisitorStats(7).then(data => {
                setVisitorStats(data);
                setTotalViews(data.reduce((acc, curr) => acc + curr.count, 0));
            });
        }
    }, [effectiveArtistId, isAuthenticated]);

    const handleLogin = useCallback(async () => {
        try {
            const success = await login(password);
            if (success) {
                setPasswordError(false);
                return true;
            } else {
                setPasswordError(true);
                return false;
            }
        } catch (error) {
            console.error("Login component error:", error);
            setPasswordError(true);
            return false;
        }
    }, [login, password]);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const updatedSettings = {
                ...settings,
                updatedAt: new Date().toISOString()
            };
            await saveSettings(updatedSettings, effectiveArtistId);
            setSettings(updatedSettings);
            setSaveSuccess(true);
            setShowCacheModal(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            return true;
        } catch (error) {
            alert("설정 저장 중 오류가 발생했습니다.");
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [settings, effectiveArtistId]);

    const handlePasswordChange = useCallback(async () => {
        if (newPassword.length < 4) {
            setPasswordChangeError("비밀번호는 4자 이상이어야 합니다.");
            return false;
        }
        if (newPassword !== confirmPassword) {
            setPasswordChangeError("비밀번호가 일치하지 않습니다.");
            return false;
        }
        try {
            await savePasswordById(effectiveArtistId, newPassword);
            setPasswordChangeSuccess(true);
            setNewPassword("");
            setConfirmPassword("");
            setPasswordChangeError("");
            setTimeout(() => setPasswordChangeSuccess(false), 3000);
            return true;
        } catch (error) {
            setPasswordChangeError("비밀번호 변경 실패");
            return false;
        }
    }, [newPassword, confirmPassword, effectiveArtistId]);

    return {
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
        visitorStats,
        totalViews,
        qrCodeUrl,
        password,
        setPassword,
        passwordError,
        handleLogin,
        handleSave,
        handlePasswordChange
    };
}
