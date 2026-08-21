import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function PublicProfileScreen() {
  const {
    userProfile,
    selectedPublicProfile,
    goBack,
    navigate,
    showToast,
    certificates: userCertificates,
    projects: userProjects,
    openProjectRepo,
    copyPublicProfileLink,
    sharePublicProfile
  } = useApp();

  const [hasCopied, setHasCopied] = useState(false);

  // Active student/profile being viewed
  const profile = selectedPublicProfile || userProfile;

  // Determine if viewing own profile
  const isCurrentUser = !selectedPublicProfile ||
    selectedPublicProfile.id === 'std_1' ||
    selectedPublicProfile.email === userProfile.email ||
    selectedPublicProfile.name === userProfile.name;

  // Resolved certificates and projects
  const displayCertificates = isCurrentUser
    ? (userCertificates && userCertificates.length > 0 ? userCertificates : (profile.certificates || []))
    : (profile.certificates || []);

  const displayProjects = isCurrentUser
    ? (userProjects || [])
    : (profile.projects || []);

  const displaySkills = isCurrentUser
    ? (userProfile.skills || ["React", "Python", "Tailwind CSS", "Figma", "C++", "Data Structures"])
    : (profile.skills || ["Python", "Machine Learning", "FastAPI"]);

  const identifier = profile.username || profile.id || (isCurrentUser ? (userProfile.name ? userProfile.name.toLowerCase().replace(/\s+/g, '_') : 'guest') : 'student');
  const publicUrl = `${window.location.origin}/#profile-${identifier}`;

  const handleCopy = async () => {
    await copyPublicProfileLink(profile);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleShare = async () => {
    await sharePublicProfile(profile);
  };

  const handleConnect = () => {
    showToast(`🤝 Connection request sent to ${profile.name}!`);
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title={isCurrentUser ? "My Public Portfolio" : `${profile.name}'s Profile`} showBack={true} onBack={goBack} />

      <main className="px-4 py-4 space-y-4 w-full">
        
        {/* Public Header Card */}
        <div className="bg-gradient-to-br from-primary via-primary-container to-primary text-white rounded-3xl p-5 shadow-lg relative overflow-hidden text-center space-y-3">
          
          {/* Avatar with status ring */}
          <div className="relative inline-block mx-auto">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/40 shadow-md">
              <img
                alt={profile.name}
                className="w-full h-full object-cover"
                src={profile.avatar}
              />
            </div>
            <span className="absolute bottom-0 right-0 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px]" title="Active Verified Student">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="font-headline text-lg font-extrabold tracking-tight">
                {profile.name}
              </h2>
              <span className="material-symbols-outlined text-amber-300 text-lg" title="Skillify AI Verified Student" style={{ fontVariationSettings: '"FILL" 1' }}>
                verified
              </span>
            </div>
            
            <p className="text-xs text-white/85 font-medium mt-0.5">
              {profile.major} • {profile.college}
            </p>
          </div>

          {/* Badges & Tags */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-0.5 rounded-full backdrop-blur-xs">
              Level {profile.level || 1} Student
            </span>
            {profile.honorsBadge && (
              <span className="bg-amber-400/30 text-amber-100 text-[10px] font-bold px-3 py-0.5 rounded-full backdrop-blur-xs">
                🏆 {profile.honorsBadge}
              </span>
            )}
            {profile.lookingForInternships && (
              <span className="bg-emerald-400/30 text-emerald-100 text-[10px] font-bold px-3 py-0.5 rounded-full backdrop-blur-xs">
                💼 Open for Roles
              </span>
            )}
          </div>

          {/* Bio if available */}
          {profile.bio && (
            <p className="text-xs text-white/90 leading-relaxed max-w-sm mx-auto bg-black/10 rounded-2xl p-2.5 backdrop-blur-xs">
              "{profile.bio}"
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 bg-white text-primary text-xs font-bold rounded-xl hover:bg-cream-vanilla transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              <span>Share Profile</span>
            </button>
            {isCurrentUser ? (
              <button
                onClick={() => navigate('edit-profile')}
                className="py-2.5 px-4 bg-white/20 text-white hover:bg-white/30 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 backdrop-blur-xs"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="py-2.5 px-4 bg-white/20 text-white hover:bg-white/30 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 backdrop-blur-xs"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>Connect</span>
              </button>
            )}
          </div>
        </div>

        {/* Public Shareable Link Box */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">link</span>
              <span>Shareable Public Portfolio Link</span>
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Live & Public
            </span>
          </div>

          <div className="flex items-center gap-2 bg-surface dark:bg-inverse-surface/40 p-2 rounded-2xl border border-surface-variant/40">
            <span className="text-[11px] text-secondary font-mono truncate flex-1 select-all px-1">
              {publicUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shrink-0 ${
                hasCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary text-white hover:bg-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                {hasCopied ? 'check' : 'content_copy'}
              </span>
              <span>{hasCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[10px] text-secondary">
            Anyone with this link can view {isCurrentUser ? 'your' : `${profile.name}'s`} verified achievements, certifications and projects.
          </p>
        </div>

        {/* Certified Competencies */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-2.5">
          <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
            Certified Competencies & Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {displaySkills.map((s, idx) => (
              <span key={idx} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Official Certifications */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
              Verified Certifications ({displayCertificates.length})
            </h3>
            <span className="text-[10px] text-secondary font-medium">
              Skillify AI Authority
            </span>
          </div>

          <div className="space-y-2.5">
            {displayCertificates.map((cert) => (
              <div
                key={cert.id || cert.credentialId}
                className="p-3 bg-surface dark:bg-inverse-surface/40 rounded-2xl border border-surface-variant/40 flex items-center justify-between gap-2 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-base">workspace_premium</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">
                      {cert.title}
                    </p>
                    <p className="text-[10px] text-secondary">
                      {cert.credentialId || cert.id} • Score {cert.score || "95%"} {cert.issueDate ? `• ${cert.issueDate}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Verified
                </span>
              </div>
            ))}

            {displayCertificates.length === 0 && (
              <p className="text-center text-xs text-secondary py-3">
                No certifications published yet.
              </p>
            )}
          </div>
        </div>

        {/* Featured Projects & Repositories */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-3">
          <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
            Featured Projects & Repositories ({displayProjects.length})
          </h3>

          <div className="space-y-2.5">
            {displayProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-3 bg-surface dark:bg-inverse-surface/40 rounded-2xl border border-surface-variant/40 space-y-2 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                      {proj.title}
                    </h4>
                    <p className="text-[10px] text-secondary">
                      {proj.language} • {proj.category}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                    {proj.stars || 24}
                  </span>
                </div>

                {proj.description && (
                  <p className="text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim line-clamp-2">
                    {proj.description}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => openProjectRepo(proj)}
                  className="w-full py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-xs">code</span>
                  <span>View Repository</span>
                </button>
              </div>
            ))}

            {displayProjects.length === 0 && (
              <div className="text-center py-6 px-4 bg-surface dark:bg-inverse-surface/20 rounded-2xl border border-dashed border-outline-variant/60 space-y-1.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
                  <span className="material-symbols-outlined text-lg">folder_off</span>
                </div>
                <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">No projects submitted yet</p>
                <p className="text-[10px] text-secondary">
                  {isCurrentUser ? 'Your uploaded projects will appear here for recruiters and peers.' : 'Projects uploaded by this student will appear here.'}
                </p>
                {isCurrentUser && (
                  <button
                    type="button"
                    onClick={() => navigate('submit-project')}
                    className="mt-2 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">upload_file</span>
                    <span>Submit Project</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Academic & Contact Info */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-2.5 text-xs">
          <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
            Academic Credentials & Contact
          </h3>

          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-secondary uppercase">Institution</p>
              <p className="font-medium text-on-surface dark:text-inverse-on-surface">{profile.college}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-secondary uppercase">Major / Specialization</p>
              <p className="font-medium text-on-surface dark:text-inverse-on-surface">{profile.major}</p>
            </div>
            {profile.email && (
              <div>
                <p className="text-[10px] font-semibold text-secondary uppercase">Email</p>
                <p className="font-medium text-on-surface dark:text-inverse-on-surface">{profile.email}</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
