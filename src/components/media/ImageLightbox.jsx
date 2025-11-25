// src/components/media/ImageLightbox.jsx
import React, { useEffect } from 'react';

const ImageLightbox = ({ imageUrl, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div className="image-lightbox-overlay" onClick={onClose}>
      <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-lightbox-close" onClick={onClose}>
          ✕
        </button>
        <img 
          src={imageUrl} 
          alt="Full size preview" 
          className="image-lightbox-img"
        />
      </div>
    </div>
  );
};

export default ImageLightbox;