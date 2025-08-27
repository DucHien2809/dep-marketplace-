-- Setup Consignments Table for Marketplace
-- Chạy trong Supabase SQL Editor

-- Tạo bảng consignments (sản phẩm ký gửi)
CREATE TABLE IF NOT EXISTS consignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Product Information
    name TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    category TEXT NOT NULL,
    condition TEXT NOT NULL,
    size TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male','female')),
    
    -- Pricing
    desired_price DECIMAL(12,2) NOT NULL CHECK (desired_price >= 0), -- Giá người bán muốn nhận
    selling_price DECIMAL(12,2) NOT NULL CHECK (selling_price >= 0), -- Giá bán trên marketplace (bao gồm phí dịch vụ)
    service_fee DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0), -- Phí dịch vụ
    
    -- Images
    primary_image TEXT,
    gallery JSONB DEFAULT '[]', -- Array of image URLs
    
    -- Status and Approval
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sold', 'expired')),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    rejection_reason TEXT,
    
    -- Location and Shipping
    seller_location TEXT,
    shipping_methods JSONB DEFAULT '[]', -- Array of shipping options
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo indexes để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_consignments_user_id ON consignments(user_id);
CREATE INDEX IF NOT EXISTS idx_consignments_status ON consignments(status);
CREATE INDEX IF NOT EXISTS idx_consignments_category ON consignments(category);
CREATE INDEX IF NOT EXISTS idx_consignments_brand ON consignments(brand);
CREATE INDEX IF NOT EXISTS idx_consignments_condition ON consignments(condition);
CREATE INDEX IF NOT EXISTS idx_consignments_gender ON consignments(gender);
CREATE INDEX IF NOT EXISTS idx_consignments_created_at ON consignments(created_at);
CREATE INDEX IF NOT EXISTS idx_consignments_selling_price ON consignments(selling_price);

-- Tạo trigger để auto-update updated_at (idempotent)
DROP TRIGGER IF EXISTS update_consignments_updated_at ON consignments;
CREATE TRIGGER update_consignments_updated_at 
    BEFORE UPDATE ON consignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tạo RLS (Row Level Security) policies
ALTER TABLE consignments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all approved consignments
CREATE POLICY "Users can view approved consignments" ON consignments
    FOR SELECT USING (status = 'approved');

-- Policy: Users can insert their own consignments
CREATE POLICY "Users can insert own consignments" ON consignments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own consignments (if pending)
CREATE POLICY "Users can update own pending consignments" ON consignments
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Policy: Users can delete their own consignments (if pending)
CREATE POLICY "Users can delete own pending consignments" ON consignments
    FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- Policy: Admins can manage all consignments
CREATE POLICY "Admins can manage all consignments" ON consignments
    FOR ALL USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

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

-- Cập nhật bảng consignments để sử dụng brand_id thay vì brand text
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
