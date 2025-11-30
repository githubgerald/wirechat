export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const base64ToFile = (base64, filename, mimeType) => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new File([ab], filename, { type: mimeType });
};

export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.webm']
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not supported');
  }

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    errors.push('File extension not supported');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getFileType = (file) => {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('video/')) {
    return 'video';
  } else if (file.type.startsWith('audio/')) {
    return 'audio';
  } else {
    return 'file';
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType) => {
  const icons = {
    image: '🖼️',
    video: '🎥',
    audio: '🎵',
    pdf: '📄',
    document: '📝',
    spreadsheet: '📊',
    presentation: '📑',
    archive: '📦',
    file: '📎'
  };

  return icons[fileType] || icons.file;
};

export const createFilePreview = (file) => {
  return new Promise((resolve, reject) => {
    const fileType = getFileType(file);
    
    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => resolve({
        type: 'image',
        url: e.target.result,
        name: file.name,
        size: formatFileSize(file.size)
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else if (fileType === 'video') {
      const reader = new FileReader();
      reader.onload = (e) => resolve({
        type: 'video',
        url: e.target.result,
        name: file.name,
        size: formatFileSize(file.size),
        thumbnail: null // Could generate thumbnail from video
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      resolve({
        type: fileType,
        name: file.name,
        size: formatFileSize(file.size),
        icon: getFileIcon(fileType)
      });
    }
  });
};

export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const compressImage = (file, quality = 1, maxWidth = 1920) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};