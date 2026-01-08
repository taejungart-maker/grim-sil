"use client";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { defaultSiteConfig, SiteConfig } from "../config/site";
import { loadSettings, loadSettingsById, saveSettings, savePassword, savePasswordById, loadPasswordById } from "../utils/settingsDb";
import { exportAllData, importAllData, exportToClipboard, importFromClipboard, getAllArtworks, addArtwork, updateArtwork, deleteArtwork, uploadImageToStorage, getVisitorStats } from "../utils/db";
import { migrateLocalDataToSupabase, hasLegacyData, MigrationResult } from "../utils/migration";
import { migrateAllImagesToStorage, countBase64Images, MigrationProgress } from "../utils/imageMigration";
import { useAuth } from "../contexts/AuthContext";
import { resetPaymentStatus } from "../utils/paymentUtils";
import { isAlwaysFreeMode } from "../utils/deploymentMode";
import { getClientArtistId } from "../utils/getArtistId";
import { createVipArtist, getAllVipArtists, deleteVipArtist, generateVipLinkUrl, VipArtist } from "../utils/vipArtistDb";
import QRCode from "qrcode";
import { SIGNATURE_COLORS } from "../utils/themeColors";

import Link from "next/link";
import VipManagement from "../components/VipManagement";
import "./admin-buttons.css";


export default function AdminPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vipId = searchParams.get("vipId") || ""; // VIP ?몄씪利?媛ㅻ윭由?ID
    const effectiveArtistId = vipId || getClientArtistId();

    const { isAuthenticated, login, logout } = useAuth();
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState(false);

    // ?ㅼ젙 ?곹깭
    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // 鍮꾨?踰덊샇 蹂寃??곹깭
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordChangeError, setPasswordChangeError] = useState("");

    // ?듦퀎 愿???곹깭
    const [visitorStats, setVisitorStats] = useState<{ date: string, count: number }[]>([]);
    const [totalViews, setTotalViews] = useState(0);

    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    // QR 肄붾뱶 ?앹꽦 濡쒖쭅
    useEffect(() => {
        if (isAuthenticated) {
            // QR 肄붾뱶 ?앹꽦
            const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
            if (currentUrl) {
                const galleryUrl = vipId ? `${currentUrl}/gallery-${vipId}` : currentUrl;
                QRCode.toDataURL(galleryUrl, {
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

            // ?듦퀎 ?곗씠??媛?몄삤湲?            getVisitorStats(7).then(data => {
            setVisitorStats(data);
            const total = data.reduce((acc, curr) => acc + curr.count, 0);
            setTotalViews(total);
        });
}
    }, [isAuthenticated]);
const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

// ?곗씠??諛깆뾽 ?곹깭
const [isExporting, setIsExporting] = useState(false);
const [isImporting, setIsImporting] = useState(false);
const [importMessage, setImportMessage] = useState("");
const [exportText, setExportText] = useState(""); // ?섎룞 蹂듭궗???띿뒪??    const [importText, setImportText] = useState(""); // ?섎룞 遺숈뿬?ｊ린???띿뒪??
// 留덉씠洹몃젅?댁뀡 ?곹깭
const [isMigrating, setIsMigrating] = useState(false);
const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
const [legacyDataInfo, setLegacyDataInfo] = useState<{ hasArtworks: boolean; hasSettings: boolean; artworksCount: number } | null>(null);

// ?대?吏 留덉씠洹몃젅?댁뀡 ?곹깭
const [isImageMigrating, setIsImageMigrating] = useState(false);
const [imageMigrationProgress, setImageMigrationProgress] = useState<MigrationProgress | null>(null);
const [base64ImageCount, setBase64ImageCount] = useState<number>(0);

// ?ㅼ젙 遺덈윭?ㅺ린 + ?덇굅???곗씠???뺤씤
useEffect(() => {
    if (vipId) {
        loadSettingsById(vipId).then(setSettings);
    } else {
        loadSettings().then(setSettings);
    }
    hasLegacyData().then(setLegacyDataInfo);
    countBase64Images().then(setBase64ImageCount);
}, [vipId]);

// 鍮꾨?踰덊샇 ?뺤씤 (?꾩뿭 濡쒓렇???ъ슜)
const handleLogin = async () => {
    const success = await login(password);
    if (success) {
        setPasswordError(false);
        // 濡쒓렇???깃났 ??硫붿씤 ?붾㈃?쇰줈 ?대룞 (?덉쟾 ?뺤콉)
        router.push("/");
    } else {
        setPasswordError(true);
    }
};

// ?ㅼ젙 ???    const handleSave = async () => {
setIsSaving(true);
setSaveSuccess(false);
try {
    await saveSettings(settings, vipId || undefined);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    // VIP ????쒖뿉???덉쑝濡??대룞?섏? ?딄퀬 ?깃났 硫붿떆吏留??쒖떆
    if (!vipId) {
        router.push("/");
    }
} catch (error) {
    console.error("Save error:", error);
    alert("?ㅼ젙 ???以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
} finally {
    setIsSaving(false);
}
    };

// 鍮꾨?踰덊샇 蹂寃?    const handlePasswordChange = async () => {
setPasswordChangeError("");
setPasswordChangeSuccess(false);

if (newPassword.length < 4) {
    setPasswordChangeError("鍮꾨?踰덊샇??4???댁긽?댁뼱???⑸땲??);
            return;
}

if (newPassword !== confirmPassword) {
    setPasswordChangeError("鍮꾨?踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎");
    return;
}

try {
    if (vipId) {
        await savePasswordById(vipId, newPassword);
    } else {
        await savePassword(newPassword);
    }
    setPasswordChangeSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordChangeSuccess(false), 3000);
} catch (error) {
    console.error("Failed to change password:", error);
    setPasswordChangeError("鍮꾨?踰덊샇 蹂寃쎌뿉 ?ㅽ뙣?덉뒿?덈떎");
}
    };

