import { loadSettings } from "../utils/settingsDb";

export const dynamic = "force-dynamic";

export default async function CheckDataPage() {
    const settings = await loadSettings();
    const artistId = process.env.NEXT_PUBLIC_ARTIST_ID || "default";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "NOT_SET";

    return (
        <div style={{ padding: "40px", fontFamily: "monospace", fontSize: "14px", lineHeight: "1.6" }}>
            <h1>🔍 Server Diagnostic Data</h1>
            <hr />
            <section>
                <h3>[Environment Variables]</h3>
                <p><b>NEXT_PUBLIC_ARTIST_ID:</b> <span style={{ color: "blue" }}>{artistId}</span></p>
                <p><b>NEXT_PUBLIC_SITE_URL:</b> <span style={{ color: "blue" }}>{siteUrl}</span></p>
            </section>

            <section style={{ marginTop: "30px" }}>
                <h3>[Live Database Settings (What the server sees)]</h3>
                <pre style={{ background: "#f4f4f4", padding: "20px", borderRadius: "8px" }}>
                    {JSON.stringify({
                        artistName: settings.artistName,
                        siteTitle: settings.siteTitle,
                        aboutmeImage: settings.aboutmeImage,
                    }, null, 2)}
                </pre>
            </section>

            <div style={{ marginTop: "40px", padding: "20px", background: "#fff3cd", borderRadius: "8px", border: "1px solid #ffeeba" }}>
                <b>💡 Why am I seeing this?</b><br />
                This page exists to confirm exactly who the server thinks the "owner" is.
                If it says "Hahyunju" here, the Vercel settings need adjustment.
                If it says "Bakya-il", then the issue is 100% KakaoTalk's cache.
            </div>
        </div>
    );
}
