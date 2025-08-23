-- Script để tạo tài khoản Admin
-- Chạy script này trong Supabase SQL Editor sau khi đã tạo database schema

-- 1. Tạo user admin trong auth.users (thông qua Supabase Auth)
-- Lưu ý: Bạn cần đăng ký tài khoản admin@dep.com qua UI trước, 
-- sau đó chạy script này để cập nhật role

-- 2. Tìm user admin và cập nhật role
UPDATE users 
SET 
    role = 'admin',
    full_name = 'Administrator',
    updated_at = NOW()
WHERE email = 'admin@dep.com';

-- 3. Nếu chưa có user admin trong bảng users, thêm vào
-- (Thay thế UUID bằng ID thực của user admin sau khi đăng ký)
-- INSERT INTO users (id, email, role, full_name, is_active, created_at, updated_at)
-- VALUES (
--     'USER_ID_FROM_AUTH_USERS', -- Thay bằng UUID thực
--     'admin@dep.com',
--     'admin',
--     'Administrator',
--     true,
--     NOW(),
--     NOW()
-- );

-- 4. Kiểm tra kết quả
SELECT id, email, role, full_name, created_at 
FROM users 
WHERE email = 'admin@dep.com';

-- 5. Tạo một số categories mẫu cho admin quản lý
INSERT INTO categories (name, description, is_active) VALUES
('Áo', 'Áo thun, áo sơ mi, áo khoác', true),
('Quần', 'Quần jean, quần âu, quần short', true),
('Váy', 'Váy dài, váy ngắn, váy công sở', true),
('Phụ kiện', 'Túi xách, giày dép, trang sức', true),
('Áo khoác', 'Áo khoác mùa đông, áo vest', true)
ON CONFLICT (name) DO NOTHING;

-- 6. Thêm một số sản phẩm mẫu cho demo (optional)
-- Lưu ý: Cần có user_id của admin để chạy
-- INSERT INTO products (user_id, name, description, price, stock, category, status, is_featured)
-- SELECT 
--     u.id,
--     'Áo thun vintage',
--     'Áo thun cotton 100% phong cách vintage',
--     250000,
--     10,
--     'Áo',
--     'active',
--     true
-- FROM users u WHERE u.email = 'admin@dep.com';
