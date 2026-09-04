import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STUDENTS_DATA } from '../data/studentsData';
import Navbar from '../components/Navigation/Navbar';

export default function StudentApplicantsScreen() {
  const { navigate, goBack, openPublicProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to build a complete candidate profile for PublicProfileScreen
  const getFullCandidateProfile = (candidate) => {
    // Check if there is an exact match in STUDENTS_DATA
    const matched = STUDENTS_DATA.find(
      (s) =>
        s.name?.toLowerCase() === candidate.name?.toLowerCase() ||
        s.id === candidate.id ||
        s.username === candidate.username
    );
    if (matched) return matched;

    // Return a structured student profile for candidates not in STUDENTS_DATA
    return {
      id: candidate.id || candidate.name.toLowerCase().replace(/\s+/g, '_'),
      username: candidate.name.toLowerCase().replace(/\s+/g, '_'),
      name: candidate.name,
      email: candidate.email || `${candidate.name.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
      major: candidate.role || 'Computer Science & Software Engineering',
      college: candidate.college || 'Tech Institute of Technology',
      avatar: candidate.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(candidate.name)}`,
      level: candidate.score ? Math.floor(candidate.score / 10) : 5,
      xp: candidate.score ? candidate.score * 35 : 2400,
      streak: 7,
      honorsBadge: candidate.score >= 95 ? 'Top Candidate' : 'Verified Scholar',
      lookingForInternships: true,
      bio: `Passionate candidate applying for ${candidate.role || 'Technical Intern'}. Demonstrated expertise through Skillify Academic assessments and hands-on projects.`,
      skills: candidate.skills || ['JavaScript', 'React', 'Node.js', 'Python', 'Git & GitHub'],
      skillsProgress: [
        { name: candidate.role || 'Technical Skills', progress: candidate.score || 88 },
        { name: 'Problem Solving & DSA', progress: 85 },
        { name: 'System Design', progress: 80 }
      ],
      certificates: [
        {
          id: `cert_${candidate.name.toLowerCase().replace(/\s+/g, '_')}_1`,
          title: `${candidate.role || 'Software Engineering'} Skill Verification`,
          credentialId: `SKF-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`,
          score: `${candidate.score || 90}%`,
          issueDate: 'Jan 2024',
          issuer: 'Skillify AI Certification Authority',
          badgeIcon: 'verified',
          category: candidate.role || 'Engineering'
        }
      ],
      projects: [
        {
          id: `proj_${candidate.name.toLowerCase().replace(/\s+/g, '_')}_1`,
          title: `${candidate.name.split(' ')[0]}'s Capstone Project`,
          language: 'JavaScript / Python',
          category: 'Software Engineering',
          stars: 34,
          likes: 89,
          description: `Full-stack application built to solve real-world problems as part of the ${candidate.role || 'Internship'} assessment portfolio.`,
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'
        }
      ]
    };
  };

  const handleSelectCandidate = (candidate) => {
    const fullProfile = getFullCandidateProfile(candidate);
    openPublicProfile(fullProfile);
  };

  // Top candidates
  const topCandidates = [
    {
      id: 'std_alex_mercer',
      rank: 1,
      name: 'Alex Mercer',
      email: 'alex.mercer@tech.edu',
      role: 'Frontend Intern',
      score: 98,
      rankColor: 'from-yellow-400 to-yellow-600',
      rankBg: 'bg-yellow-100 dark:bg-yellow-950/60',
      rankText: 'text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/40',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Redux']
    },
    {
      id: 'std_4',
      rank: 2,
      name: 'Elena Rostova',
      email: 'elena.rostova@berkeley.edu',
      role: 'Backend Intern',
      score: 95,
      rankColor: 'from-gray-300 to-gray-500',
      rankBg: 'bg-slate-100 dark:bg-slate-800',
      rankText: 'text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Cybersecurity']
    },
    {
      id: 'std_jordan_lee',
      rank: 3,
      name: 'Jordan Lee',
      email: 'jordan.lee@design.edu',
      role: 'UI/UX Intern',
      score: 92,
      rankColor: 'from-orange-300 to-orange-500',
      rankBg: 'bg-orange-100 dark:bg-orange-950/60',
      rankText: 'text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/40',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'CSS3']
    }
  ];

  // All applicants list
  const allApplicants = [
    {
      id: 'std_sarah_j',
      name: 'Sarah Jenkins',
      email: 'sarah.j@university.edu',
      role: 'Data Science Intern',
      status: 'New',
      statusColor: 'bg-slate-100 dark:bg-[#262A30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#323842]',
      dotColor: 'bg-slate-500 dark:bg-slate-400',
      score: 89,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      skills: ['Python', 'Pandas', 'Scikit-learn', 'SQL', 'Data Visualization']
    },
    {
      id: 'std_marcus_c',
      name: 'Marcus Chen',
      email: 'm.chen@tech.edu',
      role: 'Frontend Intern',
      status: 'Reviewed',
      statusColor: 'bg-[#D71921]/10 dark:bg-[#D71921]/20 text-[#D71921] dark:text-[#FF8B8D] border border-[#D71921]/30',
      dotColor: 'bg-[#D71921]',
      score: 91,
      initials: 'MC',
      skills: ['JavaScript', 'React', 'HTML5/CSS3', 'REST APIs', 'Git']
    },
    {
      id: 'std_david_o',
      name: "David O'Connor",
      email: 'david.o@college.edu',
      role: 'Backend Intern',
      status: 'Shortlisted',
      statusColor: 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/40',
      dotColor: 'bg-green-600',
      score: 94,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      skills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Python']
    }
  ];

  const filteredApplicants = allApplicants.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-background dark:bg-black text-on-surface dark:text-white flex flex-col pb-24 transition-colors">
      {/* Top Navbar with Dark Mode Converter */}
      <Navbar title="APPLICANTS" showBack onBack={goBack} />

      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-4 space-y-6">
        {/* Top Candidates */}
        <section className="space-y-3">
          <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D71921] dark:text-[#FF8B8D] text-2xl">workspace_premium</span>
            Top Candidates
          </h2>
          <div className="grid grid-cols-1 gap-3.5">
            {topCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white dark:bg-[#14171A] rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] flex items-center gap-3.5 relative overflow-hidden hover:border-slate-300 dark:hover:border-[#323842] hover:-translate-y-0.5 transition-all cursor-pointer group"
                onClick={() => handleSelectCandidate(candidate)}
              >
                {/* Rank color stripe */}
                <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${candidate.rankColor}`} />
                <div className="pl-2 flex items-center gap-3.5 flex-1 min-w-0">
                  <img
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-slate-200 dark:border-[#2D333B] flex-shrink-0"
                    src={candidate.avatar}
                    alt={candidate.name}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-[#D71921] dark:group-hover:text-[#FF8B8D] transition-colors">
                      {candidate.name}
                    </h3>
                    <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E] truncate">
                      {candidate.role}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`${candidate.rankBg} ${candidate.rankText} text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
                      <span className="material-symbols-outlined text-[13px]">military_tech</span>
                      Rank {candidate.rank}
                    </span>
                    <div className="bg-[#D71921]/10 dark:bg-[#D71921]/20 border border-[#D71921]/30 rounded-xl px-2.5 py-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#D71921] dark:text-[#FF8B8D] text-sm">speed</span>
                      <span className="text-[11px] font-mono font-bold text-[#D71921] dark:text-[#FF8B8D]">
                        {candidate.score}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Applicants */}
        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D71921] dark:text-[#FF8B8D]">groups</span>
              All Applicants
            </h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] text-lg">search</span>
              <input
                className="pl-9 pr-3 py-1.5 rounded-full border border-slate-200 dark:border-[#2D333B] bg-white dark:bg-[#191D22] focus:border-[#D71921] text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] outline-none w-44 sm:w-52"
                placeholder="Search candidates..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#14171A] rounded-2xl md:rounded-3xl shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-[#24292F] bg-slate-100/70 dark:bg-[#191D22] text-xs font-mono font-bold text-slate-600 dark:text-[#8E959E]">
              <div className="col-span-5">Candidate</div>
              <div className="col-span-3">Role Applied</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Applicants List */}
            <div className="flex flex-col">
              {filteredApplicants.map((applicant, idx) => (
                <div
                  key={applicant.id}
                  onClick={() => handleSelectCandidate(applicant)}
                  className={`grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 items-center ${idx !== filteredApplicants.length - 1 ? 'border-b border-slate-200 dark:border-[#24292F]' : ''} hover:bg-slate-50 dark:hover:bg-[#191D22] transition-colors cursor-pointer group`}
                >
                  <div className="col-span-1 sm:col-span-5 flex items-center gap-3">
                    {applicant.avatar ? (
                      <img
                        className="w-10 h-10 rounded-2xl object-cover flex-shrink-0 border border-slate-200 dark:border-[#2D333B]"
                        src={applicant.avatar}
                        alt={applicant.name}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-[#D71921] text-white flex items-center justify-center flex-shrink-0 font-headline font-bold text-xs">
                        {applicant.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#D71921] dark:group-hover:text-[#FF8B8D] transition-colors truncate">
                        {applicant.name}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E] truncate">
                        {applicant.email}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-3">
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                      {applicant.role}
                    </p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex items-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${applicant.statusColor} text-[11px] font-mono font-bold`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${applicant.dotColor}`} />
                      {applicant.status}
                    </span>
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex sm:justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCandidate(applicant);
                      }}
                      className="text-[#D71921] dark:text-[#FF8B8D] font-mono font-bold text-xs flex items-center gap-0.5 hover:underline transition-all"
                    >
                      Review <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 border-t border-slate-200 dark:border-[#24292F] text-center">
              <button
                className="text-[#D71921] dark:text-[#FF8B8D] text-xs font-mono font-bold hover:underline decoration-2 underline-offset-4 cursor-pointer"
              >
                VIEW ALL 42 APPLICANTS
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

