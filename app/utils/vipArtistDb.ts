/**
 * VIP 아티스트 관리 유틸리티
 * - VIP 링크 자동 생성
 * - 무료/결제 모드 설정
 * - 개별 비밀번호 관리
 */

import { supabase } from "./supabase";
import bcrypt from "bcryptjs";

export interface VipArtist {
    id: string;
    name: string;
    link_id: string;
    artist_type: "vip";
    is_free: boolean;
    subscription_price?: number;
    created_at: string;
}

/**
 * 사용 가능한 다음 VIP 번호 찾기
 * @returns 다음 사용 가능한 VIP 번호 (예: 1, 2, 3...)
 */
export async function getNextVipNumber(): Promise<number> {
    try {
        const { data, error } = await supabase
            .from("artists")
            .select("link_id")
            .like("link_id", "gallery-vip-%")
            .order("link_id", { ascending: false });

        if (error) {
            console.error("Failed to fetch VIP artists:", error);
            return 1;
        }

        if (!data || data.length === 0) {
            return 1;
        }

        // 가장 큰 번호 찾기
        const numbers = data
            .map((artist) => {
                const match = artist.link_id?.match(/gallery-vip-(\d+)/);
                return match ? parseInt(match[1], 10) : 0;
            })
            .filter((num) => !isNaN(num));

        const maxNumber = Math.max(...numbers, 0);
        return maxNumber + 1;
    } catch (error) {
        console.error("Error getting next VIP number:", error);
        return 1;
    }
}

/**
 * VIP 아티스트 생성
 * @param name 아티스트 이름
 * @param password 비밀번호 (평문)
 * @param isFree 무료 링크 여부
 * @param subscriptionPrice 구독 가격 (결제형인 경우)
 * @returns 생성된 VIP 아티스트 정보
 */
export async function createVipArtist(
    name: string,
    password: string,
    isFree: boolean = false,
    subscriptionPrice?: number
): Promise<VipArtist> {
    try {
        // 다음 VIP 번호 가져오기
        const vipNumber = await getNextVipNumber();
        const linkId = `gallery-vip-${String(vipNumber).padStart(2, "0")}`;

        // 고유 artist_id 생성 (랜덤)
        const artistId = `-${Math.random().toString(36).substr(2, 4)}`;

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // artists 테이블에 삽입
        const { data: artist, error: artistError } = await supabase
            .from("artists")
            .insert([
                {
                    id: artistId,
                    name: name,
                    link_id: linkId,
                    artist_type: "vip",
                    is_free: isFree,
                    subscription_price: subscriptionPrice || null,
                },
            ])
            .select()
            .single();

        if (artistError) {
            console.error("Failed to create artist:", artistError);
            throw new Error(`아티스트 생성 실패: ${artistError.message}`);
        }

        // auth_passwords 테이블에 비밀번호 저장
        const { error: passwordError } = await supabase
            .from("auth_passwords")
            .insert([
                {
                    artist_id: artistId,
                    password_hash: hashedPassword,
                },
            ]);

        if (passwordError) {
            console.error("Failed to save password:", passwordError);
            // 비밀번호 저장 실패 시 artist도 롤백
            await supabase.from("artists").delete().eq("id", artistId);
            throw new Error(`비밀번호 저장 실패: ${passwordError.message}`);
        }

        console.log(`✅ VIP 아티스트 생성 완료: ${name} (${linkId})`);

        return {
            id: artist.id,
            name: artist.name,
            link_id: artist.link_id,
            artist_type: "vip",
            is_free: artist.is_free,
            subscription_price: artist.subscription_price,
            created_at: artist.created_at,
        };
    } catch (error) {
        console.error("Error creating VIP artist:", error);
        throw error;
    }
}

/**
 * 모든 VIP 아티스트 조회
 * @returns VIP 아티스트 목록
 */
export async function getAllVipArtists(): Promise<VipArtist[]> {
    try {
        const { data, error } = await supabase
            .from("artists")
            .select("*")
            .eq("artist_type", "vip")
            .order("link_id", { ascending: true });

        if (error) {
            console.error("Failed to fetch VIP artists:", error);
            return [];
        }

        return (data || []).map((artist) => ({
            id: artist.id,
            name: artist.name,
            link_id: artist.link_id,
            artist_type: "vip",
            is_free: artist.is_free || false,
            subscription_price: artist.subscription_price,
            created_at: artist.created_at,
        }));
    } catch (error) {
        console.error("Error fetching VIP artists:", error);
        return [];
    }
}

/**
 * VIP 아티스트 삭제
 * @param artistId 아티스트 ID
 */
export async function deleteVipArtist(artistId: string): Promise<void> {
    try {
        // 해당 아티스트의 모든 작품 삭제
        const { error: artworksError } = await supabase
            .from("artworks")
            .delete()
            .eq("artist_id", artistId);

        if (artworksError) {
            console.error("Failed to delete artworks:", artworksError);
        }

        // 비밀번호 삭제
        const { error: passwordError } = await supabase
            .from("auth_passwords")
            .delete()
            .eq("artist_id", artistId);

        if (passwordError) {
            console.error("Failed to delete password:", passwordError);
        }

        // 아티스트 삭제
        const { error: artistError } = await supabase
            .from("artists")
            .delete()
            .eq("id", artistId);

        if (artistError) {
            throw new Error(`아티스트 삭제 실패: ${artistError.message}`);
        }

        console.log(`✅ VIP 아티스트 삭제 완료: ${artistId}`);
    } catch (error) {
        console.error("Error deleting VIP artist:", error);
        throw error;
    }
}

/**
 * VIP 링크 URL 생성
 * @param linkId link_id (예: gallery-vip-01)
 * @returns 전체 URL
 */
export function generateVipLinkUrl(linkId: string): string {
    if (typeof window === "undefined") {
        return `/${linkId}`;
    }
    return `${window.location.origin}/${linkId}`;
}

/**
 * link_id로 VIP 아티스트 조회
 * @param linkId link_id (예: gallery-vip-01)
 * @returns VIP 아티스트 정보 또는 null
 */
export async function getVipArtistByLinkId(
    linkId: string
): Promise<VipArtist | null> {
    try {
        const { data, error } = await supabase
            .from("artists")
            .select("*")
            .eq("link_id", linkId)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            id: data.id,
            name: data.name,
            link_id: data.link_id,
            artist_type: "vip",
            is_free: data.is_free || false,
            subscription_price: data.subscription_price,
            created_at: data.created_at,
        };
    } catch (error) {
        console.error("Error fetching VIP artist by link_id:", error);
        return null;
    }
}

/**
 * VIP 링크가 무료인지 확인
 * @param linkId link_id (예: gallery-vip-01)
 * @returns 무료 여부
 */
export async function isVipFree(linkId: string): Promise<boolean> {
    // VIP-01은 항상 무료
    if (linkId === "gallery-vip-01") {
        return true;
    }

    const artist = await getVipArtistByLinkId(linkId);
    return artist?.is_free || false;
}
