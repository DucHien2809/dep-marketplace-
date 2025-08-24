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
        
        // Clear any remaining sample data after loading
        setTimeout(() => {
            this.clearAllSampleData();
        }, 1000);
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
        
        // Toast notification removed as requested by user
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
                        <div class="product-grid" id="product-grid">
                            ${this.generateGalleryItemsFromData()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSampleProducts() {
        // Không còn sample products - để admin tự thêm
        return [];
    }

    generateProductItems() {
        return this.getSampleProducts().map(item => this.renderProductItem(item)).join('');
    }

    generateGalleryItemsFromData() {
        if (!this.galleryItems || this.galleryItems.length === 0) {
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
        return this.galleryItems.map(item => this.renderGalleryItem(item)).join('');
    }

    renderProductItem(item) {
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

            Utils.showToast('Đã lưu sản phẩm thành công!', 'success');
            document.getElementById('upload-gallery-modal').remove();
            
            // Refresh gallery
            await this.loadGalleryItems();
            this.refreshGallery();

        } catch (error) {
            console.error('Error saving gallery item:', error);
            Utils.showToast('Có lỗi xảy ra khi lưu sản phẩm: ' + error.message, 'error');
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
        console.log('✏️ Editing product:', itemId);
        
        // Check if this is a sample product (number ID vs UUID)  
        const isNumericId = !isNaN(parseInt(itemId)) && parseInt(itemId) < 1000;
        
        if (isNumericId) {
            Utils.showToast('❌ Không thể chỉnh sửa sản phẩm mẫu. Vui lòng thêm sản phẩm thật!', 'warning');
            return;
        }
        
        // Find product in real data only
        let product = null;
        if (this.galleryItems && this.galleryItems.length > 0) {
            product = this.galleryItems.find(item => item.id == itemId);
        }
        
        if (!product) {
            Utils.showToast('Không tìm thấy sản phẩm để chỉnh sửa', 'error');
            return;
        }
        
        this.showEditModal(product);
    }

    deleteProduct(itemId) {
        console.log('🗑️ Deleting product:', itemId);
        
        // Create a more detailed confirmation modal
        const confirmDelete = this.showDeleteConfirmation(itemId);
        if (!confirmDelete) return;
    }

    showDeleteConfirmation(itemId) {
        // Find product for confirmation
        let product = null;
        if (this.galleryItems && this.galleryItems.length > 0) {
            product = this.galleryItems.find(item => item.id == itemId);
        } else {
            const sampleProducts = this.getSampleProducts();
            product = sampleProducts.find(item => item.id == itemId);
        }

        const productName = product ? product.title : 'sản phẩm này';
        
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
        
        document.body.insertAdjacentHTML('beforeend', confirmModal);
        document.getElementById('delete-confirmation-modal').classList.add('show');
    }

    async confirmDelete(itemId) {
        try {
            Utils.showLoading(true);
            
            // Check if this is a sample product (number ID vs UUID)
            const isNumericId = !isNaN(parseInt(itemId)) && parseInt(itemId) < 1000;
            
            if (isNumericId) {
                // This is sample data - cannot delete from database
                console.log('Cannot delete sample product with numeric ID:', itemId);
                Utils.showToast('❌ Không thể xóa sản phẩm mẫu. Vui lòng thêm sản phẩm thật!', 'warning');
                document.getElementById('delete-confirmation-modal').remove();
                return;
            }
            
            // Remove from database if available and it's a real UUID
            if (typeof supabase !== 'undefined' && TABLES && TABLES.GALLERY_ITEMS) {
                const { error } = await supabase
                    .from(TABLES.GALLERY_ITEMS)
                    .delete()
                    .eq('id', itemId);
                    
                if (error) throw error;
                
                // Remove from local array
                this.galleryItems = this.galleryItems.filter(item => item.id != itemId);
                
                Utils.showToast('✅ Đã xóa sản phẩm thành công!', 'success');
            } else {
                Utils.showToast('❌ Không thể kết nối database để xóa sản phẩm', 'error');
            }
            
            // Close modal
            document.getElementById('delete-confirmation-modal').remove();
            
            // Refresh gallery
            this.refreshGallery();
            
        } catch (error) {
            console.error('Error deleting product:', error);
            Utils.showToast('❌ Có lỗi xảy ra khi xóa sản phẩm: ' + error.message, 'error');
        } finally {
            Utils.showLoading(false);
        }
    }

    showEditModal(product) {
        console.log('📝 Showing edit modal for:', product.title);
        
        // Ensure sizes is array
        const sizes = Array.isArray(product.sizes) ? product.sizes : [];
        const sizesString = sizes.join(', ');
        
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
                                <div class="current-image-preview" style="width: 150px; height: 200px; border-radius: 12px; overflow: hidden; border: 2px solid var(--border-light);">
                                    <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">
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
                                    <label>Sizes có sẵn</label>
                                    <input type="text" id="edit-sizes" value="${sizesString}" placeholder="S, M, L, XL">
                                    <small style="color: var(--text-light); font-size: 0.8rem;">Phân cách bằng dấu phẩy</small>
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
                                <div class="form-group featured-checkbox-group">
                                    <label class="featured-checkbox-label">
                                        <input type="checkbox" id="edit-featured" class="featured-checkbox" ${product.featured ? 'checked' : ''}>
                                        <span class="checkmark"></span>
                                        <span class="checkbox-text">✨ Đặt làm nổi bật</span>
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
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('edit-product-modal').classList.add('show');
        
        // Setup drag and drop for new image upload
        this.setupEditImageUpload();
    }

    setupEditImageUpload() {
        const uploadZone = document.getElementById('edit-upload-zone');
        const fileInput = document.getElementById('edit-image-input');
        
        if (!uploadZone || !fileInput) return;
        
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
            this.handleEditImageUpload(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleEditImageUpload(e.target.files);
        });
    }

    handleEditImageUpload(files) {
        const preview = document.getElementById('edit-image-preview');
        preview.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'image-preview-item';
                    imageContainer.innerHTML = `
                        <img src="${e.target.result}" alt="New preview ${index + 1}">
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

    async saveEditedProduct(productId) {
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
            
            // Validation
            if (!title || !category || !price || !material || !origin) {
                Utils.showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
                return;
            }
            
            // Parse sizes
            const sizes = sizesInput ? sizesInput.split(',').map(s => s.trim()).filter(s => s) : [];
            
            // Check if new image was uploaded
            const fileInput = document.getElementById('edit-image-input');
            let imageUrl = null;
            if (fileInput.files && fileInput.files.length > 0) {
                imageUrl = await this.uploadImage(fileInput.files[0], 'edit');
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
            
            if (imageUrl) {
                updatedData.image_url = imageUrl;
            }
            
            // Update in database if available
            if (typeof supabase !== 'undefined' && TABLES && TABLES.GALLERY_ITEMS) {
                const { error } = await supabase
                    .from(TABLES.GALLERY_ITEMS)
                    .update(updatedData)
                    .eq('id', productId);
                    
                if (error) throw error;
                
                // Update local array
                const itemIndex = this.galleryItems.findIndex(item => item.id == productId);
                if (itemIndex !== -1) {
                    this.galleryItems[itemIndex] = { ...this.galleryItems[itemIndex], ...updatedData };
                }
            } else {
                console.log('Sample data - changes will not persist');
            }
            
            // Close modal
            document.getElementById('edit-product-modal').remove();
            
            // Refresh gallery
            this.refreshGallery();
            
            Utils.showToast('✅ Đã cập nhật sản phẩm thành công!', 'success');
            
        } catch (error) {
            console.error('Error updating product:', error);
            Utils.showToast('❌ Có lỗi xảy ra khi cập nhật: ' + error.message, 'error');
        } finally {
            Utils.showLoading(false);
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
            // Always use real data or empty state
            grid.innerHTML = this.generateGalleryItemsFromData();
        }
    }

    clearAllSampleData() {
        // Force clear any remaining sample data
        this.galleryItems = this.galleryItems ? this.galleryItems.filter(item => {
            // Keep only items with UUID (database items)
            return typeof item.id === 'string' && item.id.length > 10;
        }) : [];
        
        this.refreshGallery();
        console.log('🧹 Cleared all sample data, remaining items:', this.galleryItems.length);
    }

    async loadGalleryItems() {
        try {
            // Check if supabase is available
            if (typeof supabase === 'undefined' || !TABLES || !TABLES.GALLERY_ITEMS) {
                console.log('Database not available - showing empty state');
                this.galleryItems = [];
                const grid = document.getElementById('product-grid') || document.getElementById('gallery-grid');
                if (grid) {
                    grid.innerHTML = this.generateGalleryItemsFromData();
                }
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
                grid.innerHTML = this.generateGalleryItemsFromData();
            }
            
            return this.galleryItems;
        } catch (error) {
            console.error('Error loading gallery items:', error);
            console.log('Database unavailable - showing empty state');
            
            // Show empty state instead of sample data
            this.galleryItems = [];
            const grid = document.getElementById('product-grid') || document.getElementById('gallery-grid');
            if (grid) {
                grid.innerHTML = this.generateGalleryItemsFromData();
            }
            
            return [];
        }
    }
}

// Initialize
window.collectionGallery = new CollectionGallery();