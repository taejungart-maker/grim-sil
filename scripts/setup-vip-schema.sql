-- VIP 시스템을 위한 artists 테이블 스키마 업데이트
-- Supabase SQL Editor에서 실행하세요

-- 1. artists 테이블에 VIP 관련 컬럼 추가
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS link_id TEXT,
ADD COLUMN IF NOT EXISTS artist_type TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_price INTEGER;

-- 2. link_id에 유니크 제약 추가
ALTER TABLE artists 
ADD CONSTRAINT unique_link_id UNIQUE (link_id);

-- 3. auth_passwords 테이블 생성 (VIP별 비밀번호 저장)
CREATE TABLE IF NOT EXISTS auth_passwords (
    id SERIAL PRIMARY KEY,
    artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. artist_id에 유니크 제약 추가
ALTER TABLE auth_passwords 
ADD CONSTRAINT unique_artist_password UNIQUE (artist_id);

-- 5. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_artists_link_id ON artists(link_id);
CREATE INDEX IF NOT EXISTS idx_artists_type ON artists(artist_type);
CREATE INDEX IF NOT EXISTS idx_auth_passwords_artist_id ON auth_passwords(artist_id);

-- 6. 기존 데이터 업데이트 (선택사항)
UPDATE artists 
SET artist_type = 'standard' 
WHERE artist_type IS NULL;

COMMENT ON COLUMN artists.link_id IS 'VIP 갤러리 링크 ID (예: gallery-vip-01)';
COMMENT ON COLUMN artists.artist_type IS '아티스트 타입: standard, vip';
COMMENT ON COLUMN artists.is_free IS 'VIP 무료 여부';
COMMENT ON COLUMN artists.subscription_price IS 'VIP 구독 가격 (원)';
