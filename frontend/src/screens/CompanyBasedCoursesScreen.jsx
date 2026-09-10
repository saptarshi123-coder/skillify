import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export const COMPANY_COURSES_DATA = [
  {
    id: "gcp-cloud-eng",
    title: "Google Cloud Associate Cloud Engineer Prep Track",
    company: "Google Cloud",
    badge: "Cloud & Web",
    category: "Cloud & AI",
    level: "Intermediate",
    duration: "40 Hours",
    modulesCount: 12,
    studentsEnrolled: "14,200+",
    price: 0,
    isFree: true,
    certType: "Co-Branded Verified Certificate",
    icon: "cloud",
    color: "from-blue-600 to-indigo-700",
    description: "Official learning path covering IAM, Compute Engine, GKE clusters, VPC networking, Cloud Storage & deployment automation."
  },
  {
    id: "azure-ai-fundamentals",
    title: "Microsoft Azure AI Fundamentals (AI-900 Track)",
    company: "Microsoft",
    badge: "Azure & AI",
    category: "Cloud & AI",
    level: "Beginner to Pro",
    duration: "35 Hours",
    modulesCount: 10,
    studentsEnrolled: "18,900+",
    price: 0,
    isFree: true,
    certType: "Microsoft Certified Educator Tag",
    icon: "psychology",
    color: "from-[#0078D4] to-cyan-600",
    description: "Computer vision, Natural Language Processing, Conversational AI, and Responsible AI principles on Azure Cognitive Services."
  },
  {
    id: "aws-solutions-architect",
    title: "AWS Solutions Architect Associate Masterclass",
    company: "Amazon AWS",
    badge: "AWS DevOps",
    category: "Cloud & AI",
    level: "Advanced",
    duration: "50 Hours",
    modulesCount: 15,
    studentsEnrolled: "22,400+",
    price: 499,
    originalPrice: 2999,
    isFree: false,
    certType: "AWS Industry Referral Badge",
    icon: "dns",
    color: "from-amber-600 to-orange-700",
    description: "High availability, auto-scaling, S3 security policies, DynamoDB, Lambda serverless, & VPC peering architectural patterns."
  },
  {
    id: "nvidia-computer-vision",
    title: "NVIDIA Fundamentals of Computer Vision with PyTorch",
    company: "NVIDIA",
    badge: "DLI & CUDA",
    category: "Cloud & AI",
    level: "Advanced",
    duration: "30 Hours",
    modulesCount: 8,
    studentsEnrolled: "9,800+",
    price: 0,
    isFree: true,
    certType: "NVIDIA DLI Certificate",
    icon: "memory",
    color: "from-emerald-600 to-teal-800",
    description: "CNN architectures, object detection with YOLO, image segmentation, and GPU hardware acceleration using TensorRT."
  },
  {
    id: "oracle-java-se17",
    title: "Oracle Certified Professional: Java SE 17 Developer",
    company: "Oracle",
    badge: "Java & SQL",
    category: "Big Tech (Product)",
    level: "Intermediate",
    duration: "45 Hours",
    modulesCount: 14,
    studentsEnrolled: "11,500+",
    price: 0,
    isFree: true,
    certType: "Oracle Academic Partnership",
    icon: "storage",
    color: "from-red-600 to-rose-800",
    description: "Sealed classes, Records, Pattern Matching for switch, Virtual Threads (Project Loom), and JVM garbage collection tuning."
  },
  {
    id: "tcs-nqt-masterclass",
    title: "TCS NQT & Foundation Technical Masterclass",
    company: "TCS",
    badge: "NQT Master",
    category: "IT Services & Consulting",
    level: "Beginner to Pro",
    duration: "25 Hours",
    modulesCount: 9,
    studentsEnrolled: "34,000+",
    price: 0,
    isFree: true,
    certType: "TCS Direct Campus Referral",
    icon: "apartment",
    color: "from-purple-600 to-indigo-800",
    description: "Aptitude, quantitative problem solving, C/Java pseudocode analysis, advanced coding problem patterns, and mock interviews."
  },
  {
    id: "wipro-fullstack-cohort",
    title: "Wipro Full Stack Placement Track",
    company: "Wipro",
    badge: "Full Stack",
    category: "IT Services & Consulting",
    level: "Intermediate",
    duration: "60 Hours",
    modulesCount: 18,
    studentsEnrolled: "15,300+",
    price: 0,
    isFree: true,
    certType: "Wipro Talent Next Badge",
    icon: "terminal",
    color: "from-blue-700 to-sky-900",
    description: "React, Node.js, Spring Boot, REST APIs, Microservices, and DevOps deployment pipelines tailored for Wipro campus drives."
  },
  {
    id: "capgemini-agile-data",
    title: "Capgemini Agile Data Analytics & BI Track",
    company: "Capgemini",
    badge: "Agile Data",
    category: "IT Services & Consulting",
    level: "Intermediate",
    duration: "28 Hours",
    modulesCount: 8,
    studentsEnrolled: "8,700+",
    price: 0,
    isFree: true,
    certType: "Capgemini Verified Credential",
    icon: "hub",
    color: "from-cyan-700 to-blue-900",
    description: "SQL data modeling, PowerBI dashboarding, Agile Scrum methodologies, and business analytics case studies."
  }
];

