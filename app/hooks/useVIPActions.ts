"use client";

import { useState } from "react";
import { SIGNATURE_COLORS } from "../utils/themeColors";

interface VIPActionsProps {
    artistName: string;
    galleryNameKo: string;
    aboutmeImage?: string;
}

export function useVIPActions({ artistName, galleryNameKo, aboutmeImage }: VIPActionsProps) {
    const [isRecommending, setIsRecommending] = useState(false);
    const [isRecommended, setIsRecommended] = useState(false);

    const handleKakaoShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `[VIP] ${artistName} 작가님의 온라인 Gallery`,
                    text: '프리미엄 구독 전용 공간입니다.',
                    url: url,
                });
            } catch (error) {
                fallbackToCopy(url);
            }
        } else {
            fallbackToCopy(url);
        }
    };

    const fallbackToCopy = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            alert("링크가 복사되었습니다. 카카오톡에 붙여넣어 공유해 보세요!");
        }).catch(err => {
            console.error('클립보드 복사 실패:', err);
        });
    };

    const handleRecommendArtist = async () => {
        if (isRecommending || isRecommended) return;

        setIsRecommending(true);
        try {
            const response = await fetch('/api/add-artist-pick', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artistName: artistName,
                    artistUrl: typeof window !== 'undefined' ? window.location.href : '',
                    imageUrl: aboutmeImage || undefined
                }),
            });

            if (response.ok) {
                setIsRecommended(true);
                alert(`${artistName} 작가님을 내 갤러리에 추천했습니다!`);
            } else if (response.status === 409) {
                setIsRecommended(true);
                alert('이미 추천한 작가입니다.');
            } else if (response.status === 401) {
                alert('로그인이 필요합니다.');
            } else {
                alert('추천에 실패했습니다. 다시 시도해 주세요.');
            }
        } catch (error) {
            console.error('Recommendation error:', error);
            alert('네트워크 오류가 발생했습니다.');
        } finally {
            setIsRecommending(false);
        }
    };

    return {
        isRecommending,
        isRecommended,
        handleKakaoShare,
        handleRecommendArtist
    };
}
