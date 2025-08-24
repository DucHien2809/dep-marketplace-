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
            <button type="button" class="btn btn-sm btn-primary" onclick="document.getElementById('desired-price').value = ${suggestions.recommendedPrice}; consignManager.calculatePricing();">
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

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.resetForm();

            alert('Sản phẩm đã được đăng thành công! Chúng tôi sẽ kiểm duyệt trong vòng 24h.');

        } catch (error) {
            alert('Có lỗi xảy ra khi đăng sản phẩm. Vui lòng thử lại.');
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

    saveDraft() {
        const formData = this.getFormData();
        localStorage.setItem('consign_draft', JSON.stringify({
            ...formData,
            images: this.uploadedImages,
            savedAt: new Date()
        }));
        alert('Đã lưu nháp thành công!');
    }


}

// Initialize when DOM is loaded
let consignManager;
document.addEventListener('DOMContentLoaded', () => {
    consignManager = new ConsignManager();
});

// Export for global access
window.consignManager = consignManager;
