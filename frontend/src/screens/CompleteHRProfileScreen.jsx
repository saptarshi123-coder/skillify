import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function CompleteHRProfileScreen() {
  const { userProfile, updateHRProfile, goBack, showToast, navigate } = useApp();

  const [formData, setFormData] = useState({
    fullName: userProfile.name || '',
    jobRole: userProfile.job_role || 'Senior Technical Recruiter',
    companyName: userProfile.company_name || 'Skillify Inc.',
    location: userProfile.hr_location || 'Bengaluru, India',
    bio: userProfile.bio || 'Passionate about connecting top-tier student talent with innovative tech teams. Specialized in engineering and design recruitment.',
    avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be smaller than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormData(prev => ({ ...prev, avatar: uploadEvent.target?.result }));
        showToast('📷 Photo updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (!formData.jobRole.trim()) {
      showToast('Please enter your job role', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      updateHRProfile({
        fullName: formData.fullName.trim(),
        jobRole: formData.jobRole.trim(),
        companyName: formData.companyName.trim() || 'Skillify Inc.',
        location: formData.location.trim() || 'India',
        bio: formData.bio.trim(),
        avatar: formData.avatar
      });
      showToast('🎉 Recruiter profile setup completed!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface dark:bg-inverse-surface text-on-surface flex flex-col font-sans transition-colors animate-fadeIn">
      
      {/* Top Header Bar */}
      <header className="w-full top-0 sticky bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-md z-40 border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-4 md:px-8 h-16 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-primary dark:text-primary-fixed hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          
          <h1 className="font-headline text-base md:text-lg font-bold text-primary dark:text-primary-fixed">
            Complete HR Profile
          </h1>
          
          <button
            type="button"
            onClick={() => showToast('Fill in your company & recruiting details to connect with student candidates.')}
            className="w-10 h-10 flex items-center justify-center rounded-full text-primary dark:text-primary-fixed hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">help_outline</span>
          </button>
        </div>
      </header>

      {/* Main Content Form Canvas */}
      <main className="flex-grow w-full max-w-2xl mx-auto px-4 md:px-6 py-6 pb-24">
        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-6 md:p-8 shadow-card border border-outline-variant/30 space-y-6"
        >
          
          {/* Profile Photo Uploader Section */}
          <div className="flex flex-col items-center justify-center gap-3 pt-2">
            <div className="relative group cursor-pointer">
              <label htmlFor="hr-photo-upload" className="cursor-pointer block">
                <div className="w-28 h-28 rounded-full bg-surface-container overflow-hidden border-4 border-surface-container-lowest dark:border-surface-container-highest shadow-md flex items-center justify-center relative">
                  <img
                    src={formData.avatar}
                    alt={formData.fullName || "Recruiter Profile"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-md translate-x-1 -translate-y-1 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-sm font-bold">edit</span>
                </div>
              </label>
              <input
                id="hr-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>
            <div className="text-center">
              <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                Upload Professional Headshot
              </p>
              <p className="text-[10px] text-secondary mt-0.5">
                Recommended 400×400px PNG/JPEG (Max 5MB)
              </p>
            </div>
          </div>

          <hr className="border-t border-surface-variant/40 w-full" />

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-on-surface dark:text-inverse-on-surface flex items-center justify-between">
                <span>Full Name <span className="text-error">*</span></span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                  <span className="material-symbols-outlined text-lg">badge</span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Eleanor Vance"
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            {/* Job Role */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface dark:text-inverse-on-surface">
                Job Role / Title <span className="text-error">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                  <span className="material-symbols-outlined text-lg">work</span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.jobRole}
                  onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                  placeholder="Senior Technical Recruiter"
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface dark:text-inverse-on-surface">
                Company / Organization
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                  <span className="material-symbols-outlined text-lg">business</span>
                </div>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Skillify Inc. / Google"
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-on-surface dark:text-inverse-on-surface">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                </div>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Bengaluru, Karnataka, India"
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            {/* Professional Bio */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-on-surface dark:text-inverse-on-surface">
                  Professional Bio
                </label>
                <span className="text-[10px] text-secondary">
                  {formData.bio.length} / 500 characters
                </span>
              </div>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none text-secondary">
                  <span className="material-symbols-outlined text-lg">subject</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your recruitment focus, company culture, and what qualities you look for in candidates..."
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-xs text-on-surface dark:text-inverse-on-surface focus:border-primary outline-none transition-colors resize-y leading-relaxed"
                ></textarea>
              </div>
            </div>

          </div>

          {/* Action Submission Buttons */}
          <div className="pt-4 border-t border-surface-variant/40 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('hr-identity-verification')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-headline text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>Verify ID & Legitimacy</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-headline text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Save & Continue</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

        </form>
      </main>

    </div>
  );
}
