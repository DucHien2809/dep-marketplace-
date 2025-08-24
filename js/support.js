// Support Page Management
class SupportManager {
    constructor() {
        this.faqData = [];
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.loadFAQData();
        this.bindEvents();
    }

    initializePage() {
        this.renderFAQ();
    }

    loadFAQData() {
        this.faqData = [
            // Buying FAQ
            {
                id: 1,
                category: 'buying',
                question: 'Làm thế nào để đặt hàng?',
                answer: 'Bạn có thể duyệt sản phẩm trên trang Đẹp Collection hoặc Marketplace, thêm vào giỏ hàng và thanh toán an toàn qua hệ thống của chúng tôi. Chúng tôi hỗ trợ nhiều phương thức thanh toán tiện lợi.'
            },
            {
                id: 2,
                category: 'buying',
                question: 'Tôi có thể hủy đơn hàng không?',
                answer: 'Bạn có thể hủy đơn hàng trong vòng 1 giờ sau khi đặt hàng nếu đơn hàng chưa được xác nhận. Sau thời gian này, vui lòng liên hệ hotline để được hỗ trợ.'
            },
            {
                id: 3,
                category: 'buying',
                question: 'Làm sao biết sản phẩm còn hàng?',
                answer: 'Tất cả sản phẩm hiển thị trên website đều còn hàng. Nếu sản phẩm hết hàng, nó sẽ tự động được ẩn khỏi website. Bạn có thể yên tâm đặt hàng.'
            },

            // Consignment FAQ
            {
                id: 4,
                category: 'consignment',
                question: 'Điều kiện ký gửi sản phẩm là gì?',
                answer: 'Sản phẩm phải còn tình trạng tốt (từ 70% trở lên), có ảnh chụp rõ ràng, mô tả chi tiết về size, thương hiệu và tình trạng. Chúng tôi ưu tiên các thương hiệu nổi tiếng và sản phẩm có giá trị.'
            },
            {
                id: 5,
                category: 'consignment',
                question: 'Phí ký gửi là bao nhiêu?',
                answer: 'Đẹp thu phí dịch vụ 15% trên giá bán thành công. Bạn sẽ nhận được 85% giá trị đơn hàng. Chúng tôi không thu phí đăng sản phẩm hoặc phí ẩn nào khác.'
            },
            {
                id: 6,
                category: 'consignment',
                question: 'Khi nào tôi nhận được tiền?',
                answer: 'Sau khi sản phẩm được bán thành công và khách hàng nhận hàng, bạn sẽ nhận được tiền trong vòng 7-10 ngày làm việc. Chúng tôi hỗ trợ chuyển khoản ngân hàng hoặc ví điện tử.'
            },
            {
                id: 7,
                category: 'consignment',
                question: 'Sản phẩm không bán được có lấy lại không?',
                answer: 'Sau 60 ngày không bán được, bạn có thể lấy lại sản phẩm hoặc giảm giá để tăng cơ hội bán. Chúng tôi sẽ thông báo trước khi thời hạn kết thúc.'
            },

            // Shipping FAQ
            {
                id: 8,
                category: 'shipping',
                question: 'Phí vận chuyển là bao nhiêu?',
                answer: 'Miễn phí vận chuyển cho đơn hàng từ 500.000đ trong nội thành TP.HCM và Hà Nội. Với các tỉnh thành khác và đơn hàng dưới 500.000đ, phí vận chuyển từ 30.000đ - 50.000đ.'
            },
            {
                id: 9,
                category: 'shipping',
                question: 'Thời gian giao hàng bao lâu?',
                answer: 'Nội thành: 1-2 ngày làm việc. Ngoại thành và các tỉnh: 2-5 ngày làm việc. Chúng tôi sẽ gửi mã tracking để bạn theo dõi đơn hàng.'
            },
            {
                id: 10,
                category: 'shipping',
                question: 'Tôi có thể thay đổi địa chỉ giao hàng không?',
                answer: 'Bạn có thể thay đổi địa chỉ giao hàng trong vòng 2 giờ sau khi đặt hàng. Sau thời gian này, vui lòng liên hệ hotline để được hỗ trợ.'
            },

            // Return FAQ
            {
                id: 11,
                category: 'return',
                question: 'Chính sách đổi trả như thế nào?',
                answer: 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày kể từ khi nhận hàng. Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng và có đầy đủ nhãn mác.'
            },
            {
                id: 12,
                category: 'return',
                question: 'Tôi có phải trả phí ship khi đổi trả không?',
                answer: 'Nếu lỗi do shop (sai size, sai màu, hàng lỗi), chúng tôi sẽ chịu phí ship đổi trả. Nếu do khách hàng đổi ý, khách hàng sẽ chịu phí ship.'
            },
            {
                id: 13,
                category: 'return',
                question: 'Khi nào tôi được hoàn tiền?',
                answer: 'Sau khi chúng tôi nhận và kiểm tra sản phẩm đổi trả, tiền sẽ được hoàn lại trong vòng 3-5 ngày làm việc vào tài khoản thanh toán ban đầu.'
            },

            // Payment FAQ
            {
                id: 14,
                category: 'payment',
                question: 'Các phương thức thanh toán nào được hỗ trợ?',
                answer: 'Chúng tôi hỗ trợ: Chuyển khoản ngân hàng, Ví điện tử (MoMo, ZaloPay), Thẻ tín dụng/ghi nợ, và Thanh toán khi nhận hàng (COD) cho một số khu vực.'
            },
            {
                id: 15,
                category: 'payment',
                question: 'Thanh toán có an toàn không?',
                answer: 'Tuyệt đối an toàn. Chúng tôi sử dụng hệ thống bảo mật SSL 256-bit và không lưu trữ thông tin thẻ của khách hàng. Tất cả giao dịch đều được mã hóa.'
            },
            {
                id: 16,
                category: 'payment',
                question: 'Tôi có thể thanh toán trả góp không?',
                answer: 'Hiện tại chúng tôi chưa hỗ trợ thanh toán trả góp. Tuy nhiên, bạn có thể sử dụng thẻ tín dụng của ngân hàng có chức năng trả góp.'
            }
        ];
    }

