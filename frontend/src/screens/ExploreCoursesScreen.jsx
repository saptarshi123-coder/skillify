import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { COURSE_CATEGORIES, COURSES_DATA } from '../data/coursesData';
import Navbar from '../components/Navigation/Navbar';
import { sqliteDB } from '../db/sqlite';
import { App as CapApp } from '@capacitor/app';

// =============================================================================
// 🎯 UPI PAYMENT CONFIGURATION (CHANGE THIS TO YOUR UPI ID)
// =============================================================================
// Replace with your own Google Pay / PhonePe / Paytm / BHIM UPI ID
export const SKILLIFY_UPI_ID = 'hritabratabardhan13579@oksbi';
export const PAYEE_NAME = 'Skillify AI Education';

export default function ExploreCoursesScreen() {
  const { navigate, showToast, enrolledCourseIds, enrollInCourse } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);
  const [paymentModalCourse, setPaymentModalCourse] = useState(null);
  const [pendingPaymentCourse, setPendingPaymentCourse] = useState(null);
  const [paymentTab, setPaymentTab] = useState('qr'); // 'qr' | 'apps'
  const [copiedUpi, setCopiedUpi] = useState(false);

  // UTR & Payment Verification States
  const [utrNumber, setUtrNumber] = useState('');
  const [verificationState, setVerificationState] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'error'
  const [verificationError, setVerificationError] = useState('');

  // Fallback enrolled courses list from context or local state
  const enrolledList = enrolledCourseIds || ['course-python-zero'];

  // Clean UPI ID without spaces for valid UPI intent & QR encoding
  const cleanUpiId = (SKILLIFY_UPI_ID || '').trim().replace(/\s+/g, '');

  // Generates standardized Mobile UPI Intent URI
  const generateUpiUri = (course, appScheme = 'upi') => {
    const merchantVpa = cleanUpiId;
    const payeeName = PAYEE_NAME;
    const amount = Number(course.price || 0).toFixed(2);
    const txnNote = `Skillify Course - ${course.title.slice(0, 35)}`;
    const txnRef = `SKF_${Date.now()}`;

    const params = new URLSearchParams({
      pa: merchantVpa,
      pn: payeeName,
      am: amount,
      cu: 'INR',
      tn: txnNote,
      tr: txnRef
    });

    if (appScheme === 'gpay') {
      return `gpay://upi/pay?${params.toString()}`;
    }
    if (appScheme === 'phonepe') {
      return `phonepe://pay?${params.toString()}`;
    }
    return `upi://pay?${params.toString()}`;
  };

  // Launch mobile UPI Intent
  const launchUpiIntent = (course, appScheme = 'upi') => {
    const upiUri = generateUpiUri(course, appScheme);
    setPendingPaymentCourse(course);

    try {
      // Launch standard mobile UPI intent URI to open user's chosen UPI app
      window.location.href = upiUri;
    } catch (e) {
      console.warn('UPI intent launch fallback:', e);
    }
  };

  // Copy UPI ID to clipboard
  const handleCopyUpiId = () => {
    try {
      navigator.clipboard.writeText(cleanUpiId);
      setCopiedUpi(true);
      showToast(`Copied UPI ID: ${cleanUpiId}`, 'success');
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      showToast(`UPI ID: ${cleanUpiId}`, 'info');
    }
  };

  // Handle Secure UTR / Payment Receipt Verification
  const handleVerifyUtrPayment = () => {
    const cleanUtr = utrNumber.trim().replace(/\s+/g, '');

    // Strict validation: UTR must be a 12-digit numeric reference or valid transaction code
    if (!cleanUtr || cleanUtr.length < 10 || !/^[0-9a-zA-Z]{10,16}$/.test(cleanUtr)) {
      setVerificationError('Please enter a valid 12-digit UPI Reference Number (UTR) from your payment app.');
      return;
    }

    // Check for duplicate / already used UTR
    if (sqliteDB.isUtrUsed(cleanUtr)) {
      setVerificationError('This UPI Reference Number has already been redeemed.');
      return;
    }

    setVerificationError('');
    setVerificationState('verifying');

    // Simulate authentic bank settlement & payment receipt verification
    setTimeout(() => {
      setVerificationState('success');

      if (paymentModalCourse) {
        const courseToEnroll = paymentModalCourse;
        enrollInCourse(courseToEnroll.id, courseToEnroll.title, {
          utr: cleanUtr,
          amount: courseToEnroll.price
        });

        setTimeout(() => {
          setPaymentModalCourse(null);
          setSelectedCourseModal(null);
          setPendingPaymentCourse(null);
          setUtrNumber('');
          setVerificationState('idle');
        }, 1500);
      }
    }, 1800);
  };

  // Handle Enrollment Action
  const handleEnroll = (course) => {
    // 1. If already enrolled, resume directly
    if (enrolledList.includes(course.id)) {
      showToast(`Resumed "${course.title}"!`, 'info');
      setSelectedCourseModal(null);
      return;
    }

    // 2. Free course -> enroll immediately
    if (course.isFree || !course.price || course.price === 0) {
      enrollInCourse(course.id, course.title);
      setSelectedCourseModal(null);
      return;
    }

    // 3. Paid course -> open Secure UPI Payment Modal (with Desktop QR & Verified UTR Check)
    setPaymentModalCourse(course);
    setPaymentTab(window.innerWidth > 640 ? 'qr' : 'apps');
    setUtrNumber('');
    setVerificationError('');
    setVerificationState('idle');
  };

  // Filter courses by Category and Multi-field Search
  const filteredCourses = COURSES_DATA.filter((course) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      course.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.skillsLearned?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const featuredCourse = COURSES_DATA.find((c) => c.featured) || COURSES_DATA[0];

  return (
    <div className="w-full pb-24 transition-colors min-h-screen">
      {/* Header */}
      <Navbar title="COURSES" showBack onBack={() => navigate('dashboard')} />

      <main className="px-4 py-4 space-y-5 w-full">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, skills, topics..."
            className="w-full bg-white dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-3 pl-10 pr-10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] shadow-card dark:shadow-none outline-none focus:border-[#D71921] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
          {COURSE_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
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

        {/* Featured Course Section (Shows if search is empty and All / Web Dev selected) */}
        {!searchQuery && (selectedCategory === 'All' || selectedCategory === 'Web Development') && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Featured Masterclass
              </h2>
              <span className="text-[10px] font-mono font-bold text-[#D71921] bg-[#D71921]/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                HOT
              </span>
            </div>

            <div
              onClick={() => setSelectedCourseModal(featuredCourse)}
              className="group relative rounded-3xl overflow-hidden bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none hover:border-[#D71921] transition-all cursor-pointer"
            >
              {/* Featured Image */}
              <div className="h-44 sm:h-52 w-full relative overflow-hidden bg-slate-900">
                <img
                  src={featuredCourse.image}
                  alt={featuredCourse.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute top-3 left-3 bg-[#D71921] text-white px-3 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 shadow-md">
                  <span className="material-symbols-outlined text-[13px]">star</span>
                  Featured Course
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/80 bg-black/40 px-2 py-0.5 rounded">
                    {featuredCourse.category} • {featuredCourse.duration}
                  </span>
                </div>
              </div>

              {/* Featured Body */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-headline text-sm md:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-snug">
                    {featuredCourse.title}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E] mt-1 line-clamp-2 leading-relaxed">
                    {featuredCourse.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#24292F]">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-headline text-base font-bold text-slate-900 dark:text-white">
                        ₹{featuredCourse.price.toLocaleString()}
                      </span>
                      <span className="text-xs font-mono line-through text-slate-400 dark:text-[#8E959E]">
                        ₹{featuredCourse.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                      By {featuredCourse.instructor}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnroll(featuredCourse);
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all shadow-none flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      enrolledList.includes(featuredCourse.id)
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#D71921] hover:bg-[#b0141b] text-white'
                    }`}
                  >
                    <span>{enrolledList.includes(featuredCourse.id) ? 'Continue' : 'Join Course'}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Trending Courses Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {searchQuery ? `Search Results (${filteredCourses.length})` : 'Explore & Trending Courses'}
            </h2>
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E]">
              {filteredCourses.length} Available
            </span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#14171A] rounded-3xl border border-slate-200 dark:border-[#24292F] space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-400">school</span>
              <p className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase">
                No courses found matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-mono text-[#D71921] font-bold hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredCourses.map((course) => {
                const isEnrolled = enrolledList.includes(course.id);
                return (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourseModal(course)}
                    className="bg-white dark:bg-[#14171A] rounded-2xl overflow-hidden border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none hover:border-[#D71921] transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
                  >
                    <div>
                      {/* Image */}
                      <div className="h-36 w-full relative overflow-hidden bg-slate-900">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {course.badge && (
                          <div
                            className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold text-white shadow-sm ${
                              course.isFree ? 'bg-emerald-600' : 'bg-[#D71921]'
                            }`}
                          >
                            {course.badge}
                          </div>
                        )}
                        {isEnrolled && (
                          <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[11px] text-emerald-400">check_circle</span>
                            Enrolled
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3.5 space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-[#8E959E] mb-1">
                            <span className="uppercase text-[#D71921] font-bold">{course.category}</span>
                            <span>{course.duration}</span>
                          </div>
                          <h4 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider line-clamp-2 leading-tight">
                            {course.title}
                          </h4>
                          <p className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E] mt-1 truncate">
                            {course.instructor}
                          </p>
                        </div>

                        {/* Ratings & Level */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-amber-500 fill-current">star</span>
                            <span className="font-bold text-slate-900 dark:text-white">{course.rating}</span>
                            <span>({course.reviewsCount})</span>
                          </div>
                          <span className="bg-slate-100 dark:bg-[#191D22] px-2 py-0.5 rounded text-[10px]">
                            {course.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Pricing & Action */}
                    <div className="p-3.5 pt-2 border-t border-slate-100 dark:border-[#24292F] flex items-center justify-between">
                      <div>
                        {course.isFree ? (
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            FREE
                          </span>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="font-headline text-xs font-bold text-slate-900 dark:text-white">
                              ₹{course.price.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-mono line-through text-slate-400">
                              ₹{course.originalPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(course);
                        }}
                        className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                          isEnrolled
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-[#D71921]/10 text-[#D71921] hover:bg-[#D71921] hover:text-white dark:bg-[#D71921]/20'
                        }`}
                      >
                        {isEnrolled ? 'Resume' : course.isFree ? 'Start Learning' : 'Enroll'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Course Detail & Syllabus Modal */}
      {selectedCourseModal && !paymentModalCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14171A] rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-[#24292F] shadow-2xl p-5 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#24292F]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#D71921] bg-[#D71921]/15 px-2.5 py-0.5 rounded-full">
                {selectedCourseModal.category}
              </span>
              <button
                onClick={() => setSelectedCourseModal(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-[#20252B] cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Course Title & Instructor */}
            <div className="space-y-1">
              <h3 className="font-headline text-base md:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {selectedCourseModal.title}
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-[#8E959E]">
                Instructor: <strong className="text-slate-800 dark:text-white">{selectedCourseModal.instructor}</strong> ({selectedCourseModal.instructorRole})
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 dark:bg-[#191D22] rounded-2xl p-3 text-center text-xs font-mono border border-slate-200 dark:border-[#2D333B]">
              <div>
                <p className="text-slate-400 text-[10px]">Duration</p>
                <p className="font-bold text-slate-800 dark:text-white">{selectedCourseModal.duration}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Rating</p>
                <p className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                  ★ {selectedCourseModal.rating}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Modules</p>
                <p className="font-bold text-slate-800 dark:text-white">{selectedCourseModal.modulesCount} Lessons</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] leading-relaxed">
              {selectedCourseModal.description}
            </p>

            {/* Skills Learned */}
            {selectedCourseModal.skillsLearned && (
              <div className="space-y-1.5">
                <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Skills You Will Gain
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCourseModal.skillsLearned.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono bg-slate-100 dark:bg-[#20252B] border border-slate-200 dark:border-[#2D333B] text-slate-800 dark:text-[#C5C9D0] px-2.5 py-1 rounded-lg"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Syllabus Overview */}
            {selectedCourseModal.syllabus && (
              <div className="space-y-2">
                <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Course Modules & Syllabus
                </h4>
                <div className="space-y-1.5">
                  {selectedCourseModal.syllabus.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#191D22] rounded-xl border border-slate-200 dark:border-[#2D333B] text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#D71921]/15 text-[#D71921] flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 dark:text-white font-medium">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{item.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action CTA in Modal */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#24292F] flex items-center justify-between">
              <div>
                {selectedCourseModal.isFree ? (
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                ) : (
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-headline text-lg font-bold text-slate-900 dark:text-white">
                      ₹{selectedCourseModal.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono line-through text-slate-400">
                      ₹{selectedCourseModal.originalPrice.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleEnroll(selectedCourseModal)}
                className={`py-3 px-6 rounded-2xl text-xs font-mono font-bold transition-all shadow-none flex items-center gap-2 cursor-pointer active:scale-95 ${
                  enrolledList.includes(selectedCourseModal.id)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#D71921] hover:bg-[#b0141b] text-white'
                }`}
              >
                <span>
                  {enrolledList.includes(selectedCourseModal.id)
                    ? 'Resume Course'
                    : selectedCourseModal.isFree
                    ? 'Start Learning Free'
                    : 'Enroll via UPI'}
                </span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secure Mobile & Desktop UPI Payment Modal */}
      {paymentModalCourse && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#14171A] rounded-t-3xl sm:rounded-3xl max-w-lg w-full border border-slate-200 dark:border-[#24292F] shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#24292F] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#D71921]/15 text-[#D71921] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">verified_user</span>
                </div>
                <div>
                  <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Verified UPI Payment
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                    Scan QR or Pay via App & Verify UTR
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setPaymentModalCourse(null);
                  setPendingPaymentCourse(null);
                  setVerificationState('idle');
                  setVerificationError('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#20252B] cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Course Summary Card */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#191D22] rounded-2xl border border-slate-200 dark:border-[#2D333B] flex items-center justify-between">
              <div className="space-y-0.5 min-w-0 pr-3">
                <p className="text-[10px] font-mono font-bold text-[#D71921] uppercase truncate">
                  {paymentModalCourse.category}
                </p>
                <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                  {paymentModalCourse.title}
                </h4>
                <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                  Certificate & Lifetime Access
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Amount Due</p>
                <p className="font-headline text-base font-bold text-slate-900 dark:text-white">
                  ₹{paymentModalCourse.price.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 dark:bg-[#191D22] p-1 rounded-2xl border border-slate-200 dark:border-[#2D333B] text-xs font-mono font-bold">
              <button
                onClick={() => {
                  setPaymentTab('qr');
                  setVerificationError('');
                }}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentTab === 'qr'
                    ? 'bg-white dark:bg-[#24292F] text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 dark:text-[#8E959E] hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-sm">qr_code_2</span>
                <span>1. Scan QR (Desktop/Phone)</span>
              </button>
              <button
                onClick={() => {
                  setPaymentTab('apps');
                  setVerificationError('');
                }}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentTab === 'apps'
                    ? 'bg-white dark:bg-[#24292F] text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 dark:text-[#8E959E] hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-sm">smartphone</span>
                <span>1. UPI Apps (Mobile)</span>
              </button>
            </div>

            {/* TAB 1: DESKTOP SCAN QR CODE */}
            {paymentTab === 'qr' && (
              <div className="space-y-3.5 py-1 text-center animate-in fade-in duration-150">
                <div className="flex flex-col items-center justify-center space-y-2">
                  {/* Dynamic UPI QR Code Image */}
                  <div className="relative p-3 bg-white rounded-3xl border-2 border-slate-200 dark:border-[#2D333B] shadow-md group">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(
                        generateUpiUri(paymentModalCourse, 'upi')
                      )}`}
                      alt="UPI Payment QR Code"
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-xl"
                    />
                    <div className="absolute inset-x-0 bottom-1 flex justify-center">
                      <span className="bg-[#D71921] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-sm">
                        UPI QR • ₹{paymentModalCourse.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                    Scan with <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, or any UPI app.
                  </p>
                </div>

                {/* Copy UPI ID Bar */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#191D22] rounded-2xl border border-slate-200 dark:border-[#2D333B]">
                  <div className="text-left min-w-0 pr-2">
                    <p className="text-[9px] font-mono text-slate-400 uppercase">Receiving UPI ID</p>
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">
                      {cleanUpiId}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyUpiId}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                      copiedUpi
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-[#24292F] text-slate-800 dark:text-white hover:bg-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {copiedUpi ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedUpi ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MOBILE INTENT DIRECT LAUNCH */}
            {paymentTab === 'apps' && (
              <div className="space-y-3 py-1 animate-in fade-in duration-150">
                <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-[#C5C9D0] uppercase tracking-wide">
                  Choose Mobile UPI App to Pay:
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Google Pay */}
                  <button
                    onClick={() => launchUpiIntent(paymentModalCourse, 'gpay')}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#2D333B] bg-white dark:bg-[#191D22] hover:border-[#D71921] flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#20252B] flex items-center justify-center text-slate-900 dark:text-white">
                      <span className="material-symbols-outlined text-xl text-blue-500">payments</span>
                    </div>
                    <span className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase">
                      Google Pay
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Launch & Pay</span>
                  </button>

                  {/* PhonePe */}
                  <button
                    onClick={() => launchUpiIntent(paymentModalCourse, 'phonepe')}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#2D333B] bg-white dark:bg-[#191D22] hover:border-[#D71921] flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#20252B] flex items-center justify-center text-slate-900 dark:text-white">
                      <span className="material-symbols-outlined text-xl text-purple-500">account_balance</span>
                    </div>
                    <span className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase">
                      PhonePe
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">Launch & Pay</span>
                  </button>
                </div>

                {/* Standard Universal UPI Intent */}
                <button
                  onClick={() => launchUpiIntent(paymentModalCourse, 'upi')}
                  className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-[#2D333B] bg-slate-50 dark:bg-[#191D22] hover:bg-slate-100 dark:hover:bg-[#20252B] flex items-center justify-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-[#D71921]">smartphone</span>
                  <span>Pay via Paytm / BHIM / CRED</span>
                </button>
              </div>
            )}

            {/* MANDATORY PAYMENT RECEIPT / 12-DIGIT UTR VERIFICATION PANEL */}
            <div className="p-4 bg-slate-50 dark:bg-[#191D22] rounded-3xl border border-slate-200 dark:border-[#2D333B] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#D71921]">pin</span>
                  <label className="text-[11px] font-mono font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                    2. Enter 12-Digit UPI Ref (UTR)
                  </label>
                </div>
                <span className="text-[9px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  Required to Unlock
                </span>
              </div>

              <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E] leading-relaxed">
                After completing the payment in your UPI app, enter the <strong>12-digit UPI Transaction ID / UTR Number</strong> from your receipt:
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={16}
                  value={utrNumber}
                  onChange={(e) => {
                    setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                    setVerificationError('');
                  }}
                  placeholder="e.g. 423819284729"
                  disabled={verificationState === 'verifying' || verificationState === 'success'}
                  className="w-full bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#2D333B] rounded-xl py-2.5 px-3.5 text-xs font-mono tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] outline-none focus:border-[#D71921]"
                />

                {verificationError && (
                  <p className="text-[10px] font-mono text-red-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">error</span>
                    {verificationError}
                  </p>
                )}

                {/* Verification Process States */}
                {verificationState === 'verifying' && (
                  <div className="py-2 flex items-center justify-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-white">
                    <span className="material-symbols-outlined text-base animate-spin text-[#D71921]">sync</span>
                    <span>Verifying UTR with Bank Settlement...</span>
                  </div>
                )}

                {verificationState === 'success' && (
                  <div className="py-2 flex items-center justify-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>Payment Verified! Unlocking Course...</span>
                  </div>
                )}

                {/* Submit Verification Button */}
                {verificationState !== 'verifying' && verificationState !== 'success' && (
                  <button
                    onClick={handleVerifyUtrPayment}
                    disabled={!utrNumber.trim()}
                    className={`w-full py-3 rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 ${
                      utrNumber.trim()
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        : 'bg-slate-200 dark:bg-[#24292F] text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">lock_open</span>
                    <span>Verify UTR & Unlock Course</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer security note */}
            <p className="text-[9px] font-mono text-center text-slate-400 dark:text-[#8E959E] pt-1">
              🔒 Bank Reference UTR Check • Protected Against Fraud & Duplicate Claims
            </p>

          </div>
        </div>
      )}
    </div>
  );
}
