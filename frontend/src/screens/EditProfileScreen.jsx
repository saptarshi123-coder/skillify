import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function EditProfileScreen() {
  const { userProfile, updateProfile, goBack, showToast } = useApp();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: userProfile.name,
    major: userProfile.major,
    college: userProfile.college,
    address: userProfile.address,
    email: userProfile.email,
    avatar: userProfile.avatar,
    skills: [...userProfile.skills]
  });

  const [newSkill, setNewSkill] = useState('');

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
        setFormData(prev => ({ ...prev, avatar: base64Url }));
        showToast("📸 Photo uploaded! Click 'Save Changes' to update.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    showToast("Profile updated successfully!");
    goBack();
  };

  const sampleAvatars = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBODQKML9QTCJYoZkx7q1l4hmZZjoUuKcRUiLQeXgTZup-R0Oh5yYulzUc5-5XS06ChjcpHA8SqM0lxiGKpxlH2U2zwkDv8_-GhQNOsgE6_O_z1FOnTg2hRfckqKeLz6c4NX1zhf5zdIFd9ACqR47xg8LP1Mbb52T15n3LJtX770FtO2mKmy9Gj1lsTxPdjJ1ZAx7wnkt5bwJkzLoTQIRhidZSi1LWLDbUhkaNXCfpx6Vfd7U3BWKk0IQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBeN3wwzsfdCsKXyrCzamH7UFahjiEsN31mrLWG1dTJZdmoHpREvwUtzc4tXlXJvvZkiTKgnzU3pF6riYsq5MivKqaV7FOSlRalhtEQUPvFGe5L0xQ_iqOr2GQ3Pz5LLlZzjC1MBXQeW8LYjYcXWdLgoYanVyMrZj55berG-dYzEpklh-h-1msbQDrmiysCEy4htKIK8eDiNNtgrkzdHoQe5qGu7TPRJ6LijD9QoGtzJOWc9CIIRlbRoA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCVz8ccn75U6PEveqo2Gd6S-MC5oDR_F1Z_uvXiVjuderm9XVEYN5WJOX1Swa3MoJSmhp8M2rAa0_HfLwyDKkVtOFAbeEuJDN6yKKM2Yw5k6YFlO9AkUBNtc2Gm0XGVmnGHO8I09aegiFn8M83GDJlEVF5A9rxXnl3j_nPB_U3Fu_gnFNOBu_2hhAguZ9NVm4Fh0qWAzZKiw3qka8qBhRs2gjvBglccXSwYl-qVmhv7QPq4KydK109dyQ",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDKKj6LVRj6za4b24SRqtjKKmW1JLRDJRyrWiHbxQZdg_ohwzJn-vZ29CTar7loXWqesAuTWKvPhwBtjqdW-zRp31xeHQcYqI90y6UaDDhD956vasWtK7NwGrrsR4mGYWfJoG6ar3kjZKjkF7aN89NBqeRMbxHhS5b9ARyvVau1ppYmfwQI4gFOLZVr5xsl62sMNPIPm9BYZmzG_zEow5ekx7pBHmu3CCJf3h0NGCyY9F9OSX_bbqKy-A"
  ];

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="Edit Profile" showBack={true} onBack={goBack} />

      <main className="px-4 py-4 space-y-4 w-full">
        
        {/* Avatar Section */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-primary shadow-md">
              <img
                alt="Profile"
                className="w-full h-full object-cover"
                src={formData.avatar}
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:bg-primary-container transition-all active:scale-95 cursor-pointer"
              title="Upload Custom Photo"
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
            className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">upload</span>
            <span>Upload New Photo</span>
          </button>

          <div className="flex gap-2 pt-1">
            {sampleAvatars.map((av, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFormData({ ...formData, avatar: av })}
                className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform cursor-pointer ${
                  formData.avatar === av ? 'border-primary scale-110 ring-2 ring-primary/20' : 'border-outline-variant/60 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={av} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 space-y-3">
            
            <div>
              <label className="block text-[11px] font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider mb-1">
                Major / Specialization
              </label>
              <input
                type="text"
                required
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider mb-1">
                College / University
              </label>
              <input
                type="text"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider mb-1">
                Address / Location
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
              />
            </div>

          </div>

          {/* Skills Management */}
          <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 space-y-3">
            <label className="block text-[11px] font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider">
              Competencies & Skill Tags
            </label>

            <div className="flex flex-wrap gap-1.5">
              {formData.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-primary-container text-xs cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add new skill (e.g. Next.js, Docker)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 bg-surface dark:bg-inverse-surface/40 border border-outline-variant/60 rounded-xl py-2 px-3 text-xs outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-colors shadow-sm cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary hover:bg-primary-container text-white font-headline text-xs font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            Save Changes
          </button>
        </form>

      </main>
    </div>
  );
}
