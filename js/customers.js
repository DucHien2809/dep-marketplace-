// Customer Management
class CustomerManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Customer management events would be bound here
    }

    async createCustomer(customerData) {
        try {
            const user = authManager.getCurrentUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const dataToInsert = {
                ...customerData,
                user_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from(TABLES.CUSTOMERS)
                .insert([dataToInsert])
                .select();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    async updateCustomer(customerId, customerData) {
        try {
            const dataToUpdate = {
                ...customerData,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from(TABLES.CUSTOMERS)
                .update(dataToUpdate)
                .eq('id', customerId)
                .select();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    async deleteCustomer(customerId) {
        if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể hoàn tác.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from(TABLES.CUSTOMERS)
                .delete()
                .eq('id', customerId);

            if (error) throw error;

            // Refresh customers list
            if (window.app) {
                await window.app.loadCustomers();
                window.app.calculateStats();
                window.app.updateStatsDisplay();
            }

            Utils.showToast('Xóa khách hàng thành công!', 'success');

        } catch (error) {
            console.error('Error deleting customer:', error);
            Utils.showToast('Lỗi khi xóa khách hàng', 'error');
        }
    }

    // Export customers to CSV
    exportCustomers() {
        const customers = window.app.data.customers;
        const csvContent = this.convertCustomersToCSV(customers);
        this.downloadCSV(csvContent, 'customers.csv');
    }

    convertCustomersToCSV(customers) {
        const headers = ['Tên khách hàng', 'Email', 'Số điện thoại', 'Địa chỉ', 'Tổng đơn hàng', 'Ngày đăng ký'];
        const rows = customers.map(customer => [
            customer.name,
            customer.email,
            customer.phone || '',
            customer.address || '',
            customer.orders ? customer.orders.length : 0,
            Utils.formatDate(customer.created_at)
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

// Global Customer Manager instance
window.customerManager = new CustomerManager();
