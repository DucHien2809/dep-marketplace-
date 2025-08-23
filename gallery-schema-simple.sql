-- Gallery Schema for Đẹp Collection (Simplified - No slug generation)
-- Chạy trong Supabase SQL Editor

-- 1. Tạo bảng gallery_items (Đẹp Collection items)
CREATE TABLE IF NOT EXISTS gallery_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    story TEXT NOT NULL, -- Câu chuyện tái chế
    image_url TEXT NOT NULL, -- Main image URL
    gallery JSONB DEFAULT '[]', -- Array of additional image URLs
    tags JSONB DEFAULT '[]', -- Array of tags (vintage, modern, boho, etc.)
    is_featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
    
    -- SEO và metadata
    meta_title TEXT,
    meta_description TEXT,
    
    -- Admin info
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 2. Tạo indexes
CREATE INDEX IF NOT EXISTS idx_gallery_items_status ON gallery_items(status);
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON gallery_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at ON gallery_items(created_at);
CREATE INDEX IF NOT EXISTS idx_gallery_items_published_at ON gallery_items(published_at);

-- 3. Trigger để auto-update updated_at
CREATE TRIGGER update_gallery_items_updated_at 
    BEFORE UPDATE ON gallery_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Function để track views
CREATE OR REPLACE FUNCTION increment_gallery_views(item_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE gallery_items 
    SET views = views + 1, updated_at = NOW()
    WHERE id = item_id;
END;
$$ language 'plpgsql';

-- 5. Insert sample gallery items
INSERT INTO gallery_items (
    title, 
    story, 
    image_url, 
    tags, 
    is_featured,
    status,
    published_at
) VALUES
(
    'Áo kiểu Vintage Renaissance',
    'Tái sinh từ áo sơ mi linen thập niên 80, kết hợp với ren vintage từ Pháp. Mỗi đường kim mũi chỉ đều mang trong mình câu chuyện về sự bền vững và tình yêu với thời trang.',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop',
    '["vintage", "renaissance", "linen", "france"]',
    true,
    'active',
    NOW()
),
(
    'Váy Tái Chế Bohemian',
    'Từ những mảnh vải cotton organic còn sót lại, tạo nên tác phẩm nghệ thuật mới. Màu sắc tự nhiên, hoạ tiết thêu tay tinh xảo thể hiện triết lý sống hòa hợp với thiên nhiên.',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
    '["boho", "organic", "cotton", "handmade"]',
    true,
    'active',
    NOW()
),
(
    'Túi Tote Minimalist',
    'Canvas tái chế từ bao bì cũ, thiết kế tối giản nhưng đầy tinh tế. Chỉ với màu trắng ngà và đường may chắc chắn, chiếc túi này là biểu tượng của sự bền vững trong cuộc sống hiện đại.',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
    '["minimalist", "canvas", "tote", "sustainable"]',
    false,
    'active',
    NOW()
),
(
    'Áo Khoác Denim Upcycled',
    'Biến hóa từ áo khoác denim cũ thành tác phẩm streetwear hiện đại. Những mảng vá nghệ thuật và chi tiết thêu tay tạo nên phong cách độc đáo, thể hiện cá tính mạnh mẽ.',
    'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=500&fit=crop',
    '["modern", "streetwear", "denim", "upcycled"]',
    true,
    'active',
    NOW()
),
(
    'Váy Cocktail Vintage',
    'Phục hồi từ váy cocktail thập niên 60, giữ nguyên vẻ đẹp cổ điển. Lụa tơ tằm cao cấp được xử lý tỉ mỉ, tái hiện lại những đường cong quyến rũ của thời hoàng kim.',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop',
    '["vintage", "cocktail", "silk", "60s"]',
    false,
    'active',
    NOW()
),
(
    'Áo Blouse Bohemian Chic',
    'Kết hợp vải lụa vintage với thêu tay truyền thống Việt Nam. Những họa tiết hoa lá tinh xảo được thêu bằng chỉ tơ tự nhiên, tạo nên vẻ đẹp thanh thoát, duyên dáng.',
    'https://images.unsplash.com/photo-1583743814966-8936f37f631b?w=400&h=500&fit=crop',
    '["boho", "silk", "vietnamese", "embroidery"]',
    true,
    'active',
    NOW()
);

-- 6. Row Level Security (RLS) policies
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active gallery items
CREATE POLICY "Gallery items are viewable by everyone" 
    ON gallery_items FOR SELECT 
    USING (status = 'active');

-- Policy: Only admins can insert/update/delete gallery items
CREATE POLICY "Only admins can manage gallery items" 
    ON gallery_items FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Grant permissions
GRANT SELECT ON gallery_items TO anon, authenticated;
GRANT ALL ON gallery_items TO authenticated;
