// Supabase Configuration
// Thay thế các giá trị này bằng thông tin từ Supabase project của bạn

const SUPABASE_CONFIG = {
    url: 'https://hvbgnqkwvbdzaxyamfao.supabase.co', // Ví dụ: https://your-project.supabase.co
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YmducWt3dmJkemF4eWFtZmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTEwODIsImV4cCI6MjA3MTQ4NzA4Mn0.RulX8AIBdwPw9kB97K6zJ0m_8Vg4PNRptDrkMzh2eXY', // Public anon key từ Supabase
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YmducWt3dmJkemF4eWFtZmFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTkxMTA4MiwiZXhwIjoyMDcxNDg3MDgyfQ.iWQPOdfrmiSQgXToODtrcYLpdV-Ymii-lwwVrQgnP2E' // Service role key (chỉ dùng ở backend)
};

// Khởi tạo Supabase client
let supabase = typeof window !== 'undefined' && window.supabase &&
               typeof window.supabase.from === 'function'
               ? window.supabase
               : null;

// Promise đánh dấu khi Supabase sẵn sàng
let supabaseReadyResolve;
const supabaseReady = new Promise((resolve) => { supabaseReadyResolve = resolve; });

// Function để khởi tạo Supabase (chỉ khi có config)
function initSupabase() {
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
        console.warn('⚠️ Vui lòng cập nhật SUPABASE_CONFIG trong js/supabase-config.js');
        return false;
    }
    
    try {
        // Kiểm tra xem Supabase library đã được load chưa
        if (typeof window === 'undefined') {
            console.warn('⚠️ Không có window context');
            return false;
        }

        // Nếu đã có client hợp lệ thì không tạo lại
        if (supabase && typeof supabase.from === 'function') {
            window.supabase = supabase;
            return true;
        }

        // Kiểm tra library đã được load (v2 gán factory tại window.supabase)
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            const client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            supabase = client;
            window.supabase = client;
            console.log('✅ Supabase client đã được khởi tạo thành công');
            if (typeof supabaseReadyResolve === 'function') supabaseReadyResolve();
            return true;
        }

        console.warn('⚠️ Supabase library chưa được load. Vui lòng thêm script tag.');
        return false;
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
    isReady: () => supabase !== null,
    whenReady: () => supabase ? Promise.resolve() : supabaseReady
};

// Tự động khởi tạo khi file được load
if (typeof window !== 'undefined' && window.supabase) {
    // Đợi một chút để đảm bảo DOM đã sẵn sàng
    setTimeout(() => {
        initSupabase();
    }, 100);
}
