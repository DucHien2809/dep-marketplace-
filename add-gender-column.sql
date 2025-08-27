-- Add gender column to existing consignments table
-- Chạy trong Supabase SQL Editor

-- Thêm cột gender vào bảng consignments
ALTER TABLE consignments 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female'));

-- Tạo index cho cột gender để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_consignments_gender ON consignments(gender);

-- Cập nhật các bản ghi hiện có (nếu có) - set gender = null
UPDATE consignments 
SET gender = NULL 
WHERE gender IS NULL;

-- Xác nhận cột đã được thêm
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'consignments' 
AND column_name = 'gender';
