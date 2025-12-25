// 설정 저장소 - Supabase를 사용하여 클라우드 동기화
import { SiteConfig, defaultSiteConfig } from "../config/site";
import { supabase } from "./supabase";

const SETTINGS_ID = "default";

// 설정 Row 타입
interface SettingsRow {
    id: string;
    gallery_name_en: string;
    gallery_name_ko: string;
    artist_name: string;
    site_title: string;
    site_description: string;
    theme: "white" | "black";
    grid_columns: 1 | 3 | 4;
    show_price: boolean;
    default_artist_note: string;
    show_artist_note: boolean;
    show_critique: boolean;
    show_history: boolean;
    aboutme_note: string;
    aboutme_critique: string;
    aboutme_history: string;
    aboutme_image: string;
    admin_password: string;
    updated_at: string;
}

// Row를 SiteConfig로 변환
function rowToConfig(row: SettingsRow): SiteConfig {
    return {
        galleryNameEn: row.gallery_name_en,
        galleryNameKo: row.gallery_name_ko,
        artistName: row.artist_name,
        siteTitle: row.site_title,
        siteDescription: row.site_description,
        theme: row.theme,
        gridColumns: row.grid_columns,
        showPrice: row.show_price,
        defaultArtistNote: row.default_artist_note,
        showArtistNote: row.show_artist_note ?? true,
        showCritique: row.show_critique ?? false,
        showHistory: row.show_history ?? false,
        aboutmeNote: row.aboutme_note || "",
        aboutmeCritique: row.aboutme_critique || "",
        aboutmeHistory: row.aboutme_history || "",
        aboutmeImage: row.aboutme_image || "",
    };
}

// SiteConfig를 Row 형태로 변환
function configToRow(config: SiteConfig): Partial<SettingsRow> {
    return {
        gallery_name_en: config.galleryNameEn,
        gallery_name_ko: config.galleryNameKo,
        artist_name: config.artistName,
        site_title: config.siteTitle,
        site_description: config.siteDescription,
        theme: config.theme,
        grid_columns: config.gridColumns,
        show_price: config.showPrice,
        default_artist_note: config.defaultArtistNote || "",
        show_artist_note: config.showArtistNote,
        show_critique: config.showCritique,
        show_history: config.showHistory,
        aboutme_note: config.aboutmeNote || "",
        aboutme_critique: config.aboutmeCritique || "",
        aboutme_history: config.aboutmeHistory || "",
        aboutme_image: config.aboutmeImage || "",
    };
}

// 설정 불러오기
export async function loadSettings(): Promise<SiteConfig> {
    try {
        const { data, error } = await supabase
            .from("settings")
            .select("*")
            .eq("id", SETTINGS_ID)
            .single();

        if (error || !data) {
            console.log("No settings found, using defaults");
            return defaultSiteConfig;
        }

        return rowToConfig(data as SettingsRow);
    } catch {
        console.error("Failed to load settings");
        return defaultSiteConfig;
    }
}

// 설정 저장 (upsert)
export async function saveSettings(config: SiteConfig): Promise<void> {
    const row = {
        id: SETTINGS_ID,
        ...configToRow(config),
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from("settings")
        .upsert(row, { onConflict: "id" });

    if (error) {
        console.error("Failed to save settings:", error);
        throw error;
    }
}

// 설정 초기화
export async function resetSettings(): Promise<void> {
    return saveSettings(defaultSiteConfig);
}

// ====================================
// 비밀번호 관리
// ====================================

const DEFAULT_PASSWORD = "admin1234";

// 비밀번호 불러오기
export async function loadPassword(): Promise<string> {
    try {
        const { data, error } = await supabase
            .from("settings")
            .select("admin_password")
            .eq("id", SETTINGS_ID)
            .single();

        if (error || !data || !data.admin_password) {
            return DEFAULT_PASSWORD;
        }

        return data.admin_password;
    } catch {
        return DEFAULT_PASSWORD;
    }
}

// 비밀번호 저장
export async function savePassword(password: string): Promise<void> {
    const { error } = await supabase
        .from("settings")
        .upsert({
            id: SETTINGS_ID,
            admin_password: password,
            updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

    if (error) {
        console.error("Failed to save password:", error);
        throw error;
    }
}

// 비밀번호 확인
export async function verifyPassword(input: string): Promise<boolean> {
    const savedPassword = await loadPassword();
    return input === savedPassword;
}
