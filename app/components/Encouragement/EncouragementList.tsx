"use client";

import { SIGNATURE_COLORS } from "../../utils/themeColors";
import { Comment } from "../../hooks/useEncouragement";

interface EncouragementListProps {
    comments: Comment[];
    theme: "white" | "black";
    isAuthenticated: boolean;
    deletingId: string | null;
    onDelete: (id: string) => void;
    textColor: string;
    subTextColor: string;
    borderColor: string;
}

export default function EncouragementList({
    comments,
    theme,
    isAuthenticated,
    deletingId,
    onDelete,
    textColor,
    subTextColor,
    borderColor
}: EncouragementListProps) {
    return (
        <div style={{ marginBottom: "40px" }}>
            {comments.length === 0 ? (
                <p style={{
                    textAlign: "center",
                    color: subTextColor,
                    padding: "40px 0",
                    fontSize: "14px"
                }}>
                    아직 응원 메시지가 없습니다. 첫 번째 응원을 남겨주세요!
                </p>
            ) : (
                comments.map((comment) => (
                    <div
                        key={comment.id}
                        style={{
                            padding: "20px 0",
                            borderBottom: `1px solid ${borderColor}`,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontWeight: 600, fontSize: "20px", color: textColor }}>
                                {comment.authorUrl && comment.authorUrl !== "#" ? (
                                    <a
                                        href={comment.authorUrl}
                                        style={{ color: SIGNATURE_COLORS.royalIndigo, textDecoration: "none" }}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {comment.author}
                                    </a>
                                ) : (
                                    comment.author
                                )}
                            </span>
                            <span style={{ fontSize: "12px", color: subTextColor }}>{comment.date}</span>
                        </div>
                        <p style={{ fontSize: "20px", color: theme === "black" ? "#ccc" : "#444", lineHeight: "1.6" }}>
                            {comment.text}
                        </p>
                        {/* 삭제 버튼 (로그인 시에만 표시) */}
                        {isAuthenticated && !comment.id.startsWith("sample") && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                disabled={deletingId === comment.id}
                                style={{
                                    marginTop: "8px",
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    color: "#dc2626",
                                    background: "transparent",
                                    border: "1px solid #fecaca",
                                    borderRadius: "4px",
                                    cursor: deletingId === comment.id ? "not-allowed" : "pointer",
                                    opacity: deletingId === comment.id ? 0.5 : 1,
                                }}
                            >
                                {deletingId === comment.id ? "삭제 중..." : "🗑️ 삭제"}
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
