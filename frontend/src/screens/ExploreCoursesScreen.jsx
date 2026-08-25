import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { COURSE_CATEGORIES, COURSES_DATA } from '../data/coursesData';
import Navbar from '../components/Navigation/Navbar';

export default function ExploreCoursesScreen() {
  const { navigate, showToast, userProfile } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(() => {
    try {
      const saved = localStorage.getItem('skillify_enrolled_courses');
      return saved ? JSON.parse(saved) : ['course-python-zero'];
    } catch {
      return ['course-python-zero'];
    }
  });

  const handleEnroll = (course) => {
    if (enrolledCourseIds.includes(course.id)) {
      showToast(`Resumed "${course.title}"!`, 'info');
      setSelectedCourseModal(null);
      return;
    }

    const updated = [...enrolledCourseIds, course.id];
    setEnrolledCourseIds(updated);
    try {
      localStorage.setItem('skillify_enrolled_courses', JSON.stringify(updated));
    } catch (e) {}

    showToast(`🎉 Enrolled in "${course.title}" successfully!`, 'success');
    setSelectedCourseModal(null);
  };

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
                      enrolledCourseIds.includes(featuredCourse.id)
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#D71921] hover:bg-[#b0141b] text-white'
                    }`}
                  >
                    <span>{enrolledCourseIds.includes(featuredCourse.id) ? 'Continue' : 'Join Course'}</span>
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
                const isEnrolled = enrolledCourseIds.includes(course.id);
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
      {selectedCourseModal && (
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
                  enrolledCourseIds.includes(selectedCourseModal.id)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#D71921] hover:bg-[#b0141b] text-white'
                }`}
              >
                <span>
                  {enrolledCourseIds.includes(selectedCourseModal.id)
                    ? 'Resume Course'
                    : selectedCourseModal.isFree
                    ? 'Start Learning Free'
                    : 'Enroll & Get Certified'}
                </span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
