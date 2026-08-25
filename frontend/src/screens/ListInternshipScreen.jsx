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
      <Navbar title="LIST INTERNSHIP" showBack={true} />

      <main className="max-w-xl mx-auto px-4 py-4 space-y-4 w-full">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-headline text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Post an Internship
          </h1>
          <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] leading-relaxed">
            Share student opportunities with thousands of verified university developers & designers.
          </p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#14171A] p-5 md:p-6 rounded-3xl shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] space-y-5 font-mono"
        >
          {/* Role Title */}
          <div className="space-y-1.5">
            <label className="block font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider" htmlFor="role">
              Internship Role <span className="text-[#D71921]">*</span>
            </label>
            <input
              id="role"
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer Intern"
              className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] focus:border-[#D71921] outline-none transition-colors"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="block font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider" htmlFor="company">
              Company / Organization <span className="text-[#D71921]">*</span>
            </label>
            <input
              id="company"
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. TechCorp Solutions"
              className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] focus:border-[#D71921] outline-none transition-colors"
            />
          </div>

          {/* Work Mode Toggle */}
          <div className="space-y-2 border-b border-slate-100 dark:border-[#24292F] pb-4">
            <label className="block font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Work Mode
            </label>
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-[#191D22] rounded-2xl w-fit border border-slate-200 dark:border-[#2D333B]">
              <button
                type="button"
                onClick={() => setMode('online')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  mode === 'online'
                    ? 'bg-[#D71921] text-white shadow-none'
                    : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🌐 Online / Remote
              </button>
              <button
                type="button"
                onClick={() => setMode('offline')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  mode === 'offline'
                    ? 'bg-[#D71921] text-white shadow-none'
                    : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🏢 Offline / On-site
              </button>
            </div>

            {/* Dynamic Location Input for On-site */}
            {mode === 'offline' && (
              <div className="pt-2 animate-fadeIn space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#8E959E]" htmlFor="location">
                  Office Location (City, State) <span className="text-[#D71921]">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] text-base">
                    location_on
                  </span>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore, Karnataka (Hybrid)"
                    className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] focus:border-[#D71921] outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Compensation Toggle */}
          <div className="space-y-2 border-b border-slate-100 dark:border-[#24292F] pb-4">
            <label className="block font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Compensation
            </label>
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-[#191D22] rounded-2xl w-fit border border-slate-200 dark:border-[#2D333B]">
              <button
                type="button"
                onClick={() => setCompensation('paid')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  compensation === 'paid'
                    ? 'bg-[#D71921] text-white shadow-none'
                    : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                💵 Paid
              </button>
              <button
                type="button"
                onClick={() => setCompensation('unpaid')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  compensation === 'unpaid'
                    ? 'bg-[#D71921] text-white shadow-none'
                    : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Unpaid / Academic
              </button>
            </div>

            {/* Dynamic Stipend Amount Input */}
            {compensation === 'paid' && (
              <div className="pt-2 animate-fadeIn space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-[#8E959E]" htmlFor="stipend">
                  Monthly Stipend Amount (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#D71921] text-sm font-mono">
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
                    className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl pl-8 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] focus:border-[#D71921] outline-none transition-colors font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#D71921]"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-[#14171A]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#D71921]"
              >
                {durationOptions.map((d) => (
                  <option key={d} value={d} className="bg-white dark:bg-[#14171A]">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-1.5">
            <label className="block font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. React, TailwindCSS, TypeScript, Git"
              className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] focus:border-[#D71921] outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Role Description & Perks
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide key details about daily projects, mentoring, certificate of completion, pre-placement offer (PPO), etc."
              className="w-full bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] focus:border-[#D71921] outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#D71921] hover:bg-[#b0141b] text-white rounded-2xl py-3.5 font-mono text-xs font-bold shadow-none transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>LIST INTERNSHIP</span>
              <span className="material-symbols-outlined text-base">rocket_launch</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
