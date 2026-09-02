import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

/* ─────────────────────────────────────────
   Seed conversations per contact id
───────────────────────────────────────── */
const SEED_MESSAGES = {
  'skillify-careers': [
    { id: 1, from: 'them', text: 'Hi! Your application for the Frontend Intern role has been received.', time: '10:42 AM', date: 'Today' },
    { id: 2, from: 'them', text: 'We are currently reviewing your qualifications. Please complete the skills assessment quiz to move forward.', time: '10:43 AM' },
  ],
  'prof-sarah': [
    { id: 1, from: 'them', text: 'Hi! Regarding your recent project submission, please ensure you review section 3 before the final grading.', time: 'Yesterday', date: 'Yesterday' },
    { id: 2, from: 'me', text: 'Thank you Professor, I will review section 3 right away!', time: 'Yesterday' },
    { id: 3, from: 'them', text: 'Great. Also make sure your references follow the APA format.', time: 'Yesterday' },
  ],
  'study-group': [
    { id: 1, from: 'them', text: 'Mike: Does anyone have the notes from yesterday\'s lecture?', time: 'Oct 12', date: 'Oct 12' },
    { id: 2, from: 'me', text: 'I have them, will share in a bit!', time: 'Oct 12' },
    { id: 3, from: 'them', text: 'Priya: Same, I missed it too 😅', time: 'Oct 12' },
  ],
  // HR side contacts
  'alex-rivera': [
    { id: 1, from: 'them', text: 'Hello! Thank you for considering my application. I wanted to follow up on my submission for the Frontend Intern role.', time: '10:30 AM', date: 'Today' },
    { id: 2, from: 'them', text: 'I have completed the skills assessment quiz as well.', time: '10:31 AM' },
  ],
  'marcus-chen': [
    { id: 1, from: 'them', text: 'I have submitted the Frontend Skills Assessment. Looking forward to hearing from you.', time: '9:15 AM', date: 'Today' },
  ],
  'david-oconnor': [
    { id: 1, from: 'them', text: 'Hello, I am very interested in the Backend Intern position at your company. Could you tell me more about the tech stack?', time: 'Yesterday', date: 'Yesterday' },
    { id: 2, from: 'me', text: 'Hi David! We primarily use Node.js, Python and PostgreSQL. You can see more details in the job posting.', time: 'Yesterday' },
    { id: 3, from: 'them', text: 'Perfect, that\'s exactly my stack! Really excited about this opportunity.', time: 'Yesterday' },
  ],
};

const QUICK_REPLIES = [
  'Thank you! 👋',
  'Got it, will do!',
  'Can we schedule a call?',
  'Please share more details.',
  'Looking forward to it!',
];

