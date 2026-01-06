"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getYearMonths, Artwork, YearMonthKey, createYearMonthKey } from "../data/artworks";
import { loadDemoDataIfEmpty } from "../utils/demoData";
import { useSyncedArtworks, useSyncedSettings } from "../hooks/useSyncedArtworks";
import { useAuth } from "../contexts/AuthContext";

export function useVIPData(VIP_ID: string) {
    const searchParams = useSearchParams();
    const yearMonthParam = searchParams.get("yearMonth");

    const { artworks, isLoading: artworksLoading, refresh: refreshArtworks } = useSyncedArtworks(VIP_ID);
    const { settings, isLoading: settingsLoading } = useSyncedSettings(VIP_ID);
    const { isAuthenticated: isLoggedIn, logout } = useAuth();

    const [selectedYearMonth, setSelectedYearMonth] = useState<YearMonthKey | null>(null);
    const [selectedArtwork, setSelectedArtwork] = useState<{
        artwork: Artwork;
        index: number;
        yearArtworks: Artwork[];
    } | null>(null);
    const [demoLoaded, setDemoLoaded] = useState(false);

    useEffect(() => {
        if (!demoLoaded && !artworksLoading && artworks.length === 0) {
            loadDemoDataIfEmpty(VIP_ID).then(() => {
                refreshArtworks();
                setDemoLoaded(true);
            });
        }
    }, [demoLoaded, artworksLoading, artworks.length, refreshArtworks, VIP_ID]);

    useEffect(() => {
        if (artworks.length > 0) {
            const yearMonths = getYearMonths(artworks);
            if (yearMonthParam) {
                if (yearMonths.includes(yearMonthParam as YearMonthKey)) {
                    setSelectedYearMonth(yearMonthParam as YearMonthKey);
                    return;
                }
            }
            if (!selectedYearMonth || !yearMonths.includes(selectedYearMonth)) {
                setSelectedYearMonth(yearMonths[0]);
            }
        }
    }, [artworks, yearMonthParam, selectedYearMonth]);

    const handleArtworkClick = useCallback((artwork: Artwork, index: number) => {
        const yearArtworks = artworks.filter(a => createYearMonthKey(a.year, a.month) === selectedYearMonth);
        setSelectedArtwork({ artwork, index, yearArtworks });
    }, [artworks, selectedYearMonth]);

    const handleArtworkDeleted = useCallback(() => {
        refreshArtworks();
        setSelectedArtwork(null);
    }, [refreshArtworks]);

    const yearMonths = useMemo(() => getYearMonths(artworks), [artworks]);

    return {
        artworks,
        settings,
        isLoggedIn,
        logout,
        isLoading: artworksLoading || settingsLoading,
        selectedYearMonth,
        setSelectedYearMonth,
        selectedArtwork,
        setSelectedArtwork,
        yearMonths,
        handleArtworkClick,
        handleArtworkDeleted,
        refreshArtworks
    };
}
