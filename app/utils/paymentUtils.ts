import * as PortOne from "@portone/browser-sdk/v2";

export async function requestPayment() {
    const response = await PortOne.requestPayment({
        storeId: "store-69b1a422-27db-4295-818d-84a9a7e5136e",
        channelKey: "channel-key-4f2a8b54-c09c-4575-9a1c-de33285b2b20",
        paymentId: `payment-${crypto.randomUUID()}`,
        orderName: "데스크링크 표준형 구독",
        totalAmount: 100,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
    });

    if (response?.code) {
        // 결제 실패
        console.error('Payment failed:', response);
        return false;
    }

    // 결제 성공
    localStorage.setItem('payment_status', 'paid');
    return true;
}
