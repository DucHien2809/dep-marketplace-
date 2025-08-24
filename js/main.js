// Main application initialization and event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication form handlers
    initAuthForm();
    
    // Initialize global event listeners
    initGlobalEvents();
    
    console.log('Sales Management System initialized');
});

function initAuthForm() {
    const authForm = document.getElementById('auth-form');
    const authSwitchLink = document.getElementById('auth-switch-link');
    let isLoginMode = true;

    // Auth form submission
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Basic validation
            if (!email || !password) {
                Utils.showToast('Vui lòng nhập đầy đủ thông tin', 'warning');
                return;
            }

            if (!authManager.validateEmail(email)) {
                Utils.showToast('Email không hợp lệ', 'warning');
                return;
            }

            if (!authManager.validatePassword(password)) {
                Utils.showToast('Mật khẩu phải có ít nhất 6 ký tự', 'warning');
                return;
            }

            if (!isLoginMode && password !== confirmPassword) {
                Utils.showToast('Mật khẩu xác nhận không khớp', 'warning');
                return;
            }

            // Show loading state
            const submitBtn = document.getElementById('auth-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
            submitBtn.disabled = true;

            try {
                let result;
                if (isLoginMode) {
                    result = await authManager.signIn(email, password);
                } else {
                    result = await authManager.signUp(email, password);
                }

                if (!result.success) {
                    throw new Error(result.error?.message || 'Authentication failed');
                }

            } catch (error) {
                console.error('Auth error:', error);
                // Error message is already shown by authManager
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Switch between login and register
    if (authSwitchLink) {
        authSwitchLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthMode();
        });
    }

    function toggleAuthMode() {
        isLoginMode = !isLoginMode;
        
        const authTitle = document.getElementById('auth-title');
        const authSubmit = document.getElementById('auth-submit');
        const authSwitchText = document.getElementById('auth-switch-text');
        const confirmPasswordGroup = document.getElementById('confirm-password-group');
        
        if (isLoginMode) {
            authTitle.textContent = 'Đăng nhập';
            authSubmit.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
            authSwitchText.innerHTML = 'Chưa có tài khoản? <a href="#" id="auth-switch-link">Đăng ký ngay</a>';
            confirmPasswordGroup.style.display = 'none';
        } else {
            authTitle.textContent = 'Đăng ký';
            authSubmit.innerHTML = '<span>Đăng ký</span><i class="fas fa-user-plus"></i>';
            authSwitchText.innerHTML = 'Đã có tài khoản? <a href="#" id="auth-switch-link">Đăng nhập ngay</a>';
            confirmPasswordGroup.style.display = 'block';
        }
        
        // Re-bind the switch link
        const newSwitchLink = document.getElementById('auth-switch-link');
        if (newSwitchLink) {
            newSwitchLink.addEventListener('click', (e) => {
                e.preventDefault();
                toggleAuthMode();
            });
        }
        
        // Clear form
        document.getElementById('auth-form').reset();
    }
}

