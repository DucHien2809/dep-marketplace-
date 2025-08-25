// Blog Management System
class BlogManager {
    constructor() {
        this.blogPosts = [];
        this.currentCategory = 'all';
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.isAdmin = false;
        this.init();
    }

    async init() {
        this.checkAdminStatus();
        this.bindEvents();
        
        // Initialize Supabase if available
        if (window.SupabaseConfig) {
            window.SupabaseConfig.init();
        }
        
        await this.loadBlogPosts();
    }

    checkAdminStatus() {
        // Check if user is admin (you can modify this logic based on your auth system)
        const userRole = localStorage.getItem('userRole') || 'user';
        this.isAdmin = userRole === 'admin';
        
        // Show/hide admin panel
        const adminPanel = document.getElementById('blog-admin-panel');
        if (adminPanel) {
            adminPanel.style.display = this.isAdmin ? 'block' : 'none';
        }
        
        // For demo purposes, add admin toggle to console
        if (!this.isAdmin) {
            console.log('💡 Để test chức năng admin, chạy: blogManager.toggleAdmin()');
        }
    }

    // Demo method to toggle admin status
    toggleAdmin() {
        const currentRole = localStorage.getItem('userRole') || 'user';
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        localStorage.setItem('userRole', newRole);
        console.log(`🔄 Đã chuyển role thành: ${newRole}`);
        
        // Reload to apply changes
        this.checkAdminStatus();
        this.renderBlogPosts();
        
        alert(`Đã chuyển role thành: ${newRole === 'admin' ? 'Admin' : 'User'}`);
    }

