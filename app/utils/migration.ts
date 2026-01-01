// IndexedDB → Supabase 데이터 마이그레이션 유틸리티
// 기존 로컬 데이터를 Supabase로 이전

import { Artwork } from "../data/artworks";
import { SiteConfig, defaultSiteConfig } from "../config/site";
import { getSupabaseClient } from "./supabase";
import { addArtwork, getAllArtworks } from "./db";
import { unstable_noStore as noStore } from "next/cache";

// ====================================
// IndexedDB 직접 읽기 (레거시 데이터)
// ====================================

const LEGACY_DB_NAME = "grimsil-db";
const LEGACY_DB_VERSION = 1;
const LEGACY_ARTWORKS_STORE = "artworks";

const LEGACY_SETTINGS_DB = "grimsil-settings";
const LEGACY_SETTINGS_STORE = "settings";

// 레거시 IndexedDB에서 작품 데이터 읽기
async function readLegacyArtworks(): Promise<Artwork[]> {
    return new Promise((resolve) => {
        const request = indexedDB.open(LEGACY_DB_NAME, LEGACY_DB_VERSION);

        request.onerror = () => {
            console.log("No legacy artworks database found");
            resolve([]);
        };

        request.onupgradeneeded = () => {
            // DB가 없어서 새로 만들어지는 경우 - 데이터 없음
            resolve([]);
        };

        request.onsuccess = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(LEGACY_ARTWORKS_STORE)) {
                resolve([]);
                return;
            }

            const transaction = db.transaction(LEGACY_ARTWORKS_STORE, "readonly");
            const store = transaction.objectStore(LEGACY_ARTWORKS_STORE);
            const getAllRequest = store.getAll();

            getAllRequest.onerror = () => resolve([]);
            getAllRequest.onsuccess = () => {
                const artworks = getAllRequest.result || [];
                resolve(artworks);
            };
        };
    });
}

// 레거시 IndexedDB에서 설정 데이터 읽기
async function readLegacySettings(): Promise<SiteConfig | null> {
    return new Promise((resolve) => {
        const request = indexedDB.open(LEGACY_SETTINGS_DB, 1);

        request.onerror = () => {
            console.log("No legacy settings database found");
            resolve(null);
        };

        request.onupgradeneeded = () => {
            resolve(null);
        };

        request.onsuccess = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(LEGACY_SETTINGS_STORE)) {
                resolve(null);
                return;
            }

            const transaction = db.transaction(LEGACY_SETTINGS_STORE, "readonly");
            const store = transaction.objectStore(LEGACY_SETTINGS_STORE);
            const getRequest = store.get("siteConfig");

            getRequest.onerror = () => resolve(null);
            getRequest.onsuccess = () => {
                resolve(getRequest.result || null);
            };
        };
    });
}

// 레거시 IndexedDB에서 비밀번호 읽기
async function readLegacyPassword(): Promise<string | null> {
    return new Promise((resolve) => {
        const request = indexedDB.open(LEGACY_SETTINGS_DB, 1);

        request.onerror = () => resolve(null);
        request.onupgradeneeded = () => resolve(null);

        request.onsuccess = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(LEGACY_SETTINGS_STORE)) {
                resolve(null);
                return;
            }

            const transaction = db.transaction(LEGACY_SETTINGS_STORE, "readonly");
            const store = transaction.objectStore(LEGACY_SETTINGS_STORE);
            const getRequest = store.get("adminPassword");

            getRequest.onerror = () => resolve(null);
            getRequest.onsuccess = () => {
                resolve(getRequest.result || null);
            };
        };
    });
}

// ====================================
// 마이그레이션 실행
// ====================================

export interface MigrationResult {
    success: boolean;
    artworksCount: number;
    settingsMigrated: boolean;
    passwordMigrated: boolean;
    errors: string[];
}

export async function migrateLocalDataToSupabase(): Promise<MigrationResult> {
    const result: MigrationResult = {
        success: false,
        artworksCount: 0,
        settingsMigrated: false,
        passwordMigrated: false,
        errors: [],
    };

    try {
        // 1. 기존 작품 데이터 마이그레이션
        console.log("Reading legacy artworks...");
        const legacyArtworks = await readLegacyArtworks();
        console.log(`Found ${legacyArtworks.length} legacy artworks`);

        if (legacyArtworks.length > 0) {
            // 이미 Supabase에 있는 작품 ID 확인
            const existingArtworks = await getAllArtworks();
            const existingIds = new Set(existingArtworks.map(a => a.id));

            for (const artwork of legacyArtworks) {
                if (existingIds.has(artwork.id)) {
                    console.log(`Artwork ${artwork.id} already exists, skipping`);
                    continue;
                }

                try {
                    await addArtwork(artwork);
                    result.artworksCount++;
                    console.log(`Migrated artwork: ${artwork.title}`);
                } catch (err) {
                    const errorMsg = `Failed to migrate artwork ${artwork.title}: ${err}`;
                    console.error(errorMsg);
                    result.errors.push(errorMsg);
                }
            }
        }

        // 2. 설정 데이터 마이그레이션
        console.log("Reading legacy settings...");
        const legacySettings = await readLegacySettings();

        if (legacySettings) {
            const settingsRow = {
                id: "default",
                gallery_name_en: legacySettings.galleryNameEn || defaultSiteConfig.galleryNameEn,
                gallery_name_ko: legacySettings.galleryNameKo || defaultSiteConfig.galleryNameKo,
                artist_name: legacySettings.artistName || defaultSiteConfig.artistName,
                site_title: legacySettings.siteTitle || defaultSiteConfig.siteTitle,
                site_description: legacySettings.siteDescription || defaultSiteConfig.siteDescription,
                theme: legacySettings.theme || defaultSiteConfig.theme,
                grid_columns: legacySettings.gridColumns || defaultSiteConfig.gridColumns,
                show_price: legacySettings.showPrice ?? defaultSiteConfig.showPrice,
                default_artist_note: legacySettings.defaultArtistNote || "",
                updated_at: new Date().toISOString(),
            };

            const supabase = getSupabaseClient();
            const { error } = await supabase
                .from("settings")
                .upsert(settingsRow, { onConflict: "id" });

            if (error) {
                result.errors.push(`Settings migration failed: ${error.message}`);
            } else {
                result.settingsMigrated = true;
                console.log("Settings migrated successfully");
            }
        }

        // 3. 비밀번호 마이그레이션
        console.log("Reading legacy password...");
        const legacyPassword = await readLegacyPassword();

        if (legacyPassword) {
            const supabase = getSupabaseClient();
            const { error } = await supabase
                .from("settings")
                .upsert({
                    id: "default",
                    admin_password: legacyPassword,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "id" });

            if (error) {
                result.errors.push(`Password migration failed: ${error.message}`);
            } else {
                result.passwordMigrated = true;
                console.log("Password migrated successfully");
            }
        }

        result.success = result.errors.length === 0;
        return result;

    } catch (error) {
        result.errors.push(`Migration failed: ${error}`);
        return result;
    }
}

// 레거시 데이터 존재 여부 확인
export async function hasLegacyData(): Promise<{
    hasArtworks: boolean;
    hasSettings: boolean;
    artworksCount: number;
}> {
    const artworks = await readLegacyArtworks();
    const settings = await readLegacySettings();

    return {
        hasArtworks: artworks.length > 0,
        hasSettings: settings !== null,
        artworksCount: artworks.length,
    };
}
