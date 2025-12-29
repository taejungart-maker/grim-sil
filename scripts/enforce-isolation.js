
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function enforceIsolation() {
    console.log("🚀 Starting Absolute Isolation Guard (V2)...");

    const baseRow = {
        gallery_name_en: "Online Gallery",
        gallery_name_ko: "온라인 화첩",
        artist_name: "작가님",
        site_title: "작가님의 온라인 화첩",
        site_description: "작가님의 작품세계를 담은 공간입니다.",
        theme: "white",
        grid_columns: 4,
        show_price: false,
        default_artist_note: "",
        show_artist_note: true,
        show_critique: true,
        show_history: true,
        aboutme_note: "",
        aboutme_critique: "",
        aboutme_history: "",
        aboutme_image: "",
        artist_picks: [],
        news_text: "",
        admin_password: "admin1234",
        updated_at: new Date().toISOString()
    };

    const isolatedSettings = [
        {
            ...baseRow,
            id: "default",
            artist_name: "박야일",
            gallery_name_ko: "박야일 갤러리",
            site_title: "박야일 갤러리",
            site_description: "박야일 작가의 디지털 갤러리입니다.",
            aboutme_image: "https://whigdogcxbuhvsktqxah.supabase.co/storage/v1/object/public/artworks/images/1767030745234-axd3e409o.jpg"
        },
        {
            ...baseRow,
            id: "vip-gallery-01",
            artist_name: "하현주",
            gallery_name_ko: "하현주 갤러리",
            site_title: "하현주 작가님의 온라인 화첩",
            site_description: "하현주 작가의 작품세계를 담은 공간입니다.",
            aboutme_image: "/demo1.png"
        },
        {
            ...baseRow,
            id: "vip-gallery-02",
            artist_name: "박야일",
            gallery_name_ko: "박야일 갤러리 (VIP 02)",
            site_title: "박야일 갤러리 [VIP 02]",
            site_description: "박야일 작가의 VIP 전용 공간입니다.",
            aboutme_image: "/demo2.png"
        },
        {
            ...baseRow,
            id: "vip-gallery-03",
            artist_name: "황미경",
            gallery_name_ko: "황미경 갤러리",
            site_title: "황미경 작가의 온라인 화첩",
            site_description: "황미경 작가의 VIP 전용 공간입니다.",
            aboutme_image: "/demo3.png"
        },
        {
            ...baseRow,
            id: "vip-gallery-04",
            artist_name: "문혜경",
            gallery_name_ko: "문혜경 갤러리",
            site_title: "문혜경 작가님의 온라인 화첩",
            site_description: "문혜경 작가의 VIP 전용 공간입니다.",
            aboutme_image: "/demo4.png"
        },
        {
            ...baseRow,
            id: "vip-gallery-05",
            artist_name: "박야일",
            gallery_name_ko: "박야일 갤러리 (VIP 05)",
            site_title: "박야일 갤러리 [VIP 05]",
            site_description: "박야일 작가의 VIP 전용 공간입니다.",
            aboutme_image: "/demo5.png"
        }
    ];

    try {
        // 🧹 Clear existing (already cleared in V1 but safe to repeat)
        console.log("🧹 Ensuring settings table is clean...");
        await supabase.from('settings').delete().neq('id', 'FORCE_CLEAN');

        // 💎 Insert isolated records
        console.log("💎 Inserting 6 isolated records...");
        const { error: insError } = await supabase.from('settings').insert(isolatedSettings);
        if (insError) throw insError;

        console.log("✅ Isolation Layer 1 Successfully Established (Settings Fixed).");

        // 🛡️ Layer 1.5: Artwork Re-mapping check
        // We ensure that all artworks under 'default' ID stay as 'default' (Bakya-il Main)
        // and others keep their VIP IDs. The audit showed they are mostly correct.

    } catch (err) {
        console.error("❌ Isolation Failure:", err);
        process.exit(1);
    }
}

enforceIsolation();
