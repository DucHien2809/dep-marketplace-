// Main Application Logic
class App {
    constructor() {
        this.currentPage = 'home';
        this.data = {
            depCollection: [],
            marketplaceProducts: [],
            orders: [],
            customers: [],
            consignments: [],
            cart: [],
            stats: {
                totalProducts: 0,
                totalOrders: 0,
                totalCustomers: 0,
                totalRevenue: 0
            }
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
    }

    bindEvents() {
        // Navigation events
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });

        // User menu dropdown
        const userInfo = document.getElementById('user-info');
        const userDropdown = document.getElementById('user-dropdown');
        
        userInfo.addEventListener('click', () => {
            userDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userInfo.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });

        // Logout event
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            authManager.signOut();
        });

        // Search events with debounce
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('input', Utils.debounce(() => {
                this.filterProducts(productSearch.value);
            }, 300));
        }

        const orderSearch = document.getElementById('order-search');
        if (orderSearch) {
            orderSearch.addEventListener('input', Utils.debounce(() => {
                this.filterOrders(orderSearch.value);
            }, 300));
        }

        const customerSearch = document.getElementById('customer-search');
        if (customerSearch) {
            customerSearch.addEventListener('input', Utils.debounce(() => {
                this.filterCustomers(customerSearch.value);
            }, 300));
        }

        // Order status filter
        const orderStatusFilter = document.getElementById('order-status-filter');
        if (orderStatusFilter) {
            orderStatusFilter.addEventListener('change', () => {
                this.filterOrdersByStatus(orderStatusFilter.value);
            });
        }
    }

    navigateTo(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[data-page="${page}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Update pages
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.remove('active');
        });
        
        let pageElement = document.getElementById(`${page}-page`);
        if (!pageElement) {
            // Create page if it doesn't exist - delegate to depMarketplace
            if (window.depMarketplace) {
                window.depMarketplace.createPage(page);
                pageElement = document.getElementById(`${page}-page`);
            }
        }
        
        if (pageElement) {
            pageElement.classList.add('active');
        }

        this.currentPage = page;

        // Load page specific data - delegate to depMarketplace
        if (window.depMarketplace) {
            switch (page) {
                case 'home':
                    window.depMarketplace.loadHomePage();
                    break;
                case 'dep-collection':
                    window.depMarketplace.loadDepCollectionPage();
                    break;
                case 'marketplace':
                    window.depMarketplace.loadMarketplacePage();
                    break;
                case 'consign':
                    this.loadConsignmentForm();
                    break;
                case 'blog':
                    this.loadBlog();
                    break;
                case 'support':
                    this.loadSupport();
                    break;
                case 'profile':
                    this.loadProfile();
                    break;
                case 'orders':
                    this.loadOrders();
                    break;
                case 'consignment-dashboard':
                    this.loadConsignmentDashboard();
                    break;
            }
        }
    }

    async loadData() {
        Utils.showLoading(true);
        try {
            await Promise.all([
                this.loadProducts(),
                this.loadOrders(),
                this.loadCustomers()
            ]);
            this.calculateStats();
        } catch (error) {
            console.error('Error loading data:', error);
            Utils.showToast('Lỗi khi tải dữ liệu', 'error');
        } finally {
            Utils.showLoading(false);
        }
    }

    async loadDashboard() {
        this.updateStatsDisplay();
        this.loadRecentOrders();
    }

    async loadProducts() {
        try {
            const { data, error } = await supabase
                .from(TABLES.PRODUCTS)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.data.products = data || [];
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            Utils.showToast('Lỗi khi tải danh sách sản phẩm', 'error');
        }
    }

    async loadOrders() {
        try {
            const { data, error } = await supabase
                .from(TABLES.ORDERS)
                .select(`
                    *,
                    customers!customer_id (name, email),
                    order_items (
                        id,
                        quantity,
                        unit_price,
                        total_price,
                        products!product_id (name, image_url)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.data.orders = data || [];
            this.renderOrders();
        } catch (error) {
            console.error('Error loading orders:', error);
            Utils.showToast('Lỗi khi tải danh sách đơn hàng', 'error');
        }
    }

    async loadCustomers() {
        try {
            const { data, error } = await supabase
                .from(TABLES.CUSTOMERS)
                .select(`
                    *,
                    orders (id, total_amount)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.data.customers = data || [];
            this.renderCustomers();
        } catch (error) {
            console.error('Error loading customers:', error);
            Utils.showToast('Lỗi khi tải danh sách khách hàng', 'error');
        }
    }

    calculateStats() {
        this.data.stats = {
            totalProducts: this.data.products.length,
            totalOrders: this.data.orders.length,
            totalCustomers: this.data.customers.length,
            totalRevenue: this.data.orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        };
    }

    updateStatsDisplay() {
        // Safety checks - only update if elements and stats exist
        if (!this.data.stats) return;
        
        const totalProductsEl = document.getElementById('total-products');
        const totalOrdersEl = document.getElementById('total-orders');
        const totalCustomersEl = document.getElementById('total-customers');
        const totalRevenueEl = document.getElementById('total-revenue');
        
        if (totalProductsEl) totalProductsEl.textContent = this.data.stats.totalProducts;
        if (totalOrdersEl) totalOrdersEl.textContent = this.data.stats.totalOrders;
        if (totalCustomersEl) totalCustomersEl.textContent = this.data.stats.totalCustomers;
        if (totalRevenueEl) totalRevenueEl.textContent = Utils.formatCurrency(this.data.stats.totalRevenue);
    }

    renderProducts(products = this.data.products) {
        const tbody = document.querySelector('#products-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${product.image_url || 'https://via.placeholder.com/50'}" 
                         alt="${product.name}" class="product-image">
                </td>
                <td>${product.name}</td>
                <td>${product.category || 'Không xác định'}</td>
                <td>${Utils.formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="status ${product.status}">${this.getStatusText(product.status)}</span>
                </td>
                <td class="actions">
                    <button class="btn btn-sm btn-edit" onclick="window.productManager.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="window.productManager.deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderOrders(orders = this.data.orders) {
        const tbody = document.querySelector('#orders-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        orders.forEach(order => {
            const customerName = order.customers ? order.customers.name : 'N/A';
            const products = order.order_items ? 
                order.order_items.map(item => `${item.products.name} (x${item.quantity})`).join(', ') : 
                'N/A';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id.substring(0, 8)}</td>
                <td>${customerName}</td>
                <td title="${products}">${this.truncateText(products, 30)}</td>
                <td>${Utils.formatCurrency(order.total_amount)}</td>
                <td>
                    <span class="status ${order.status}">${this.getStatusText(order.status)}</span>
                </td>
                <td>${Utils.formatDate(order.created_at)}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-edit" onclick="window.orderManager.viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-edit" onclick="window.orderManager.updateOrderStatus('${order.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderCustomers(customers = this.data.customers) {
        const tbody = document.querySelector('#customers-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        customers.forEach(customer => {
            const totalOrders = customer.orders ? customer.orders.length : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${customer.address || 'N/A'}</td>
                <td>${totalOrders}</td>
                <td>${Utils.formatDate(customer.created_at)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    loadRecentOrders() {
        const recentOrders = this.data.orders.slice(0, 5);
        this.renderRecentOrders(recentOrders);
    }

    renderRecentOrders(orders) {
        const tbody = document.querySelector('#recent-orders-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        orders.forEach(order => {
            const customerName = order.customers ? order.customers.name : 'N/A';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id.substring(0, 8)}</td>
                <td>${customerName}</td>
                <td>${Utils.formatCurrency(order.total_amount)}</td>
                <td>
                    <span class="status ${order.status}">${this.getStatusText(order.status)}</span>
                </td>
                <td>${Utils.formatDate(order.created_at)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    filterProducts(searchTerm) {
        const filtered = this.data.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderProducts(filtered);
    }

    filterOrders(searchTerm) {
        const filtered = this.data.orders.filter(order =>
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customers && order.customers.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderOrders(filtered);
    }

    filterOrdersByStatus(status) {
        const filtered = status ? 
            this.data.orders.filter(order => order.status === status) : 
            this.data.orders;
        this.renderOrders(filtered);
    }

    filterCustomers(searchTerm) {
        const filtered = this.data.customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderCustomers(filtered);
    }

    getStatusText(status) {
        const statusTexts = {
            active: 'Hoạt động',
            inactive: 'Không hoạt động',
            out_of_stock: 'Hết hàng',
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đã gửi',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy'
        };
        return statusTexts[status] || status;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Public methods for external access
    refreshData() {
        this.loadData();
    }

    refreshCurrentPage() {
        switch (this.currentPage) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'customers':
                this.loadCustomers();
                break;
        }
    }

    // Blog page
    loadBlog() {
        console.log('Loading blog page...');
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        mainContent.innerHTML = `
            <div class="page-header">
                <h1>Blog Lifestyle</h1>
                <p>Chia sẻ về phong cách sống bền vững</p>
            </div>
            <div class="blog-container">
                <div class="blog-posts">
                    <div class="blog-post">
                        <div class="blog-image">
                            <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=400&fit=crop" alt="Blog post">
                        </div>
                        <div class="blog-content">
                            <h3>Thời trang bền vững - Xu hướng tương lai</h3>
                            <p class="blog-date">22/12/2024</p>
                            <p>Khám phá cách thời trang bền vững đang thay đổi ngành công nghiệp và tác động tích cực đến môi trường...</p>
                            <a href="#" class="read-more">Đọc thêm</a>
                        </div>
                    </div>
                    <div class="blog-post">
                        <div class="blog-image">
                            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop" alt="Blog post">
                        </div>
                        <div class="blog-content">
                            <h3>Cách chọn quần áo second-hand chất lượng</h3>
                            <p class="blog-date">20/12/2024</p>
                            <p>Hướng dẫn chi tiết cách lựa chọn và kiểm tra chất lượng quần áo đã qua sử dụng...</p>
                            <a href="#" class="read-more">Đọc thêm</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Support page
    loadSupport() {
        console.log('Loading support page...');
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        mainContent.innerHTML = `
            <div class="page-header">
                <h1>Hỗ trợ khách hàng</h1>
                <p>Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
            </div>
            <div class="support-container">
                <div class="support-cards">
                    <div class="support-card">
                        <i class="fas fa-question-circle"></i>
                        <h3>Câu hỏi thường gặp</h3>
                        <p>Tìm câu trả lời cho các câu hỏi phổ biến</p>
                        <button class="btn btn-outline">Xem FAQ</button>
                    </div>
                    <div class="support-card">
                        <i class="fas fa-envelope"></i>
                        <h3>Liên hệ Email</h3>
                        <p>support@dep.com</p>
                        <button class="btn btn-outline">Gửi Email</button>
                    </div>
                    <div class="support-card">
                        <i class="fas fa-phone"></i>
                        <h3>Hotline</h3>
                        <p>1900 1234 (8:00 - 22:00)</p>
                        <button class="btn btn-outline">Gọi ngay</button>
                    </div>
                    <div class="support-card">
                        <i class="fas fa-comments"></i>
                        <h3>Chat trực tuyến</h3>
                        <p>Hỗ trợ 24/7 qua chat</p>
                        <button class="btn btn-primary">Bắt đầu chat</button>
                    </div>
                </div>
                <div class="contact-form">
                    <h3>Gửi tin nhắn cho chúng tôi</h3>
                    <form>
                        <input type="text" placeholder="Họ và tên" required>
                        <input type="email" placeholder="Email" required>
                        <select required>
                            <option value="">Chọn chủ đề</option>
                            <option value="order">Đơn hàng</option>
                            <option value="consignment">Ký gửi</option>
                            <option value="technical">Kỹ thuật</option>
                            <option value="other">Khác</option>
                        </select>
                        <textarea placeholder="Nội dung tin nhắn" rows="5" required></textarea>
                        <button type="submit" class="btn btn-primary">Gửi tin nhắn</button>
                    </form>
                </div>
            </div>
        `;
    }

    // Profile page  
    loadProfile() {
        console.log('Loading profile page...');
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        const currentUser = authManager.getCurrentUser();
        
        mainContent.innerHTML = `
            <div class="page-header">
                <h1>Thông tin tài khoản</h1>
                <p>Quản lý thông tin cá nhân của bạn</p>
            </div>
            <div class="profile-container">
                <div class="profile-form">
                    <form id="profile-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" value="${currentUser?.email || ''}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Họ và tên</label>
                            <input type="text" id="full-name" placeholder="Nhập họ và tên">
                        </div>
                        <div class="form-group">
                            <label>Số điện thoại</label>
                            <input type="tel" id="phone" placeholder="Nhập số điện thoại">
                        </div>
                        <div class="form-group">
                            <label>Địa chỉ</label>
                            <textarea id="address" placeholder="Nhập địa chỉ" rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Cập nhật thông tin</button>
                    </form>
                </div>
            </div>
        `;
    }
}

// Global App instance
window.app = new App();
