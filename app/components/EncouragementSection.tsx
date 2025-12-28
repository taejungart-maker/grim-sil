"use client";

import { useState } from "react";
import { getThemeColors, SIGNATURE_COLORS } from "../utils/themeColors";

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

const MOCK_COMMENTS: Comment[] = [
    { id: "1", author: "하현주 작가", text: "작품의 색감이 정말 따뜻하고 깊이 있네요. 응원합니다!", date: "2025.12.27", authorUrl: "#" },
    { id: "2", author: "문혜경 작가", text: "새로 올리신 작품 '겨울 정원' 너무 인상적이에요. 👍", date: "2025.12.28", authorUrl: "#" },
    { id: "3", author: "익명의 팬", text: "작가님의 온라인 화첩을 보며 많은 영감을 얻고 갑니다.", date: "2025.12.28" },
];

export default function EncouragementSection({ theme }: EncouragementSectionProps) {
    const [comments] = useState<Comment[]>(MOCK_COMMENTS);
    const [newComment, setNewComment] = useState("");

    const colors = getThemeColors(theme);
    const bgColor = colors.bg;
    const textColor = colors.text;
    const subTextColor = theme === "black" ? "#888" : SIGNATURE_COLORS.sandGray;
    const borderColor = colors.border;
    const inputBg = theme === "black" ? "#2a2a2a" : "rgba(194, 188, 178, 0.1)";

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
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        style={{
                            padding: "20px 0",
                            borderBottom: `1px solid ${borderColor}`,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontWeight: 600, fontSize: "14px" }}>
                                {comment.authorUrl ? (
                                    <a
                                        href={comment.authorUrl}
                                        style={{ color: SIGNATURE_COLORS.royalIndigo, textDecoration: "none" }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            alert(`${comment.author}님의 아카이브로 이동합니다.`);
                                        }}
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
                    </div>
                ))}
            </div>

            {/* 입력란 */}
            <div
                style={{
                    padding: "24px",
                    backgroundColor: inputBg,
                    borderRadius: "12px",
                }}
            >
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
                        style={{
                            padding: "10px 24px",
                            backgroundColor: SIGNATURE_COLORS.antiqueBurgundy,
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: `0 2px 8px rgba(128, 48, 48, 0.3)`,
                            opacity: newComment ? 1 : 0.5,
                        }}
                        disabled={!newComment}
                    >
                        응원 남기기
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
