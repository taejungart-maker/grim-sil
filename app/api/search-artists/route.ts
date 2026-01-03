import { NextResponse } from "next/server";
import { getSupabaseClient } from "../../utils/supabase";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";

        if (!query.trim()) {
            return NextResponse.json({ artists: [] });
        }

        const supabase = getSupabaseClient();

        // VIP 작가들 검색 (이름으로)
        const { data, error } = await supabase
            .from("artists")
            .select("id, name, link_id, artist_type")
            .eq("artist_type", "vip")
            .ilike("name", `%${query}%`)
            .limit(20);

        if (error) {
            console.error("Search error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 각 작가의 화첩 URL과 프로필 이미지 생성
        const artists = (data || []).map(artist => ({
            id: artist.id,
            name: artist.name,
            archiveUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/${artist.link_id}`,
            linkId: artist.link_id
        }));

        return NextResponse.json({ artists });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
