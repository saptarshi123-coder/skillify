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
 * 
 * @returns {Object} Proctoring state and controls
 */
export function useProctoring({
  enabled = true,
  intervalMs = 4000,
  endpoint = '/api/proctor/verify-frame',
  maxStrikes = 3,
  onViolation,
  onMaxStrikesExceeded
} = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const strikesRef = useRef(0);
  const isCapturingRef = useRef(false);

  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [hasPermission, setHasPermission] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [violations, setViolations] = useState([]);
  const [lastWarning, setLastWarning] = useState(null);
  const [lastVerifiedAt, setLastVerifiedAt] = useState(null);
  const [faceStatus, setFaceStatus] = useState('detecting'); // 'detecting' | 'verified' | 'violation' | 'offline'

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

  // Request Camera and Microphone Media Stream
  const initMediaStream = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionStatus('unsupported');
      setIsInitializing(false);
      return null;
    }

    setIsInitializing(true);

    try {
      // Request video with user-facing camera and audio track
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: true
        });
      } catch (errWithAudio) {
        // Fallback to video-only if microphone is busy or not available
        console.warn('Microphone permission skipped or failed, falling back to video only:', errWithAudio);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });
      }

      streamRef.current = stream;
      setPermissionStatus('granted');
      setHasPermission(true);
      setIsInitializing(false);
      setIsRecording(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video autoplay warning:', e));
      }

      return stream;
    } catch (error) {
      console.warn('Camera / Microphone permission denied or unavailable:', error);
      setPermissionStatus('denied');
      setHasPermission(false);
      setIsInitializing(false);
      setIsRecording(false);
      setFaceStatus('offline');
      return null;
    }
  }, []);

  // Stop Media Stream Tracks
  const stopMediaStream = useCallback(() => {
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

    // Compress to lightweight Base64 JPEG (quality 0.6)
    return canvas.toDataURL('image/jpeg', 0.6);
  }, []);

  // Send frame to proctoring API endpoint
  const sendVerificationFrame = useCallback(async () => {
    if (isCapturingRef.current || !enabled || !hasPermission) {
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

  // Attach video stream if videoRef is mounted later
  useEffect(() => {
    if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.warn('Video autoplay warning:', e));
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
    isInitializing,
    isRecording,
    strikes,
    maxStrikes,
    violations,
    lastWarning,
    lastVerifiedAt,
    faceStatus,
    initMediaStream,
    stopMediaStream,
    sendVerificationFrame,
    resetViolations
  };
}

export default useProctoring;
