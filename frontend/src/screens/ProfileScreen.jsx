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
    copyPublicProfileLink,
    logout
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
      <Navbar title="STUDENT PROFILE" />

      <main className="px-4 py-4 space-y-4 w-full">
        
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] flex flex-col items-center text-center space-y-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-300 dark:border-white/20 shadow-none">
            <img
              alt={userProfile.name}
              className="w-full h-full object-cover"
              src={userProfile.avatar}
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="font-headline text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {userProfile.name}
              </h2>
              <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-[#8E959E] bg-slate-100 dark:bg-[#20252B] border border-slate-200 dark:border-[#2D333B] px-2.5 py-0.5 rounded-full">
                Lvl {userProfile.level}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E] mt-0.5">
              {userProfile.major}
            </p>
          </div>

          {/* Badges / Status (Monochrome Outline Pills) */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {userProfile.honorsRoll && (
              <span className="bg-slate-100 dark:bg-[#111315] border border-slate-300 dark:border-[#383E47] text-slate-700 dark:text-[#C5C9D0] text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">school</span>
                <span>Honors Roll</span>
              </span>
            )}
            {userProfile.lookingForInternships && (
              <span className="bg-slate-100 dark:bg-[#111315] border border-slate-300 dark:border-[#383E47] text-slate-700 dark:text-[#C5C9D0] text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">work</span>
                <span>Open for Roles</span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full pt-2">
            <button
              onClick={() => navigate('edit-profile')}
              className="flex-1 py-2.5 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all shadow-none flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>EDIT PROFILE</span>
            </button>
            <button
              onClick={handleOpenPublicProfile}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#24292F] dark:hover:bg-[#2C323A] border border-slate-200 dark:border-[#323842] text-slate-800 dark:text-white text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span>PUBLIC LINK</span>
            </button>
            <button
              onClick={handleCopyLink}
              title="Copy Public Profile Link"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#24292F] dark:hover:bg-[#2C323A] border border-slate-200 dark:border-[#323842] text-slate-700 dark:text-white rounded-2xl transition-all flex items-center justify-center cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
            </button>
          </div>
        </div>

        {/* Verified Coding Skills */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Verified Coding Skills
            </h3>
            <button
              onClick={() => navigate('edit-profile')}
              className="text-[11px] font-mono font-bold text-[#D71921] hover:underline cursor-pointer"
            >
              MANAGE
            </button>
          </div>

          {userProfile.skills && userProfile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {userProfile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-800 dark:text-[#D0D4DC] text-xs font-mono px-3 py-1 rounded-xl"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Skill Progress Bars */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-[#24292F]">
            {(userProfile.skillsProgress && userProfile.skillsProgress.length > 0 ? userProfile.skillsProgress : [
              { name: "Frontend Development", progress: 0 },
              { name: "Data Structures & Algorithms", progress: 0 },
              { name: "UI/UX Design", progress: 0 },
              { name: "Python & Data Science", progress: 0 }
            ]).map((sp, idx) => {
              const currentProgress = sp.progress || 0;
              return (
                <div key={idx} className="space-y-1 font-mono">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-800 dark:text-white">{sp.name}</span>
                    <span className="text-[#D71921] font-bold">{currentProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-[#20252B] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D71921] rounded-full transition-all duration-500" style={{ width: `${currentProgress}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projects / Repositories */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Submitted Projects ({projects.length})
            </h3>
            <button
              onClick={() => navigate('submit-project')}
              className="text-xs font-mono font-bold text-[#D71921] hover:underline cursor-pointer"
            >
              + SUBMIT NEW
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-6 px-4 bg-slate-50 dark:bg-[#191D22] rounded-2xl border border-dashed border-slate-300 dark:border-[#2D333B] space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] text-slate-900 dark:text-white flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-xl">folder_off</span>
              </div>
              <div>
                <p className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  No projects submitted yet
                </p>
                <p className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E] mt-0.5">
                  Upload your code or GitHub repo to showcase it here.
                </p>
              </div>
              <button
                onClick={() => navigate('submit-project')}
                className="mt-1 px-3.5 py-1.5 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-none active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                <span>UPLOAD PROJECT</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => openProjectRepo(proj)}
                  className="p-3.5 bg-slate-50 dark:bg-[#191D22] rounded-2xl border border-slate-200 dark:border-[#2D333B] cursor-pointer hover:border-[#D71921] transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                      <span className="material-symbols-outlined text-base">code</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                        {proj.title}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                        {proj.language} • {proj.category}
                      </p>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-slate-400 dark:text-[#8E959E] text-base">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Academic Details */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-2.5 text-xs font-mono">
          <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Academic Information
          </h3>

          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-[#666666] uppercase">Institution</p>
              <p className="font-medium text-slate-900 dark:text-white">{userProfile.college}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-[#666666] uppercase">Email</p>
              <p className="font-medium text-slate-900 dark:text-white">{userProfile.email}</p>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white dark:bg-[#14171A] rounded-3xl p-4 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none">
          <button
            onClick={logout}
            className="w-full py-3 bg-[#D71921]/10 hover:bg-[#D71921]/20 border border-[#D71921]/30 text-[#D71921] text-xs font-mono font-bold rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>SIGN OUT</span>
          </button>
        </div>

      </main>
    </div>
  );
}
