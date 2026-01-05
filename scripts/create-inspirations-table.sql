-- ========================================
-- 영감 채집 시스템 Supabase 테이블 생성
-- ========================================
-- 실행 방법: Supabase Dashboard → SQL Editor에서 복사/붙여넣기 후 RUN

-- 1. inspirations 테이블 생성
CREATE TABLE IF NOT EXISTS inspirations (
  id UUID PRIMARY KEY,
  artist_id TEXT NOT NULL,
  blur_image_url TEXT NOT NULL,
  color_palette JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_inspirations_artist_id 
  ON inspirations(artist_id);

CREATE INDEX IF NOT EXISTS idx_inspirations_created_at 
  ON inspirations(created_at DESC);

-- 3. Row Level Security (RLS) 활성화
ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;

-- 4. 작가별 데이터 격리 정책 (읽기)
DROP POLICY IF EXISTS "Artists can view their own inspirations" ON inspirations;
CREATE POLICY "Artists can view their own inspirations"
  ON inspirations
  FOR SELECT
  USING (artist_id = current_setting('request.headers')::json->>'x-artist-id');

-- 5. 작가별 데이터 격리 정책 (쓰기)
DROP POLICY IF EXISTS "Artists can insert their own inspirations" ON inspirations;
CREATE POLICY "Artists can insert their own inspirations"
  ON inspirations
  FOR INSERT
  WITH CHECK (artist_id = current_setting('request.headers')::json->>'x-artist-id');

-- 6. 작가별 데이터 격리 정책 (삭제)
DROP POLICY IF EXISTS "Artists can delete their own inspirations" ON inspirations;
CREATE POLICY "Artists can delete their own inspirations"
  ON inspirations
  FOR DELETE
  USING (artist_id = current_setting('request.headers')::json->>'x-artist-id');

-- ========================================
-- 확인 쿼리
-- ========================================
-- 테이블이 생성되었는지 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'inspirations';

-- 정책이 생성되었는지 확인
SELECT * 
FROM pg_policies 
WHERE tablename = 'inspirations';

-- ========================================
-- 스토리지 버킷 (수동 생성 필요)
-- ========================================
-- Supabase Dashboard → Storage → Create Bucket:
-- 
-- Bucket name: inspirations-blur
-- Public bucket: ON (체크 필수!)
-- File size limit: 50 MB
-- Allowed MIME types: image/*
-- 
-- Policies 설정:
-- 1. INSERT: Allow public uploads
-- 2. SELECT: Allow public read
-- ========================================
