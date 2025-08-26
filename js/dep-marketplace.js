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
        this.DEFAULT_BRANDS = ['zara', 'hm', 'uniqlo', 'mango'];
        // Guard to avoid binding delete events multiple times
        this._deleteEventsBound = false;
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
                
                // Nếu chuyển đến marketplace, đồng bộ lại bộ lọc
                if (page === 'marketplace') {
                    setTimeout(async () => {
                        console.log('🔄 Tab Marketplace được chọn, đồng bộ lại bộ lọc...');
                        await this.syncBrandFiltersFromConsignments();
                    }, 300);
                }
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

    loadDepCollectionPage() {
        console.log('🚀 Loading Dep Collection Page...');
        
        // Check if page already exists in HTML (static version)
        const existingPage = document.getElementById('dep-collection-page');
        if (existingPage) {
            console.log('✅ Using existing static gallery page');
            
            // Show the page
            this.showPage('dep-collection');
            
            // Load gallery items into existing grid
            this.initializeGalleryContent();
            return;
        }
        
        console.log('⚠️ Static page not found, creating dynamic version...');
        // Fallback to dynamic creation if static doesn't exist
        this.createDynamicGalleryPage();
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(`${pageId}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            console.log(`👁️ Showing page: ${pageId}`);
            
            // Nếu là marketplace page, đồng bộ lại bộ lọc
            if (pageId === 'marketplace') {
                setTimeout(async () => {
                    console.log('🔄 Marketplace page được hiển thị, đồng bộ lại bộ lọc...');
                    await this.syncBrandFiltersFromConsignments();
                }, 100);
            }
        }
        
        // Update navigation
        this.updateNavigation(pageId);
    }

    updateNavigation(activePageId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const navItem = document.querySelector(`[data-page="${activePageId}"]`);
        if (navItem) {
            navItem.classList.add('active');
            console.log('🧭 Navigation updated');
        }
    }

    initializeGalleryContent() {
        console.log('🔧 Initializing gallery content...');
        
        // Initialize filter events
        this.initGalleryFilters();
        
        // Only load sample items if CollectionGallery hasn't already loaded database items
        if (window.collectionGallery && window.collectionGallery.galleryItems && window.collectionGallery.galleryItems.length > 0) {
            console.log('📊 CollectionGallery already loaded database items, skipping fallback');
        } else {
            console.log('📊 Loading sample gallery items as fallback');
            this.loadSampleGalleryItems();
        }
        
        // Refresh auth permissions to show/hide admin controls
        setTimeout(() => {
            if (window.authManager && window.authManager.refreshUIPermissions) {
                console.log('🔐 Refreshing UI permissions...');
                window.authManager.refreshUIPermissions();
            }
        }, 100);
        
        console.log('✅ Gallery content initialized');
    }

    loadSampleGalleryItems() {
        // No longer load sample items - let admin add real products
        const galleryGrid = document.getElementById('product-grid') || document.getElementById('gallery-grid');
        if (!galleryGrid) {
            console.log('❌ Gallery grid not found (tried both product-grid and gallery-grid)');
            return;
        }

        // Check if CollectionGallery has already loaded database items
        if (window.collectionGallery && window.collectionGallery.galleryItems && window.collectionGallery.galleryItems.length > 0) {
            console.log('📊 CollectionGallery already has database items');
            return; // Don't override with sample data
        }

        console.log('📊 Collection is empty - admin can add products');
        // Don't load any sample data - let it show empty state
    }

    generateFallbackGalleryItems() {
        // No more sample items - return empty state
        return `
            <div class="empty-collection">
                <div class="empty-content">
                    <i class="fas fa-box-open"></i>
                    <h3>Bộ sưu tập đang trống</h3>
                    <p>Hãy bắt đầu thêm những sản phẩm tái chế độc đáo của bạn!</p>
                    <button class="btn btn-primary" onclick="collectionGallery.showUploadModal()">
                        <i class="fas fa-plus"></i>
                        Thêm sản phẩm đầu tiên
                    </button>
                </div>
            </div>
        `;
    }

    // ===== Dynamic brand utilities =====
    slugifyBrandName(brandName) {
        if (!brandName) return '';
        return brandName
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '')
            .trim();
    }

    async getAdditionalBrands() {
        try {
            // Load brands từ database thay vì localStorage
            const { data: brands, error } = await window.supabase
                .from('brands')
                .select('name, slug, is_default')
                .eq('is_default', false)
                .order('name');
            
            if (error) {
                console.warn('Không thể load brands từ database:', error);
                return [];
            }
            
            return brands || [];
        } catch (e) {
            console.warn('Lỗi khi load brands:', e);
            return [];
        }
    }

    async renderAdditionalBrands() {
        // Find the "Thương hiệu" filter container in either static or dynamic markup
        let container = null;
        document.querySelectorAll('.filter-section').forEach(section => {
            const title = section.querySelector('h3, .filter-title');
            if (!container && title && /thương\s*hiệu/i.test(title.textContent)) {
                container = section.querySelector('.filter-options');
            }
        });
        if (!container) return;

        const additional = await this.getAdditionalBrands();
        if (!additional.length) return;

        const existingValues = Array.from(container.querySelectorAll('input[type="checkbox"]'))
            .map(el => el.value);

        // Bỏ bộ lọc "Khác" - chỉ giữ lại 4 thương hiệu mặc định và các thương hiệu mới
        additional.forEach(brand => {
            if (existingValues.includes(brand.slug)) return;
            
            const label = document.createElement('label');
            label.className = 'filter-option';
            label.innerHTML = `<input type="checkbox" value="${brand.slug}"> <span class="filter-checkmark"></span>${brand.name}`;
            
            // Thêm vào cuối danh sách
            container.appendChild(label);
            
            // Bind change handler
            const input = label.querySelector('input');
            input.addEventListener('change', () => this.applyFilters());
        });
    }

    async refreshBrandFilters() {
        // Clear existing additional brands first
        const container = this.getBrandFilterContainer();
        if (!container) return;

        // Remove all additional brands (keep only default ones)
        const additionalBrands = container.querySelectorAll('label:not(:has(input[value="zara"]):not(:has(input[value="hm"]):not(:has(input[value="uniqlo"]):not(:has(input[value="mango"])))');
        additionalBrands.forEach(brand => brand.remove());

        // Re-render additional brands
        await this.renderAdditionalBrands();
    }

    getBrandFilterContainer() {
        console.log('🔍 Đang tìm container bộ lọc thương hiệu...');
        let container = null;
        
        // Thử tìm theo nhiều cách khác nhau
        const selectors = [
            '.filter-section h3:contains("Thương hiệu") + .filter-options',
            '.filter-section:has(h3:contains("Thương hiệu")) .filter-options',
            '.filter-section h3:contains("thương hiệu") + .filter-options',
            '.filter-section:has(h3:contains("thương hiệu")) .filter-options'
        ];
        
        // Cách 1: Tìm trực tiếp bằng text content
        const sections = document.querySelectorAll('.filter-section');
        console.log('📋 Tìm thấy', sections.length, 'filter sections');
        
        sections.forEach((section, index) => {
            const title = section.querySelector('h3, .filter-title');
            if (title) {
                const titleText = title.textContent.toLowerCase();
                console.log(`📋 Section ${index + 1}: "${title.textContent}" (${titleText})`);
                if (!container && (titleText.includes('thương hiệu') || titleText.includes('brand'))) {
                    container = section.querySelector('.filter-options');
                    console.log('✅ Tìm thấy container bộ lọc thương hiệu:', container);
                }
            }
        });
        
        // Cách 2: Tìm theo data attribute nếu có
        if (!container) {
            container = document.querySelector('[data-filter-type="brand"] .filter-options');
            if (container) console.log('✅ Tìm thấy container theo data attribute');
        }
        
        // Cách 3: Tìm theo thứ tự (section thứ 2 thường là brand)
        if (!container && sections.length >= 2) {
            container = sections[1].querySelector('.filter-options');
            if (container) console.log('✅ Tìm thấy container theo thứ tự (section 2)');
        }
        
        // Cách 4: Fallback - tìm bất kỳ container nào có checkbox với value="zara"
        if (!container) {
            const zaraCheckbox = document.querySelector('input[value="zara"]');
            if (zaraCheckbox) {
                container = zaraCheckbox.closest('.filter-options');
                if (container) console.log('✅ Tìm thấy container theo checkbox Zara');
            }
        }
        
        // Cách 5: Fallback cuối cùng - tìm bất kỳ container nào có checkbox
        if (!container) {
            const anyCheckbox = document.querySelector('.filter-options input[type="checkbox"]');
            if (anyCheckbox) {
                container = anyCheckbox.closest('.filter-options');
                if (container) console.log('✅ Tìm thấy container theo checkbox bất kỳ');
            }
        }
        
        if (!container) {
            console.warn('❌ Không tìm thấy container bộ lọc thương hiệu');
            console.log('🔍 Debug: Tất cả sections:', Array.from(sections).map(s => s.innerHTML.substring(0, 100)));
        }
        
        return container;
    }

    // Đồng bộ bộ lọc thương hiệu theo dữ liệu thực tế trong consignments
    async syncBrandFiltersFromConsignments(prefetchedItems) {
        console.log('🔄 Đang đồng bộ bộ lọc thương hiệu...');
        const container = this.getBrandFilterContainer();
        if (!container) {
            console.warn('❌ Không tìm thấy container bộ lọc thương hiệu');
            return;
        }

        try {
            let rows = prefetchedItems || null;
            if (!rows) {
                console.log('📡 Fetching brands từ database...');
                const resp = await window.supabase
                    .from('consignments')
                    .select('brand')
                    .not('brand', 'is', null); // Chỉ lấy những brand không null
                if (resp.error) throw resp.error;
                rows = resp.data;
                console.log('📊 Fetched brands:', rows);
            }

            console.log('📊 Dữ liệu consignments:', rows);

            // Đảm bảo 4 thương hiệu mặc định luôn có mặt
            const defaultSlugs = new Set(this.DEFAULT_BRANDS);
            const activeExtras = new Set();
            
            // Lấy tất cả brands từ consignments
            (rows || []).forEach(r => {
                const slug = (r?.brand || '').toString().trim().toLowerCase();
                if (!slug || defaultSlugs.has(slug)) return;
                activeExtras.add(slug);
            });

            console.log('🏷️ Brands mặc định:', Array.from(defaultSlugs));
            console.log('🏷️ Brands động từ consignments:', Array.from(activeExtras));

            // Đảm bảo tất cả thương hiệu mặc định đều có trong UI
            defaultSlugs.forEach(defaultSlug => {
                const existing = container.querySelector(`input[value="${defaultSlug}"]`);
                if (!existing) {
                    console.log(`➕ Thêm lại thương hiệu mặc định: ${defaultSlug}`);
                    const label = document.createElement('label');
                    label.className = 'filter-option';
                    
                                         let displayName = defaultSlug;
                     if (defaultSlug === 'hm') displayName = 'H&M';
                     else if (defaultSlug === 'zara') displayName = 'Zara';
                     else if (defaultSlug === 'uniqlo') displayName = 'Uniqlo';
                     else if (defaultSlug === 'mango') displayName = 'Mango';
                    
                    label.innerHTML = `<input type="checkbox" value="${defaultSlug}"> <span class="filter-checkmark"></span>${displayName}`;
                    
                                         // Thêm vào đầu danh sách
                     container.appendChild(label);
                    
                    const input = label.querySelector('input');
                    input.addEventListener('change', () => this.applyFilters());
                }
            });

            // Xóa các brand động không còn sản phẩm (chỉ xóa những brand không phải mặc định)
            const existingBrands = container.querySelectorAll('label > input[type="checkbox"]');
            console.log('🏷️ Brands hiện tại trong UI:', Array.from(existingBrands).map(i => i.getAttribute('value')));

            existingBrands.forEach(input => {
                const value = (input.getAttribute('value') || '').toLowerCase();
                // Chỉ xóa brand động, không xóa brand mặc định
                if (!defaultSlugs.has(value) && !activeExtras.has(value)) {
                    const label = input.closest('label');
                    if (label) {
                        console.log(`🗑️ Xóa brand động không còn sản phẩm: ${value}`);
                        label.remove();
                    }
                }
            });

            // Thêm các brand mới chưa có trong UI
            const existing = new Set(
                Array.from(container.querySelectorAll('label > input[type="checkbox"]'))
                    .map(i => (i.getAttribute('value') || '').toLowerCase())
            );

            activeExtras.forEach(slug => {
                if (existing.has(slug)) return;
                console.log(`➕ Thêm brand mới: ${slug}`);
                const label = document.createElement('label');
                label.className = 'filter-option';
                label.innerHTML = `<input type="checkbox" value="${slug}"> <span class="filter-checkmark"></span>${slug}`;
                container.appendChild(label);
                const input = label.querySelector('input');
                input.addEventListener('change', () => this.applyFilters());
            });

            console.log('✅ Đồng bộ bộ lọc thương hiệu hoàn tất');
        } catch (e) {
            console.error('❌ Lỗi khi đồng bộ bộ lọc thương hiệu:', e);
        }
    }
    renderGalleryItem(item) {
        const tags = Array.isArray(item.tags) ? item.tags : [];
        
        return `
            <div class="gallery-item ${item.featured ? 'featured' : ''}" 
                 data-item-id="${item.id}" 
                 data-tags="${tags.join(' ')}">
                <div class="gallery-item-image" style="background-image: url('${item.image}')">
                    ${item.featured ? '<span class="featured-badge">Nổi bật</span>' : ''}
                    
                    <!-- Admin Controls -->
                    <div class="gallery-item-controls admin-only">
                        <button class="btn-icon btn-edit-gallery" title="Chỉnh sửa" data-action="edit" data-item-id="${item.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete-gallery" title="Xóa" data-action="delete" data-item-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <!-- View Overlay -->
                    <div class="gallery-overlay">
                        <button class="btn-view-detail">
                            <i class="fas fa-eye"></i>
                            Xem chi tiết
                        </button>
                    </div>
                </div>
                
                <div class="gallery-item-info">
                    <h3 class="gallery-item-title">${item.title}</h3>
                    <p class="gallery-item-story">${item.story}</p>
                    
                    <div class="gallery-item-meta">
                        <div class="gallery-tags">
                            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <div class="gallery-stats">
                            <span class="view-count">
                                <i class="fas fa-eye"></i>
                                ${item.views}
                            </span>
                            <span class="create-date admin-only">
                                <i class="fas fa-calendar"></i>
                                ${item.created}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createDynamicGalleryPage() {
        console.log('⚠️ Creating dynamic gallery page (fallback)');
        const mainContent = document.querySelector('.main-content');
        
        if (!mainContent) {
            console.error('❌ Main content not found!');
            return;
        }
        
        // Use CollectionGallery class if available
        let galleryHTML = '';
        if (window.collectionGallery && window.collectionGallery.createGalleryPage) {
            galleryHTML = window.collectionGallery.createGalleryPage();
        } else {
            galleryHTML = this.createGalleryPageFallback();
        }
        
        mainContent.insertAdjacentHTML('beforeend', galleryHTML);
        this.showPage('dep-collection');
        this.initializeGalleryContent();
    }
    
    createGalleryPageFallback() {
        return `
            <div id="dep-collection-page" class="page">
                <!-- Gallery Hero -->
                <div class="collection-hero">
                    <div class="container">
                        <div class="collection-hero-content">
                            <h1>Đẹp Collection</h1>
                            <p class="collection-subtitle">Bộ Sưu Tập Thời Trang Tái Chế</p>
                            <div class="brand-message">
                                <p class="brand-quote">"Đẹp không chỉ là phong cách – Đẹp còn là sự tái sinh của thời trang."</p>
                            </div>
                            
                            <!-- Admin Controls -->
                            <div class="admin-controls admin-only">
                                <button class="btn btn-primary" id="upload-product-btn">
                                    <i class="fas fa-plus"></i>
                                    Thêm sản phẩm mới
                                </button>
                                <button class="btn btn-secondary" id="manage-products-btn">
                                    <i class="fas fa-cog"></i>
                                    Quản lý sản phẩm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gallery Grid -->
                <div class="gallery-content">
                    <div class="container">
                        <!-- Gallery Stats (Admin only) -->
                        <div class="gallery-stats admin-only">
                            <div class="stat-card">
                                <span class="stat-number" id="total-items">0</span>
                                <span class="stat-label">Tổng sản phẩm</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number" id="featured-items">0</span>
                                <span class="stat-label">Nổi bật</span>
                            </div>
                        </div>

                        <!-- Product Filters -->
                        <div class="product-filters">
                            <div class="filter-section">
                                <h4>Loại sản phẩm</h4>
                                <div class="filter-buttons">
                                    <button class="filter-btn active" data-filter="all" data-type="category">Tất cả</button>
                                    <button class="filter-btn" data-filter="ao" data-type="category">Áo</button>
                                    <button class="filter-btn" data-filter="vay" data-type="category">Váy</button>
                                    <button class="filter-btn" data-filter="phu-kien" data-type="category">Phụ kiện</button>
                                </div>
                            </div>
                            
                            <div class="filter-section">
                                <h4>Phong cách</h4>
                                <div class="filter-buttons">
                                    <button class="filter-btn active" data-filter="all" data-type="style">Tất cả</button>
                                    <button class="filter-btn" data-filter="vintage" data-type="style">Vintage</button>
                                    <button class="filter-btn" data-filter="basic" data-type="style">Basic</button>
                                    <button class="filter-btn" data-filter="doc-ban" data-type="style">Độc bản</button>
                                </div>
                            </div>
                            
                            <div class="filter-section">
                                <h4>Khoảng giá</h4>
                                <div class="filter-buttons">
                                    <button class="filter-btn active" data-filter="all" data-type="price">Tất cả</button>
                                    <button class="filter-btn" data-filter="under-500k" data-type="price">Dưới 500K</button>
                                    <button class="filter-btn" data-filter="500k-1m" data-type="price">500K - 1M</button>
                                    <button class="filter-btn" data-filter="over-1m" data-type="price">Trên 1M</button>
                                </div>
                            </div>
                        </div>

                        <!-- Product Grid -->
                        <div class="product-grid" id="product-grid"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateGalleryItemsFallback() {
        const sampleItems = [
            {
                id: 1,
                title: "Áo kiểu Vintage Renaissance",
                image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
                story: "Tái sinh từ áo sơ mi linen thập niên 80, kết hợp với ren vintage từ Pháp",
                tags: ["vintage", "renaissance"],
                featured: true,
                views: 245,
                created: "2024-01-15"
            },
            {
                id: 2,
                title: "Váy Tái Chế Bohemian",
                image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
                story: "Từ những mảnh vải cotton organic còn sót lại, tạo nên sản phẩm nghệ thuật mới",
                tags: ["boho", "organic"],
                featured: true,
                views: 189,
                created: "2024-01-14"
            },
            {
                id: 3,
                title: "Túi Tote Minimalist",
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
                story: "Canvas tái chế từ bao bì cũ, thiết kế tối giản nhưng đầy tinh tế",
                tags: ["minimalist", "canvas"],
                featured: false,
                views: 156,
                created: "2024-01-12"
            },
            {
                id: 4,
                title: "Áo Khoác Denim Upcycled",
                image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=500&fit=crop",
                story: "Biến hóa từ áo khoác denim cũ thành sản phẩm streetwear hiện đại",
                tags: ["modern", "streetwear"],
                featured: true,
                views: 312,
                created: "2024-01-10"
            },
            {
                id: 5,
                title: "Váy Cocktail Vintage",
                image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop",
                story: "Phục hồi từ váy cocktail thập niên 60, giữ nguyên vẻ đẹp cổ điển",
                tags: ["vintage", "cocktail"],
                featured: false,
                views: 203,
                created: "2024-01-08"
            },
            {
                id: 6,
                title: "Áo Blouse Bohemian Chic",
                image: "https://images.unsplash.com/photo-1583743814966-8936f37f631b?w=400&h=500&fit=crop",
                story: "Kết hợp vải lụa vintage với thêu tay truyền thống Việt Nam",
                tags: ["boho", "silk"],
                featured: true,
                views: 278,
                created: "2024-01-05"
            }
        ];

        // Disable rendering of sample items
        return '';
    }
    initGalleryFilters() {
        console.log('🔧 Setting up gallery filters...');
        
        // Filter by product attributes
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterBtn = e.target;
                const filterType = filterBtn.getAttribute('data-type');
                const filterValue = filterBtn.getAttribute('data-filter');
                
                // Remove active from same type filters
                document.querySelectorAll(`.filter-btn[data-type="${filterType}"]`)
                    .forEach(b => b.classList.remove('active'));
                
                // Add active to clicked filter
                filterBtn.classList.add('active');
                
                // Apply filters (delegate to CollectionGallery if available)
                if (window.collectionGallery && window.collectionGallery.applyFilters) {
                    window.collectionGallery.applyFilters();
                } else {
                    // Fallback to simple filter
                    this.filterGalleryItems(filterValue);
                }
            });
        });

        // Add product management button event listeners
        const uploadBtn = document.getElementById('upload-product-btn') || document.getElementById('upload-gallery-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                console.log('📸 Upload product button clicked!');
                if (window.collectionGallery && window.collectionGallery.showUploadModal) {
                    window.collectionGallery.showUploadModal();
                } else {
                    Utils.showToast('Upload modal sẽ mở ở đây! (Đang phát triển)', 'info');
                }
            });
            console.log('✅ Upload product button event added');
        }

        // Add manage products button event
        const manageBtn = document.getElementById('manage-products-btn') || document.getElementById('manage-gallery-btn');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => {
                console.log('⚙️ Manage products clicked!');
                Utils.showToast('Quản lý sản phẩm đang phát triển', 'info');
            });
        }

        console.log('✅ Gallery filters initialized');
    }
    
    filterGalleryItems(filter) {
        const items = document.querySelectorAll('.gallery-item');
        
        items.forEach(item => {
            if (filter === 'all') {
                item.style.display = 'block';
            } else {
                const tags = item.getAttribute('data-tags');
                if (tags && tags.includes(filter)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            }
        });
        
        // Toast notification removed as requested by user
    }
    
    bindGalleryEvents() {
        // Upload product button (prefer new id, fallback to old)
        const uploadBtn = document.getElementById('upload-product-btn') || document.getElementById('upload-gallery-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                if (window.collectionGallery && window.collectionGallery.showUploadModal) {
                    window.collectionGallery.showUploadModal();
                } else {
                    this.showUploadModal();
                }
            });
        }
        
        // Edit/Delete buttons
        document.querySelectorAll('.btn-edit-gallery').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addRippleEffect(e.target);
                const itemId = e.target.closest('.gallery-item').getAttribute('data-item-id');
                this.editGalleryItem(itemId);
            });
        });
        
        document.querySelectorAll('.btn-delete-gallery').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addRippleEffect(e.target);
                const itemId = e.target.closest('.gallery-item').getAttribute('data-item-id');
                this.deleteGalleryItem(itemId);
            });
        });
        
        // View detail buttons
        document.querySelectorAll('.btn-view-detail').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = e.target.closest('.gallery-item').getAttribute('data-item-id');
                this.viewGalleryDetail(itemId);
            });
        });
    }
    
    showUploadModal() {
        Utils.showToast('Chức năng upload đang phát triển...', 'info');
        // TODO: Implement upload modal
    }
    
    editGalleryItem(itemId) {
        Utils.showToast(`Chỉnh sửa sản phẩm ${itemId}`, 'info');
        // TODO: Implement edit
    }
    
    deleteGalleryItem(itemId) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            Utils.showToast('Đã xóa sản phẩm', 'success');
            // TODO: Implement delete
        }
    }
    
    viewGalleryDetail(itemId) {
        Utils.showToast(`Xem chi tiết sản phẩm ${itemId}`, 'info');
        // TODO: Show detail modal
    }
    
    addRippleEffect(button) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    async loadMarketplacePage() {
        // Create and show Marketplace page
        this.createPage('marketplace');
        
        // Đợi một chút để DOM được tạo hoàn toàn
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Load products immediately without artificial delay
        await this.generateMarketplaceProducts();
        this.initMarketplaceFilters();
        
        // Đồng bộ lại bộ lọc thương hiệu sau khi khởi tạo xong
        await this.syncBrandFiltersFromConsignments();
        
        // Đảm bảo bộ lọc được cập nhật đầy đủ
        setTimeout(async () => {
            console.log('🔄 Kiểm tra lại bộ lọc để đảm bảo đầy đủ...');
            await this.syncBrandFiltersFromConsignments();
        }, 300);
    }
    
    async generateMarketplaceProducts() {
        console.log('🛍️ Loading marketplace products from Supabase...');
        const productsContainer = document.getElementById('marketplace-products');
        if (!productsContainer) {
            console.error('❌ Marketplace products container not found');
            return;
        }

        try {
            // Load consignments from Supabase (show all, no approval gate)
            const { data: consignments, error } = await window.supabase
                .from('consignments')
                .select('id,name,category,brand,size,condition,selling_price,primary_image,created_at,user_id')
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            const items = consignments || [];

            if (!items.length) {
                productsContainer.innerHTML = `
                    <div class="empty-marketplace">
                        <div class="empty-icon">
                            <i class="fas fa-store"></i>
                        </div>
                        <h3>Chưa có sản phẩm nào</h3>
                        <p>Bắt đầu bằng cách <a href="#" data-page="consign">đăng sản phẩm ký gửi</a></p>
                    </div>
                `;
                const countElement = document.getElementById('products-count');
                if (countElement) countElement.textContent = '0 sản phẩm';
                return;
            }

            const html = items.map(p => `
                <div class="product-card" 
                     data-product-id="${p.id}" 
                     data-category="${p.category || ''}" 
                     data-brand="${p.brand || 'other'}" 
                     data-size="${p.size || ''}" 
                     data-condition="${p.condition || ''}"
                     data-price="${p.selling_price || 0}">
                    <div class="product-image">
                        <img src="${p.primary_image}" alt="${p.name}">
                        <div class="product-overlay">
                            <button class="btn btn-primary add-to-cart" data-product-id="${p.id}">Thêm vào giỏ</button>
                        </div>
                        ${this.canDeleteProduct(p) ? `
                            <div class="product-actions delete-actions">
                                <button class="btn btn-danger btn-sm delete-product" 
                                        data-product-id="${p.id}" 
                                        data-product-name="${p.name}"
                                        title="Xóa sản phẩm">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${p.name}</h3>
                        <div class="product-price">
                            <span class="current-price">${this.formatPrice(p.selling_price || 0)}</span>
                        </div>
                        <div class="product-meta">
                            <span class="brand-tag">${p.brand || 'Khác'}</span>
                            <span class="condition-tag">${this.getConditionLabel(p.condition)}</span>
                        </div>
                        <div class="product-actions">
                            <button class="btn-buy" data-product-id="${p.id}">Mua ngay <i class="fas fa-shopping-cart"></i></button>
                            <button class="btn-chat btn-detail" data-product-id="${p.id}">Xem chi tiết</button>
                        </div>
                    </div>
                    </div>
            `).join('');

            productsContainer.innerHTML = html;

            const countElement = document.getElementById('products-count');
            if (countElement) countElement.textContent = `${items.length} sản phẩm`;

            this.bindMarketplaceEvents();
            console.log('🔄 Đang đồng bộ bộ lọc thương hiệu...');
            // Đồng bộ bộ lọc thương hiệu theo dữ liệu thực tế từ danh sách đã fetch
            await this.syncBrandFiltersFromConsignments(items);
            console.log('✅ Đồng bộ bộ lọc hoàn tất, đang áp dụng filters...');
            this.applyFilters();
            console.log('✅ Marketplace products loaded from Supabase:', items.length);
            
            // Đảm bảo bộ lọc được cập nhật đầy đủ
            setTimeout(async () => {
                console.log('🔄 Đồng bộ lại bộ lọc để đảm bảo đầy đủ...');
                await this.syncBrandFiltersFromConsignments();
            }, 200);
        } catch (error) {
            console.error('❌ Error loading marketplace products:', error);
            productsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Có lỗi xảy ra</h3>
                    <p>Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>
                    <button onclick="window.depMarketplace.generateMarketplaceProducts()" class="btn btn-primary">Thử lại</button>
                </div>
            `;
        }
    }

    getTagLabel(tag) {
        const labels = {
            'new': 'Mới ký gửi',
            'markdown': 'Markdown 20%',
            'vintage': 'Vintage'
        };
        return labels[tag] || tag;
    }

    getConditionLabel(condition) {
        const labels = {
            'new': '90% mới',
            'good': 'Tốt',
            'vintage': 'Vintage'
        };
        return labels[condition] || condition;
    }

    getCategoryLabel(category) {
        const labels = {
            'tops': 'Áo',
            'bottoms': 'Quần',
            'dresses': 'Váy',
            'accessories': 'Phụ kiện'
        };
        return labels[category] || category;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    bindMarketplaceEvents() {
        // Buy now buttons
        document.querySelectorAll('.btn-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.getAttribute('data-product-id');
                this.handleBuyNow(productId);
            });
        });

        // Chat buttons
        document.querySelectorAll('.btn-chat').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const sellerName = btn.getAttribute('data-seller');
                this.handleChatWithSeller(sellerName);
            });
        });

        // Product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.getAttribute('data-product-id');
                this.showProductDetail(productId);
            });
        });


    }

    handleBuyNow(productId) {
        // TODO: Implement checkout flow
        Utils.showToast('Chức năng mua hàng đang phát triển!', 'info');
    }

    handleChatWithSeller(sellerName) {
        // TODO: Implement chat system
    }

    async showProductDetail(productId) {
        try {
            console.log('🔍 Showing product detail for ID:', productId);
            
            // Fetch product details
            const { data: product, error } = await window.supabase
                .from('consignments')
                .select('*')
                .eq('id', productId)
                .single();
            
            if (error) {
                console.error('❌ Error fetching product:', error);
                return;
            }
            
            if (!product) {
                console.error('❌ Product not found');
                return;
            }
            
            console.log('✅ Product data:', product);
            
            // Create modal HTML
            const modalHTML = this.createProductDetailModal(product);
            
            // Insert modal into DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Get modal element
            const modal = document.getElementById('product-detail-modal');
            console.log('🔍 Modal in DOM:', modal);
            console.log('🔍 Modal display style:', modal ? modal.style.display : 'N/A');
            console.log('🔍 Modal computed style:', modal ? window.getComputedStyle(modal).display : 'N/A');
            
            // Initialize modal functionality
            this.initProductDetailModal(productId);
            
        } catch (error) {
            console.error('❌ Error in showProductDetail:', error);
        }
    }

    createProductDetailModal(product) {
        console.log('🔧 Creating product detail modal for:', product.name);
        
        // Build images array: primary first, then gallery (deduplicated)
        const rawImages = [
            product.primary_image || '/images/placeholder.jpg',
            ...((Array.isArray(product.gallery) ? product.gallery : []) || [])
        ]
        .filter(v => typeof v === 'string' && v.trim().length > 0)
        .map(v => v.trim());

        const allImages = Array.from(new Set(rawImages));

        return `
            <div id="product-detail-modal" class="modal product-detail-modal">
                <div class="modal-content product-detail-content">
                    <div class="modal-header">
                        <h3>${product.name}</h3>
                        <span class="close-btn">&times;</span>
                    </div>
                    <div class="product-detail-body">
                        <div class="product-images-section">
                            <div class="main-image-container">
                                <img src="${allImages[0]}" 
                                     alt="${product.name}" 
                                     class="main-product-image" id="main-product-image">
                                <span class="detail-condition-badge">${this.getConditionLabel(product.condition)}</span>
                            </div>
                            <div class="thumbnail-gallery">
                                ${allImages.map((img, idx) => `
                                    <img src="${img}" alt="${product.name} ${idx+1}" class="thumbnail ${idx===0 ? 'active' : ''}" data-src="${img}">
                                `).join('')}
                            </div>
                        </div>
                        <div class="product-info-section">
                            <div class="product-meta-detail">
                                <div class="meta-item">
                                    <strong>Tiêu đề sản phẩm:</strong> ${product.name || ''}
                                </div>
                                <div class="meta-item">
                                    <strong>Thương hiệu:</strong> ${product.brand || 'Không xác định'}
                                </div>
                                <div class="meta-item">
                                    <strong>Kích thước:</strong> ${product.size || 'Không xác định'}
                                </div>
                                <div class="meta-item">
                                    <strong>Danh mục:</strong> ${this.getCategoryLabel(product.category) || 'Không xác định'}
                                </div>
                                <div class="meta-item">
                                    <strong>Tình trạng:</strong> ${this.getConditionLabel(product.condition)}
                                </div>
                                <div class="meta-item">
                                    <strong>Giá bán:</strong> ${this.formatPrice(product.selling_price || 0)}
                                </div>
                                <div class="meta-item">
                                    <strong>Mã sản phẩm:</strong> ${product.id}
                                </div>
                            </div>
                            <div class="product-description">
                                <h4>Mô tả chi tiết:</h4>
                                <p>${product.description || 'Không có mô tả'}</p>
                            </div>
                            <div class="product-actions">
                                <button class="btn btn-primary btn-buy-now" data-product-id="${product.id}">Mua ngay <i class="fas fa-shopping-cart"></i></button>
                                <button class="btn btn-secondary btn-close-modal">Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initMarketplaceFilters() {
        console.log('🔧 Initializing marketplace filters...');
        
        // Filter checkboxes
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.applyFilters();
            });
        });

        // Size buttons
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                this.applyFilters();
            });
        });

        // Price sliders
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const priceMinLabel = document.getElementById('price-min-label');
        const priceMaxLabel = document.getElementById('price-max-label');

        if (priceMin && priceMax && priceMinLabel && priceMaxLabel) {
            [priceMin, priceMax].forEach(slider => {
                slider.addEventListener('input', () => {
                    priceMinLabel.textContent = this.formatPrice(parseInt(priceMin.value));
                    priceMaxLabel.textContent = this.formatPrice(parseInt(priceMax.value));
                    this.applyFilters();
                });
            });
        }

        // Sort select
        const sortSelect = document.getElementById('marketplace-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.applySorting(sortSelect.value);
            });
        }

        // Clear filters button
        const clearBtn = document.getElementById('clear-all-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Không gọi renderAdditionalBrands() ở đây nữa vì nó sẽ được gọi sau khi load products
        console.log('✅ Marketplace filters initialized');
    }

    applyFilters() {
        const products = document.querySelectorAll('.product-card');
        const activeFilters = this.getActiveFilters();
        let visibleCount = 0;

        products.forEach(product => {
            const isVisible = this.productMatchesFilters(product, activeFilters);
            product.style.display = isVisible ? 'block' : 'none';
            if (isVisible) visibleCount++;
        });

        // Update results count
        const countElement = document.getElementById('products-count');
        if (countElement) {
            countElement.textContent = `${visibleCount} sản phẩm`;
        }

        // Active filters display removed per user request
    }

    getActiveFilters() {
        const filters = {
            categories: [],
            brands: [],
            conditions: [],
            sizes: [],
            priceMin: 0,
            priceMax: 5000000
        };

        // Get checked categories
        document.querySelectorAll('.filter-option input[value]:checked').forEach(input => {
            const value = input.value;
            const section = input.closest('.filter-section');
            const title = section.querySelector('.filter-title').textContent.toLowerCase();

            if (title.includes('danh mục')) {
                filters.categories.push(value);
            } else if (title.includes('thương hiệu')) {
                filters.brands.push(value);
            } else if (title.includes('tình trạng')) {
                filters.conditions.push(value);
            }
        });

        // Get active sizes
        document.querySelectorAll('.size-btn.active').forEach(btn => {
            filters.sizes.push(btn.getAttribute('data-size'));
        });

        // Get price range
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        if (priceMin && priceMax) {
            filters.priceMin = parseInt(priceMin.value);
            filters.priceMax = parseInt(priceMax.value);
        }

        return filters;
    }

    productMatchesFilters(product, filters) {
        const category = product.getAttribute('data-category');
        const brand = product.getAttribute('data-brand').toLowerCase();
        const condition = product.getAttribute('data-condition');
        const size = product.getAttribute('data-size');
        const price = parseInt(product.getAttribute('data-price'));

        // Check category
        if (filters.categories.length > 0 && !filters.categories.includes(category)) {
            return false;
        }

        // Check brand
        if (filters.brands.length > 0 && !filters.brands.includes(brand)) {
            return false;
        }

        // Check condition
        if (filters.conditions.length > 0 && !filters.conditions.includes(condition)) {
            return false;
        }

        // Check size
        if (filters.sizes.length > 0 && !filters.sizes.includes(size)) {
            return false;
        }

        // Check price range
        if (price < filters.priceMin || price > filters.priceMax) {
            return false;
        }

        return true;
    }

    // updateActiveFiltersDisplay removed per user request

    applySorting(sortBy) {
        const container = document.getElementById('marketplace-products');
        if (!container) return;

        const products = Array.from(container.querySelectorAll('.product-card'));
        
        products.sort((a, b) => {
            const priceA = parseInt(a.getAttribute('data-price'));
            const priceB = parseInt(b.getAttribute('data-price'));

            switch (sortBy) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                default:
                    return 0; // Keep original order for newest
            }
        });

        // Reorder DOM elements
        products.forEach(product => {
            container.appendChild(product);
        });
    }

    clearAllFilters() {
        // Clear checkboxes
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });

        // Clear size buttons
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Reset price sliders
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        if (priceMin && priceMax) {
            priceMin.value = 0;
            priceMax.value = 5000000;
            document.getElementById('price-min-label').textContent = '0đ';
            document.getElementById('price-max-label').textContent = '5,000,000đ';
        }

        // Apply filters to show all products
        this.applyFilters();

        // Filter cleared silently
    }

    initCollectionFilters() {
        // Bind filter events
        const categoryFilter = document.getElementById('collection-category');
        const sizeFilter = document.getElementById('collection-size');
        const priceFilter = document.getElementById('collection-price');
        const styleFilter = document.getElementById('collection-style');
        const sortFilter = document.getElementById('collection-sort');
        const searchInput = document.getElementById('collection-search');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyCollectionFilters());
        }
        if (sizeFilter) {
            sizeFilter.addEventListener('change', () => this.applyCollectionFilters());
        }
        if (priceFilter) {
            priceFilter.addEventListener('change', () => this.applyCollectionFilters());
        }
        if (styleFilter) {
            styleFilter.addEventListener('change', () => this.applyCollectionFilters());
        }
        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.applyCollectionSorting());
        }
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applyCollectionSearch());
        }
    }

    applyCollectionFilters() {
        // This is for the separate collection page; kept minimal
        this.updateCollectionResultsCount();
    }

    applyCollectionSorting() {
        this.updateCollectionResultsCount();
    }

    applyCollectionSearch() {
        const searchInput = document.getElementById('collection-search');
        if (searchInput && searchInput.value.length > 2) {
            this.updateCollectionResultsCount();
        }
    }

    updateCollectionResultsCount() {
        const countElement = document.getElementById('collection-results-count');
        if (countElement) {
            countElement.textContent = 'Hiển thị 6 sản phẩm';
        }
    }

    // Page Creation Methods
    createPage(page) {
        const mainContent = document.querySelector('.main-content');
        let pageHTML = '';

        switch (page) {
            case 'dep-collection':
                // Create dep collection page
                if (window.collectionGallery && typeof window.collectionGallery.createGalleryPage === 'function') {
                    pageHTML = window.collectionGallery.createGalleryPage();
                } else {
                    pageHTML = this.createGalleryPageFallback();
                }
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

        if (pageHTML && mainContent) {
            mainContent.insertAdjacentHTML('beforeend', pageHTML);
        }
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
                        <!-- Advanced Filters -->
                        <div class="collection-filters-advanced">
                            <div class="filters-row-1">
                                <div class="filter-group">
                                    <label>Loại sản phẩm:</label>
                                    <select id="collection-category">
                                        <option value="all">Tất cả</option>
                                        <option value="tops">Áo</option>
                                        <option value="bottoms">Quần</option>
                                        <option value="dresses">Váy</option>
                                        <option value="accessories">Phụ kiện</option>
                                    </select>
                                </div>
                                
                                <div class="filter-group">
                                    <label>Size:</label>
                                    <select id="collection-size">
                                        <option value="all">Tất cả</option>
                                        <option value="XS">XS</option>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                    </select>
                                </div>

                                <div class="filter-group">
                                    <label>Khoảng giá:</label>
                                    <select id="collection-price">
                                        <option value="all">Tất cả</option>
                                        <option value="0-200000">Dưới 200k</option>
                                        <option value="200000-500000">200k - 500k</option>
                                        <option value="500000-1000000">500k - 1tr</option>
                                        <option value="1000000-2000000">1tr - 2tr</option>
                                        <option value="2000000+">Trên 2tr</option>
                                    </select>
                                </div>

                                <div class="filter-group">
                                    <label>Phong cách:</label>
                                    <select id="collection-style">
                                        <option value="all">Tất cả</option>
                                        <option value="vintage">Vintage</option>
                                        <option value="basic">Basic</option>
                                        <option value="độc bản">Độc bản</option>
                                        <option value="minimalist">Minimalist</option>
                                        <option value="boho">Boho</option>
                                    </select>
                                </div>
                            </div>

                            <div class="filters-row-2">
                                <div class="search-filter">
                                    <input type="text" id="collection-search" placeholder="Tìm kiếm sản phẩm...">
                                    <i class="fas fa-search"></i>
                                </div>
                                
                                <div class="filter-group">
                                    <label>Sắp xếp:</label>
                                    <select id="collection-sort">
                                        <option value="newest">Mới nhất</option>
                                        <option value="price-low">Giá thấp đến cao</option>
                                        <option value="price-high">Giá cao đến thấp</option>
                                        <option value="popular">Phổ biến nhất</option>
                                        <option value="featured">Nổi bật</option>
                                    </select>
                                </div>

                                <div class="results-count">
                                    <span id="collection-results-count">Đang tải...</span>
                                </div>
                            </div>
                        </div>

                        <!-- Products Grid 4 Columns -->
                        <div class="collection-products-grid" id="collection-products"></div>

                        <!-- Load More -->
                        <div class="load-more-section">
                            <button class="btn btn-secondary" id="load-more-collection">
                                <i class="fas fa-plus"></i>
                                Xem thêm sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateSampleProducts() {
        // No sample products
        return '';
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }



    getProductById(id) {
        return null;
    }

    initProductGallery() {
        // Add zoom functionality
        const mainImage = document.getElementById('main-product-image');
        if (mainImage) {
            mainImage.addEventListener('click', () => {
                mainImage.classList.toggle('zoomed');
            });
        }
    }

    initProductDetailModal(productId) {
        const modal = document.getElementById('product-detail-modal');
        if (!modal) {
            console.warn('❌ Modal not found for initialization');
            return;
        }

        console.log('🔧 Initializing product detail modal...');
        // Show modal
        modal.classList.add('show');

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('🖱️ Clicked outside modal, closing...');
                modal.remove();
            }
        });
        
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape' && modal) {
                console.log('⌨️ ESC key pressed, closing modal...');
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Close button functionality
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('❌ Close button clicked');
                modal.remove();
            });
        }

        // Add zoom functionality to main image
        const mainImage = modal.querySelector('#main-product-image');
        if (mainImage) {
            mainImage.addEventListener('click', () => {
                mainImage.classList.toggle('zoomed');
                console.log('🔍 Image zoom toggled');
            });
        }

        // Thumbnail click to swap main image
        const thumbs = modal.querySelectorAll('.thumbnail');
        if (thumbs && thumbs.length) {
            thumbs.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const src = thumb.getAttribute('data-src') || thumb.getAttribute('src');
                    if (src && mainImage) {
                        mainImage.setAttribute('src', src);
                        modal.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                        thumb.classList.add('active');
                    }
                });
            });
        }

        // Bind action buttons
        const buyNowBtn = modal.querySelector('.btn-buy-now');
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', () => {
                // Do nothing per requirement
            });
        }

        const closeBtn2 = modal.querySelector('.btn-close-modal');
        if (closeBtn2) {
            closeBtn2.addEventListener('click', () => {
                modal.remove();
            });
        }

        const deleteBtn = modal.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                const productName = modal.querySelector('h3').textContent;
                this.deleteProduct(productId, productName);
                modal.remove();
            });
        }

        console.log('✅ Product detail modal initialized successfully');
    }

    bindProductDetailEvents() {
        // Close modal when clicking outside
        const modal = document.getElementById('product-detail-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal) {
                modal.remove();
            }
        }, { once: true });
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
                                                        <label class="filter-option"><input type="checkbox" value="tops"> <span class="filter-checkmark"></span>Áo</label>
                <label class="filter-option"><input type="checkbox" value="bottoms"> <span class="filter-checkmark"></span>Quần</label>
                <label class="filter-option"><input type="checkbox" value="dresses"> <span class="filter-checkmark"></span>Váy</label>
                <label class="filter-option"><input type="checkbox" value="accessories"> <span class="filter-checkmark"></span>Phụ kiện</label>
                                    </div>
                                </div>

                                <div class="filter-section">
                                    <h3>Thương hiệu</h3>
                                    <div class="filter-options">
                                                        <label class="filter-option"><input type="checkbox" value="zara"> <span class="filter-checkmark"></span>Zara</label>
                <label class="filter-option"><input type="checkbox" value="hm"> <span class="filter-checkmark"></span>H&M</label>
                <label class="filter-option"><input type="checkbox" value="uniqlo"> <span class="filter-checkmark"></span>Uniqlo</label>
                                        <label class="filter-option"><input type="checkbox" value="mango"> <span class="filter-checkmark"></span>Mango</label>
                                        
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
                                                        <label class="filter-option"><input type="checkbox" value="new"> <span class="filter-checkmark"></span>90% mới</label>
                <label class="filter-option"><input type="checkbox" value="good"> <span class="filter-checkmark"></span>Tốt</label>
                <label class="filter-option"><input type="checkbox" value="vintage"> <span class="filter-checkmark"></span>Vintage</label>
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
    }

    showSearchModal() {
        // Implement search modal
        Utils.showToast('Tính năng tìm kiếm đang phát triển', 'info');
    }

    // Product Management Methods
    canDeleteProduct(product) {
        // Kiểm tra quyền xóa sản phẩm
        const currentUser = window.authManager?.getCurrentUser();
        if (!currentUser) return false;
        
        // Admin có thể xóa tất cả sản phẩm
        if (currentUser.role === 'admin') return true;
        
        // Người ký gửi chỉ có thể xóa sản phẩm của mình
        return product.user_id === currentUser.id;
    }

    async deleteProduct(productId, productName) {
        try {
            // Xác nhận xóa
            if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${productName}"?`)) {
                return;
            }

            // Xóa sản phẩm khỏi database
            const { error } = await window.supabase
                .from('consignments')
                .delete()
                .eq('id', productId);

            if (error) {
                throw new Error(`Lỗi xóa sản phẩm: ${error.message}`);
            }

            // Hiển thị thông báo thành công
            Utils.showToast('Đã xóa sản phẩm thành công!', 'success');
            
            // Refresh danh sách sản phẩm
            await this.generateMarketplaceProducts();
            
        } catch (error) {
            console.error('Error deleting product:', error);
            Utils.showToast(`Lỗi xóa sản phẩm: ${error.message}`, 'error');
        }
    }

    bindMarketplaceEvents() {
        // Avoid rebinding on subsequent renders
        if (this._deleteEventsBound) return;

        // Bind delete product events (delegated, one-time)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.delete-product') || e.target.closest('.delete-product')) {
                e.preventDefault();
                const button = e.target.matches('.delete-product') ? e.target : e.target.closest('.delete-product');
                const productId = button.getAttribute('data-product-id');
                const productName = button.getAttribute('data-product-name');

                if (!productId) return;

                // Prevent rapid double clicks while deleting
                button.disabled = true;
                this.deleteProduct(productId, productName)
                    .finally(async () => {
                        button.disabled = false;
                        // Sau khi xóa, cập nhật lại bộ lọc thương hiệu
                        await this.syncBrandFiltersFromConsignments();
                        this.applyFilters();
                    });
            }
        });

        // Bind product card click events for detail view
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons or overlays
                if (e.target.closest('.product-overlay') || 
                    e.target.closest('.product-actions') || 
                    e.target.closest('.btn')) {
                    return;
                }
                
                const productId = card.getAttribute('data-product-id');
                if (productId) {
                    console.log('🖱️ Product card clicked, showing detail for:', productId);
                    this.showProductDetail(productId);
                }
            });
        });

        // Delegated handlers for explicit buttons
        document.addEventListener('click', (e) => {
            // Xem chi tiết
            if (e.target.matches('.btn-detail') || e.target.closest('.btn-detail')) {
                e.preventDefault();
                const btn = e.target.closest('.btn-detail');
                const productId = btn.getAttribute('data-product-id');
                if (productId) this.showProductDetail(productId);
            }
            // Mua ngay (không làm gì theo yêu cầu)
            if (e.target.matches('.btn-buy') || e.target.closest('.btn-buy')) {
                e.preventDefault();
            }
        });

        this._deleteEventsBound = true;
    }
}

// Global Đẹp Marketplace instance
window.depMarketplace = new DepMarketplace();
