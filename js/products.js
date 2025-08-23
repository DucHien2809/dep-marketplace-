// Product Management
class ProductManager {
    constructor() {
        this.currentProduct = null;
        this.isEditing = false;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Add product button
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showProductModal();
            });
        }

        // Product form submission
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        // Modal close events
        const closeProductModal = document.getElementById('close-product-modal');
        if (closeProductModal) {
            closeProductModal.addEventListener('click', () => {
                this.hideProductModal();
            });
        }

        const cancelProduct = document.getElementById('cancel-product');
        if (cancelProduct) {
            cancelProduct.addEventListener('click', () => {
                this.hideProductModal();
            });
        }

        // Close modal when clicking outside
        const productModal = document.getElementById('product-modal');
        if (productModal) {
            productModal.addEventListener('click', (e) => {
                if (e.target === productModal) {
                    this.hideProductModal();
                }
            });
        }

        // Real-time validation
        this.setupValidation();
    }

    setupValidation() {
        const productName = document.getElementById('product-name');
        const productPrice = document.getElementById('product-price');
        const productStock = document.getElementById('product-stock');

        if (productName) {
            productName.addEventListener('blur', () => {
                this.validateProductName(productName.value);
            });
        }

        if (productPrice) {
            productPrice.addEventListener('blur', () => {
                this.validateProductPrice(productPrice.value);
            });
        }

        if (productStock) {
            productStock.addEventListener('blur', () => {
                this.validateProductStock(productStock.value);
            });
        }
    }

    showProductModal(product = null) {
        this.currentProduct = product;
        this.isEditing = !!product;

        const modal = document.getElementById('product-modal');
        const title = document.getElementById('product-modal-title');
        const form = document.getElementById('product-form');

        title.textContent = this.isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới';

        if (this.isEditing && product) {
            this.fillProductForm(product);
        } else {
            form.reset();
        }

        Utils.showModal('product-modal');
    }

    hideProductModal() {
        Utils.hideModal('product-modal');
        Utils.clearForm('product-form');
        this.currentProduct = null;
        this.isEditing = false;
    }

    fillProductForm(product) {
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-category').value = product.category || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-stock').value = product.stock || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-image').value = product.image_url || '';
    }

    getProductFormData() {
        return {
            name: document.getElementById('product-name').value.trim(),
            category: document.getElementById('product-category').value.trim(),
            price: parseFloat(document.getElementById('product-price').value) || 0,
            stock: parseInt(document.getElementById('product-stock').value) || 0,
            description: document.getElementById('product-description').value.trim(),
            image_url: document.getElementById('product-image').value.trim(),
            status: PRODUCT_STATUS.ACTIVE
        };
    }

    validateProductForm() {
        const data = this.getProductFormData();

        // Validate required fields
        if (!data.name) {
            Utils.showToast('Vui lòng nhập tên sản phẩm', 'warning');
            document.getElementById('product-name').focus();
            return false;
        }

        if (!data.category) {
            Utils.showToast('Vui lòng nhập danh mục sản phẩm', 'warning');
            document.getElementById('product-category').focus();
            return false;
        }

        if (data.price <= 0) {
            Utils.showToast('Giá sản phẩm phải lớn hơn 0', 'warning');
            document.getElementById('product-price').focus();
            return false;
        }

        if (data.stock < 0) {
            Utils.showToast('Tồn kho không thể âm', 'warning');
            document.getElementById('product-stock').focus();
            return false;
        }

        // Validate name length
        if (!this.validateProductName(data.name)) {
            return false;
        }

        // Validate image URL if provided
        if (data.image_url && !this.validateImageUrl(data.image_url)) {
            Utils.showToast('URL hình ảnh không hợp lệ', 'warning');
            document.getElementById('product-image').focus();
            return false;
        }

        return true;
    }

    validateProductName(name) {
        if (name.length < VALIDATION.product.nameMinLength) {
            Utils.showToast(`Tên sản phẩm phải có ít nhất ${VALIDATION.product.nameMinLength} ký tự`, 'warning');
            return false;
        }

        if (name.length > VALIDATION.product.nameMaxLength) {
            Utils.showToast(`Tên sản phẩm không được vượt quá ${VALIDATION.product.nameMaxLength} ký tự`, 'warning');
            return false;
        }

        return true;
    }

    validateProductPrice(price) {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            Utils.showToast('Giá sản phẩm phải là số dương', 'warning');
            return false;
        }
        return true;
    }

    validateProductStock(stock) {
        const numStock = parseInt(stock);
        if (isNaN(numStock) || numStock < 0) {
            Utils.showToast('Tồn kho phải là số không âm', 'warning');
            return false;
        }
        return true;
    }

    validateImageUrl(url) {
        try {
            new URL(url);
            return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) !== null;
        } catch {
            return false;
        }
    }

    async saveProduct() {
        if (!this.validateProductForm()) {
            return;
        }

        const productData = this.getProductFormData();
        const saveBtn = document.getElementById('save-product');
        const originalText = saveBtn.innerHTML;

        try {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
            saveBtn.disabled = true;

            if (this.isEditing && this.currentProduct) {
                await this.updateProduct(this.currentProduct.id, productData);
            } else {
                await this.createProduct(productData);
            }

            this.hideProductModal();
            
            // Refresh products list
            if (window.app) {
                await window.app.loadProducts();
                window.app.calculateStats();
                window.app.updateStatsDisplay();
            }

            Utils.showToast(
                this.isEditing ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!', 
                'success'
            );

        } catch (error) {
            console.error('Error saving product:', error);
            Utils.showToast('Lỗi khi lưu sản phẩm', 'error');
        } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }

    async createProduct(productData) {
        const user = authManager.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const dataToInsert = {
            ...productData,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(TABLES.PRODUCTS)
            .insert([dataToInsert])
            .select();

        if (error) throw error;
        return data;
    }

    async updateProduct(productId, productData) {
        const dataToUpdate = {
            ...productData,
            updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from(TABLES.PRODUCTS)
            .update(dataToUpdate)
            .eq('id', productId)
            .select();

        if (error) throw error;
        return data;
    }

    async editProduct(productId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            this.showProductModal(data);
        } catch (error) {
            console.error('Error loading product:', error);
            Utils.showToast('Lỗi khi tải thông tin sản phẩm', 'error');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from(TABLES.PRODUCTS)
                .delete()
                .eq('id', productId);

            if (error) throw error;

            // Refresh products list
            if (window.app) {
                await window.app.loadProducts();
                window.app.calculateStats();
                window.app.updateStatsDisplay();
            }

            Utils.showToast('Xóa sản phẩm thành công!', 'success');

        } catch (error) {
            console.error('Error deleting product:', error);
            Utils.showToast('Lỗi khi xóa sản phẩm', 'error');
        }
    }

    async toggleProductStatus(productId, currentStatus) {
        const newStatus = currentStatus === PRODUCT_STATUS.ACTIVE ? 
            PRODUCT_STATUS.INACTIVE : PRODUCT_STATUS.ACTIVE;

        try {
            const { error } = await supabase
                .from(TABLES.PRODUCTS)
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', productId);

            if (error) throw error;

            // Refresh products list
            if (window.app) {
                await window.app.loadProducts();
            }

            Utils.showToast('Cập nhật trạng thái sản phẩm thành công!', 'success');

        } catch (error) {
            console.error('Error updating product status:', error);
            Utils.showToast('Lỗi khi cập nhật trạng thái sản phẩm', 'error');
        }
    }

    async duplicateProduct(productId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            // Create a copy with modified name
            const duplicatedProduct = {
                ...data,
                name: `${data.name} (Bản sao)`,
                id: undefined,
                created_at: undefined,
                updated_at: undefined
            };

            await this.createProduct(duplicatedProduct);

            // Refresh products list
            if (window.app) {
                await window.app.loadProducts();
                window.app.calculateStats();
                window.app.updateStatsDisplay();
            }

            Utils.showToast('Nhân bản sản phẩm thành công!', 'success');

        } catch (error) {
            console.error('Error duplicating product:', error);
            Utils.showToast('Lỗi khi nhân bản sản phẩm', 'error');
        }
    }

    // Bulk operations
    async bulkUpdateStatus(productIds, status) {
        try {
            const { error } = await supabase
                .from(TABLES.PRODUCTS)
                .update({ 
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .in('id', productIds);

            if (error) throw error;

            // Refresh products list
            if (window.app) {
                await window.app.loadProducts();
            }

            Utils.showToast(`Cập nhật trạng thái ${productIds.length} sản phẩm thành công!`, 'success');

        } catch (error) {
            console.error('Error bulk updating products:', error);
            Utils.showToast('Lỗi khi cập nhật hàng loạt', 'error');
        }
    }

    async bulkDelete(productIds) {
        if (!confirm(`Bạn có chắc chắn muốn xóa ${productIds.length} sản phẩm? Hành động này không thể hoàn tác.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from(TABLES.PRODUCTS)
                .delete()
                .in('id', productIds);

            if (error) throw error;

            // Refresh products list
            if (window.app) {
                await window.app.loadProducts();
                window.app.calculateStats();
                window.app.updateStatsDisplay();
            }

            Utils.showToast(`Xóa ${productIds.length} sản phẩm thành công!`, 'success');

        } catch (error) {
            console.error('Error bulk deleting products:', error);
            Utils.showToast('Lỗi khi xóa hàng loạt', 'error');
        }
    }

    // Import/Export functionality
    exportProducts() {
        const products = window.app.data.products;
        const csvContent = this.convertToCSV(products);
        this.downloadCSV(csvContent, 'products.csv');
    }

    convertToCSV(products) {
        const headers = ['Tên sản phẩm', 'Danh mục', 'Giá', 'Tồn kho', 'Mô tả', 'Trạng thái'];
        const rows = products.map(product => [
            product.name,
            product.category,
            product.price,
            product.stock,
            product.description,
            product.status
        ]);

        const csvArray = [headers, ...rows];
        return csvArray.map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// Global Product Manager instance
window.productManager = new ProductManager();
