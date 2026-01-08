"use client";

import { SIGNATURE_COLORS } from "../utils/themeColors";

interface ArtistPick {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    archiveUrl: string;
}

interface ArtistPicksSectionProps {
    theme: "white" | "black";
    picks?: { name: string; archiveUrl: string; imageUrl?: string }[];
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop";

const MOCK_PICKS = [
    {
        name: "臾명삙寃??묎?",
        archiveUrl: "#",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"
    },
    {
        name: "?⑸?寃??묎?",
        archiveUrl: "#",
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
    },
    {
        name: "源?붾Ц ?묎?",
        archiveUrl: "#",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
    }
];

export default function ArtistPicksSection({ theme, picks = [] }: ArtistPicksSectionProps) {
    const displayPicks = picks.length > 0 ? picks : MOCK_PICKS;
    const bgColor = theme === "black" ? "#1a1a1a" : SIGNATURE_COLORS.agingPaper;
    const textColor = theme === "black" ? "#ffffff" : SIGNATURE_COLORS.inkCharcoal;
    const borderColor = theme === "black" ? "#333" : SIGNATURE_COLORS.sandGray;

    return (
        <section
            style={{
                padding: "48px 24px",
                backgroundColor: bgColor,
                borderTop: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
            }}
        >
            <div className="max-w-6xl mx-auto">
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h2
                        style={{
                            fontSize: "18px",
                            fontWeight: 600,
                            color: textColor,
                            fontFamily: "'Noto Sans KR', sans-serif",
                            marginBottom: "8px"
                        }}
                    >
                        ?④퍡 ?쒕룞?섎뒗 ?숇즺 ?묎?
                    </h2>
                    <p style={{ color: SIGNATURE_COLORS.sandGray, fontSize: "12px" }}>
                        ?쒕줈 ?묒썝?섎ŉ ?④퍡 ?깆옣?섎뒗 ?묎? ?ㅽ듃?뚰겕?낅땲??
                    </p>
                </div>

                {/* 4??洹몃━???덉씠?꾩썐 (紐⑤컮?? 2?? */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "16px"
                    }}
                    className="grid-cols-2 sm:grid-cols-4"
                >
                    {displayPicks.slice(0, 8).map((pick, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: theme === "black" ? "#2a2a2a" : "#ffffff",
                                borderRadius: "12px",
                                overflow: "hidden",
                                boxShadow: `0 2px 12px ${theme === "black" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)"}`,
                                transition: "all 0.2s ease",
                                cursor: "pointer",
                                border: `1px solid ${borderColor}`
                            }}
                            className="group hover:-translate-y-1 hover:shadow-lg"
                            onClick={() => {
                                if (pick.archiveUrl && pick.archiveUrl !== "#") {
                                    window.open(pick.archiveUrl, "_blank");
                                } else {
                                    alert(`${pick.name}?섏쓽 ?꾩뭅?대툕 二쇱냼媛 ?꾩쭅 ?깅줉?섏? ?딆븯?듬땲??`);
                                }
                            }}
                        >
                            {/* 而댄뙥?명븳 ?먰삎 ?꾨줈???대?吏 */}
                            <div style={{
                                padding: "16px 16px 8px 16px",
                                display: "flex",
                                justifyContent: "center"
                            }}>
                                <div style={{
                                    position: "relative",
                                    width: "64px",
                                    height: "64px",
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    border: `2px solid ${borderColor}`
                                }}>
                                    <img
                                        src={pick.imageUrl ? `${pick.imageUrl}?t=${Date.now()}` : DEFAULT_IMAGE}
                                        alt={pick.name}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            transition: "transform 0.3s ease"
                                        }}
                                        className="group-hover:scale-110"
                                    />
                                </div>
                            </div>
                            {/* 而댄뙥?명븳 ?띿뒪???곸뿭 */}
                            <div style={{ padding: "8px 12px 16px 12px", textAlign: "center" }}>
                                <h3 style={{
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    marginBottom: "4px",
                                    color: textColor,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}>
                                    {pick.name}
                                </h3>
                                <div style={{
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    color: SIGNATURE_COLORS.royalIndigo,
                                    opacity: 0.8
                                }}>
                                    諛⑸Ц ??                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
