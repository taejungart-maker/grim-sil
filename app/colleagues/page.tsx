"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { getSupabaseClient } from "../utils/supabase";
import { getClientArtistId } from "../utils/getArtistId";
import { getThemeColors, SIGNATURE_COLORS } from "../utils/themeColors";
import Header from "../components/Header";
import { useSyncedSettings } from "../hooks/useSyncedArtworks";

interface ArtistInfo {
    id: string;
    artist_name: string;
    gallery_name_ko: string;
    aboutme_image: string | null;
    gallery_url: string | null;
}

export default function ColleaguesPage() {
    const router = useRouter();
    const { isAuthenticated: isLoggedIn, ownerId } = useAuth();
    const { settings } = useSyncedSettings();
    const [artists, setArtists] = useState<ArtistInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const supabase = getSupabaseClient(); // Added this line

    const colors = getThemeColors(settings.theme);

    // 로그인하지 않았으면 메인으로 리다이렉트
    useEffect(() => {
        if (!isLoggedIn && !isLoading) {
            router.push("/");
        }
    }, [isLoggedIn, isLoading, router]);

    // Supabase에서 모든 작가 목록 가져오기
    useEffect(() => {
        async function loadArtists() {
            try {
                const { data, error } = await supabase
                    .from("settings")
                    .select("artist_id, artist_name, gallery_name_ko, aboutme_image, gallery_url")
                    .neq("artist_id", getClientArtistId()); // 본인 제외

                if (error) throw error;

                setArtists(data?.map(row => ({
                    id: row.artist_id,
                    artist_name: row.artist_name || "작가님",
                    gallery_name_ko: row.gallery_name_ko || "온라인 Gallery",
                    aboutme_image: row.aboutme_image,
                    gallery_url: row.gallery_url
                })) || []);
            } catch (err) {
                console.error("Failed to load artists:", err);
            } finally {
                setIsLoading(false);
            }
        }

        loadArtists();
    }, []);

    // 검색 필터링 (공백 무시 및 대소문자 구분 없음)
    const normalizedSearch = searchTerm.replace(/\s+/g, "").toLowerCase();
    const filteredArtists = artists.filter(artist => {
        const name = (artist.artist_name || "").replace(/\s+/g, "").toLowerCase();
        const gallery = (artist.gallery_name_ko || "").replace(/\s+/g, "").toLowerCase();
        return name.includes(normalizedSearch) || gallery.includes(normalizedSearch);
    });

    // 작가 Gallery 방문 (내 정보 포함)
    const handleVisit = (artist: ArtistInfo) => {
        if (!artist.gallery_url) {
            alert("이 작가님의 갤러리 주소가 등록되지 않았습니다.");
            return;
        }

        // URL에 방문자 정보 포함
        const url = new URL(artist.gallery_url);
        url.searchParams.set("visitor", ownerId || getClientArtistId());
        url.searchParams.set("visitorName", settings.artistName || "동행작가");

        window.location.href = url.toString();
    };

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="min-h-screen" style={{ background: colors.bg, color: colors.text }}>
            <Header
                galleryNameKo={settings.galleryNameKo}
                theme={settings.theme}
                isLoggedIn={isLoggedIn}
                isPaid={true}
                needsPayment={false}
                onLogout={() => { }}
                onOpenPayment={() => { }}
                onKakaoShare={() => { }}
            />

            <main className="max-w-2xl mx-auto px-4 py-8">
                <h1 style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    marginBottom: "8px",
                    color: SIGNATURE_COLORS.royalIndigo
                }}>
                    🎨 동행 갤러리
                </h1>
                <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
                    함께하는 작가님들의 Gallery를 방문하고 서로 응원해 보세요!
                </p>

                {/* 검색창 */}
                <input
                    type="text"
                    placeholder="🔍 작가님 이름으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "14px 16px",
                        fontSize: "16px",
                        borderRadius: "12px",
                        border: `1px solid ${colors.border}`,
                        background: "#fff",
                        marginBottom: "24px",
                        outline: "none"
                    }}
                />

                {/* 작가 목록 */}
                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                        불러오는 중...
                    </div>
                ) : filteredArtists.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                        {searchTerm ? "검색 결과가 없습니다." : "아직 등록된 동행 작가님이 없습니다."}
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {filteredArtists.map((artist) => (
                            <div
                                key={artist.id}
                                onClick={() => handleVisit(artist)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    padding: "16px",
                                    background: "#fff",
                                    borderRadius: "16px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    animation: "fadeSlideIn 0.3s ease forwards"
                                }}
                                className="colleague-card hover:scale-[1.02] hover:shadow-lg"
                            >
                                {/* 프로필 이미지 */}
                                <div style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    background: artist.aboutme_image
                                        ? `url(${artist.aboutme_image}) center/cover`
                                        : SIGNATURE_COLORS.agingPaper,
                                    border: `2px solid ${SIGNATURE_COLORS.antiqueBurgundy}`,
                                    flexShrink: 0
                                }} />

                                {/* 작가 정보 */}
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: "18px",
                                        fontWeight: 700,
                                        color: SIGNATURE_COLORS.royalIndigo,
                                        marginBottom: "4px"
                                    }}>
                                        {artist.artist_name}
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#888" }}>
                                        {artist.gallery_name_ko}
                                    </div>
                                </div>

                                {/* 방문 버튼 */}
                                <div style={{
                                    padding: "8px 16px",
                                    background: SIGNATURE_COLORS.antiqueBurgundy,
                                    color: "#fff",
                                    borderRadius: "20px",
                                    fontSize: "13px",
                                    fontWeight: 600
                                }}>
                                    방문하기
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 뒤로가기 */}
                <div style={{ textAlign: "center", marginTop: "32px" }}>
                    <Link
                        href="/"
                        style={{
                            color: SIGNATURE_COLORS.royalIndigo,
                            fontSize: "14px",
                            textDecoration: "underline"
                        }}
                    >
                        ← 내 Gallery로 돌아가기
                    </Link>
                </div>
            </main>

            <style jsx global>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .colleague-card:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
}
