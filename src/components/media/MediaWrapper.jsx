import React, { useRef, useEffect } from 'react';
import VideoControls from './VideoControls';

const MediaWrapper = ({ mediaType, mediaUrl }) => {
  const mediaRef = useRef(null);

  if (!mediaType || !mediaUrl) return null;

  if (mediaType === 'image') {
    return (
      <div className="media-wrapper" data-media-type="image">
        <div className="media-container">
          <img src={mediaUrl} alt="Shared content" className="media-content" ref={mediaRef} />
          <div className="grain-overlay"></div>
        </div>
      </div>
    );
  }

  if (mediaType === 'video') {
    return (
      <div className="media-wrapper" data-media-type="video">
        <div className="media-container">
          <div className="target">
            <video className="media-content" loop muted ref={mediaRef}>
              <source src={mediaUrl} type="video/mp4" />
            </video>
            <VideoControls mediaRef={mediaRef} />
            <div className="grain-overlay"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default MediaWrapper;