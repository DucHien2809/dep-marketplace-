-- Supabase Storage Setup for Đẹp Gallery
-- Chạy trong Supabase SQL Editor

-- 1. Tạo storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
('gallery-images', 'gallery-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Set up Row Level Security policies for storage

-- Gallery images: Public read, admin write
CREATE POLICY "Gallery images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery-images');

CREATE POLICY "Admins can upload gallery images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'gallery-images' 
    AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can update gallery images" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'gallery-images' 
    AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

CREATE POLICY "Admins can delete gallery images" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'gallery-images' 
    AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Product images: Public read, authenticated write (sellers can upload products)
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own product images" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'product-images' 
    AND (owner = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ))
);

CREATE POLICY "Users can delete own product images" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'product-images' 
    AND (owner = auth.uid() OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    ))
);

-- Avatar images: Public read, own user write
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own avatar" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'avatars' 
    AND owner = auth.uid()
);

CREATE POLICY "Users can delete own avatar" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'avatars' 
    AND owner = auth.uid()
);

-- 3. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;
