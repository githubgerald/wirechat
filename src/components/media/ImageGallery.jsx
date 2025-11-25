// src/components/media/ImageGallery.jsx
import React, { useState } from 'react';
import ImageLightbox from './ImageLightbox';

const ImageGallery = ({ images }) => {
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!images || images.length === 0) return null;

  const getGridClass = (count) => {
    if (count === 1) return 'image-gallery-single';
    if (count === 2) return 'image-gallery-double';
    if (count === 3) return 'image-gallery-triple';
    return 'image-gallery-grid'; // 4+ images
  };

  return (
    <>
      <div className={`image-gallery ${getGridClass(images.length)}`}>
        {images.map((imageUrl, index) => (
          <div 
            key={index} 
            className="image-gallery-item"
            onClick={() => setLightboxImage(imageUrl)}
          >
            <img 
              src={imageUrl} 
              alt={`Shared content ${index + 1}`}
              className="image-gallery-img"
            />
            <div className="grain-overlay"></div>
          </div>
        ))}
      </div>

      {lightboxImage && (
        <ImageLightbox 
          imageUrl={lightboxImage} 
          onClose={() => setLightboxImage(null)} 
        />
      )}
    </>
  );
};

export default ImageGallery;