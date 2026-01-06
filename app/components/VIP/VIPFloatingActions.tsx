"use client";

import Link from "next/link";
import { SIGNATURE_COLORS } from "../../utils/themeColors";

interface VIPFloatingActionsProps {
    theme: string;
    vipId: string;
    onShareClick: () => void;
}

export default function VIPFloatingActions({ theme, vipId, onShareClick }: VIPFloatingActionsProps) {
    return (
        <div
            id="author-only-floating-v9"
            className="fixed z-50 flex flex-col gap-3"
            style={{
                bottom: "30px",
                right: "20px",
            }}
        >
            {/* 1. SNS 공유 */}
            <button
                onClick={onShareClick}
                className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50% !important",
                    background: theme === "black" ? "#4f46e5" : SIGNATURE_COLORS.royalIndigo,
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    fontSize: "12px",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    border: "none",
                    cursor: "pointer"
                }}
            >
                <span>공유</span>
            </button>

            {/* 2. 작품 등록 */}
            <Link
                href={`/add?vipId=${vipId}`}
                className="flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50% !important",
                    background: theme === "black" ? "#1a1a1a" : SIGNATURE_COLORS.antiqueBurgundy,
                    color: "#fff",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    fontSize: "12px",
                    fontWeight: 800,
                    lineHeight: 1.1,
                }}
            >
                <span style={{ fontSize: "14px", marginBottom: "-2px" }}>+</span>
                <span>등록</span>
            </Link>
        </div>
    );
}
