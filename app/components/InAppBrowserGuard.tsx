"use client";

import { useState, useEffect } from "react";
import { isKakaoTalkInAppBrowser, isNaverInAppBrowser, isFacebookInAppBrowser, openInExternalBrowser } from "../utils/browserDetect";

interface InAppBrowserGuardProps {
    children: React.ReactNode;
}

export default function InAppBrowserGuard({ children }: InAppBrowserGuardProps) {
    const [showWarning, setShowWarning] = useState(false);
    const [browserName, setBrowserName] = useState("");

    useEffect(() => {
        // 사용자가 이미 경고를 닫았는지 확인 (세션 스토리지)
        const hasClosedWarning = sessionStorage.getItem("inappbrowser_warning_closed");

        if (hasClosedWarning) {
            return;
        }

        if (isKakaoTalkInAppBrowser()) {
            setShowWarning(true);
            setBrowserName("카카오톡");
        } else if (isNaverInAppBrowser()) {
            setShowWarning(true);
            setBrowserName("네이버");
        } else if (isFacebookInAppBrowser()) {
            setShowWarning(true);
            setBrowserName("페이스북");
        }
    }, []);

    const handleOpenExternal = () => {
        openInExternalBrowser();
    };

    const handleClose = () => {
        setShowWarning(false);
        sessionStorage.setItem("inappbrowser_warning_closed", "true");
    };

    if (!showWarning) {
        return <>{children}</>;
    }

    return (
        <>
            {/* 인앱 브라우저 경고 오버레이 */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                    background: "rgba(0, 0, 0, 0.95)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        borderRadius: "20px",
                        maxWidth: "400px",
                        width: "100%",
                        padding: "32px 24px",
                        textAlign: "center",
                    }}
                >
                    {/* 아이콘 */}
                    <div style={{ marginBottom: "20px" }}>
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2"
                            style={{ margin: "0 auto" }}
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </div>

                    {/* 제목 */}
                    <h2
                        style={{
                            fontFamily: "'Noto Sans KR', sans-serif",
                            fontSize: "22px",
                            fontWeight: 700,
                            color: "#1a1a1a",
                            marginBottom: "12px",
                            lineHeight: 1.4,
                        }}
                    >
                        더 나은 환경으로 안내합니다
                    </h2>

                    {/* 설명 */}
                    <p
                        style={{
                            fontFamily: "'Noto Sans KR', sans-serif",
                            fontSize: "15px",
                            fontWeight: 400,
                            color: "#666",
                            lineHeight: 1.7,
                            marginBottom: "24px",
                        }}
                    >
                        {browserName} 앱 내 브라우저에서는<br />
                        일부 기능이 제한될 수 있습니다.<br />
                        <br />
                        <strong style={{ color: "#1a1a1a" }}>외부 브라우저</strong>에서 열면<br />
                        모든 기능을 원활하게 이용하실 수 있습니다.
                    </p>

                    {/* 버튼들 */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <button
                            onClick={handleOpenExternal}
                            style={{
                                width: "100%",
                                height: "56px",
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                fontFamily: "'Noto Sans KR', sans-serif",
                                fontSize: "16px",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                            }}
                        >
                            외부 브라우저에서 열기
                        </button>

                        <button
                            onClick={handleClose}
                            style={{
                                width: "100%",
                                height: "48px",
                                background: "transparent",
                                color: "#888",
                                border: "1px solid #e0e0e0",
                                borderRadius: "12px",
                                fontFamily: "'Noto Sans KR', sans-serif",
                                fontSize: "14px",
                                fontWeight: 500,
                                cursor: "pointer",
                            }}
                        >
                            괜찮아요, 계속 보기
                        </button>
                    </div>

                    {/* 안내 문구 */}
                    <p
                        style={{
                            fontFamily: "'Noto Sans KR', sans-serif",
                            fontSize: "12px",
                            fontWeight: 400,
                            color: "#999",
                            marginTop: "20px",
                            lineHeight: 1.6,
                        }}
                    >
                        💡 우측 상단 <strong style={{ color: "#666" }}>⋮ 메뉴</strong>에서<br />
                        "외부 브라우저에서 열기"를 선택하세요
                    </p>
                </div>
            </div>

            {/* 기존 콘텐츠는 배경만 흐리게 */}
            <div style={{ filter: showWarning ? "blur(8px)" : "none", pointerEvents: showWarning ? "none" : "auto" }}>
                {children}
            </div>
        </>
    );
}
