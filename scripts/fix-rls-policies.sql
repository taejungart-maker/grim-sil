-- ========================================
-- 영감 채집 Supabase RLS 정책 (재확인용)
-- ========================================
-- 문제: 403 Forbidden 에러
-- 원인: RLS 정책 미설정 또는 artist_id 헤더 누락
-- 해결: 아래 SQL 실행

-- 1. 기존 정책 삭제 (안전)
DROP POLICY IF EXISTS "Artists can view their own inspirations" ON inspirations;
DROP POLICY IF EXISTS "Artists can insert their own inspirations" ON inspirations;
DROP POLICY IF EXISTS "Artists can delete their own inspirations" ON inspirations;

-- 2. 개발용: PUBLIC 정책 (테스트 전용)
-- WARNING: 프로덕션에서는 절대 사용 금지!
CREATE POLICY "Allow all operations for testing"
  ON inspirations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. 프로덕션용: 작가별 격리 정책
-- 사용 시 위의 PUBLIC 정책을 먼저 삭제해야 함!
/*
DROP POLICY IF EXISTS "Allow all operations for testing" ON inspirations;

CREATE POLICY "Artists can view their own inspirations"
  ON inspirations
  FOR SELECT
  USING (artist_id = current_setting('request.headers')::json->>'x-artist-id');

CREATE POLICY "Artists can insert their own inspirations"
  ON inspirations
  FOR INSERT
  WITH CHECK (artist_id = current_setting('request.headers')::json->>'x-artist-id');

CREATE POLICY "Artists can delete their own inspirations"
  ON inspirations
  FOR DELETE
  USING (artist_id = current_setting('request.headers')::json->>'x-artist-id');
*/

-- ========================================
-- 확인 쿼리
-- ========================================
-- 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'inspirations';

-- 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'inspirations'
ORDER BY ordinal_position;

-- ========================================
-- Storage 버킷 설정 (수동)
-- ========================================
-- Supabase Dashboard → Storage:
-- 1. Bucket name: inspirations-blur
-- 2. Public: ON (필수!)
-- 3. Policies:
--    - INSERT: Allow public uploads
--    - SELECT: Allow public read
-- ========================================
