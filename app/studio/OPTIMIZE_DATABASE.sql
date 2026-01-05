-- inspirations 테이블 조회 성능 최적화
-- 1. artist_id를 기준으로 조회를 빠르게 하기 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_inspirations_artist_id ON public.inspirations (artist_id);

-- 2. 최신순 정렬(created_at)을 빠르게 하기 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_inspirations_artist_created_at ON public.inspirations (artist_id, created_at DESC);

-- 3. 메타데이터 검색이 필요할 경우를 대비한 인덱스 (옵션)
-- CREATE INDEX IF NOT EXISTS idx_inspirations_metadata ON public.inspirations USING GIN (metadata);

COMMENT ON INDEX idx_inspirations_artist_created_at IS '작가별 최신 영감 조회를 위한 성능 최적화 인덱스';
