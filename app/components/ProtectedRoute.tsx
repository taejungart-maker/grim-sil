"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * 보호된 라우트 컴포넌트
 * 전역 AuthContext를 사용하여 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // 인증되지 않았으면 즉시 로그인 페이지로 리다이렉트
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    // 인증되지 않으면 아무것도 렌더링하지 않음 (깜빡임 방지)
    if (!isAuthenticated) {
        return null;
    }

    // 인증되면 자식 컴포넌트 즉시 렌더링
    return <>{children}</>;
}
