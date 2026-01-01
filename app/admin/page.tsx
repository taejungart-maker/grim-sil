import { getClientArtistId } from "../utils/getArtistId";
import AdminClient from "./AdminClient";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
    noStore();
    // [V8_FIX] 서버 사이드(미들웨어 헤더)에서 확정된 ID를 가져옴
    const artistId = getClientArtistId();

    console.log(`[Admin Entrance] Injected Artist ID: ${artistId}`);

    return <AdminClient injectedArtistId={artistId} />;
}