    bindEvents() {
        // Category filter events
        document.querySelectorAll('.category-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.getAttribute('data-category');
                this.currentPage = 1;
                this.renderBlogPosts();
            });
        });

        // User blog creation events (available to all users)
        const userWriteBlogBtn = document.getElementById('user-write-blog-btn');
        if (userWriteBlogBtn) {
            userWriteBlogBtn.addEventListener('click', () => this.openPostModal(null, 'user'));
        }

        // Modal events (available to all users)
        const closeModalBtn = document.getElementById('close-blog-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closePostModal());
        }

        const blogForm = document.getElementById('blog-post-form');
        if (blogForm) {
            blogForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        }

        const saveDraftBtn = document.getElementById('save-draft-btn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.saveDraft());
        }

        const imageInput = document.getElementById('post-image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Admin events
        if (this.isAdmin) {
            const addPostBtn = document.getElementById('add-blog-post-btn');
            if (addPostBtn) {
                addPostBtn.addEventListener('click', () => this.openPostModal());
            }
        }

        // Modal close on backdrop click
        const modal = document.getElementById('blog-post-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closePostModal();
                }
            });
        }
    }

    async loadBlogPosts() {
        try {
            // Try to load from database first
            if (window.SupabaseConfig && window.SupabaseConfig.isReady()) {
                await this.loadFromDatabase();
            } else {
                // Fallback to localStorage
                this.blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
                console.log('📝 Sử dụng localStorage (database chưa sẵn sàng)');
            }
        } catch (error) {
            console.error('❌ Lỗi load blog posts:', error);
            // Fallback to localStorage
            this.blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        }
        
        this.renderBlogPosts();
    }

    async loadFromDatabase() {
        const supabase = window.SupabaseConfig.getClient();
        
        try {
            let query = supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            // If not admin, only show published posts
            if (!this.isAdmin) {
                query = query.eq('status', 'published');
            }

            const { data, error } = await query;
            
            if (error) {
                throw error;
            }

            // Transform database data to match our format
            this.blogPosts = data.map(post => ({
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                content: post.content,
                category: post.category,
                image: post.image_url || 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&h=400&fit=crop',
                author: post.author,
                publishedAt: new Date(post.published_at || post.created_at),
                status: post.status,
                tags: post.tags || [],
                views: post.views || 0,
                likes: post.likes || 0,
                userPost: post.user_id !== this.getCurrentUserId()
            }));

            console.log(`✅ Đã load ${this.blogPosts.length} bài viết từ database`);
        } catch (error) {
            console.error('❌ Lỗi load từ database:', error);
            throw error;
        }
    }

    renderBlogPosts() {
        const container = document.getElementById('blog-posts');
        if (!container) return;

        // Filter posts by category
        let filteredPosts = this.currentCategory === 'all' 
            ? this.blogPosts 
            : this.blogPosts.filter(post => post.category === this.currentCategory);

        // Filter only published posts for non-admin users
        if (!this.isAdmin) {
            filteredPosts = filteredPosts.filter(post => post.status === 'published');
        }

        if (filteredPosts.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        // Pagination
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        container.innerHTML = paginatedPosts.map(post => this.renderBlogPost(post)).join('');

        // Render pagination
        this.renderPagination(filteredPosts.length);

        // Bind post events
        this.bindPostEvents();
    }

    renderBlogPost(post) {
        const categoryLabels = {
            styling: 'Phối đồ',
            sustainability: 'Bền vững',
            care: 'Chăm sóc',
            stories: 'Câu chuyện'
        };

        const adminActions = this.isAdmin ? `
            <div class="admin-actions">
                <button class="admin-btn edit" data-id="${post.id}" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="admin-btn delete" data-id="${post.id}" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        ` : '';

        return `
            <article class="blog-post" data-id="${post.id}">
                <div class="blog-post-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <div class="blog-category-badge">${categoryLabels[post.category] || post.category}</div>
                    ${adminActions}
                </div>
                <div class="blog-post-content">
                    <h2 class="blog-post-title">${post.title}</h2>
                    <div class="blog-post-meta">
                        <div class="blog-post-date">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(post.publishedAt)}
                        </div>
                        <div class="blog-post-author">
                            <i class="fas fa-user"></i>
                            ${post.author}
                        </div>
                        ${post.views ? `
                            <div class="blog-post-views">
                                <i class="fas fa-eye"></i>
                                ${post.views} lượt xem
                            </div>
                        ` : ''}
                    </div>
                    <p class="blog-post-excerpt">${post.excerpt}</p>
                    <div class="blog-post-footer">
                        <div class="blog-post-tags">
                            ${post.tags ? post.tags.map(tag => `
                                <a href="#" class="blog-tag" data-tag="${tag}">#${tag}</a>
                            `).join('') : ''}
                        </div>
                        <a href="#" class="read-more-btn" data-id="${post.id}">
                            Đọc thêm <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    renderEmptyState() {
        const isFiltered = this.currentCategory !== 'all';
        return `
            <div class="blog-empty-state">
                <i class="fas fa-blog"></i>
                <h3>${isFiltered ? 'Không có bài viết nào trong danh mục này' : 'Chưa có bài viết nào'}</h3>
                <p>${isFiltered ? 'Hãy thử chọn danh mục khác hoặc quay lại sau.' : 'Hãy là người đầu tiên chia sẻ câu chuyện thời trang bền vững của bạn!'}</p>
                <div class="empty-actions">
                    ${this.isAdmin ? `
                        <button class="btn btn-primary" onclick="blogManager.openPostModal()">
                            <i class="fas fa-plus"></i>
                            Tạo bài viết đầu tiên
                        </button>
                    ` : `
                        <button class="btn btn-secondary" onclick="blogManager.openPostModal(null, 'user')">
                            <i class="fas fa-edit"></i>
                            Viết blog đầu tiên
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    renderPagination(totalPosts) {
        const totalPages = Math.ceil(totalPosts / this.postsPerPage);
        const container = document.getElementById('blog-pagination');
        
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let pagination = '<button class="prev-btn" ' + (this.currentPage === 1 ? 'disabled' : '') + '>← Trước</button>';
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                pagination += `<button class="active">${i}</button>`;
            } else {
                pagination += `<button data-page="${i}">${i}</button>`;
            }
        }
        
        pagination += '<button class="next-btn" ' + (this.currentPage === totalPages ? 'disabled' : '') + '>Sau →</button>';
        
        container.innerHTML = pagination;

        // Bind pagination events
        container.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentPage = parseInt(btn.getAttribute('data-page'));
                this.renderBlogPosts();
            });
        });

        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        
        if (prevBtn && !prevBtn.disabled) {
            prevBtn.addEventListener('click', () => {
                this.currentPage--;
                this.renderBlogPosts();
            });
        }
        
        if (nextBtn && !nextBtn.disabled) {
            nextBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderBlogPosts();
            });
        }
    }

    bindPostEvents() {
        // Read more buttons
        document.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = parseInt(btn.getAttribute('data-id'));
                this.openPostDetail(postId);
            });
        });

        // Tag clicks
        document.querySelectorAll('.blog-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                const tagName = tag.getAttribute('data-tag');
                this.filterByTag(tagName);
            });
        });

        // Admin actions
        if (this.isAdmin) {
            document.querySelectorAll('.admin-btn.edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const postId = parseInt(btn.getAttribute('data-id'));
                    this.editPost(postId);
                });
            });

            document.querySelectorAll('.admin-btn.delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const postId = parseInt(btn.getAttribute('data-id'));
                    this.deletePost(postId);
                });
            });
        }
    }

    // Blog Creation Methods (Available to Admin and Users)
    openPostModal(postId = null, userType = 'admin') {
        const modal = document.getElementById('blog-post-modal');
        const form = document.getElementById('blog-post-form');
        const title = document.getElementById('modal-title');
        const statusField = document.getElementById('post-status');
        
        // Set default status based on user type
        if (statusField) {
            if (userType === 'user') {
                statusField.value = 'draft'; // User posts start as draft
                statusField.disabled = true; // Users can't change status
            } else {
                statusField.disabled = false; // Admins can change status
            }
        }
        
        if (postId) {
            const post = this.blogPosts.find(p => p.id === postId);
            if (post) {
                title.textContent = 'Chỉnh sửa bài viết';
                this.fillFormWithPost(post);
            }
        } else {
            if (userType === 'user') {
                title.textContent = 'Chia sẻ câu chuyện của bạn';
            } else {
                title.textContent = 'Tạo bài viết mới';
            }
            form.reset();
            document.getElementById('post-image-preview').innerHTML = '';
        }
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closePostModal() {
        const modal = document.getElementById('blog-post-modal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    fillFormWithPost(post) {
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-status').value = post.status;
        document.getElementById('post-excerpt').value = post.excerpt;
        document.getElementById('post-content').value = post.content;
        document.getElementById('post-tags').value = post.tags ? post.tags.join(', ') : '';
        
        if (post.image) {
            document.getElementById('post-image-preview').innerHTML = 
                `<img src="${post.image}" alt="Preview">`;
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('post-image-preview').innerHTML = 
                    `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    }

    async handlePostSubmit(e) {
        e.preventDefault();
        
        // Remove admin-only restriction - allow all logged-in users to post
        const currentUser = localStorage.getItem('userEmail') || 'Thành viên cộng đồng';

        const formData = new FormData(e.target);
        const postData = {
            id: Date.now(), // In production, this would be generated by the server
            title: formData.get('title'),
            category: formData.get('category'),
            status: formData.get('status') || 'draft', // Default to draft for user posts
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
            author: this.isAdmin ? 'Đẹp Team' : currentUser,
            publishedAt: new Date(),
            views: 0,
            userPost: !this.isAdmin // Mark if this is a user post
        };

        // Handle image
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            // In production, upload to server and get URL
            const reader = new FileReader();
            reader.onload = (e) => {
                postData.image = e.target.result;
                this.savePost(postData);
            };
            reader.readAsDataURL(imageFile);
        } else {
            postData.image = 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&h=400&fit=crop'; // Default image
            this.savePost(postData);
        }
    }

    async savePost(postData) {
        try {
            // Try to save to database first
            if (window.SupabaseConfig && window.SupabaseConfig.isReady()) {
                await this.saveToDatabase(postData);
            } else {
                // Fallback to localStorage
                this.saveToLocalStorage(postData);
            }
            
            // Re-render posts
            this.renderBlogPosts();
            
            // Close modal
            this.closePostModal();
            
            const message = postData.userPost ? 
                'Cảm ơn bạn đã chia sẻ! Bài viết của bạn đã được lưu và sẽ được admin duyệt trước khi xuất bản.' :
                'Bài viết đã được tạo thành công!';
            alert(message);
            
        } catch (error) {
            console.error('❌ Lỗi lưu bài viết:', error);
            alert('❌ Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại.');
        }
    }

    async saveToDatabase(postData) {
        const supabase = window.SupabaseConfig.getClient();
        const currentUserId = this.getCurrentUserId();
        
        if (!currentUserId) {
            throw new Error('User chưa đăng nhập');
        }

        // Prepare data for database
        const dbData = {
            user_id: currentUserId,
            title: postData.title,
            excerpt: postData.excerpt,
            content: postData.content,
            category: postData.category,
            status: postData.status,
            image_url: postData.image,
            tags: postData.tags,
            author: postData.author,
            published_at: postData.status === 'published' ? new Date().toISOString() : null
        };

        const { data, error } = await supabase
            .from('blog_posts')
            .insert([dbData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Update local array with database data
        const savedPost = {
            ...postData,
            id: data.id,
            userPost: !this.isAdmin
        };
        
        this.blogPosts.unshift(savedPost);
        console.log('✅ Đã lưu bài viết vào database:', data.id);
    }

    async saveToDatabase(postData) {
        try {
            const dbData = {
                title: postData.title,
                category: postData.category,
                excerpt: postData.excerpt,
                content: postData.content,
                tags: postData.tags,
                author_id: this.getCurrentUserId(),
                author_name: this.getCurrentUserName()
            };

            const { data, error } = await window.supabase
                .from('blog_posts')
                .insert([dbData])
                .select()
                .single();

            if (error) {
                throw error;
            }

            // Update local array with database data
            const savedPost = {
                ...postData,
                id: data.id,
                userPost: !this.isAdmin
            };
            
            this.blogPosts.unshift(savedPost);
            console.log('✅ Đã lưu bài viết vào database:', data.id);
        } catch (error) {
            console.warn('Không thể lưu vào database:', error);
            // Fallback to localStorage
            this.saveToLocalStorage(postData);
        }
    }

    saveToLocalStorage(postData) {
        // Add to blog posts array
        this.blogPosts.unshift(postData);
        
        // Save to localStorage
        localStorage.setItem('blogPosts', JSON.stringify(this.blogPosts));
        console.log('📝 Đã lưu bài viết vào localStorage');
    }

    async saveDraft() {
        try {
            const formData = new FormData(document.getElementById('blog-post-form'));
            const draftData = {
                title: formData.get('title'),
                category: formData.get('category'),
                excerpt: formData.get('excerpt'),
                content: formData.get('content'),
                tags: formData.get('tags'),
                savedAt: new Date()
            };

            // Lưu vào database thay vì localStorage
            const { data, error } = await window.supabase
                .rpc('save_user_draft', {
                    p_user_id: this.getCurrentUserId(),
                    p_draft_type: 'blog',
                    p_draft_data: draftData
                });

            if (error) {
                console.warn('Không thể lưu nháp vào database:', error);
                // Fallback to localStorage
                localStorage.setItem('blog_draft', JSON.stringify(draftData));
                alert('Đã lưu nháp thành công (localStorage)!');
            } else {
                console.log('✅ Đã lưu nháp vào database:', data);
                alert('Đã lưu nháp thành công!');
            }
        } catch (error) {
            console.warn('Lỗi khi lưu nháp:', error);
            // Fallback to localStorage
            const formData = new FormData(document.getElementById('blog-post-form'));
            const draftData = {
                title: formData.get('title'),
                category: formData.get('category'),
                excerpt: formData.get('excerpt'),
                content: formData.get('content'),
                tags: formData.get('tags'),
                savedAt: new Date()
            };
            localStorage.setItem('blog_draft', JSON.stringify(draftData));
            alert('Đã lưu nháp thành công (localStorage)!');
        }
    }

    editPost(postId) {
        this.openPostModal(postId);
    }

    deletePost(postId) {
        if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            this.blogPosts = this.blogPosts.filter(post => post.id !== postId);
            this.renderBlogPosts();
            alert('Đã xóa bài viết thành công!');
        }
    }

    // Utility Methods
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

    getCurrentUserName() {
        // Lấy user name từ auth system hoặc localStorage
        if (window.supabase && window.supabase.auth) {
            const user = window.supabase.auth.user();
            if (user && user.user_metadata) {
                return user.user_metadata.full_name || user.email || 'Thành viên cộng đồng';
            }
        }
        
        // Fallback to localStorage
        return localStorage.getItem('userName') || 
               localStorage.getItem('userEmail') || 
               'Thành viên cộng đồng';
    }

    openPostDetail(postId) {
        const post = this.blogPosts.find(p => p.id === postId);
        if (post) {
            // Increment views
            post.views = (post.views || 0) + 1;
            
            // In a real application, you would navigate to a detailed post page
            alert(`Chi tiết bài viết: ${post.title}\n\nTính năng chi tiết sẽ được phát triển trong phiên bản tiếp theo.`);
        }
    }

    filterByTag(tagName) {
        // In a real application, you would implement tag-based filtering
        alert(`Lọc theo tag: ${tagName}\n\nTính năng này sẽ được phát triển trong phiên bản tiếp theo.`);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date(date));
    }
}

// Initialize when DOM is loaded
let blogManager;
document.addEventListener('DOMContentLoaded', () => {
    blogManager = new BlogManager();
});

// Export for global access
window.blogManager = blogManager;
