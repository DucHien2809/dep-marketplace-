-- Thêm các cột còn thiếu vào bảng gallery_items
-- Chạy trong Supabase SQL Editor

-- 1. Thêm cột price (giá bán)
ALTER TABLE gallery_items 
ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 750000;

-- 2. Thêm cột original_price (giá gốc)
ALTER TABLE gallery_items 
ADD COLUMN IF NOT EXISTS original_price INTEGER;

-- 3. Thêm cột category (loại sản phẩm)
ALTER TABLE gallery_items 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'khac';

-- 4. Thêm cột style (phong cách)
ALTER TABLE gallery_items 
ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'basic';

-- 5. Thêm cột sizes (kích thước)
ALTER TABLE gallery_items 
ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '["M"]';

-- 6. Thêm cột material (chất liệu)
ALTER TABLE gallery_items 
ADD COLUMN IF NOT EXISTS material TEXT DEFAULT 'Chưa cập nhật';

-- 7. Thêm cột origin (nguồn gốc tái chế)
ALTER TABLE gallery_items 
ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'Chưa có thông tin nguồn gốc';

-- 8. Thêm cột condition (tình trạng)
ALTER TABLE gallery_items 
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Tái chế';

-- 9. Tạo indexes cho các cột mới
CREATE INDEX IF NOT EXISTS idx_gallery_items_price ON gallery_items(price);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_style ON gallery_items(style);

-- 10. Kiểm tra cấu trúc bảng sau khi thêm
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'gallery_items' 
AND column_name IN (
    'price', 'original_price', 'category', 'style', 
    'sizes', 'material', 'origin', 'condition'
)
ORDER BY column_name;

-- 11. Cập nhật dữ liệu mẫu nếu cần
UPDATE gallery_items 
SET 
    price = 750000,
    category = 'khac',
    style = 'basic',
    sizes = '["M"]',
    material = 'Chưa cập nhật',
    origin = story, -- Sử dụng story làm origin mặc định
    condition = 'Tái chế'
WHERE price IS NULL;
