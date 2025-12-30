// 정책 데이터(약관, 개인정보, 환불) DB 삽입 스크립트
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const POLICIES = [
    {
        id: 'terms',
        title: '이용약관',
        content: `제1조 (목적)
본 약관은 태정(이하 "회사")가 제공하는 온라인 갤러리 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (서비스의 제공 및 변경)
1. 회사는 이용자에게 온라인 작품 전시 및 관람 서비스를 제공합니다.
2. 회사는 기술적 사양의 변경 등의 경우에는 장차 체결되는 계약에 의해 제공할 서비스의 내용을 변경할 수 있습니다.

제3조 (구독 및 결제)
1. 이용자는 정해진 구독료를 지불함으로써 서비스를 이용할 수 있습니다.
2. 서비스 이용 기간은 결제일로부터 1개월입니다.`
    },
    {
        id: 'privacy',
        title: '개인정보처리방침',
        content: `1. 개인정보의 수집 및 이용 목적
회사는 서비스 제공, 고객 문의 응대, 결제 처리를 위해 필요한 최소한의 개인정보를 수집합니다.

2. 수집하는 개인정보 항목
- 필수항목: 이름, 연락처, 이메일, 결제 정보
- 자동수집항목: IP주소, 쿠키, 서비스 이용 기록

3. 개인정보의 보유 및 이용 기간
이용자의 개인정보는 원칙적으로 이용 목적이 달성되면 지체 없이 파기합니다. 단, 관계 법령에 의해 보존할 필요가 있는 경우 일정 기간 보관합니다.`
    },
    {
        id: 'refund',
        title: '환불 및 교환 정책',
        content: `⚠️ [중요] 디지털 콘텐츠 특성상 결제 후 작품 열람 시 환불이 불가합니다.

제1조 (환불 원칙)
1. 본 서비스는 디지털 콘텐츠를 실시간으로 스트리밍하여 제공하는 서비스입니다.
2. 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조 제2항 제5호에 따라, 이용자가 콘텐츠를 열람하거나 이용을 개시한 경우 청약철회가 제한됩니다.

제2조 (청약철회 가능 조건)
1. 구매 후 7일 이내이며, 콘텐츠를 전혀 열람하지 않은 경우에 한하여 전액 환불이 가능합니다.
2. 시스템 오류로 인해 서비스를 정상적으로 이용하지 못한 경우 고객센터 확인 후 환불 처리됩니다.

제3조 (환불 절차)
고객센터(artflow010@gmail.com)를 통해 신청하며, 영업일 기준 3~5일 이내에 처리됩니다.`
    }
];

async function setupPolicies() {
    console.log('🚀 정책 테이블 확인 및 데이터 삽입 중...');

    // 테이블 생성 코드는 Supabase Dashboard SQL Editor에서 권장되지만,
    // 여기서는 upsert를 통해 데이터를 준비합니다.
    const { error } = await supabase
        .from('policies')
        .upsert(POLICIES, { onConflict: 'id' });

    if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "policies" does not exist')) {
            console.log('❌ "policies" 테이블이 없습니다. Dashboard에서 생성해야 합니다.');
            console.log('\n--- SQL 실행 가이드 ---');
            console.log('CREATE TABLE policies (id TEXT PRIMARY KEY, title TEXT, content TEXT, updated_at TIMESTAMPTZ DEFAULT NOW());');
        } else {
            console.error('❌ 오류 발생:', error);
        }
    } else {
        console.log('✅ 모든 정책 데이터가 성공적으로 동기화되었습니다!');
    }
}

setupPolicies();
