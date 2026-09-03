import React, { useState } from 'react';
import { COURSES_DATA } from '../../data/coursesData';

export default function EnrollCourseModal({
  isOpen,
  onClose,
  onEnroll,
  enrolledCourseIds = []
}) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const filteredCourses = COURSES_DATA.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmEnroll = async () => {
    if (!selectedCourse) {
      setError('Please select a course to enroll in.');
      return;
    }

    if (enrolledCourseIds.includes(selectedCourse.id)) {
      setError('You are already enrolled in this course.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onEnroll(selectedCourse);
      setSelectedCourse(null);
      onClose();
    } catch (err) {
      setError(err.message || 'Enrollment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#14171A] rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-[#24292F] flex flex-col gap-4 max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#24292F] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#D71921]/10 text-[#D71921] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">school</span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Enroll in a Course
              </h3>
              <p className="text-[11px] font-mono text-slate-500 dark:text-[#8E959E]">
                Select an industry-standard track to start learning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#191D22] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course title, topic or instructor..."
            className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2 pl-9 pr-3 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] outline-none focus:border-[#D71921]"
          />
        </div>

        {/* Validation / Error Banner */}
        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Course Selection List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-mono text-xs">
              No matching courses found.
            </div>
          ) : (
            filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.includes(course.id);
              const isSelected = selectedCourse?.id === course.id;

              return (
                <div
                  key={course.id}
                  onClick={() => {
                    if (!isEnrolled) {
                      setSelectedCourse(course);
                      setError('');
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-[#D71921]/5 border-[#D71921] ring-1 ring-[#D71921]'
                      : isEnrolled
                      ? 'bg-slate-50 dark:bg-[#191D22]/50 border-slate-200 dark:border-[#2D333B] opacity-60 cursor-not-allowed'
                      : 'bg-white dark:bg-[#191D22] border-slate-200 dark:border-[#2D333B] hover:border-slate-400 dark:hover:border-[#4B535D]'
                  }`}
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                      <span className="text-[#D71921] font-bold uppercase truncate">{course.category}</span>
                      <span className="text-amber-500 font-bold">★ {course.rating}</span>
                    </div>
                    <h4 className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                      {course.title}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E] truncate">
                      {course.instructor} • {course.modulesCount || 10} Modules • {course.duration}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {isEnrolled ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        ENROLLED
                      </span>
                    ) : isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-[#D71921] text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">check</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-[#D71921] border border-[#D71921]/30 px-2 py-0.5 rounded-lg">
                        SELECT
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Course Summary Preview */}
        {selectedCourse && (
          <div className="p-3 bg-slate-50 dark:bg-[#191D22] rounded-2xl border border-slate-200 dark:border-[#2D333B] shrink-0 text-xs font-mono space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-[#8E959E]">Ready to enroll:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                {selectedCourse.title}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-[#8E959E]">
              Includes {selectedCourse.modulesCount || 10} verified modules, certificate upon completion, and real-time Firestore progress tracking.
            </div>
          </div>
        )}

        {/* Action Buttons: Cancel / Save */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-[#24292F] shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="py-2.5 px-4 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-[#8E959E] hover:bg-slate-100 dark:hover:bg-[#191D22] transition-colors cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleConfirmEnroll}
            disabled={!selectedCourse || isSubmitting}
            className={`py-2.5 px-5 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-none ${
              !selectedCourse || isSubmitting
                ? 'bg-slate-200 dark:bg-[#20252B] text-slate-400 cursor-not-allowed'
                : 'bg-[#D71921] hover:bg-[#b0141b] text-white cursor-pointer active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>ENROLLING...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">bookmark_add</span>
                <span>CONFIRM ENROLLMENT</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