function initGlobalEvents() {
    // Initialize gallery filter buttons
    initGalleryFilters();
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K for quick search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            focusSearchBox();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Handle window resize for responsive adjustments
    window.addEventListener('resize', debounce(() => {
        adjustResponsiveElements();
    }, 250));

    // Handle online/offline status
    window.addEventListener('online', () => {
        Utils.showToast('Kết nối internet đã được khôi phục', 'success');
    });

    window.addEventListener('offline', () => {
        Utils.showToast('Mất kết nối internet', 'warning');
    });

    // Prevent accidental page reload
    window.addEventListener('beforeunload', (e) => {
        const hasUnsavedChanges = checkUnsavedChanges();
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

function focusSearchBox() {
    const currentPage = window.app?.currentPage;
    let searchInput;
    
    switch (currentPage) {
        case 'products':
            searchInput = document.getElementById('product-search');
            break;
        case 'orders':
            searchInput = document.getElementById('order-search');
            break;
        case 'customers':
            searchInput = document.getElementById('customer-search');
            break;
    }
    
    if (searchInput) {
        searchInput.focus();
        searchInput.select();
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
}

function adjustResponsiveElements() {
    const width = window.innerWidth;
    
    // Adjust table responsiveness
    const tables = document.querySelectorAll('.table-container');
    tables.forEach(table => {
        if (width < 768) {
            table.style.overflowX = 'auto';
        } else {
            table.style.overflowX = 'visible';
        }
    });
    
    // Adjust navigation for mobile
    const nav = document.querySelector('.nav');
    if (nav) {
        if (width < 768) {
            nav.classList.add('mobile-nav');
        } else {
            nav.classList.remove('mobile-nav');
        }
    }
}

function checkUnsavedChanges() {
    // Check if any forms have unsaved changes
    const forms = document.querySelectorAll('form');
    for (const form of forms) {
        if (form.dataset.hasChanges === 'true') {
            return true;
        }
    }
    return false;
}

function initGalleryFilters() {
    console.log('🔧 Initializing gallery filters...');
    
    // Handle gallery filter tag clicks
    document.addEventListener('click', function(e) {
        console.log('🖱️ Click detected on:', e.target);
        
        // Check if clicked element is a filter tag
        if (e.target.classList.contains('filter-tag')) {
            console.log('✅ Filter tag clicked!', e.target);
            e.preventDefault();
            
            // Remove active class from all filter tags
            document.querySelectorAll('.filter-tag').forEach(tag => {
                tag.classList.remove('active');
                console.log('🗑️ Removed active from:', tag);
            });
            
            // Add active class to clicked tag
            e.target.classList.add('active');
            console.log('✨ Added active to:', e.target);
            
            // Get filter value
            const filterValue = e.target.getAttribute('data-filter');
            console.log('🔍 Filter value:', filterValue);
            
            // Apply filter logic (if available)
            if (window.collectionGallery && window.collectionGallery.filterGalleryItems) {
                window.collectionGallery.filterGalleryItems(filterValue);
            } else if (window.depMarketplace && window.depMarketplace.filterGalleryItems) {
                window.depMarketplace.filterGalleryItems(filterValue);
            } else {
                // Fallback: simple filter by data-tags attribute
                filterGalleryItems(filterValue);
            }
            
            console.log('🔍 Gallery filter applied:', filterValue);
        }
    });
}

function filterGalleryItems(filter) {
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

function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Global utility functions for external access
window.salesApp = {
    focusSearchBox,
    closeAllModals,
    adjustResponsiveElements,
    
    // Helper functions for common operations
    async refreshAllData() {
        if (window.app) {
            await window.app.loadData();
        }
    },
    
    async exportData(type) {
        switch (type) {
            case 'products':
                if (window.productManager) {
                    window.productManager.exportProducts();
                }
                break;
            case 'orders':
                if (window.orderManager) {
                    window.orderManager.exportOrders();
                }
                break;
            case 'customers':
                if (window.customerManager) {
                    window.customerManager.exportCustomers();
                }
                break;
        }
    },
    
    showQuickStats() {
        if (window.app && window.app.data) {
            const stats = window.app.data.stats;
            const message = `
                Tổng quan hệ thống:
                • Sản phẩm: ${stats.totalProducts}
                • Đơn hàng: ${stats.totalOrders}
                • Khách hàng: ${stats.totalCustomers}
                • Doanh thu: ${Utils.formatCurrency(stats.totalRevenue)}
            `;
            alert(message);
        }
    }
};

// Add some helpful keyboard shortcuts info
console.log(`
🚀 Sales Management System
Keyboard Shortcuts:
• Ctrl/Cmd + K: Focus search box
• Escape: Close modals
• F5: Refresh page

Global functions:
• salesApp.refreshAllData(): Refresh all data
• salesApp.exportData('products'|'orders'|'customers'): Export data
• salesApp.showQuickStats(): Show quick statistics
`);

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page load time: ${loadTime}ms`);
            
            if (loadTime > 3000) {
                console.warn('Page load time is slow. Consider optimizing.');
            }
        }, 0);
    });
}

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment the following lines if you want to add a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch(registrationError => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}
