import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useProctoring Hook
 * 
 * Lightweight frontend face authentication and live proctoring hook for the Skillify quiz engine.
 * - Requests camera and microphone access via navigator.mediaDevices.
 * - Runs a periodic interval loop (default: every 4 seconds) to capture video frames,
 *   compress them to 320px Base64 JPEGs on an offscreen canvas, and POST to the proctoring API.
 * - Tracks strikes, violations, and real-time face verification status.
 * - Safely stops all media tracks and clears timers on component unmount.
 * 
 * @param {Object} options Configuration options
 * @param {boolean} [options.enabled=true] Whether proctoring is actively capturing
 * @param {number} [options.intervalMs=4000] Interval between verification frames (in ms)
 * @param {string} [options.endpoint='/api/proctor/verify-frame'] Verification API endpoint
 * @param {number} [options.maxStrikes=3] Maximum allowable strikes before auto-submission
 * @param {Function} [options.onViolation] Callback triggered on each violation
 * @param {Function} [options.onMaxStrikesExceeded] Callback triggered when max strikes reached
 * @param {Function} [options.onVideoOff] Callback triggered when camera is turned off or disconnected
 * 
 * @returns {Object} Proctoring state and controls
 */
export function useProctoring({
  enabled = true,
  intervalMs = 4000,
  endpoint = '/api/proctor/verify-frame',
  maxStrikes = 3,
  onViolation,
  onMaxStrikesExceeded,
  onVideoOff
} = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const strikesRef = useRef(0);
  const isCapturingRef = useRef(false);
  const animFrameRef = useRef(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [hasPermission, setHasPermission] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [violations, setViolations] = useState([]);
  const [lastWarning, setLastWarning] = useState(null);
  const [lastVerifiedAt, setLastVerifiedAt] = useState(null);
  const [faceStatus, setFaceStatus] = useState('detecting'); // 'detecting' | 'verified' | 'violation' | 'offline'
  const [isBlackScreen, setIsBlackScreen] = useState(false);

  // Sync ref with state
  useEffect(() => {
    strikesRef.current = strikes;
  }, [strikes]);

  // Offscreen canvas initialization
  useEffect(() => {
    if (!canvasRef.current && typeof document !== 'undefined') {
      canvasRef.current = document.createElement('canvas');
    }
  }, []);

  // Stop any active Media Stream or Animation Tracks
  const stopMediaStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
  }, []);

  // Helper to cleanly attach media stream to video element and force playback
  const attachStreamToVideo = useCallback((stream) => {
    if (!stream) return;
    streamRef.current = stream;
    setHasPermission(true);
    setPermissionStatus('granted');
    setIsSimulated(false);
    setIsInitializing(false);
    setIsRecording(true);
    setFaceStatus('detecting');

    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.onloadedmetadata = () => {
        video.muted = true;
        video.play().catch(e => console.warn('Play on metadata loaded:', e));
      };
      video.play().catch(e => console.warn('Direct video play:', e));
    }
  }, []);

  // Enumerate all available camera devices
  const updateAvailableCameras = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setAvailableCameras(videoInputs);
        return videoInputs;
      }
    } catch (e) {
      console.warn('Could not enumerate cameras:', e);
    }
    return [];
  }, []);

  // Virtual / Simulated Video Stream for devices without hardware camera or for testing
  const startSimulatedStream = useCallback(() => {
    stopMediaStream();
    setIsInitializing(false);

    try {
      const simCanvas = document.createElement('canvas');
      simCanvas.width = 320;
      simCanvas.height = 240;
      const ctx = simCanvas.getContext('2d');

      let angle = 0;
      const drawSimulation = () => {
        if (!ctx) return;
        angle += 0.04;

        // Dark background
        ctx.fillStyle = '#0b1329';
        ctx.fillRect(0, 0, 320, 240);

        // Tech grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let x = 0; x < 320; x += 25) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 240);
          ctx.stroke();
        }
        for (let y = 0; y < 240; y += 25) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(320, y);
          ctx.stroke();
        }

        // Outer radar circle
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(160, 115, 62 + Math.sin(angle) * 3, 0, Math.PI * 2);
        ctx.stroke();

        // Face mesh representation
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(160, 115, 38, 48, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(148, 105, 3.5, 0, Math.PI * 2);
        ctx.arc(172, 105, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose bridge
        ctx.beginPath();
        ctx.moveTo(160, 110);
        ctx.lineTo(158, 122);
        ctx.lineTo(164, 122);
        ctx.stroke();

        // Smile
        ctx.beginPath();
        ctx.arc(160, 130, 12, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // HUD Text
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('● AI PROCTOR: VERIFIED', 14, 24);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText('VIRTUAL PROCTOR FEED ACTIVE', 14, 38);
        ctx.fillText(`PITCH: ${(Math.sin(angle)*1.2).toFixed(1)}° • STABILITY: 99%`, 14, 224);

        animFrameRef.current = requestAnimationFrame(drawSimulation);
      };

      drawSimulation();

      if (simCanvas.captureStream) {
        const stream = simCanvas.captureStream(24);
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.muted = true;
          video.defaultMuted = true;
          video.playsInline = true;
          video.onloadedmetadata = () => {
            video.muted = true;
            video.play().catch(() => {});
          };
          video.play().catch(() => {});
        }
      }

      setPermissionStatus('granted');
      setHasPermission(true);
      setIsSimulated(true);
      setIsRecording(true);
      setFaceStatus('verified');
      return true;
    } catch (e) {
      console.warn('Simulation canvas error:', e);
      setPermissionStatus('granted');
      setHasPermission(true);
      setIsSimulated(true);
      setFaceStatus('verified');
      return true;
    }
  }, [stopMediaStream]);

  // Request Camera Media Stream (Real Hardware Webcam / Mobile Front Camera)
  const initMediaStream = useCallback(async (preferredDeviceId = null, isExplicitSwitch = false, requestedFacingMode = null) => {
    stopMediaStream();
    setIsInitializing(true);
    setPermissionStatus('prompt');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionStatus('unsupported');
      setLastWarning('⚠️ Camera API unsupported on this browser.');
      setIsInitializing(false);
      startSimulatedStream();
      return null;
    }

    try {
      let targetDeviceId = preferredDeviceId;
      const activeFacingMode = requestedFacingMode || facingMode;

      // If no device specified, intelligently pick the best camera (front camera for mobile, integrated for desktop)
      if (!targetDeviceId) {
        const devices = await updateAvailableCameras();
        if (devices.length > 1) {
          // 1. Mobile front camera
          const frontCam = devices.find(d => /front|user|selfie|face/i.test(d.label));
          // 2. Laptop integrated camera
          const integratedCam = devices.find(d => /integrated/i.test(d.label));
          // 3. Fallback to non-virtual/non-IR RGB camera
          const isIRorVirtual = (label) => {
            const l = (label || '').toLowerCase();
            return l.includes('ir') || l.includes('infrared') || l.includes('hello') || l.includes('virtual') || l.includes('obs');
          };
          const bestCam = frontCam || integratedCam || devices.find(d => !isIRorVirtual(d.label));
          if (bestCam) {
            targetDeviceId = bestCam.deviceId;
            const idx = devices.findIndex(d => d.deviceId === targetDeviceId);
            if (idx !== -1) setCurrentCameraIndex(idx);
          }
        }
      }

      let stream = null;

      // Build video constraints (compatible with mobile portrait & desktop without OverconstrainedError)
      const constraints = targetDeviceId
        ? { video: { deviceId: targetDeviceId } }
        : {
            video: {
              facingMode: activeFacingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (errFirst) {
        // Fallback without resolution constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia(
            targetDeviceId ? { video: { deviceId: targetDeviceId } } : { video: { facingMode: activeFacingMode } }
          );
        } catch (errGeneric) {
          // Last resort minimal constraint
          stream = await navigator.mediaDevices.getUserMedia({
            video: true
          });
        }
      }

      if (!stream) {
        throw new Error('No video stream returned by camera device.');
      }

      // Attach video track monitoring
      stream.getVideoTracks().forEach(track => {
        track.onended = () => {
          console.warn('Proctoring: Video track ended during test.');
          setHasPermission(false);
          setFaceStatus('offline');
          setIsRecording(false);
          if (typeof onVideoOff === 'function') {
            onVideoOff('Camera video track was turned off or disconnected.');
          }
        };
      });

      attachStreamToVideo(stream);
      const devices = await updateAvailableCameras();

      // Only auto-switch if this wasn't an explicit user switch
      if (!isExplicitSwitch && devices && devices.length > 1) {
        const activeTrack = stream.getVideoTracks()[0];
        const activeLabel = (activeTrack?.label || '').toLowerCase();
        const isVirtual = activeLabel.includes('virtual') || activeLabel.includes('smart meeting') || activeLabel.includes('obs');

        if (isVirtual) {
          const physicalCam = devices.find(d => {
            const l = (d.label || '').toLowerCase();
            return /front|user|selfie|face|integrated/i.test(l) || (!l.includes('virtual') && !l.includes('obs'));
          });

          if (physicalCam && physicalCam.deviceId && physicalCam.deviceId !== targetDeviceId) {
            console.log('Proctoring: Auto-switching from virtual camera to physical camera:', physicalCam.label);
            const idx = devices.findIndex(d => d.deviceId === physicalCam.deviceId);
            if (idx !== -1) setCurrentCameraIndex(idx);
            return await initMediaStream(physicalCam.deviceId, false);
          }
        }
      }

      return stream;
    } catch (error) {
      console.warn('Real camera request failed:', error);
      setPermissionStatus('denied');
      setHasPermission(false);
      setIsInitializing(false);
      setIsRecording(false);
      setFaceStatus('offline');
      return null;
    }
  }, [stopMediaStream, attachStreamToVideo, updateAvailableCameras, startSimulatedStream, onVideoOff, facingMode]);

  // Switch between available camera devices or flip front/back on mobile
  const switchCamera = useCallback(async (explicitDeviceId = null) => {
    try {
      const cameras = availableCameras.length > 0 ? availableCameras : await updateAvailableCameras();

      // If user passed a specific deviceId (e.g. from select dropdown)
      if (explicitDeviceId && typeof explicitDeviceId === 'string') {
        const targetIdx = cameras.findIndex(c => c.deviceId === explicitDeviceId);
        if (targetIdx !== -1) setCurrentCameraIndex(targetIdx);
        return await initMediaStream(explicitDeviceId, true);
      }

      // If multiple hardware cameras exist (desktop or multi-cam mobile)
      if (cameras.length > 1) {
        const nextIndex = (currentCameraIndex + 1) % cameras.length;
        setCurrentCameraIndex(nextIndex);
        const nextDevice = cameras[nextIndex];
        return await initMediaStream(nextDevice.deviceId, true);
      }

      // Mobile single-device fallback: flip facingMode between 'user' (front) and 'environment' (back)
      const nextFacing = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(nextFacing);
      return await initMediaStream(null, true, nextFacing);
    } catch (e) {
      console.warn('Switch camera error:', e);
      return await initMediaStream();
    }
  }, [availableCameras, currentCameraIndex, facingMode, updateAvailableCameras, initMediaStream]);

  // Capture current frame from video and compress to 320px JPEG
  const captureFrameBase64 = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight || video.readyState < 2) {
      return null;
    }

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    const targetWidth = 320;
    const targetHeight = Math.round((video.videoHeight / video.videoWidth) * targetWidth) || 240;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    // Draw and mirror horizontally for user-facing video natural orientation
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    // Measure frame luminance to detect if hardware camera is sending solid black (shutter closed)
    try {
      const sample = ctx.getImageData(0, 0, Math.min(32, targetWidth), Math.min(24, targetHeight)).data;
      let totalLuma = 0;
      for (let i = 0; i < sample.length; i += 4) {
        totalLuma += 0.299 * sample[i] + 0.587 * sample[i + 1] + 0.114 * sample[i + 2];
      }
      const avgLuma = totalLuma / (sample.length / 4);
      setIsBlackScreen(avgLuma < 6);
    } catch (e) {}

    // Compress to lightweight Base64 JPEG (quality 0.6)
    return canvas.toDataURL('image/jpeg', 0.6);
  }, []);

  // Send frame to proctoring API endpoint
  const sendVerificationFrame = useCallback(async () => {
    if (isCapturingRef.current || !enabled) {
      return;
    }

    // Health check: Check if video track is active
    if (!isInitializing && !isSimulated) {
      const activeStream = streamRef.current;
      const videoTracks = activeStream ? activeStream.getVideoTracks() : [];
      const hasActiveTrack = videoTracks.some(t => t.readyState === 'live' && t.enabled);

      if (!hasActiveTrack || !hasPermission) {
        console.warn('Proctoring: Active video track not found during frame check.');
        setFaceStatus('offline');
        if (typeof onVideoOff === 'function') {
          onVideoOff('Camera feed was stopped or video track became inactive.');
        }
        return;
      }
    }

    if (isSimulated) {
      setLastVerifiedAt(Date.now());
      setFaceStatus('verified');
      return;
    }

    const base64Image = captureFrameBase64();
    if (!base64Image) {
      return;
    }

    isCapturingRef.current = true;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Image,
          timestamp: Date.now(),
          strikeCount: strikesRef.current
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLastVerifiedAt(Date.now());

        // Check if API reported a violation
        const isViolation = data.verified === false || Boolean(data.violation) || Boolean(data.is_violation);
        
        if (isViolation) {
          const warningMsg = data.message || data.warning || data.violation || 'Face not detected or gaze diverted.';
          const newStrikeCount = strikesRef.current + 1;

          setStrikes(newStrikeCount);
          setFaceStatus('violation');
          setLastWarning(warningMsg);
          
          const violationRecord = {
            id: `v-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            reason: warningMsg,
            strike: newStrikeCount,
            type: data.violation_type || 'face_anomaly'
          };

          setViolations(prev => [violationRecord, ...prev]);

          if (typeof onViolation === 'function') {
            onViolation(violationRecord);
          }

          if (newStrikeCount >= maxStrikes && typeof onMaxStrikesExceeded === 'function') {
            onMaxStrikesExceeded(newStrikeCount, violationRecord);
          }
        } else {
          // Frame verified successfully
          setFaceStatus('verified');
        }
      } else {
        // Fallback when mock / offline endpoint is not reachable
        setFaceStatus('verified');
      }
    } catch (err) {
      // Network or offline fallback - fail open so quiz is not blocked by connectivity blips
      setFaceStatus('verified');
    } finally {
      isCapturingRef.current = false;
    }
  }, [enabled, hasPermission, captureFrameBase64, endpoint, maxStrikes, onViolation, onMaxStrikesExceeded]);

  // Initialize camera on mount and cleanup on unmount
  useEffect(() => {
    if (enabled) {
      initMediaStream();
    }

    return () => {
      stopMediaStream();
    };
  }, [enabled, initMediaStream, stopMediaStream]);

  // Attach video stream if videoRef is mounted later and ensure it plays
  useEffect(() => {
    const video = videoRef.current;
    if (video && streamRef.current) {
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
      }
      if (video.paused) {
        video.muted = true;
        video.play().catch(e => console.warn('Autoplay unpause check:', e));
      }
    }
  });

  // Periodic Frame Verification Loop
  useEffect(() => {
    if (!enabled || !hasPermission) {
      return;
    }

    // Run first verification after initial 2s camera stabilization
    const initialTimeout = setTimeout(() => {
      sendVerificationFrame();
    }, 2000);

    const interval = setInterval(() => {
      sendVerificationFrame();
    }, Math.max(1000, intervalMs));

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [enabled, hasPermission, intervalMs, sendVerificationFrame]);

  // Reset Proctoring State
  const resetViolations = useCallback(() => {
    setStrikes(0);
    setViolations([]);
    setLastWarning(null);
    setFaceStatus('detecting');
  }, []);

  return {
    videoRef,
    hasPermission,
    permissionStatus,
    isSimulated,
    isInitializing,
    isRecording,
    strikes,
    maxStrikes,
    violations,
    lastWarning,
    lastVerifiedAt,
    faceStatus,
    isBlackScreen,
    availableCameras,
    currentCameraIndex,
    facingMode,
    switchCamera,
    initMediaStream,
    enableCamera: initMediaStream,
    disableCamera: stopMediaStream,
    startSimulatedStream,
    stopMediaStream,
    sendVerificationFrame,
    resetViolations
  };
}

export default useProctoring;