export default function CompanyBasedCoursesScreen() {
  const { navigate, showToast, enrollInCourse, enrolledCourseIds } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);

  const categories = ['All', 'Big Tech (Product)', 'IT Services & Consulting', 'Cloud & AI', 'Free Certifications'];

  const filteredCourses = COMPANY_COURSES_DATA.filter((course) => {
    const matchesCategory =
      activeCategory === 'All' ||
      (activeCategory === 'Free Certifications' ? course.isFree : course.category === activeCategory);

    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleEnrollCourse = (course) => {
    enrollInCourse(course.id, course.title);
    setSelectedCourseModal(null);
    showToast(`Enrolled in ${course.company} Track!`, 'success');
  };

  return (
    <div className="w-full pb-24 transition-colors min-h-screen bg-slate-900/5 dark:bg-[#0f1115]">
      <Navbar title="COMPANY TRACKS" showBack onBack={() => navigate('courses')} />

      <main className="px-4 py-4 space-y-5 w-full max-w-2xl mx-auto">
        
        {/* Hero Banner Section */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 p-6 rounded-3xl border border-red-500/30 text-white space-y-3 relative overflow-hidden shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-black px-3 py-0.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified</span>
              Top Partner Cohorts
            </span>
            <span className="text-xs text-amber-200 font-mono">Verified Certificates</span>
          </div>

          <h1 className="font-headline text-lg md:text-xl font-bold text-white leading-snug">
            Company-Certified Learning Tracks
          </h1>
          <p className="text-xs font-mono text-slate-300 leading-relaxed">
            Master industry-vetted tech stacks designed by top tech partners (Google, Microsoft, AWS, NVIDIA, TCS) and earn direct recruiter-recognized credentials.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-amber-300/90">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">workspace_premium</span>
              <span>Co-Branded Diplomas</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
              <span>Placement Fast-Track</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Google, AWS, Microsoft, TCS, PyTorch..."
            className="w-full bg-white dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-3 pl-10 pr-10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] outline-none focus:border-[#D71921] shadow-card dark:shadow-none"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer shrink-0 active:scale-95 ${
                  isActive
                    ? 'bg-[#D71921] text-white shadow-sm'
                    : 'bg-white dark:bg-[#191D22] text-slate-700 dark:text-[#C5C9D0] border border-slate-200 dark:border-[#2D333B] hover:bg-slate-50 dark:hover:bg-[#20252B]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Course Cards Grid */}
        <div className="space-y-4">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds?.includes(course.id);
            return (
              <div
                key={course.id}
                className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-4 hover:border-[#D71921] transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
                      <span className="material-symbols-outlined text-2xl">{course.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#191D22] text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-[#2D333B]">
                          {course.company}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          {course.certType}
                        </span>
                      </div>
                      <h3 className="font-headline text-sm font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#D71921] bg-[#D71921]/15 px-2.5 py-1 rounded-full shrink-0">
                    {course.isFree ? 'FREE' : `₹${course.price}`}
                  </span>
                </div>

                <p className="text-xs font-mono text-slate-600 dark:text-[#A8AFB8] leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#8E959E] pt-2 border-t border-slate-100 dark:border-[#24292F]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">menu_book</span>
                      {course.modulesCount} Modules
                    </span>
                  </div>
                  <span>{course.studentsEnrolled} Learners</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleEnrollCourse(course)}
                    className={`flex-1 py-2.5 text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-sm ${
                      isEnrolled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#D71921] hover:bg-[#b0141b] text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {isEnrolled ? 'check_circle' : 'school'}
                    </span>
                    <span>{isEnrolled ? 'Resumed Track' : 'Enroll Now'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedCourseModal(course)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-[#191D22] text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-[#252B33] text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200 dark:border-[#2D333B]"
                  >
                    <span>Curriculum</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* How Certification Works Steps Section */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-6 border border-slate-200 dark:border-[#24292F] space-y-4 shadow-card">
          <h3 className="font-headline text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#D71921]">verified_user</span>
            How Company Certification Works
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#191D22] border border-slate-200/60 dark:border-[#2D333B]">
              <div className="w-7 h-7 rounded-xl bg-[#D71921] text-white text-xs font-mono font-bold flex items-center justify-center">1</div>
              <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white">Learn & Complete Modules</h4>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Finish official partner curriculum and code labs.</p>
            </div>

            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#191D22] border border-slate-200/60 dark:border-[#2D333B]">
              <div className="w-7 h-7 rounded-xl bg-[#D71921] text-white text-xs font-mono font-bold flex items-center justify-center">2</div>
              <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white">Pass Assessment</h4>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Score 75%+ on partner benchmark proctored exam.</p>
            </div>

            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-[#191D22] border border-slate-200/60 dark:border-[#2D333B]">
              <div className="w-7 h-7 rounded-xl bg-[#D71921] text-white text-xs font-mono font-bold flex items-center justify-center">3</div>
              <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white">Get Recruiter Referral</h4>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Directly tagged for HR interview calls in Skillify.</p>
            </div>
          </div>
        </section>

      </main>

      {/* Curriculum Modal */}
      {selectedCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14171A] w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-[#24292F] space-y-4 relative shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCourseModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-100 dark:bg-[#191D22] flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${selectedCourseModal.color} flex items-center justify-center text-white shrink-0`}>
                <span className="material-symbols-outlined text-xl">{selectedCourseModal.icon}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#D71921] uppercase font-bold">{selectedCourseModal.company}</span>
                <h3 className="font-headline text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedCourseModal.title}</h3>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-600 dark:text-slate-300">{selectedCourseModal.description}</p>

            <div className="space-y-2 pt-2">
              <h4 className="font-headline text-xs font-bold uppercase text-slate-900 dark:text-white">Syllabus Breakdown ({selectedCourseModal.modulesCount} Modules)</h4>
              <div className="space-y-2">
                {['Module 1: Architecture & Core Foundations', 'Module 2: Practical Code Labs & Hands-on Deployment', 'Module 3: Benchmark Practice Exam & Recruiter Tagging'].map((mod, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#D71921]">check_circle</span>
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleEnrollCourse(selectedCourseModal)}
              className="w-full py-3 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Enroll Now & Unlock Certificate</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
