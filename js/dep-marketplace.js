// Đẹp Marketplace Logic
class DepMarketplace {
    constructor() {
        this.swiper = null;
        this.currentCategory = 'all';
        this.currentSort = 'newest';
        this.currentFilters = {
            priceMin: 0,
            priceMax: 10000000,
            size: 'all',
            condition: 'all',
            brand: 'all'
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.initHeroSlider();
    }

    bindEvents() {
        // Navigation events
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-page]')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                window.app.navigateTo(page);
            }

            if (e.target.matches('[data-category]')) {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                this.filterByCategory(category);
            }
        });

        // Cart events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart') || e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const productId = e.target.getAttribute('data-product-id') || 
                                e.target.closest('.add-to-cart').getAttribute('data-product-id');
                this.addToCart(productId);
            }
        });

        // Search events
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.showSearchModal();
            });
        }
    }

    initHeroSlider() {
        // Initialize Swiper for hero banner
        if (typeof Swiper !== 'undefined') {
            this.swiper = new Swiper('.hero-slider', {
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                effect: 'fade',
                fadeEffect: {
                    crossFade: true
                }
            });
        }
    }

    // Page Creation Methods
    createPage(page) {
        const mainContent = document.querySelector('.main-content');
        let pageHTML = '';

        switch (page) {
            case 'dep-collection':
                pageHTML = this.createDepCollectionPage();
                break;
            case 'marketplace':
                pageHTML = this.createMarketplacePage();
                break;
            case 'consign':
                pageHTML = this.createConsignmentPage();
                break;
            case 'blog':
                pageHTML = this.createBlogPage();
                break;
            case 'support':
                pageHTML = this.createSupportPage();
                break;
            case 'profile':
                pageHTML = this.createProfilePage();
                break;
            case 'consignment-dashboard':
                pageHTML = this.createConsignmentDashboardPage();
                break;
            default:
                pageHTML = `<div id="${page}-page" class="page"><div class="container"><h1>Trang đang phát triển</h1></div></div>`;
        }

        mainContent.insertAdjacentHTML('beforeend', pageHTML);
    }

    createDepCollectionPage() {
        return `
            <div id="dep-collection-page" class="page">
                <div class="page-hero">
                    <div class="container">
                        <div class="page-hero-content">
                            <h1>Đẹp Collection</h1>
                            <p class="page-subtitle">Đẹp không chỉ là phong cách – Đẹp còn là sự tái sinh của thời trang</p>
                            <p class="page-description">
                                Mỗi sản phẩm trong bộ sưu tập Đẹp đều được tái tạo từ những món đồ cũ với tình yêu và sự sáng tạo. 
                                Độc bản, bền vững và mang đậm dấu ấn riêng.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="collection-content">
                    <div class="container">
                        <!-- Filters -->
                        <div class="collection-filters">
                            <div class="filter-group">
                                <label>Danh mục:</label>
                                <select id="collection-category">
                                    <option value="all">Tất cả</option>
                                    <option value="tops">Áo</option>
                                    <option value="bottoms">Quần</option>
                                    <option value="dresses">Váy</option>
                                    <option value="accessories">Phụ kiện</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label>Sắp xếp:</label>
                                <select id="collection-sort">
                                    <option value="newest">Mới nhất</option>
                                    <option value="price-low">Giá thấp đến cao</option>
                                    <option value="price-high">Giá cao đến thấp</option>
                                    <option value="popular">Phổ biến</option>
                                </select>
                            </div>

                            <div class="filter-group">
                                <label>Kích thước:</label>
                                <select id="collection-size">
                                    <option value="all">Tất cả</option>
                                    <option value="XS">XS</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                </select>
                            </div>
                        </div>

                        <!-- Products Grid -->
                        <div class="products-grid" id="collection-products">
                            <!-- Products will be loaded here -->
                        </div>

                        <!-- Load More -->
                        <div class="load-more-section">
                            <button class="btn btn-secondary" id="load-more-collection">
                                Xem thêm sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createMarketplacePage() {
        return `
            <div id="marketplace-page" class="page">
                <div class="page-hero">
                    <div class="container">
                        <div class="page-hero-content">
                            <h1>Marketplace</h1>
                            <p class="page-subtitle">Hàng ký gửi mới về – Minh bạch, giá hợp lý</p>
                            <p class="page-description">
                                Khám phá những món đồ thời trang chất lượng cao từ cộng đồng, 
                                được kiểm duyệt kỹ lưỡng với giá cả hợp lý.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="marketplace-content">
                    <div class="container">
                        <div class="marketplace-layout">
                            <!-- Sidebar Filters -->
                            <div class="marketplace-sidebar">
                                <div class="filter-section">
                                    <h3>Danh mục</h3>
                                    <div class="filter-options">
                                        <label><input type="checkbox" value="tops"> Áo</label>
                                        <label><input type="checkbox" value="bottoms"> Quần</label>
                                        <label><input type="checkbox" value="dresses"> Váy</label>
                                        <label><input type="checkbox" value="accessories"> Phụ kiện</label>
                                    </div>
                                </div>

                                <div class="filter-section">
                                    <h3>Thương hiệu</h3>
                                    <div class="filter-options">
                                        <label><input type="checkbox" value="zara"> Zara</label>
                                        <label><input type="checkbox" value="hm"> H&M</label>
                                        <label><input type="checkbox" value="uniqlo"> Uniqlo</label>
                                        <label><input type="checkbox" value="other"> Khác</label>
                                    </div>
                                </div>

                                <div class="filter-section">
                                    <h3>Kích thước</h3>
                                    <div class="size-filters">
                                        <button class="size-btn" data-size="XS">XS</button>
                                        <button class="size-btn" data-size="S">S</button>
                                        <button class="size-btn" data-size="M">M</button>
                                        <button class="size-btn" data-size="L">L</button>
                                        <button class="size-btn" data-size="XL">XL</button>
                                    </div>
                                </div>

                                <div class="filter-section">
                                    <h3>Giá</h3>
                                    <div class="price-range">
                                        <input type="range" id="price-min" min="0" max="5000000" value="0">
                                        <input type="range" id="price-max" min="0" max="5000000" value="5000000">
                                        <div class="price-labels">
                                            <span id="price-min-label">0đ</span>
                                            <span id="price-max-label">5,000,000đ</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="filter-section">
                                    <h3>Tình trạng</h3>
                                    <div class="filter-options">
                                        <label><input type="checkbox" value="new"> 90% mới</label>
                                        <label><input type="checkbox" value="good"> Tốt</label>
                                        <label><input type="checkbox" value="vintage"> Vintage</label>
                                    </div>
                                </div>
                            </div>

                            <!-- Main Content -->
                            <div class="marketplace-main">
                                <!-- Sort Bar -->
                                <div class="sort-bar">
                                    <div class="results-count">
                                        <span id="products-count">0 sản phẩm</span>
                                    </div>
                                    <div class="sort-options">
                                        <select id="marketplace-sort">
                                            <option value="newest">Mới nhất</option>
                                            <option value="price-low">Giá thấp đến cao</option>
                                            <option value="price-high">Giá cao đến thấp</option>
                                            <option value="popular">Phổ biến</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Products Grid -->
                                <div class="marketplace-products" id="marketplace-products">
                                    <!-- Products will be loaded here -->
                                </div>

                                <!-- Pagination -->
                                <div class="pagination" id="marketplace-pagination">
                                    <!-- Pagination will be generated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createConsignmentPage() {
        return `
            <div id="consign-page" class="page">
                <div class="page-hero">
                    <div class="container">
                        <div class="page-hero-content">
                            <h1>Ký gửi ngay</h1>
                            <p class="page-subtitle">Biến tủ đồ cũ thành thu nhập mới</p>
                            <p class="page-description">
                                Đăng bán những món đồ không còn sử dụng của bạn. 
                                Quy trình đơn giản, minh bạch và an toàn.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="consignment-content">
                    <div class="container">
                        <!-- Steps -->
                        <div class="consignment-steps">
                            <div class="step active" data-step="1">
                                <div class="step-number">1</div>
                                <div class="step-title">Thông tin sản phẩm</div>
                            </div>
                            <div class="step" data-step="2">
                                <div class="step-number">2</div>
                                <div class="step-title">Hình ảnh</div>
                            </div>
                            <div class="step" data-step="3">
                                <div class="step-number">3</div>
                                <div class="step-title">Giá và điều kiện</div>
                            </div>
                            <div class="step" data-step="4">
                                <div class="step-number">4</div>
                                <div class="step-title">Xác nhận</div>
                            </div>
                        </div>

                        <!-- Form -->
                        <form id="consignment-form" class="consignment-form">
                            <!-- Step 1: Product Info -->
                            <div class="form-step active" data-step="1">
                                <h3>Thông tin sản phẩm</h3>
                                
                                <div class="form-group">
                                    <label for="product-title">Tiêu đề sản phẩm *</label>
                                    <input type="text" id="product-title" placeholder="VD: Áo sơ mi Zara size M màu trắng" required>
                                    <small>Mô tả ngắn gọn và chính xác về sản phẩm</small>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="product-category">Danh mục *</label>
                                        <select id="product-category" required>
                                            <option value="">Chọn danh mục</option>
                                            <option value="tops">Áo</option>
                                            <option value="bottoms">Quần</option>
                                            <option value="dresses">Váy</option>
                                            <option value="accessories">Phụ kiện</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="product-brand">Thương hiệu</label>
                                        <input type="text" id="product-brand" placeholder="VD: Zara, H&M, Uniqlo...">
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="product-size">Kích thước *</label>
                                        <select id="product-size" required>
                                            <option value="">Chọn size</option>
                                            <option value="XS">XS</option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="product-condition">Tình trạng *</label>
                                        <select id="product-condition" required>
                                            <option value="">Chọn tình trạng</option>
                                            <option value="new">90% mới</option>
                                            <option value="good">Tốt</option>
                                            <option value="fair">Khá</option>
                                            <option value="vintage">Vintage</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="product-description">Mô tả chi tiết *</label>
                                    <textarea id="product-description" rows="5" placeholder="Mô tả chi tiết về sản phẩm: chất liệu, màu sắc, tình trạng, lý do bán..." required></textarea>
                                    <small>Càng chi tiết càng dễ bán</small>
                                </div>
                            </div>

                            <!-- Step 2: Images -->
                            <div class="form-step" data-step="2">
                                <h3>Hình ảnh sản phẩm</h3>
                                <p class="step-description">Tối thiểu 3 ảnh, tối đa 10 ảnh. Ảnh đẹp sẽ giúp sản phẩm bán nhanh hơn.</p>
                                
                                <div class="image-upload-area">
                                    <div class="upload-tips">
                                        <h4>💡 Mẹo chụp ảnh đẹp:</h4>
                                        <ul>
                                            <li>Chụp trên nền sáng, tránh bóng đen</li>
                                            <li>Chụp cả mặt trước, mặt sau và chi tiết</li>
                                            <li>Nếu có khuyết điểm, chụp rõ để minh bạch</li>
                                            <li>Có thể chụp ảnh mặc thực tế</li>
                                        </ul>
                                    </div>
                                    
                                    <div class="image-upload-grid" id="image-upload-grid">
                                        <div class="upload-slot">
                                            <input type="file" id="image-1" accept="image/*">
                                            <label for="image-1">
                                                <i class="fas fa-plus"></i>
                                                <span>Ảnh chính</span>
                                            </label>
                                        </div>
                                        <!-- More upload slots will be generated -->
                                    </div>
                                </div>
                            </div>

                            <!-- Step 3: Pricing -->
                            <div class="form-step" data-step="3">
                                <h3>Giá và điều kiện bán</h3>
                                
                                <div class="form-group">
                                    <label for="product-price">Giá mong muốn (VNĐ) *</label>
                                    <input type="number" id="product-price" placeholder="500000" required>
                                    <div class="price-suggestion" id="price-suggestion">
                                        <!-- AI price suggestion will appear here -->
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Phương thức giao hàng:</label>
                                    <div class="checkbox-group">
                                        <label><input type="checkbox" value="cod"> Ship COD</label>
                                        <label><input type="checkbox" value="prepaid"> Thanh toán trước</label>
                                        <label><input type="checkbox" value="pickup"> Gặp mặt trực tiếp</label>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="seller-location">Khu vực của bạn</label>
                                    <select id="seller-location">
                                        <option value="">Chọn khu vực</option>
                                        <option value="hanoi">Hà Nội</option>
                                        <option value="hcm">TP. Hồ Chí Minh</option>
                                        <option value="danang">Đà Nẵng</option>
                                        <option value="other">Tỉnh thành khác</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Step 4: Confirmation -->
                            <div class="form-step" data-step="4">
                                <h3>Xác nhận thông tin</h3>
                                <div class="product-preview" id="product-preview">
                                    <!-- Product preview will be generated here -->
                                </div>
                                
                                <div class="terms-agreement">
                                    <label>
                                        <input type="checkbox" id="agree-terms" required>
                                        Tôi đồng ý với <a href="#" data-page="support">điều khoản ký gửi</a> của Đẹp
                                    </label>
                                </div>
                            </div>

                            <!-- Navigation Buttons -->
                            <div class="form-navigation">
                                <button type="button" class="btn btn-secondary" id="prev-step" style="display: none;">
                                    <i class="fas fa-arrow-left"></i>
                                    Quay lại
                                </button>
                                <button type="button" class="btn btn-primary" id="next-step">
                                    Tiếp theo
                                    <i class="fas fa-arrow-right"></i>
                                </button>
                                <button type="submit" class="btn btn-primary" id="submit-consignment" style="display: none;">
                                    <i class="fas fa-check"></i>
                                    Đăng sản phẩm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    createBlogPage() {
        return `
            <div id="blog-page" class="page">
                <div class="page-hero">
                    <div class="container">
                        <div class="page-hero-content">
                            <h1>Blog</h1>
                            <p class="page-subtitle">Cảm hứng thời trang bền vững</p>
                            <p class="page-description">
                                Khám phá những câu chuyện, mẹo phối đồ và xu hướng thời trang bền vững
                            </p>
                        </div>
                    </div>
                </div>

                <div class="blog-content">
                    <div class="container">
                        <div class="blog-categories">
                            <a href="#" class="category-tag active" data-category="all">Tất cả</a>
                            <a href="#" class="category-tag" data-category="styling">Phối đồ</a>
                            <a href="#" class="category-tag" data-category="sustainability">Bền vững</a>
                            <a href="#" class="category-tag" data-category="care">Chăm sóc</a>
                            <a href="#" class="category-tag" data-category="stories">Câu chuyện</a>
                        </div>

                        <div class="blog-grid" id="blog-posts">
                            <!-- Blog posts will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createSupportPage() {
        return `
            <div id="support-page" class="page">
                <div class="page-hero">
                    <div class="container">
                        <div class="page-hero-content">
                            <h1>Hỗ trợ</h1>
                            <p class="page-subtitle">Chúng tôi sẵn sàng giúp đỡ bạn</p>
                        </div>
                    </div>
                </div>

                <div class="support-content">
                    <div class="container">
                        <div class="support-layout">
                            <div class="support-sidebar">
                                <div class="contact-methods">
                                    <h3>Liên hệ trực tiếp</h3>
                                    <div class="contact-item">
                                        <i class="fas fa-phone"></i>
                                        <div>
                                            <strong>Hotline</strong>
                                            <p>1900 1234</p>
                                        </div>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fab fa-facebook-messenger"></i>
                                        <div>
                                            <strong>Facebook Messenger</strong>
                                            <p>Chat ngay</p>
                                        </div>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fas fa-envelope"></i>
                                        <div>
                                            <strong>Email</strong>
                                            <p>support@dep.vn</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="support-main">
                                <div class="faq-section">
                                    <h2>Câu hỏi thường gặp</h2>
                                    
                                    <div class="faq-category">
                                        <h3>Mua hàng</h3>
                                        <div class="faq-item">
                                            <div class="faq-question">Làm thế nào để đặt hàng?</div>
                                            <div class="faq-answer">Bạn có thể duyệt sản phẩm, thêm vào giỏ hàng và thanh toán an toàn qua hệ thống của chúng tôi.</div>
                                        </div>
                                        <!-- More FAQ items -->
                                    </div>

                                    <div class="faq-category">
                                        <h3>Ký gửi</h3>
                                        <div class="faq-item">
                                            <div class="faq-question">Điều kiện ký gửi sản phẩm là gì?</div>
                                            <div class="faq-answer">Sản phẩm phải còn tình trạng tốt, có ảnh chụp rõ ràng và mô tả chi tiết.</div>
                                        </div>
                                        <!-- More FAQ items -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Load Page Data Methods
    loadHomePage() {
        this.loadFeaturedProducts();
    }

    async loadFeaturedProducts() {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('is_featured', true)
                .eq('status', 'active')
                .limit(8);

            if (error) throw error;

            this.renderFeaturedProducts(data || []);
        } catch (error) {
            console.error('Error loading featured products:', error);
        }
    }

    renderFeaturedProducts(products) {
        const grid = document.getElementById('featured-products-grid');
        if (!grid) return;

        grid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image_url || 'https://via.placeholder.com/300x400'}" alt="${product.name}">
                    <div class="product-overlay">
                        <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">${Utils.formatCurrency(product.price)}</p>
                    <p class="product-origin">Nguồn gốc: ${product.origin || 'Tái chế'}</p>
                </div>
            </div>
        `).join('');
    }

    // Cart Management
    addToCart(productId) {
        // Add product to cart
        const existingItem = window.app.data.cart.find(item => item.product_id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            window.app.data.cart.push({
                product_id: productId,
                quantity: 1,
                added_at: new Date().toISOString()
            });
        }

        this.updateCartCount();
        Utils.showToast('Đã thêm vào giỏ hàng!', 'success');
    }

    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = window.app.data.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        // Implement category filtering logic
        Utils.showToast(`Đang lọc theo danh mục: ${category}`, 'info');
    }

    showSearchModal() {
        // Implement search modal
        Utils.showToast('Tính năng tìm kiếm đang phát triển', 'info');
    }
}

// Global Đẹp Marketplace instance
window.depMarketplace = new DepMarketplace();
