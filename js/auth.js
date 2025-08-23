// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.init();
    }

    async init() {
        // Kiểm tra session hiện tại
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            this.isLoggedIn = true;
            this.showApp();
        } else {
            this.showAuth();
        }

        // Lắng nghe thay đổi auth state
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.isLoggedIn = true;
                this.showApp();
                Utils.showToast('Đăng nhập thành công!', 'success');
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.isLoggedIn = false;
                this.showAuth();
                Utils.showToast('Đã đăng xuất!', 'info');
            }
        });
    }

    showAuth() {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('loading').style.display = 'none';
    }

    async showApp() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        document.getElementById('loading').style.display = 'none';
        
        // Cập nhật thông tin user
        document.getElementById('user-email').textContent = this.currentUser.email;
        
        // Lấy và hiển thị role
        const userData = await this.getUserRole();
        if (userData) {
            const userRoleElement = document.getElementById('user-role');
            if (userRoleElement) {
                const roleText = userData.role === USER_ROLES.ADMIN ? 'Quản trị viên' : 'Khách hàng';
                userRoleElement.textContent = roleText;
            }
            
            // Ẩn/hiện elements dựa trên role
            this.updateUIForRole(userData.role);
        }
        
        // Load dashboard data
        if (window.app) {
            window.app.loadDashboard();
        }
    }

    updateUIForRole(role) {
        const isAdmin = role === USER_ROLES.ADMIN;
        
        // Ẩn/hiện các nút admin
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = isAdmin ? 'block' : 'none';
        });

        // Ẩn/hiện các nút customer
        const customerElements = document.querySelectorAll('.customer-only');
        customerElements.forEach(element => {
            element.style.display = !isAdmin ? 'block' : 'none';
        });

        // Vô hiệu hóa tất cả nút "Mua ngay" (chỉ trưng bày)
        setTimeout(() => {
            const buyButtons = document.querySelectorAll('.btn-buy, .buy-now-btn, .btn-hero[data-page="marketplace"]');
            buyButtons.forEach(button => {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
                button.title = 'Chỉ để trưng bày - Không thể mua hàng';
                
                // Thêm event listener để ngăn click
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Utils.showToast('Trang web chỉ để trưng bày - Không thể mua hàng', 'info');
                });
            });
        }, 100); // Delay nhỏ để đảm bảo DOM đã load
    }

    async signUp(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) throw error;

            // Tạo profile cho user mới
            if (data.user) {
                await this.createUserProfile(data.user);
            }

            Utils.showToast('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.', 'success');
            return { success: true, data };
        } catch (error) {
            Utils.showToast(this.getErrorMessage(error), 'error');
            return { success: false, error };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            return { success: true, data };
        } catch (error) {
            Utils.showToast(this.getErrorMessage(error), 'error');
            return { success: false, error };
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            Utils.showToast(this.getErrorMessage(error), 'error');
            return { success: false, error };
        }
    }

    async createUserProfile(user) {
        try {
            // Kiểm tra xem có phải admin email không
            const isAdmin = user.email === 'admin@dep.com';
            
            const { error } = await supabase
                .from(TABLES.USERS)
                .insert([
                    {
                        id: user.id,
                        email: user.email,
                        role: isAdmin ? USER_ROLES.ADMIN : USER_ROLES.CUSTOMER, // Admin hoặc customer
                        full_name: isAdmin ? 'Administrator' : null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            console.error('Error creating user profile:', error);
        }
    }

    getErrorMessage(error) {
        const errorMessages = {
            'Invalid login credentials': 'Email hoặc mật khẩu không đúng',
            'User already registered': 'Email này đã được đăng ký',
            'Password should be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
            'Invalid email': 'Email không hợp lệ',
            'Signup requires email verification': 'Cần xác nhận email để hoàn tất đăng ký'
        };

        return errorMessages[error.message] || error.message || 'Có lỗi xảy ra, vui lòng thử lại';
    }

    validateEmail(email) {
        return VALIDATION.email.test(email);
    }

    validatePassword(password) {
        return password.length >= VALIDATION.password.minLength;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.isLoggedIn;
    }

    async getUserRole() {
        if (!this.currentUser) return null;
        
        try {
            const { data, error } = await supabase
                .from(TABLES.USERS)
                .select('role, full_name')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting user role:', error);
            return null;
        }
    }

    async isAdmin() {
        const userData = await this.getUserRole();
        return userData?.role === USER_ROLES.ADMIN;
    }

    async isCustomer() {
        const userData = await this.getUserRole();
        return userData?.role === USER_ROLES.CUSTOMER;
    }

    // Method để update UI từ bên ngoài
    async refreshUIPermissions() {
        const userData = await this.getUserRole();
        if (userData) {
            this.updateUIForRole(userData.role);
        }
    }
}

// Utility class for common functions
class Utils {
    static showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, CONFIG.toast.duration);
    }

    static getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    static formatDate(date) {
        return new Date(date).toLocaleDateString('vi-VN');
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleString('vi-VN');
    }

    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static showLoading(show = true) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }

    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    static hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    static clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    static validateRequired(fields) {
        for (const field of fields) {
            const element = document.getElementById(field);
            if (!element || !element.value.trim()) {
                Utils.showToast(`Vui lòng nhập ${element.placeholder || field}`, 'warning');
                element.focus();
                return false;
            }
        }
        return true;
    }
}

// Global Auth Manager instance
window.authManager = new AuthManager();
window.Utils = Utils;
