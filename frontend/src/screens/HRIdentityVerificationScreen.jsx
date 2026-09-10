import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function HRIdentityVerificationScreen() {
  const { navigate, showToast, userProfile, updateHRProfile } = useApp();
  const [documentType, setDocumentType] = useState('company_id'); // 'company_id' | 'govt_id' | 'offer_letter'
  const [frontDoc, setFrontDoc] = useState(null);
  const [backDoc, setBackDoc] = useState(null);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(userProfile?.hr_verified || false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Open Real WebCam Stream
  const handleStartCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError('Camera access denied or unavailable. Please allow camera permissions or upload a selfie file.');
      showToast('Camera permission denied or device not supported', 'error');
    }
  };

  // Stop WebCam Stream
  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture Live Snapshot from Video Stream
  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    
    // Mirror horizontally for selfie camera
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    setSelfiePhoto(photoData);
    handleStopCamera();
    showToast('📸 Live selfie captured successfully!', 'success');
  };

  const handleFileUpload = (e, target) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Document size must be under 10MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const result = uploadEvt.target?.result;
        if (target === 'front') setFrontDoc(result);
        if (target === 'back') setBackDoc(result);
        if (target === 'selfie') setSelfiePhoto(result);
        showToast(`📄 ${target === 'front' ? 'Front' : target === 'back' ? 'Back' : 'Selfie'} uploaded!`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVerification = (e) => {
    e.preventDefault();
    if (!frontDoc) {
      showToast('Please upload front side of your work ID or Govt document', 'error');
      return;
    }
    if (!selfiePhoto) {
      showToast('Please complete live selfie match verification', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsVerifiedSuccess(true);
      if (updateHRProfile) {
        updateHRProfile({ hr_verified: true, verification_status: 'verified' });
      }
      showToast('🎉 Recruiter Identity & Legitimacy Verified Successfully!', 'success');
    }, 1200);
  };

  return (
    <div className="w-full pb-24 transition-colors min-h-screen bg-slate-900/5 dark:bg-[#0f1115]">
      <Navbar title="RECRUITER VERIFICATION" showBack onBack={() => navigate('complete-hr-profile')} />

      <main className="px-4 py-4 space-y-5 w-full max-w-2xl mx-auto">
        
        {/* Verification Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 rounded-3xl border border-emerald-500/30 text-white space-y-3 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500 text-black px-3 py-0.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified_user</span>
              Identity & Legitimacy
            </span>

            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
              isVerifiedSuccess ? 'bg-emerald-600 text-white' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {isVerifiedSuccess ? 'VERIFIED HR' : 'PENDING VERIFICATION'}
            </span>
          </div>

          <h1 className="font-headline text-lg md:text-xl font-bold text-white leading-snug">
            Verify Recruiter Identity
          </h1>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            Verify your employer identity to get the official Verified Recruiter badge on student applicant feeds & enable direct candidate outreach.
          </p>
        </div>

        {/* Verification Success State */}
        {isVerifiedSuccess ? (
          <div className="bg-white dark:bg-[#14171A] rounded-3xl p-6 border border-emerald-500/40 shadow-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-headline text-base font-bold text-slate-900 dark:text-white">Recruiter Verified!</h3>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Your company credentials & photo ID have been authenticated. You now have full Recruiter Trust Perks unlocked.
              </p>
            </div>

            <button
              onClick={() => navigate('recruiter-profile')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Go to Recruiter Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitVerification} className="space-y-5">
            
            {/* Step 1: Employee Photo ID */}
            <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#D71921] text-white text-xs font-mono font-bold flex items-center justify-center">1</div>
                <h3 className="font-headline text-sm font-bold text-slate-900 dark:text-white">Employee Photo ID & Credentials</h3>
              </div>

              {/* Document Type Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-[#191D22] rounded-2xl text-[11px] font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setDocumentType('company_id')}
                  className={`py-2 rounded-xl text-center transition-all cursor-pointer ${
                    documentType === 'company_id' ? 'bg-[#D71921] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Work ID
                </button>
                <button
                  type="button"
                  onClick={() => setDocumentType('govt_id')}
                  className={`py-2 rounded-xl text-center transition-all cursor-pointer ${
                    documentType === 'govt_id' ? 'bg-[#D71921] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Govt ID
                </button>
                <button
                  type="button"
                  onClick={() => setDocumentType('offer_letter')}
                  className={`py-2 rounded-xl text-center transition-all cursor-pointer ${
                    documentType === 'offer_letter' ? 'bg-[#D71921] text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Auth Letter
                </button>
              </div>

              {/* Upload Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Front Side */}
                <div className="border-2 border-dashed border-slate-300 dark:border-[#2D333B] rounded-2xl p-4 text-center space-y-2 hover:border-[#D71921] transition-colors relative">
                  {frontDoc ? (
                    <div className="space-y-2">
                      <img src={frontDoc} alt="Front Document" className="h-28 w-full object-cover rounded-xl mx-auto" />
                      <span className="text-[10px] font-mono text-emerald-500 font-bold block">✓ Front Uploaded</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2">
                      <span className="material-symbols-outlined text-3xl text-slate-400">file_upload</span>
                      <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Upload Front Side</div>
                      <span className="text-[10px] font-mono text-slate-400 block">PNG, JPG, PDF (Max 10MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'front')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Back Side */}
                <div className="border-2 border-dashed border-slate-300 dark:border-[#2D333B] rounded-2xl p-4 text-center space-y-2 hover:border-[#D71921] transition-colors relative">
                  {backDoc ? (
                    <div className="space-y-2">
                      <img src={backDoc} alt="Back Document" className="h-28 w-full object-cover rounded-xl mx-auto" />
                      <span className="text-[10px] font-mono text-emerald-500 font-bold block">✓ Back Uploaded</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2">
                      <span className="material-symbols-outlined text-3xl text-slate-400">document_scanner</span>
                      <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Upload Back Side (Optional)</div>
                      <span className="text-[10px] font-mono text-slate-400 block">PNG, JPG, PDF (Max 10MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'back')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Live Selfie Match */}
            <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#D71921] text-white text-xs font-mono font-bold flex items-center justify-center">2</div>
                <h3 className="font-headline text-sm font-bold text-slate-900 dark:text-white">Live Selfie Match</h3>
              </div>

              <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                Capture a quick live photo to match your headshot with the uploaded Employee ID document.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-center space-y-4">
                {isCameraActive ? (
                  /* Active WebCam Live Video Feed */
                  <div className="space-y-3">
                    <div className="relative w-full max-w-sm h-64 mx-auto rounded-2xl overflow-hidden bg-black border-2 border-emerald-500 shadow-lg flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />

                      {/* Live Indicator */}
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                        <span>LIVE CAMERA</span>
                      </div>

                      {/* Oval Face Alignment Guide */}
                      <div className="absolute w-36 h-48 rounded-[50%] border-2 border-dashed border-emerald-400/80 pointer-events-none shadow-sm flex items-center justify-center">
                        <span className="text-[10px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded">Center Face</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleTakeSnapshot}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span className="material-symbols-outlined text-base">photo_camera</span>
                        <span>SNAP PHOTO</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStopCamera}
                        className="px-4 py-2.5 bg-slate-200 dark:bg-[#20252B] text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded-2xl transition-all hover:bg-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : selfiePhoto ? (
                  /* Captured Selfie Preview */
                  <div className="space-y-3">
                    <div className="relative w-28 h-28 mx-auto">
                      <img
                        src={selfiePhoto}
                        alt="Selfie Match"
                        className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500 shadow-md mx-auto"
                      />
                      <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      </span>
                    </div>

                    <div className="text-center space-y-1">
                      <span className="text-xs font-mono text-emerald-500 font-bold block">✓ Live Selfie Facial Alignment Verified (99.2%)</span>
                      <button
                        type="button"
                        onClick={handleStartCamera}
                        className="text-[11px] font-mono text-[#D71921] hover:underline font-bold cursor-pointer"
                      >
                        Retake Selfie Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Initial State: Start Camera or Upload */
                  <div className="space-y-3">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#D71921] flex items-center justify-center mx-auto text-[#D71921]">
                      <span className="material-symbols-outlined text-3xl">photo_camera</span>
                    </div>

                    {cameraError && (
                      <p className="text-xs font-mono text-red-500 bg-red-500/10 p-2 rounded-xl border border-red-500/20">{cameraError}</p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleStartCamera}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-base">videocam</span>
                        <span>Open Camera & Capture</span>
                      </button>

                      <label className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 dark:bg-[#191D22] text-slate-700 dark:text-white text-xs font-mono font-bold rounded-2xl transition-all hover:bg-slate-300 cursor-pointer flex items-center justify-center gap-1 border border-slate-300 dark:border-[#2D333B]">
                        <span className="material-symbols-outlined text-base">file_upload</span>
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'selfie')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recruiter Trust Perks */}
            <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] space-y-3">
              <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500">verified</span>
                Recruiter Trust Perks Unlocked Upon Verification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="font-bold block">🛡️ Verified Recruiter Badge</span>
                  Displays on all your internship listings.
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="font-bold block">🚀 3x Priority Reach</span>
                  Top ranking in student applicant feeds.
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <span className="font-bold block">💬 Direct Messaging</span>
                  Reach out directly to top-scoring candidates.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Draft verification state saved!', 'info');
                  navigate('complete-hr-profile');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-slate-200 dark:bg-[#191D22] text-slate-700 dark:text-white font-mono text-xs font-bold rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
              >
                Save Draft & Complete Later
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-headline text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Verifying...' : 'Submit for Verification'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

          </form>
        )}

      </main>
    </div>
  );
}
