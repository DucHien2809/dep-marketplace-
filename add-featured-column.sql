-- Thêm cột 'featured' vào bảng gallery_items
-- Chạy trong Supabase SQL Editor

-- 1. Thêm cột featured (nếu muốn sử dụng tên này thay vì is_featured)
ALTER TABLE gallery_items 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- 2. Cập nhật dữ liệu từ cột is_featured sang featured (nếu cần)
UPDATE gallery_items 
SET featured = is_featured 
WHERE featured IS NULL AND is_featured IS NOT NULL;

-- 3. Tạo index cho cột featured
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured_new ON gallery_items(featured);

-- 4. Kiểm tra cấu trúc bảng sau khi thêm
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gallery_items' 
AND column_name IN ('featured', 'is_featured')
ORDER BY column_name;
