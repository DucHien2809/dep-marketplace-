// Đẹp Collection Gallery Management
class CollectionGallery {
    constructor() {
        this.galleryItems = [];
        this.currentEditId = null;
        this.init();
    }

    async init() {
        console.log('🎨 Initializing CollectionGallery...');
        this.bindEvents();
        
        // Wait for Supabase to be ready before loading data
        if (window.SupabaseConfig && typeof window.SupabaseConfig.whenReady === 'function') {
            console.log('⏳ Waiting for Supabase to be ready...');
            await window.SupabaseConfig.whenReady();
            console.log('✅ Supabase is ready');
        }
        
        console.log('📊 Loading initial gallery items...');
        await this.loadGalleryItems();
        console.log('📊 Initial gallery items loaded:', this.galleryItems.length);
        console.log('📊 Gallery items after init:', this.galleryItems);
        
        // Clear any remaining sample data after loading
        setTimeout(() => {
            console.log('⏰ Clearing sample data after timeout...');
            this.clearAllSampleData();
        }, 1000);
    }

    bindEvents() {
        console.log('🔗 Binding CollectionGallery events...');
        console.log('🎯 Looking for elements to bind events to...');
        
        // Product management buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'upload-product-btn' || e.target.closest('#upload-product-btn')) {
                e.preventDefault();
                console.log('📸 Upload product button clicked via CollectionGallery');
                console.log('🎯 Target element:', e.target);
                this.showUploadModal();
            }
            
            if (e.target.id === 'manage-products-btn' || e.target.closest('#manage-products-btn')) {
                e.preventDefault();
                console.log('⚙️ Manage products clicked!');
                Utils.showToast('Quản lý sản phẩm đang phát triển', 'info');
            }
            
            if (e.target.closest('.btn-edit-product')) {
                e.preventDefault();
                console.log('🔍 Edit button clicked!');
                const itemId = e.target.closest('.product-item').getAttribute('data-item-id');
                console.log('🔍 Item ID:', itemId);
                console.log('🔍 Target element:', e.target);
                console.log('🔍 Closest product-item:', e.target.closest('.product-item'));
                this.editProduct(itemId);
            }
            
            if (e.target.closest('.btn-delete-product')) {
                e.preventDefault();
                const itemId = e.target.closest('.product-item').getAttribute('data-item-id');
                this.deleteProduct(itemId);
            }
            
            if (e.target.closest('.btn-quick-view')) {
                e.preventDefault();
                const itemId = e.target.closest('.product-item').getAttribute('data-item-id');
                this.showProductDetail(itemId);
            }
            
            // Open detail by clicking main image
            if (e.target.classList && e.target.classList.contains('product-image')) {
                e.preventDefault();
                const itemId = e.target.closest('.product-item')?.getAttribute('data-item-id');
                if (itemId) this.showProductDetail(itemId);
            }
            
            // Open detail by clicking product title
            if (e.target.classList && e.target.classList.contains('product-title')) {
                e.preventDefault();
                const itemId = e.target.closest('.product-item')?.getAttribute('data-item-id');
                if (itemId) this.showProductDetail(itemId);
            }
            
            if (e.target.closest('.btn-add-cart')) {
                e.preventDefault();
                const itemId = e.target.closest('.product-item').getAttribute('data-item-id');
                this.addToCart(itemId);
            }
            
