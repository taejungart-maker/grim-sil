"use client";

import { useState, useEffect, Suspense } from "react";
import Header from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { usePayment } from "../contexts/PaymentContext";
import { isPaymentRequired } from "../utils/deploymentMode";
import { useSyncedSettings } from "../hooks/useSyncedArtworks";

function PlaygroundContent() {
    const { settings } = useSyncedSettings();
    const { isAuthenticated, logout, login } = useAuth();
    const { isPaid } = usePayment();
    const needsPayment = isPaymentRequired();
    const [isMounted, setIsMounted] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [refundStatus, setRefundStatus] = useState<string>("");

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleTestRefund = () => {
        setRefundStatus("처리 중...");
        // 실제 환불 API 호출 시뮬레이션
        setTimeout(() => {
            const success = Math.random() > 0.3; // 70% 성공률 시뮬레이션
            if (success) {
                localStorage.removeItem('payment_status');
                setRefundStatus("✅ 환불 성공! 멤버십이 취소되었습니다.");
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setRefundStatus("❌ 환불 실패: API 오류가 발생했습니다.");
            }
        }, 2000);
    };

    const handleAuthToggle = () => {
        if (isAuthenticated) {
            logout();
        } else {
            setShowLoginModal(true);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                galleryNameKo="[실험실] Lab Playground"
                theme={settings.theme}
                isLoggedIn={isAuthenticated}
                isPaid={isPaid}
                needsPayment={needsPayment}
                onLogout={logout}
                onOpenPayment={() => setShowPaymentModal(true)}
                onKakaoShare={() => console.log("Share Clicked")}
            />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900">검증용 실험실 (Group 3)</h1>
                    <p className="text-gray-600 mb-8">
                        이 공간은 VIP 갤러리 및 작가 전용 페이지에 적용될 신규 기능을 배포 전 선행 검증하는 곳입니다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 권한 테스트 섹션 */}
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                            <h2 className="font-semibold mb-4 flex items-center gap-2">
                                🔐 권한 및 보안 테스트
                            </h2>
                            <div className="space-y-3">
                                <div className="p-3 bg-white rounded border text-sm">
                                    상태: {isAuthenticated ? "✅ 로그인됨 (작가)" : "❌ 비인증 (컬렉터)"}
                                </div>
                                <button
                                    onClick={handleAuthToggle}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                                >
                                    {isAuthenticated ? "로그아웃 하기" : "LoginModal 띄우기 (인증)"}
                                </button>
                                <div className="text-xs text-gray-500 mt-2">
                                    💡 인증 상태를 토글하여 버튼 변화를 확인하세요
                                </div>
                            </div>
                        </div>

                        {/* 결제 테스트 섹션 */}
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                            <h2 className="font-semibold mb-4 flex items-center gap-2">
                                💳 결제 및 환불 테스트
                            </h2>
                            <div className="space-y-3">
                                <div className="p-3 bg-white rounded border text-sm">
                                    멤버십: {isPaid ? "💎 프리미엄" : "🆓 무료"}
                                </div>
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                                >
                                    라이브 결제 시도
                                </button>
                                {isPaid && (
                                    <>
                                        <button
                                            onClick={handleTestRefund}
                                            disabled={refundStatus.includes("처리 중")}
                                            className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
                                        >
                                            {refundStatus.includes("처리 중") ? "처리 중..." : "실시간 결제 취소"}
                                        </button>
                                        {refundStatus && (
                                            <div className="text-xs p-2 bg-gray-100 rounded border">
                                                {refundStatus}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 공유 테스트 섹션 */}
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 md:col-span-2">
                            <h2 className="font-semibold mb-4 flex items-center gap-2">
                                🔗 동적 공유 및 캐시 테스트
                            </h2>
                            <div className="space-y-4">
                                <div className="text-sm text-gray-500">
                                    프로필 변경 시 <code className="bg-gray-200 px-1 rounded">og:image</code> 파라미터 갱신 여부를 확인합니다.
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden border">
                                        {settings.aboutmeImage && (
                                            <img src={settings.aboutmeImage} alt="Profile" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-xs break-all text-blue-600 bg-blue-50 p-2 rounded font-mono">
                                        {settings.aboutmeImage || "Not Set"}?v={Date.now()}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    ✅ 타임스탬프가 매 렌더링마다 변경되어 카카오톡 캐시를 무효화합니다.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => window.location.href = "/"}
                        className="text-gray-400 text-sm hover:underline"
                    >
                        ← 메인 갤러리로 돌아가기
                    </button>
                </div>
            </main>

            {/* LoginModal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSuccess={() => {
                    setShowLoginModal(false);
                }}
            />

            {/* PaymentModal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={() => {
                    window.location.reload();
                }}
            />
        </div>
    );
}

export default function PlaygroundPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Lab...</div>}>
            <PlaygroundContent />
        </Suspense>
    );
}
