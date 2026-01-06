"use client";

import { useRouter } from "next/navigation";

interface AdminHeaderProps {
    effectiveArtistId: string;
    theme: string;
    isSaving: boolean;
    handleSave: () => void;
    borderColor: string;
}

export default function AdminHeader({
    effectiveArtistId,
    theme,
    isSaving,
    handleSave,
    borderColor
}: AdminHeaderProps) {
    const router = useRouter();

    return (
        <header className="p-4 md:p-5 border-b flex justify-between items-center sticky top-0 z-50 bg-inherit" style={{ borderColor }}>
            <div className="flex items-center gap-2 md:gap-3">
                <h1 className="text-lg md:text-2xl font-bold" style={{ color: theme === "black" ? "#fff" : "#8b7355" }}>갤러리 설정</h1>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-[10px] md:text-xs">ID: {effectiveArtistId}</span>
            </div>
            <div className="flex gap-2 flex-nowrap">
                <button onClick={handleSave} disabled={isSaving} className="px-3 md:px-5 py-1.5 md:py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition text-sm md:text-base whitespace-nowrap">{isSaving ? "..." : "설정 저장"}</button>
                <button onClick={() => router.push("/")} className="px-3 md:px-5 py-1.5 md:py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:opacity-80 transition text-sm md:text-base whitespace-nowrap">나가기</button>
            </div>
        </header>
    );
}