            // Product filters (multi-select per type with "Tất cả" behavior)
            if (e.target.closest('.filter-btn')) {
                e.preventDefault();
                const btn = e.target.closest('.filter-btn');
                const type = btn.getAttribute('data-type');
                const value = btn.getAttribute('data-filter');

                const allBtn = document.querySelector(`.filter-btn[data-type="${type}"][data-filter="all"]`);
                const isAll = value === 'all';

                if (isAll) {
                    // Selecting "all" clears others and activates itself
                    document.querySelectorAll(`.filter-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                } else {
                    // Toggle this button
                    btn.classList.toggle('active');
                    // Deactivate "all"
                    if (allBtn) allBtn.classList.remove('active');

                    // If none selected, fall back to "all"
                    const anyActive = document.querySelectorAll(`.filter-btn[data-type="${type}"]:not([data-filter="all"]).active`).length > 0;
                    if (!anyActive && allBtn) allBtn.classList.add('active');
                }

                this.applyFilters();
            }

            // Clear all filters button
            if (e.target.id === 'collection-clear-filters' || e.target.closest('#collection-clear-filters')) {
                e.preventDefault();
                ['category','style','price','size'].forEach(type => {
                    const allBtn = document.querySelector(`.filter-btn[data-type="${type}"][data-filter="all"]`);
                    document.querySelectorAll(`.filter-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
                    if (allBtn) allBtn.classList.add('active');
                });
                this.applyFilters();
            }
        });

        // File input change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'gallery-image-input') {
                console.log('📁 File input change detected');
                console.log('📸 Files selected:', e.target.files?.length || 0);
                this.handleImageUpload(e.target.files);
            }
        });
    }

    filterGalleryItems(filter) {
        console.log('🔍 Filtering gallery items:', filter);
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

    createGalleryPage() {
        console.log('🎨 Creating gallery page...');
        console.log('📊 Current gallery items count:', this.galleryItems?.length || 0);
        
        const pageHTML = `
            <div id="dep-collection-page" class="page">
                <!-- Collection Hero -->
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
                            
                            <div class="filter-section">
                                <h4><i class="fas fa-ruler"></i> Size</h4>
                                <div class="filter-buttons">
                                    <button class="filter-btn active" data-filter="all" data-type="size">Tất cả</button>
                                    <button class="filter-btn" data-filter="XS" data-type="size">XS</button>
                                    <button class="filter-btn" data-filter="S" data-type="size">S</button>
                                    <button class="filter-btn" data-filter="M" data-type="size">M</button>
                                    <button class="filter-btn" data-filter="L" data-type="size">L</button>
                                    <button class="filter-btn" data-filter="XL" data-type="size">XL</button>
                                    <button class="filter-btn" data-filter="XXL" data-type="size">XXL</button>
                                    <button class="filter-btn" data-filter="Freesize" data-type="size">Freesize</button>
                                </div>
                            </div>
                        </div>

                        <!-- Product Grid -->
                        <div class="product-grid" id="product-grid">
                            ${this.generateGalleryItemsFromData()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('🎨 Gallery page HTML generated, length:', pageHTML.length);
        return pageHTML;
    }

    getSampleProducts() {
        console.log('📦 Getting sample products (returning empty array)');
        // Không còn sample products - để admin tự thêm
        return [];
    }

    generateProductItems() {
        console.log('🎨 Generating product items from sample products...');
        const sampleProducts = this.getSampleProducts();
        console.log('📦 Sample products count:', sampleProducts.length);
        
        if (sampleProducts.length === 0) {
            console.log('📭 No sample products to render');
            return '';
        }
        
        const rendered = sampleProducts.map(item => this.renderProductItem(item)).join('');
        console.log('✅ Product items generated, HTML length:', rendered.length);
        return rendered;
    }

    generateGalleryItemsFromData() {
        console.log('🔍 Generating gallery items from data:', this.galleryItems);
        console.log('🔍 Gallery items type:', typeof this.galleryItems);
        console.log('🔍 Gallery items length:', this.galleryItems?.length);
        console.log('🔍 Gallery items is array:', Array.isArray(this.galleryItems));
        
        if (!this.galleryItems || this.galleryItems.length === 0) {
            console.log('📭 No gallery items found, showing empty state');
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
        
        console.log('🎨 Rendering', this.galleryItems.length, 'gallery items');
        
        const renderedItems = this.galleryItems.map(item => this.renderGalleryItem(item));
        console.log('🎨 Rendered', this.galleryItems.length, 'items');
        return renderedItems.join('');
    }

    renderProductItem(item) {
        console.log('🎨 Rendering product item:', item);
        
        const isDbItem = !!item.created_at;
        const viewCount = item.views || 0;
        const createDate = isDbItem ? 
            new Date(item.created_at).toLocaleDateString('vi-VN') : 
            item.created;
        
        // Safety checks for properties
        const price = item.price || item.giá || 750000; // Default price if not available
        const originalPrice = item.originalPrice || item.original_price || item.giá_gốc || null;
        
        // Handle sizes - can be array, string, or undefined
        let sizes = [];
        if (Array.isArray(item.sizes)) {
            sizes = item.sizes;
        } else if (typeof item.sizes === 'string') {
            try {
                sizes = JSON.parse(item.sizes);
                if (!Array.isArray(sizes)) sizes = [];
            } catch (e) {
                // If parsing fails, treat as comma-separated string
                sizes = item.sizes.split(',').map(s => s.trim()).filter(s => s);
            }
        }
        
        // Safe property access with fallbacks for missing database columns
        const material = item.material || item.chất_liệu || 'Chưa cập nhật';
        const origin = item.origin || item.nguồn_gốc || item.story || 'Chưa có thông tin nguồn gốc';
        const condition = item.condition || item.tình_trạng || 'Tái chế';
        const category = item.category || item.loại || 'khac';
        const style = item.style || item.phong_cách || 'basic';
        
        // Log only essential info to avoid spam
        console.log('🎨 Rendering product:', { id: item.id, title: item.title, price, category });
        
        const priceFormatted = new Intl.NumberFormat('vi-VN').format(price);
        const originalPriceFormatted = originalPrice ? 
            new Intl.NumberFormat('vi-VN').format(originalPrice) : null;
        const discount = originalPrice ? 
            Math.round((1 - price / originalPrice) * 100) : 0;

        const productHTML = `
            <div class="product-item ${item.is_featured || item.featured ? 'featured' : ''} ${item.sold ? 'sold' : ''}" 
                 data-item-id="${item.id}" 
                 data-category="${category}"
                 data-style="${style}"
                 data-price="${price}"
                 data-sizes="${sizes.join(',')}">
                <div class="product-image-container">
                    ${item.image_url || item.image ? 
                        `<img src="${item.image_url || item.image}" alt="${item.title || 'Sản phẩm'}" class="product-image">` :
                        `<div class="product-image-placeholder" style="width: 100%; height: 100%; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #6c757d;">
                            <i class="fas fa-image" style="font-size: 2rem;"></i>
                        </div>`
                    }
                    
                    ${(item.is_featured || item.featured) ? '<span class="featured-badge">✨ Nổi bật</span>' : ''}
                    ${item.sold ? '<span class="sold-badge">Đã bán</span>' : ''}
                    ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                    
                    <!-- Admin Controls -->
                    <div class="product-controls admin-only">
                        <button class="btn-icon btn-edit-product" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete-product" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="product-overlay">
                        <button class="btn-quick-view">
                            <i class="fas fa-eye"></i>
                            Xem chi tiết
                        </button>
                        <button class="btn-add-cart ${item.sold ? 'disabled' : ''}">
                            <i class="fas fa-shopping-cart"></i>
                            ${item.sold ? 'Đã bán' : 'Mua ngay'}
                        </button>
                    </div>
                </div>
                
                <div class="product-info">
                    <h3 class="product-title">${item.title || 'Sản phẩm không có tên'}</h3>
                    
                    <div class="product-price">
                        <span class="current-price">${priceFormatted}₫</span>
                        ${originalPriceFormatted ? `<span class="original-price">${originalPriceFormatted}₫</span>` : ''}
                    </div>
                    
                    <div class="product-details">
                        <div class="product-sizes">
                            <span class="detail-label">Size:</span>
                            ${Array.isArray(sizes) && sizes.length > 0 ? 
                                sizes.map(size => `<span class="size-tag">${size}</span>`).join('') : 
                                '<span class="size-tag">OneSize</span>'
                            }
                        </div>
                        <div class="product-material">
                            <span class="detail-label">Chất liệu:</span>
                            <span class="material-text">${material}</span>
                        </div>
                    </div>
                    
                    <div class="product-origin">
                        <span class="origin-label">Nguồn gốc tái chế:</span>
                        <p class="origin-text">${origin}</p>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn-mix-match">
                            <i class="fas fa-magic"></i>
                            Mix & Match
                        </button>
                    </div>
                    
                    <div class="product-meta admin-only">
                        <span class="condition-badge">${condition}</span>
                        <span class="view-count">
                            <i class="fas fa-eye"></i>
                            ${viewCount} lượt xem
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        console.log('🎨 Product HTML generated for item:', item.id);
        return productHTML;
    }
    
    // Keep the old function for backward compatibility
    renderGalleryItem(item) {
        return this.renderProductItem(item);
    }

        showUploadModal() {
        // Check if modal already exists and remove it
        const existingModal = document.getElementById('upload-gallery-modal');
        if (existingModal) {
            existingModal.remove();
            console.log('🧹 Removed existing modal');
        }
        
        const modalHTML = `
            <div id="upload-gallery-modal" class="modal gallery-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Thêm Sản Phẩm Tái Chế Mới</h3>
                        <button class="close-btn" onclick="collectionGallery.closeUploadModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form class="upload-form">
                            <!-- Image Upload Area -->
                            <div class="upload-area">
                                <div class="upload-zone" id="upload-zone">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <h4>Kéo thả ảnh vào đây hoặc click để chọn</h4>
                                    <p>Hỗ trợ: JPG, PNG, WEBP (tối đa 5MB)</p>
                                    <input type="file" id="gallery-image-input" accept="image/*" multiple hidden>
                                </div>
                                
                                <div class="image-preview" id="image-preview"></div>
                            </div>
                            
                            <!-- Form Fields -->
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Tiêu đề sản phẩm *</label>
                                    <input type="text" id="item-title" placeholder="VD: Áo kiểu Vintage Renaissance" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Câu chuyện tái chế *</label>
                                <textarea id="item-story" placeholder="Kể về hành trình tái sinh của sản phẩm này..." rows="4" required></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Loại sản phẩm *</label>
                                    <select id="item-category" required>
                                        <option value="ao">Áo</option>
                                        <option value="vay">Váy</option>
                                        <option value="phu-kien">Phụ kiện</option>
                                        <option value="khac" selected>Khác</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>Phong cách</label>
                                    <select id="item-style">
                                        <option value="vintage">Vintage</option>
                                        <option value="basic" selected>Basic</option>
                                        <option value="doc-ban">Độc bản</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Giá bán (₫) *</label>
                                    <input type="number" id="item-price" value="750000" min="0" required>
                                </div>
                                
                                <div class="form-group">
                                    <label>Size</label>
                                    <select id="item-size">
                                        <option value="XS">XS</option>
                                        <option value="S">S</option>
                                        <option value="M" selected>M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                        <option value="Freesize">Freesize</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Chất liệu</label>
                                    <input type="text" id="item-material" placeholder="VD: Linen, Cotton, Denim" value="Chưa cập nhật">
                                </div>
                                
                                <div class="form-group">
                                    <label style="display: flex; align-items: center; gap: 10px;">
                                        <input type="checkbox" id="item-featured">
                                        <span>✨ Đặt làm nổi bật</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Nguồn gốc tái chế</label>
                                <textarea id="item-origin" placeholder="Kể về hành trình tái sinh của sản phẩm này..." rows="2">Chưa có thông tin nguồn gốc</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>Tình trạng</label>
                                <input type="text" id="item-condition" value="Tái chế" placeholder="VD: Tái chế, Mới, Đã sử dụng">
                            </div>
                            
                            <div class="form-group">
                                <label>Tags (phân cách bằng dấu phẩy)</label>
                                <input type="text" id="item-tags" placeholder="vintage, renaissance, linen" value="tai-che, doc-ban">
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="collectionGallery.closeUploadModal()">Hủy</button>
                        <button type="button" class="btn btn-primary" onclick="collectionGallery.saveGalleryItem()">
                            <i class="fas fa-save"></i>
                            Lưu sản phẩm
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        console.log('📝 Inserting modal HTML...');
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('upload-gallery-modal');
        console.log('🔍 Modal element found:', !!modal);
        
        if (modal) {
            modal.classList.add('show');
            console.log('✅ Modal shown successfully');
            
            // Setup drag and drop scoped to this modal to avoid ID conflicts on the page
            this.setupImageUpload(modal);
        } else {
            console.log('❌ Modal element not found after insertion!');
        }
    }
    
    closeUploadModal() {
        const modal = document.getElementById('upload-gallery-modal');
        if (modal) {
            modal.remove();
            console.log('✅ Upload modal closed');
        }
    }

    setupImageUpload(modal) {
        console.log('🔧 Setting up image upload for modal...');
        
        const uploadZone = modal.querySelector('#upload-zone');
        const fileInput = modal.querySelector('#gallery-image-input');
        const preview = modal.querySelector('#image-preview');
        
        console.log('🔍 Upload zone found:', !!uploadZone);
        console.log('🔍 File input found:', !!fileInput);
        console.log('🔍 Preview found:', !!preview);
        
        if (!uploadZone || !fileInput || !preview) {
            console.log('❌ Missing required elements for image upload');
            return;
        }

        // Remove existing event listeners to prevent duplicates
        const newUploadZone = uploadZone.cloneNode(true);
        const newFileInput = fileInput.cloneNode(true);
        uploadZone.parentNode.replaceChild(newUploadZone, uploadZone);
        fileInput.parentNode.replaceChild(newFileInput, fileInput);
        
        // Get fresh references
        const freshUploadZone = modal.querySelector('#upload-zone');
        const freshFileInput = modal.querySelector('#gallery-image-input');
        const freshPreview = modal.querySelector('#image-preview');

        freshUploadZone.addEventListener('click', () => freshFileInput.click());

        freshUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            freshUploadZone.classList.add('dragover');
            console.log('📁 Drag over detected');
        });
        
        freshUploadZone.addEventListener('dragleave', () => {
            freshUploadZone.classList.remove('dragover');
            console.log('📁 Drag leave detected');
        });
        
        freshUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            freshUploadZone.classList.remove('dragover');
            console.log('📁 Drop detected with', e.dataTransfer.files.length, 'files');
            this.handleImageUpload(e.dataTransfer.files, freshPreview);
        });

        freshFileInput.addEventListener('change', (e) => {
            console.log('📁 File input change detected with', e.target.files.length, 'files');
            this.handleImageUpload(e.target.files, freshPreview);
        });
    }

    handleImageUpload(files, previewEl) {
        console.log('📁 Handling image upload...');
        console.log('📸 Files to upload:', files?.length || 0);
        
        const preview = previewEl || document.getElementById('image-preview');
        console.log('🖼️ Preview element found:', !!preview);
        if (!preview) return;
        
        // Check if this is a single file upload (additive) or multiple file upload (replace)
        const isSingleFileUpload = files.length === 1;
        const existingImages = preview.querySelectorAll('.image-preview-item');
        
        // Check maximum image limit
        const maxImages = CONFIG.gallery?.maxFiles || 5;
        if (existingImages.length + files.length > maxImages) {
            Utils.showToast(`Bạn chỉ có thể upload tối đa ${maxImages} ảnh. Hiện tại đã có ${existingImages.length} ảnh.`, 'warning');
            return;
        }
        
        // If it's a single file upload and we already have images, add to existing
        // If it's multiple files or first upload, clear and replace
        if (isSingleFileUpload && existingImages.length > 0) {
            console.log('📸 Single file upload detected, adding to existing images...');
            // Don't clear preview, just add new image
        } else {
            console.log('📸 Multiple files or first upload detected, clearing preview...');
            preview.innerHTML = `
                <div class="preview-controls" style="display: none;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="document.querySelector('.collection-gallery').clearAllImages()">
                        <i class="fas fa-trash"></i> Xóa tất cả
                    </button>
                    <span class="image-count">0 ảnh</span>
                </div>
            `;
        }
        
        Array.from(files).forEach((file, index) => {
            console.log('📸 Processing file', index + 1, ':', file.name, file.type);
            
            if (file.type.startsWith('image/')) {
                console.log('✅ File is an image, creating preview...');
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log('📖 File read successfully, creating preview container...');
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'image-preview-item';
                    imageContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${existingImages.length + index + 1}">
                        <button class="remove-image" onclick="this.parentElement.remove(); document.querySelector('.collection-gallery').updatePreviewControls();">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    preview.appendChild(imageContainer);
                    console.log('✅ Preview container added for file', index + 1);
                    
                    // Update controls visibility and count
                    this.updatePreviewControls();
                };
                reader.readAsDataURL(file);
            } else {
                console.log('❌ File is not an image:', file.type);
                Utils.showToast('Chỉ hỗ trợ file ảnh (JPG, PNG, WEBP)', 'error');
            }
        });
    }

    updatePreviewControls() {
        const preview = document.getElementById('image-preview');
        if (!preview) return;
        
        const controls = preview.querySelector('.preview-controls');
        const imageCount = preview.querySelector('.image-count');
        const images = preview.querySelectorAll('.image-preview-item');
        
        if (controls && imageCount) {
            if (images.length > 0) {
                controls.style.display = 'flex';
                controls.style.justifyContent = 'space-between';
                controls.style.alignItems = 'center';
                controls.style.marginBottom = '10px';
                controls.style.padding = '8px';
                controls.style.backgroundColor = '#f8f9fa';
                controls.style.borderRadius = '4px';
                imageCount.textContent = `${images.length} ảnh`;
            } else {
                controls.style.display = 'none';
            }
        }
    }

    clearAllImages() {
        const preview = document.getElementById('image-preview');
        if (!preview) return;
        
        // Clear all images but keep the controls structure
        const images = preview.querySelectorAll('.image-preview-item');
        images.forEach(img => img.remove());
        
        // Update controls
        this.updatePreviewControls();
        
        // Clear file input
        const fileInput = document.getElementById('gallery-image-input');
        if (fileInput) {
            fileInput.value = '';
        }
        
        console.log('🧹 All images cleared');
        Utils.showToast('Đã xóa tất cả ảnh', 'info');
    }

    async saveGalleryItem() {
        console.log('🚀 Starting to save gallery item...');
        
        const title = document.getElementById('item-title').value.trim();
        const story = document.getElementById('item-story').value.trim();
        const category = document.getElementById('item-category').value;
        const style = document.getElementById('item-style').value;
        const price = parseInt(document.getElementById('item-price').value) || 750000;
        const sizeValue = document.getElementById('item-size').value;
        const material = document.getElementById('item-material').value.trim() || 'Chưa cập nhật';
        const origin = document.getElementById('item-origin').value.trim() || story;
        const condition = document.getElementById('item-condition').value.trim() || 'Tái chế';
        const tags = document.getElementById('item-tags').value.trim();
        const featured = !!document.getElementById('item-featured')?.checked;
        
        console.log('🔍 Validating form data...');
        console.log('📝 Title:', title);
        console.log('📖 Story:', story);
        console.log('🏷️ Category:', category);
        console.log('🎨 Style:', style);
        console.log('💰 Price:', price);
        console.log('📏 Size:', sizeValue);
        console.log('🧵 Material:', material);
        console.log('🌱 Origin:', origin);
        console.log('🏷️ Condition:', condition);
        console.log('🏷️ Tags:', tags);
        console.log('⭐ Featured:', featured);
        
        // Validation
        if (!title || !story || !category || !price) {
            console.log('❌ Validation failed:', { 
                title: !!title, 
                story: !!story, 
                category: !!category, 
                price: !!price 
            });
            Utils.showToast('Vui lòng điền đầy đủ thông tin bắt buộc (tiêu đề, câu chuyện, loại sản phẩm, giá)', 'error');
            return;
        }

        const modal = document.getElementById('upload-gallery-modal');
        const fileInput = modal ? modal.querySelector('#gallery-image-input') : document.getElementById('gallery-image-input');
        const preview = modal ? modal.querySelector('#image-preview') : document.getElementById('image-preview');
        console.log('📁 File input found:', !!fileInput);
        console.log('📸 Files selected:', fileInput?.files?.length || 0);
        console.log('🖼️ Preview found:', !!preview);
        
        // Check if we have images in preview (for incremental uploads) or in file input
        const previewImages = preview ? preview.querySelectorAll('.image-preview-item img') : [];
        const hasPreviewImages = previewImages.length > 0;
        const hasFileInputImages = fileInput?.files && fileInput.files.length > 0;
        
        if (!hasPreviewImages && !hasFileInputImages) {
            console.log('❌ Validation failed: no images selected');
            Utils.showToast('Vui lòng chọn ít nhất một ảnh', 'error');
            return;
        }
        
        console.log('✅ Validation passed, proceeding with upload...');
        console.log('📸 Preview images count:', previewImages.length);
        console.log('📸 File input images count:', fileInput?.files?.length || 0);

        try {
            Utils.showLoading(true);
            
            let mainImageUrl;
            let additionalImages = [];
            
            if (hasPreviewImages) {
                // Use images from preview (for incremental uploads)
                console.log('📸 Using images from preview for upload...');
                
                // Convert preview images to files for upload
                const imagePromises = Array.from(previewImages).map(async (img, index) => {
                    try {
                        // Convert data URL to blob/file
                        const response = await fetch(img.src);
                        const blob = await response.blob();
                        const file = new File([blob], `image-${index + 1}.jpg`, { type: blob.type });
                        
                        if (index === 0) {
                            // Main image
                            console.log('📸 Uploading main image from preview:', file.name);
                            mainImageUrl = await this.uploadImage(file, 'main');
                            console.log('✅ Main image uploaded:', mainImageUrl);
                        } else {
                            // Additional image
                            console.log('📸 Uploading additional image from preview:', file.name);
                            const imageUrl = await this.uploadImage(file, `additional-${index}`);
                            additionalImages.push(imageUrl);
                            console.log('✅ Additional image uploaded:', imageUrl);
                        }
                    } catch (error) {
                        console.error('❌ Error processing preview image:', error);
                        throw error;
                    }
                });
                
                await Promise.all(imagePromises);
                
            } else {
                // Use images from file input (for bulk uploads)
                console.log('📸 Using images from file input for upload...');
                
                // Upload main image
                const mainFile = fileInput.files[0];
                console.log('📸 Uploading main image:', mainFile.name);
                mainImageUrl = await this.uploadImage(mainFile, 'main');
                console.log('✅ Main image uploaded:', mainImageUrl);
                
                // Upload additional images
                for (let i = 1; i < fileInput.files.length && i < CONFIG.gallery.maxFiles; i++) {
                    console.log('📸 Uploading additional image:', fileInput.files[i].name);
                    const imageUrl = await this.uploadImage(fileInput.files[i], `additional-${i}`);
                    additionalImages.push(imageUrl);
                    console.log('✅ Additional image uploaded:', imageUrl);
                }
            }

            // Parse tags and sizes
            const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
            const sizesArray = [sizeValue];

            // Prepare item data with values from form
            // Only include fields that exist in the current database schema
            const itemData = {
                title: title,
                story: story,
                image_url: mainImageUrl,
                gallery: additionalImages,
                tags: tagsArray,
                is_featured: featured,
                status: 'active',
                created_by: (await supabase.auth.getUser()).data.user?.id,
                published_at: new Date().toISOString()
            };
            
            // Add new fields if they exist in database
            // These will be ignored if columns don't exist yet
            const extendedData = {
                ...itemData,
                price: price,
                material: material,
                origin: origin,
                category: category,
                style: style,
                sizes: sizesArray,
                condition: condition
            };
            
            console.log('💾 Saving with extended fields:', extendedData);
            
            console.log('💾 Saving item to database:', extendedData);
            
            // Save to database
            const { data, error } = await supabase
                .from(TABLES.GALLERY_ITEMS)
                .insert([extendedData])
                .select();

            if (error) throw error;

            console.log('✅ Gallery item saved successfully to database');
            console.log('📊 Saved item data:', data);
            
            Utils.showToast('Đã lưu sản phẩm thành công!', 'success');
            this.closeUploadModal();
            
            console.log('💾 Product saved successfully, refreshing gallery...');
            
            // Refresh gallery properly - only call loadGalleryItems once
            console.log('🔄 Refreshing gallery after save...');
            await this.loadGalleryItems();
            console.log('✅ Gallery refreshed successfully');

        } catch (error) {
            console.error('❌ Error saving gallery item:', error);
            console.log('🔍 Error details:', {
                message: error.message,
                stack: error.stack,
                data: error
            });
            Utils.showToast('Có lỗi xảy ra khi lưu sản phẩm: ' + error.message, 'error');
        } finally {
            Utils.showLoading(false);
        }
    }

    async uploadImage(file, prefix = '') {
        console.log('📤 Starting image upload...');
        console.log('📁 File details:', {
            name: file.name,
            type: file.type,
            size: file.size,
            prefix: prefix
        });
        
        // Validate file
        if (!CONFIG.gallery.allowedTypes.includes(file.type)) {
            console.log('❌ File type not allowed:', file.type);
            throw new Error(`Định dạng file không hỗ trợ: ${file.type}`);
        }
        
        if (file.size > CONFIG.gallery.maxFileSize) {
            console.log('❌ File too large:', file.size, '>', CONFIG.gallery.maxFileSize);
            throw new Error(`File quá lớn. Tối đa ${CONFIG.gallery.maxFileSize / 1024 / 1024}MB`);
        }
        
        console.log('✅ File validation passed');

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const fileName = `${prefix}-${timestamp}-${randomStr}.${extension}`;
        const filePath = `gallery/${fileName}`;
        
        console.log('📝 Generated file path:', filePath);

        // Upload to Supabase Storage
        console.log('☁️ Uploading to Supabase Storage...');
        const { data, error } = await supabase.storage
            .from(CONFIG.storage.buckets.gallery)
            .upload(filePath, file);

        if (error) {
            console.error('❌ Upload error:', error);
            throw new Error(`Lỗi upload ảnh: ${error.message}`);
        }
        
        console.log('✅ Upload successful, getting public URL...');

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(CONFIG.storage.buckets.gallery)
            .getPublicUrl(filePath);
        
        console.log('🔗 Public URL generated:', publicUrl);
        return publicUrl;
    }

    // Product management methods
    editProduct(itemId) {
        console.log('✏️ Editing product:', itemId);
        console.log('📊 Current gallery items count:', this.galleryItems?.length || 0);
        
        // All products can be edited - no more sample product restrictions
        console.log('✅ Product can be edited');
        
        // Find product in real data only
        let product = null;
        if (this.galleryItems && this.galleryItems.length > 0) {
            console.log('🔍 Searching for product in gallery items...');
            product = this.galleryItems.find(item => item.id == itemId);
            console.log('🔍 Product found:', !!product);
        } else {
            console.log('⚠️ No gallery items available');
        }
        
        if (!product) {
            console.log('❌ Product not found for editing');
            Utils.showToast('Không tìm thấy sản phẩm để chỉnh sửa', 'error');
            return;
        }
        
        console.log('✅ Product found, showing edit modal...');
        this.showEditModal(product);
    }

    deleteProduct(itemId) {
        console.log('🗑️ Deleting product:', itemId);
        console.log('📊 Current gallery items count:', this.galleryItems?.length || 0);
        
        // Create a more detailed confirmation modal
        const confirmDelete = this.showDeleteConfirmation(itemId);
        if (!confirmDelete) {
            console.log('❌ Delete cancelled by user');
            return;
        }
        
        console.log('✅ Delete confirmed by user');
    }

    showDeleteConfirmation(itemId) {
        console.log('🗑️ Showing delete confirmation for item:', itemId);
        
        // Find product for confirmation
        let product = null;
        if (this.galleryItems && this.galleryItems.length > 0) {
            console.log('🔍 Searching in gallery items...');
            product = this.galleryItems.find(item => item.id == itemId);
            console.log('🔍 Product found in gallery items:', !!product);
        } else {
            console.log('⚠️ No gallery items, searching in sample products...');
            const sampleProducts = this.getSampleProducts();
            product = sampleProducts.find(item => item.id == itemId);
            console.log('🔍 Product found in sample products:', !!product);
        }

        const productName = product ? product.title : 'sản phẩm này';
        console.log('📝 Product name for confirmation:', productName);
        
        const confirmModal = `
            <div id="delete-confirmation-modal" class="modal gallery-modal">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>⚠️ Xác nhận xóa sản phẩm</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body" style="text-align: center; padding: 30px;">
                        <div class="delete-warning">
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;"></i>
                            <p style="font-size: 1.1rem; margin-bottom: 15px;">
                                Bạn có chắc chắn muốn xóa sản phẩm:
                            </p>
                            <p style="font-weight: 600; color: var(--primary-green); font-size: 1.2rem; margin-bottom: 20px;">
                                "${productName}"
                            </p>
                            <p style="color: var(--text-light); font-size: 0.9rem;">
                                Hành động này không thể hoàn tác!
                            </p>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                            Hủy
                        </button>
                        <button type="button" class="btn btn-danger" onclick="collectionGallery.confirmDelete('${itemId}')">
                            <i class="fas fa-trash"></i>
                            Xóa sản phẩm
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        console.log('📝 Inserting delete confirmation modal...');
        document.body.insertAdjacentHTML('beforeend', confirmModal);
        
        const modal = document.getElementById('delete-confirmation-modal');
        if (modal) {
            modal.classList.add('show');
            console.log('✅ Delete confirmation modal shown');
        } else {
            console.log('❌ Delete confirmation modal not found after insertion!');
        }
    }

    async confirmDelete(itemId) {
        console.log('🗑️ Confirming delete for item:', itemId);
        console.log('📊 Current gallery items count:', this.galleryItems?.length || 0);
        
        try {
            Utils.showLoading(true);
            
            // All products can be deleted - no more sample product restrictions
            console.log('✅ Product can be deleted');
            
            // Remove from database if available
            if (typeof supabase !== 'undefined' && TABLES && TABLES.GALLERY_ITEMS) {
                console.log('🗄️ Database available, deleting from database...');
                const { error } = await supabase
                    .from(TABLES.GALLERY_ITEMS)
                    .delete()
                    .eq('id', itemId);
                    
                if (error) {
                    console.error('❌ Database delete error:', error);
                    throw error;
                }
                
                console.log('✅ Database delete successful');
                
                // Remove from local array
                this.galleryItems = this.galleryItems.filter(item => item.id != itemId);
                console.log('📊 Local array updated, new count:', this.galleryItems.length);
                
                Utils.showToast('✅ Đã xóa sản phẩm thành công!', 'success');
            } else {
                console.log('❌ Database not available for delete');
                Utils.showToast('❌ Không thể kết nối database để xóa sản phẩm', 'error');
            }
            
            // Close modal
            document.getElementById('delete-confirmation-modal').remove();
            console.log('✅ Delete confirmation modal closed');
            
            // Refresh gallery
            console.log('🔄 Refreshing gallery after delete...');
            this.refreshGallery();
            
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            Utils.showToast('❌ Có lỗi xảy ra khi xóa sản phẩm: ' + error.message, 'error');
        } finally {
            Utils.showLoading(false);
            console.log('🔄 Loading state cleared');
        }
    }

    showEditModal(product) {
        console.log('📝 Showing edit modal for:', product.title);
        console.log('📊 Product data:', product);
        
        // Ensure sizes is array
        const sizes = Array.isArray(product.sizes) ? product.sizes : [];
        const currentSize = sizes[0] || 'M';
        console.log('📏 Sizes for edit:', sizes, '->', currentSize);
        
        const modalHTML = `
            <div id="edit-product-modal" class="modal gallery-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>✏️ Chỉnh Sửa Sản Phẩm</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form class="upload-form" id="edit-product-form">
                            <!-- Current Image Display -->
                            <div class="current-image-section" style="margin-bottom: 25px;">
                                <label style="display: block; margin-bottom: 12px; font-weight: 600; color: var(--primary-green);">Ảnh hiện tại:</label>
                                <div class="current-image-preview" style="width: 150px; height: 200px; border-radius: 12px; overflow: hidden; border: 2px solid var(--border-light); background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                                    ${product.image_url || product.image ? 
                                        `<img src="${product.image_url || product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
                                        `<div style="text-align: center; color: #6c757d;">
                                            <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 8px; display: block;"></i>
                                            <span style="font-size: 0.8rem;">Không có ảnh</span>
                                        </div>`
                                    }
                                </div>
                                <p style="font-size: 0.9rem; color: var(--text-light); margin-top: 8px;">
                                    <i class="fas fa-info-circle"></i> 
                                    Upload ảnh mới bên dưới để thay đổi (tùy chọn)
                                </p>
                            </div>
                            
                            <!-- Image Upload Area (Optional) -->
                            <div class="upload-area">
                                <div class="upload-zone" id="edit-upload-zone">
                                    <i class="fas fa-image"></i>
                                    <h4>Thay đổi ảnh sản phẩm (tùy chọn)</h4>
                                    <p>Kéo thả ảnh mới vào đây hoặc click để chọn</p>
                                    <input type="file" id="edit-image-input" accept="image/*" hidden>
                                </div>
                                
                                <div class="image-preview" id="edit-image-preview"></div>
                            </div>
                            
                            <!-- Form Fields -->
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Tên sản phẩm *</label>
                                    <input type="text" id="edit-title" value="${product.title}" required>
                                </div>
                                <div class="form-group">
                                    <label>Loại sản phẩm *</label>
                                    <select id="edit-category" required>
                                        <option value="ao" ${product.category === 'ao' ? 'selected' : ''}>Áo</option>
                                        <option value="vay" ${product.category === 'vay' ? 'selected' : ''}>Váy</option>
                                        <option value="phu-kien" ${product.category === 'phu-kien' ? 'selected' : ''}>Phụ kiện</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Giá bán (₫) *</label>
                                    <input type="number" id="edit-price" value="${product.price}" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label>Giá gốc (₫)</label>
                                    <input type="number" id="edit-original-price" value="${product.originalPrice || ''}" min="0">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Size</label>
                                    <select id="edit-size">
                                        <option value="XS" ${currentSize === 'XS' ? 'selected' : ''}>XS</option>
                                        <option value="S" ${currentSize === 'S' ? 'selected' : ''}>S</option>
                                        <option value="M" ${currentSize === 'M' ? 'selected' : ''}>M</option>
                                        <option value="L" ${currentSize === 'L' ? 'selected' : ''}>L</option>
                                        <option value="XL" ${currentSize === 'XL' ? 'selected' : ''}>XL</option>
                                        <option value="XXL" ${currentSize === 'XXL' ? 'selected' : ''}>XXL</option>
                                        <option value="Freesize" ${currentSize === 'Freesize' ? 'selected' : ''}>Freesize</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Phong cách</label>
                                    <select id="edit-style">
                                        <option value="vintage" ${product.style === 'vintage' ? 'selected' : ''}>Vintage</option>
                                        <option value="basic" ${product.style === 'basic' ? 'selected' : ''}>Basic</option>
                                        <option value="doc-ban" ${product.style === 'doc-ban' ? 'selected' : ''}>Độc bản</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Chất liệu *</label>
                                <input type="text" id="edit-material" value="${product.material}" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Nguồn gốc tái chế *</label>
                                <textarea id="edit-origin" rows="3" required>${product.origin}</textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Tình trạng</label>
                                    <input type="text" id="edit-condition" value="${product.condition}">
                                </div>
                                <div class="form-group">
                                    <label style="display: flex; align-items: center; gap: 10px;">
                                        <input type="checkbox" id="edit-featured" ${product.featured ? 'checked' : ''}>
                                        <span>✨ Đặt làm nổi bật</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                            Hủy
                        </button>
                        <button type="button" class="btn btn-primary" onclick="collectionGallery.saveEditedProduct('${product.id}')">
                            <i class="fas fa-save"></i>
                            Cập nhật sản phẩm
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        console.log('📝 Inserting edit modal...');
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = document.getElementById('edit-product-modal');
        if (modal) {
            modal.classList.add('show');
            console.log('✅ Edit modal shown successfully');
            
            // Setup drag and drop for new image upload
            this.setupEditImageUpload();
        } else {
            console.log('❌ Edit modal not found after insertion!');
        }

        // Native checkbox already handles featured selection; no extra JS needed
    }

    setupEditImageUpload() {
        console.log('🔧 Setting up edit image upload...');
        
        const uploadZone = document.getElementById('edit-upload-zone');
        const fileInput = document.getElementById('edit-image-input');
        
        console.log('🔍 Edit upload zone found:', !!uploadZone);
        console.log('🔍 Edit file input found:', !!fileInput);
        
        if (!uploadZone || !fileInput) {
            console.log('❌ Missing required elements for edit image upload');
            return;
        }
        
        uploadZone.addEventListener('click', () => fileInput.click());
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
            console.log('📁 Edit drag over detected');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
            console.log('📁 Edit drag leave detected');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            console.log('📁 Edit drop detected with', e.dataTransfer.files.length, 'files');
            this.handleEditImageUpload(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', (e) => {
            console.log('📁 Edit file input change detected with', e.target.files.length, 'files');
            this.handleEditImageUpload(e.target.files);
        });
    }

    handleEditImageUpload(files) {
        console.log('📁 Handling edit image upload...');
        console.log('📸 Files to upload:', files?.length || 0);
        
        const preview = document.getElementById('edit-image-preview');
        console.log('🖼️ Edit preview element found:', !!preview);
        
        if (!preview) {
            console.log('❌ Edit preview element not found');
            return;
        }
        
        // Check if this is a single file upload (additive) or multiple file upload (replace)
        const isSingleFileUpload = files.length === 1;
        const existingImages = preview.querySelectorAll('.image-preview-item');
        
        // If it's a single file upload and we already have images, add to existing
        // If it's multiple files or first upload, clear and replace
        if (isSingleFileUpload && existingImages.length > 0) {
            console.log('📸 Edit: Single file upload detected, adding to existing images...');
            // Don't clear preview, just add new image
        } else {
            console.log('📸 Edit: Multiple files or first upload detected, clearing preview...');
            preview.innerHTML = '';
        }
        
        Array.from(files).forEach((file, index) => {
            console.log('📸 Processing edit file', index + 1, ':', file.name, file.type);
            
            if (file.type.startsWith('image/')) {
                console.log('✅ Edit file is an image, creating preview...');
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log('📖 Edit file read successfully, creating preview container...');
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'image-preview-item';
                    imageContainer.innerHTML = `
                        <img src="${e.target.result}" alt="New preview ${existingImages.length + index + 1}">
                        <button class="remove-image" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    preview.appendChild(imageContainer);
                    console.log('✅ Edit preview container added for file', index + 1);
                };
                reader.readAsDataURL(file);
            } else {
                console.log('❌ Edit file is not an image:', file.type);
            }
        });
    }

    async saveEditedProduct(productId) {
        console.log('💾 Starting to save edited product:', productId);
        
        try {
            Utils.showLoading(true);
            
            // Get form data
            const title = document.getElementById('edit-title').value.trim();
            const category = document.getElementById('edit-category').value;
            const price = parseInt(document.getElementById('edit-price').value);
            const originalPrice = document.getElementById('edit-original-price').value ? 
                parseInt(document.getElementById('edit-original-price').value) : null;
            const sizesInput = document.getElementById('edit-sizes').value.trim();
            const style = document.getElementById('edit-style').value;
            const material = document.getElementById('edit-material').value.trim();
            const origin = document.getElementById('edit-origin').value.trim();
            const condition = document.getElementById('edit-condition').value.trim();
            const featured = document.getElementById('edit-featured').checked;
            
            console.log('📝 Form data collected:', {
                title, category, price, originalPrice, sizesInput, style, material, origin, condition, featured
            });
            
            // Validation
            console.log('🔍 Validating form data...');
            if (!title || !category || !price || !material || !origin) {
                console.log('❌ Validation failed:', { title: !!title, category: !!category, price: !!price, material: !!material, origin: !!origin });
                Utils.showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
                return;
            }
            
            console.log('✅ Validation passed');
            
            // Parse sizes
            const sizes = [document.getElementById('edit-size').value];
            console.log('📏 Size selected:', sizes[0]);
            
            // Check if new image was uploaded
            const fileInput = document.getElementById('edit-image-input');
            console.log('📁 File input found:', !!fileInput);
            console.log('📸 Files selected:', fileInput?.files?.length || 0);
            
            let imageUrl = null;
            if (fileInput.files && fileInput.files.length > 0) {
                console.log('📸 New image detected, uploading...');
                imageUrl = await this.uploadImage(fileInput.files[0], 'edit');
                console.log('✅ New image uploaded:', imageUrl);
            } else {
                console.log('📸 No new image uploaded, keeping existing');
            }
            
            const updatedData = {
                title,
                category,
                price,
                originalPrice,
                sizes,
                style,
                material,
                origin,
                condition,
                featured,
                updated_at: new Date().toISOString()
            };
            
            console.log('📝 Updated data prepared:', updatedData);
            
            if (imageUrl) {
                updatedData.image_url = imageUrl;
                console.log('🖼️ Image URL added to update data');
            }
            
            // Update in database if available
            if (typeof supabase !== 'undefined' && TABLES && TABLES.GALLERY_ITEMS) {
                console.log('🗄️ Database available, updating product...');
                const { error } = await supabase
                    .from(TABLES.GALLERY_ITEMS)
                    .update(updatedData)
                    .eq('id', productId);
                    
                if (error) {
                    console.error('❌ Database update error:', error);
                    throw error;
                }
                
                console.log('✅ Database update successful');
                
                // Update local array
                const itemIndex = this.galleryItems.findIndex(item => item.id == productId);
                if (itemIndex !== -1) {
                    this.galleryItems[itemIndex] = { ...this.galleryItems[itemIndex], ...updatedData };
                    console.log('📊 Local array updated at index:', itemIndex);
                } else {
                    console.log('⚠️ Product not found in local array for update');
                }
            } else {
                console.log('🚫 Database not available - changes will not persist');
            }
            
            // Close modal
            document.getElementById('edit-product-modal').remove();
            console.log('✅ Edit modal closed');
            
            // Refresh gallery
            console.log('🔄 Refreshing gallery after edit...');
            this.refreshGallery();
            
            Utils.showToast('✅ Đã cập nhật sản phẩm thành công!', 'success');
            
        } catch (error) {
            console.error('❌ Error updating product:', error);
            Utils.showToast('❌ Có lỗi xảy ra khi cập nhật: ' + error.message, 'error');
        } finally {
            Utils.showLoading(false);
            console.log('🔄 Loading state cleared');
        }
    }

    showProductDetail(itemId) {
        console.log('👁️ Showing product detail for item:', itemId);
        console.log('📊 Current gallery items count:', this.galleryItems?.length || 0);
        
        // Find the product
        const product = this.galleryItems?.find(item => item.id == itemId);
        if (!product) {
            console.log('⚠️ Product not found for detail view');
            Utils.showToast('Không tìm thấy sản phẩm', 'error');
            return;
        }
        console.log('✅ Product found for detail view:', product.title);

        // Remove existing modal if any
        const existing = document.getElementById('collection-product-detail-modal');
        if (existing) existing.remove();

        // Create and insert modal
        const modalHTML = this.createProductDetailModal(product);
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialize modal interactions
        this.initProductDetailModal(product.id);

        // Fire-and-forget: increase view count in DB
        try {
            if (typeof supabase !== 'undefined' && TABLES?.GALLERY_ITEMS) {
                const currentViews = parseInt(product.views || 0) + 1;
                product.views = currentViews;
                supabase.from(TABLES.GALLERY_ITEMS).update({ views: currentViews }).eq('id', product.id);
            }
        } catch (e) {
            console.log('ℹ️ Skip updating views:', e?.message);
        }
    }

    createProductDetailModal(product) {
        const price = product.price || 0;
        const priceFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
        const sizes = Array.isArray(product.sizes) ? product.sizes : (typeof product.sizes === 'string' ? (()=>{ try { const arr = JSON.parse(product.sizes); return Array.isArray(arr)?arr:product.sizes.split(',').map(s=>s.trim()).filter(Boolean);} catch { return product.sizes.split(',').map(s=>s.trim()).filter(Boolean);} })() : []);
        const material = product.material || 'Chưa cập nhật';
        const origin = product.origin || product.story || 'Chưa có thông tin nguồn gốc';
        const condition = product.condition || 'Tái chế';
        const category = product.category || 'khac';
        const style = product.style || 'basic';
        const imagesRaw = [product.image_url || product.image, ...((Array.isArray(product.gallery) ? product.gallery : []) || [])]
            .filter(v => typeof v === 'string' && v.trim().length > 0)
            .map(v => v.trim());
        const images = Array.from(new Set(imagesRaw));
        const mainImg = images[0] || 'https://via.placeholder.com/600x800?text=No+Image';

        return `
            <div id="collection-product-detail-modal" class="modal product-detail-modal">
                <div class="modal-content product-detail-content">
                    <div class="modal-header">
                        <h3>${product.title || 'Chi tiết sản phẩm'}</h3>
                        <button class="close-btn" aria-label="Đóng">&times;</button>
                    </div>
                    <div class="product-detail-body">
                        <div class="product-images-section">
                            <div class="main-image-container">
                                <img src="${mainImg}" alt="${product.title || ''}" class="main-product-image" id="main-product-image">
                                <span class="detail-condition-badge">${condition}</span>
                            </div>
                            <div class="thumbnail-gallery">
                                ${images.map((img, idx) => `<img src="${img}" alt="${product.title || ''} ${idx+1}" class="thumbnail ${idx===0 ? 'active' : ''}" data-src="${img}">`).join('')}
                            </div>
                        </div>
                        <div class="product-info-section">
                            <div class="product-meta-detail">
                                <div class="meta-item"><strong>Giá bán:</strong> ${priceFormatted}</div>
                                <div class="meta-item"><strong>Danh mục:</strong> ${category}</div>
                                <div class="meta-item"><strong>Phong cách:</strong> ${style}</div>
                                <div class="meta-item"><strong>Chất liệu:</strong> ${material}</div>
                                <div class="meta-item"><strong>Size:</strong> ${sizes.length? sizes.join(', ') : 'OneSize'}</div>
                                <div class="meta-item"><strong>Tình trạng:</strong> ${condition}</div>
                                <div class="meta-item"><strong>Mã sản phẩm:</strong> ${product.id}</div>
                            </div>
                            <div class="product-description">
                                <h4>Câu chuyện/Nguồn gốc tái chế</h4>
                                <p>${origin}</p>
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

    initProductDetailModal(productId) {
        const modal = document.getElementById('collection-product-detail-modal');
        if (!modal) return;

        // Show modal
        modal.classList.add('show');

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Close on ESC
        const onEsc = (e) => { if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', onEsc); } };
        document.addEventListener('keydown', onEsc);

        // Close buttons
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());
        const closeBtn2 = modal.querySelector('.btn-close-modal');
        if (closeBtn2) closeBtn2.addEventListener('click', () => modal.remove());

        // Thumbnail switching
        const mainImage = modal.querySelector('#main-product-image');
        const thumbs = modal.querySelectorAll('.thumbnail');
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

        // Zoom main image
        if (mainImage) {
            mainImage.addEventListener('click', () => mainImage.classList.toggle('zoomed'));
        }
    }

    addToCart(itemId) {
        console.log('🛒 Adding item to cart:', itemId);
        console.log('📊 Current gallery items count:', this.galleryItems?.length || 0);
        
        // Find the product
        const product = this.galleryItems?.find(item => item.id == itemId);
        if (product) {
            console.log('✅ Product found for cart:', product.title);
        } else {
            console.log('⚠️ Product not found for cart');
        }
        
        Utils.showToast('Đã thêm vào giỏ hàng!', 'success');
    }

    applyFilters() {
        console.log('🔍 Applying filters...');
        
        const getValues = (type) => {
            const selected = Array.from(document.querySelectorAll(`.filter-btn[data-type="${type}"].active`))
                .map(b => b.getAttribute('data-filter'))
                .filter(v => v && v !== 'all');
            return selected.length ? selected : ['all'];
        };
        const activeFilters = {
            category: getValues('category'),
            style: getValues('style'),
            price: getValues('price'),
            size: getValues('size')
        };
        
        console.log('🎯 Active filters:', activeFilters);

        const products = document.querySelectorAll('.product-item');
        console.log('📦 Found', products.length, 'products to filter');
        
        products.forEach(product => {
            let show = true;
            
            // Filter by category (multi)
            if (!(activeFilters.category.length === 1 && activeFilters.category[0] === 'all')) {
                const productCategory = product.getAttribute('data-category');
                if (!activeFilters.category.includes(productCategory)) show = false;
            }
            
            // Filter by style (multi)
            if (show && !(activeFilters.style.length === 1 && activeFilters.style[0] === 'all')) {
                const productStyle = product.getAttribute('data-style');
                if (!activeFilters.style.includes(productStyle)) show = false;
            }
            
            // Filter by price (multi)
            if (show && !(activeFilters.price.length === 1 && activeFilters.price[0] === 'all')) {
                const productPrice = parseInt(product.getAttribute('data-price'));
                const checkRange = (key) => {
                    switch (key) {
                        case 'under-500k': return productPrice < 500000;
                        case '500k-1m': return productPrice >= 500000 && productPrice <= 1000000;
                        case 'over-1m': return productPrice > 1000000;
                        default: return true;
                    }
                };
                const anyMatch = activeFilters.price.some(k => checkRange(k));
                if (!anyMatch) show = false;
            }
            
            // Filter by size (multi)
            if (show && !(activeFilters.size.length === 1 && activeFilters.size[0] === 'all')) {
                const productSizes = (product.getAttribute('data-sizes') || '').split(',');
                const anySize = activeFilters.size.some(sz => productSizes.includes(sz));
                if (!anySize) show = false;
            }
            
            product.style.display = show ? 'block' : 'none';
        });
        
        console.log('✅ Filters applied successfully');
        console.log('🎯 Active filters:', activeFilters);
    }

    // Legacy methods for backward compatibility
    editGalleryItem(itemId) {
        this.editProduct(itemId);
    }

    deleteGalleryItem(itemId) {
        this.deleteProduct(itemId);
    }

    viewGalleryDetail(itemId) {
        this.showProductDetail(itemId);
    }

    refreshGallery() {
        const grid = document.getElementById('product-grid') || document.getElementById('gallery-grid');
        if (grid) {
            grid.innerHTML = this.generateGalleryItemsFromData();
            console.log('🔄 Gallery refreshed with', this.galleryItems.length, 'items');
        }
        
        // Update gallery stats after refresh
        this.updateGalleryStats();
    }

    clearAllSampleData() {
        console.log('🧹 Starting to clear sample data...');
        console.log('📊 Original gallery items count:', this.galleryItems?.length || 0);
        
        // No more sample data restrictions - all items are real
        console.log('✅ All items are real products');
        console.log('📊 Gallery items before refresh:', this.galleryItems);
        
        this.refreshGallery();
        console.log('🧹 Sample data check completed, remaining items:', this.galleryItems.length);
        console.log('📊 Gallery items after refresh:', this.galleryItems);
        
        // Update gallery stats after clearing sample data
        this.updateGalleryStats();
    }

    async loadGalleryItems() {
        console.log('🔄 Starting to load gallery items...');
        console.log('🔍 Supabase available:', typeof supabase !== 'undefined');
        console.log('📋 TABLES available:', !!TABLES);
        console.log('🎨 GALLERY_ITEMS table:', TABLES?.GALLERY_ITEMS);
        
        try {
            // Check if supabase is available
            if (typeof supabase === 'undefined' || !TABLES || !TABLES.GALLERY_ITEMS) {
                console.log('🚫 Database not available - showing empty state');
                this.galleryItems = [];
                const grid = document.getElementById('product-grid') || document.getElementById('gallery-grid');
                if (grid) {
                    grid.innerHTML = this.generateGalleryItemsFromData();
                }
                return [];
            }

            console.log('🔍 Querying database for gallery items...');
            const { data, error } = await supabase
                .from(TABLES.GALLERY_ITEMS)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Database query error:', error);
                throw error;
            }

            this.galleryItems = data || [];
            console.log('📊 Loaded gallery items from database:', this.galleryItems.length);
            console.log('📋 Gallery items data:', this.galleryItems);
            
            // Debug: Check if items have required fields
            if (this.galleryItems.length > 0) {
                console.log('🔍 First item structure:', {
                    id: this.galleryItems[0].id,
                    title: this.galleryItems[0].title,
                    image_url: this.galleryItems[0].image_url,
                    created_at: this.galleryItems[0].created_at
                });
            }
            
            // Update UI if product grid exists
            const grid = document.getElementById('product-grid') || document.getElementById('gallery-grid');
            if (grid) {
                grid.innerHTML = this.generateGalleryItemsFromData();
                console.log('🎨 UI updated with', this.galleryItems.length, 'items');
            }
            
            // Update gallery stats
            this.updateGalleryStats();
            
            // Return the loaded items
            return this.galleryItems;
        } catch (error) {
            console.error('❌ Error loading gallery items:', error);
            console.log('🚫 Database unavailable - showing empty state');
            
            // Show empty state instead of sample data
            this.galleryItems = [];
            const grid = document.getElementById('product-grid') || document.getElementById('gallery-grid');
            if (grid) {
                grid.innerHTML = this.generateGalleryItemsFromData();
                console.log('🎨 UI updated with empty state');
            }
            
            return [];
        }
    }

    // Add method to refresh gallery when page becomes active
    async refreshGalleryOnPageActive() {
        console.log('🔄 Refreshing gallery on page active...');
        if (this.galleryItems.length === 0) {
            console.log('📊 No gallery items found, reloading from database...');
            await this.loadGalleryItems();
        } else {
            console.log('📊 Gallery items already loaded, refreshing display...');
            this.updateGalleryUI();
        }
        
        // Update gallery stats
        this.updateGalleryStats();
    }

    // New method to update gallery UI consistently
    updateGalleryUI() {
        console.log('🎨 Updating gallery UI with', this.galleryItems.length, 'items');
        
        // Try to find the gallery grid in multiple possible locations
        const galleryGrid = document.getElementById('gallery-grid') || 
                           document.getElementById('product-grid') || 
                           document.querySelector('.gallery-grid');
        
        if (galleryGrid) {
            galleryGrid.innerHTML = this.generateGalleryItemsFromData();
            console.log('✅ Gallery UI updated successfully');
        } else {
            console.log('⚠️ Gallery grid not found, UI update skipped');
        }
        
        // Update gallery stats
        this.updateGalleryStats();
    }

    // Add method to update gallery statistics
    updateGalleryStats() {
        console.log('📊 Updating gallery stats...');
        
        const totalItemsElement = document.getElementById('total-items');
        const featuredItemsElement = document.getElementById('featured-items');
        
        if (totalItemsElement) {
            totalItemsElement.textContent = this.galleryItems.length;
            console.log('✅ Total items updated:', this.galleryItems.length);
        }
        
        if (featuredItemsElement) {
            const featuredCount = this.galleryItems.filter(item => 
                item.is_featured || item.featured
            ).length;
            featuredItemsElement.textContent = featuredCount;
            console.log('✅ Featured items updated:', featuredCount);
        }
        
        console.log('📊 Gallery stats updated successfully');
    }
}

// Initialize
window.collectionGallery = new CollectionGallery();