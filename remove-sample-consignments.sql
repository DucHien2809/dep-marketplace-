-- Remove sample consignments data
-- Chạy file này trong Supabase SQL Editor để xóa dữ liệu mẫu

-- Xóa các sản phẩm mẫu đã được insert trước đó
DELETE FROM consignments 
WHERE name IN (
    'Áo sơ mi Zara size M',
    'Quần jean H&M size 30', 
    'Váy đầm Mango size S'
);

-- Kiểm tra kết quả
SELECT COUNT(*) as remaining_consignments FROM consignments;
