import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import GoogleAuthModal from '../components/GoogleAuthModal';

export default function SignupScreen() {
  const { signupWithEmail, navigate, showToast } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBODQKML9QTCJYoZkx7q1l4hmZZjoUuKcRUiLQeXgTZup-R0Oh5yYulzUc5-5XS06ChjcpHA8SqM0lxiGKpxlH2U2zwkDv8_-GhQNOsgE6_O_z1FOnTg2hRfckqKeLz6c4NX1zhf5zdIFd9ACqR47xg8LP1Mbb52T15n3LJtX770FtO2mKmy9Gj1lsTxPdjJ1ZAx7wnkt5bwJkzLoTQIRhidZSi1LWLDbUhkaNXCfpx6Vfd7U3BWKk0IQ');
  const [agreed, setAgreed] = useState(true);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const presetAvatars = [
    {
      label: "CS Student",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBODQKML9QTCJYoZkx7q1l4hmZZjoUuKcRUiLQeXgTZup-R0Oh5yYulzUc5-5XS06ChjcpHA8SqM0lxiGKpxlH2U2zwkDv8_-GhQNOsgE6_O_z1FOnTg2hRfckqKeLz6c4NX1zhf5zdIFd9ACqR47xg8LP1Mbb52T15n3LJtX770FtO2mKmy9Gj1lsTxPdjJ1ZAx7wnkt5bwJkzLoTQIRhidZSi1LWLDbUhkaNXCfpx6Vfd7U3BWKk0IQ"
    },
    {
      label: "Data Scientist",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeN3wwzsfdCsKXyrCzamH7UFahjiEsN31mrLWG1dTJZdmoHpREvwUtzc4tXlXJvvZkiTKgnzU3pF6riYsq5MivKqaV7FOSlRalhtEQUPvFGe5L0xQ_iqOr2GQ3Pz5LLlZzjC1MBXQeW8LYjYcXWdLgoYanVyMrZj55berG-dYzEpklh-h-1msbQDrmiysCEy4htKIK8eDiNNtgrkzdHoQe5qGu7TPRJ6LijD9QoGtzJOWc9CIIRlbRoA"
    },
    {
      label: "Cloud Engineer",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVz8ccn75U6PEveqo2Gd6S-MC5oDR_F1Z_uvXiVjuderm9XVEYN5WJOX1Swa3MoJSmhp8M2rAa0_HfLwyDKkVtOFAbeEuJDN6yKKM2Yw5k6YFlO9AkUBNtc2Gm0XGVmnGHO8I09aegiFn8M83GDJlEVF5A9rxXnl3j_nPB_U3Fu_gnFNOBu_2hhAguZ9NVm4Fh0qWAzZKiw3qka8qBhRs2gjvBglccXSwYl-qVmhv7QPq4KydK109dyQ"
    },
    {
      label: "Security Fellow",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKKj6LVRj6za4b24SRqtjKKmW1JLRDJRyrWiHbxQZdg_ohwzJn-vZ29CTar7loXWqesAuTWKvPhwBtjqdW-zRp31xeHQcYqI90y6UaDDhD956vasWtK7NwGrrsR4mGYWfJoG6ar3kjZKjkF7aN89NBqeRMbxHhS5b9ARyvVau1ppYmfwQI4gFOLZVr5xsl62sMNPIPm9BYZmzG_zEow5ekx7pBHmu3CCJf3h0NGCyY9F9OSX_bbqKy-A"
    }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please upload a valid image file", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result;
      if (base64Url) {
        setAvatar(base64Url);
        showToast("📸 Profile photo uploaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }
    if (!agreed) {
      showToast("Please accept the terms and conditions", "error");
      return;
    }
    setIsLoading(true);
    try {
      await signupWithEmail(fullName, email, password, avatar);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-on-surface flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-primary text-white mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
              school
            </span>
          </div>
          <h1 className="font-headline text-2xl font-extrabold text-primary tracking-tight">
            Skillify
          </h1>
          <p className="text-xs text-secondary font-medium">
            Create your account & build your credentials
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-6 shadow-card border border-surface-variant/40 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="font-headline text-base font-bold text-on-surface dark:text-inverse-on-surface">
              Account Setup
            </h2>
            <p className="text-[11px] text-secondary">
              Upload your photo and set up your student profile
            </p>
          </div>

          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center space-y-2.5 pt-1">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-primary shadow-md">
                <img
                  src={avatar}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Camera Upload Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:bg-primary-container transition-all active:scale-95 cursor-pointer"
                title="Upload Profile Picture"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">upload</span>
              <span>Upload Custom Photo</span>
            </button>

            {/* Presets */}
            <div className="flex gap-2 pt-1">
              {presetAvatars.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setAvatar(p.url)}
                  className={`w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                    avatar === p.url ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  title={p.label}
                >
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Social Buttons */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full py-2.5 px-3 bg-surface dark:bg-inverse-surface/40 hover:bg-surface-container border border-outline-variant/60 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span className="text-xs font-bold">Sign up with Google</span>
            </button>
          </div>

          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-outline-variant/50"></div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Or Register</span>
            <div className="flex-1 h-px bg-outline-variant/50"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-primary transition-colors text-on-surface dark:text-inverse-on-surface"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-primary transition-colors text-on-surface dark:text-inverse-on-surface"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password (8+ chars)"
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2.5 px-3 text-xs outline-none focus:border-primary transition-colors text-on-surface dark:text-inverse-on-surface"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-[11px] text-secondary">
                I agree to the <span className="text-primary font-semibold">Terms of Service</span> & <span className="text-primary font-semibold">Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary hover:bg-primary-container text-white font-headline text-xs font-bold rounded-2xl shadow-md transition-all active:scale-[0.98] mt-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? 'Creating Account...' : 'Save Profile & Continue'}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="pt-2 text-center text-xs text-secondary">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('login')}
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>

      </div>

      {/* Google OAuth Account Picker Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />

    </div>
  );
}
