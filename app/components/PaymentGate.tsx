"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePayment } from "../contexts/PaymentContext";
import { getDeploymentMode, type DeploymentMode } from "../utils/deploymentMode";
import PaymentRequiredPage from "./PaymentRequiredPage";

interface PaymentGateProps {
    children: ReactNode;
    forcedMode?: DeploymentMode;
}

/**
 * 결제가 필요한 페이지를 감싸는 게이트 컴포넌트
 * - Always Free 모드: 항상 통과
 * - Showroom/Commercial 모드: 결제 완료 시에만 통과
 */
export default function PaymentGate({ children, forcedMode }: PaymentGateProps) {
    const mode = forcedMode || getDeploymentMode();
    const { isPaid, isLoading } = usePayment();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Always Free 모드: 항상 통과 (서버/클라이언트 동일)
    if (mode === 'always_free') {
        return <>{children}</>;
    }

    // 마운트되기 전에는 결제 필요 페이지를 숨기기 위해 빈 공간 또는 로딩 표시 (Showroom/Commercial 전용)
    if (!isMounted) {
        return <div style={{ minHeight: '100vh', background: '#fafafa' }} />;
    }

    // 로딩 중
    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa'
            }}>
                <div style={{
                    fontSize: '14px',
                    color: '#888',
                    fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                    확인 중...
                </div>
            </div>
        );
    }

    // [PG_SCREENING_MOD] 결제 완료 여부와 상관없이 항상 children(작품 목록 등)을 보여줍니다.
    // 결제 유도는 Header의 '구독버튼'을 통해 진행합니다.
    return <>{children}</>;
}
