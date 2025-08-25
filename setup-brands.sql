-- Setup Brands Table and Functions
-- Chạy file này trên Supabase SQL Editor

-- Tạo bảng brands để lưu thương hiệu
CREATE TABLE IF NOT EXISTS brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thêm dữ liệu mặc định cho 4 thương hiệu chính
INSERT INTO brands (name, slug, is_default) VALUES
    ('Zara', 'zara', TRUE),
    ('H&M', 'hm', TRUE),
    ('Uniqlo', 'uniqlo', TRUE),
    ('Mango', 'mango', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Cập nhật bảng consignments để sử dụng brand_id
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);
ALTER TABLE consignments ADD COLUMN IF NOT EXISTS brand_name TEXT; -- Giữ lại để tương thích ngược

-- Cập nhật các bản ghi hiện có
UPDATE consignments SET 
    brand_name = brand,
    brand_id = (SELECT id FROM brands WHERE slug = LOWER(brand))
WHERE brand_id IS NULL;

-- Tạo index cho brand_id
CREATE INDEX IF NOT EXISTS idx_consignments_brand_id ON consignments(brand_id);

-- Tạo RLS policies cho bảng brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Cho phép tất cả user đọc brands
CREATE POLICY "Allow all users to read brands" ON brands
    FOR SELECT USING (true);

-- Chỉ admin mới có thể thêm/sửa/xóa brands
CREATE POLICY "Allow admins to manage brands" ON brands
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Tạo function để tự động tạo brand mới khi cần
CREATE OR REPLACE FUNCTION create_brand_if_not_exists(brand_name TEXT)
RETURNS UUID AS $$
DECLARE
    brand_slug TEXT;
    brand_id UUID;
BEGIN
    -- Tạo slug từ tên thương hiệu
    brand_slug := LOWER(
        REGEXP_REPLACE(
            UNACCENT(brand_name), 
            '[^a-z0-9]+', 
            '', 
            'g'
        )
    );
    
    -- Kiểm tra xem brand đã tồn tại chưa
    SELECT id INTO brand_id FROM brands WHERE slug = brand_slug;
    
    -- Nếu chưa có thì tạo mới
    IF brand_id IS NULL THEN
        INSERT INTO brands (name, slug) VALUES (brand_name, brand_slug)
        RETURNING id INTO brand_id;
    END IF;
    
    RETURN brand_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cập nhật RLS policy cho consignments để cho phép user tạo brand mới
CREATE POLICY "Allow users to create consignments with new brands" ON consignments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Kiểm tra kết quả
SELECT 'Brands table created successfully' as status;
SELECT COUNT(*) as total_brands FROM brands;
SELECT name, slug, is_default FROM brands ORDER BY is_default DESC, name;
