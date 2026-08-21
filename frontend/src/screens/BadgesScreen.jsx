import React from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function BadgesScreen() {
  const { badges, certificates, setSelectedCertModal, setIsCertModalOpen, navigate } = useApp();

  const handleViewCert = (cert) => {
    setSelectedCertModal(cert);
    setIsCertModalOpen(true);
  };

  const ongoingCourses = [
    {
      id: "course-1",
      title: "Advanced C++ Memory Management",
      progress: 45,
      completedDate: "In Progress",
      level: "Advanced"
    },
    {
      id: "course-2",
      title: "React 18 Architecture & Performance",
      progress: 60,
      completedDate: "In Progress",
      level: "Intermediate"
    }
  ];

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="My Achievements" />

      <main className="px-4 py-4 space-y-5 w-full">
        
        {/* Badges Carousel Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
              Unlocked Badges ({badges.length})
            </h2>
            <span className="text-[11px] text-primary font-semibold">
              Swipe →
            </span>
          </div>

          <div className="flex overflow-x-auto pb-2 gap-3 snap-x hide-scrollbar">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center min-w-[95px] max-w-[105px] snap-start bg-slate-900 dark:bg-slate-800 p-3 rounded-2xl border border-slate-700/60 shadow-md shrink-0 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2 shadow-inner border border-white/20">
                  <span className="material-symbols-outlined text-2xl text-white">
                    {badge.icon}
                  </span>
                </div>
                <span className="text-xs font-bold text-white line-clamp-1">
                  {badge.name}
                </span>
                <span className="text-[9px] text-white/80 mt-0.5 font-medium">
                  {badge.date}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Official Certificates Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
              Official Certificates ({certificates.length})
            </h2>
            <button
              onClick={() => navigate('quiz-select')}
              className="text-xs font-bold text-primary dark:text-primary-fixed hover:underline"
            >
              Earn New +
            </button>
          </div>

          <div className="space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-4 shadow-card border border-surface-variant/40 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-sm">
                      <span className="material-symbols-outlined text-xl icon-filled">workspace_premium</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate">
                        {cert.title}
                      </h3>
                      <p className="text-[10px] text-secondary font-medium">
                        Credential: {cert.credentialId}
                      </p>
                      <p className="text-[10px] text-secondary">
                        Issued: {cert.issueDate} • Score: {cert.score}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs">
                    Verified
                  </span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-surface-variant/30">
                  <button
                    onClick={() => handleViewCert(cert)}
                    className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-1 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>View Certificate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ongoing Courses */}
        <section className="space-y-3">
          <h2 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
            Ongoing Learning Track
          </h2>

          <div className="space-y-2.5">
            {ongoingCourses.map((c) => (
              <div
                key={c.id}
                className="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl p-3.5 shadow-sm border border-surface-variant/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                    {c.title}
                  </h4>
                  <span className="text-[10px] font-bold text-primary">{c.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high dark:bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${c.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
