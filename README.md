# Đẹp - Marketplace Thời Trang Bền Vững

## Mô tả

**Đẹp** là một marketplace thời trang bền vững được xây dựng hoàn toàn bằng HTML, CSS, và JavaScript thuần túy, sử dụng Supabase làm backend. Platform kết hợp 2 phần chính:

1. **Đẹp Collection**: Sản phẩm tái chế độc bản chính thức 
2. **Marketplace**: Nền tảng ký gửi thời trang second-hand

Ứng dụng có thể deploy dễ dàng lên Vercel hoặc bất kỳ hosting static nào.

## Tính năng

### 🏠 Trang chủ với Hero Banner
- Slider giới thiệu Đẹp Collection và Marketplace  
- Danh mục nổi bật với navigation mượt mà
- USP section: ♻️ Giảm rác thải | 💳 Giá minh bạch | 🌱 Độc bản tái chế
- Sản phẩm nổi bật từ cả 2 collections

### 🔐 Xác thực người dùng
- Đăng ký/Đăng nhập với Supabase Auth
- Xác thực email
- Quản lý phiên đăng nhập

### 👗 Đẹp Collection (Sản phẩm chính thức)
- Sản phẩm tái chế độc bản được thiết kế bởi team Đẹp
- Ảnh studio chuyên nghiệp, tone xanh-trắng nhất quán
- Bộ lọc: loại, size, giá, phong cách (vintage, basic, độc bản)
- Thông tin nguồn gốc tái chế chi tiết
- Mix & match suggestions (upsell)

### 🛒 Marketplace (Ký gửi)
- Layout sạch giống H&M với nhiều khoảng trắng
- Ảnh do người bán upload với hướng dẫn chụp chuẩn
- Bộ lọc sidebar: thương hiệu, giá, size, tình trạng
- Tag màu: "Mới ký gửi", "Markdown 20%", "Vintage"
- Thông tin người bán với rating

### 📤 Ký gửi ngay (Form đăng sản phẩm)
- Multi-step form với 4 bước rõ ràng
- Upload tối thiểu 3 ảnh, tối đa 10 ảnh
- Hướng dẫn chụp ảnh chuẩn để tăng tỷ lệ bán
- AI gợi ý giá dựa trên thông tin sản phẩm
- Hệ thống duyệt trước khi public

### 👤 Dashboard người dùng
- **Người mua**: Quản lý đơn hàng, lịch sử, ví voucher
- **Người bán**: Quản lý sản phẩm ký gửi, theo dõi views/sales, số tiền chờ thanh toán
- **Cửa hàng Đẹp**: Quản lý Đẹp Collection, kho & đơn

### 📝 Blog Lifestyle
- Cách phối đồ bền vững
- Chăm sóc quần áo  
- Câu chuyện phía sau mỗi sản phẩm Đẹp
- Nội dung nhẹ nhàng, hình ảnh đẹp (SEO boost)

### 🆘 Hỗ trợ & FAQ
- Chính sách mua bán, vận chuyển, đổi trả
- Hướng dẫn ký gửi chi tiết
- Multi-channel: Hotline, Messenger/Zalo, Email

## Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **UI Icons**: Font Awesome 6
- **Deployment**: Vercel
- **Database**: PostgreSQL (thông qua Supabase)

## Cài đặt và chạy

### 1. Clone dự án
```bash
git clone <repository-url>
cd quan-ly-ban-hang
```

### 2. Cấu hình Supabase

1. Tạo tài khoản tại [supabase.com](https://supabase.com)
2. Tạo project mới
3. Lấy URL và Anon Key từ Settings > API
4. Cập nhật file `js/config.js`:

```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. Tạo database schema

Chạy các câu lệnh SQL sau trong Supabase SQL Editor:

```sql
-- Tạo bảng users
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'seller',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng products
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng customers
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng orders
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo bảng order_items
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);
```

### 4. Cấu hình Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies cho users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Policies cho products
CREATE POLICY "Users can view own products" ON products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON products FOR DELETE USING (auth.uid() = user_id);

-- Tương tự cho các bảng khác...
```

### 5. Chạy local

```bash
npm install
npm run dev
```

Truy cập http://localhost:3000

## Deploy lên Vercel

### 1. Cài đặt Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy
```bash
vercel
```

### 3. Cấu hình domain (tùy chọn)
```bash
vercel --prod
```

## Cấu trúc thư mục

```
quan-ly-ban-hang/
├── index.html          # Trang chính
├── styles/
│   └── main.css        # CSS chính
├── js/
│   ├── config.js       # Cấu hình Supabase
│   ├── auth.js         # Xác thực
│   ├── app.js          # Logic ứng dụng chính
│   ├── products.js     # Quản lý sản phẩm
│   ├── orders.js       # Quản lý đơn hàng
│   ├── customers.js    # Quản lý khách hàng
│   └── main.js         # Khởi tạo ứng dụng
├── vercel.json         # Cấu hình Vercel
├── package.json        # Thông tin dự án
└── README.md          # Tài liệu này
```

## Tính năng nâng cao

### Responsive Design
- Thiết kế responsive cho mobile, tablet, desktop
- Navigation mobile-friendly
- Tables có horizontal scroll trên mobile

### Performance
- CSS và JS được cache
- Lazy loading cho hình ảnh
- Debounced search
- Optimized queries

### Security
- Row Level Security (RLS)
- Input validation
- XSS protection headers
- HTTPS only

### UX/UI
- Modern design với gradients
- Loading states
- Toast notifications
- Modal dialogs
- Keyboard shortcuts

## Keyboard Shortcuts

- `Ctrl/Cmd + K`: Focus vào ô tìm kiếm
- `Escape`: Đóng modal
- `F5`: Refresh trang

## API Reference

### Products API
```javascript
// Lấy danh sách sản phẩm
const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

// Thêm sản phẩm mới
const { data, error } = await supabase
    .from('products')
    .insert([productData]);
```

### Orders API
```javascript
// Lấy đơn hàng với thông tin khách hàng và sản phẩm
const { data, error } = await supabase
    .from('orders')
    .select(`
        *,
        customers (name, email),
        order_items (
            quantity,
            price,
            products (name)
        )
    `);
```

## Troubleshooting

### Lỗi kết nối Supabase
- Kiểm tra URL và API Key trong `js/config.js`
- Đảm bảo RLS policies được cấu hình đúng

### Lỗi CORS
- Thêm domain của bạn vào Supabase Settings > Authentication > Site URL

### Lỗi deployment
- Kiểm tra `vercel.json` configuration
- Đảm bảo tất cả files được commit

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - xem file LICENSE để biết chi tiết.

## Support

Nếu bạn gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.

---

**Phát triển bởi**: [Tên của bạn]
**Version**: 1.0.0
**Last Updated**: $(date)