export default function ChatScreen() {
  const { goBack, activeChatContact, userProfile } = useApp();

  const contact = activeChatContact || {
    id: 'skillify-careers',
    name: 'Skillify Careers',
    subtitle: 'careers@skillify.academic',
    avatar: null,
    initials: 'SC',
    online: false,
  };

  const [messages, setMessages] = useState(() => SEED_MESSAGES[contact.id] || []);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Simulate "seen" after 1 second and typing reply after 2 seconds
  const simulateReply = (userMsg) => {
    setIsTyping(true);
    const delay = 1500 + Math.random() * 1500;
    typingTimerRef.current = setTimeout(() => {
      const autoReplies = [
        'Thanks for reaching out! We\'ll get back to you shortly.',
        'Received! Our team will review and respond soon.',
        'Got it! Is there anything else you\'d like to share?',
        'Thank you for your message. We appreciate your enthusiasm!',
        'Noted. We\'ll be in touch regarding the next steps.',
      ];
      const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          from: 'them',
          text: reply,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const sendMessage = (text = inputText.trim()) => {
    if (!text) return;
    const newMsg = {
      id: Date.now(),
      from: 'me',
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setShowQuickReplies(false);
    simulateReply(text);
    // Mark as delivered after 800ms
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m))
      );
    }, 800);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date label
  const groupedMessages = messages.reduce((acc, msg) => {
    const label = msg.date || null;
    if (label && (!acc.length || acc[acc.length - 1].date !== label)) {
      acc.push({ type: 'date', label });
    }
    acc.push({ type: 'msg', ...msg });
    return acc;
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#fff8f3] text-[#1f1b16] overflow-hidden">

      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-[#fff8f3] border-b border-[#eae1d9] shadow-[0_1px_6px_rgba(154,0,2,0.05)] z-40">
        <div className="flex items-center gap-3 px-3 py-3">

          {/* Back button */}
          <button
            onClick={goBack}
            className="p-2 rounded-full text-[#6f0001] hover:bg-[#f5ece4] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#e4beb8]"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-[#9a0002] text-[#ffa294] flex items-center justify-center font-bold text-sm"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                {contact.initials || contact.name?.charAt(0)}
              </div>
            )}
            {contact.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#fff8f3]" />
            )}
          </div>

          {/* Name & subtitle */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-base font-bold text-[#1f1b16] truncate leading-tight"
              style={{ fontFamily: 'Sora, sans-serif' }}
            >
              {contact.name}
            </h1>
            <p
              className="text-xs text-[#635d5a] truncate"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              {isTyping ? (
                <span className="text-[#6f0001] font-medium animate-pulse">typing…</span>
              ) : (
                contact.subtitle || (contact.online ? 'Online' : 'Tap to view info')
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full text-[#6f0001] hover:bg-[#f5ece4] active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[22px]">videocam</span>
            </button>
            <button className="p-2 rounded-full text-[#6f0001] hover:bg-[#f5ece4] active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[22px]">more_vert</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Message List ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {groupedMessages.map((item, idx) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${idx}`} className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-[#eae1d9]" />
                <span
                  className="text-xs text-[#8f706b] px-2 flex-shrink-0"
                  style={{ fontFamily: 'Geist, sans-serif' }}
                >
                  {item.label}
                </span>
                <div className="flex-1 h-px bg-[#eae1d9]" />
              </div>
            );
          }

          const isMe = item.from === 'me';
          return (
            <div
              key={item.id}
              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar (them only) */}
              {!isMe && (
                contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full bg-[#9a0002] text-[#ffa294] flex items-center justify-center flex-shrink-0 mb-1 text-xs font-bold"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                  >
                    {contact.initials || contact.name?.charAt(0)}
                  </div>
                )
              )}

              <div className={`flex flex-col gap-0.5 max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${isMe
                      ? 'bg-[#9a0002] text-white rounded-br-sm'
                      : 'bg-white text-[#1f1b16] border border-[#eae1d9] rounded-bl-sm'
                    }`}
                  style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
                >
                  {item.text}
                </div>

                {/* Time + status */}
                <div className={`flex items-center gap-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span
                    className="text-[10px] text-[#8f706b]"
                    style={{ fontFamily: 'Geist, sans-serif' }}
                  >
                    {item.time}
                  </span>
                  {isMe && (
                    <span className="material-symbols-outlined text-[12px] text-[#8f706b]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.status === 'delivered' ? 'done_all' : 'check'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2">
            {contact.avatar ? (
              <img src={contact.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#9a0002] text-[#ffa294] flex items-center justify-center flex-shrink-0 mb-1 text-xs font-bold"
                style={{ fontFamily: 'Sora, sans-serif' }}>
                {contact.initials || contact.name?.charAt(0)}
              </div>
            )}
            <div className="bg-white border border-[#eae1d9] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#9a0002] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#9a0002] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[#9a0002] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick Replies ── */}
      {showQuickReplies && (
        <div className="flex-shrink-0 px-4 pb-2 overflow-x-auto">
          <div className="flex gap-2 w-max">
            {QUICK_REPLIES.map((r) => (
              <button
                key={r}
                onClick={() => sendMessage(r)}
                className="flex-shrink-0 bg-white border border-[#e4beb8] text-[#6f0001] text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#ffdad5] active:scale-95 transition-all shadow-sm"
                style={{ fontFamily: 'Geist, sans-serif' }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="flex-shrink-0 bg-[#fff8f3] border-t border-[#eae1d9] px-3 py-3 pb-safe">
        <div className="flex items-end gap-2">

          {/* Quick replies toggle */}
          <button
            onClick={() => setShowQuickReplies(v => !v)}
            className={`flex-shrink-0 p-2 rounded-full transition-all active:scale-95 ${
              showQuickReplies ? 'bg-[#6f0001] text-white' : 'text-[#6f0001] hover:bg-[#f5ece4]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {showQuickReplies ? 'close' : 'add_circle'}
            </span>
          </button>

          {/* Text area */}
          <div className="flex-1 bg-white border border-[#e4beb8] rounded-2xl px-4 py-2.5 flex items-end gap-2 focus-within:border-[#9a0002] focus-within:ring-2 focus-within:ring-[#9a0002]/10 transition-all shadow-sm">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                // auto-grow
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              className="flex-1 bg-transparent outline-none resize-none text-sm text-[#1f1b16] placeholder-[#8f706b] leading-relaxed max-h-[120px] overflow-y-auto"
              style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
            />
            {/* Emoji button */}
            <button className="flex-shrink-0 text-[#8f706b] hover:text-[#6f0001] transition-colors mb-0.5">
              <span className="material-symbols-outlined text-[22px]">sentiment_satisfied</span>
            </button>
          </div>

          {/* Send / Mic button */}
          <button
            onClick={() => sendMessage()}
            className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md ${
              inputText.trim()
                ? 'bg-[#9a0002] text-white hover:bg-[#6f0001]'
                : 'bg-[#f5ece4] text-[#8f706b]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {inputText.trim() ? 'send' : 'mic'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
