import React, { useState, useRef, useEffect } from 'react';

const VideoControls = ({ mediaRef }) => {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = volume / 100;
    }
  }, [volume, mediaRef]);

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (delta) => {
    const newVolume = Math.max(0, Math.min(100, volume + delta));
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  return (
    <div className="video-controls">
      <div className="visualizer-container">
        <canvas 
          ref={canvasRef} 
          className="audio-visualizer" 
          width="100" 
          height="40"
        ></canvas>
      </div>
      <div className="volume-container">
        <button className="volume-button" onClick={toggleMute}>
          <div className="volume-indicator">
            {isMuted || volume === 0 ? '0' : volume}
          </div>
        </button>
      </div>
    </div>
  );
};

export default VideoControls;