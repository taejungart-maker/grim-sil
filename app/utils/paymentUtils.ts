export async function startSubscription() {
    try {
        // Port One V2 SDK 동적 로드
        const PortOne = await import("@portone/browser-sdk/v2");

        const response = await PortOne.requestPayment({
            storeId: "store-69b1a422-27db-4295-818d-84a9a7e5136e",
            channelKey: "channel-key-4f2a8b54-c09c-4575-9a1c-de33285b2b20",
            paymentId: `sub-${crypto.randomUUID()}`,
            orderName: "데스크링크 표준형 구독",
            totalAmount: 100,
            currency: "CURRENCY_KRW",
            payMethod: "CARD",
        });

        console.log('Payment response:', response);

        if (response && !response.code) {
            localStorage.setItem('payment_status', 'paid');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Payment error:', error);
        return false;
    }
}
