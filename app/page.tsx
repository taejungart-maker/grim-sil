import { getClientArtistId } from "./utils/getArtistId";
import HomeClient from "./HomeClient";
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  noStore();
  // [V11_ASYNC] 서버 사이드 비동기 테넌트 식별
  const { getServerArtistId } = require("./utils/getArtistId");
  const artistId = await getServerArtistId();

  console.log(`[Home Entrance] Injected Artist ID: ${artistId}`);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>불러오는 중...</p></div>}>
      <HomeClient injectedArtistId={artistId} />
    </Suspense>
  );
}
