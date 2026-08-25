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
      <Navbar title="ACHIEVEMENTS" />

      <main className="px-4 py-4 space-y-4 w-full">

        {/* Badges Carousel Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Unlocked Badges ({badges.length})
            </h2>
            {badges.length > 0 && (
              <span className="text-[11px] font-mono text-[#D71921] font-bold">
                SWIPE →
              </span>
            )}
          </div>

          {badges.length === 0 ? (
            <div className="text-center py-6 px-4 bg-white dark:bg-[#14171A] rounded-3xl border border-dashed border-slate-300 dark:border-[#2D333B] space-y-2 shadow-card dark:shadow-none">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">workspace_premium</span>
              </div>
              <p className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                No Badges Earned Yet
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E]">
                Complete skill assessments & quizzes to unlock verified skill badges.
              </p>
              <button
                onClick={() => navigate('quiz-select')}
                className="mt-1 px-3.5 py-2 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-none active:scale-95"
              >
                <span>TAKE A QUIZ →</span>
              </button>
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-2 gap-3 snap-x hide-scrollbar">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center min-w-[100px] max-w-[110px] snap-start bg-white dark:bg-[#14171A] p-3 rounded-2xl border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none shrink-0 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] flex items-center justify-center mb-2 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-2xl">
                      {badge.icon}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white line-clamp-1">
                    {badge.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-[#8E959E] mt-0.5">
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
              <h2 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                AI Resume & CV Generator
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-[#8E959E] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-[#D71921]">verified</span>
              <span>{badges.length} Badges Synced</span>
            </span>
          </div>

          <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <h3 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#D71921]">auto_awesome</span>
                <span>Verified Academic & Professional CV</span>
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-[#A8AFB8] leading-relaxed">
                Generate a tailored 1-page vector PDF resume across 9 career domains (SDE, AI/ML, UI/UX, Data Science & more) infused with your unlocked badges and scores.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#D71921]">check_circle</span>
                  Auto-fits layout
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#D71921]">check_circle</span>
                  ATS-friendly
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-[#D71921]">check_circle</span>
                  Vector PDF
                </span>
              </div>
            </div>

            <button
              onClick={openCVGenerator}
              className="bg-[#D71921] hover:bg-[#b0141b] text-white font-mono font-bold px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-none shrink-0 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>GENERATE AI CV</span>
            </button>
          </div>
        </section>

        {/* Official Certificates Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Official Certificates ({certificates.length})
            </h2>
            <button
              onClick={() => navigate('quiz-select')}
              className="text-xs font-mono font-bold text-[#D71921] hover:underline"
            >
              EARN NEW +
            </button>
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-6 px-4 bg-white dark:bg-[#14171A] rounded-3xl border border-dashed border-slate-300 dark:border-[#2D333B] space-y-2 shadow-card dark:shadow-none">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <p className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                No Certificates Yet
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E]">
                Pass a skill assessment with 70%+ to earn an official verifiable certificate.
              </p>
              <button
                onClick={() => navigate('quiz-select')}
                className="mt-1 px-3.5 py-2 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-none active:scale-95"
              >
                <span>BROWSE QUIZZES →</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white dark:bg-[#14171A] rounded-3xl p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                        <span className="material-symbols-outlined text-xl">workspace_premium</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                          {cert.title}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                          Credential: {cert.credentialId}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                          Issued: {cert.issueDate} • Score: {cert.score}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-[#C5C9D0] bg-slate-100 dark:bg-[#20252B] border border-slate-200 dark:border-[#2D333B] px-2.5 py-0.5 rounded-full shrink-0">
                      VERIFIED
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#24292F]">
                    <button
                      onClick={() => handleViewCert(cert)}
                      className="w-full py-2.5 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all shadow-none flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>VIEW CERTIFICATE</span>
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
            <h2 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Ongoing Learning Track
            </h2>

            <div className="space-y-2.5">
              {ongoingCourses.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-[#14171A] rounded-2xl p-4 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-2"
                >
                  <div className="flex items-center justify-between font-mono">
                    <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {c.title}
                    </h4>
                    <span className="text-[10px] font-bold text-[#D71921]">{c.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-[#20252B] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#D71921] rounded-full"
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
