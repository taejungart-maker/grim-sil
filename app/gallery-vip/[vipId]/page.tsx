import { notFound } from "next/navigation";
import { getVipArtistByLinkId } from "../../utils/vipArtistDb";
import VIPPageClient from "../../components/VIPPageClient";

interface PageProps {
    params: {
        vipId: string;
    };
}

export default async function VipGalleryPage({ params }: PageProps) {
    const { vipId } = params;

    // 🔗 링크 형식 보정 (gallery-vip-01 등)
    // 사용자가 /gallery-vip/01 또는 /gallery-vip/gallery-vip-01로 접속할 수 있음
    const linkId = vipId.startsWith("gallery-vip-") ? vipId : `gallery-vip-${vipId}`;

    // VIP 아티스트 존재 확인 (Server-side)
    const artist = await getVipArtistByLinkId(linkId);

    if (!artist) {
        notFound(); // 아티스트가 없으면 404
    }

    // 🎨 실제 클라이언트 컴포넌트 렌더링
    // artist.LinkID에서 ID 부분(01, 02 등)만 추출하거나 전체 LinkID 사용
    // VIPPageClient는 내부적으로 VIP_ID를 사용하여 데이터를 조회함
    const vipNumber = linkId.replace("gallery-vip-", "");

    return (
        <VIPPageClient
            VIP_ID={vipNumber}
            isAlwaysFree={artist.is_free}
        />
    );
}
