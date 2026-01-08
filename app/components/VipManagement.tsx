/**
 * VIP 媛ㅻ윭由?愿由?而댄룷?뚰듃 (?먮룞??踰꾩쟾)
 * - ?섎룞 ?낅젰 ?쒓굅
 * - 寃곗젣 ???먮룞 ?앹꽦 ?덈궡
 * - ?앹꽦??VIP 紐⑸줉 愿由щ쭔 ?쒓났
 */

"use client";

import { useState, useEffect } from "react";
import {
    getAllVipArtists,
    deleteVipArtist,
    generateVipLinkUrl,
    VipArtist,
} from "../utils/vipArtistDb";
import QRCode from "qrcode";

interface VipManagementProps {
    bgColor: string;
    textColor: string;
    borderColor: string;
    mutedColor: string;
}

export default function VipManagement({
    bgColor,
    textColor,
    borderColor,
    mutedColor,
}: VipManagementProps) {
    const [vipArtists, setVipArtists] = useState<VipArtist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVipQR, setSelectedVipQR] = useState<{
        linkId: string;
        qrUrl: string;
    } | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadVipArtists();
    }, []);

    const loadVipArtists = async () => {
        setIsLoading(true);
        try {
            const artists = await getAllVipArtists();
            setVipArtists(artists);
        } catch (error) {
            console.error("Failed to load VIP artists:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteVip = async (artistId: string, artistName: string) => {
        if (
            !confirm(
                `?뺣쭚 "${artistName}" VIP 留곹겕瑜???젣?섏떆寃좎뒿?덇퉴?\n\n紐⑤뱺 ?묓뭹 ?곗씠?곗? ?ㅼ젙???곴뎄 ??젣?⑸땲??`
            )
        ) {
            return;
        }

        try {
            await deleteVipArtist(artistId);
            setMessage(`??"${artistName}" VIP 留곹겕媛 ??젣?섏뿀?듬땲??`);
            await loadVipArtists();
        } catch (error: any) {
            alert(`??젣 ?ㅽ뙣: ${error.message}`);
        }
    };

    const handleCopyLink = (linkId: string) => {
        const url = generateVipLinkUrl(linkId);
        navigator.clipboard.writeText(url).then(() => {
            alert(`留곹겕媛 ?대┰蹂대뱶??蹂듭궗?섏뿀?듬땲??\n${url}`);
        });
    };

    const handleGenerateQR = async (linkId: string) => {
        try {
            const url = generateVipLinkUrl(linkId);
            const qrUrl = await QRCode.toDataURL(url, {
                width: 400,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            });
            setSelectedVipQR({ linkId, qrUrl });
        } catch (error) {
            alert("QR 肄붾뱶 ?앹꽦 ?ㅽ뙣");
        }
    };

    return (
        <div
            style={{
                marginTop: "48px",
                padding: "32px",
                background: bgColor,
                borderRadius: "24px",
                border: `2px solid #10b981`,
                boxShadow: "0 10px 40px rgba(16, 185, 129, 0.1)",
            }}
        >
            <div style={{ marginBottom: "24px" }}>
                <span
                    style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        backgroundColor: "#10b981",
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: "8px",
                        textTransform: "uppercase",
                    }}
                >
                    AUTOMATED SYSTEM
                </span>
                <h2
                    style={{
                        fontSize: "24px",
                        fontWeight: 800,
                        marginTop: "16px",
                        letterSpacing: "-0.03em",
                    }}
                >
                    ?쨼 VIP 媛ㅻ윭由??먮룞 ?앹꽦 ?쒖뒪??                </h2>
                <p style={{ color: mutedColor, fontSize: "15px", marginTop: "8px" }}>
                    寃곗젣 ?꾨즺 ???먮룞?쇰줈 VIP 媛ㅻ윭由ш? ?앹꽦?⑸땲??
                </p>
            </div>

            {message && (
                <div
                    style={{
                        padding: "16px",
                        marginBottom: "24px",
                        background: message.startsWith("??) ? "#22c55e" : "#dc2626",
                        color: "#fff",
                        borderRadius: "12px",
                        textAlign: "center",
                        fontSize: "14px",
                        fontWeight: 600,
                    }}
                >
                    {message}
                </div>
            )}

            {/* ?먮룞???덈궡 */}
            <div
                style={{
                    padding: "24px",
                    background: "#10b981",
                    borderRadius: "16px",
                    marginBottom: "32px",
                    color: "#fff",
                }}
            >
                <h3
                    style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        marginBottom: "12px",
                    }}
                >
                    ??寃곗젣 ?꾨즺 ???먮룞 ?앹꽦
                </h3>
                <p style={{ fontSize: "15px", lineHeight: 1.6 }}>
                    怨좉컼??"援щ룆?섍린"瑜??대┃?섍퀬 寃곗젣媛 ?꾨즺?섎㈃:
                </p>
                <ul style={{ marginTop: "12px", paddingLeft: "20px", lineHeight: 1.8 }}>
                    <li>???쒖뒪?쒖씠 ?먮룞?쇰줈 VIP 媛ㅻ윭由??앹꽦</li>
                    <li>???꾩떆 鍮꾨?踰덊샇 ?먮룞 諛쒓툒</li>
                    <li>??SMS/?대찓?쇰줈 留곹겕 & 鍮꾨?踰덊샇 ?먮룞 諛쒖넚</li>
                    <li>??怨좉컼 利됱떆 ?ъ슜 媛??/li>
                </ul>
                <p style={{ marginTop: "12px", fontSize: "14px", opacity: 0.9 }}>
                    <strong>?묎? 媛쒖엯: 0%</strong> ??紐⑤뱺 寃껋씠 ?먮룞?낅땲??
                </p>
            </div>

            {/* VIP 紐⑸줉 */}
            <div>
                <h3
                    style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        marginBottom: "16px",
                    }}
                >
                    ?앹꽦??VIP 媛ㅻ윭由?({vipArtists.length}媛?
                </h3>

                {isLoading ? (
                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                            color: mutedColor,
                        }}
                    >
                        濡쒕뵫 以?..
                    </div>
                ) : vipArtists.length === 0 ? (
                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                            color: mutedColor,
                            border: `2px dashed ${borderColor}`,
                            borderRadius: "16px",
                        }}
                    >
                        ?꾩쭅 ?앹꽦??VIP 媛ㅻ윭由ш? ?놁뒿?덈떎.
                        <br />
                        <span style={{ fontSize: "14px" }}>
                            泥?寃곗젣媛 ?꾨즺?섎㈃ ?ш린???쒖떆?⑸땲??
                        </span>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {vipArtists.map((artist) => (
                            <div
                                key={artist.id}
                                style={{
                                    padding: "20px",
                                    background:
                                        bgColor === "#1a1a1a"
                                            ? "rgba(255,255,255,0.05)"
                                            : "#fff",
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: "12px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: "16px",
                                            fontWeight: 700,
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {artist.name}
                                        {artist.is_free && (
                                            <span
                                                style={{
                                                    marginLeft: "8px",
                                                    padding: "2px 8px",
                                                    background: "#22c55e",
                                                    color: "#fff",
                                                    fontSize: "12px",
                                                    borderRadius: "6px",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                臾대즺
                                            </span>
                                        )}
                                        {artist.link_id === "gallery-vip-01" && (
                                            <span
                                                style={{
                                                    marginLeft: "8px",
                                                    padding: "2px 8px",
                                                    background: "#fbbf24",
                                                    color: "#000",
                                                    fontSize: "12px",
                                                    borderRadius: "6px",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                ?뚯뒪?몄슜
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            color: mutedColor,
                                        }}
                                    >
                                        {artist.link_id}
                                        {!artist.is_free &&
                                            ` ??${artist.subscription_price?.toLocaleString()}????}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => handleCopyLink(artist.link_id)}
                                        style={{
                                            padding: "8px 16px",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: textColor,
                                            background: "transparent",
                                            border: `2px solid ${borderColor}`,
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        留곹겕 蹂듭궗
                                    </button>

                                    <button
                                        onClick={() => handleGenerateQR(artist.link_id)}
                                        style={{
                                            padding: "8px 16px",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: "#fff",
                                            background: "#6366f1",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        QR
                                    </button>

                                    <button
                                        onClick={() => handleDeleteVip(artist.id, artist.name)}
                                        style={{
                                            padding: "8px 16px",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: "#fff",
                                            background: "#dc2626",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        ??젣
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* QR 紐⑤떖 */}
            {selectedVipQR && (
                <div
                    onClick={() => setSelectedVipQR(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            padding: "32px",
                            borderRadius: "24px",
                            textAlign: "center",
                        }}
                    >
                        <h3
                            style={{
                                fontSize: "20px",
                                fontWeight: 700,
                                marginBottom: "16px",
                                color: "#1a1a1a",
                            }}
                        >
                            {selectedVipQR.linkId} QR 肄붾뱶
                        </h3>
                        <img
                            src={selectedVipQR.qrUrl}
                            alt="QR Code"
                            style={{ width: "300px", height: "300px", marginBottom: "16px" }}
                        />
                        <a
                            href={selectedVipQR.qrUrl}
                            download={`${selectedVipQR.linkId}_qr.png`}
                            style={{
                                display: "inline-block",
                                padding: "12px 24px",
                                background: "#6366f1",
                                color: "#fff",
                                textDecoration: "none",
                                borderRadius: "12px",
                                fontWeight: 700,
                            }}
                        >
                            ?ㅼ슫濡쒕뱶
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
