// Order Management
class OrderManager {
    constructor() {
        this.currentOrder = null;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Order status change events would be bound here
        // For now, we'll handle them through direct method calls
    }

    async viewOrder(orderId) {
        try {
            const { data, error } = await supabase
                .from(TABLES.ORDERS)
                .select(`
                    *,
                    customers (name, email, phone, address),
                    order_items (
                        id,
                        quantity,
                        price,
                        products (name, image_url)
                    )
                `)
                .eq('id', orderId)
                .single();

            if (error) throw error;

            this.showOrderDetails(data);
        } catch (error) {
            console.error('Error loading order:', error);
            Utils.showToast('Lỗi khi tải thông tin đơn hàng', 'error');
        }
    }

    showOrderDetails(order) {
        // Create order details modal
        const modalHTML = this.createOrderDetailsModal(order);
        
        // Remove existing modal if any
        const existingModal = document.getElementById('order-details-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        Utils.showModal('order-details-modal');
        
        // Bind close events
        this.bindOrderDetailsEvents();
    }

    createOrderDetailsModal(order) {
        const customer = order.customers || {};
        const items = order.order_items || [];
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

        const itemsHTML = items.map(item => `
            <div class="order-item">
                <div class="item-image">
                    <img src="${item.products.image_url || 'https://via.placeholder.com/60'}" 
                         alt="${item.products.name}">
                </div>
                <div class="item-details">
                    <h4>${item.products.name}</h4>
                    <p>Số lượng: ${item.quantity}</p>
                    <p>Đơn giá: ${Utils.formatCurrency(item.price)}</p>
                    <p class="item-total">Thành tiền: ${Utils.formatCurrency(item.price * item.quantity)}</p>
                </div>
            </div>
        `).join('');

        return `
            <div id="order-details-modal" class="modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3>Chi tiết đơn hàng #${order.id.substring(0, 8)}</h3>
                        <button class="close-btn" id="close-order-details">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="order-details-content">
                        <div class="order-info-grid">
                            <div class="order-info-section">
                                <h4>Thông tin đơn hàng</h4>
                                <div class="info-item">
                                    <label>Mã đơn hàng:</label>
                                    <span>#${order.id.substring(0, 8)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Ngày tạo:</label>
                                    <span>${Utils.formatDateTime(order.created_at)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Trạng thái:</label>
                                    <span class="status ${order.status}">${this.getStatusText(order.status)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Tổng tiền:</label>
                                    <span class="total-amount">${Utils.formatCurrency(order.total_amount)}</span>
                                </div>
                            </div>
                            
                            <div class="customer-info-section">
                                <h4>Thông tin khách hàng</h4>
                                <div class="info-item">
                                    <label>Tên:</label>
                                    <span>${customer.name || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Email:</label>
                                    <span>${customer.email || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Số điện thoại:</label>
                                    <span>${customer.phone || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Địa chỉ:</label>
                                    <span>${customer.address || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="order-items-section">
                            <h4>Sản phẩm đặt hàng (${totalItems} sản phẩm)</h4>
                            <div class="order-items-list">
                                ${itemsHTML}
                            </div>
                        </div>
                        
                        <div class="order-actions-section">
                            <h4>Cập nhật trạng thái</h4>
                            <div class="status-actions">
                                <select id="order-status-select" class="status-select">
                                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
                                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Đã gửi</option>
                                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Đã giao</option>
                                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                                </select>
                                <button class="btn btn-primary" id="update-order-status-btn">
                                    Cập nhật trạng thái
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .order-details-content {
                    padding: 0 30px 30px;
                }
                
                .order-info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }
                
                .order-info-section h4,
                .customer-info-section h4,
                .order-items-section h4,
                .order-actions-section h4 {
                    margin-bottom: 15px;
                    color: #333;
                    font-size: 18px;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 8px;
                }
                
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #f5f5f5;
                }
                
                .info-item label {
                    font-weight: 600;
                    color: #666;
                }
                
                .total-amount {
                    font-weight: 700;
                    color: #28a745;
                    font-size: 18px;
                }
                
                .order-items-section {
                    margin-bottom: 30px;
                }
                
                .order-items-list {
                    border: 1px solid #eee;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .order-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                }
                
                .order-item:last-child {
                    border-bottom: none;
                }
                
                .item-image img {
                    width: 60px;
                    height: 60px;
                    border-radius: 8px;
                    object-fit: cover;
                }
                
                .item-details h4 {
                    margin: 0 0 8px 0;
                    color: #333;
                    font-size: 16px;
                }
                
                .item-details p {
                    margin: 4px 0;
                    color: #666;
                    font-size: 14px;
                }
                
                .item-total {
                    font-weight: 600;
                    color: #333 !important;
                }
                
                .status-actions {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                
                .status-select {
                    padding: 10px 15px;
                    border: 2px solid #eee;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    background: white;
                    cursor: pointer;
                }
                
                @media (max-width: 768px) {
                    .order-info-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    
                    .status-actions {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .order-item {
                        flex-direction: column;
                        text-align: center;
                    }
                }
            </style>
        `;
    }

    bindOrderDetailsEvents() {
        // Close modal
        const closeBtn = document.getElementById('close-order-details');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                Utils.hideModal('order-details-modal');
                setTimeout(() => {
                    document.getElementById('order-details-modal').remove();
                }, 300);
            });
        }

        // Update status
        const updateBtn = document.getElementById('update-order-status-btn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                const newStatus = document.getElementById('order-status-select').value;
                const orderId = this.getCurrentOrderId();
                if (orderId) {
                    this.updateStatus(orderId, newStatus);
                }
            });
        }

        // Close on outside click
        const modal = document.getElementById('order-details-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    Utils.hideModal('order-details-modal');
                    setTimeout(() => {
                        document.getElementById('order-details-modal').remove();
                    }, 300);
                }
            });
        }
    }

    getCurrentOrderId() {
        const modal = document.getElementById('order-details-modal');
        if (modal) {
            const title = modal.querySelector('.modal-header h3').textContent;
            const match = title.match(/#(\w+)/);
            return match ? match[1] : null;
        }
        return null;
    }

    async updateOrderStatus(orderId) {
        // This will trigger the order details modal which includes status update
        this.viewOrder(orderId);
    }

    async updateStatus(orderId, newStatus) {
        try {
            const { error } = await supabase
                .from(TABLES.ORDERS)
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);

            if (error) throw error;

            // Close modal
            Utils.hideModal('order-details-modal');
            setTimeout(() => {
                const modal = document.getElementById('order-details-modal');
                if (modal) modal.remove();
            }, 300);

            // Refresh orders list
            if (window.app) {
                await window.app.loadOrders();
            }

            Utils.showToast('Cập nhật trạng thái đơn hàng thành công!', 'success');

        } catch (error) {
            console.error('Error updating order status:', error);
            Utils.showToast('Lỗi khi cập nhật trạng thái đơn hàng', 'error');
        }
    }

    async createOrder(orderData) {
        try {
            const user = authManager.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Create order
            const { data: order, error: orderError } = await supabase
                .from(TABLES.ORDERS)
                .insert([{
                    customer_id: orderData.customer_id,
                    total_amount: orderData.total_amount,
                    status: ORDER_STATUS.PENDING,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order items
            const orderItems = orderData.items.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from(TABLES.ORDER_ITEMS)
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Update product stock
            for (const item of orderData.items) {
                await this.updateProductStock(item.product_id, -item.quantity);
            }

            return order;

        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async updateProductStock(productId, quantityChange) {
        try {
            // Get current stock
            const { data: product, error: getError } = await supabase
                .from(TABLES.PRODUCTS)
                .select('stock')
                .eq('id', productId)
                .single();

            if (getError) throw getError;

            // Update stock
            const newStock = Math.max(0, product.stock + quantityChange);
            const newStatus = newStock === 0 ? PRODUCT_STATUS.OUT_OF_STOCK : PRODUCT_STATUS.ACTIVE;

            const { error: updateError } = await supabase
                .from(TABLES.PRODUCTS)
                .update({
                    stock: newStock,
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', productId);

            if (updateError) throw updateError;

        } catch (error) {
            console.error('Error updating product stock:', error);
            throw error;
        }
    }

    async cancelOrder(orderId, reason = '') {
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            // Get order items to restore stock
            const { data: orderItems, error: itemsError } = await supabase
                .from(TABLES.ORDER_ITEMS)
                .select('product_id, quantity')
                .eq('order_id', orderId);

            if (itemsError) throw itemsError;

            // Update order status
            const { error: orderError } = await supabase
                .from(TABLES.ORDERS)
                .update({
                    status: ORDER_STATUS.CANCELLED,
                    updated_at: new Date().toISOString(),
                    cancellation_reason: reason
                })
                .eq('id', orderId);

            if (orderError) throw orderError;

            // Restore product stock
            for (const item of orderItems) {
                await this.updateProductStock(item.product_id, item.quantity);
            }

            // Refresh orders list
            if (window.app) {
                await window.app.loadOrders();
                await window.app.loadProducts(); // Update product stock display
            }

            Utils.showToast('Hủy đơn hàng thành công!', 'success');

        } catch (error) {
            console.error('Error cancelling order:', error);
            Utils.showToast('Lỗi khi hủy đơn hàng', 'error');
        }
    }

    getStatusText(status) {
        const statusTexts = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đã gửi',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy'
        };
        return statusTexts[status] || status;
    }

    // Export orders to CSV
    exportOrders() {
        const orders = window.app.data.orders;
        const csvContent = this.convertOrdersToCSV(orders);
        this.downloadCSV(csvContent, 'orders.csv');
    }

    convertOrdersToCSV(orders) {
        const headers = ['Mã đơn hàng', 'Khách hàng', 'Email', 'Tổng tiền', 'Trạng thái', 'Ngày tạo'];
        const rows = orders.map(order => [
            order.id.substring(0, 8),
            order.customers ? order.customers.name : 'N/A',
            order.customers ? order.customers.email : 'N/A',
            order.total_amount,
            this.getStatusText(order.status),
            Utils.formatDateTime(order.created_at)
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

    // Generate order reports
    generateOrderReport(startDate, endDate) {
        const orders = window.app.data.orders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= startDate && orderDate <= endDate;
        });

        const report = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
            statusBreakdown: {},
            dailyStats: {}
        };

        // Status breakdown
        Object.values(ORDER_STATUS).forEach(status => {
            report.statusBreakdown[status] = orders.filter(order => order.status === status).length;
        });

        // Daily stats
        orders.forEach(order => {
            const date = Utils.formatDate(order.created_at);
            if (!report.dailyStats[date]) {
                report.dailyStats[date] = {
                    orders: 0,
                    revenue: 0
                };
            }
            report.dailyStats[date].orders++;
            report.dailyStats[date].revenue += order.total_amount;
        });

        return report;
    }
}

// Global Order Manager instance
window.orderManager = new OrderManager();
