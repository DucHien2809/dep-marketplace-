// Đẹp Collection Gallery Management
class CollectionGallery {
    constructor() {
        this.galleryItems = [];
        this.currentEditId = null;
        this.init();
    }

    async init() {
        await this.loadGalleryItems();
        this.bindEvents();
    }

    bindEvents() {
        // Upload image button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'upload-gallery-btn') {
                this.showUploadModal();
            }
            
            if (e.target.closest('.btn-edit-gallery')) {
                const itemId = e.target.closest('.gallery-item').getAttribute('data-item-id');
                this.editGalleryItem(itemId);
            }
            
            if (e.target.closest('.btn-delete-gallery')) {
                const itemId = e.target.closest('.gallery-item').getAttribute('data-item-id');
                this.deleteGalleryItem(itemId);
            }
            
            if (e.target.closest('.gallery-item-image')) {
                const itemId = e.target.closest('.gallery-item').getAttribute('data-item-id');
                this.viewGalleryDetail(itemId);
            }
        });

        // File input change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'gallery-image-input') {
                this.handleImageUpload(e.target.files);
            }
        });
    }

    createGalleryPage() {
        return `
            <div id="dep-collection-page" class="page">
                <!-- Gallery Hero -->
                <div class="gallery-hero">
                    <div class="container">
                        <div class="gallery-hero-content">
                            <h1>Đẹp Collection</h1>
                            <p class="gallery-subtitle">Trưng bày những tác phẩm tái chế độc đáo</p>
                            <p class="gallery-description">
                                Khám phá hành trình tái sinh của thời trang - từ những món đồ cũ đến những tác phẩm nghệ thuật mới
                            </p>
                            
                            <!-- Admin Controls -->
                            <div class="admin-controls admin-only">
                                <button class="btn btn-primary" id="upload-gallery-btn">
                                    <i class="fas fa-upload"></i>
                                    Upload ảnh mới
                                </button>
                                <button class="btn btn-secondary" id="manage-gallery-btn">
                                    <i class="fas fa-cog"></i>
                                    Quản lý gallery
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

                        <!-- Filter Tags -->
                        <div class="gallery-filters">
                            <button class="filter-tag active" data-filter="all">Tất cả</button>
                            <button class="filter-tag" data-filter="vintage">Vintage</button>
                            <button class="filter-tag" data-filter="modern">Hiện đại</button>
                            <button class="filter-tag" data-filter="boho">Boho</button>
                            <button class="filter-tag" data-filter="minimalist">Tối giản</button>
                        </div>

                        <!-- Gallery Grid -->
                        <div class="gallery-grid" id="gallery-grid">
                            ${this.generateGalleryItems()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateGalleryItems() {
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

        return sampleItems.map(item => this.renderGalleryItem(item)).join('');
    }

    generateGalleryItemsFromData() {
        if (!this.galleryItems || this.galleryItems.length === 0) {
            return '<div class="no-items">Chưa có tác phẩm nào</div>';
        }
        return this.galleryItems.map(item => this.renderGalleryItem(item)).join('');
    }

    renderGalleryItem(item) {
        const tags = Array.isArray(item.tags) ? item.tags : 
                    (typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : []);
        const isDbItem = !!item.created_at;
        const viewCount = item.views || 0;
        const createDate = isDbItem ? 
            new Date(item.created_at).toLocaleDateString('vi-VN') : 
            item.created;

        return `
            <div class="gallery-item ${item.is_featured || item.featured ? 'featured' : ''}" 
                 data-item-id="${item.id}" 
                 data-tags="${tags.join(' ')}">
                <div class="gallery-item-image" style="background-image: url('${item.image_url || item.image}')">
                    ${(item.is_featured || item.featured) ? '<span class="featured-badge">Nổi bật</span>' : ''}
                    
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
                                ${viewCount}
                            </span>
                            <span class="create-date admin-only">
                                <i class="fas fa-calendar"></i>
                                ${createDate}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showUploadModal() {
        const modalHTML = `
            <div id="upload-gallery-modal" class="modal gallery-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Upload Tác Phẩm Mới</h3>
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
                                
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="item-featured"> 
                                        Đặt làm nổi bật
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Hủy</button>
                        <button type="button" class="btn btn-primary" onclick="collectionGallery.saveGalleryItem()">
                            <i class="fas fa-save"></i>
                            Lưu tác phẩm
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

    editGalleryItem(itemId) {
        // TODO: Load item data and show edit modal
        Utils.showToast('Chức năng chỉnh sửa đang phát triển', 'info');
    }

    deleteGalleryItem(itemId) {
        if (confirm('Bạn có chắc chắn muốn xóa tác phẩm này?')) {
            // TODO: Implement actual delete
            Utils.showToast('Đã xóa tác phẩm', 'success');
            this.refreshGallery();
        }
    }

    viewGalleryDetail(itemId) {
        // TODO: Show detail modal
        Utils.showToast('Xem chi tiết tác phẩm', 'info');
    }

    refreshGallery() {
        const grid = document.getElementById('gallery-grid');
        if (grid) {
            // Use real data if available, fallback to sample data
            if (this.galleryItems && this.galleryItems.length > 0) {
                grid.innerHTML = this.generateGalleryItemsFromData();
            } else {
                grid.innerHTML = this.generateGalleryItems();
            }
        }
    }

    async loadGalleryItems() {
        try {
            const { data, error } = await supabase
                .from(TABLES.GALLERY_ITEMS)
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.galleryItems = data || [];
            console.log('Loaded gallery items:', this.galleryItems.length);
            
            // Update UI if gallery grid exists
            const grid = document.getElementById('gallery-grid');
            if (grid) {
                grid.innerHTML = this.generateGalleryItemsFromData();
            }
            
            return this.galleryItems;
        } catch (error) {
            console.error('Error loading gallery items:', error);
            Utils.showToast('Không thể tải gallery items', 'error');
            return [];
        }
    }
}

// Initialize
window.collectionGallery = new CollectionGallery();
