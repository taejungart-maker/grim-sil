"use client";

import { getThemeColors, SIGNATURE_COLORS } from "../utils/themeColors";
import { useAuth } from "../contexts/AuthContext";
import { useEncouragement } from "../hooks/useEncouragement";
import EncouragementList from "./Encouragement/EncouragementList";
import EncouragementInput from "./Encouragement/EncouragementInput";

interface EncouragementSectionProps {
    theme: "white" | "black";
}

export default function EncouragementSection({ theme }: EncouragementSectionProps) {
    const { isAuthenticated } = useAuth();
    const {
        comments,
        isSubmitting,
        deletingId,
        addComment,
        removeComment
    } = useEncouragement();

    const colors = getThemeColors(theme);
    const textColor = colors.text;
    const subTextColor = theme === "black" ? "#888" : SIGNATURE_COLORS.sandGray;
    const borderColor = colors.border;
    const inputBg = theme === "black" ? "#2a2a2a" : "rgba(194, 188, 178, 0.1)";

    const handleDelete = async (id: string) => {
        if (!confirm("이 응원 메시지를 삭제하시겠습니까?")) return;
        const success = await removeComment(id);
        if (!success) alert("삭제에 실패했습니다.");
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
                    fontSize: "22px",
                    fontWeight: 600,
                    marginBottom: "32px",
                    textAlign: "center",
                    color: textColor,
                    fontFamily: "var(--font-serif)",
                    letterSpacing: "-0.01em",
                }}
            >
                작가에게 남기는 메시지
            </h2>

            <EncouragementList
                comments={comments}
                theme={theme}
                isAuthenticated={isAuthenticated}
                deletingId={deletingId}
                onDelete={handleDelete}
                textColor={textColor}
                subTextColor={subTextColor}
                borderColor={borderColor}
            />

            <EncouragementInput
                theme={theme}
                isSubmitting={isSubmitting}
                onSubmit={addComment}
                textColor={textColor}
                borderColor={borderColor}
                inputBg={inputBg}
            />

            <p style={{
                marginTop: "32px",
                fontSize: "13px",
                color: subTextColor,
                textAlign: "center",
                fontFamily: "var(--font-serif)",
                opacity: 0.8
            }}>
                남겨주신 메시지는 작가에게 큰 격려가 됩니다.
            </p>
        </section>
    );
}
