# 🚀 Migration từ localStorage sang Supabase Database

## 📋 Tổng quan
Hệ thống đã được chuyển hoàn toàn từ `localStorage` sang Supabase database để:
- ✅ Dữ liệu được lưu trữ an toàn và bền vững
- ✅ Nhiều người dùng có thể truy cập cùng lúc
- ✅ Dữ liệu được đồng bộ giữa các thiết bị
- ✅ Bảo mật tốt hơn với Row Level Security (RLS)

## 🗄️ Các bảng database mới

### 1. `user_drafts` - Lưu trữ nháp
- **consign**: Nháp sản phẩm ký gửi
- **blog**: Nháp bài viết blog

### 2. `user_preferences` - Tùy chọn người dùng
- **user_role**: Vai trò (user, admin, moderator)
- **preferences**: Các tùy chọn khác (theme, language)

### 3. `marketplace_filters` - Bộ lọc marketplace
- **filter_type**: Loại filter (brand, category, price_range, condition)
- **filter_value**: Giá trị filter

## 🔧 Cài đặt

### Bước 1: Chạy script database
```sql
-- Chạy file setup-database-complete.sql trong Supabase SQL Editor
```

### Bước 2: Kiểm tra kết quả
Sau khi chạy xong, bạn sẽ thấy:
- ✅ 4 bảng mới được tạo
- ✅ RLS policies được thiết lập
- ✅ Functions được tạo
- ✅ Sample data được insert

## 🔄 Fallback System
Hệ thống vẫn giữ `localStorage` làm fallback:
- Nếu database không hoạt động → tự động dùng localStorage
- Nếu có lỗi kết nối → tự động dùng localStorage
- Đảm bảo app không bị crash

## 📱 Test chức năng

### Test 1: Lưu nháp ký gửi
1. Vào trang **Ký gửi**
2. Điền form
3. Click **Lưu nháp**
4. Kiểm tra console: "✅ Đã lưu nháp vào database"

### Test 2: Lưu nháp blog
1. Vào trang **Blog**
2. Điền form bài viết
3. Click **Lưu nháp**
4. Kiểm tra console: "✅ Đã lưu nháp vào database"

### Test 3: Thay đổi role
1. Đăng nhập với tài khoản admin
2. Thay đổi role user
3. Kiểm tra console: "✅ Đã cập nhật role trong database"

## 🚨 Troubleshooting

### Lỗi: "Không thể lưu vào database"
- **Nguyên nhân**: Database chưa được setup hoặc RLS policy chưa đúng
- **Giải pháp**: Chạy lại `setup-database-complete.sql`

### Lỗi: "window.supabase.from is not a function"
- **Nguyên nhân**: Supabase client chưa được khởi tạo đúng
- **Giải pháp**: Kiểm tra `js/supabase-config.js`

### Dữ liệu không hiển thị
- **Nguyên nhân**: RLS policy quá nghiêm ngặt
- **Giải pháp**: Kiểm tra RLS policies trong database

## 📊 Monitoring
Kiểm tra console để theo dõi:
- ✅ Thành công: "Đã lưu vào database"
- ⚠️ Fallback: "Đã lưu vào localStorage"
- ❌ Lỗi: "Không thể lưu vào database"

## 🔐 Security
- **Row Level Security (RLS)** được bật cho tất cả bảng
- **Users chỉ có thể truy cập dữ liệu của mình**
- **Admins có thể truy cập tất cả dữ liệu**
- **Functions được đánh dấu SECURITY DEFINER**

## 📈 Performance
- **Indexes** được tạo cho các trường thường query
- **JSONB** được sử dụng cho dữ liệu linh hoạt
- **Batch operations** cho việc insert/update nhiều records

## 🎯 Lợi ích sau migration
1. **Dữ liệu bền vững**: Không bị mất khi xóa cache
2. **Đồng bộ đa thiết bị**: Dữ liệu giống nhau trên mọi nơi
3. **Bảo mật cao**: RLS policies bảo vệ dữ liệu
4. **Scalability**: Có thể mở rộng cho nhiều users
5. **Backup**: Dữ liệu được backup tự động bởi Supabase
