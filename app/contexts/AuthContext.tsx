"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { isAuthenticated as checkAuth, setAuthSession, clearAuthSession, getOwnerId } from "../utils/auth";
import { verifyPassword } from "../utils/settingsDb";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    ownerId: string | null;
    login: (password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // 초기값을 false로 고정 (서버/클라이언트 일치)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 클라이언트 마운트 후 인증 상태 확인
    const [ownerId, setOwnerId] = useState<string | null>(null);

    useEffect(() => {
        setIsAuthenticated(checkAuth());
        const storedOwnerId = getOwnerId(); // Already uses Artist ID-based key
        setOwnerId(storedOwnerId);
        setIsLoading(false);
    }, []);

    // 인증 상태 변경 감지 (storage 이벤트)
    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(checkAuth());
        };

        // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시)
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // 로그인 함수
    const login = async (password: string): Promise<boolean> => {
        try {
            const isValid = await verifyPassword(password);

            if (isValid) {
                const { ARTIST_ID } = await import("../utils/supabase");
                setAuthSession(password, ARTIST_ID);
                setIsAuthenticated(true);
                return true;
            }

            return false;
        } catch (error) {
            console.error("Login error:", error);
            return false;
        }
    };

    // 로그아웃 함수
    const logout = () => {
        clearAuthSession();
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, ownerId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// 커스텀 훅
export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
