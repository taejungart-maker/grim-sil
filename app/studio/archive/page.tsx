"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { InspirationData } from "../../utils/indexedDbStorage";
import { deleteInspiration, downloadInspirationImage } from "../../utils/inspirationStorage";
import { ARTIST_ID } from "../../utils/supabase";

export interface SyncedInspiration extends InspirationData {
    imageUrl?: string;
    originalImageUrl?: string;
}

export default function InspirationArchivePage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [inspirations, setInspirations] = useState<SyncedInspiration[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🔒 접근 제어: 로그인 필수
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, authLoading, router]);

    // 영감 데이터 로딩 (Supabase 우선 + IndexedDB 로컬 캐시)
    useEffect(() => {
        const load = async () => {
            try {
                // 1. Supabase에서 최신 데이터 가져오기 시도
                const { getSupabaseClient } = await import("../../utils/supabase");
                const supabase = getSupabaseClient();
                const { ARTIST_ID } = await import("../../utils/supabase");

                const { data: serverData, error } = await supabase
                    .from('inspirations')
                    .select('*')
                    .eq('artist_id', ARTIST_ID)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (serverData && serverData.length > 0) {
                    const formattedData = serverData.map(row => {
                        const metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
                        return {
                            id: row.id,
                            imageUrl: row.image_url, // ✅ 통합 이미지 필드 사용
                            blurImageUrl: row.blur_image_url,
                            originalImageUrl: metadata?.original_image_url, // 하위 호환성 유지
                            colorPalette: row.color_palette,
                            metadata: metadata,
                            createdAt: new Date(row.created_at).getTime(),
                            originalFileName: metadata?.original_filename || ""
                        };
                    });
                    setInspirations(formattedData);
                } else {
                    // 2. 서버 데이터가 없거나 실패 시 로컬 IndexedDB 시도
                    const { getAllInspirations } = await import("../../utils/indexedDbStorage");
                    const localData = await getAllInspirations();
                    setInspirations(localData);
                }
            } catch (error) {
                console.error("Failed to load inspirations (falling back to local):", error);
                const { getAllInspirations } = await import("../../utils/indexedDbStorage");
                const localData = await getAllInspirations();
                setInspirations(localData);
            } finally {
                setIsLoading(false);
            }
        };
        if (isAuthenticated) load();
    }, [isAuthenticated]);

    if (authLoading || isLoading) {
        return <div className="min-h-screen bg-white flex items-center justify-center">Loading Archive...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-[#fafafa] pb-24" style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}>
            {/* 상단 헤더 */}
            <header className="sticky top-0 z-10 bg-[#fafafa]/80 backdrop-blur-md border-bottom border-[#eee]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-sm font-medium text-[#888] hover:text-[#555] transition-colors">
                        ← Gallery
                    </Link>
                    <h1 className="text-base font-bold tracking-tight text-[#222]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                        Studio Archive
                    </h1>
                    <Link href="/studio" className="text-sm font-bold text-[#6366f1] hover:underline">
                        + New
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {inspirations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <div className="text-4xl mb-6">📷</div>
                        <p className="text-[#999] text-sm">아직 수집된 영감이 없습니다.<br />작가님만의 시선을 기록해 보세요.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-16">
                        {inspirations.map((item) => (
                            <div key={item.id} className="group flex flex-col gap-6">
                                {/* 이미지 영역 (Glassmorphism & Blur) */}
                                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1 bg-white">
                                    <img
                                        src={item.imageUrl || item.originalImageUrl || item.blurImageUrl || "/placeholder-inspiration.png"}
                                        alt="Inspiration"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* 컬러 팔레트 배지 */}
                                    <div className="absolute bottom-4 left-4 flex gap-1.5 p-1.5 bg-white/20 backdrop-blur-lg rounded-full border border-white/30">
                                        {item.colorPalette.slice(0, 3).map((color, i) => (
                                            <div
                                                key={i}
                                                style={{ backgroundColor: color }}
                                                className="w-3 h-3 rounded-full shadow-sm"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* 메모 및 시간 + 액션 버튼 */}
                                <div className="px-1">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#bbb]">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>

                                        {/* 액션 버튼 (항시 노출) */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const url = item.imageUrl || item.originalImageUrl || item.blurImageUrl;
                                                    if (url) downloadInspirationImage(url, item.originalFileName || `Inspiration_${item.id}.jpg`);
                                                }}
                                                className="flex items-center gap-1.5 text-[11px] font-bold text-[#6366f1] hover:text-[#4f46e5] transition-colors"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                                저장
                                            </button>
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (confirm("정말로 이 영감을 삭제하시겠습니까?")) {
                                                        const result = await deleteInspiration(item.id, ARTIST_ID);
                                                        if (result.success) {
                                                            setInspirations(prev => prev.filter(p => p.id !== item.id));
                                                        } else {
                                                            alert("삭제 실패: " + (result.error || "알 수 없는 오류"));
                                                        }
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 text-[11px] font-bold text-[#ff4d4f] hover:text-[#d9363e] transition-colors"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[#333] text-[15px] leading-relaxed font-medium" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                                        {item.metadata.memo || "기록된 생각이 없습니다."}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* 하단 여백의 미 디자인 요소 */}
            <div className="flex justify-center mt-20 opacity-20">
                <span className="text-[11px] tracking-[0.4em] text-[#888] font-light">E S S E N T I A L I S M</span>
            </div>
        </div>
    );
}
