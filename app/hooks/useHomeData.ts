"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getYearMonths, getArtworksByYearMonth, Artwork, YearMonthKey } from "../data/artworks";
import { loadDemoDataIfEmpty } from "../utils/demoData";
import { useSyncedArtworks, useSyncedSettings } from "../hooks/useSyncedArtworks";
import { useAuth } from "../contexts/AuthContext";

export function useHomeData(injectedArtistId: string) {
    const { artworks, isLoading: artworksLoading, refresh: refreshArtworks } = useSyncedArtworks(injectedArtistId);
    const { settings, isLoading: settingsLoading } = useSyncedSettings(injectedArtistId);
    const { isAuthenticated: isLoggedIn, logout } = useAuth();

    const [selectedYearMonth, setSelectedYearMonth] = useState<YearMonthKey | null>(null);
    const [selectedArtwork, setSelectedArtwork] = useState<{
        artwork: Artwork;
        index: number;
        yearArtworks: Artwork[];
    } | null>(null);
    const [demoLoaded, setDemoLoaded] = useState(false);

    const artworksByYearMonth = useMemo(() => getArtworksByYearMonth(artworks), [artworks]);

    const filteredArtworks = useMemo(() => {
        if (!selectedYearMonth) return [];
        return artworksByYearMonth.get(selectedYearMonth) || [];
    }, [artworksByYearMonth, selectedYearMonth]);

    const yearMonths = useMemo(() => getYearMonths(artworks), [artworks]);

    useEffect(() => {
        if (yearMonths.length > 0 && !selectedYearMonth) {
            setSelectedYearMonth(yearMonths[0]);
        }
    }, [yearMonths, selectedYearMonth]);

    useEffect(() => {
        if (!demoLoaded && !artworksLoading && artworks.length === 0) {
            loadDemoDataIfEmpty().then(() => {
                refreshArtworks();
                setDemoLoaded(true);
            });
        }
    }, [demoLoaded, artworksLoading, artworks.length, refreshArtworks]);

    const handleArtworkDeleted = useCallback(() => {
        setSelectedArtwork(null);
        refreshArtworks();
    }, [refreshArtworks]);

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
        filteredArtworks,
        yearMonths,
        handleArtworkDeleted
    };
}
