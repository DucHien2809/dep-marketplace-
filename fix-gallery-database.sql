-- Fix Gallery Database Schema
-- Chạy trong Supabase SQL Editor để thêm các cột còn thiếu

-- 1. Thêm các cột mới vào bảng gallery_items
ALTER TABLE gallery_items 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'khac',
ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS price DECIMAL(12,2) DEFAULT 750000,
ADD COLUMN IF NOT EXISTS material TEXT DEFAULT 'Chưa cập nhật',
ADD COLUMN IF NOT EXISTS origin TEXT,
ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '["OneSize"]',
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Tái chế';

-- 2. Cập nhật cột origin cho các sản phẩm hiện có
UPDATE gallery_items 
SET origin = story 
WHERE origin IS NULL;

-- 3. Kiểm tra kết quả
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gallery_items' 
ORDER BY ordinal_position;
