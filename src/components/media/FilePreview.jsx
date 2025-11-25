// src/components/media/FilePreview.jsx
import React, { useState } from 'react';
import ImageLightbox from './ImageLightbox';

const FilePreview = ({ files, onRemove }) => {
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!files || files.length === 0) return null;

  return (
    <>
      <div className="file-preview-container">
        {files.map((file, index) => (
          <div key={index} className="file-preview-item">
            <img 
              src={URL.createObjectURL(file)} 
              alt={file.name}
              className="file-preview-img"
              onClick={() => setLightboxImage(URL.createObjectURL(file))}
            />
            <button 
              className="file-preview-remove"
              onClick={() => onRemove(index)}
              title="Remove image"
            >
              ✕
            </button>
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

export default FilePreview;