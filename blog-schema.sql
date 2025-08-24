-- Blog Posts Schema for Sales Management System
-- Chạy các câu lệnh này trong Supabase SQL Editor

-- Tạo bảng blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('styling', 'sustainability', 'care', 'stories')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    image_url TEXT,
    tags JSONB DEFAULT '[]', -- Array of tags
    author TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    meta_title TEXT,
    meta_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo index cho performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);

-- Tạo RLS (Row Level Security) policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Mọi người có thể đọc bài viết đã publish
CREATE POLICY "Anyone can read published posts" ON blog_posts
    FOR SELECT USING (status = 'published');

-- Policy: User có thể đọc bài viết của mình (draft hoặc published)
CREATE POLICY "Users can read their own posts" ON blog_posts
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: User có thể tạo bài viết mới
CREATE POLICY "Users can create posts" ON blog_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: User có thể update bài viết của mình
CREATE POLICY "Users can update their own posts" ON blog_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: User có thể delete bài viết của mình
CREATE POLICY "Users can delete their own posts" ON blog_posts
    FOR DELETE USING (auth.uid() = user_id);

-- Policy: Admin có thể làm mọi thứ
CREATE POLICY "Admins have full access" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Tạo function để update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger để tự động update updated_at
CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO blog_posts (user_id, title, excerpt, content, category, status, author, published_at, tags) VALUES
(
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    'Chào mừng đến với Blog Đẹp',
    'Blog đầu tiên chào mừng cộng đồng thời trang bền vững',
    'Nội dung chi tiết của blog đầu tiên...',
    'stories',
    'published',
    'Đẹp Team',
    NOW(),
    '["chào mừng", "cộng đồng"]'
) ON CONFLICT DO NOTHING;
