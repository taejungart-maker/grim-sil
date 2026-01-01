import Link from "next/link";

interface FooterProps {
    theme?: "white" | "black";
}

export default function Footer({ theme = "white" }: FooterProps) {
    const bgColor = theme === "black" ? "#1a1a1a" : "#fafafa";
    const textColor = theme === "black" ? "#999" : "#666";
    const borderColor = theme === "black" ? "#333" : "#e0e0e0";
    const linkColor = theme === "black" ? "#aaa" : "#555";

    return (
        <footer style={{
            background: bgColor,
            borderTop: `1px solid ${borderColor}`,
            padding: "48px 24px",
            marginTop: "80px",
        }}>
            <div style={{
                maxWidth: "1200px",
                margin: "0 auto",
            }}>
                {/* 사업자 정보 */}
                <div style={{
                    marginBottom: "32px",
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: "14px",
                    lineHeight: 1.8,
                    color: textColor,
                }}>
                    <p style={{ marginBottom: "8px" }}>
                        <strong>상호:</strong> 태정
                    </p>
                    <p style={{ marginBottom: "8px" }}>
                        <strong>대표자:</strong> 오용택
                    </p>
                    <p style={{ marginBottom: "8px" }}>
                        <strong>사업자등록번호:</strong> 205-53-72177
                    </p>
                    <p style={{ marginBottom: "8px" }}>
                        <strong>연락처:</strong> 010-8618-3323
                    </p>
                </div>

                {/* 정책 링크 */}
                <div style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: "13px",
                }}>
                    <Link
                        href="/terms"
                        style={{
                            color: linkColor,
                            textDecoration: "none",
                        }}
                    >
                        이용약관
                    </Link>
                    <span style={{ color: borderColor }}>|</span>
                    <Link
                        href="/privacy"
                        style={{
                            color: linkColor,
                            textDecoration: "none",
                        }}
                    >
                        개인정보처리방침
                    </Link>
                    <span style={{ color: borderColor }}>|</span>
                    <Link
                        href="/refund"
                        style={{
                            color: linkColor,
                            textDecoration: "none",
                        }}
                    >
                        환불정책
                    </Link>
                    <span style={{ color: borderColor }}>|</span>
                    <Link
                        href="/exchange"
                        style={{
                            color: linkColor,
                            textDecoration: "none",
                        }}
                    >
                        교환정책
                    </Link>
                </div>

                {/* 저작권 */}
                <p style={{
                    marginTop: "24px",
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: "12px",
                    color: textColor,
                }}>
                    © 2025 태정. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
