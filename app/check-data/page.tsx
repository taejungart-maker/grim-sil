import { supabase } from "../utils/supabase";

export const dynamic = "force-dynamic";

export default async function CheckDataPage() {
    // 1. 모든 설정 로드
    const { data: allSettings } = await supabase
        .from("settings")
        .select("*")
        .order("artist_id");

    // 2. 아티스트별 작품 수 집계
    const { data: artworks } = await supabase
        .from("artworks")
        .select("artist_id");

    const artworkCounts: Record<string, number> = {};
    artworks?.forEach(a => {
        artworkCounts[a.artist_id] = (artworkCounts[a.artist_id] || 0) + 1;
    });

    const artistId = process.env.NEXT_PUBLIC_ARTIST_ID || "default";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "NOT_SET";

    return (
        <div style={{ padding: "40px", fontFamily: "monospace", fontSize: "13px", lineHeight: "1.6" }}>
            <h1>🔍 Full System Diagnostic</h1>
            <hr />

            <section>
                <h3>[Environment]</h3>
                <p><b>NEXT_PUBLIC_ARTIST_ID:</b> <span style={{ color: "blue" }}>{artistId}</span></p>
                <p><b>NEXT_PUBLIC_SITE_URL:</b> <span style={{ color: "blue" }}>{siteUrl}</span></p>
            </section>

            <section style={{ marginTop: "30px" }}>
                <h3>[Database Isolation Audit]</h3>
                <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr style={{ background: "#eee" }}>
                            <th>Artist ID (Room)</th>
                            <th>Artist Name</th>
                            <th>Current Artworks</th>
                            <th>Site Title</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allSettings?.map(s => (
                            <tr key={s.artist_id}>
                                <td><b>{s.artist_id}</b></td>
                                <td>{s.artist_name_ko} ({s.artist_name})</td>
                                <td style={{ textAlign: "center", color: artworkCounts[s.artist_id] ? "green" : "red", fontWeight: "bold" }}>
                                    {artworkCounts[s.artist_id] || 0}
                                </td>
                                <td>{s.site_title}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <div style={{ marginTop: "40px", padding: "20px", background: "#fff3cd", borderRadius: "8px", border: "1px solid #ffeeba" }}>
                <b>💡 Analysis Guide:</b><br />
                - If multiple rooms have the same high artwork count (e.g., all 55), it means they are sharing the same artworks.<br />
                - If "vip-gallery-01" has 10 and "vip-gallery-02" has 0, but 02 shows 10 pictures, then the <b>frontend query's ID filter</b> is failing.<br />
                - If "default" shows "Hahyunju", the main page identity is compromised in the DB.
            </div>
        </div>
    );
}
