// Supabase Configuration
// Thay thế các giá trị này bằng thông tin từ Supabase project của bạn

const SUPABASE_CONFIG = {
    url: 'https://hvbgnqkwvbdzaxyamfao.supabase.co', // Ví dụ: https://your-project.supabase.co
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YmducWt3dmJkemF4eWFtZmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTEwODIsImV4cCI6MjA3MTQ4NzA4Mn0.RulX8AIBdwPw9kB97K6zJ0m_8Vg4PNRptDrkMzh2eXY', // Public anon key từ Supabase
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YmducWt3dmJkemF4eWFtZmFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkxMTA4MiwiZXhwIjoyMDcxNDg3MDgyfQ.iWQPOdfrmiSQgXToODtrcYLpdV-Ymii-lwwVrQgnP2E' // Service role key (chỉ dùng ở backend)
};

// Khởi tạo Supabase client
let supabase = null;

// Function để khởi tạo Supabase (chỉ khi có config)
function initSupabase() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
        console.warn('⚠️ Vui lòng cập nhật SUPABASE_CONFIG trong js/supabase-config.js');
        return false;
    }
    
    try {
        // Import Supabase client (cần cài đặt: npm install @supabase/supabase-js)
        if (typeof window !== 'undefined' && window.supabase) {
            supabase = window.supabase;
        } else {
            console.warn('⚠️ Supabase client chưa được load. Vui lòng thêm script tag.');
            return false;
        }
        return true;
    } catch (error) {
        console.error('❌ Lỗi khởi tạo Supabase:', error);
        return false;
    }
}

// Function để kiểm tra kết nối
async function testSupabaseConnection() {
    if (!supabase) {
        console.warn('⚠️ Supabase chưa được khởi tạo');
        return false;
    }
    
    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('count')
            .limit(1);
        
        if (error) {
            console.error('❌ Lỗi kết nối database:', error);
            return false;
        }
        
        console.log('✅ Kết nối Supabase thành công!');
        return true;
    } catch (error) {
        console.error('❌ Lỗi test connection:', error);
        return false;
    }
}

// Export functions
window.SupabaseConfig = {
    init: initSupabase,
    testConnection: testSupabaseConnection,
    getClient: () => supabase,
    isReady: () => supabase !== null
};
