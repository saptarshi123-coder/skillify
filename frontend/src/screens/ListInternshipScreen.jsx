import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';

export default function ListInternshipScreen() {
  const { listNewInternship, showToast } = useApp();

  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [mode, setMode] = useState('online'); // 'online' | 'offline'
  const [location, setLocation] = useState('');
  const [compensation, setCompensation] = useState('paid'); // 'unpaid' | 'paid'
  const [stipendAmount, setStipendAmount] = useState('20000');
  const [category, setCategory] = useState('Engineering');
  const [duration, setDuration] = useState('3 Months');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  const categories = ['Engineering', 'Design', 'Marketing', 'AI / ML', 'Data Science', 'Product'];
  const durationOptions = ['1 - 2 Months', '3 Months', '6 Months', 'Flexible'];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!role.trim()) {
      showToast('Please enter the internship role title', 'error');
      return;
    }
    if (!company.trim()) {
      showToast('Please enter the company name', 'error');
      return;
    }

    if (mode === 'offline' && !location.trim()) {
      showToast('Please specify the city/location for on-site work', 'error');
      return;
    }

    const tags = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const formattedStipend =
      compensation === 'unpaid'
        ? 'Unpaid'
        : stipendAmount
        ? `₹${Number(stipendAmount).toLocaleString()}/mo`
        : '₹15,000/mo';

    const newListing = {
      role: role.trim(),
      company: company.trim(),
      mode: mode,
      workType: mode === 'online' ? 'Online' : 'Offline',
      location: mode === 'online' ? (location.trim() || 'Remote (India)') : location.trim(),
      compensation: compensation,
      stipend: formattedStipend,
      stipendAmount: compensation === 'unpaid' ? 0 : Number(stipendAmount) || 15000,
      category: category,
      duration: duration,
      description: description.trim() || `Exciting ${role.trim()} internship at ${company.trim()}.`,
      tags: tags.length > 0 ? tags : [compensation === 'unpaid' ? 'Unpaid' : 'Paid', mode === 'online' ? 'Online' : 'Offline', category],
      icon: category === 'Design' ? 'architecture' : category === 'Marketing' ? 'campaign' : category === 'AI / ML' ? 'smart_toy' : 'corporate_fare'
    };

    listNewInternship(newListing);
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="List Internship" showBack={true} />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4 w-full">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-headline text-lg font-extrabold text-on-surface dark:text-inverse-on-surface">
            Post an Internship
          </h1>
          <p className="text-xs text-secondary dark:text-secondary-fixed-dim">
            Share student opportunities with thousands of verified university developers & designers.
          </p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest dark:bg-surface-container-high p-5 md:p-6 rounded-3xl shadow-card border border-surface-variant/40 space-y-5"
        >
          {/* Role Title */}
          <div className="space-y-1.5">
            <label className="block font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface" htmlFor="role">
              Internship Role <span className="text-primary">*</span>
            </label>
            <input
              id="role"
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer Intern"
              className="w-full bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface dark:text-inverse-on-surface placeholder-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="block font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface" htmlFor="company">
              Company / Organization <span className="text-primary">*</span>
            </label>
            <input
              id="company"
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. TechCorp Solutions"
              className="w-full bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface dark:text-inverse-on-surface placeholder-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>

          {/* Work Mode Toggle */}
          <div className="space-y-2 border-b border-surface-variant/40 pb-4">
            <label className="block font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
              Work Mode
            </label>
            <div className="flex items-center gap-2 p-1 bg-surface-container-low dark:bg-surface-container-lowest rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setMode('online')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'online'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                🌐 Online / Remote
              </button>
              <button
                type="button"
                onClick={() => setMode('offline')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'offline'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                🏢 Offline / On-site
              </button>
            </div>

            {/* Dynamic Location Input for On-site */}
            {mode === 'offline' && (
              <div className="pt-2 animate-fadeIn space-y-1.5">
                <label className="block text-[11px] font-semibold text-secondary" htmlFor="location">
                  Office Location (City, State) <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base">
                    location_on
                  </span>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore, Karnataka (Hybrid)"
                    className="w-full bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/60 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-on-surface dark:text-inverse-on-surface placeholder-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Compensation Toggle */}
          <div className="space-y-2 border-b border-surface-variant/40 pb-4">
            <label className="block font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
              Compensation
            </label>
            <div className="flex items-center gap-2 p-1 bg-surface-container-low dark:bg-surface-container-lowest rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setCompensation('paid')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  compensation === 'paid'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                💵 Paid
              </button>
              <button
                type="button"
                onClick={() => setCompensation('unpaid')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  compensation === 'unpaid'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                Unpaid / Academic
              </button>
            </div>

            {/* Dynamic Stipend Amount Input */}
            {compensation === 'paid' && (
              <div className="pt-2 animate-fadeIn space-y-1.5">
                <label className="block text-[11px] font-semibold text-secondary" htmlFor="stipend">
                  Monthly Stipend Amount (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-primary text-sm">
                    ₹
                  </span>
                  <input
                    id="stipend"
                    type="number"
                    min="0"
                    step="1000"
                    value={stipendAmount}
                    onChange={(e) => setStipendAmount(e.target.value)}
                    placeholder="25000"
                    className="w-full bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/60 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-on-surface dark:text-inverse-on-surface placeholder-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-2.5 text-xs text-on-surface dark:text-inverse-on-surface outline-none focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-2.5 text-xs text-on-surface dark:text-inverse-on-surface outline-none focus:border-primary"
              >
                {durationOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-1.5">
            <label className="block font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. React, TailwindCSS, TypeScript, Git"
              className="w-full bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-xs text-on-surface dark:text-inverse-on-surface placeholder-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">
              Role Description & Perks
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide key details about daily projects, mentoring, certificate of completion, pre-placement offer (PPO), etc."
              className="w-full bg-surface-container-low dark:bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 text-xs text-on-surface dark:text-inverse-on-surface placeholder-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-container text-white rounded-xl py-3.5 font-headline text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>List Internship</span>
              <span className="material-symbols-outlined text-base">rocket_launch</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
