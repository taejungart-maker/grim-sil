import { supabase, ARTIST_ID } from "./supabase";

export interface Encouragement {
    id: string;
    target_artist_id: string;
    author_name: string;
    author_archive_url?: string;
    content: string;
    created_at: string;
}

export interface ArtistPick {
    name: string;
    archiveUrl: string;
    imageUrl?: string;
}

// 1. 따뜻한 응원 한마디 (댓글) 기능
export async function loadEncouragements(): Promise<Encouragement[]> {
    try {
        const { data, error } = await supabase
            .from("encouragements")
            .select("*")
            .eq("target_artist_id", ARTIST_ID)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error("Failed to load encouragements:", err);
        return [];
    }
}

export async function saveEncouragement(authorName: string, content: string, authorArchiveUrl?: string): Promise<Encouragement | null> {
    try {
        const { data, error } = await supabase
            .from("encouragements")
            .insert({
                target_artist_id: ARTIST_ID,
                author_name: authorName,
                author_archive_url: authorArchiveUrl,
                content: content,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.error("Failed to save encouragement:", err);
        return null;
    }
}

export async function deleteEncouragement(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from("encouragements")
            .delete()
            .eq("id", id)
            .eq("target_artist_id", ARTIST_ID);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error("Failed to delete encouragement:", err);
        return false;
    }
}

// 2. 실시간 소식 피드 기능 (전체 작가 대상 자동화)
export async function loadRecentNews(): Promise<{ id: string, text: string, type: string }[]> {
    try {
        // 1. 신규 작가 합류 소식
        const { data: recentSettings } = await supabase
            .from("settings")
            .select("artist_name, updated_at")
            .order("updated_at", { ascending: false })
            .limit(3);

        // 2. 신규 작품 등록 소식
        const { data: recentArtworks } = await supabase
            .from("artworks")
            .select("title, artist_name, created_at")
            .order("created_at", { ascending: false })
            .limit(5);

        // 3. 따뜻한 응원 소식
        const { data: recentEncouragements } = await supabase
            .from("encouragements")
            .select("author_name, created_at")
            .order("created_at", { ascending: false })
            .limit(3);

        const news: any[] = [];

        if (recentSettings) {
            recentSettings.forEach(s => news.push({
                id: `join-${s.updated_at}`,
                type: 'JOIN',
                text: `${s.artist_name} 작가님이 상생 네트워크에 합류하셨습니다! ✨`,
                time: new Date(s.updated_at).getTime()
            }));
        }

        if (recentArtworks) {
            recentArtworks.forEach(a => news.push({
                id: `art-${a.created_at}`,
                type: 'ART',
                text: `${a.artist_name || '동료'} 작가님이 새 작품 '${a.title}'을(를) 방금 등록하셨습니다! 🎨`,
                time: new Date(a.created_at).getTime()
            }));
        }

        if (recentEncouragements) {
            recentEncouragements.forEach(e => news.push({
                id: `enc-${e.created_at}`,
                type: 'ENC',
                text: `${e.author_name}님께서 따뜻한 응원의 한마디를 남겨주셨습니다. ❤️`,
                time: new Date(e.created_at).getTime()
            }));
        }

        // 시간순 정렬 후 10개만 반환
        return news
            .sort((a, b) => b.time - a.time)
            .slice(0, 10)
            .map(item => ({ id: item.id, text: item.text, type: item.type }));

    } catch (err) {
        console.error("Failed to load recent news:", err);
        return [];
    }
}
