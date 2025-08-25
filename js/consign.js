// Consign Page Logic
class ConsignManager {
    constructor() {
        this.uploadedImages = [];
        this.maxImages = 10;
        this.minImages = 3;
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupPriceCalculation();
    }

    bindEvents() {
        // Image upload events
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('product-images');
        
        if (uploadZone && fileInput) {
            uploadZone.addEventListener('click', () => fileInput.click());
            uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadZone.addEventListener('drop', this.handleDrop.bind(this));
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        // Form events
        const form = document.getElementById('consign-form');
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }

        // Character count for title
        const titleInput = document.getElementById('product-title');
        if (titleInput) {
            titleInput.addEventListener('input', this.updateCharCount.bind(this));
        }

        // Price calculation
        const priceInput = document.getElementById('desired-price');
        if (priceInput) {
            priceInput.addEventListener('input', this.calculatePricing.bind(this));
        }

        // AI price suggestion
        const suggestBtn = document.getElementById('suggest-price-btn');
        if (suggestBtn) {
            suggestBtn.addEventListener('click', this.suggestPrice.bind(this));
        }



        // Save draft button
        const saveDraftBtn = document.getElementById('save-draft');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', this.saveDraft.bind(this));
        }
    }

    // Image Upload Methods
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        // Filter image files only
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        // Check file size
        const validFiles = imageFiles.filter(file => {
            if (file.size > this.maxFileSize) {
                console.warn(`File ${file.name} is too large`);
                return false;
            }
            return true;
        });

        // Check total number of images
        if (this.uploadedImages.length + validFiles.length > this.maxImages) {
            alert(`Chỉ được tải tối đa ${this.maxImages} ảnh`);
            return;
        }

        // Process each file
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    id: Date.now() + Math.random(),
                    file: file,
                    url: e.target.result,
                    name: file.name
                };
                this.uploadedImages.push(imageData);
                this.updateImagePreview();
            };
            reader.readAsDataURL(file);
        });
    }

    updateImagePreview() {
        const preview = document.getElementById('image-preview');
        if (!preview) return;

        preview.innerHTML = this.uploadedImages.map((image, index) => `
            <div class="preview-item">
                <img src="${image.url}" alt="${image.name}">
                <button type="button" class="remove-btn" data-id="${image.id}">
                    <i class="fas fa-times"></i>
                </button>
                ${index === 0 ? '<span class="main-badge">Chính</span>' : ''}
            </div>
        `).join('');

        // Bind remove events
        preview.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseFloat(e.currentTarget.getAttribute('data-id'));
                this.removeImage(id);
            });
        });

        // Update upload zone state
        const uploadZone = document.getElementById('upload-zone');
        if (uploadZone) {
            if (this.uploadedImages.length >= this.maxImages) {
                uploadZone.style.display = 'none';
            } else {
                uploadZone.style.display = 'block';
            }
        }
    }

    removeImage(id) {
        this.uploadedImages = this.uploadedImages.filter(img => img.id !== id);
        this.updateImagePreview();
    }

    // Form Methods
    updateCharCount() {
        const input = document.getElementById('product-title');
        const counter = document.querySelector('.char-count');
        if (input && counter) {
            counter.textContent = `${input.value.length}/100`;
        }
    }

    calculatePricing() {
        const priceInput = document.getElementById('desired-price');
        const sellingPrice = document.getElementById('selling-price');
        const serviceFee = document.getElementById('service-fee');
        const finalAmount = document.getElementById('final-amount');

        if (!priceInput || !sellingPrice || !serviceFee || !finalAmount) return;

        const desiredPrice = parseFloat(priceInput.value) || 0;
        const sellPrice = Math.round(desiredPrice / 0.85); // 15% service fee
        const fee = sellPrice - desiredPrice;

        sellingPrice.textContent = this.formatCurrency(sellPrice);
        serviceFee.textContent = this.formatCurrency(fee);
        finalAmount.textContent = this.formatCurrency(desiredPrice);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    suggestPrice() {
        const category = document.querySelector('input[name="category"]:checked')?.value;
        const brand = document.getElementById('product-brand')?.value;
        const condition = document.getElementById('product-condition')?.value;

        if (!category) {
            alert('Vui lòng chọn danh mục trước khi gợi ý giá');
            return;
        }

        // Simulate AI price suggestion
        const suggestions = this.generatePriceSuggestions(category, brand, condition);
        this.displayPriceSuggestions(suggestions);
    }

    generatePriceSuggestions(category, brand, condition) {
        // Mock AI suggestions based on category and condition
        const basePrices = {
            tops: { min: 50000, max: 300000 },
            bottoms: { min: 80000, max: 400000 },
            dresses: { min: 100000, max: 500000 },
            accessories: { min: 30000, max: 200000 },
            shoes: { min: 100000, max: 600000 }
        };

        const conditionMultipliers = {
            new: 0.8,
            excellent: 0.7,
            good: 0.6,
            fair: 0.4,
            vintage: 0.9
        };

        const brandMultipliers = {
            'zara': 1.2,
            'h&m': 1.0,
            'uniqlo': 1.1,
            'mango': 1.15
        };

        const base = basePrices[category] || basePrices.tops;
        const conditionMult = conditionMultipliers[condition] || 0.6;
        const brandMult = brandMultipliers[brand?.toLowerCase()] || 1.0;

        const minPrice = Math.round(base.min * conditionMult * brandMult);
        const maxPrice = Math.round(base.max * conditionMult * brandMult);
        const recommendedPrice = Math.round((minPrice + maxPrice) / 2);

        return { minPrice, maxPrice, recommendedPrice };
    }

    displayPriceSuggestions(suggestions) {
        const resultDiv = document.getElementById('suggestion-result');
        if (!resultDiv) return;

        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h4>💡 Gợi ý giá từ AI:</h4>
            <div style="margin: 15px 0;">
                <p><strong>Giá đề xuất:</strong> ${this.formatCurrency(suggestions.recommendedPrice)}</p>
                <p><strong>Khoảng giá:</strong> ${this.formatCurrency(suggestions.minPrice)} - ${this.formatCurrency(suggestions.maxPrice)}</p>
            </div>
            <button type="button" class="btn btn-sm btn-primary" onclick="(function(){ const el=document.getElementById('desired-price'); if(el){ el.value=${suggestions.recommendedPrice}; el.dispatchEvent(new Event('input')); } if(window.consignManager && typeof window.consignManager.calculatePricing==='function'){ window.consignManager.calculatePricing(); } })()">
                Áp dụng giá đề xuất
            </button>
        `;
    }

    // Form Submission
    handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        this.submitProduct();
    }

    validateForm() {
        // Check minimum images
        if (this.uploadedImages.length < this.minImages) {
            alert(`Vui lòng tải lên ít nhất ${this.minImages} ảnh`);
            return false;
        }

        // Check required fields
        const requiredFields = [
            'product-title',
            'product-size',
            'product-condition',
            'product-description',
            'desired-price'
        ];

        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc');
                field?.focus();
                return false;
            }
        }

        // Check category
        const category = document.querySelector('input[name="category"]:checked');
        if (!category) {
            alert('Vui lòng chọn danh mục sản phẩm');
            return false;
        }

        return true;
    }

    async submitProduct() {
        const formData = this.getFormData();
        
        try {
            // Show loading state
            const submitBtn = document.getElementById('submit-product');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng...';
            submitBtn.disabled = true;

            // Calculate pricing
            const desiredPrice = parseFloat(document.getElementById('desired-price').value) || 0;
            const sellingPrice = Math.round(desiredPrice / 0.85); // 15% service fee
            const serviceFee = sellingPrice - desiredPrice;

            // Prepare images for upload
            const primaryImage = this.uploadedImages[0]?.url || 'https://via.placeholder.com/300x400?text=Product';
            const gallery = this.uploadedImages.map(img => img.url);

            // Get current user (Supabase v2)
            let currentUser = { id: 'anonymous' };
            try {
                if (window.authManager && typeof window.authManager.getCurrentUser === 'function') {
                    const u = window.authManager.getCurrentUser();
                    if (u) currentUser = u;
                } else if (window.supabase && window.supabase.auth && typeof window.supabase.auth.getUser === 'function') {
                    const { data } = await window.supabase.auth.getUser();
                    if (data && data.user) currentUser = data.user;
                }
            } catch {}

            // Insert into Supabase consignments table
            const { data, error } = await window.supabase
                .from('consignments')
                .insert([{
                    user_id: currentUser.id,
                    name: formData.title,
                    description: formData.description,
                    brand: (formData.brand || 'other').toLowerCase(),
                    category: formData.category,
                    condition: formData.condition,
                    size: formData.size,
                    desired_price: desiredPrice,
                    selling_price: sellingPrice,
                    service_fee: serviceFee,
                    primary_image: primaryImage,
                    gallery: gallery,
                    seller_location: document.getElementById('seller-location')?.value || 'Chưa xác định',
                    status: 'approved' // Sản phẩm được hiển thị ngay lập tức
                }])
                .select();

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            // Lưu thương hiệu mới vào database nếu cần
            await this.saveBrandToDatabase(formData.brand);

            this.resetForm();

            alert('Sản phẩm đã được đăng thành công và hiển thị ngay tại marketplace!');
            
            // Refresh marketplace if it's available
            if (window.depMarketplace && typeof window.depMarketplace.generateMarketplaceProducts === 'function') {
                window.depMarketplace.generateMarketplaceProducts();
            }
            
            // Refresh brand filters if marketplace is available
            if (window.depMarketplace && typeof window.depMarketplace.refreshBrandFilters === 'function') {
                await window.depMarketplace.refreshBrandFilters();
            }

        } catch (error) {
            console.error('Error submitting product:', error);
            alert(`Có lỗi xảy ra khi đăng sản phẩm: ${error.message}. Vui lòng thử lại.`);
        } finally {
            const submitBtn = document.getElementById('submit-product');
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Đăng sản phẩm';
            submitBtn.disabled = false;
        }
    }

    getFormData() {
        return {
            title: document.getElementById('product-title').value,
            brand: document.getElementById('product-brand').value,
            size: document.getElementById('product-size').value,
            category: document.querySelector('input[name="category"]:checked').value,
            condition: document.getElementById('product-condition').value,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('desired-price').value)
        };
    }

    async saveBrandToDatabase(brand) {
        if (!brand) return;
        const normalized = brand.toString().trim();
        if (!normalized) return;
        
        try {
            // Kiểm tra xem có phải thương hiệu mặc định không
            const defaultBrands = ['zara', 'hm', 'uniqlo', 'mango'];
            const slug = this.slugifyBrandName(normalized);
            
            if (!slug || defaultBrands.includes(slug)) return;
            
            // Gọi function trong database để tạo brand mới nếu cần
            const { data, error } = await window.supabase
                .rpc('create_brand_if_not_exists', { brand_name: normalized });
            
            if (error) {
                console.warn('Không thể tạo thương hiệu mới:', error);
            } else {
                console.log('✅ Thương hiệu mới đã được lưu vào database:', normalized);
            }
        } catch (error) {
            console.warn('Lỗi khi lưu thương hiệu:', error);
        }
    }

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

    resetForm() {
        document.getElementById('consign-form').reset();
        this.uploadedImages = [];
        this.updateImagePreview();
        this.updateCharCount();
        this.calculatePricing();
        
        // Reset category selection
        document.querySelectorAll('input[name="category"]').forEach(input => {
            input.checked = false;
        });
    }

    async saveDraft() {
        try {
            const formData = this.getFormData();
            const draftData = {
                ...formData,
                images: this.uploadedImages,
                savedAt: new Date()
            };

            // Lưu vào database thay vì localStorage
            const { data, error } = await window.supabase
                .rpc('save_user_draft', {
                    p_user_id: this.getCurrentUserId(),
                    p_draft_type: 'consign',
                    p_draft_data: draftData
                });

            if (error) {
                console.warn('Không thể lưu nháp vào database:', error);
                // Fallback to localStorage nếu database lỗi
                localStorage.setItem('consign_draft', JSON.stringify(draftData));
                alert('Đã lưu nháp thành công (localStorage)!');
            } else {
                console.log('✅ Đã lưu nháp vào database:', data);
                alert('Đã lưu nháp thành công!');
            }
        } catch (error) {
            console.warn('Lỗi khi lưu nháp:', error);
            // Fallback to localStorage
            const formData = this.getFormData();
            localStorage.setItem('consign_draft', JSON.stringify({
                ...formData,
                images: this.uploadedImages,
                savedAt: new Date()
            }));
            alert('Đã lưu nháp thành công (localStorage)!');
        }
    }

    async loadDraft() {
        try {
            // Thử load từ database trước
            const { data: draftData, error } = await window.supabase
                .rpc('get_user_draft', {
                    p_user_id: this.getCurrentUserId(),
                    p_draft_type: 'consign'
                });

            if (error) {
                console.warn('Không thể load nháp từ database:', error);
                return this.loadDraftFromLocalStorage();
            }

            if (draftData) {
                this.loadDraftData(draftData);
                console.log('✅ Đã load nháp từ database');
            } else {
                // Fallback to localStorage
                this.loadDraftFromLocalStorage();
            }
        } catch (error) {
            console.warn('Lỗi khi load nháp:', error);
            this.loadDraftFromLocalStorage();
        }
    }

    loadDraftFromLocalStorage() {
        const draftData = localStorage.getItem('consign_draft');
        if (draftData) {
            try {
                const draft = JSON.parse(draftData);
                this.loadDraftData(draft);
                console.log('📝 Đã load nháp từ localStorage');
            } catch (e) {
                console.warn('Lỗi khi parse draft từ localStorage:', e);
            }
        }
    }

    loadDraftData(draftData) {
        if (!draftData) return;

        // Load form data
        if (draftData.title) document.getElementById('product-title').value = draftData.title;
        if (draftData.brand) document.getElementById('product-brand').value = draftData.brand;
        if (draftData.size) document.getElementById('product-size').value = draftData.size;
        if (draftData.category) {
            document.querySelectorAll('input[name="category"]').forEach(input => {
                input.checked = input.value === draftData.category;
            });
        }
        if (draftData.condition) document.getElementById('product-condition').value = draftData.condition;
        if (draftData.description) document.getElementById('product-description').value = draftData.description;
        if (draftData.price) document.getElementById('desired-price').value = draftData.price;

        // Load images
        if (draftData.images && Array.isArray(draftData.images)) {
            this.uploadedImages = draftData.images;
            this.updateImagePreview();
        }

        // Update UI
        this.updateCharCount();
        this.calculatePricing();
    }

    getCurrentUserId() {
        // Lấy user ID từ auth system hoặc tạo ID tạm thời
        if (window.supabase && window.supabase.auth) {
            const user = window.supabase.auth.user();
            if (user) return user.email || user.id;
        }
        
        // Fallback to localStorage hoặc tạo ID tạm thời
        return localStorage.getItem('userEmail') || 
               localStorage.getItem('userId') || 
               'anonymous_' + Date.now();
    }


}

// Hide number input spinners for all number inputs
function hideNumberInputSpinners() {
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        // Remove spinners via CSS
        input.style.webkitAppearance = 'none';
        input.style.mozAppearance = 'textfield';
        input.style.appearance = 'none';
        
        // Add padding to prevent overlap with currency
        input.style.paddingRight = '50px';
        
        // Force remove spinners via JavaScript
        if (input.style.webkitAppearance !== 'none') {
            input.setAttribute('style', input.getAttribute('style') + '; -webkit-appearance: none; -moz-appearance: textfield; appearance: none; padding-right: 50px;');
        }
    });
}

// Call function when page loads
document.addEventListener('DOMContentLoaded', hideNumberInputSpinners);

// Also call when navigating to consign page
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-page="consign"]')) {
        setTimeout(hideNumberInputSpinners, 100);
    }
});

// Initialize when DOM is loaded and expose globally
let consignManager;
document.addEventListener('DOMContentLoaded', () => {
    consignManager = new ConsignManager();
    window.consignManager = consignManager;
});
