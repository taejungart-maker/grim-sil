"use client";

import { startSubscription } from "../utils/paymentUtils";

export default function MembershipPage() {
    const handleClick = async () => {
        const success = await startSubscription();
        if (success) {
            alert('구독 완료!');
            window.location.href = '/';
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fafafa"
        }}>
            <button
                onClick={handleClick}
                style={{
                    padding: "24px 80px",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#fff",
                    background: "#000",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}
            >
                구독하기
            </button>
        </div>
    );
}
