// 설정 저장소 - Supabase를 사용하여 클라우드 동기화
import { SiteConfig, defaultSiteConfig } from "..//config/site";
import { supabase, ARTIST_ID } from "./supabase";

// 각 작가별로 고유한 설정 ID 사용
const SETTINGS_ID = ARTIST_ID;

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
    artist_picks: { name: string; archiveUrl: string; imageUrl?: string }[];
    news_text: string;
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
        artistPicks: row.artist_picks || [],
        newsText: row.news_text || "",
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
        artist_picks: config.artistPicks || [],
        news_text: config.newsText || "",
    };
}

// 설정 불러오기
export async function loadSettings(): Promise<SiteConfig> {
    // 서버측에서 실행될 때 최신 환경 변수를 반영하도록 직접 체크
    const runtimeArtistId = process.env.NEXT_PUBLIC_ARTIST_ID || "default";
    return loadSettingsById(runtimeArtistId);
}

// 특정 작가 ID의 설정 불러오기
export async function loadSettingsById(artistId: string): Promise<SiteConfig> {
    try {
        const { data, error } = await supabase
            .from("settings")
            .select("*")
            .eq("id", artistId)
            .single();

        if (error || !data) {
            console.log(`No settings found for ${artistId}, using defaults`);
            return defaultSiteConfig;
        }

        return rowToConfig(data as SettingsRow);
    } catch {
        console.error(`Failed to load settings for ${artistId}`);
        return defaultSiteConfig;
    }
}

// 설정 저장 (upsert)
export async function saveSettings(config: SiteConfig, overrideId?: string): Promise<void> {
    const settingsId = overrideId || SETTINGS_ID;
    const row = {
        id: settingsId,
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

/**
 * [초간단 상생] 동료 작가 추천 즉시 추가
 * @param ownerId 추천을 추가할 작가 나의 ID
 * @param pick 추가할 동료 작가 정보
 */
export async function quickAddPick(ownerId: string, pick: { name: string; archiveUrl: string; imageUrl?: string }): Promise<void> {
    const config = await loadSettingsById(ownerId);

    // 중복 확인 (URL 기준)
    const exists = config.artistPicks.some(p => p.archiveUrl === pick.archiveUrl);
    if (exists) return;

    const updatedConfig = {
        ...config,
        artistPicks: [...config.artistPicks, pick]
    };

    const row = {
        id: ownerId,
        ...configToRow(updatedConfig),
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from("settings")
        .upsert(row, { onConflict: "id" });

    if (error) throw error;
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

// ====================================
// VIP 갤러리용 비밀번호 관리
// ====================================

// VIP 갤러리 비밀번호 불러오기
export async function loadPasswordById(artistId: string): Promise<string> {
    try {
        const { data, error } = await supabase
            .from("settings")
            .select("admin_password")
            .eq("id", artistId)
            .single();

        if (error || !data || !data.admin_password) {
            return DEFAULT_PASSWORD;
        }

        return data.admin_password;
    } catch {
        return DEFAULT_PASSWORD;
    }
}

// VIP 갤러리 비밀번호 저장
export async function savePasswordById(artistId: string, password: string): Promise<void> {
    const { error } = await supabase
        .from("settings")
        .upsert({
            id: artistId,
            admin_password: password,
            updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

    if (error) {
        console.error("Failed to save password:", error);
        throw error;
    }
}
