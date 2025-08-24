# 🗄️ Hướng dẫn Setup Database cho Blog

## 📋 Yêu cầu

- Tài khoản Supabase (miễn phí)
- Project Supabase đã được tạo

## 🚀 Bước 1: Tạo Supabase Project

1. Truy cập [supabase.com](https://supabase.com)
2. Đăng ký/Đăng nhập tài khoản
3. Click "New Project"
4. Điền thông tin project:
   - **Name**: `dep-blog-system` (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh
   - **Region**: Chọn gần Việt Nam (Singapore)
5. Click "Create new project"

## 🗃️ Bước 2: Tạo Database Schema

1. Trong Supabase Dashboard, vào **SQL Editor**
2. Copy toàn bộ nội dung từ file `blog-schema.sql`
3. Paste vào SQL Editor và click **Run**
4. Kiểm tra bảng `blog_posts` đã được tạo trong **Table Editor**

## 🔑 Bước 3: Lấy API Keys

1. Vào **Settings** → **API**
2. Copy các thông tin sau:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## ⚙️ Bước 4: Cập nhật Config

1. Mở file `js/supabase-config.js`
2. Thay thế các giá trị:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co', // Thay bằng Project URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Thay bằng anon public key
    serviceRoleKey: 'your-service-role-key' // Không cần thiết cho frontend
};
```

## 🧪 Bước 5: Test Kết nối

1. Refresh trang web
2. Mở **Developer Console** (F12)
3. Kiểm tra log:
   - ✅ `Kết nối Supabase thành công!` = Database hoạt động
   - ⚠️ `Vui lòng cập nhật SUPABASE_CONFIG` = Cần cập nhật config

## 🔒 Bước 6: Setup Authentication (Tùy chọn)

Để sử dụng đầy đủ tính năng, bạn có thể setup Supabase Auth:

1. Vào **Authentication** → **Settings**
2. Bật **Enable email confirmations**
3. Cấu hình **Site URL** và **Redirect URLs**

## 📊 Bước 7: Kiểm tra Database

1. Vào **Table Editor** → **blog_posts**
2. Bạn sẽ thấy:
   - Bảng trống (nếu chưa có bài viết)
   - Hoặc 1 bài viết mẫu (nếu đã chạy schema)

## 🎯 Tính năng sau khi Setup

### ✅ **Cho Admin:**
- Tạo bài viết với status "published" ngay lập tức
- Quản lý tất cả bài viết (draft, published, archived)
- Có thể edit/delete bất kỳ bài viết nào

### ✅ **Cho User:**
- Viết blog và submit
- Bài viết tự động có status "draft"
- Chờ admin duyệt để publish

### ✅ **Lưu trữ:**
- Dữ liệu được lưu trong PostgreSQL database
- Đồng bộ giữa các thiết bị/trình duyệt
- Backup tự động của Supabase
- Row Level Security (RLS) bảo vệ dữ liệu

## 🚨 Troubleshooting

### **Lỗi "Supabase chưa được khởi tạo"**
- Kiểm tra script tag đã được include
- Kiểm tra config đã được cập nhật đúng

### **Lỗi "Lỗi kết nối database"**
- Kiểm tra Project URL và API Key
- Kiểm tra bảng `blog_posts` đã được tạo
- Kiểm tra RLS policies đã được setup

### **Fallback to localStorage**
- Nếu database không hoạt động, hệ thống sẽ tự động dùng localStorage
- Dữ liệu vẫn được lưu nhưng chỉ local

## 🔄 Migration từ localStorage

Nếu bạn đã có dữ liệu trong localStorage:

1. Export dữ liệu từ localStorage
2. Chuyển đổi format phù hợp với database schema
3. Import vào bảng `blog_posts` qua SQL hoặc Supabase Dashboard

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console log trong Developer Tools
2. Kiểm tra Network tab để xem API calls
3. Kiểm tra Supabase Dashboard → Logs
4. Tạo issue trên GitHub repository

---

**🎉 Chúc mừng! Blog system của bạn đã được kết nối với database thật!**
