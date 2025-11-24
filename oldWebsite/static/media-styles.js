class MediaWrapper {
  constructor(element) {
    this.wrapper = element;
    this.mediaType = element.dataset.mediaType;
    this.mediaContent = element.querySelector(".media-content");
    this.volume = 50; // Default volume

    if (this.mediaType === "video") {
      this.initVideo();
    } else if (this.mediaType === "image") {
      this.initImage();
    }
  }

  initImage() {
    // Images will naturally size themselves within the max constraints
    this.mediaContent.addEventListener("load", () => {});
  }

  initVideo() {
    this.video = this.mediaContent;
    this.controls = this.wrapper.querySelector(".video-controls");
    this.volumeButton = this.wrapper.querySelector(".volume-button");
    this.volumeIndicator = this.wrapper.querySelector(".volume-indicator");
    this.canvas = this.wrapper.querySelector(".audio-visualizer");
    this.canvasCtx = this.canvas.getContext("2d");
    this.previousVolume = 50; // Store previous volume for unmute

    // Remove muted attribute and set volume
    this.video.muted = false;
    this.video.volume = this.volume / 100;
    this.updateVolumeIndicator();

    // Ensure loop is enabled
    this.video.loop = true;

    // Click video to play/pause (not on controls)
    this.video.addEventListener("click", (e) => {
      e.preventDefault();
      this.togglePlayPause();
    });

    // Prevent controls from triggering video play/pause
    this.controls.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Volume button click
    this.volumeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMute();
    });

    // Scroll to change volume
    this.wrapper.addEventListener("wheel", (e) => this.handleScroll(e), {
      passive: false,
    });

    // Initialize audio visualizer when playing
    this.video.addEventListener("playing", () => {
      if (!this.audioContext) {
        this.initAudioContext();
      }
    });
  }

  togglePlayPause() {
    if (this.video.paused) {
      this.video
        .play()
        .then(() => {})
        .catch((err) => {
          console.error("Error playing video:", err);
        });
    } else {
      this.video.pause();
    }
  }

  handleScroll(e) {
    e.preventDefault();

    // Scroll down = decrease volume, scroll up = increase volume
    const delta = e.deltaY > 0 ? -5 : 5;
    this.volume = Math.max(0, Math.min(100, this.volume + delta));

    // If we're scrolling and volume is above 0, save it as previous
    if (this.volume > 0) {
      this.previousVolume = this.volume;
    }

    this.video.volume = this.volume / 100;
    this.video.muted = false;
    this.updateVolumeIndicator();
  }

  toggleMute() {
    if (this.volume === 0 || this.video.muted) {
      // Unmute: restore to previous volume
      this.volume = this.previousVolume;
      this.video.muted = false;
    } else {
      // Mute: save current volume and set to 0
      this.previousVolume = this.volume;
      this.volume = 0;
      this.video.muted = true;
    }

    this.video.volume = this.volume / 100;
    this.updateVolumeIndicator();
    this.updateVolumeButton();
  }

  updateVolumeIndicator() {
    this.volumeIndicator.textContent = `${this.volume}`;
  }

  updateVolumeButton() {
    // Change emoji based on mute state
    if (this.volume === 0 || this.video.muted) {
      this.volumeIndicator.textContent = "0";
    } else {
      this.volumeIndicator.textContent =
        this.volumeIndicator.textContent = `${this.volume}`;
    }
  }

  initAudioContext() {
    if (this.audioContext) return; // Already initialized

    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();

      // Create media element source
      this.audioSource = this.audioContext.createMediaElementSource(this.video);

      // Create analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      // Connect nodes
      this.audioSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      // Start visualization
      this.drawVisualizer();
    } catch (error) {
      console.error("Error initializing audio context:", error);
    }
  }

  drawVisualizer() {
    if (!this.canvas || !this.analyser) return;

    const draw = () => {
      requestAnimationFrame(draw);

      this.analyser.getByteTimeDomainData(this.dataArray);

      // Black background
      this.canvasCtx.fillStyle = "#000000";
      this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // White oscillator line
      this.canvasCtx.lineWidth = 2;
      this.canvasCtx.strokeStyle = "#FFFFFF";
      this.canvasCtx.beginPath();

      const sliceWidth = this.canvas.width / this.bufferLength;
      let x = 0;

      for (let i = 0; i < this.bufferLength; i++) {
        const v = this.dataArray[i] / 128.0;
        const y = (v * this.canvas.height) / 2;

        if (i === 0) {
          this.canvasCtx.moveTo(x, y);
        } else {
          this.canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      this.canvasCtx.lineTo(this.canvas.width, this.canvas.height / 2);
      this.canvasCtx.stroke();
    };

    draw();
  }
}

// Initialize all media wrappers on page load
document.addEventListener("DOMContentLoaded", () => {
  const mediaWrappers = document.querySelectorAll(".media-wrapper");

  mediaWrappers.forEach((wrapper) => {
    new MediaWrapper(wrapper);
  });
});