    bindEvents() {
        // FAQ category buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('faq-category-btn')) {
                this.handleCategoryChange(e.target);
            }
        });

        // FAQ question toggle
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('faq-question')) {
                this.toggleFAQItem(e.target.closest('.faq-item'));
            }
        });

        // Quick action buttons
        const viewFaqBtn = document.getElementById('view-faq-btn');
        if (viewFaqBtn) {
            viewFaqBtn.addEventListener('click', () => {
                document.querySelector('.faq-section').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }

        const consignGuideBtn = document.getElementById('consign-guide-btn');
        if (consignGuideBtn) {
            consignGuideBtn.addEventListener('click', () => {
                this.showConsignGuide();
            });
        }

        const policyBtn = document.getElementById('policy-btn');
        if (policyBtn) {
            policyBtn.addEventListener('click', () => {
                this.showPolicies();
            });
        }

        // Chat button
        const startChatBtn = document.getElementById('start-chat-btn');
        if (startChatBtn) {
            startChatBtn.addEventListener('click', () => {
                this.startChat();
            });
        }

        // Contact form
        const contactForm = document.getElementById('support-contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                this.handleContactForm(e);
            });
        }
    }

    handleCategoryChange(button) {
        // Update active button
        document.querySelectorAll('.faq-category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Update current category
        this.currentCategory = button.getAttribute('data-category');

        // Re-render FAQ
        this.renderFAQ();
    }

    renderFAQ() {
        const container = document.getElementById('faq-container');
        if (!container) return;

        // Filter FAQ by category
        let filteredFAQ = this.currentCategory === 'all' 
            ? this.faqData 
            : this.faqData.filter(item => item.category === this.currentCategory);

        if (filteredFAQ.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        // Group by category for "all" view
        if (this.currentCategory === 'all') {
            container.innerHTML = this.renderAllCategories();
        } else {
            container.innerHTML = this.renderCategoryFAQ(filteredFAQ);
        }
    }

    renderAllCategories() {
        const categories = {
            'buying': 'Mua hàng',
            'consignment': 'Ký gửi', 
            'shipping': 'Vận chuyển',
            'return': 'Đổi trả',
            'payment': 'Thanh toán'
        };

        let html = '';
        Object.keys(categories).forEach(categoryKey => {
            const categoryFAQ = this.faqData.filter(item => item.category === categoryKey);
            if (categoryFAQ.length > 0) {
                html += `
                    <div class="faq-category-group">
                        <h3 class="faq-category-title">${categories[categoryKey]}</h3>
                        ${this.renderCategoryFAQ(categoryFAQ)}
                    </div>
                `;
            }
        });

        return html;
    }

    renderCategoryFAQ(faqItems) {
        return faqItems.map(item => `
            <div class="faq-item">
                <div class="faq-question">${item.question}</div>
                <div class="faq-answer">${item.answer}</div>
            </div>
        `).join('');
    }

    renderEmptyState() {
        return `
            <div class="faq-empty-state">
                <i class="fas fa-search"></i>
                <h3>Không tìm thấy câu hỏi nào</h3>
                <p>Hãy thử chọn danh mục khác hoặc liên hệ trực tiếp với chúng tôi</p>
            </div>
        `;
    }

    toggleFAQItem(faqItem) {
        faqItem.classList.toggle('active');
    }

    showConsignGuide() {
        alert(`📋 Hướng dẫn ký gửi chi tiết:

1. 📸 Chuẩn bị ảnh chất lượng cao (3-10 ảnh)
2. 📝 Điền thông tin chi tiết về sản phẩm
3. 💰 Đặt giá hợp lý (có thể tham khảo gợi ý AI)
4. ⏳ Chờ kiểm duyệt trong 24h
5. 🛒 Sản phẩm lên sàn và bắt đầu bán
6. 💵 Nhận tiền sau 7-10 ngày khi bán thành công

💡 Mẹo: Sản phẩm có ảnh đẹp và mô tả chi tiết sẽ bán nhanh hơn!

Bạn có thể bắt đầu ký gửi ngay tại trang "Ký gửi ngay".`);
    }

    showPolicies() {
        alert(`📋 Chính sách của Đẹp:

🛒 CHÍNH SÁCH MUA BÁN:
• Sản phẩm được kiểm tra chất lượng trước khi bán
• Hỗ trợ đổi trả trong 7 ngày
• Bảo hành sản phẩm theo chính sách từng thương hiệu

🚚 CHÍNH SÁCH VẬN CHUYỂN:
• Miễn phí ship đơn từ 500k
• Giao hàng 1-5 ngày tùy khu vực
• Hỗ trợ đóng gói cẩn thận

🔄 CHÍNH SÁCH ĐỔI TRẢ:
• Đổi trả trong 7 ngày kể từ khi nhận hàng
• Sản phẩm phải còn nguyên vẹn, có nhãn mác
• Hoàn tiền trong 3-5 ngày làm việc

💼 CHÍNH SÁCH KÝ GỬI:
• Phí dịch vụ 15% trên giá bán
• Sản phẩm được niêm yết 60 ngày
• Hỗ trợ tư vấn giá bán tối ưu

Chi tiết đầy đủ có tại website hoặc liên hệ hotline.`);
    }

    startChat() {
        // Simulate chat integration
        const chatBox = document.createElement('div');
        chatBox.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            height: 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            border: 1px solid #ddd;
            display: flex;
            flex-direction: column;
        `;

        chatBox.innerHTML = `
            <div style="background: var(--primary-color); color: white; padding: 15px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>💬 Chat hỗ trợ</strong>
                    <div style="font-size: 0.8rem; opacity: 0.9;">Đang trực tuyến</div>
                </div>
                <button onclick="this.closest('div').remove()" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">×</button>
            </div>
            <div style="flex: 1; padding: 15px; background: #f8f9fa;">
                <div style="background: white; padding: 10px; border-radius: 8px; margin-bottom: 10px; font-size: 0.9rem;">
                    👋 Xin chào! Tôi có thể giúp gì cho bạn?
                </div>
                <div style="background: white; padding: 10px; border-radius: 8px; margin-bottom: 10px; font-size: 0.9rem;">
                    Bạn có thể hỏi về:
                    <br>• Sản phẩm và đặt hàng
                    <br>• Ký gửi và bán hàng  
                    <br>• Vận chuyển và đổi trả
                    <br>• Thanh toán và chính sách
                </div>
            </div>
            <div style="padding: 15px; border-top: 1px solid #eee;">
                <div style="display: flex; gap: 10px;">
                    <input type="text" placeholder="Nhập tin nhắn..." style="flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 20px; font-size: 0.9rem;">
                    <button style="background: var(--primary-color); color: white; border: none; padding: 8px 12px; border-radius: 20px; cursor: pointer;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(chatBox);
    }

    handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: new Date()
        };

        // Simulate sending message
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('✅ Tin nhắn đã được gửi thành công!\n\nChúng tôi sẽ phản hồi qua email trong vòng 24 giờ.\n\nCảm ơn bạn đã liên hệ với Đẹp!');
            
            e.target.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
}

// Initialize when DOM is loaded
let supportManager;
document.addEventListener('DOMContentLoaded', () => {
    supportManager = new SupportManager();
});

// Export for global access
window.supportManager = supportManager;
