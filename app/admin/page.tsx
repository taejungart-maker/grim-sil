"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultSiteConfig, SiteConfig } from "../config/site";
import { loadSettings, saveSettings, savePassword } from "../utils/settingsDb";
import { exportAllData, importAllData, exportToClipboard, importFromClipboard, getAllArtworks, addArtwork, updateArtwork, uploadImageToStorage, getVisitorStats } from "../utils/db";
import { migrateLocalDataToSupabase, hasLegacyData, MigrationResult } from "../utils/migration";
import { migrateAllImagesToStorage, countBase64Images, MigrationProgress } from "../utils/imageMigration";
import { useAuth } from "../contexts/AuthContext";
import { resetPaymentStatus } from "../utils/paymentUtils";
import { isAlwaysFreeMode } from "../utils/deploymentMode";
import QRCode from "qrcode";
import { SIGNATURE_COLORS } from "../utils/themeColors";

export default function AdminPage() {
    const router = useRouter();
    const { isAuthenticated, login } = useAuth();
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

    // 통계 관련 상태
    const [visitorStats, setVisitorStats] = useState<{ date: string, count: number }[]>([]);
    const [totalViews, setTotalViews] = useState(0);

    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    // QR 코드 생성 로직
    useEffect(() => {
        if (isAuthenticated) {
            // QR 코드 생성
            const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
            if (currentUrl) {
                QRCode.toDataURL(currentUrl, {
                    width: 400,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#ffffff"
                    }
                })
                    .then(url => setQrCodeUrl(url))
                    .catch(err => console.error("QR generation error:", err));
            }

            // 통계 데이터 가져오기
            getVisitorStats(7).then(data => {
                setVisitorStats(data);
                const total = data.reduce((acc, curr) => acc + curr.count, 0);
                setTotalViews(total);
            });
        }
    }, [isAuthenticated]);
    const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

    // 데이터 백업 상태
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importMessage, setImportMessage] = useState("");
    const [exportText, setExportText] = useState(""); // 수동 복사용 텍스트
    const [importText, setImportText] = useState(""); // 수동 붙여넣기용 텍스트

    // 마이그레이션 상태
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
    const [legacyDataInfo, setLegacyDataInfo] = useState<{ hasArtworks: boolean; hasSettings: boolean; artworksCount: number } | null>(null);

    // 이미지 마이그레이션 상태
    const [isImageMigrating, setIsImageMigrating] = useState(false);
    const [imageMigrationProgress, setImageMigrationProgress] = useState<MigrationProgress | null>(null);
    const [base64ImageCount, setBase64ImageCount] = useState<number>(0);

    // 설정 불러오기 + 레거시 데이터 확인
    useEffect(() => {
        loadSettings().then(setSettings);
        hasLegacyData().then(setLegacyDataInfo);
        countBase64Images().then(setBase64ImageCount);
    }, []);

    // 비밀번호 확인 (전역 로그인 사용)
    const handleLogin = async () => {
        const success = await login(password);
        if (success) {
            setPasswordError(false);
            // 로그인 성공 시 메인 화면으로 이동 (안전 정책)
            router.push("/");
        } else {
            setPasswordError(true);
        }
    };

    // 설정 저장
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveSettings(settings);
            // 저장 성공 후 홈으로 이동
            router.push("/");
        } catch (error) {
            console.error("Failed to save settings:", error);
            setIsSaving(false);
            alert("설정 저장에 실패했습니다. Supabase 데이터베이스 컬럼이 부족할 수 있습니다. 제가 드리는 SQL 스크립트를 실행해 주세요.");
        }
    };

    // 비밀번호 변경
    const handlePasswordChange = async () => {
        setPasswordChangeError("");
        setPasswordChangeSuccess(false);

        if (newPassword.length < 4) {
            setPasswordChangeError("비밀번호는 4자 이상이어야 합니다");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordChangeError("비밀번호가 일치하지 않습니다");
            return;
        }

        try {
            await savePassword(newPassword);
            setPasswordChangeSuccess(true);
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPasswordChangeSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to change password:", error);
            setPasswordChangeError("비밀번호 변경에 실패했습니다");
        }
    };

    // 동료 작가 추천 (Artist's Pick) 추가/수정/삭제 로직
    const handleAddPick = () => {
        const newPicks = [...(settings.artistPicks || []), { name: "", archiveUrl: "", imageUrl: "" }];
        setSettings({ ...settings, artistPicks: newPicks });
    };

    const handleRemovePick = (index: number) => {
        const newPicks = (settings.artistPicks || []).filter((_, i) => i !== index);
        setSettings({ ...settings, artistPicks: newPicks });
    };

    const handleUpdatePick = (index: number, field: string, value: string) => {
        const newPicks = [...(settings.artistPicks || [])];
        newPicks[index] = { ...newPicks[index], [field]: value };
        setSettings({ ...settings, artistPicks: newPicks });
    };

    // 테마 색상
    const bgColor = settings.theme === "black" ? "#1a1a1a" : "#ffffff";
    const textColor = settings.theme === "black" ? "#ffffff" : "#1a1a1a";
    const borderColor = settings.theme === "black" ? "#333" : "#e5e7eb";
    const mutedColor = settings.theme === "black" ? "#a0a0a0" : "#6b7280";

    // 비밀번호 입력 화면
    if (!isAuthenticated) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: "#fafafa" }}
            >
                <div
                    className="w-full max-w-md mx-4 p-8 rounded-2xl"
                    style={{ background: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                >
                    <h1
                        style={{
                            fontSize: "32px",
                            fontWeight: 700,
                            fontFamily: "'Noto Sans KR', sans-serif",
                            textAlign: "center",
                            marginBottom: "8px",
                        }}
                    >
                        관리자 로그인
                    </h1>
                    <p
                        style={{
                            fontSize: "18px",
                            fontFamily: "'Noto Sans KR', sans-serif",
                            color: "#666",
                            textAlign: "center",
                            marginBottom: "32px",
                        }}
                    >
                        설정을 변경하려면 비밀번호를 입력하세요
                    </p>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        placeholder="비밀번호 입력"
                        className="w-full rounded-xl"
                        style={{
                            padding: "18px 20px",
                            fontSize: "18px",
                            border: `2px solid ${passwordError ? "#dc2626" : "#e5e7eb"}`,
                            outline: "none",
                            marginBottom: "16px",
                        }}
                    />

                    {passwordError && (
                        <p
                            style={{
                                color: "#dc2626",
                                fontSize: "14px",
                                marginBottom: "16px",
                                textAlign: "center",
                            }}
                        >
                            비밀번호가 틀렸습니다
                        </p>
                    )}

                    <button
                        onClick={handleLogin}
                        style={{
                            width: "100%",
                            padding: "18px",
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "#fff",
                            background: "#1a1a1a",
                            border: "none",
                            borderRadius: "12px",
                            cursor: "pointer",
                        }}
                    >
                        로그인
                    </button>

                    {/* 비밀번호 찾기 링크 */}
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <a
                            href="/forgot-password"
                            style={{
                                fontSize: "16px",
                                color: "#4f46e5",
                                textDecoration: "underline",
                                fontWeight: 600,
                            }}
                        >
                            비밀번호를 잊으셨나요?
                        </a>
                    </div>

                    <button
                        onClick={() => router.push("/")}
                        style={{
                            width: "100%",
                            marginTop: "12px",
                            padding: "14px",
                            fontSize: "16px",
                            color: "#666",
                            background: "transparent",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            cursor: "pointer",
                        }}
                    >
                        ← 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 설정 페이지
    return (
        <div
            className="min-h-screen"
            style={{ background: bgColor, color: textColor }}
        >
            {/* 헤더 */}
            <header
                style={{
                    padding: "20px 24px",
                    borderBottom: `1px solid ${borderColor}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h1 style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    fontFamily: "'Noto Sans KR', sans-serif",
                    color: settings.theme === "black" ? "#ffffff" : "#8b7355"
                }}>
                    갤러리 설정
                </h1>
                <button
                    onClick={() => router.push("/")}
                    style={{
                        padding: "10px 20px",
                        fontSize: "14px",
                        background: settings.theme === "black" ? "#333" : "#f3f4f6",
                        color: textColor,
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                >
                    ← 갤러리로
                </button>
            </header>

            {/* 설정 폼 */}
            <main
                className="max-w-2xl mx-auto"
                style={{ padding: "32px 24px" }}
            >
                {/* 저장 성공 메시지 */}
                {saveSuccess && (
                    <div
                        style={{
                            padding: "16px",
                            marginBottom: "24px",
                            background: "#22c55e",
                            color: "#fff",
                            borderRadius: "12px",
                            textAlign: "center",
                            fontSize: "16px",
                            fontWeight: 600,
                        }}
                    >
                        설정이 저장되었습니다!
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {/* 갤러리 이름 (영문) */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "18px",
                                fontWeight: 600,
                                marginBottom: "12px",
                            }}
                        >
                            갤러리 이름 (영문)
                        </label>
                        <input
                            type="text"
                            value={settings.galleryNameEn}
                            onChange={(e) => setSettings({ ...settings, galleryNameEn: e.target.value })}
                            placeholder="예: MY GALLERY"
                            style={{
                                width: "100%",
                                padding: "18px 20px",
                                fontSize: "18px",
                                border: `2px solid ${borderColor}`,
                                borderRadius: "12px",
                                background: bgColor,
                                color: textColor,
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* 갤러리 이름 (한글) */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "18px",
                                fontWeight: 600,
                                marginBottom: "12px",
                            }}
                        >
                            갤러리 이름 (한글)
                        </label>
                        <input
                            type="text"
                            value={settings.galleryNameKo}
                            onChange={(e) => setSettings({ ...settings, galleryNameKo: e.target.value })}
                            placeholder="예: 마이갤러리"
                            style={{
                                width: "100%",
                                padding: "18px 20px",
                                fontSize: "18px",
                                border: `2px solid ${borderColor}`,
                                borderRadius: "12px",
                                background: bgColor,
                                color: textColor,
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* 작가 이름 */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "18px",
                                fontWeight: 600,
                                marginBottom: "12px",
                            }}
                        >
                            작가 이름
                        </label>
                        <input
                            type="text"
                            value={settings.artistName}
                            onChange={(e) => setSettings({ ...settings, artistName: e.target.value })}
                            placeholder="예: 홍길동"
                            style={{
                                width: "100%",
                                padding: "18px 20px",
                                fontSize: "18px",
                                border: `2px solid ${borderColor}`,
                                borderRadius: "12px",
                                background: bgColor,
                                color: textColor,
                                outline: "none",
                            }}
                        />
                    </div>

                    {/* 사이트 제목 (브라우저 탭 & 링크 공유) */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "18px",
                                fontWeight: 600,
                                marginBottom: "12px",
                            }}
                        >
                            사이트 제목 (브라우저 탭 & 링크 공유)
                        </label>
                        <input
                            type="text"
                            value={settings.siteTitle}
                            onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                            placeholder="예: 박야일 갤러리"
                            style={{
                                width: "100%",
                                padding: "18px 20px",
                                fontSize: "18px",
                                border: `2px solid ${borderColor}`,
                                borderRadius: "12px",
                                background: bgColor,
                                color: textColor,
                                outline: "none",
                            }}
                        />
                        <p style={{ marginTop: "8px", fontSize: "14px", color: "#888" }}>
                            카카오톡이나 SNS에 링크를 공유할 때 표시되는 제목입니다.
                        </p>
                    </div>

                    {/* 사이트 설명 (SEO) */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "18px",
                                fontWeight: 600,
                                marginBottom: "12px",
                            }}
                        >
                            사이트 설명 (SEO)
                        </label>
                        <textarea
                            value={settings.siteDescription}
                            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                            placeholder="예: 박야일 작가의 작품세계를 담은 온라인 화첩입니다."
                            rows={3}
                            style={{
                                width: "100%",
                                padding: "18px 20px",
                                fontSize: "16px",
                                border: `2px solid ${borderColor}`,
                                borderRadius: "12px",
                                background: bgColor,
                                color: textColor,
                                outline: "none",
                                resize: "vertical",
                            }}
                        />
                        <p style={{ marginTop: "8px", fontSize: "14px", color: "#888" }}>
                            링크 공유 시 함께 표시되는 설명문입니다.
                        </p>
                    </div>

                    {/* 테마 색상 */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "18px",
                                fontWeight: 600,
                                marginBottom: "12px",
                            }}
                        >
                            테마 색상
                        </label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => setSettings({ ...settings, theme: "white" })}
                                style={{
                                    flex: 1,
                                    padding: "20px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    border: settings.theme === "white" ? "3px solid #1a1a1a" : "2px solid #e5e7eb",
                                    borderRadius: "12px",
                                    background: "#ffffff",
                                    color: "#1a1a1a",
                                    cursor: "pointer",
                                }}
                            >
                                화이트
                            </button>
                            <button
                                onClick={() => setSettings({ ...settings, theme: "black" })}
                                style={{
                                    flex: 1,
                                    padding: "20px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    border: settings.theme === "black" ? "3px solid #ffffff" : "2px solid #333",
                                    borderRadius: "12px",
                                    background: "#1a1a1a",
                                    color: "#ffffff",
                                    cursor: "pointer",
                                }}
                            >
                                블랙
                            </button>
                        </div>
                    </div>

                    {/* 작품 배열 */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "18px",
                                fontWeight: 600,
                                marginBottom: "12px",
                            }}
                        >
                            작품 배열
                        </label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            {[1, 3, 4].map((cols) => (
                                <button
                                    key={cols}
                                    onClick={() => setSettings({ ...settings, gridColumns: cols as 1 | 3 | 4 })}
                                    style={{
                                        flex: 1,
                                        padding: "20px",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        border: settings.gridColumns === cols
                                            ? `3px solid ${textColor}`
                                            : `2px solid ${borderColor}`,
                                        borderRadius: "12px",
                                        background: bgColor,
                                        color: textColor,
                                        cursor: "pointer",
                                    }}
                                >
                                    {cols === 1 ? "1열" : cols === 3 ? "3열" : "4열"}
                                </button>
                            ))}
                        </div>
                        <p style={{ marginTop: "8px", fontSize: "14px", color: "#888" }}>
                            {settings.gridColumns === 1 && "큰 이미지로 한 줄씩 표시"}
                            {settings.gridColumns === 3 && "균일한 3열 그리드"}
                            {settings.gridColumns === 4 && "다양한 크기의 갤러리 스타일"}
                        </p>
                    </div>

                    {/* 가격 표시 */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "18px",
                                fontWeight: 600,
                                marginBottom: "12px",
                            }}
                        >
                            가격 표시
                        </label>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => setSettings({ ...settings, showPrice: true })}
                                style={{
                                    flex: 1,
                                    padding: "20px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    border: settings.showPrice
                                        ? `3px solid ${textColor}`
                                        : `2px solid ${borderColor}`,
                                    borderRadius: "12px",
                                    background: bgColor,
                                    color: textColor,
                                    cursor: "pointer",
                                }}
                            >
                                노출
                            </button>
                            <button
                                onClick={() => setSettings({ ...settings, showPrice: false })}
                                style={{
                                    flex: 1,
                                    padding: "20px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    border: !settings.showPrice
                                        ? `3px solid ${textColor}`
                                        : `2px solid ${borderColor}`,
                                    borderRadius: "12px",
                                    background: bgColor,
                                    color: textColor,
                                    cursor: "pointer",
                                }}
                            >
                                비노출
                            </button>
                        </div>
                        <p style={{ marginTop: "8px", fontSize: "14px", color: "#888" }}>
                            작품에 가격이 입력된 경우에만 표시됩니다
                        </p>
                    </div>

                    {/* 대표 작가노트 */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "18px",
                                fontWeight: 600,
                                marginBottom: "12px",
                            }}
                        >
                            대표 작가노트
                        </label>
                        <textarea
                            value={settings.defaultArtistNote || ""}
                            onChange={(e) => setSettings({ ...settings, defaultArtistNote: e.target.value })}
                            placeholder="예: 이 작품은 자연과 인간의 조화를 표현한 시리즈입니다. 작가의 깊은 철학과 예술적 비전을 담았습니다."
                            rows={4}
                            style={{
                                width: "100%",
                                padding: "18px 20px",
                                fontSize: "16px",
                                border: `2px solid ${borderColor}`,
                                borderRadius: "12px",
                                background: bgColor,
                                color: textColor,
                                outline: "none",
                                resize: "vertical",
                                lineHeight: 1.6,
                                fontFamily: "'Noto Sans KR', sans-serif",
                            }}
                        />
                    </div>

                    {/* 👤 작가 소개 & 평론 설정 */}
                    <div style={{
                        marginTop: "40px",
                        paddingTop: "40px",
                        borderTop: `2px solid ${borderColor}`,
                    }}>
                        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                            작가 소개 & 평론 설정
                        </h2>

                        {/* 작가 사진 업로드 */}
                        <div style={{ marginBottom: "32px" }}>
                            <label style={{ display: "block", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
                                작가 프로필 사진
                            </label>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                                <div style={{
                                    width: "120px",
                                    height: "150px",
                                    borderRadius: "12px",
                                    background: "#f0f0f0",
                                    overflow: "hidden",
                                    position: "relative",
                                    border: `2px solid ${borderColor}`,
                                }}>
                                    {settings.aboutmeImage ? (
                                        <img
                                            src={`${settings.aboutmeImage}?t=${Date.now()}`}
                                            alt="프로필"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                try {
                                                    const url = await uploadImageToStorage(file);
                                                    setSettings({ ...settings, aboutmeImage: url });
                                                } catch (err) {
                                                    alert("사진 업로드에 실패했습니다.");
                                                }
                                            }
                                        }}
                                        style={{ display: "none" }}
                                        id="profile-upload"
                                    />
                                    <label
                                        htmlFor="profile-upload"
                                        style={{
                                            display: "inline-block",
                                            padding: "12px 20px",
                                            background: bgColor,
                                            border: `2px solid ${borderColor}`,
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                            marginBottom: "8px",
                                        }}
                                    >
                                        사진 변경하기
                                    </label>
                                    <p style={{ fontSize: "14px", color: "#888" }}>
                                        작가 소개 페이지에 표시될 프로필 사진입니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 작가노트 노출 여부 */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
                                작가노트 노출
                            </label>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    onClick={() => setSettings({ ...settings, showArtistNote: true })}
                                    style={{
                                        flex: 1,
                                        padding: "16px",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        border: settings.showArtistNote ? `3px solid ${textColor}` : `2px solid ${borderColor}`,
                                        borderRadius: "10px",
                                        background: bgColor,
                                        color: textColor,
                                        cursor: "pointer",
                                    }}
                                >
                                    노출
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, showArtistNote: false })}
                                    style={{
                                        flex: 1,
                                        padding: "16px",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        border: !settings.showArtistNote ? `3px solid ${textColor}` : `2px solid ${borderColor}`,
                                        borderRadius: "10px",
                                        background: bgColor,
                                        color: textColor,
                                        cursor: "pointer",
                                    }}
                                >
                                    비노출
                                </button>
                            </div>
                        </div>

                        {/* 작가노트 내용 */}
                        <div style={{ marginBottom: "32px" }}>
                            <textarea
                                value={settings.aboutmeNote || ""}
                                onChange={(e) => setSettings({ ...settings, aboutmeNote: e.target.value })}
                                placeholder="작가로서의 철학과 작품 세계를 설명해 주세요."
                                rows={8}
                                style={{
                                    width: "100%",
                                    padding: "18px 20px",
                                    fontSize: "16px",
                                    border: `2px solid ${borderColor}`,
                                    borderRadius: "12px",
                                    background: bgColor,
                                    color: textColor,
                                    outline: "none",
                                    resize: "vertical",
                                    lineHeight: 1.7,
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                }}
                            />
                        </div>

                        {/* 평론 노출 여부 */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
                                평론 노출
                            </label>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    onClick={() => setSettings({ ...settings, showCritique: true })}
                                    style={{
                                        flex: 1,
                                        padding: "16px",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        border: settings.showCritique ? `3px solid ${textColor}` : `2px solid ${borderColor}`,
                                        borderRadius: "10px",
                                        background: bgColor,
                                        color: textColor,
                                        cursor: "pointer",
                                    }}
                                >
                                    노출
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, showCritique: false })}
                                    style={{
                                        flex: 1,
                                        padding: "16px",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        border: !settings.showCritique ? `3px solid ${textColor}` : `2px solid ${borderColor}`,
                                        borderRadius: "10px",
                                        background: bgColor,
                                        color: textColor,
                                        cursor: "pointer",
                                    }}
                                >
                                    비노출
                                </button>
                            </div>
                        </div>

                        {/* 평론 내용 */}
                        <div style={{ marginBottom: "32px" }}>
                            <textarea
                                value={settings.aboutmeCritique || ""}
                                onChange={(e) => setSettings({ ...settings, aboutmeCritique: e.target.value })}
                                placeholder="작품에 대한 평론가의 의견이나 전시 비평을 입력해 주세요."
                                rows={8}
                                style={{
                                    width: "100%",
                                    padding: "18px 20px",
                                    fontSize: "16px",
                                    border: `2px solid ${borderColor}`,
                                    borderRadius: "12px",
                                    background: bgColor,
                                    color: textColor,
                                    outline: "none",
                                    resize: "vertical",
                                    lineHeight: 1.7,
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                }}
                            />
                        </div>

                        {/* 약력 노출 여부 */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
                                약력(경력) 노출
                            </label>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    onClick={() => setSettings({ ...settings, showHistory: true })}
                                    style={{
                                        flex: 1,
                                        padding: "16px",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        border: settings.showHistory ? `3px solid ${textColor}` : `2px solid ${borderColor}`,
                                        borderRadius: "10px",
                                        background: bgColor,
                                        color: textColor,
                                        cursor: "pointer",
                                    }}
                                >
                                    노출
                                </button>
                                <button
                                    onClick={() => setSettings({ ...settings, showHistory: false })}
                                    style={{
                                        flex: 1,
                                        padding: "16px",
                                        fontSize: "15px",
                                        fontWeight: 600,
                                        border: !settings.showHistory ? `3px solid ${textColor}` : `2px solid ${borderColor}`,
                                        borderRadius: "10px",
                                        background: bgColor,
                                        color: textColor,
                                        cursor: "pointer",
                                    }}
                                >
                                    비노출
                                </button>
                            </div>
                        </div>

                        {/* 약력 내용 */}
                        <div style={{ marginBottom: "32px" }}>
                            <textarea
                                value={settings.aboutmeHistory || ""}
                                onChange={(e) => setSettings({ ...settings, aboutmeHistory: e.target.value })}
                                placeholder="학력, 주요 전시 경력, 수상 내역 등을 입력해 주세요."
                                rows={10}
                                style={{
                                    width: "100%",
                                    padding: "18px 20px",
                                    fontSize: "16px",
                                    border: `2px solid ${borderColor}`,
                                    borderRadius: "12px",
                                    background: bgColor,
                                    color: textColor,
                                    outline: "none",
                                    resize: "vertical",
                                    lineHeight: 1.7,
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                }}
                            />
                        </div>
                    </div>

                    {/* 로컬 데이터 마이그레이션 - 비활성화 (클라우드 전환 완료) */}
                    {/* legacyDataInfo 관련 UI 제거됨 */}

                    {/* 프로덕션 모드: Base64 이미지 마이그레이션 섹션 비활성화 */}
                    {/* base64ImageCount > 0 && (
                        <div
                            style={{
                                marginTop: "24px",
                                padding: "24px",
                                background: settings.theme === "black" ? "#1a2a3a" : "#f0f7ff",
                                borderRadius: "16px",
                                border: settings.theme === "black" ? "2px solid #2255aa" : "2px solid #4488ff",
                            }}
                        >
                            <h3 style={{
                                fontSize: "20px",
                                fontWeight: 700,
                                marginBottom: "16px",
                                color: settings.theme === "black" ? "#6bb3ff" : "#2255aa",
                            }}>
                                이미지 최적화 (Base64 → Storage)
                            </h3>
                            <p style={{
                                fontSize: "14px",
                                color: settings.theme === "black" ? "#aaa" : "#666",
                                marginBottom: "16px",
                                lineHeight: 1.6,
                            }}>
                                {base64ImageCount}개의 Base64 이미지를 Supabase Storage로 이전합니다.
                                <br />
                                이 작업 후 이미지 로딩 속도가 크게 향상됩니다.
                            </p>

                            {imageMigrationProgress && (
                                <div style={{
                                    padding: "12px",
                                    marginBottom: "16px",
                                    borderRadius: "8px",
                                    background: settings.theme === "black" ? "#333" : "#e8f4ff",
                                }}>
                                    <div style={{ marginBottom: "8px" }}>
                                        진행: {imageMigrationProgress.completed + imageMigrationProgress.failed} / {imageMigrationProgress.total}
                                    </div>
                                    <div style={{
                                        width: "100%",
                                        height: "8px",
                                        background: settings.theme === "black" ? "#444" : "#ddd",
                                        borderRadius: "4px",
                                        overflow: "hidden",
                                    }}>
                                        <div style={{
                                            width: `${((imageMigrationProgress.completed + imageMigrationProgress.failed) / imageMigrationProgress.total) * 100}%`,
                                            height: "100%",
                                            background: "#4488ff",
                                            transition: "width 0.3s ease",
                                        }} />
                                    </div>
                                    {imageMigrationProgress.currentArtwork && (
                                        <div style={{ marginTop: "8px", fontSize: "13px", color: "#888" }}>
                                            현재: {imageMigrationProgress.currentArtwork}
                                        </div>
                                    )}
                                    {imageMigrationProgress.completed === imageMigrationProgress.total && imageMigrationProgress.total > 0 && (
                                        <div style={{ marginTop: "8px", color: "#22c55e", fontWeight: 600 }}>
                                            완료! {imageMigrationProgress.completed}개 성공, {imageMigrationProgress.failed}개 실패
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={async () => {
                                    setIsImageMigrating(true);
                                    setImageMigrationProgress(null);
                                    try {
                                        const result = await migrateAllImagesToStorage((progress) => {
                                            setImageMigrationProgress({ ...progress });
                                        });
                                        setImageMigrationProgress(result);
                                        // 완료 후 Base64 개수 갱신
                                        countBase64Images().then(setBase64ImageCount);
                                    } catch (error) {
                                        console.error("Image migration failed:", error);
                                    }
                                    setIsImageMigrating(false);
                                }}
                                disabled={isImageMigrating}
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    background: settings.theme === "black" ? "#2255aa" : "#4488ff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "12px",
                                    cursor: isImageMigrating ? "wait" : "pointer",
                                    fontFamily: "'Noto Sans KR', sans-serif",
                                    opacity: isImageMigrating ? 0.7 : 1,
                                }}
                            >
                                {isImageMigrating ? "마이그레이션 중..." : "이미지 최적화 시작"}
                            </button>
                        </div>
                    ) */}

                    {/* 프로덕션 모드: 나의 화첩 보고서 섹션 비활성화 */}
                    {/* 나의 화첩 보고서 (방문자 통계) */}
                    {/*
                    <div
                        style={{
                            marginTop: "48px",
                            padding: "32px",
                            background: settings.theme === "black" ? "#111" : "#f8fafc",
                            borderRadius: "24px",
                            border: `1px solid ${borderColor}`,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                            <h2 style={{ fontSize: "22px", fontWeight: 800 }}>나의 화첩 보고서</h2>
                            <div style={{ textAlign: "right" }}>
                                <p style={{ fontSize: "13px", color: mutedColor, margin: 0 }}>최근 7일 누적</p>
                                <p style={{ fontSize: "24px", fontWeight: 900, color: "#6366f1", margin: 0 }}>{totalViews}명</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {visitorStats.length > 0 ? (
                                visitorStats.map((stat, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "16px 20px",
                                            background: settings.theme === "black" ? "#1a1a1a" : "#fff",
                                            borderRadius: "14px",
                                            border: `1px solid ${borderColor}`
                                        }}
                                    >
                                        <span style={{ fontSize: "14px", fontWeight: 600, width: "100px" }}>
                                            {new Date(stat.date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                                        </span>
                                        <div style={{ flex: 1, height: "8px", background: settings.theme === "black" ? "#333" : "#f1f5f9", borderRadius: "4px", margin: "0 16px", position: "relative" }}>
                                            <div style={{
                                                position: "absolute",
                                                left: 0,
                                                top: 0,
                                                height: "100%",
                                                width: `${Math.min(100, (stat.count / (Math.max(...visitorStats.map(s => s.count)) || 1)) * 100)}%`,
                                                background: "#6366f1",
                                                borderRadius: "4px"
                                            }} />
                                        </div>
                                        <span style={{ fontSize: "14px", fontWeight: 800, width: "40px", textAlign: "right" }}>{stat.count}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: "center", padding: "40px 0", color: mutedColor }}>데이터가 수집되는 중입니다.</p>
                            )}
                        </div>
                    </div>
                    */}

                    {/* 📣 실시간 뉴스 설정 (News Ticker) */}
                    <div style={{
                        marginTop: "48px",
                        padding: "32px",
                        background: settings.theme === "black" ? "#1a1a1a" : "#fff9f0",
                        borderRadius: "24px",
                        border: `2px solid ${settings.theme === "black" ? "#333" : SIGNATURE_COLORS.royalIndigo}`,
                    }}>
                        <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: SIGNATURE_COLORS.royalIndigo }}>
                            📣 실시간 뉴스 문구 관리
                        </h3>
                        <p style={{ color: mutedColor, fontSize: "14px", marginBottom: "20px" }}>
                            헤더 상단에서 흐르는 공지사항이나 전시 소식을 직접 입력해 보세요.
                        </p>
                        <textarea
                            value={settings.newsText || ""}
                            onChange={(e) => setSettings({ ...settings, newsText: e.target.value })}
                            placeholder="전시 일정이나 환영 인사를 입력해 보세요. (예: 🎨 12월 개인전 '겨울의 기억' 진행 중...)"
                            style={{
                                width: "100%",
                                height: "80px",
                                padding: "16px",
                                borderRadius: "12px",
                                border: `1px solid ${borderColor}`,
                                background: bgColor,
                                color: textColor,
                                fontSize: "15px",
                                lineHeight: "1.6",
                                resize: "none"
                            }}
                        />
                    </div>

                    {/* 홍보 도구: QR 디지털 명함 */}
                    <div
                        style={{
                            marginTop: "48px",
                            padding: "32px",
                            background: settings.theme === "black" ? "#1a1a1a" : "#ffffff",
                            borderRadius: "24px",
                            border: `2px solid ${settings.theme === "black" ? "#333" : "#6366f1"}`,
                            boxShadow: "0 10px 40px rgba(99, 102, 241, 0.1)",
                            textAlign: "center"
                        }}
                    >
                        <div style={{ marginBottom: "24px" }}>
                            <span style={{
                                fontSize: "14px",
                                fontWeight: 800,
                                backgroundColor: "#6366f1",
                                color: "#fff",
                                padding: "4px 12px",
                                borderRadius: "8px",
                                textTransform: "uppercase"
                            }}>
                                Promotion Tool
                            </span>
                            <h2 style={{
                                fontSize: "24px",
                                fontWeight: 800,
                                marginTop: "16px",
                                letterSpacing: "-0.03em"
                            }}>
                                작가님의 디지털 명함 (QR)
                            </h2>
                            <p style={{ color: mutedColor, fontSize: "15px", marginTop: "8px" }}>
                                전시장이나 명함에 인쇄하여 관람객을 갤러리로 초대하세요.
                            </p>
                        </div>

                        {qrCodeUrl ? (
                            <div style={{ display: "inline-block", padding: "16px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                                <img src={qrCodeUrl} alt="Gallery QR Code" style={{ width: "200px", height: "200px", display: "block" }} />
                            </div>
                        ) : (
                            <div style={{ width: "200px", height: "200px", margin: "0 auto", background: "#eee", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ color: "#999" }}>생성 중...</span>
                            </div>
                        )}

                        <div style={{ marginTop: "24px" }}>
                            <a
                                href={qrCodeUrl}
                                download="artist_gallery_qr.png"
                                style={{
                                    display: "inline-block",
                                    padding: "16px 32px",
                                    backgroundColor: "#6366f1",
                                    color: "#fff",
                                    textDecoration: "none",
                                    borderRadius: "14px",
                                    fontWeight: 700,
                                    fontSize: "16px",
                                    transition: "all 0.2s"
                                }}
                            >
                                QR 코드 이미지 다운로드
                            </a>
                        </div>
                    </div>

                    {/* 🎨 동료 작가 추천 설정 (Artist's Pick) */}
                    <div style={{
                        marginTop: "40px",
                        padding: "32px",
                        background: settings.theme === "black" ? "#1a1a1a" : "#f0f4ff",
                        borderRadius: "24px",
                        border: `2px solid ${settings.theme === "black" ? "#333" : "#4488ff"}`,
                    }}>
                        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                            🔗 동료 작가 추천 (Artist's Pick)
                        </h2>
                        <p style={{ color: mutedColor, fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
                            함께 활동하는 동료 작가님들을 추천해 보세요. <br />
                            동료의 아카이브 주소와 대표 사진 링크를 입력하면 메인 화면 하단에 표시됩니다.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {(settings.artistPicks || []).map((pick, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: "20px",
                                        background: bgColor,
                                        borderRadius: "16px",
                                        border: `1px solid ${borderColor}`,
                                        position: "relative"
                                    }}
                                >
                                    <button
                                        onClick={() => handleRemovePick(index)}
                                        style={{
                                            position: "absolute",
                                            top: "12px",
                                            right: "12px",
                                            background: "#ff4d4d",
                                            color: "#fff",
                                            border: "none",
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "50%",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        ✕
                                    </button>

                                    <div style={{ display: "grid", gap: "12px" }}>
                                        <div>
                                            <label style={{ fontSize: "12px", color: mutedColor, display: "block", marginBottom: "4px" }}>작가명</label>
                                            <input
                                                type="text"
                                                value={pick.name}
                                                onChange={(e) => handleUpdatePick(index, "name", e.target.value)}
                                                placeholder="예: 문혜경 작가"
                                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${borderColor}`, background: bgColor, color: textColor }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "12px", color: mutedColor, display: "block", marginBottom: "4px" }}>아카이브 주소 (URL)</label>
                                            <input
                                                type="text"
                                                value={pick.archiveUrl}
                                                onChange={(e) => handleUpdatePick(index, "archiveUrl", e.target.value)}
                                                placeholder="https://..."
                                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${borderColor}`, background: bgColor, color: textColor }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "12px", color: mutedColor, display: "block", marginBottom: "4px" }}>대표 이미지 주소 (선택사항)</label>
                                            <input
                                                type="text"
                                                value={pick.imageUrl || ""}
                                                onChange={(e) => handleUpdatePick(index, "imageUrl", e.target.value)}
                                                placeholder="이미지 URL (비워두면 기본 이미지)"
                                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${borderColor}`, background: bgColor, color: textColor }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleAddPick}
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    background: "transparent",
                                    color: settings.theme === "black" ? "#fff" : "#4488ff",
                                    border: `2px dashed ${settings.theme === "black" ? "#555" : "#4488ff"}`,
                                    borderRadius: "16px",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    fontSize: "15px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px"
                                }}
                            >
                                + 추천 작가 추가하기
                            </button>
                        </div>
                    </div>

                    {/* 비밀번호 변경 */}
                    <div
                        style={{
                            marginTop: "24px",
                            padding: "24px",
                            background: settings.theme === "black" ? "#2a2a2a" : "#f9fafb",
                            borderRadius: "16px",
                            border: `1px solid ${borderColor}`,
                        }}
                    >
                        <label
                            style={{
                                display: "block",
                                fontSize: "18px",
                                fontWeight: 600,
                                marginBottom: "16px",
                            }}
                        >
                            비밀번호 변경
                        </label>

                        {passwordChangeSuccess && (
                            <div
                                style={{
                                    padding: "12px",
                                    marginBottom: "16px",
                                    background: "#22c55e",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    fontSize: "14px",
                                }}
                            >
                                비밀번호가 변경되었습니다!
                            </div>
                        )}

                        {passwordChangeError && (
                            <div
                                style={{
                                    padding: "12px",
                                    marginBottom: "16px",
                                    background: "#dc2626",
                                    color: "#fff",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    fontSize: "14px",
                                }}
                            >
                                {passwordChangeError}
                            </div>
                        )}

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                fontSize: "16px",
                                border: `2px solid ${borderColor}`,
                                borderRadius: "10px",
                                background: bgColor,
                                color: textColor,
                                outline: "none",
                                marginBottom: "12px",
                            }}
                        />

                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="새 비밀번호 확인"
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                fontSize: "16px",
                                border: `2px solid ${borderColor}`,
                                borderRadius: "10px",
                                background: bgColor,
                                color: textColor,
                                outline: "none",
                                marginBottom: "16px",
                            }}
                        />

                        <button
                            onClick={handlePasswordChange}
                            style={{
                                width: "100%",
                                padding: "14px",
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#fff",
                                background: "#6366f1",
                                border: "none",
                                borderRadius: "10px",
                                cursor: "pointer",
                            }}
                        >
                            비밀번호 변경
                        </button>
                    </div>
                </div >

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        width: "100%",
                        marginTop: "48px",
                        padding: "20px",
                        fontSize: "20px",
                        fontWeight: 700,
                        color: settings.theme === "black" ? "#1a1a1a" : "#ffffff",
                        background: settings.theme === "black" ? "#ffffff" : "#1a1a1a",
                        border: "none",
                        borderRadius: "12px",
                        cursor: isSaving ? "not-allowed" : "pointer",
                        opacity: isSaving ? 0.7 : 1,
                    }}
                >
                    {isSaving ? "저장 중..." : "설정 저장하기"}
                </button>

                {/* 구독 취소 - 무료 모드가 아닐 때만 표시 */}
                {!isAlwaysFreeMode() && (
                    <div style={{
                        marginTop: "48px",
                        padding: "24px",
                        background: "rgba(220, 38, 38, 0.05)",
                        borderRadius: "16px",
                        border: "1px solid rgba(220, 38, 38, 0.2)",
                    }}>
                        <h3 style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#dc2626",
                            marginBottom: "12px",
                        }}>
                            구독 관리
                        </h3>
                        <p style={{
                            fontSize: "13px",
                            color: "#666",
                            marginBottom: "16px",
                            lineHeight: 1.6,
                        }}>
                            구독을 취소하면 갤러리가 흐린 유리로 덮여 비공개 상태가 됩니다.
                            저장된 작품과 설정은 그대로 유지되며, 다시 구독하면 복원됩니다.
                        </p>
                        <button
                            onClick={() => {
                                if (confirm('정말 구독을 취소하시겠습니까?\n\n취소 후 갤러리는 흐린 유리로 덮여 비공개 상태가 됩니다.\n작품과 설정은 그대로 유지됩니다.')) {
                                    resetPaymentStatus();
                                    alert('구독이 취소되었습니다.\n갤러리가 비공개 상태로 전환됩니다.');
                                    router.push('/');
                                }
                            }}
                            style={{
                                width: "100%",
                                padding: "14px",
                                fontSize: "15px",
                                fontWeight: 600,
                                color: "#dc2626",
                                background: "transparent",
                                border: "2px solid #dc2626",
                                borderRadius: "10px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#dc2626";
                                e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#dc2626";
                            }}
                        >
                            구독 취소하기
                        </button>
                    </div>
                )}

                {/* 힌트 */}
                < p
                    style={{
                        marginTop: "16px",
                        textAlign: "center",
                        fontSize: "14px",
                        color: "#888",
                    }}
                >
                    저장 후 갤러리 페이지를 새로고침하면 적용됩니다
                </p >
            </main >
        </div >
    );
}
