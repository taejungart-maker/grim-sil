// 커스텀 훅: Supabase와 IndexedDB 동기화 (Safe Load 모드)
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient, InspirationRow } from '../utils/supabase';
import { getAllInspirations, InspirationData } from '../utils/indexedDbStorage';

export type SyncedInspiration = InspirationData;

export function useSyncedInspirations() {
    const [inspirations, setInspirations] = useState<SyncedInspiration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [serverError, setServerError] = useState<string | null>(null);

    const loadInspirations = useCallback(async () => {
        // ========================================
        // Safe Load 모드: 전체를 try-catch로 감싸서 페이지 튕김 방지
        // ========================================
        try {
            console.log('🔄 Starting inspiration load...');

            // ========================================
            // 1. IndexedDB 강제 렌더링 (최우선 0순위)
            // ========================================
            let localData: InspirationData[] = [];

            try {
                localData = await getAllInspirations();
                console.log('✅ Local Data:', localData);
                console.log(`📦 Found ${localData.length} inspirations in IndexedDB`);

                // 로컬 데이터가 있으면 즉시 화면에 렌더링
                if (localData.length > 0) {
                    const sortedLocal = [...localData].sort((a, b) => b.createdAt - a.createdAt);
                    setInspirations(sortedLocal);
                    setIsLoading(false); // 로컬 데이터로 일단 완료
                    console.log('✅ Local inspirations rendered immediately');
                } else {
                    console.log('ℹ️ No local inspirations found');
                }
            } catch (localError) {
                console.error('⚠️ IndexedDB error (non-critical):', localError);
                // 로컬 에러는 무시하고 계속
            }

            // ========================================
            // 2. 서버 로드 시도 (완전 선택적)
            // ========================================
            try {
                console.log('🌐 Attempting server load...');
                const supabase = getSupabaseClient();

                const { data: serverData, error: serverError } = await supabase
                    .from('inspirations')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (serverError) {
                    console.error('⚠️ Server error:', serverError);

                    if (serverError.message?.includes('relation') ||
                        serverError.message?.includes('does not exist') ||
                        serverError.code === '42P01') {
                        setServerError('SQL 설정을 확인하세요. inspirations 테이블이 없습니다.');
                        console.error('🔴 Table missing - run create-inspirations-table.sql');
                    } else {
                        setServerError('서버 연결 실패. 로컬 데이터만 표시합니다.');
                    }

                    // 서버 에러 시 로컬 데이터 유지하고 종료
                    return;
                }

                console.log('✅ Server Data:', serverData);

                // ========================================
                // 3. 데이터 파싱 방어 코드 (빈 응답 처리 개선)
                // ========================================
                // 빈 객체({}) 또는 빈 배열([])은 에러가 아닌 정상 상태
                if (!serverData || (typeof serverData === 'object' && Object.keys(serverData).length === 0 && !Array.isArray(serverData))) {
                    console.log('ℹ️ Server returned empty object, keeping local data only');
                    // 로컬 데이터 유지하고 정상 종료
                    return;
                }

                if (Array.isArray(serverData) && serverData.length > 0) {
                    console.log(`🌐 Found ${serverData.length} inspirations on server`);

                    const mergedData: SyncedInspiration[] = [];
                    const localMapById = new Map(localData.map(item => [item.id, item]));

                    (serverData as unknown as InspirationRow[]).forEach((serverItem, index) => {
                        try {
                            // color_palette 파싱 방어 (강화)
                            let colorPalette: string[] = [];
                            const rawPalette = serverItem.color_palette as unknown;

                            if (rawPalette) {
                                if (Array.isArray(rawPalette)) {
                                    colorPalette = rawPalette as string[];
                                } else if (typeof rawPalette === 'string') {
                                    try {
                                        const parsed = JSON.parse(rawPalette);
                                        colorPalette = Array.isArray(parsed) ? parsed : [];
                                    } catch (parseError) {
                                        console.warn(`⚠️ Failed to parse color_palette for item ${index}:`, parseError);
                                        colorPalette = [];
                                    }
                                } else if (typeof rawPalette === 'object') {
                                    // JSONB가 객체로 올 경우 (드문 케이스지만 방어)
                                    colorPalette = Object.values(rawPalette as object).filter(v => typeof v === 'string');
                                }
                            }

                            // metadata 파싱 방어
                            let metadata: InspirationRow['metadata'] = {
                                timestamp: Date.now(),
                                original_filename: ''
                            };
                            const rawMetadata = serverItem.metadata as unknown;

                            if (rawMetadata) {
                                if (typeof rawMetadata === 'object') {
                                    metadata = rawMetadata as InspirationRow['metadata'];
                                } else if (typeof rawMetadata === 'string') {
                                    try {
                                        metadata = JSON.parse(rawMetadata) as InspirationRow['metadata'];
                                    } catch (parseError) {
                                        console.warn(`⚠️ Failed to parse metadata for item ${index}:`, parseError);
                                    }
                                }
                            }

                            const localItem = localMapById.get(serverItem.id);

                            mergedData.push({
                                id: serverItem.id || `server-${index}`,
                                originalFileName: localItem?.originalFileName || metadata?.original_filename || '',
                                imageUrl: serverItem.image_url || '', // ✅ 추가
                                blurImageUrl: serverItem.blur_image_url || '',
                                colorPalette: colorPalette,
                                metadata: metadata,
                                localPath: localItem?.localPath,
                                createdAt: serverItem.created_at ? new Date(serverItem.created_at).getTime() : Date.now(),
                            });

                            localMapById.delete(serverItem.id);
                        } catch (itemError) {
                            console.error(`⚠️ Error processing server item ${index}:`, itemError);
                            // 개별 아이템 에러는 스킵하고 계속
                        }
                    });

                    // 로컬에만 있는 항목 추가
                    localMapById.forEach((item) => {
                        console.log('📦 Local-only item:', item.id);
                        mergedData.push(item);
                    });

                    // 최신순 정렬
                    mergedData.sort((a, b) => b.createdAt - a.createdAt);

                    setInspirations(mergedData);
                    console.log('✅ Merged data:', mergedData.length, 'total inspirations');
                } else {
                    console.log('ℹ️ No server data (empty array or null), keeping local only');
                    // 빈 배열이거나 null인 경우도 정상 상태로 처리
                }

            } catch (serverConnectionError) {
                console.error('⚠️ Server connection failed:', serverConnectionError);
                setServerError('서버 연결 실패. 로컬 데이터만 표시합니다.');
                // 로컬 데이터 유지
            }

        } catch (criticalError) {
            // ========================================
            // Safe Load: 최종 안전망
            // ========================================
            console.error('🔴 Critical error in loadInspirations:', criticalError);
            setServerError('데이터 로드 중 오류 발생');

            // 빈 배열이라도 반환해서 페이지 튕김 방지
            setInspirations([]);

        } finally {
            // 무조건 로딩 완료 처리
            setIsLoading(false);
            console.log('✅ Load complete');
        }
    }, []);

    // 클라이언트 사이드에서만 실행 (하이드레이션 방지)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log('🚀 Initializing useSyncedInspirations');
            loadInspirations();
        }
    }, [loadInspirations]);

    const refresh = useCallback(() => {
        console.log('🔄 Refresh requested');
        loadInspirations();
    }, [loadInspirations]);

    return {
        inspirations,
        isLoading,
        serverError,
        refresh,
    };
}
