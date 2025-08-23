// Quick test script to debug gallery
console.log('🧪 Testing Gallery directly...');

// Force create gallery page
function testGallery() {
    const mainContent = document.querySelector('.main-content');
    console.log('Main content:', mainContent);
    
    // Simple direct test
    const testHTML = `
        <div id="dep-collection-page" class="page active">
            <div style="padding: 50px; background: white;">
                <h1 style="color: green;">✅ Đẹp Collection Test</h1>
                <div class="admin-controls admin-only" style="display: block !important;">
                    <button class="btn btn-primary" id="upload-gallery-btn" style="padding: 15px 25px; background: blue; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        📸 Upload ảnh mới
                    </button>
                </div>
                <div id="gallery-grid" style="margin-top: 30px;">
                    <div style="padding: 20px; background: #f0f0f0; border-radius: 8px;">
                        Sample gallery items sẽ hiển thị ở đây
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Hide all existing pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove existing dep-collection-page if any
    const existing = document.getElementById('dep-collection-page');
    if (existing) {
        existing.remove();
    }
    
    // Add test page
    mainContent.insertAdjacentHTML('beforeend', testHTML);
    
    // Test upload button click
    const uploadBtn = document.getElementById('upload-gallery-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            alert('✅ Upload button hoạt động! Modal sẽ mở ở đây.');
        });
        console.log('✅ Upload button added successfully!');
    }
    
    console.log('✅ Test gallery page created!');
}

// Run test immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testGallery);
} else {
    testGallery();
}
