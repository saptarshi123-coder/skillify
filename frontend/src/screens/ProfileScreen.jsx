import React from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function ProfileScreen() {
  const {
    userProfile,
    navigate,
    projects,
    openProjectRepo,
    openPublicProfile,
    copyPublicProfileLink
  } = useApp();

  const handleOpenPublicProfile = () => {
    openPublicProfile(userProfile);
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    copyPublicProfileLink(userProfile);
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="Student Profile" />

      <main className="px-4 py-4 space-y-4 w-full">
        
        {/* Profile Card Header */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-5 shadow-card border border-surface-variant/40 flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-primary/30 shadow-md">
            <img
              alt={userProfile.name}
              className="w-full h-full object-cover"
              src={userProfile.avatar}
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-headline text-lg font-bold text-on-surface dark:text-inverse-on-surface">
                {userProfile.name}
              </h2>
              <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                Lvl {userProfile.level}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">
              {userProfile.major}
            </p>
          </div>

          {/* Badges / Status */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {userProfile.honorsRoll && (
              <span className="bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <span className="material-symbols-outlined text-xs text-white">school</span>
                <span className="text-white">Honors Roll</span>
              </span>
            )}
            {userProfile.lookingForInternships && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <span className="material-symbols-outlined text-xs text-white">work</span>
                <span className="text-white">Open for Roles</span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full pt-2">
            <button
              onClick={() => navigate('edit-profile')}
              className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>Edit Profile</span>
            </button>
            <button
              onClick={handleOpenPublicProfile}
              className="flex-1 py-2.5 bg-surface dark:bg-inverse-surface border border-outline-variant/60 hover:border-primary text-on-surface dark:text-inverse-on-surface text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>Public Link</span>
            </button>
            <button
              onClick={handleCopyLink}
              title="Copy Public Profile Link"
              className="px-3 py-2.5 bg-surface dark:bg-inverse-surface border border-outline-variant/60 hover:border-primary text-secondary hover:text-primary rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
            </button>
          </div>
        </div>

        {/* Verified Coding Skills */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
              Verified Coding Skills
            </h3>
            <button
              onClick={() => navigate('edit-profile')}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {userProfile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Skill Progress Bars */}
          <div className="space-y-2.5 pt-2 border-t border-surface-variant/30">
            {userProfile.skillsProgress.map((sp, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span>{sp.name}</span>
                  <span className="text-primary font-bold">{sp.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high dark:bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${sp.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects / Repositories */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
              Submitted Projects ({projects.length})
            </h3>
            <button
              onClick={() => navigate('submit-project')}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              + Submit New
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-6 px-4 bg-surface dark:bg-inverse-surface/30 rounded-2xl border border-dashed border-outline-variant/60 space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-xl">folder_off</span>
              </div>
              <div>
                <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                  No projects submitted yet
                </p>
                <p className="text-[11px] text-secondary mt-0.5">
                  Upload your code or GitHub repo to showcase it here.
                </p>
              </div>
              <button
                onClick={() => navigate('submit-project')}
                className="mt-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                <span>Upload Project</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => openProjectRepo(proj)}
                  className="p-3 bg-surface dark:bg-inverse-surface/40 rounded-2xl border border-surface-variant/40 cursor-pointer hover:border-primary transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-base">code</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">
                        {proj.title}
                      </p>
                      <p className="text-[10px] text-secondary">
                        {proj.language} • {proj.category}
                      </p>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-secondary text-base">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Academic Details */}
        <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-3xl p-4 shadow-card border border-surface-variant/40 space-y-2.5 text-xs">
          <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
            Academic Information
          </h3>

          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-secondary uppercase">Institution</p>
              <p className="font-medium text-on-surface dark:text-inverse-on-surface">{userProfile.college}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-secondary uppercase">Email</p>
              <p className="font-medium text-on-surface dark:text-inverse-on-surface">{userProfile.email}</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
