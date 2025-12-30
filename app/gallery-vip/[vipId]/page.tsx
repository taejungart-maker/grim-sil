/**
 * VIP 갤러리 Dynamic Route
 * - /gallery-vip-01, /gallery-vip-02, ... 동적 처리
 * - VIP별 독립 데이터 조회
 * - 무료/결제 모드 자동 적용
 */

import { notFound } from "next/navigation";
import { getVipArtistByLinkId } from "../../utils/vipArtistDb";

interface PageProps {
    params: {
        vipId: string;
    };
}

export default async function VipGalleryPage({ params }: PageProps) {
    const { vipId } = params;
    const linkId = `gallery-vip-${vipId}`;

    // VIP 아티스트 존재 확인
    const artist = await getVipArtistByLinkId(linkId);

    if (!artist) {
        notFound(); // 404 페이지로 리다이렉트
    }

    // 메인 갤러리 페이지로 리다이렉트 (VIP ID를 환경변수로 전달)
    // 실제로는 메인 갤러리 컴포넌트를 사용하지만, artist_id를 전달
    return (
        <div>
            <h1>VIP Gallery: {artist.name}</h1>
            <p>Link ID: {artist.link_id}</p>
            <p>Type: {artist.is_free ? "무료" : "결제형"}</p>
        </div>
    );
}
