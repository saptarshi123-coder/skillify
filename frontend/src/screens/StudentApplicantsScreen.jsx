import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STUDENTS_DATA } from '../data/studentsData';

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
      rankBg: 'bg-yellow-100',
      rankText: 'text-yellow-800',
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
      rankBg: 'bg-gray-100',
      rankText: 'text-gray-700',
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
      rankBg: 'bg-orange-100',
      rankText: 'text-orange-800',
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
      statusColor: 'bg-[#eae1d9] text-[#5b403c]',
      dotColor: 'bg-[#635d5a]',
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
      statusColor: 'bg-[#6f0001]/10 text-[#6f0001]',
      dotColor: 'bg-[#6f0001]',
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
      statusColor: 'bg-green-100 text-green-800',
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
    <div className="min-h-screen bg-[#fff8f3] text-[#1f1b16] flex flex-col pb-24">
      {/* Mobile Header */}
      <header className="w-full top-0 sticky bg-[#fff8f3] shadow-[0_1px_0_0_rgba(154,0,2,0.04)] z-40">
        <div className="flex items-center justify-between px-4 h-16 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="p-2 -ml-2 rounded-full hover:bg-[#f0e7df] transition-colors active:scale-95 text-[#5b403c]"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-semibold text-xl text-[#6f0001]" style={{ fontFamily: 'Sora, sans-serif' }}>
              Applicants
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
        {/* Top Candidates */}
        <section className="mb-6">
          <h2 className="text-2xl font-bold text-[#1f1b16] mb-4 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            <span className="material-symbols-outlined text-[#6f0001] text-3xl">workspace_premium</span>
            Top Candidates
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {topCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-[#e4beb8]/30 flex items-center gap-4 relative overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-pointer group"
                onClick={() => handleSelectCandidate(candidate)}
              >
                {/* Rank color stripe */}
                <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${candidate.rankColor}`} />
                <div className="pl-2 flex items-center gap-4 flex-1 min-w-0">
                  <img
                    className="w-14 h-14 rounded-full object-cover border-4 border-[#f5ece4] flex-shrink-0"
                    src={candidate.avatar}
                    alt={candidate.name}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-[#1f1b16] truncate group-hover:text-[#6f0001] transition-colors" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {candidate.name}
                    </h3>
                    <p className="text-sm text-[#5b403c] truncate" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                      {candidate.role}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`${candidate.rankBg} ${candidate.rankText} text-xs px-2 py-1 rounded-full flex items-center gap-1`} style={{ fontFamily: 'Geist, sans-serif' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>military_tech</span>
                      Rank {candidate.rank}
                    </span>
                    <div className="bg-[#6f0001]/10 rounded-lg px-3 py-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#6f0001]" style={{ fontSize: '16px' }}>speed</span>
                      <span className="text-xs font-bold text-[#6f0001]" style={{ fontFamily: 'Geist, sans-serif' }}>
                        Score: {candidate.score}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Applicants */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-2xl font-bold text-[#1f1b16] flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
              <span className="material-symbols-outlined text-[#6f0001]">groups</span>
              All Applicants
            </h2>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403c]" style={{ fontSize: '20px' }}>search</span>
              <input
                className="pl-10 pr-4 py-2 rounded-full border border-[#e4beb8] bg-white focus:ring-2 focus:ring-[#6f0001] focus:border-[#6f0001] text-sm outline-none w-48"
                placeholder="Search candidates..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-[0_4px_16px_rgba(154,0,2,0.03)] border border-[#e4beb8]/30 overflow-hidden">
            {/* Desktop Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-[#eae1d9] bg-[#f5ece4]/50 text-xs font-bold text-[#5b403c]" style={{ fontFamily: 'Geist, sans-serif' }}>
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
                  className={`grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 items-center ${idx !== filteredApplicants.length - 1 ? 'border-b border-[#eae1d9]' : ''} hover:bg-[#fbf2ea] transition-colors cursor-pointer group`}
                >
                  <div className="col-span-1 sm:col-span-5 flex items-center gap-3">
                    {applicant.avatar ? (
                      <img
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-[#eae1d9]"
                        src={applicant.avatar}
                        alt={applicant.name}
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#9a0002] text-[#ffa294] flex items-center justify-center flex-shrink-0 font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
                        {applicant.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#1f1b16] group-hover:text-[#6f0001] transition-colors truncate" style={{ fontFamily: 'Geist, sans-serif' }}>
                        {applicant.name}
                      </h4>
                      <p className="text-xs text-[#5b403c] truncate" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                        {applicant.email}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-3">
                    <p className="text-sm text-[#1f1b16] font-medium" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>
                      {applicant.role}
                    </p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex items-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${applicant.statusColor} text-xs font-semibold`} style={{ fontFamily: 'Geist, sans-serif' }}>
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
                      className="text-[#6f0001] font-semibold text-sm flex items-center gap-1 hover:underline transition-all"
                      style={{ fontFamily: 'Geist, sans-serif' }}
                    >
                      Review <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#eae1d9] text-center">
              <button
                className="text-[#6f0001] text-sm font-bold hover:underline decoration-2 underline-offset-4"
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                View All 42 Applicants
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
