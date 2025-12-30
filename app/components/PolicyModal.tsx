"use client";

import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";

interface PolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    policyId: "terms" | "privacy" | "refund";
    theme?: "white" | "black";
}

export default function PolicyModal({ isOpen, onClose, policyId, theme = "white" }: PolicyModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchPolicy();
        }
    }, [isOpen, policyId]);

    const fetchPolicy = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("policies")
                .select("title, content")
                .eq("id", policyId)
                .single();

            if (error) throw error;
            setTitle(data.title);
            setContent(data.content);
        } catch (error) {
            console.error("Failed to fetch policy:", error);
            // Fallback (DB 연결 전 대비)
            const fallbacks = {
                terms: "이용약관 내용을 불러올 수 없습니다.",
                privacy: "개인정보처리방침 내용을 불러올 수 없습니다.",
                refund: "⚠️ [중요] 디지털 콘텐츠 특성상 결제 후 작품 열람 시 환불이 불가합니다."
            };
            setTitle(policyId === "terms" ? "이용약관" : policyId === "privacy" ? "개인정보처리방침" : "환불정책");
            setContent(fallbacks[policyId]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const colors = {
        bg: theme === "black" ? "#1a1a1a" : "#ffffff",
        text: theme === "black" ? "#ffffff" : "#1a1a1a",
        subText: theme === "black" ? "#999" : "#666",
        border: theme === "black" ? "#333" : "#eee",
        accent: "#6366f1"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200"
                style={{ background: colors.bg, color: colors.text }}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: colors.border, background: colors.bg }}>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 text-sm leading-relaxed whitespace-pre-wrap">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                        </div>
                    ) : (
                        <div
                            className={`${policyId === 'refund' ? 'font-medium' : ''}`}
                            style={{
                                color: colors.text,
                                fontSize: "15px",
                                lineHeight: "1.8"
                            }}
                        >
                            {/* 환불 불가 강조 처리 */}
                            {content.split('\n').map((line, i) => (
                                <p key={i} className={`mb-3 ${line.includes('[중요]') ? 'text-red-500 font-bold text-lg border-l-4 border-red-500 pl-4 py-1 bg-red-50 dark:bg-red-900/10' : ''}`}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t text-center" style={{ borderColor: colors.border }}>
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
