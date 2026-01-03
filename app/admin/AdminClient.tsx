"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { defaultSiteConfig, SiteConfig } from "../config/site";
import { loadSettingsById, saveSettings, savePasswordById, loadPasswordById } from "../utils/settingsDb";
import { exportAllData, importAllData, exportToClipboard, importFromClipboard, getAllArtworks, addArtwork, updateArtwork, deleteArtwork, uploadImageToStorage, getVisitorStats } from "../utils/db";
import { migrateLocalDataToSupabase, hasLegacyData, MigrationResult } from "../utils/migration";
import { migrateAllImagesToStorage, countBase64Images, MigrationProgress } from "../utils/imageMigration";
import { useAuth } from "../contexts/AuthContext";
import { resetPaymentStatus } from "../utils/paymentUtils";
import { isAlwaysFreeMode } from "../utils/deploymentMode";
import { createVipArtist, getAllVipArtists, deleteVipArtist, generateVipLinkUrl, VipArtist } from "../utils/vipArtistDb";
import QRCode from "qrcode";
import { SIGNATURE_COLORS } from "../utils/themeColors";

import Link from "next/link";
import VipManagement from "../components/VipManagement";

interface AdminClientProps {
    injectedArtistId: string;
}

export default function AdminClient({ injectedArtistId }: AdminClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vipId = searchParams.get("vipId") || "";

    // [V8_FIX] 서버사이드(미들웨어)에서 확정되어 주입된 ID를 절대적 기준으로 사용
    const effectiveArtistId = vipId || injectedArtistId;

    const { isAuthenticated, login, logout } = useAuth();
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);

    // 설정 상태
    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // 비밀번호 변경 상태
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordChangeError, setPasswordChangeError] = useState("");
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

    // 통계 관련 상태
    const [visitorStats, setVisitorStats] = useState<{ date: string, count: number }[]>([]);
    const [totalViews, setTotalViews] = useState(0);

    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    // 데이터 백업 상태
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importMessage, setImportMessage] = useState("");
    const [exportText, setExportText] = useState("");
    const [importText, setImportText] = useState("");

    // 마이그레이션 상태
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
    const [legacyDataInfo, setLegacyDataInfo] = useState<{ hasArtworks: boolean; hasSettings: boolean; artworksCount: number } | null>(null);

    // 이미지 마이그레이션 상태
    const [isImageMigrating, setIsImageMigrating] = useState(false);
    const [imageMigrationProgress, setImageMigrationProgress] = useState<MigrationProgress | null>(null);
    const [base64ImageCount, setBase64ImageCount] = useState<number>(0);

    // 초기 데이터 로딩
    useEffect(() => {
        // [V8_FIX] 확실하게 검증된 effectiveArtistId로만 로드
        loadSettingsById(effectiveArtistId).then(setSettings);
        hasLegacyData().then(setLegacyDataInfo);
        countBase64Images().then(setBase64ImageCount);

        if (isAuthenticated) {
            // QR 코드 생성
            const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
            if (currentUrl) {
                const galleryUrl = vipId ? `${currentUrl}/gallery-${vipId}` : currentUrl;
                QRCode.toDataURL(galleryUrl, {
                    width: 400,
                    margin: 2,
                    color: { dark: "#000000", light: "#ffffff" }
                }).then(setQrCodeUrl).catch(console.error);
            }

            // 통계
            getVisitorStats(7).then(data => {
                setVisitorStats(data);
                setTotalViews(data.reduce((acc, curr) => acc + curr.count, 0));
            });
        }
    }, [effectiveArtistId, isAuthenticated, vipId]);

    // 로그인 처리
    const handleLogin = async () => {
        try {
            // [V10_FIX] AuthContext의 login은 내부적으로 verifyPassword를 수행함
            const success = await login(password);
            if (success) {
                setPasswordError(false);
            } else {
                setPasswordError(true);
            }
        } catch (error) {
            console.error("Login component error:", error);
            setPasswordError(true);
        }
    };

    // 설정 저장
    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            // [V8_FIX] 명시적으로 effectiveArtistId를 넘겨서 저장 대상 강제 고정
            await saveSettings(settings, effectiveArtistId);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            if (!vipId) router.push("/");
        } catch (error) {
            alert("설정 저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    // 비밀번호 변경
    const handlePasswordChange = async () => {
        if (newPassword.length < 4) {
            setPasswordChangeError("비밀번호는 4자 이상이어야 합니다.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordChangeError("비밀번호가 일치하지 않습니다.");
            return;
        }
        try {
            await savePasswordById(effectiveArtistId, newPassword);
            setPasswordChangeSuccess(true);
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPasswordChangeSuccess(false), 3000);
        } catch (error) {
            setPasswordChangeError("비밀번호 변경 실패");
        }
    };

    // 아티스트 픽 관리
    const handleAddPick = () => {
        setSettings({ ...settings, artistPicks: [...(settings.artistPicks || []), { name: "", archiveUrl: "", imageUrl: "" }] });
    };
    const handleRemovePick = (index: number) => {
        setSettings({ ...settings, artistPicks: settings.artistPicks.filter((_, i) => i !== index) });
    };
    const handleUpdatePick = (index: number, field: string, value: string) => {
        const newPicks = [...settings.artistPicks];
        newPicks[index] = { ...newPicks[index], [field]: value };
        setSettings({ ...settings, artistPicks: newPicks });
    };

    const bgColor = settings.theme === "black" ? "#1a1a1a" : "#ffffff";
    const textColor = settings.theme === "black" ? "#ffffff" : "#1a1a1a";
    const borderColor = settings.theme === "black" ? "#333" : "#e5e7eb";
    const mutedColor = settings.theme === "black" ? "#a0a0a0" : "#6b7280";

    if (!isAuthenticated) {
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

    return (
        <div className="min-h-screen" style={{ background: bgColor, color: textColor }}>
            <header className="p-4 md:p-5 border-b flex justify-between items-center sticky top-0 z-50 bg-inherit" style={{ borderColor }}>
                <div className="flex items-center gap-2 md:gap-3">
                    <h1 className="text-lg md:text-2xl font-bold" style={{ color: settings.theme === "black" ? "#fff" : "#8b7355" }}>갤러리 설정</h1>
                    <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-[10px] md:text-xs">ID: {effectiveArtistId}</span>
                </div>
                <div className="flex gap-2 flex-nowrap">
                    <button onClick={handleSave} disabled={isSaving} className="px-3 md:px-5 py-1.5 md:py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition text-sm md:text-base whitespace-nowrap">{isSaving ? "..." : "설정 저장"}</button>
                    <button onClick={() => router.push("/")} className="px-3 md:px-5 py-1.5 md:py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:opacity-80 transition text-sm md:text-base whitespace-nowrap">나가기</button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-4 md:p-10">
                {saveSuccess && <div className="p-4 mb-6 bg-green-500 text-white rounded-xl text-center font-bold text-sm md:text-base">성공적으로 저장되었습니다!</div>}

                <div className="space-y-8 md:space-y-12">
                    {/* 기본 정보 */}
                    <section>
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">🏠 기본 정보</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs md:text-sm font-semibold mb-2 opacity-70">Gallery 한글 이름 (상단 바)</label>
                                <input className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent text-sm md:text-base" style={{ borderColor }} value={settings.galleryNameKo} onChange={e => setSettings({ ...settings, galleryNameKo: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold mb-2 opacity-70">작가 이름</label>
                                <input className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent text-sm md:text-base" style={{ borderColor }} value={settings.artistName} onChange={e => setSettings({ ...settings, artistName: e.target.value })} />
                            </div>
                        </div>
                    </section>

                    {/* SEO 설정 */}
                    <section>
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">🌐 사이트 설정 (SEO)</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs md:text-sm font-semibold mb-2 opacity-70">사이트 제목 (브라우저 탭)</label>
                                <input className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent text-sm md:text-base" style={{ borderColor }} value={settings.siteTitle} onChange={e => setSettings({ ...settings, siteTitle: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-semibold mb-2 opacity-70">사이트 설명</label>
                                <textarea className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent text-sm md:text-base" style={{ borderColor }} rows={3} value={settings.siteDescription} onChange={e => setSettings({ ...settings, siteDescription: e.target.value })} />
                            </div>
                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        const siteUrl = typeof window !== 'undefined' ? window.location.origin : "";
                                        const kakaoToolUrl = `https://developers.kakao.com/tool/clear/og?url=${encodeURIComponent(siteUrl)}`;
                                        window.open(kakaoToolUrl, '_blank');
                                    }}
                                    className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                                >
                                    <span>✨ 카카오톡 미리보기 강제 갱신 (캐시 삭제)</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                </button>
                                <p className="mt-2 text-[11px] opacity-50">프로필 사진이나 제목 변경 후 카카오톡에 예전 정보가 뜰 때 사용하세요.</p>
                            </div>
                        </div>
                    </section>

                    {/* 테마 및 레이아웃 */}
                    <section>
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">🎨 테마 및 레이아웃</h2>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <button onClick={() => setSettings({ ...settings, theme: "white" })} className={`p-2 md:p-2.5 rounded-xl border-2 font-bold text-sm md:text-base ${settings.theme === "white" ? "border-black bg-white text-black" : "border-gray-200 opacity-50 text-gray-400"}`}>화이트 테마</button>
                            <button onClick={() => setSettings({ ...settings, theme: "black" })} className={`p-2 md:p-2.5 rounded-xl border-2 font-bold text-sm md:text-base ${settings.theme === "black" ? "border-white bg-black text-white" : "border-gray-800 opacity-50 text-gray-400"}`}>블랙 테마</button>
                        </div>
                        <div className="mt-4 md:mt-6 flex gap-2">
                            {[1, 3, 4].map(cols => (
                                <button key={cols} onClick={() => setSettings({ ...settings, gridColumns: cols as any })} className={`flex-1 p-2 rounded-xl border-2 font-bold text-xs md:text-base ${settings.gridColumns === cols ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-transparent bg-gray-50 text-gray-400"}`}>{cols}열 배열</button>
                            ))}
                        </div>
                    </section>

                    {/* 작가 소개 */}
                    <section className="pt-6 md:pt-8 border-t" style={{ borderColor }}>
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">👤 작가 소개 설정</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4 md:gap-6 items-start">
                                <div className="w-24 h-32 md:w-32 md:h-40 bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex-shrink-0 border-2" style={{ borderColor }}>
                                    {settings.aboutmeImage ? <img src={settings.aboutmeImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No Image</div>}
                                </div>
                                <div className="flex-1">
                                    <input type="file" id="p-upload" hidden onChange={async e => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const url = await uploadImageToStorage(file, effectiveArtistId);
                                            setSettings({ ...settings, aboutmeImage: url });
                                        }
                                    }} />
                                    <label htmlFor="p-upload" className="inline-block px-3 py-1.5 md:px-4 md:py-2 border-2 rounded-lg font-bold cursor-pointer hover:bg-gray-50 transition text-sm md:text-base" style={{ borderColor }}>이미지 변경</label>
                                    <p className="mt-2 text-[10px] md:text-xs opacity-50">작가 프로필 사진을 업로드해 주세요.</p>
                                </div>
                            </div>
                            {/* 평론 */}
                            <div className="p-5 rounded-2xl border-2 space-y-4" style={{ borderColor }}>
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold opacity-70">평론 (CRITIQUE)</label>
                                    <button
                                        onClick={() => setSettings({ ...settings, showCritique: !settings.showCritique })}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${settings.showCritique ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
                                    >
                                        {settings.showCritique ? "공개 중" : "비공개"}
                                    </button>
                                </div>
                                <textarea
                                    className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent font-serif text-sm md:text-base"
                                    style={{ borderColor }}
                                    rows={6}
                                    value={settings.aboutmeCritique}
                                    onChange={e => setSettings({ ...settings, aboutmeCritique: e.target.value })}
                                    placeholder="작가 평론을 입력하세요."
                                />
                            </div>

                            {/* 작가 노트 */}
                            <div className="p-5 rounded-2xl border-2 space-y-4" style={{ borderColor }}>
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold opacity-70">작가 노트 (ARTIST NOTE)</label>
                                    <button
                                        onClick={() => setSettings({ ...settings, showArtistNote: !settings.showArtistNote })}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${settings.showArtistNote ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
                                    >
                                        {settings.showArtistNote ? "공개 중" : "비공개"}
                                    </button>
                                </div>
                                <textarea
                                    className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent font-serif text-sm md:text-base"
                                    style={{ borderColor }}
                                    rows={6}
                                    value={settings.aboutmeNote}
                                    onChange={e => setSettings({ ...settings, aboutmeNote: e.target.value })}
                                    placeholder="작가 노트를 입력하세요."
                                />
                            </div>

                            {/* 프로필 */}
                            <div className="p-5 rounded-2xl border-2 space-y-4" style={{ borderColor }}>
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-bold opacity-70">프로필 (PROFILE)</label>
                                    <button
                                        onClick={() => setSettings({ ...settings, showHistory: !settings.showHistory })}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${settings.showHistory ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
                                    >
                                        {settings.showHistory ? "공개 중" : "비공개"}
                                    </button>
                                </div>
                                <textarea
                                    className="w-full p-3 md:p-4 border-2 rounded-xl bg-transparent font-serif text-sm md:text-base"
                                    style={{ borderColor }}
                                    rows={6}
                                    value={settings.aboutmeHistory}
                                    onChange={e => setSettings({ ...settings, aboutmeHistory: e.target.value })}
                                    placeholder="작가 프로필 (학력, 경력, 수상 이력 등)을 입력하세요."
                                />
                            </div>
                        </div>
                    </section>

                    {/* 실시간 뉴스 */}
                    <section className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2" style={{ borderColor: SIGNATURE_COLORS.royalIndigo }}>
                        <h3 className="text-lg font-bold text-indigo-700 mb-2">실시간 뉴스 문구</h3>
                        <textarea className="w-full p-4 border-2 rounded-xl bg-transparent" style={{ borderColor }} value={settings.newsText} onChange={e => setSettings({ ...settings, newsText: e.target.value })} placeholder="상단바에 흐르는 뉴스 문구를 입력하세요" />
                    </section>

                    {/* 비밀번호 변경 */}
                    <section className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border-2" style={{ borderColor: "#fee2e2" }}>
                        <h2 className="text-lg font-bold mb-4">🔐 보안 설정</h2>
                        {passwordChangeSuccess && <p className="mb-4 text-green-600 font-bold">비밀번호가 변경되었습니다.</p>}
                        <div className="space-y-3">
                            <input type="password" placeholder="새 비밀번호" className="w-full p-3 border-2 rounded-xl" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            <input type="password" placeholder="비밀번호 확인" className="w-full p-3 border-2 rounded-xl" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            <button onClick={handlePasswordChange} className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">비밀번호 변경</button>
                        </div>
                    </section>

                    {/* 로그아웃 및 하단 */}
                    <div className="pt-10 text-center opacity-50 space-y-4">
                        <button onClick={() => logout()} className="text-red-500 font-bold underline">관리자 로그아웃</button>
                        <p className="text-sm">저장 후 페이지를 새로고침하면 변경사항이 반영됩니다.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
