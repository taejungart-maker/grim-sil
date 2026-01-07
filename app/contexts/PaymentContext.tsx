"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getDeploymentMode, isPaymentRequired, isTestPaymentMode } from "../utils/deploymentMode";
import { processPayment as processPaymentReal } from "../utils/paymentUtils";

interface PaymentContextType {
    isPaid: boolean;
    isLoading: boolean;
    checkPaymentStatus: () => Promise<void>;
    processPayment: () => Promise<boolean>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
    const [isPaid, setIsPaid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // 결제 상태 확인
    const checkPaymentStatus = useCallback(async () => {
        const mode = getDeploymentMode();

        // Always Free 모드: 시연을 위해 결제 버튼 노출을 허용하되, 게이트는 무조건 통과 (Gate에서 처리)
        if (mode === 'always_free') {
            // 이 모드에서는 localStorage 상태를 따르도록 하여 버튼 노출 여부를 결정함
            // (내용 접근은 PaymentGate에서 무조건 허용됨)
        }

        // 클라이언트에서만 localStorage 확인
        if (typeof window !== 'undefined') {
            try {
                // Artist ID 기반 키 사용 (paymentUtils.ts와 동일)
                const { getClientArtistId } = await import('../utils/getArtistId');
                const artistId = getClientArtistId();
                const paymentKey = `payment_status__${artistId}`;
                const paymentStatus = localStorage.getItem(paymentKey);
                setIsPaid(paymentStatus === 'paid');
            } catch (error) {
                console.error('Failed to check payment status:', error);
                setIsPaid(false);
            } finally {
                setIsLoading(false);
            }
        }
    }, []);

    // 초기 로드 시 결제 상태 확인
    useEffect(() => {
        setIsMounted(true);
        checkPaymentStatus();
    }, [checkPaymentStatus]);


    // 결제 처리
    const processPayment = async (): Promise<boolean> => {
        const success = await processPaymentReal();
        if (success) {
            setIsPaid(true);
        }
        return success;
    };

    return (
        <PaymentContext.Provider value={{ isPaid, isLoading, checkPaymentStatus, processPayment }}>
            {children}
        </PaymentContext.Provider>
    );
}

export function usePayment() {
    const context = useContext(PaymentContext);
    if (context === undefined) {
        throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
}
