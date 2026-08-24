import React from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function BadgesScreen() {
  const { badges, certificates, userProfile, userRole, setSelectedCertModal, setIsCertModalOpen, openCVGenerator, navigate } = useApp();

  // Recruiter guard: No student badge track for HR
  React.useEffect(() => {
    if (userRole === 'recruiter' || userRole === 'hr') {
      navigate('recruiter-profile');
    }
  }, [userRole, navigate]);

  const handleViewCert = (cert) => {
    setSelectedCertModal(cert);
    setIsCertModalOpen(true);
  };

  const ongoingCourses = userProfile.skillsProgress && userProfile.skillsProgress.length > 0
    ? userProfile.skillsProgress.slice(0, 2).map((sp, idx) => ({
        id: `course-${idx}`,
        title: sp.name,
        progress: sp.progress || 0,
        completedDate: sp.progress === 100 ? "Completed" : "In Progress",
        level: "Track"
      }))
    : [];

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
            {badges.length > 0 && (
              <span className="text-[11px] text-primary font-semibold">
                Swipe →
              </span>
            )}
          </div>

          {badges.length === 0 ? (
            <div className="text-center py-6 px-4 bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl border border-dashed border-outline-variant/60 space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">workspace_premium</span>
              </div>
              <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                No Badges Earned Yet
              </p>
              <p className="text-[11px] text-secondary">
                Complete skill assessments & quizzes to unlock verified skill badges.
              </p>
              <button
                onClick={() => navigate('quiz-select')}
                className="mt-1 px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm active:scale-95"
              >
                <span>Take a Quiz →</span>
              </button>
            </div>
          ) : (
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
          )}
        </section>

        {/* AI CV Generator Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">
                AI Resume & CV Generator
              </h2>
              <span className="bg-gradient-to-r from-primary to-primary-container text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                AI Powered
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              <span>{badges.length} Badges Synced</span>
            </span>
          </div>

          <div className="bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container-lowest dark:from-surface-container-high dark:to-surface-container-highest rounded-3xl p-5 shadow-card border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex-1 space-y-1.5 relative z-10">
              <h3 className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                </div>
                <span>Verified Academic & Professional CV</span>
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed">
                Generate a tailored 1-page vector PDF resume across 9 career domains (SDE, AI/ML, UI/UX, Data Science & more) infused with your unlocked badges, certificates, and scores.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-secondary">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                  Auto-fits layout
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                  ATS-friendly
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                  Vector ReportLab PDF
                </span>
              </div>
            </div>

            <button
              onClick={openCVGenerator}
              className="bg-gradient-to-r from-primary to-primary-container hover:shadow-lg text-white font-bold px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-md shrink-0 active:scale-95 cursor-pointer relative z-10"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>Generate AI CV</span>
            </button>
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

          {certificates.length === 0 ? (
            <div className="text-center py-6 px-4 bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl border border-dashed border-outline-variant/60 space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                No Certificates Yet
              </p>
              <p className="text-[11px] text-secondary">
                Pass a skill assessment with 70%+ to earn an official verifiable certificate.
              </p>
              <button
                onClick={() => navigate('quiz-select')}
                className="mt-1 px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-container transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm active:scale-95"
              >
                <span>Browse Quizzes →</span>
              </button>
            </div>
          ) : (
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
          )}
        </section>

        {/* Ongoing Courses */}
        {ongoingCourses.length > 0 && (
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
        )}

      </main>
    </div>
  );
}
