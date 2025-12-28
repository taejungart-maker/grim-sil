// 실시간 동기화 훅 - Supabase Realtime 사용
"use client";

import { useState, useEffect, useCallback } from "react";
import { Artwork } from "../data/artworks";
import { getAllArtworks } from "../utils/db";
import { supabase } from "../utils/supabase";

interface UseSyncedArtworksResult {
    artworks: Artwork[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useSyncedArtworks(): UseSyncedArtworksResult {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 작품 목록 로드
    const loadArtworks = useCallback(async () => {
        try {
            const data = await getAllArtworks();
            setArtworks(data);
            setError(null);
        } catch (err) {
            console.error("Failed to load artworks:", err);
            setError("작품을 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 초기 로드 및 Realtime 구독
    useEffect(() => {
        loadArtworks();

        // Supabase Realtime 구독
        const channel = supabase
            .channel("artworks-changes")
            .on(
                "postgres_changes",
                {
                    event: "*", // INSERT, UPDATE, DELETE 모두 수신
                    schema: "public",
                    table: "artworks",
                },
                (payload) => {
                    console.log("Realtime update:", payload.eventType);
                    // 변경사항 발생 시 전체 목록 새로고침
                    loadArtworks();
                }
            )
            .subscribe((status) => {
                console.log("Realtime subscription status:", status);
            });

        // 정리 함수
        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadArtworks]);

    return {
        artworks,
        isLoading,
        error,
        refresh: loadArtworks,
    };
}

// 설정 실시간 동기화 훅
import { SiteConfig, defaultSiteConfig } from "../config/site";
import { loadSettings, loadSettingsById } from "../utils/settingsDb";

interface UseSyncedSettingsResult {
    settings: SiteConfig;
    isLoading: boolean;
    refresh: () => Promise<void>;
}

// vipId가 있으면 해당 VIP 갤러리 전용 설정, 없으면 기본 설정
export function useSyncedSettings(vipId?: string): UseSyncedSettingsResult {
    const [settings, setSettings] = useState<SiteConfig>(defaultSiteConfig);
    const [isLoading, setIsLoading] = useState(true);

    const loadSettingsData = useCallback(async () => {
        try {
            // vipId가 있으면 해당 ID로 설정 불러오기, 없으면 기본 ARTIST_ID 사용
            const data = vipId
                ? await loadSettingsById(vipId)
                : await loadSettings();
            setSettings(data);
        } catch (err) {
            console.error("Failed to load settings:", err);
        } finally {
            setIsLoading(false);
        }
    }, [vipId]);

    useEffect(() => {
        loadSettingsData();

        // 설정 테이블 Realtime 구독
        const channel = supabase
            .channel("settings-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "settings",
                },
                () => {
                    console.log("Settings updated");
                    loadSettingsData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadSettingsData]);

    return {
        settings,
        isLoading,
        refresh: loadSettingsData,
    };
}
