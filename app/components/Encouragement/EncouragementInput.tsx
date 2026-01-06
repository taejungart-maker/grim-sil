"use client";

import { useState } from "react";
import { SIGNATURE_COLORS } from "../../utils/themeColors";

interface EncouragementInputProps {
    theme: "white" | "black";
    isSubmitting: boolean;
    onSubmit: (authorName: string, text: string) => Promise<boolean>;
    textColor: string;
    borderColor: string;
    inputBg: string;
}

export default function EncouragementInput({
    isSubmitting,
    onSubmit,
    textColor,
    borderColor,
    inputBg
}: EncouragementInputProps) {
    const [newComment, setNewComment] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [showNameInput, setShowNameInput] = useState(false);

    const handleSubmit = async () => {
        if (!newComment.trim()) {
            alert("응원 메시지를 입력해주세요.");
            return;
        }

        if (!authorName.trim() && !showNameInput) {
            setShowNameInput(true);
            return;
        }

        const finalAuthorName = authorName.trim() || "익명의 팬";
        const success = await onSubmit(finalAuthorName, newComment.trim());

        if (success) {
            setNewComment("");
            setAuthorName("");
            setShowNameInput(false);
            alert("따뜻한 응원이 전달되었습니다! 감사합니다.");
        } else {
            alert("응원 저장에 실패했습니다. 다시 시도해주세요.");
        }
    };

    return (
        <div
            style={{
                padding: "24px",
                backgroundColor: inputBg,
                borderRadius: "12px",
            }}
        >
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
    );
}
