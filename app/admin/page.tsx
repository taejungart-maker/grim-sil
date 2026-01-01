import { getClientArtistId } from "../utils/getArtistId";
import AdminClient from "./AdminClient";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
    noStore();
    // [V11_ASYNC] 서버 사이드 비동기 테넌트 식별
    const { getServerArtistId } = require("../utils/getArtistId");
    const artistId = await getServerArtistId();

    console.log(`[Admin Entrance] Injected Artist ID: ${artistId}`);

    return <AdminClient injectedArtistId={artistId} />;
}
