import { getClientArtistId } from "./utils/getArtistId";
import HomeClient from "./HomeClient";
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  noStore();
  // [V8_FIX] 서버 사이드(미들웨어 헤더)에서 확정된 ID를 가져옴
  const artistId = getClientArtistId();

  console.log(`[Home Entrance] Injected Artist ID: ${artistId}`);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>불러오는 중...</p></div>}>
      <HomeClient injectedArtistId={artistId} />
    </Suspense>
  );
}
