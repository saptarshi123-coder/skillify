import React, { useState } from 'react';

export default function LogActivityModal({
  isOpen,
  onClose,
  enrolledCourses = [],
  onLogActivity,
  defaultCourseId = ''
}) {
  const [courseId, setCourseId] = useState(defaultCourseId || enrolledCourses[0]?.courseId || enrolledCourses[0]?.id || '');
  const [type, setType] = useState('video'); // video | quiz | assignment
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('20');
  const [score, setScore] = useState('85');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update selected course if defaultCourseId changes
  React.useEffect(() => {
    if (defaultCourseId) {
      setCourseId(defaultCourseId);
    } else if (enrolledCourses.length > 0 && !courseId) {
      setCourseId(enrolledCourses[0].courseId || enrolledCourses[0].id);
    }
  }, [defaultCourseId, enrolledCourses]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a lesson or activity title.');
      return;
    }

    if (type !== 'video' && score !== '') {
      const numScore = Number(score);
      if (isNaN(numScore) || numScore < 0 || numScore > 100) {
        setError('Score must be between 0 and 100%.');
        return;
      }
    }

    if (duration !== '') {
      const numDur = Number(duration);
      if (isNaN(numDur) || numDur < 1) {
        setError('Duration must be at least 1 minute.');
        return;
      }
    }

    setError('');
    setIsSubmitting(true);

    const selectedCourseObj = enrolledCourses.find(c => (c.courseId || c.id) === courseId);

    try {
      await onLogActivity({
        type,
        courseId: courseId || 'general',
        courseTitle: selectedCourseObj?.courseTitle || selectedCourseObj?.title || 'Online Course',
        duration: duration ? Number(duration) : null,
        score: type !== 'video' && score !== '' ? Number(score) : null,
        title: title.trim()
      });
      setTitle('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to log activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#14171A] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-[#24292F] flex flex-col gap-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#24292F] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#D71921]/10 text-[#D71921] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">history_edu</span>
            </div>
            <div>
              <h3 className="font-headline text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Log Learning Activity
              </h3>
              <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E]">
                Record completed lessons, quiz scores or assignments
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Select Course */}
          {enrolledCourses.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-[#C5C9D0]">
                Associated Course:
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2 px-3 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[#D71921]"
              >
                {enrolledCourses.map((c) => (
                  <option key={c.courseId || c.id} value={c.courseId || c.id}>
                    {c.courseTitle || c.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Activity Type Selector */}
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-[#C5C9D0]">
              Activity Type:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('video')}
                className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  type === 'video'
                    ? 'bg-[#D71921]/10 border-[#D71921] text-[#D71921]'
                    : 'bg-slate-50 dark:bg-[#191D22] border-slate-200 dark:border-[#2D333B] text-slate-600 dark:text-[#8E959E]'
                }`}
              >
                <span className="material-symbols-outlined text-base">play_circle</span>
                <span>Video</span>
              </button>

              <button
                type="button"
                onClick={() => setType('quiz')}
                className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  type === 'quiz'
                    ? 'bg-[#D71921]/10 border-[#D71921] text-[#D71921]'
                    : 'bg-slate-50 dark:bg-[#191D22] border-slate-200 dark:border-[#2D333B] text-slate-600 dark:text-[#8E959E]'
                }`}
              >
                <span className="material-symbols-outlined text-base">quiz</span>
                <span>Quiz</span>
              </button>

              <button
                type="button"
                onClick={() => setType('assignment')}
                className={`py-2 px-2 rounded-xl text-xs font-mono font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  type === 'assignment'
                    ? 'bg-[#D71921]/10 border-[#D71921] text-[#D71921]'
                    : 'bg-slate-50 dark:bg-[#191D22] border-slate-200 dark:border-[#2D333B] text-slate-600 dark:text-[#8E959E]'
                }`}
              >
                <span className="material-symbols-outlined text-base">assignment</span>
                <span>Assignment</span>
              </button>
            </div>
          </div>

          {/* Activity / Lesson Title */}
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-[#C5C9D0]">
              Activity Description / Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'quiz' ? 'e.g. Module 2 Knowledge Assessment' : 'e.g. Watched Data Structures Overview'}
              className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2 px-3 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[#D71921]"
            />
          </div>

          {/* Optional Duration & Score */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-[#C5C9D0]">
                Duration (Mins):
              </label>
              <input
                type="number"
                min="1"
                max="600"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2 px-3 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[#D71921]"
              />
            </div>

            {type !== 'video' ? (
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-700 dark:text-[#C5C9D0]">
                  Score (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2 px-3 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-[#D71921]"
                />
              </div>
            ) : (
              <div className="space-y-1 opacity-50">
                <label className="text-xs font-mono font-bold text-slate-500">
                  Score:
                </label>
                <div className="py-2 px-3 bg-slate-100 dark:bg-[#191D22] rounded-2xl border border-slate-200 dark:border-[#2D333B] text-xs font-mono text-slate-400">
                  N/A (Video)
                </div>
              </div>
            )}
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
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>SAVE ACTIVITY</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
