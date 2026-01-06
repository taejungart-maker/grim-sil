import Link from "next/link";

interface CTASectionProps {
    theme?: "white" | "black";
}

export default function CTASection({ theme = "white" }: CTASectionProps) {
    const bgColor = theme === "black" ? "#151515" : "#f9f9f9";
    const textColor = theme === "black" ? "#e0e0e0" : "#333";
    const buttonBg = theme === "black" ? "#6366f1" : "#8b7355";

    return (
        <section style={{
            background: bgColor,
            padding: "64px 24px",
            marginTop: "64px",
            textAlign: "center",
        }}>
            <div style={{
                maxWidth: "600px",
                margin: "0 auto",
            }}>
                <h2 style={{
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: textColor,
                    marginBottom: "16px",
                }}>
                    나도 갤러리 만들기
                </h2>
                <p style={{
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: "16px",
                    color: theme === "black" ? "#999" : "#666",
                    marginBottom: "32px",
                    lineHeight: 1.6,
                }}>
                    월 29,000 KRW으로 나만의 온라인 갤러리를 시작하세요
                </p>
                <Link
                    href="/apply"
                    style={{
                        display: "inline-block",
                        padding: "16px 48px",
                        background: buttonBg,
                        color: "#fff",
                        fontFamily: "'Noto Sans KR', sans-serif",
                        fontSize: "18px",
                        fontWeight: 600,
                        borderRadius: "8px",
                        textDecoration: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                >
                    갤러리 만들기 시작 →
                </Link>
            </div>
        </section>
    );
}
