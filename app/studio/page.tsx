"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import CameraView from "../components/CameraView";

export default function StudioPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    // 🔒 접근 제어: 로그인하지 않은 경우 메인으로 리다이렉트
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, authLoading, router]);

    if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
    if (!isAuthenticated) return null;

    return (
        <CameraView
            onClose={() => router.push("/")}
            onArchiveClick={() => router.push("/studio/archive")}
            onCaptureComplete={() => router.push("/studio/archive")}
        />
    );
}
