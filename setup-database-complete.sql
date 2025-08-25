-- Thiết lập hoàn chỉnh database cho hệ thống quản lý bán hàng
-- Chuyển từ localStorage sang Supabase

-- 1. Bảng brands (đã có từ setup-brands.sql)
-- CREATE TABLE brands (id, name, slug, is_default)

-- 2. Bảng consignments (đã có từ database-schema.sql)
-- CREATE TABLE consignments (id, user_id, title, brand_id, brand_name, size, category, condition, description, price, selling_price, service_fee, images, status, created_at, updated_at)

-- 3. Bảng blog_posts (đã có từ setup-blog-database.sql)
-- CREATE TABLE blog_posts (id, title, category, excerpt, content, tags, author_id, author_name, views, created_at, updated_at)

-- 4. Bảng mới: user_drafts
CREATE TABLE IF NOT EXISTS user_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    draft_type TEXT NOT NULL CHECK (draft_type IN ('consign', 'blog')),
    draft_data JSONB NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bảng mới: user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    user_role TEXT DEFAULT 'user' CHECK (user_role IN ('user', 'admin', 'moderator')),
    user_email TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Bảng mới: marketplace_filters
CREATE TABLE IF NOT EXISTS marketplace_filters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    filter_type TEXT NOT NULL CHECK (filter_type IN ('brand', 'category', 'price_range', 'condition')),
    filter_value TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_drafts_user_type ON user_drafts(user_id, draft_type);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_filters_user_id ON marketplace_filters(user_id);

-- Enable RLS
ALTER TABLE user_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_filters ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho user_drafts
CREATE POLICY "Users can view their own drafts" ON user_drafts
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own drafts" ON user_drafts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own drafts" ON user_drafts
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own drafts" ON user_drafts
    FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies cho user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Admins can view all preferences" ON user_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_preferences 
            WHERE user_id = auth.uid()::text AND user_role = 'admin'
        )
    );

-- RLS Policies cho marketplace_filters
CREATE POLICY "Users can view their own filters" ON marketplace_filters
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own filters" ON marketplace_filters
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own filters" ON marketplace_filters
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own filters" ON marketplace_filters
    FOR DELETE USING (auth.uid()::text = user_id);

-- Functions
-- Function để tạo hoặc cập nhật user preferences
CREATE OR REPLACE FUNCTION upsert_user_preferences(
    p_user_id TEXT,
    p_user_role TEXT DEFAULT 'user',
    p_user_email TEXT DEFAULT NULL,
    p_preferences JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO user_preferences (user_id, user_role, user_email, preferences)
    VALUES (p_user_id, p_user_role, p_user_email, p_preferences)
    ON CONFLICT (user_id) 
    DO UPDATE SET
        user_role = EXCLUDED.user_role,
        user_email = EXCLUDED.user_email,
        preferences = EXCLUDED.preferences,
        updated_at = NOW()
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;

-- Function để lưu draft
CREATE OR REPLACE FUNCTION save_user_draft(
    p_user_id TEXT,
    p_draft_type TEXT,
    p_draft_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO user_drafts (user_id, draft_type, draft_data)
    VALUES (p_user_id, p_draft_type, p_draft_data)
    ON CONFLICT (id) 
    DO UPDATE SET
        draft_data = EXCLUDED.draft_data,
        updated_at = NOW()
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;

-- Function để lấy draft
CREATE OR REPLACE FUNCTION get_user_draft(
    p_user_id TEXT,
    p_draft_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_draft_data JSONB;
BEGIN
    SELECT draft_data INTO v_draft_data
    FROM user_drafts
    WHERE user_id = p_user_id AND draft_type = p_draft_type
    ORDER BY updated_at DESC
    LIMIT 1;
    
    RETURN v_draft_data;
END;
$$;

-- Function để lưu marketplace filter
CREATE OR REPLACE FUNCTION save_marketplace_filter(
    p_user_id TEXT,
    p_filter_type TEXT,
    p_filter_value TEXT,
    p_is_active BOOLEAN DEFAULT TRUE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
BEGIN
    -- Xóa filter cũ cùng loại nếu có
    DELETE FROM marketplace_filters 
    WHERE user_id = p_user_id AND filter_type = p_filter_type;
    
    -- Thêm filter mới
    INSERT INTO marketplace_filters (user_id, filter_type, filter_value, is_active)
    VALUES (p_user_id, p_filter_type, p_filter_value, p_is_active)
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;

-- Insert sample data
INSERT INTO user_preferences (user_id, user_role, user_email, preferences) VALUES
('admin@example.com', 'admin', 'admin@example.com', '{"theme": "dark", "language": "vi"}'),
('user@example.com', 'user', 'user@example.com', '{"theme": "light", "language": "vi"}')
ON CONFLICT (user_id) DO NOTHING;

-- Verify setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as brands_count FROM brands;
SELECT COUNT(*) as consignments_count FROM consignments;
SELECT COUNT(*) as blog_posts_count FROM blog_posts;
SELECT COUNT(*) as user_preferences_count FROM user_preferences;
