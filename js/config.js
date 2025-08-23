// Supabase Configuration
const SUPABASE_URL = 'https://hvbgnqkwvbdzaxyamfao.supabase.co'; // Thay thế bằng URL Supabase của bạn
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YmducWt3dmJkemF4eWFtZmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTEwODIsImV4cCI6MjA3MTQ4NzA4Mn0.RulX8AIBdwPw9kB97K6zJ0m_8Vg4PNRptDrkMzh2eXY'; // Thay thế bằng Anon Key của bạn

// Khởi tạo Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// App Configuration
const CONFIG = {
    appName: 'Hệ thống Quản lý Bán hàng',
    version: '1.0.0',
    currency: 'VNĐ',
    dateFormat: 'dd/MM/yyyy',
    pagination: {
        itemsPerPage: 10
    },
    toast: {
        duration: 3000 // milliseconds
    },
    gallery: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        maxFiles: 5,
        imageSizes: {
            thumbnail: { width: 300, height: 300 },
            medium: { width: 800, height: 600 },
            large: { width: 1200, height: 900 }
        }
    },
    storage: {
        buckets: {
            gallery: 'gallery-images',
            products: 'product-images',
            avatars: 'avatars'
        }
    }
};

// API Endpoints (nếu cần tích hợp với API khác)
const API_ENDPOINTS = {
    // payment: 'https://api.payment-gateway.com',
    // shipping: 'https://api.shipping-service.com',
    // analytics: 'https://api.analytics-service.com'
};

// Database Tables
const TABLES = {
    USERS: 'users',
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    ORDERS: 'orders',
    ORDER_ITEMS: 'order_items',
    CUSTOMERS: 'customers',
    CONSIGNMENTS: 'consignments',
    BLOG_POSTS: 'blog_posts',
    GALLERY_ITEMS: 'gallery_items'
};

// Product Types
const PRODUCT_TYPES = {
    DEP_COLLECTION: 'dep_collection',  // Sản phẩm chính thức của Đẹp
    MARKETPLACE: 'marketplace'         // Sản phẩm ký gửi
};

// Order Status Options
const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

// Product Status Options
const PRODUCT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OUT_OF_STOCK: 'out_of_stock'
};

// User Roles
const USER_ROLES = {
    ADMIN: 'admin',
    SELLER: 'seller',
    CUSTOMER: 'customer'
};

// Validation Rules
const VALIDATION = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[0-9]{10,11}$/,
    password: {
        minLength: 6,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSpecialChars: false
    },
    product: {
        nameMinLength: 2,
        nameMaxLength: 100,
        descriptionMaxLength: 1000,
        priceMin: 0,
        stockMin: 0
    }
};

// Export để sử dụng trong các file khác
window.CONFIG = CONFIG;
window.API_ENDPOINTS = API_ENDPOINTS;
window.TABLES = TABLES;
window.PRODUCT_TYPES = PRODUCT_TYPES;
window.ORDER_STATUS = ORDER_STATUS;
window.PRODUCT_STATUS = PRODUCT_STATUS;
window.USER_ROLES = USER_ROLES;
window.VALIDATION = VALIDATION;