// ?숇즺 ?묎? 異붿쿇 (Artist's Pick) 異붽?/?섏젙/??젣 濡쒖쭅
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

// ?뚮쭏 ?됱긽
const bgColor = settings.theme === "black" ? "#1a1a1a" : "#ffffff";
const textColor = settings.theme === "black" ? "#ffffff" : "#1a1a1a";
const borderColor = settings.theme === "black" ? "#333" : "#e5e7eb";
const mutedColor = settings.theme === "black" ? "#a0a0a0" : "#6b7280";

// 鍮꾨?踰덊샇 ?낅젰 ?붾㈃
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
                    愿由ъ옄 濡쒓렇??                    </h1>
                <p
                    style={{
                        fontSize: "18px",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        color: "#666",
                        textAlign: "center",
                        marginBottom: "32px",
                    }}
                >
                    ?ㅼ젙??蹂寃쏀븯?ㅻ㈃ 鍮꾨?踰덊샇瑜??낅젰?섏꽭??                    </p>

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="鍮꾨?踰덊샇 ?낅젰"
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
                        鍮꾨?踰덊샇媛 ??몄뒿?덈떎
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
                    濡쒓렇??                    </button>

                {/* 鍮꾨?踰덊샇 李얘린 留곹겕 */}
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
                        鍮꾨?踰덊샇瑜??딆쑝?⑤굹??
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
                    ???뚯븘媛湲?                    </button>
            </div>
        </div>
    );
}

