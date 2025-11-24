import { useState, useRef, useEffect } from 'react';

export const useMedia = (mediaElement) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (mediaElement && mediaElement.current) {
      mediaElement.current.volume = volume / 100;
      mediaElement.current.muted = isMuted;
    }
  }, [volume, isMuted, mediaElement]);

  const togglePlayPause = () => {
    if (!mediaElement?.current) return;

    if (isPlaying) {
      mediaElement.current.pause();
    } else {
      mediaElement.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    setVolume(clampedVolume);
    setIsMuted(clampedVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Store current volume before muting
      localStorage.setItem('previousVolume', volume.toString());
    } else {
      // Restore previous volume
      const previousVolume = localStorage.getItem('previousVolume');
      if (previousVolume) {
        setVolume(parseInt(previousVolume));
      }
    }
  };

  const initializeAudioContext = () => {
    if (!mediaElement?.current || audioContextRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaElementSource(mediaElement.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  };

  const getAudioData = () => {
    if (!analyserRef.current) return new Uint8Array(0);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);
    
    return dataArray;
  };

  return {
    isPlaying,
    volume,
    isMuted,
    togglePlayPause,
    handleVolumeChange,
    toggleMute,
    initializeAudioContext,
    getAudioData
  };
};