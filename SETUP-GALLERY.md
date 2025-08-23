# Hướng dẫn Setup Đẹp Collection Gallery

## ✅ Button Upload đã có sẵn!
Tôi đã fix vấn đề button upload không hiển thị. Button upload **đã có sẵn** trong code và sẽ hiển thị khi bạn:

1. **Đăng nhập với tài khoản admin** (`vhoangyen191105@gmail.com`)
2. **Vào trang Đẹp Collection**
3. **Button "Upload ảnh mới" sẽ xuất hiện** ở phần hero section

## 🚀 Setup Database & Storage

### Bước 1: Setup Database Schema
Chạy các script SQL trong Supabase SQL Editor theo thứ tự:

1. **Database Schema chính:** `database-schema.sql` (nếu chưa chạy)
2. **Gallery Schema:** `gallery-schema.sql` (file mới)
3. **Storage Setup:** `setup-storage.sql` (file mới)

### Bước 2: Tạo Admin Account
```sql
-- Chạy trong Supabase SQL Editor
INSERT INTO users (id, email, role, full_name, is_active)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'vhoangyen191105@gmail.com'),
    'vhoangyen191105@gmail.com',
    'admin',
    'Administrator',
    true
) ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

## 🖼️ Tích hợp Storage

**KHÔNG cần Cloudinary!** Tôi đã tích hợp **Supabase Storage** thay vì Cloudinary vì:

✅ **Ưu điểm Supabase Storage:**
- Đã có sẵn Supabase
- Tích hợp dễ dàng
- Miễn phí với quota lớn
- Tự động resize/optimize
- Row Level Security

## 📁 Cấu trúc Files đã thêm/sửa

### Files mới:
- `gallery-schema.sql` - Database schema cho gallery
- `setup-storage.sql` - Setup Supabase Storage buckets  
- `SETUP-GALLERY.md` - File hướng dẫn này

### Files đã cập nhật:
- `js/config.js` - Thêm config cho gallery & storage
- `js/collection-gallery.js` - Hoàn thiện upload functionality
- `js/dep-marketplace.js` - Fix admin button visibility
- `js/auth.js` - Cải thiện admin UI management

## 🎯 Chức năng đã hoàn thành

### ✅ Upload Images
- **Drag & drop** hoặc click để chọn ảnh
- **Multiple images** support (tối đa 5 ảnh)
- **File validation** (JPG, PNG, WEBP, tối đa 5MB)
- **Preview** ảnh trước khi upload
- **Upload lên Supabase Storage**

### ✅ Gallery Management  
- **Tạo tác phẩm mới** với title, story, tags
- **Đánh dấu featured** items
- **Auto-generate slug** cho SEO
- **View counter** tracking
- **Admin controls** (edit/delete buttons)

### ✅ Database Integration
- **Full CRUD operations** 
- **Row Level Security** policies
- **Admin permissions** checking
- **Real-time data** loading

## 🧪 Test Upload Functionality

1. **Đăng nhập admin:** `vhoangyen191105@gmail.com`
2. **Vào Đẹp Collection**
3. **Click "Upload ảnh mới"**
4. **Drag ảnh vào hoặc click chọn**
5. **Điền thông tin:** title, story, tags
6. **Click "Lưu tác phẩm"**

## 🔧 Troubleshooting

### Nếu button không hiển thị:
1. Kiểm tra đã đăng nhập với admin account
2. Check browser console để xem errors
3. Đảm bảo đã chạy database schema

### Nếu upload lỗi:
1. Kiểm tra đã setup Supabase Storage buckets  
2. Check file size < 5MB và format đúng
3. Xem Network tab trong DevTools

## 🎨 UI/UX Features

- **Beautiful upload modal** với drag & drop zone
- **Image previews** với remove buttons  
- **Progress loading** indicator
- **Success/error toasts** notifications
- **Responsive design** cho mobile
- **Admin-only controls** với proper permissions

---

**Kết luận:** Button upload đã có đầy đủ và hoạt động tốt. Không cần Cloudinary - Supabase Storage đã đủ mạnh và tích hợp sẵn!
