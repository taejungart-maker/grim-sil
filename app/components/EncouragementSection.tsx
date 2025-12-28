"use client";

import { useState, useEffect } from "react";
import { getThemeColors, SIGNATURE_COLORS } from "../utils/themeColors";
import { loadEncouragements, saveEncouragement, deleteEncouragement, Encouragement } from "../utils/networkDb";
import { useAuth } from "../contexts/AuthContext";

interface Comment {
    id: string;
    author: string;
    text: string;
    date: string;
    authorUrl?: string;
}

interface EncouragementSectionProps {
    theme: "white" | "black";
}

// 샘플 댓글 (DB가 비어있을 때 표시)
const SAMPLE_COMMENTS: Comment[] = [
    { id: "sample-1", author: "하현주 작가", text: "작품의 색감이 정말 따뜻하고 깊이 있네요. 응원합니다!", date: "2025.12.27", authorUrl: "#" },
    { id: "sample-2", author: "문혜경 작가", text: "새로 올리신 작품 '겨울 정원' 너무 인상적이에요.", date: "2025.12.28", authorUrl: "#" },
];

export default function EncouragementSection({ theme }: EncouragementSectionProps) {
    const { isAuthenticated } = useAuth();
    const [comments, setComments] = useState<Comment[]>(SAMPLE_COMMENTS);
    const [newComment, setNewComment] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showNameInput, setShowNameInput] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const colors = getThemeColors(theme);
    const textColor = colors.text;
    const subTextColor = theme === "black" ? "#888" : SIGNATURE_COLORS.sandGray;
    const borderColor = colors.border;
    const inputBg = theme === "black" ? "#2a2a2a" : "rgba(194, 188, 178, 0.1)";

    // 초기 로드: Supabase에서 응원 메시지 불러오기
    useEffect(() => {
        async function fetchComments() {
            try {
                const data = await loadEncouragements();
                if (data && data.length > 0) {
                    const converted: Comment[] = data.map((e: Encouragement) => ({
                        id: e.id,
                        author: e.author_name,
                        text: e.content,
                        date: new Date(e.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }).replace(/\. /g, '.').replace('.', ''),
                        authorUrl: e.author_archive_url,
                    }));
                    setComments(converted);
                }
            } catch (err) {
                console.error("Failed to load comments:", err);
            }
        }
        fetchComments();
    }, []);

    // 응원 남기기 버튼 클릭 핸들러
    const handleSubmit = async () => {
        if (!newComment.trim()) {
            alert("응원 메시지를 입력해주세요.");
            return;
        }

        // 이름이 입력되지 않았으면 이름 입력 필드 표시
        if (!authorName.trim() && !showNameInput) {
            setShowNameInput(true);
            return;
        }

        const finalAuthorName = authorName.trim() || "익명의 팬";

        setIsSubmitting(true);
        try {
            const result = await saveEncouragement(finalAuthorName, newComment.trim());

            if (result) {
                // 새 댓글을 목록 맨 앞에 추가
                const newAddedComment: Comment = {
                    id: result.id,
                    author: result.author_name,
                    text: result.content,
                    date: new Date().toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).replace(/\. /g, '.').replace('.', ''),
                };
                setComments([newAddedComment, ...comments]);
                setNewComment("");
                setAuthorName("");
                setShowNameInput(false);
                alert("따뜻한 응원이 전달되었습니다! 감사합니다.");
            } else {
                alert("응원 저장에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (err) {
            console.error("Submit error:", err);
            alert("오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 삭제 핸들러 (로그인한 작가만 사용 가능)
    const handleDelete = async (id: string) => {
        if (!confirm("이 응원 메시지를 삭제하시겠습니까?")) return;

        setDeletingId(id);
        try {
            const success = await deleteEncouragement(id);
            if (success) {
                setComments(comments.filter(c => c.id !== id));
            } else {
                alert("삭제에 실패했습니다.");
            }
        } catch (err) {
            console.error("Delete error:", err);
            alert("오류가 발생했습니다.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section
            style={{
                padding: "60px 24px",
                maxWidth: "800px",
                margin: "0 auto",
                borderTop: `1px solid ${borderColor}`,
            }}
        >
            <h2
                style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    marginBottom: "32px",
                    textAlign: "center",
                    color: textColor,
                    fontFamily: "'Noto Sans KR', sans-serif",
                }}
            >
                작가님께 따뜻한 응원 한마디 ✨
            </h2>

            {/* 응원 메시지 목록 */}
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
                                <span style={{ fontWeight: 600, fontSize: "14px", color: textColor }}>
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
                            <p style={{ fontSize: "15px", color: theme === "black" ? "#ccc" : "#444", lineHeight: "1.6" }}>
                                {comment.text}
                            </p>
                            {/* 삭제 버튼 (로그인 시에만 표시) */}
                            {isAuthenticated && !comment.id.startsWith("sample") && (
                                <button
                                    onClick={() => handleDelete(comment.id)}
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

            {/* 입력란 */}
            <div
                style={{
                    padding: "24px",
                    backgroundColor: inputBg,
                    borderRadius: "12px",
                }}
            >
                {/* 이름 입력 (토글) */}
                {showNameInput && (
                    <input
                        type="text"
                        placeholder="이름 (선택사항, 비워두면 '익명의 팬')"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "12px",
                            backgroundColor: "transparent",
                            border: `1px solid ${borderColor}`,
                            borderRadius: "6px",
                            color: textColor,
                            fontSize: "14px",
                            fontFamily: "'Noto Sans KR', sans-serif",
                            outline: "none",
                        }}
                    />
                )}

                <textarea
                    placeholder="작가님께 따스한 응원의 마음을 전해 보세요."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{
                        width: "100%",
                        height: "80px",
                        padding: "12px",
                        backgroundColor: "transparent",
                        border: "none",
                        color: textColor,
                        fontSize: "14px",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        resize: "none",
                        outline: "none",
                    }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                    <button
                        onClick={handleSubmit}
                        disabled={!newComment.trim() || isSubmitting}
                        style={{
                            padding: "10px 24px",
                            backgroundColor: SIGNATURE_COLORS.antiqueBurgundy,
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: (!newComment.trim() || isSubmitting) ? "not-allowed" : "pointer",
                            boxShadow: `0 2px 8px rgba(128, 48, 48, 0.3)`,
                            opacity: (!newComment.trim() || isSubmitting) ? 0.5 : 1,
                            transition: "opacity 0.2s ease",
                        }}
                    >
                        {isSubmitting ? "저장 중..." : showNameInput ? "보내기" : "응원 남기기"}
                    </button>
                </div>
            </div>

            <p style={{
                marginTop: "24px",
                fontSize: "12px",
                color: subTextColor,
                textAlign: "center"
            }}>
                상호 존중하는 마음으로 남겨주신 응원은 작가님께 큰 힘이 됩니다.
            </p>
        </section>
    );
}
