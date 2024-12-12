document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.querySelector('.upload-button');
    const previewContainer = document.querySelector('.preview-container');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalFile = null;

    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);

    // 拖放事件处理
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#007AFF';
        dropZone.style.background = '#F0F7FF';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#E5E5E5';
        dropZone.style.background = 'white';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#E5E5E5';
        dropZone.style.background = 'white';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 质量滑块事件
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
        if (originalFile) {
            compressImage(originalFile, this.value / 100);
        }
    });

    // 处理文件选择
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }

    // 处理文件
    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('请选择图片文件！');
            return;
        }

        originalFile = file;
        previewContainer.style.display = 'block';
        
        // 显示原始图片
        const reader = new FileReader();
        reader.onload = function(e) {
            originalImage.src = e.target.result;
            originalSize.textContent = formatFileSize(file.size);
            compressImage(file, qualitySlider.value / 100);
        };
        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage(file, quality) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // 限制最大尺寸，避免移动端内存问题
                const maxSize = 1920;
                let width = img.width;
                let height = img.height;
                
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = Math.round((height * maxSize) / width);
                        width = maxSize;
                    } else {
                        width = Math.round((width * maxSize) / height);
                        height = maxSize;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(function(blob) {
                    compressedImage.src = URL.createObjectURL(blob);
                    compressedSize.textContent = formatFileSize(blob.size);
                    
                    // 设置下载按钮
                    downloadBtn.onclick = function() {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = 'compressed_' + originalFile.name;
                        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                            link.target = '_blank';
                            link.rel = 'noopener';
                        }
                        link.click();
                    };
                }, file.type, quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 优化移动端拖放体验
    dropZone.addEventListener('touchstart', function(e) {
        e.preventDefault();
    });

    // 防止移动端缩放
    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // 移除 capture 属性，允许用户选择图片来源
    fileInput.removeAttribute('capture');
}); 