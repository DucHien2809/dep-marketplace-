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
        // Try both new product-grid and old gallery-grid
        const galleryGrid = document.getElementById('product-grid') || document.getElementById('gallery-grid');
        if (!galleryGrid) {
            console.log('❌ Gallery grid not found (tried both product-grid and gallery-grid)');
            return;
        }

        // Use CollectionGallery class if available (preferred)
        if (window.collectionGallery && window.collectionGallery.generateProductItems) {
            console.log('📊 Using CollectionGallery to generate product items');
            galleryGrid.innerHTML = window.collectionGallery.generateProductItems();
        } else if (window.collectionGallery && window.collectionGallery.generateGalleryItems) {
            console.log('📊 Using CollectionGallery to generate gallery items (legacy)');
            galleryGrid.innerHTML = window.collectionGallery.generateGalleryItems();
        } else {
            console.log('📊 Using dep-marketplace fallback gallery items');
            galleryGrid.innerHTML = this.generateFallbackGalleryItems();
        }
    }

    generateFallbackGalleryItems() {
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
                story: "Từ những mảnh vải cotton organic còn sót lại, tạo nên tác phẩm nghệ thuật mới",
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
            }
        ];

        return sampleItems.map(item => this.renderGalleryItem(item)).join('');
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
                        <button class="btn-icon btn-edit-gallery" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete-gallery" title="Xóa">
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
                                <span class="stat-number" id="total-items">6</span>
                                <span class="stat-label">Tổng tác phẩm</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number" id="featured-items">4</span>
                                <span class="stat-label">Nổi bật</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number" id="total-views">1,234</span>
                                <span class="stat-label">Lượt xem</span>
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
                        <div class="product-grid" id="product-grid">
                            ${this.generateGalleryItemsFallback()}
                        </div>
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
                story: "Từ những mảnh vải cotton organic còn sót lại, tạo nên tác phẩm nghệ thuật mới",
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
                story: "Biến hóa từ áo khoác denim cũ thành tác phẩm streetwear hiện đại",
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

        return sampleItems.map(item => `
            <div class="gallery-item ${item.featured ? 'featured' : ''}" data-item-id="${item.id}" data-tags="${item.tags.join(' ')}">
                <div class="gallery-item-image" style="background-image: url('${item.image}')">
                    ${item.featured ? '<span class="featured-badge">Nổi bật</span>' : ''}
                    
                    <!-- Admin Controls -->
                    <div class="gallery-item-controls admin-only">
                        <button class="btn-icon btn-edit-gallery" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete-gallery" title="Xóa">
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
                            ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
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
        `).join('');
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
        
        Utils.showToast(`Lọc theo: ${filter === 'all' ? 'Tất cả' : filter}`, 'info');
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
                const itemId = e.target.closest('.gallery-item').getAttribute('data-item-id');
                this.editGalleryItem(itemId);
            });
        });
        
        document.querySelectorAll('.btn-delete-gallery').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
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
        Utils.showToast(`Chỉnh sửa tác phẩm ${itemId}`, 'info');
        // TODO: Implement edit
    }
    
    deleteGalleryItem(itemId) {
        if (confirm('Bạn có chắc chắn muốn xóa tác phẩm này?')) {
            Utils.showToast('Đã xóa tác phẩm', 'success');
            // TODO: Implement delete
        }
    }
    
    viewGalleryDetail(itemId) {
        Utils.showToast(`Xem chi tiết tác phẩm ${itemId}`, 'info');
        // TODO: Show detail modal
    }
    
    loadMarketplacePage() {
        // Create and show Marketplace page
        this.createPage('marketplace');
        
        // Initialize marketplace functionality
        setTimeout(() => {
            this.initMarketplaceFilters();
        }, 100);
    }
    
    initMarketplaceFilters() {
        // TODO: Add marketplace filter functionality
        Utils.showToast('Marketplace đang phát triển...', 'info');
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
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
        if (sizeFilter) {
            sizeFilter.addEventListener('change', () => this.applyFilters());
        }
        if (priceFilter) {
            priceFilter.addEventListener('change', () => this.applyFilters());
        }
        if (styleFilter) {
            styleFilter.addEventListener('change', () => this.applyFilters());
        }
        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.applySorting());
        }
        if (searchInput) {
            searchInput.addEventListener('input', () => this.applySearch());
        }
    }

    applyFilters() {
        // This would normally filter products from database
        // For now, just show toast
        Utils.showToast('Đang áp dụng bộ lọc...', 'info');
        setTimeout(() => {
            this.updateResultsCount();
        }, 500);
    }

    applySorting() {
        Utils.showToast('Đang sắp xếp sản phẩm...', 'info');
        setTimeout(() => {
            this.updateResultsCount();
        }, 500);
    }

    applySearch() {
        const searchInput = document.getElementById('collection-search');
        if (searchInput && searchInput.value.length > 2) {
            Utils.showToast(`Tìm kiếm: "${searchInput.value}"`, 'info');
            setTimeout(() => {
                this.updateResultsCount();
            }, 500);
        }
    }

    updateResultsCount() {
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
                        <div class="collection-products-grid" id="collection-products">
                            <!-- Sample products for display -->
                            ${this.generateSampleProducts()}
                        </div>

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
        const sampleProducts = [
            {
                id: 1,
                name: "Áo kiểu Vintage Tái Sinh",
                price: 450000,
                originalPrice: 650000,
                image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
                style: "vintage",
                origin: "Làm từ áo sơ mi linen cũ, thêu ren vintage",
                isNew: true
            },
            {
                id: 2,
                name: "Váy Đẹp Độc Bản",
                price: 780000,
                originalPrice: null,
                image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
                style: "độc bản",
                origin: "Tái tạo từ vải cotton organic, phối ren cổ điển",
                isNew: false
            },
            {
                id: 3,
                name: "Quần Jean Basic Eco",
                price: 520000,
                originalPrice: 720000,
                image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
                style: "basic",
                origin: "Jean tái chế với công nghệ eco-wash",
                isNew: true
            },
            {
                id: 4,
                name: "Túi Tote Minimalist",
                price: 290000,
                originalPrice: null,
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
                style: "minimalist",
                origin: "Canvas tái chế từ bao bì cũ, thiết kế tối giản",
                isNew: false
            },
            {
                id: 5,
                name: "Áo Sơ Mi Boho Chic",
                price: 380000,
                originalPrice: 560000,
                image: "https://images.unsplash.com/photo-1583743814966-8936f37f631b?w=400&h=500&fit=crop",
                style: "boho",
                origin: "Từ áo sơ mi trắng cũ, thêu họa tiết dân tộc",
                isNew: true
            },
            {
                id: 6,
                name: "Chân Váy Xoè Vintage",
                price: 420000,
                originalPrice: 590000,
                image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop",
                style: "vintage",
                origin: "Vải tweed tái chế, may theo pattern cổ điển",
                isNew: false
            }
        ];

        return sampleProducts.map(product => `
            <div class="collection-product-card" data-product-id="${product.id}" onclick="depMarketplace.showProductDetail(${product.id})">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    ${product.isNew ? '<span class="new-badge">Mới</span>' : ''}
                    ${product.originalPrice ? '<span class="sale-badge">Sale</span>' : ''}
                    <div class="product-overlay">
                        <button class="quick-view-btn">
                            <i class="fas fa-eye"></i>
                            Xem nhanh
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-origin">${product.origin}</p>
                    <div class="product-price">
                        <span class="current-price">${this.formatPrice(product.price)}</span>
                        ${product.originalPrice ? `<span class="original-price">${this.formatPrice(product.originalPrice)}</span>` : ''}
                    </div>
                    <div class="product-tags">
                        <span class="style-tag">${product.style}</span>
                    </div>
                    <button class="btn-add-to-cart" onclick="event.stopPropagation()">
                        <i class="fas fa-shopping-cart"></i>
                        Mua ngay
                    </button>
                </div>
            </div>
        `).join('');
    }

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    showProductDetail(productId) {
        // Create and show product detail modal
        const product = this.getProductById(productId);
        if (!product) return;

        const modalHTML = this.createProductDetailModal(product);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = document.getElementById('product-detail-modal');
        modal.classList.add('show');
        
        // Initialize image gallery
        this.initProductGallery();
        
        // Bind close events
        this.bindProductDetailEvents();
    }

    getProductById(id) {
        const sampleProducts = [
            {
                id: 1,
                name: "Áo kiểu Vintage Tái Sinh",
                price: 450000,
                originalPrice: 650000,
                images: [
                    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=700&fit=crop",
                    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=700&fit=crop",
                    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=700&fit=crop",
                    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=700&fit=crop"
                ],
                style: "vintage",
                origin: "Làm từ áo sơ mi linen cũ, thêu ren vintage",
                description: "Một tác phẩm nghệ thuật tái chế độc đáo, được tạo ra từ chiếc áo sơ mi linen vintage. Mỗi chi tiết thêu ren đều được làm thủ công bởi các nghệ nhân có kinh nghiệm.",
                material: "Linen tái chế 80%, Ren vintage 15%, Cotton organic 5%",
                sizes: ["S", "M", "L"],
                care: "Giặt tay với nước lạnh, phơi trong bóng râm",
                story: "Chiếc áo này được tái sinh từ một chiếc áo sơ mi linen của thập niên 80, được phát hiện tại một cửa hàng đồ cũ ở Paris. Sau quá trình tái tạo tỉ mỉ, nó đã trở thành một tác phẩm hoàn toàn mới với phong cách vintage hiện đại.",
                isNew: true,
                mixMatch: [2, 6] // IDs of suggested products
            },
            {
                id: 2,
                name: "Váy Đẹp Độc Bản",
                price: 780000,
                originalPrice: null,
                images: [
                    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=700&fit=crop",
                    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=700&fit=crop",
                    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=700&fit=crop"
                ],
                style: "độc bản",
                origin: "Tái tạo từ vải cotton organic, phối ren cổ điển",
                description: "Thiết kế độc bản không thể tìm thấy ở bất kỳ đâu khác. Được tạo ra từ những mảnh vải cotton organic chất lượng cao kết hợp với ren cổ điển.",
                material: "Cotton organic 90%, Ren cổ điển 10%",
                sizes: ["XS", "S", "M"],
                care: "Máy giặt nhẹ nhàng, không sử dụng chất tẩy",
                story: "Được thiết kế bởi team Đẹp dựa trên cảm hứng từ những bộ váy của phụ nữ Việt Nam xưa, kết hợp với xu hướng thời trang hiện đại.",
                isNew: false,
                mixMatch: [1, 4, 5]
            }
            // Add more products as needed...
        ];
        
        return sampleProducts.find(p => p.id === id);
    }

    createProductDetailModal(product) {
        return `
            <div id="product-detail-modal" class="modal product-detail-modal">
                <div class="modal-content product-detail-content">
                    <div class="modal-header">
                        <h3>${product.name}</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="product-detail-body">
                        <div class="product-images-section">
                            <div class="main-image-container">
                                <img id="main-product-image" src="${product.images[0]}" alt="${product.name}">
                                ${product.isNew ? '<span class="detail-new-badge">Mới</span>' : ''}
                                ${product.originalPrice ? '<span class="detail-sale-badge">Sale</span>' : ''}
                            </div>
                            <div class="thumbnail-gallery">
                                ${product.images.map((img, index) => `
                                    <img src="${img}" alt="${product.name} - Góc ${index + 1}" 
                                         class="thumbnail ${index === 0 ? 'active' : ''}"
                                         onclick="depMarketplace.changeMainImage('${img}', this)">
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="product-info-section">
                            <div class="price-section">
                                <span class="detail-current-price">${this.formatPrice(product.price)}</span>
                                ${product.originalPrice ? `<span class="detail-original-price">${this.formatPrice(product.originalPrice)}</span>` : ''}
                                ${product.originalPrice ? `<span class="discount-percent">-${Math.round((1 - product.price/product.originalPrice) * 100)}%</span>` : ''}
                            </div>
                            
                            <div class="product-description">
                                <p>${product.description}</p>
                            </div>
                            
                            <div class="product-details">
                                <div class="detail-item">
                                    <strong>Nguồn gốc tái chế:</strong>
                                    <p>${product.origin}</p>
                                </div>
                                
                                <div class="detail-item">
                                    <strong>Chất liệu:</strong>
                                    <p>${product.material}</p>
                                </div>
                                
                                <div class="detail-item">
                                    <strong>Size có sẵn:</strong>
                                    <div class="size-options">
                                        ${product.sizes.map(size => `
                                            <button class="size-btn" onclick="this.classList.toggle('selected')">${size}</button>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div class="detail-item">
                                    <strong>Hướng dẫn bảo quản:</strong>
                                    <p>${product.care}</p>
                                </div>
                                
                                <div class="detail-item sustainability-story">
                                    <strong>Câu chuyện tái sinh:</strong>
                                    <p>${product.story}</p>
                                </div>
                            </div>
                            
                            <div class="product-actions">
                                <button class="btn-primary btn-buy-now">
                                    <i class="fas fa-shopping-cart"></i>
                                    Mua ngay
                                </button>
                                <button class="btn-secondary btn-add-cart">
                                    <i class="fas fa-heart"></i>
                                    Yêu thích
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mix-match-section">
                        <h4>Kết hợp cùng sản phẩm Đẹp khác</h4>
                        <div class="mix-match-products">
                            ${this.generateMixMatchProducts(product.mixMatch)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    changeMainImage(newSrc, thumbnail) {
        document.getElementById('main-product-image').src = newSrc;
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
    }

    generateMixMatchProducts(productIds) {
        if (!productIds || productIds.length === 0) return '<p>Không có gợi ý kết hợp.</p>';
        
        // Simplified mix match products
        const mixMatchSamples = [
            { id: 2, name: "Chân Váy Midi", price: 420000, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop" },
            { id: 4, name: "Túi Tote Canvas", price: 290000, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop" },
            { id: 6, name: "Giày Oxford Vintage", price: 650000, image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=300&h=300&fit=crop" }
        ];
        
        return productIds.map(id => {
            const product = mixMatchSamples.find(p => p.id === id) || mixMatchSamples[0];
            return `
                <div class="mix-match-item" onclick="depMarketplace.showProductDetail(${product.id})">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="mix-match-info">
                        <h5>${product.name}</h5>
                        <span class="mix-match-price">${this.formatPrice(product.price)}</span>
                    </div>
                </div>
            `;
        }).join('');
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
