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

    const colors = {
        bg: theme === "black" ? "#111" : "#ffffff",
        text: theme === "black" ? "#eee" : "#222",
        headerBg: theme === "black" ? "#1a1a1a" : "#f8f9fa",
        border: theme === "black" ? "#333" : "#e9ecef",
        accent: "#4f46e5"
    };

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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl h-full md:h-auto md:max-h-[85vh] overflow-hidden rounded-none md:rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col"
                style={{ background: colors.bg, color: colors.text }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: colors.border, background: colors.headerBg }}>
                    <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content Area - FIXED HEIGHT & SCROLL */}
                <div
                    className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-white dark:bg-[#111]"
                    style={{
                        scrollBehavior: "smooth"
                    }}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full" />
                            <p className="text-sm text-gray-500">약관 전문을 불러오는 중입니다...</p>
                        </div>
                    ) : (
                        <div
                            className="prose prose-sm max-w-none"
                            style={{
                                color: colors.text,
                                fontSize: "15px",
                                lineHeight: "1.9",
                                fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
                                wordBreak: "keep-all"
                            }}
                        >
                            {/* 정책 내용 렌더링: 제목 강조 및 문단 간격 처리 */}
                            {content.split('\n').map((line, i) => {
                                const trimLine = line.trim();

                                // 1. 중요 강조 ([중요], 🚨, ** 포함 시)
                                const isImportant = trimLine.includes('[중요]') || trimLine.includes('⚠️') || trimLine.includes('🚨') || trimLine.startsWith('**');

                                // 2. 조항 제목 감지 (제n조, n., 가. 등)
                                const isHeader = /^제\s*\d+\s*조/.test(trimLine) || /^\d+\./.test(trimLine) || /^[가-힣]\./.test(trimLine);

                                // 3. 볼드 텍스트 수동 처리
                                const processedLine = trimLine
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\[중요\]/g, '<span style="color: #ef4444; font-weight: 800;">[중요]</span>');

                                if (!trimLine && i !== 0) return <div key={i} className="h-6" />;

                                return (
                                    <div
                                        key={i}
                                        className={`
                                            mb-3
                                            ${isImportant ? 'text-blue-700 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded' : ''}
                                            ${line.includes('환불') || line.includes('결제') || line.includes('이용료') ? 'font-bold' : ''}
                                            ${isHeader ? 'font-black text-[18px] mt-12 mb-6 text-gray-950 dark:text-gray-50 border-b-2 pb-2' : ''}
                                        `}
                                        style={isHeader ? { borderColor: colors.border } : {}}
                                    >
                                        <p
                                            style={{ wordBreak: "keep-all" }}
                                            dangerouslySetInnerHTML={{ __html: processedLine }}
                                        />
                                    </div>
                                );
                            })}

                            {/* 법적 공신력 푸터 - 부칙 명시 */}
                            <div className="mt-20 pt-10 border-t-2 text-sm text-gray-500 text-center font-medium" style={{ borderColor: colors.border }}>
                                <p className="mb-2">부칙</p>
                                <p className="text-xs text-gray-400">본 약관은 2024년 12월 31일부터 시행됩니다.</p>
                                <p className="mt-6 text-xs tracking-widest">© 오용택(그림실). All rights reserved.</p>
                            </div>
                        </div>
                    )}
                </div>

                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 12px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: ${theme === "black" ? "#0a0a0a" : "#f1f3f5"};
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: ${theme === "black" ? "#444" : "#adb5bd"};
                        border-radius: 6px;
                        border: 3px solid ${theme === "black" ? "#0a0a0a" : "#f1f3f5"};
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: ${theme === "black" ? "#666" : "#868e96"};
                    }
                `}</style>

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
