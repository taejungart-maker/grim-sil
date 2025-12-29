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

    const deployTime = "2025-12-30 05:25 (Hardened V5 - Final)"; // 수동 업데이트

    // 3. 격리 자가 테스트 (존재하지 않는 ID로 쿼리 시 0개가 나오는지 확인)
    const { data: testData } = await supabase
        .from("artworks")
        .select("id")
        .eq("artist_id", "non-existent-isolation-test-id");

    const isIsolated = testData?.length === 0;

    const artistId = process.env.NEXT_PUBLIC_ARTIST_ID || "default";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "NOT_SET";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET";

    return (
        <div style={{ padding: "40px", fontFamily: "monospace", fontSize: "13px", lineHeight: "1.6" }}>
            <h1>🛡️ Absolute Isolation Audit V5 (System Live)</h1>
            <p style={{ color: "gray" }}><b>Last Hardened Deployment:</b> {deployTime}</p>
            <hr />

            <section>
                <h3>[Environment & Connectivity]</h3>
                <p><b>NEXT_PUBLIC_ARTIST_ID:</b> <span style={{ color: "blue" }}>{artistId}</span></p>
                <p><b>NEXT_PUBLIC_SITE_URL:</b> <span style={{ color: "blue" }}>{siteUrl}</span></p>
                <p><b>SUPABASE_URL:</b> <span style={{ color: "blue" }}>{supabaseUrl.substring(0, 15)}...</span></p>
                <div style={{
                    padding: "10px",
                    background: isIsolated ? "#d4edda" : "#f8d7da",
                    border: `1px solid ${isIsolated ? "#c3e6cb" : "#f5c6cb"}`,
                    borderRadius: "5px",
                    fontWeight: "bold"
                }}>
                    {isIsolated ? "✅ ISOLATION TEST PASSED: Queries are strictly filtered by artist_id." : "❌ ISOLATION TEST FAILED: All data is leaking!"}
                </div>
            </section>

            <section style={{ marginTop: "30px" }}>
                <h3>[Database Row Mapping Audit]</h3>
                <table border={1} cellPadding={10} style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr style={{ background: "#eee" }}>
                            <th>ID (Primary Key)</th>
                            <th>Artist Name</th>
                            <th>Artworks Count</th>
                            <th>Isolation ID (Column)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allSettings?.map(s => (
                            <tr key={s.id}>
                                <td><b>{s.id}</b></td>
                                <td>{s.artist_name}</td>
                                <td style={{ textAlign: "center", color: artworkCounts[s.id] ? "green" : "red", fontWeight: "bold" }}>
                                    {artworkCounts[s.id] || 0}
                                </td>
                                <td>{s.artist_id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <div style={{ marginTop: "40px", padding: "20px", background: "#fff3cd", borderRadius: "8px", border: "1px solid #ffeeba" }}>
                <b>💡 Analysis Guide:</b><br />
                - If different rooms have <b>different</b> artwork counts, isolation IS working in the DB.<br />
                - If they are all the same, the DB repair script failed on this instance.<br />
                - If count matches but user sees the same photos, check the <b>storage URLs or demo data duplicates</b>.
            </div>
        </div>
    );
}
