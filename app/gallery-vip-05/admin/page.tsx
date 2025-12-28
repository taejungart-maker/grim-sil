"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteConfig, defaultSiteConfig } from "../../config/site";
import { loadSettingsById, saveSettings, loadPasswordById, savePasswordById } from "../../utils/settingsDb";

const VIP_ID = "vip-gallery-05";
const VIP_NAME = "VIP 05";
const VIP_PATH = "/gallery-vip-05";

export default function VIPAdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordChangeError, setPasswordChangeError] = useState("");
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

    useEffect(() => { loadSettingsById(VIP_ID).then(setSettings); }, []);

    const handleLogin = async () => {
        const savedPassword = await loadPasswordById(VIP_ID);
        if (password === savedPassword) { setIsAuthenticated(true); setPasswordError(false); }
        else { setPasswordError(true); }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveSettings(settings, VIP_ID);
            setSaveSuccess(true);
            setTimeout(() => { setSaveSuccess(false); router.push(VIP_PATH); }, 1000);
        } catch { alert("설정 저장에 실패했습니다."); }
        finally { setIsSaving(false); }
    };

    const handlePasswordChange = async () => {
        setPasswordChangeError(""); setPasswordChangeSuccess(false);
        if (newPassword.length < 4) { setPasswordChangeError("비밀번호는 4자 이상이어야 합니다"); return; }
        if (newPassword !== confirmPassword) { setPasswordChangeError("비밀번호가 일치하지 않습니다"); return; }
        try {
            await savePasswordById(VIP_ID, newPassword);
            setPasswordChangeSuccess(true); setNewPassword(""); setConfirmPassword("");
            setTimeout(() => setPasswordChangeSuccess(false), 3000);
        } catch { setPasswordChangeError("비밀번호 변경에 실패했습니다"); }
    };

    const bgColor = settings.theme === "black" ? "#1a1a1a" : "#ffffff";
    const textColor = settings.theme === "black" ? "#ffffff" : "#1a1a1a";
    const borderColor = settings.theme === "black" ? "#333" : "#e5e7eb";

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#fafafa" }}>
                <div className="w-full max-w-md mx-4 p-8 rounded-2xl" style={{ background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#fff", fontSize: "24px", fontWeight: 700 }}>05</div>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, textAlign: "center", marginBottom: "8px" }}>{VIP_NAME} 관리자</h1>
                    <p style={{ fontSize: "14px", color: "#666", textAlign: "center", marginBottom: "32px" }}>비밀번호를 입력하세요</p>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="비밀번호" className="w-full rounded-xl" style={{ padding: "16px", fontSize: "16px", border: `2px solid ${passwordError ? "#dc2626" : "#e5e7eb"}`, marginBottom: "16px" }} />
                    {passwordError && <p style={{ color: "#dc2626", fontSize: "14px", marginBottom: "16px", textAlign: "center" }}>비밀번호가 틀렸습니다</p>}
                    <button onClick={handleLogin} style={{ width: "100%", padding: "16px", fontSize: "16px", fontWeight: 600, color: "#fff", background: "#14b8a6", border: "none", borderRadius: "12px", cursor: "pointer" }}>로그인</button>
                    <button onClick={() => router.push(VIP_PATH)} style={{ width: "100%", marginTop: "12px", padding: "14px", fontSize: "14px", color: "#666", background: "transparent", border: "1px solid #e5e7eb", borderRadius: "12px", cursor: "pointer" }}>← 갤러리로</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: bgColor, color: textColor }}>
            <header style={{ padding: "20px 24px", borderBottom: `1px solid ${borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 700 }}>05</div>
                    <h1 style={{ fontSize: "20px", fontWeight: 700 }}>{VIP_NAME} 설정</h1>
                </div>
                <button onClick={() => router.push(VIP_PATH)} style={{ padding: "10px 20px", fontSize: "14px", background: settings.theme === "black" ? "#333" : "#f3f4f6", color: textColor, border: "none", borderRadius: "8px", cursor: "pointer" }}>← 갤러리로</button>
            </header>
            <main className="max-w-2xl mx-auto" style={{ padding: "32px 24px" }}>
                {saveSuccess && <div style={{ padding: "16px", marginBottom: "24px", background: "#22c55e", color: "#fff", borderRadius: "12px", textAlign: "center" }}>설정이 저장되었습니다!</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div><label style={{ display: "block", fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>갤러리 이름</label><input type="text" value={settings.galleryNameKo} onChange={(e) => setSettings({ ...settings, galleryNameKo: e.target.value })} placeholder="예: 홍길동 갤러리" style={{ width: "100%", padding: "16px", fontSize: "16px", border: `2px solid ${borderColor}`, borderRadius: "12px", background: bgColor, color: textColor }} /></div>
                    <div><label style={{ display: "block", fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>작가 이름</label><input type="text" value={settings.artistName} onChange={(e) => setSettings({ ...settings, artistName: e.target.value })} placeholder="예: 홍길동" style={{ width: "100%", padding: "16px", fontSize: "16px", border: `2px solid ${borderColor}`, borderRadius: "12px", background: bgColor, color: textColor }} /></div>
                    <div><label style={{ display: "block", fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>테마</label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button onClick={() => setSettings({ ...settings, theme: "white" })} style={{ flex: 1, padding: "16px", border: settings.theme === "white" ? "3px solid #1a1a1a" : "2px solid #e5e7eb", borderRadius: "12px", background: "#fff", color: "#1a1a1a", cursor: "pointer" }}>화이트</button>
                            <button onClick={() => setSettings({ ...settings, theme: "black" })} style={{ flex: 1, padding: "16px", border: settings.theme === "black" ? "3px solid #fff" : "2px solid #333", borderRadius: "12px", background: "#1a1a1a", color: "#fff", cursor: "pointer" }}>블랙</button>
                        </div>
                    </div>
                    <button onClick={handleSave} disabled={isSaving} style={{ width: "100%", padding: "18px", fontSize: "16px", fontWeight: 600, color: "#fff", background: isSaving ? "#94a3b8" : "#14b8a6", border: "none", borderRadius: "12px", cursor: isSaving ? "not-allowed" : "pointer" }}>{isSaving ? "저장 중..." : "설정 저장"}</button>
                </div>
                <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: `1px solid ${borderColor}` }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "24px" }}>비밀번호 변경</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="새 비밀번호" style={{ width: "100%", padding: "14px", fontSize: "15px", border: `2px solid ${borderColor}`, borderRadius: "10px", background: bgColor, color: textColor }} />
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="비밀번호 확인" style={{ width: "100%", padding: "14px", fontSize: "15px", border: `2px solid ${borderColor}`, borderRadius: "10px", background: bgColor, color: textColor }} />
                        {passwordChangeError && <p style={{ color: "#dc2626", fontSize: "14px" }}>{passwordChangeError}</p>}
                        {passwordChangeSuccess && <p style={{ color: "#22c55e", fontSize: "14px" }}>비밀번호가 변경되었습니다!</p>}
                        <button onClick={handlePasswordChange} style={{ padding: "14px", fontSize: "15px", fontWeight: 600, color: textColor, background: "transparent", border: `2px solid ${borderColor}`, borderRadius: "10px", cursor: "pointer" }}>비밀번호 변경</button>
                    </div>
                </div>
            </main>
        </div>
    );
}
