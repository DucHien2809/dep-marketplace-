# 🐛 Fix Image Upload Logic - Collection Gallery

## Vấn đề ban đầu
Khi upload ảnh trong Collection Gallery, có một bug:
- **Upload nhiều ảnh cùng lúc (Ctrl/Shift + click)**: ✅ Hoạt động bình thường
- **Upload từng ảnh một**: ❌ Ảnh sau sẽ đè lên ảnh trước thay vì thêm vào

## 🔧 Giải pháp đã thực hiện

### 1. Sửa logic trong `handleImageUpload()`
- **Trước**: Luôn xóa toàn bộ preview (`preview.innerHTML = ''`) trước khi thêm ảnh mới
- **Sau**: Kiểm tra số lượng file được chọn:
  - Nếu chỉ 1 file và đã có ảnh trong preview → **Thêm vào** (không xóa)
  - Nếu nhiều file hoặc lần đầu upload → **Thay thế** (xóa hết và thêm mới)

### 2. Thêm Preview Controls
- **Nút "Xóa tất cả"**: Xóa toàn bộ ảnh trong preview
- **Đếm số ảnh**: Hiển thị số lượng ảnh hiện tại
- **Responsive design**: Tự động ẩn/hiện controls

### 3. Cải thiện User Experience
- **Validation số lượng ảnh**: Giới hạn tối đa 5 ảnh
- **Thông báo rõ ràng**: Toast messages khi có lỗi hoặc thành công
- **Giao diện đẹp**: CSS được cải thiện với gradients và animations

### 4. Sửa logic trong Edit Mode
- Áp dụng cùng logic cho `handleEditImageUpload()`
- Đảm bảo tính nhất quán giữa upload mới và edit

## 📁 Files đã sửa

### JavaScript
- `js/collection-gallery.js`
  - `handleImageUpload()` - Logic chính
  - `handleEditImageUpload()` - Logic edit
  - `updatePreviewControls()` - Cập nhật controls
  - `clearAllImages()` - Xóa tất cả ảnh

### CSS
- `styles/gallery.css`
  - Styling cho preview controls
  - Responsive design
  - Animations và hover effects

### Test Files
- `test-image-upload.html` - File test để kiểm tra logic

## 🧪 Cách test

### Test Case 1: Upload từng ảnh một
1. Mở modal upload
2. Chọn 1 ảnh → ảnh hiển thị
3. Chọn thêm 1 ảnh khác → ảnh mới được thêm vào (không thay thế)
4. Lặp lại để test

### Test Case 2: Upload nhiều ảnh cùng lúc
1. Giữ Ctrl (hoặc Cmd trên Mac)
2. Chọn nhiều ảnh cùng lúc
3. Ảnh sẽ thay thế toàn bộ preview cũ

### Test Case 3: Xóa ảnh
1. Click nút X (đỏ) trên từng ảnh để xóa
2. Click "Xóa tất cả" để xóa toàn bộ

## 🎯 Kết quả mong đợi

- ✅ **Upload từng ảnh một**: Ảnh mới được thêm vào, không thay thế ảnh cũ
- ✅ **Upload nhiều ảnh cùng lúc**: Thay thế toàn bộ preview
- ✅ **Hiển thị số lượng ảnh**: Controls hiển thị số ảnh hiện tại
- ✅ **Nút "Xóa tất cả"**: Hoạt động đúng
- ✅ **Validation**: Giới hạn số lượng ảnh tối đa
- ✅ **Responsive**: Giao diện đẹp trên mọi thiết bị

## 🔍 Technical Details

### Logic chính
```javascript
// Check if this is a single file upload (additive) or multiple file upload (replace)
const isSingleFileUpload = files.length === 1;
const existingImages = preview.querySelectorAll('.image-preview-item');

if (isSingleFileUpload && existingImages.length > 0) {
    // Single file upload: add to existing
    console.log('📸 Single file upload detected, adding to existing images...');
} else {
    // Multiple files or first upload: replace
    console.log('📸 Multiple files or first upload detected, clearing preview...');
    preview.innerHTML = ''; // Clear and add controls
}
```

### Validation
```javascript
// Check maximum image limit
const maxImages = CONFIG.gallery?.maxFiles || 5;
if (existingImages.length + files.length > maxImages) {
    Utils.showToast(`Bạn chỉ có thể upload tối đa ${maxImages} ảnh. Hiện tại đã có ${existingImages.length} ảnh.`, 'warning');
    return;
}
```

## 🚀 Deployment

Sau khi sửa, tính năng upload ảnh sẽ hoạt động đúng:
1. Upload từng ảnh một → Ảnh được thêm vào gallery
2. Upload nhiều ảnh cùng lúc → Thay thế toàn bộ gallery
3. Giao diện đẹp và responsive
4. Validation và thông báo rõ ràng

## 📝 Notes

- Logic này áp dụng cho cả upload mới và edit
- Số lượng ảnh tối đa có thể điều chỉnh trong `CONFIG.gallery.maxFiles`
- CSS được tối ưu cho mobile và desktop
- Tất cả thay đổi đều backward compatible