// ?ㅼ젙 ?섏씠吏
return (
    <div
        className="min-h-screen"
        style={{ background: bgColor, color: textColor }}
    >
        {/* ?ㅻ뜑 */}
        <header
            style={{
                padding: "20px 24px",
                borderBottom: `1px solid ${borderColor}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    fontFamily: "'Noto Sans KR', sans-serif",
                    color: settings.theme === "black" ? "#ffffff" : "#8b7355"
                }}>
                    媛ㅻ윭由??ㅼ젙
                </h1>
                <span style={{
                    padding: "4px 8px",
                    background: vipId ? "#6366f1" : "rgba(0,0,0,0.05)",
                    color: vipId ? "#fff" : "#888",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    fontFamily: "monospace"
                }}>
                    ID: {effectiveArtistId}
                </span>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        padding: "10px 20px",
                        fontSize: "14px",
                        background: "#6366f1",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: 700,
                        opacity: isSaving ? 0.7 : 1,
                    }}
                >
                    {isSaving ? "???以?.." : "?ㅼ젙 ???}
                    </button>
                <button
                    onClick={() => router.push("/")}
                    style={{
                        padding: "10px 20px",
                        fontSize: "14px",
                        background: settings.theme === "black" ? "#333" : "#f3f4f6",
                        color: settings.theme === "black" ? "#ffffff" : "#1a1a1a",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                >
                    ???섍?湲?                    </button>
            </div>
        </header>

        {/* ?쒕ぉ ?곷떒 ?щ갚 */}
        <div style={{ height: "20px" }} />

        {/* ?ㅼ젙 ??*/}
        <main
            className="max-w-2xl mx-auto"
            style={{ padding: "32px 24px" }}
        >
            {/* ????깃났 硫붿떆吏 */}
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
                    ?ㅼ젙????λ릺?덉뒿?덈떎!
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {/* 媛ㅻ윭由??대쫫 (?곷Ц) */}
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "18px",
                            fontWeight: 600,
                            marginBottom: "12px",
                        }}
                    >
                        媛ㅻ윭由??대쫫 (?곷Ц)
                    </label>
                    <input
                        type="text"
                        value={settings.galleryNameEn}
                        onChange={(e) => setSettings({ ...settings, galleryNameEn: e.target.value })}
                        placeholder="?? MY GALLERY"
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

                {/* 媛ㅻ윭由??대쫫 (?쒓?) */}
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "18px",
                            fontWeight: 600,
                            marginBottom: "12px",
                        }}
                    >
                        媛ㅻ윭由??대쫫 (?쒓?)
                    </label>
                    <input
                        type="text"
                        value={settings.galleryNameKo}
                        onChange={(e) => setSettings({ ...settings, galleryNameKo: e.target.value })}
                        placeholder="?? 留덉씠媛ㅻ윭由?
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

                {/* ?묎? ?대쫫 */}
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "18px",
                            fontWeight: 600,
                            marginBottom: "12px",
                        }}
                    >
                        ?묎? ?대쫫
                    </label>
                    <input
                        type="text"
                        value={settings.artistName}
                        onChange={(e) => setSettings({ ...settings, artistName: e.target.value })}
                        placeholder="?? ?띻만??
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

                {/* ?ъ씠???쒕ぉ (釉뚮씪?곗? ??& 留곹겕 怨듭쑀) */}
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "18px",
                            fontWeight: 600,
                            marginBottom: "12px",
                        }}
                    >
                        ?ъ씠???쒕ぉ (釉뚮씪?곗? ??& 留곹겕 怨듭쑀)
                    </label>
                    <input
                        type="text"
                        value={settings.siteTitle}
                        onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
                        placeholder="?? 諛뺤빞??媛ㅻ윭由?
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
                        移댁뭅?ㅽ넚?대굹 SNS??留곹겕瑜?怨듭쑀?????쒖떆?섎뒗 ?쒕ぉ?낅땲??
                    </p>
                </div>

                {/* ?ъ씠???ㅻ챸 (SEO) */}
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "18px",
                            fontWeight: 600,
                            marginBottom: "12px",
                        }}
                    >
                        ?ъ씠???ㅻ챸 (SEO)
                    </label>
                    <textarea
                        value={settings.siteDescription}
                        onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                        placeholder="?? 諛뺤빞???묎????묓뭹?멸퀎瑜??댁? ?⑤씪???붿꺽?낅땲??"
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
                        留곹겕 怨듭쑀 ???④퍡 ?쒖떆?섎뒗 ?ㅻ챸臾몄엯?덈떎.
                    </p>
                </div>

                {/* ?뚮쭏 ?됱긽 */}
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "18px",
                            fontWeight: 600,
                            marginBottom: "12px",
                        }}
                    >
                        ?뚮쭏 ?됱긽
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
                            ?붿씠??                            </button>
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
                            釉붾옓
                        </button>
                    </div>
                </div>

                {/* ?묓뭹 諛곗뿴 */}
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "18px",
                            fontWeight: 600,
                            marginBottom: "12px",
                        }}
                    >
                        ?묓뭹 諛곗뿴
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
                                {cols === 1 ? "1?? : cols === 3 ? "3?? : "4??}
                            </button>
                        ))}
                    </div>
                    <p style={{ marginTop: "8px", fontSize: "14px", color: "#888" }}>
                        {settings.gridColumns === 1 && "???대?吏濡???以꾩뵫 ?쒖떆"}
                        {settings.gridColumns === 3 && "洹좎씪??3??洹몃━??}
                            {settings.gridColumns === 4 && "?ㅼ뼇???ш린??媛ㅻ윭由??ㅽ???}
                        </p>
                </div>

                {/* 媛寃??쒖떆 */}
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "18px",
                            fontWeight: 600,
                            marginBottom: "12px",
                        }}
                    >
                        媛寃??쒖떆
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
                            ?몄텧
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
                            鍮꾨끂異?                            </button>
                    </div>
                    <p style={{ marginTop: "8px", fontSize: "14px", color: "#888" }}>
                        ?묓뭹??媛寃⑹씠 ?낅젰??寃쎌슦?먮쭔 ?쒖떆?⑸땲??                        </p>
                </div>

                {/* ????묎??명듃 */}
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: "18px",
                            fontWeight: 600,
                            marginBottom: "12px",
                        }}
                    >
                        ????묎??명듃
                    </label>
                    <textarea
                        value={settings.defaultArtistNote || ""}
                        onChange={(e) => setSettings({ ...settings, defaultArtistNote: e.target.value })}
                        placeholder="?? ???묓뭹? ?먯뿰怨??멸컙??議고솕瑜??쒗쁽???쒕━利덉엯?덈떎. ?묎???源딆? 泥좏븰怨??덉닠??鍮꾩쟾???댁븯?듬땲??"
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

                {/* ?뫀 ?묎? ?뚭컻 & ?됰줎 ?ㅼ젙 */}
                <div style={{
                    marginTop: "40px",
                    paddingTop: "40px",
                    borderTop: `2px solid ${borderColor}`,
                }}>
                    <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>
                        ?묎? ?뚭컻 & ?됰줎 ?ㅼ젙
                    </h2>

                    {/* ?묎? ?ъ쭊 ?낅줈??*/}
                    <div style={{ marginBottom: "32px" }}>
                        <label style={{ display: "block", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
                            ?묎? ?꾨줈???ъ쭊
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
                                        alt="?꾨줈??
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
                                                const url = await uploadImageToStorage(file, effectiveArtistId);
                                                setSettings({ ...settings, aboutmeImage: url });
                                            } catch (err) {
                                                alert("?ъ쭊 ?낅줈?쒖뿉 ?ㅽ뙣?덉뒿?덈떎.");
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
                                    ?ъ쭊 蹂寃쏀븯湲?                                    </label>
                                <p style={{ fontSize: "14px", color: "#888" }}>
                                    ?묎? ?뚭컻 ?섏씠吏???쒖떆???꾨줈???ъ쭊?낅땲??
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ?묎??명듃 ?몄텧 ?щ? */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
                            ?묎??명듃 ?몄텧
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
                                ?몄텧
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
                                鍮꾨끂異?                                </button>
                        </div>
                    </div>

                    {/* ?묎??명듃 ?댁슜 */}
                    <div style={{ marginBottom: "32px" }}>
                        <textarea
                            value={settings.aboutmeNote || ""}
                            onChange={(e) => setSettings({ ...settings, aboutmeNote: e.target.value })}
                            placeholder="?묎?濡쒖꽌??泥좏븰怨??묓뭹 ?멸퀎瑜??ㅻ챸??二쇱꽭??"
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

                    {/* ?됰줎 ?몄텧 ?щ? */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
                            ?됰줎 ?몄텧
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
                                ?몄텧
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
                                鍮꾨끂異?                                </button>
                        </div>
                    </div>

                    {/* ?됰줎 ?댁슜 */}
                    <div style={{ marginBottom: "32px" }}>
                        <textarea
                            value={settings.aboutmeCritique || ""}
                            onChange={(e) => setSettings({ ...settings, aboutmeCritique: e.target.value })}
                            placeholder="?묓뭹??????됰줎媛???섍껄?대굹 ?꾩떆 鍮꾪룊???낅젰??二쇱꽭??"
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

                    {/* ?쎈젰 ?몄텧 ?щ? */}
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontSize: "18px", fontWeight: 600, marginBottom: "12px" }}>
                            ?쎈젰(寃쎈젰) ?몄텧
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
                                ?몄텧
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
                                鍮꾨끂異?                                </button>
                        </div>
                    </div>

                    {/* ?쎈젰 ?댁슜 */}
                    <div style={{ marginBottom: "32px" }}>
                        <textarea
                            value={settings.aboutmeHistory || ""}
                            onChange={(e) => setSettings({ ...settings, aboutmeHistory: e.target.value })}
                            placeholder="?숇젰, 二쇱슂 ?꾩떆 寃쎈젰, ?섏긽 ?댁뿭 ?깆쓣 ?낅젰??二쇱꽭??"
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



                {/* ?뱽 ?ㅼ떆媛??댁뒪 ?ㅼ젙 (News Ticker) */}
                <div style={{
                    marginTop: "48px",
                    padding: "32px",
                    background: settings.theme === "black" ? "#1a1a1a" : "#fff9f0",
                    borderRadius: "24px",
                    border: `2px solid ${settings.theme === "black" ? "#333" : SIGNATURE_COLORS.royalIndigo}`,
                }}>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px", color: SIGNATURE_COLORS.royalIndigo }}>
                        ?뱽 ?ㅼ떆媛??댁뒪 臾멸뎄 愿由?                        </h3>
                    <p style={{ color: mutedColor, fontSize: "14px", marginBottom: "20px" }}>
                        ?ㅻ뜑 ?곷떒?먯꽌 ?먮Ⅴ??怨듭??ы빆?대굹 ?꾩떆 ?뚯떇??吏곸젒 ?낅젰??蹂댁꽭??
                    </p>
                    <textarea
                        value={settings.newsText || ""}
                        onChange={(e) => setSettings({ ...settings, newsText: e.target.value })}
                        placeholder="?꾩떆 ?쇱젙?대굹 ?섏쁺 ?몄궗瑜??낅젰??蹂댁꽭?? (?? ?렓 12??媛쒖씤??'寃⑥슱??湲곗뼲' 吏꾪뻾 以?..)"
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

                {/* ?렞 VIP 留곹겕 ?먮룞 ?앹꽦 ?쒖뒪??(?④? 泥섎━) */}
                <div style={{ display: "none" }}>
                    <VipManagement
                        bgColor={bgColor}
                        textColor={textColor}
                        borderColor={borderColor}
                        mutedColor={mutedColor}
                    />
                </div>

                {/* ?띾낫 ?꾧뎄: QR ?붿???紐낇븿 */}
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
                            ?묎??섏쓽 ?붿???紐낇븿 (QR)
                        </h2>
                        <p style={{ color: mutedColor, fontSize: "15px", marginTop: "8px" }}>
                            ?꾩떆?μ씠??紐낇븿???몄뇙?섏뿬 愿?뚭컼??媛ㅻ윭由щ줈 珥덈??섏꽭??
                        </p>
                    </div>

                    {qrCodeUrl ? (
                        <div style={{ display: "inline-block", padding: "16px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                            <img src={qrCodeUrl} alt="Gallery QR Code" style={{ width: "200px", height: "200px", display: "block" }} />
                        </div>
                    ) : (
                        <div style={{ width: "200px", height: "200px", margin: "0 auto", background: "#eee", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#999" }}>?앹꽦 以?..</span>
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
                            QR 肄붾뱶 ?대?吏 ?ㅼ슫濡쒕뱶
                        </a>
                    </div>
                </div>

                {/* ?렓 ?숇즺 ?묎? 異붿쿇 ?ㅼ젙 (Artist's Pick) */}
                <div style={{
                    marginTop: "40px",
                    padding: "32px",
                    background: settings.theme === "black" ? "#1a1a1a" : "#f0f4ff",
                    borderRadius: "24px",
                    border: `2px solid ${settings.theme === "black" ? "#333" : "#4488ff"}`,
                }}>
                    <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                        ?뵕 ?숇즺 ?묎? 異붿쿇 (Artist's Pick)
                    </h2>
                    <p style={{ color: mutedColor, fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
                        ?④퍡 ?쒕룞?섎뒗 ?숇즺 ?묎??섎뱾??異붿쿇??蹂댁꽭?? <br />
                        ?숇즺???꾩뭅?대툕 二쇱냼? ????ъ쭊 留곹겕瑜??낅젰?섎㈃ 硫붿씤 ?붾㈃ ?섎떒???쒖떆?⑸땲??
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
                                    ??                                    </button>

                                <div style={{ display: "grid", gap: "12px" }}>
                                    <div>
                                        <label style={{ fontSize: "12px", color: mutedColor, display: "block", marginBottom: "4px" }}>?묎?紐?/label>
                                            <input
                                                type="text"
                                                value={pick.name}
                                                onChange={(e) => handleUpdatePick(index, "name", e.target.value)}
                                                placeholder="?? 臾명삙寃??묎?"
                                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${borderColor}`, background: bgColor, color: textColor }}
                                            />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "12px", color: mutedColor, display: "block", marginBottom: "4px" }}>?꾩뭅?대툕 二쇱냼 (URL)</label>
                                        <input
                                            type="text"
                                            value={pick.archiveUrl}
                                            onChange={(e) => handleUpdatePick(index, "archiveUrl", e.target.value)}
                                            placeholder="https://..."
                                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${borderColor}`, background: bgColor, color: textColor }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "12px", color: mutedColor, display: "block", marginBottom: "4px" }}>????대?吏 二쇱냼 (?좏깮?ы빆)</label>
                                        <input
                                            type="text"
                                            value={pick.imageUrl || ""}
                                            onChange={(e) => handleUpdatePick(index, "imageUrl", e.target.value)}
                                            placeholder="?대?吏 URL (鍮꾩썙?먮㈃ 湲곕낯 ?대?吏)"
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
                            + 異붿쿇 ?묎? 異붽??섍린
                        </button>
                    </div>
                </div>

                {/* 鍮꾨?踰덊샇 蹂寃?*/}
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
                        鍮꾨?踰덊샇 蹂寃?                        </label>

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
                            鍮꾨?踰덊샇媛 蹂寃쎈릺?덉뒿?덈떎!
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
                        placeholder="??鍮꾨?踰덊샇"
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
                        placeholder="??鍮꾨?踰덊샇 ?뺤씤"
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
                        鍮꾨?踰덊샇 蹂寃?                        </button>
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
                {isSaving ? "???以?.." : "?ㅼ젙 ??ν븯湲?}
                </button>

            {/* 援щ룆 痍⑥냼 - 臾대즺 紐⑤뱶媛 ?꾨땺 ?뚮쭔 ?쒖떆 */}
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
                        援щ룆 愿由?                        </h3>
                    <p style={{
                        fontSize: "13px",
                        color: "#666",
                        marginBottom: "16px",
                        lineHeight: 1.6,
                    }}>
                        援щ룆??痍⑥냼?섎㈃ 媛ㅻ윭由ш? ?먮┛ ?좊━濡???뿬 鍮꾧났媛??곹깭媛 ?⑸땲??
                        ??λ맂 ?묓뭹怨??ㅼ젙? 洹몃?濡??좎??섎ŉ, ?ㅼ떆 援щ룆?섎㈃ 蹂듭썝?⑸땲??
                    </p>
                    <button
                        onClick={() => {
                            if (confirm('?뺣쭚 援щ룆??痍⑥냼?섏떆寃좎뒿?덇퉴?\n\n痍⑥냼 ??媛ㅻ윭由щ뒗 ?먮┛ ?좊━濡???뿬 鍮꾧났媛??곹깭媛 ?⑸땲??\n?묓뭹怨??ㅼ젙? 洹몃?濡??좎??⑸땲??')) {
                                resetPaymentStatus();
                                alert('援щ룆??痍⑥냼?섏뿀?듬땲??\n媛ㅻ윭由ш? 鍮꾧났媛??곹깭濡??꾪솚?⑸땲??');
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
                        援щ룆 痍⑥냼?섍린
                    </button>
                </div>
            )}

            {/* ?뚰듃 */}
            < p
                style={{
                    marginTop: "16px",
                    textAlign: "center",
                    fontSize: "14px",
                    color: "#888",
                }}
            >
                ?????媛ㅻ윭由??섏씠吏瑜??덈줈怨좎묠?섎㈃ ?곸슜?⑸땲??                </p >
        </main >
    </div >
);
}
