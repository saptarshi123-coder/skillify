import React, { useState, useEffect } from 'react';

export default function UpdateProgressModal({
  isOpen,
  onClose,
  course,
  progress,
  onSaveProgress
}) {
  const totalLessons = Number(progress?.totalLessons || course?.modulesCount || course?.syllabus?.length || 10);
  const initialCompleted = Number(progress?.completedLessons || 0);

  const [completedLessons, setCompletedLessons] = useState(initialCompleted);
  const [lastAccessedLesson, setLastAccessedLesson] = useState(
    progress?.lastAccessedLesson || course?.syllabus?.[0]?.title || 'Module 1: Introduction'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (progress) {
      setCompletedLessons(Number(progress.completedLessons || 0));
      setLastAccessedLesson(
        progress.lastAccessedLesson || course?.syllabus?.[0]?.title || 'Module 1: Introduction'
      );
    }
  }, [progress, course]);

  if (!isOpen || !course) return null;

  const currentPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));
  const isCompletionTarget = currentPercent >= 100;

  const handleSave = async (e) => {
    e.preventDefault();
    if (completedLessons < 0 || completedLessons > totalLessons) {
      setError(`Completed lessons must be between 0 and ${totalLessons}`);
      return;
    }
    if (!lastAccessedLesson.trim()) {
      setError('Please provide a lesson title or module note.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onSaveProgress({
        courseId: course.id,
        courseTitle: course.title,
        completedLessons: Number(completedLessons),
        totalLessons: Number(totalLessons),
        lastAccessedLesson: lastAccessedLesson.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update progress. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const increment = () => {
    if (completedLessons < totalLessons) {
      const next = completedLessons + 1;
      setCompletedLessons(next);
      // Auto-populate lesson title from syllabus if available
      const nextModule = course.syllabus?.[next - 1]?.title;
      if (nextModule) {
        setLastAccessedLesson(`Module ${next}: ${nextModule}`);
      }
    }
  };

  const decrement = () => {
    if (completedLessons > 0) {
      setCompletedLessons(completedLessons - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#14171A] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-[#24292F] flex flex-col gap-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#24292F] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#D71921]/10 text-[#D71921] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">trending_up</span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Update Course Progress
              </h3>
              <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E] truncate max-w-[220px]">
                {course.title}
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

        {/* Error Alert */}
        {error && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-mono flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Live Progress Card */}
        <div className="p-4 bg-slate-50 dark:bg-[#191D22] rounded-2xl border border-slate-200 dark:border-[#2D333B] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-[#8E959E]">Calculated Progress</span>
            <span className="font-bold text-slate-900 dark:text-white font-headline text-sm">
              {currentPercent}%
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3 bg-slate-200 dark:bg-[#20252B] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompletionTarget ? 'bg-emerald-500' : 'bg-[#D71921]'
              }`}
              style={{ width: `${currentPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#8E959E]">
            <span>{completedLessons} completed</span>
            <span>{totalLessons - completedLessons} remaining</span>
          </div>

          {isCompletionTarget && (
            <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono">
              <span className="material-symbols-outlined text-base">workspace_premium</span>
              <span>100% Completion: A verified certificate will be automatically issued! 🎓</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Completed Lessons Stepper */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-[#C5C9D0]">
              Lessons Completed:
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrement}
                disabled={completedLessons <= 0 || isSubmitting}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#24292F] dark:hover:bg-[#2C323A] border border-slate-200 dark:border-[#323842] text-slate-900 dark:text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">remove</span>
              </button>

              <div className="flex-1 text-center py-2 bg-slate-50 dark:bg-[#191D22] rounded-xl border border-slate-200 dark:border-[#2D333B]">
                <span className="font-headline text-lg font-bold text-slate-900 dark:text-white">
                  {completedLessons}
                </span>
                <span className="text-xs font-mono text-slate-400 ml-1">/ {totalLessons}</span>
              </div>

              <button
                type="button"
                onClick={increment}
                disabled={completedLessons >= totalLessons || isSubmitting}
                className="w-10 h-10 rounded-xl bg-[#D71921] hover:bg-[#b0141b] text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">add</span>
              </button>
            </div>
          </div>

          {/* Current Lesson Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-[#C5C9D0]">
              Last Accessed Lesson / Topic:
            </label>
            <input
              type="text"
              value={lastAccessedLesson}
              onChange={(e) => setLastAccessedLesson(e.target.value)}
              placeholder="e.g. Module 3: Compound Components"
              className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2.5 px-3 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[#D71921]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-[#24292F]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2.5 px-4 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-[#8E959E] hover:bg-slate-100 dark:hover:bg-[#191D22] transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 bg-[#D71921] hover:bg-[#b0141b] text-white rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>SAVE PROGRESS</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
