-- inspirations 테이블에 image_url 컬럼 추가 (필수 필드 연동)
ALTER TABLE public.inspirations ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 기존 데이터 중 blur_image_url이 있으면 image_url로 복사 (마이그레이션)
UPDATE public.inspirations SET image_url = blur_image_url WHERE image_url IS NULL;

-- 스토리지 정책: inspiration-images 버킷에 대한 접근 권한 설정 가이드
-- Supabase Dashboard -> Storage -> 'inspiration-images' 버킷 생성 필수 (Public 활성화)
