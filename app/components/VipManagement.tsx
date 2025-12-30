/**
 * VIP 갤러리 관리 컴포넌트 (자동화 버전)
 * - 수동 입력 제거
 * - 결제 시 자동 생성 안내
 * - 생성된 VIP 목록 관리만 제공
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
                `정말 "${artistName}" VIP 링크를 삭제하시겠습니까?\n\n모든 작품 데이터와 설정이 영구 삭제됩니다.`
            )
        ) {
            return;
        }

        try {
            await deleteVipArtist(artistId);
            setMessage(`✅ "${artistName}" VIP 링크가 삭제되었습니다.`);
            await loadVipArtists();
        } catch (error: any) {
            alert(`삭제 실패: ${error.message}`);
        }
    };

    const handleCopyLink = (linkId: string) => {
        const url = generateVipLinkUrl(linkId);
        navigator.clipboard.writeText(url).then(() => {
            alert(`링크가 클립보드에 복사되었습니다:\n${url}`);
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
            alert("QR 코드 생성 실패");
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
                    🤖 VIP 갤러리 자동 생성 시스템
                </h2>
                <p style={{ color: mutedColor, fontSize: "15px", marginTop: "8px" }}>
                    결제 완료 시 자동으로 VIP 갤러리가 생성됩니다.
                </p>
            </div>

            {message && (
                <div
                    style={{
                        padding: "16px",
                        marginBottom: "24px",
                        background: message.startsWith("✅") ? "#22c55e" : "#dc2626",
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

            {/* 자동화 안내 */}
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
                    ✅ 결제 완료 → 자동 생성
                </h3>
                <p style={{ fontSize: "15px", lineHeight: 1.6 }}>
                    고객이 "구독하기"를 클릭하고 결제가 완료되면:
                </p>
                <ul style={{ marginTop: "12px", paddingLeft: "20px", lineHeight: 1.8 }}>
                    <li>✅ 시스템이 자동으로 VIP 갤러리 생성</li>
                    <li>✅ 임시 비밀번호 자동 발급</li>
                    <li>✅ SMS/이메일로 링크 & 비밀번호 자동 발송</li>
                    <li>✅ 고객 즉시 사용 가능</li>
                </ul>
                <p style={{ marginTop: "12px", fontSize: "14px", opacity: 0.9 }}>
                    <strong>작가 개입: 0%</strong> • 모든 것이 자동입니다.
                </p>
            </div>

            {/* VIP 목록 */}
            <div>
                <h3
                    style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        marginBottom: "16px",
                    }}
                >
                    생성된 VIP 갤러리 ({vipArtists.length}개)
                </h3>

                {isLoading ? (
                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                            color: mutedColor,
                        }}
                    >
                        로딩 중...
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
                        아직 생성된 VIP 갤러리가 없습니다.
                        <br />
                        <span style={{ fontSize: "14px" }}>
                            첫 결제가 완료되면 여기에 표시됩니다.
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
                                                무료
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
                                                테스트용
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
                                            ` • ${artist.subscription_price?.toLocaleString()}원/월`}
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
                                        링크 복사
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
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* QR 모달 */}
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
                            {selectedVipQR.linkId} QR 코드
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
                            다운로드
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
