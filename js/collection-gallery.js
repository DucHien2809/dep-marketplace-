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
        await this.loadGalleryItems();
    }

    bindEvents() {
        console.log('🔗 Binding CollectionGallery events...');
        
        // Product management buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'upload-product-btn' || e.target.closest('#upload-product-btn')) {
                e.preventDefault();
                console.log('📸 Upload product button clicked via CollectionGallery');
                this.showUploadModal();
            }
            
            if (e.target.id === 'manage-products-btn' || e.target.closest('#manage-products-btn')) {
                e.preventDefault();
                console.log('⚙️ Manage products clicked!');
                Utils.showToast('Quản lý sản phẩm đang phát triển', 'info');
            }
            
            if (e.target.closest('.btn-edit-product')) {
                e.preventDefault();
                const itemId = e.target.closest('.product-item').getAttribute('data-item-id');
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
            
            if (e.target.closest('.btn-add-cart')) {
                e.preventDefault();
                const itemId = e.target.closest('.product-item').getAttribute('data-item-id');
                this.addToCart(itemId);
            }
            
            // Product filters
            if (e.target.closest('.filter-btn')) {
                e.preventDefault();
                const filterBtn = e.target.closest('.filter-btn');
                const filterType = filterBtn.getAttribute('data-type');
                const filterValue = filterBtn.getAttribute('data-filter');
                
                // Remove active from same type filters
                document.querySelectorAll(`.filter-btn[data-type="${filterType}"]`)
                    .forEach(btn => btn.classList.remove('active'));
                
                // Add active to clicked filter
                filterBtn.classList.add('active');
                
                this.applyFilters();
            }
        });

        // File input change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'gallery-image-input') {
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
        
        if (window.Utils) {
            Utils.showToast(`Lọc theo: ${filter === 'all' ? 'Tất cả' : filter}`, 'info');
        }
    }

    createGalleryPage() {
        return `
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
                                <span class="stat-number" id="total-items">12</span>
                                <span class="stat-label">Tổng tác phẩm</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number" id="featured-items">5</span>
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
                            ${this.generateProductItems()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateProductItems() {
        const sampleProducts = [
            {
                id: 1,
                title: "Áo Sơ Mi Linen Vintage",
                image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
                price: 750000,
                originalPrice: 950000,
                category: "ao",
                style: "vintage",
                sizes: ["S", "M", "L"],
                material: "Linen, Ren Pháp",
                origin: "Tái sinh từ áo sơ mi linen thập niên 80, kết hợp với ren vintage từ Pháp",
                condition: "Như mới",
                featured: true,
                views: 245,
                sold: false,
                created: "2024-01-15"
            },
            {
                id: 2,
                title: "Váy Midi Bohemian",
                image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
                price: 890000,
                originalPrice: null,
                category: "vay",
                style: "doc-ban",
                sizes: ["M", "L"],
                material: "Cotton Organic, Thêu tay",
                origin: "Từ những mảnh vải cotton organic còn sót lại, tạo nên tác phẩm nghệ thuật mới",
                condition: "Độc bản",
                featured: true,
                views: 189,
                sold: false,
                created: "2024-01-14"
            },
            {
                id: 3,
                title: "Túi Tote Canvas Eco",
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
                price: 320000,
                originalPrice: 450000,
                category: "phu-kien",
                style: "basic",
                sizes: ["OneSize"],
                material: "Canvas tái chế",
                origin: "Canvas tái chế từ bao bì cũ, thiết kế tối giản nhưng đầy tinh tế",
                condition: "Tái chế",
                featured: false,
                views: 156,
                sold: false,
                created: "2024-01-12"
            },
            {
                id: 4,
                title: "Áo Khoác Denim Upcycled",
                image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=500&fit=crop",
                price: 1200000,
                originalPrice: 1450000,
                category: "ao",
                style: "basic",
                sizes: ["S", "M", "L", "XL"],
                material: "Denim cotton, Kim loại",
                origin: "Biến hóa từ áo khoác denim cũ thành tác phẩm streetwear hiện đại",
                condition: "Upcycled",
                featured: true,
                views: 312,
                sold: false,
                created: "2024-01-10"
            },
            {
                id: 5,
                title: "Váy Cocktail Retro",
                image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop",
                price: 1500000,
                originalPrice: null,
                category: "vay",
                style: "vintage",
                sizes: ["S", "M"],
                material: "Lụa, Ren Pháp",
                origin: "Phục hồi từ váy cocktail thập niên 60, giữ nguyên vẻ đẹp cổ điển",
                condition: "Vintage authentic",
                featured: false,
                views: 203,
                sold: false,
                created: "2024-01-08"
            },
            {
                id: 6,
                title: "Áo Blouse Thêu Tay",
                image: "https://images.unsplash.com/photo-1583743814966-8936f37f631b?w=400&h=500&fit=crop",
                price: 680000,
                originalPrice: 850000,
                category: "ao",
                style: "doc-ban",
                sizes: ["S", "M", "L"],
                material: "Lụa Vintage, Thêu tay VN",
                origin: "Kết hợp vải lụa vintage với thêu tay truyền thống Việt Nam",
                condition: "Thủ công",
                featured: true,
                views: 278,
                sold: false,
                created: "2024-01-05"
            },
            {
                id: 7,
                title: "Khăn Choàng Silk Upcycled",
                image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=500&fit=crop",
                price: 420000,
                originalPrice: 600000,
                category: "phu-kien",
                style: "vintage",
                sizes: ["OneSize"],
                material: "Silk tái chế, Viền thêu",
                origin: "Từ những mảnh silk vintage được tái tạo thành khăn choàng thời trang",
                condition: "Tái chế",
                featured: false,
                views: 134,
                sold: false,
                created: "2024-01-03"
            },
            {
                id: 8,
                title: "Áo Len Oversized Vintage",
                image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop",
                price: 950000,
                originalPrice: null,
                category: "ao",
                style: "vintage",
                sizes: ["M", "L", "XL"],
                material: "Wool blend, Cotton",
                origin: "Áo len vintage được phục hồi và tái tạo với form dáng hiện đại",
                condition: "Vintage restored",
                featured: true,
                views: 298,
                sold: false,
                created: "2024-01-01"
            }
        ];

        return sampleProducts.map(item => this.renderProductItem(item)).join('');
    }

    generateGalleryItemsFromData() {
        if (!this.galleryItems || this.galleryItems.length === 0) {
            return '<div class="no-items">Chưa có tác phẩm nào</div>';
        }
        return this.galleryItems.map(item => this.renderGalleryItem(item)).join('');
    }

    renderProductItem(item) {
        const isDbItem = !!item.created_at;
        const viewCount = item.views || 0;
        const createDate = isDbItem ? 
            new Date(item.created_at).toLocaleDateString('vi-VN') : 
            item.created;
        
        // Safety checks for properties
        const price = item.price || 0;
        const originalPrice = item.originalPrice || item.original_price || null;
        
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
        
        const material = item.material || item.chất_liệu || 'Chưa cập nhật';
        const origin = item.origin || item.nguồn_gốc || item.story || 'Chưa có thông tin nguồn gốc';
        const condition = item.condition || item.tình_trạng || 'Tái chế';
        const category = item.category || item.loại || 'khac';
        const style = item.style || item.phong_cách || 'basic';
        
        const priceFormatted = new Intl.NumberFormat('vi-VN').format(price);
        const originalPriceFormatted = originalPrice ? 
            new Intl.NumberFormat('vi-VN').format(originalPrice) : null;
        const discount = originalPrice ? 
            Math.round((1 - price / originalPrice) * 100) : 0;

        return `
            <div class="product-item ${item.is_featured || item.featured ? 'featured' : ''} ${item.sold ? 'sold' : ''}" 
                 data-item-id="${item.id}" 
                 data-category="${category}"
                 data-style="${style}"
                 data-price="${price}">
                <div class="product-image-container">
                    <img src="${item.image_url || item.image}" alt="${item.title || 'Sản phẩm'}" class="product-image">
                    
                    ${(item.is_featured || item.featured) ? '<span class="featured-badge">Nổi bật</span>' : ''}
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
                            Xem nhanh
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
    }
    
    // Keep the old function for backward compatibility
    renderGalleryItem(item) {
        return this.renderProductItem(item);
    }

    showUploadModal() {
        const modalHTML = `
            <div id="upload-gallery-modal" class="modal gallery-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Thêm Sản Phẩm Tái Chế Mới</h3>
                        <button class="close-btn" onclick="this.closest('.modal').remove()">
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
                                    <label>Tiêu đề tác phẩm *</label>
                                    <input type="text" id="item-title" placeholder="VD: Áo kiểu Vintage Renaissance" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Câu chuyện tái chế *</label>
                                <textarea id="item-story" placeholder="Kể về hành trình tái sinh của tác phẩm này..." rows="4" required></textarea>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Tags (phân cách bằng dấu phẩy)</label>
                                    <input type="text" id="item-tags" placeholder="vintage, renaissance, linen">
                                </div>
                                
                                <div class="form-group featured-checkbox-group">
                                    <label class="featured-checkbox-label">
                                        <input type="checkbox" id="item-featured" class="featured-checkbox">
                                        <span class="checkmark"></span>
                                        <span class="checkbox-text">✨ Đặt làm nổi bật</span>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Hủy</button>
                        <button type="button" class="btn btn-primary" onclick="collectionGallery.saveGalleryItem()">
                            <i class="fas fa-save"></i>
                            Lưu sản phẩm
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('upload-gallery-modal').classList.add('show');
        
        // Setup drag and drop
        this.setupImageUpload();
    }

    setupImageUpload() {
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('gallery-image-input');
        
        uploadZone.addEventListener('click', () => fileInput.click());
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleImageUpload(e.dataTransfer.files);
        });
    }

    handleImageUpload(files) {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'image-preview-item';
                    imageContainer.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <button class="remove-image" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    preview.appendChild(imageContainer);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    async saveGalleryItem() {
        const title = document.getElementById('item-title').value.trim();
        const story = document.getElementById('item-story').value.trim();
        const tags = document.getElementById('item-tags').value.trim();
        const featured = document.getElementById('item-featured').checked;
        
        // Validation
        if (!title || !story) {
            Utils.showToast('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        const fileInput = document.getElementById('gallery-image-input');
        if (!fileInput.files || fileInput.files.length === 0) {
            Utils.showToast('Vui lòng chọn ít nhất một ảnh', 'error');
            return;
        }

        try {
            Utils.showLoading(true);
            
            // Upload main image
            const mainFile = fileInput.files[0];
            const mainImageUrl = await this.uploadImage(mainFile, 'main');
            
            // Upload additional images
            const additionalImages = [];
            for (let i = 1; i < fileInput.files.length && i < CONFIG.gallery.maxFiles; i++) {
                const imageUrl = await this.uploadImage(fileInput.files[i], `additional-${i}`);
                additionalImages.push(imageUrl);
            }

            // Parse tags
            const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

            // Save to database
            const { data, error } = await supabase
                .from(TABLES.GALLERY_ITEMS)
                .insert([{
                    title: title,
                    story: story,
                    image_url: mainImageUrl,
                    gallery: additionalImages,
                    tags: tagsArray,
                    is_featured: featured,
                    status: 'active',
                    created_by: (await supabase.auth.getUser()).data.user?.id,
                    published_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;

            Utils.showToast('Đã lưu tác phẩm thành công!', 'success');
            document.getElementById('upload-gallery-modal').remove();
            
            // Refresh gallery
            await this.loadGalleryItems();
            this.refreshGallery();

        } catch (error) {
            console.error('Error saving gallery item:', error);
            Utils.showToast('Có lỗi xảy ra khi lưu tác phẩm: ' + error.message, 'error');
        } finally {
            Utils.showLoading(false);
        }
    }

    async uploadImage(file, prefix = '') {
        // Validate file
        if (!CONFIG.gallery.allowedTypes.includes(file.type)) {
            throw new Error(`Định dạng file không hỗ trợ: ${file.type}`);
        }
        
        if (file.size > CONFIG.gallery.maxFileSize) {
            throw new Error(`File quá lớn. Tối đa ${CONFIG.gallery.maxFileSize / 1024 / 1024}MB`);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const fileName = `${prefix}-${timestamp}-${randomStr}.${extension}`;
        const filePath = `gallery/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(CONFIG.storage.buckets.gallery)
            .upload(filePath, file);

        if (error) {
            throw new Error(`Lỗi upload ảnh: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(CONFIG.storage.buckets.gallery)
            .getPublicUrl(filePath);

        return publicUrl;
    }

    // Product management methods
    editProduct(itemId) {
        Utils.showToast('Chức năng chỉnh sửa sản phẩm đang phát triển', 'info');
    }

    deleteProduct(itemId) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            Utils.showToast('Đã xóa sản phẩm', 'success');
            this.refreshGallery();
        }
    }

    showProductDetail(itemId) {
        Utils.showToast('Modal chi tiết sản phẩm đang phát triển', 'info');
    }

    addToCart(itemId) {
        Utils.showToast('Đã thêm vào giỏ hàng!', 'success');
    }

    applyFilters() {
        const activeFilters = {
            category: document.querySelector('.filter-btn[data-type="category"].active')?.getAttribute('data-filter') || 'all',
            style: document.querySelector('.filter-btn[data-type="style"].active')?.getAttribute('data-filter') || 'all',
            price: document.querySelector('.filter-btn[data-type="price"].active')?.getAttribute('data-filter') || 'all'
        };

        const products = document.querySelectorAll('.product-item');
        
        products.forEach(product => {
            let show = true;
            
            // Filter by category
            if (activeFilters.category !== 'all') {
                const productCategory = product.getAttribute('data-category');
                if (productCategory !== activeFilters.category) {
                    show = false;
                }
            }
            
            // Filter by style
            if (activeFilters.style !== 'all') {
                const productStyle = product.getAttribute('data-style');
                if (productStyle !== activeFilters.style) {
                    show = false;
                }
            }
            
            // Filter by price
            if (activeFilters.price !== 'all') {
                const productPrice = parseInt(product.getAttribute('data-price'));
                let priceInRange = false;
                
                switch (activeFilters.price) {
                    case 'under-500k':
                        priceInRange = productPrice < 500000;
                        break;
                    case '500k-1m':
                        priceInRange = productPrice >= 500000 && productPrice <= 1000000;
                        break;
                    case 'over-1m':
                        priceInRange = productPrice > 1000000;
                        break;
                }
                
                if (!priceInRange) {
                    show = false;
                }
            }
            
            product.style.display = show ? 'block' : 'none';
        });
        
        console.log('Applied filters:', activeFilters);
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
            // Use real data if available, fallback to sample data
            if (this.galleryItems && this.galleryItems.length > 0) {
                grid.innerHTML = this.generateGalleryItemsFromData();
            } else {
                grid.innerHTML = this.generateProductItems();
            }
        }
    }

    async loadGalleryItems() {
        try {
            // Check if supabase is available
            if (typeof supabase === 'undefined' || !TABLES || !TABLES.GALLERY_ITEMS) {
                console.log('Database not available, using sample data');
                this.galleryItems = [];
                return [];
            }

            const { data, error } = await supabase
                .from(TABLES.GALLERY_ITEMS)
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.galleryItems = data || [];
            console.log('Loaded gallery items from database:', this.galleryItems.length);
            
            // Update UI if product grid exists
            const grid = document.getElementById('product-grid') || document.getElementById('gallery-grid');
            if (grid) {
                if (this.galleryItems.length > 0) {
                    grid.innerHTML = this.generateGalleryItemsFromData();
                } else {
                    grid.innerHTML = this.generateProductItems();
                }
            }
            
            return this.galleryItems;
        } catch (error) {
            console.error('Error loading gallery items:', error);
            console.log('Falling back to sample data');
            
            // Fallback to sample data
            this.galleryItems = [];
            const grid = document.getElementById('product-grid') || document.getElementById('gallery-grid');
            if (grid) {
                grid.innerHTML = this.generateProductItems();
            }
            
            return [];
        }
    }
}

// Initialize
window.collectionGallery = new CollectionGallery();