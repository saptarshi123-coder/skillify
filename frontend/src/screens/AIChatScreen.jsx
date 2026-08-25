import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';
import { chatbotService } from '../services/chatbotService';

export default function AIChatScreen() {
  const {
    chatMessages,
    sendAIMessage,
    userProfile,
    isAITyping,
    typingStatus,
    streamingResponse,
    chatbotStatus,
    botMood,
    rateAIMessage,
    clearAIChatHistory,
    checkChatbotBackend,
    navigate
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [ratingMessageId, setRatingMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  // Load contextual quick replies on mount and after AI messages
  useEffect(() => {
    const lastAIMsg = [...chatMessages].reverse().find(m => m.sender === 'ai');
    chatbotService.getQuickReplies(userProfile.email || 'alex_rivera', lastAIMsg?.intent).then(replies => {
      if (replies && replies.length > 0) {
        setQuickReplies(replies);
      }
    });
  }, [chatMessages, userProfile.email]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, streamingResponse, isAITyping]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isAITyping) return;
    const text = inputText.trim();
    setInputText('');
    sendAIMessage(text);
  };

  const handleSelectPrompt = (promptText) => {
    if (isAITyping) return;
    sendAIMessage(promptText);
  };

  const handleActionClick = (action) => {
    if (typeof action === 'string') {
      sendAIMessage(action);
    } else if (action.screen) {
      navigate(action.screen);
    } else if (action.prompt) {
      sendAIMessage(action.prompt);
    } else if (action.label) {
      sendAIMessage(action.label);
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard?.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const filteredMessages = searchQuery.trim()
    ? chatMessages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : chatMessages;

  // Simple Markdown Parser Helper for Code Blocks and Formatting
  const renderFormattedText = (text, msgId) => {
    if (!text) return null;

    // Check for code block ```language ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'code',
        content: match[2].trim(),
        id: `${msgId}-code-${blockIndex++}`
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }

    return (
      <div className="space-y-2">
        {parts.map((part, idx) => {
          if (part.type === 'code') {
            return (
              <div key={idx} className="my-2 rounded-xl overflow-hidden bg-[#1E1E1E] text-slate-100 shadow-md border border-white/10 font-mono text-[11px]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#2D2D2D] border-b border-white/10 text-[10px] text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-primary">{part.language}</span>
                  <button
                    onClick={() => handleCopyCode(part.content, part.id)}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {copiedCodeId === part.id ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedCodeId === part.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 overflow-x-auto leading-relaxed">
                  <code>{part.content}</code>
                </pre>
              </div>
            );
          }

          // Format paragraphs, headers, bold, bullet points
          const lines = part.content.split('\n');
          return (
            <div key={idx} className="space-y-1.5 leading-relaxed">
              {lines.map((line, lIdx) => {
                if (line.startsWith('### ')) {
                  return <h4 key={lIdx} className="font-bold text-xs text-primary mt-1 mb-0.5">{line.replace('### ', '')}</h4>;
                }
                if (line.startsWith('## ')) {
                  return <h3 key={lIdx} className="font-bold text-sm text-primary mt-1 mb-0.5">{line.replace('## ', '')}</h3>;
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <div key={lIdx} className="flex items-start gap-1.5 pl-1">
                      <span className="text-primary text-xs font-bold">•</span>
                      <span>{renderInlineStyles(line.substring(2))}</span>
                    </div>
                  );
                }
                if (/^\d+\.\s/.test(line)) {
                  return (
                    <div key={lIdx} className="flex items-start gap-1.5 pl-1">
                      <span className="text-primary font-bold text-[10px]">{line.match(/^\d+\./)[0]}</span>
                      <span>{renderInlineStyles(line.replace(/^\d+\.\s*/, ''))}</span>
                    </div>
                  );
                }
                if (!line.trim()) {
                  return <div key={lIdx} className="h-1" />;
                }
                return <p key={lIdx}>{renderInlineStyles(line)}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderInlineStyles = (str) => {
    // Bold **text**
    const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((seg, i) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return <strong key={i} className="font-bold text-on-surface dark:text-inverse-on-surface">{seg.slice(2, -2)}</strong>;
      }
      if (seg.startsWith('*') && seg.endsWith('*')) {
        return <em key={i} className="italic text-secondary">{seg.slice(1, -1)}</em>;
      }
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono text-[10px] text-primary">{seg.slice(1, -1)}</code>;
      }
      return seg;
    });
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'positive': return '🌟';
      case 'curious': return '💡';
      case 'negative': return '💪';
      case 'neutral': return '🤖';
      default: return '✨';
    }
  };

  const getEmotionBadge = (msg) => {
    if (!msg) return null;
    const intent = msg.intent || '';
    const tags = msg.emotion?.emotion_tags || [];
    const sentiment = msg.sentiment || '';

    if (intent === 'emotional_sadness' || tags.includes('sad') || tags.includes('heartbroken')) {
      return { label: 'Empathetic & Supportive', emoji: '💙', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    }
    if (intent === 'emotional_excitement' || tags.includes('excited') || tags.includes('hyped') || tags.includes('happy')) {
      return { label: 'Hyped & Celebrating', emoji: '🎉', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
    if (intent === 'emotional_frustration' || tags.includes('angry') || tags.includes('distressed')) {
      return { label: 'Calming & Solution Focus', emoji: '🛠️', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    }
    if (intent === 'emotional_stress_anxiety') {
      return { label: 'Mindful & Grounding', emoji: '🌿', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' };
    }
    if (intent === 'emotional_gratitude_love' || tags.includes('affectionate')) {
      return { label: 'Heartfelt Warmth', emoji: '💖', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
    }
    if (intent === 'emotional_motivation') {
      return { label: 'Motivational Coaching', emoji: '🔥', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' };
    }
    if (intent === 'emotional_confusion' || tags.includes('confused')) {
      return { label: 'Patient & Clear Guide', emoji: '💡', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
    }
    if (sentiment === 'positive') {
      return { label: 'Friendly & Uplifting', emoji: '😊', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    }
    if (sentiment === 'negative') {
      return { label: 'Attentive & Reassuring', emoji: '🤝', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
    }
    return { label: 'Helpful Assistant', emoji: '✨', color: 'bg-primary/10 text-primary border-primary/20' };
  };

  return (
    <div className="w-full min-h-screen pb-36 flex flex-col transition-colors relative">
      <Navbar title="SKILLE" />

      {/* Connection & Status Banner */}
      <div className="bg-white dark:bg-[#14171A] border-b border-slate-200 dark:border-[#24292F] px-4 py-3 flex items-center justify-between shadow-card dark:shadow-none transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#D71921] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">
                smart_toy
              </span>
            </div>
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-black ${chatbotStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-headline text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Skille</p>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-[#D71921]/15 text-[#D71921]">
                {chatbotStatus.online ? 'Python v2.0' : 'Local NLP'}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E] flex items-center gap-1">
              <span>{getMoodEmoji(botMood.dominant_mood)} Mood: {botMood.dominant_mood || 'Helpful'}</span>
              <span>•</span>
              <span className="text-slate-700 dark:text-[#C5C9D0] font-medium">
                {chatbotStatus.online ? 'API Synced' : 'Ready'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => checkChatbotBackend(true)}
            title="Refresh Connection"
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#191D22] hover:bg-slate-200 dark:hover:bg-[#24292F] flex items-center justify-center text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-[#2D333B]"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search Messages"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border border-slate-200 dark:border-[#2D333B] ${
              showSearch ? 'bg-[#D71921] text-white' : 'bg-slate-100 dark:bg-[#191D22] text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">search</span>
          </button>
          <button
            onClick={() => setShowStatsModal(true)}
            title="Bot Intelligence Stats"
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#191D22] hover:bg-slate-200 dark:hover:bg-[#24292F] flex items-center justify-center text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-[#2D333B]"
          >
            <span className="material-symbols-outlined text-sm">insights</span>
          </button>
          <button
            onClick={clearAIChatHistory}
            title="Clear Chat"
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#191D22] hover:bg-red-50 dark:hover:bg-[#24292F] flex items-center justify-center text-slate-600 dark:text-[#8E959E] hover:text-[#D71921] transition-all border border-slate-200 dark:border-[#2D333B]"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar (Expandable) */}
      {showSearch && (
        <div className="bg-white dark:bg-[#191D22] px-4 py-2 border-b border-slate-200 dark:border-[#2D333B] flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-slate-400 dark:text-[#8E959E]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversation..."
            className="flex-1 bg-transparent text-xs font-mono outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E]"
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 dark:text-[#8E959E] hover:text-slate-700 dark:hover:text-white">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      )}

      {/* Chat Messages Stream */}
      <main className="px-3.5 py-4 space-y-4 flex-1 overflow-y-auto font-mono">
        <div className="flex justify-center">
          <span className="text-[10px] font-mono text-slate-500 dark:text-[#8E959E] bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] px-3 py-1 rounded-full shadow-card dark:shadow-none">
            {chatbotStatus.online ? '⚡ Synced with Python NLP Backend' : '🧠 Standalone Local Intelligence Active'}
          </span>
        </div>

        {filteredMessages.length === 0 && (
          <div className="py-6 text-center space-y-4 max-w-sm mx-auto animate-fadeIn">
            <div className="w-14 h-14 rounded-3xl bg-[#D71921] text-white mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">smart_toy</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-headline font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Hi, I'm Skille! 👋
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] leading-relaxed">
                Your AI coding tutor and career assistant. Ask me anything about algorithms, code optimization, internships, or quizzes!
              </p>
            </div>

            {/* Quick Starter Prompts */}
            <div className="grid grid-cols-1 gap-2 pt-2 text-left">
              {[
                { title: "How does SKILLIFY work?", icon: "help" },
                { title: "Explain Binary Search Algorithm", icon: "terminal" },
                { title: "How does Escrow protection work?", icon: "security" },
                { title: "Tell me a coding joke 😂", icon: "mood" }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPrompt(p.title)}
                  className="p-3 rounded-2xl bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] hover:border-[#D71921] text-xs font-mono font-semibold text-slate-900 dark:text-white flex items-center justify-between transition-all active:scale-[0.98] shadow-card dark:shadow-none cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-sm text-[#D71921]">{p.icon}</span>
                    <span>{p.title}</span>
                  </div>
                  <span className="material-symbols-outlined text-xs text-slate-400 dark:text-[#8E959E]">arrow_forward</span>
                </button>
              ))}
            </div>

            {/* 30-min auto-delete notice */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#14171A] border border-slate-200 dark:border-[#24292F] text-[10px] text-slate-500 dark:text-[#8E959E] font-mono">
              <span className="material-symbols-outlined text-xs text-amber-500">history_toggle_off</span>
              <span>Chat history automatically deletes after 30 minutes</span>
            </div>
          </div>
        )}

        {filteredMessages.map((msg, index) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id || index}
              className={`flex gap-2.5 ${isAI ? 'self-start mr-4' : 'self-end ml-6 flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs overflow-hidden mt-0.5 ${
                isAI ? 'bg-[#D71921] text-white' : 'border border-slate-300 dark:border-white/20'
              }`}>
                {isAI ? (
                  <span className="material-symbols-outlined text-base">smart_toy</span>
                ) : (
                  <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Message Bubble & Cards */}
              <div className="space-y-2 max-w-[84%]">
                <div className={`rounded-3xl p-4 text-xs font-mono transition-all ${
                  isAI
                    ? 'bg-white dark:bg-[#14171A] text-slate-900 dark:text-white border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none'
                    : 'bg-[#D71921] text-white'
                }`}>
                  {/* Text Content */}
                  <div className="text-xs font-normal leading-relaxed">
                    {renderFormattedText(msg.text, msg.id)}
                  </div>

                  {/* Bot Metadata */}
                  {isAI && (
                    <div className="pt-2 border-t border-slate-100 dark:border-[#24292F] flex flex-wrap items-center justify-between gap-1.5 text-[9px] text-slate-500 dark:text-[#8E959E]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {msg.engine && (
                          <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-600 dark:text-[#C5C9D0] font-mono text-[8px]">
                            {msg.engine.includes('Python') ? '⚡ Live NLP' : '🧠 Standalone'}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[9px] opacity-70">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {!isAI && (
                    <div className="text-[9px] text-right font-mono text-white/70">
                      {msg.timestamp}
                    </div>
                  )}
                </div>

                {/* Suggested Action Buttons from Bot */}
                {isAI && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {msg.suggestedActions.map((act, actIdx) => {
                      const label = typeof act === 'string' ? act : (act.label || act.prompt || act.screen);
                      return (
                        <button
                          key={actIdx}
                          onClick={() => handleActionClick(act)}
                          className="px-3 py-1 rounded-full bg-white dark:bg-[#14171A] hover:border-[#D71921] text-slate-700 dark:text-[#C5C9D0] hover:text-slate-900 dark:hover:text-white text-[10px] font-mono transition-all border border-slate-200 dark:border-[#24292F] flex items-center gap-1 active:scale-95 cursor-pointer"
                        >
                          <span>{label}</span>
                          <span className="material-symbols-outlined text-[11px]">arrow_forward</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Feedback Rating Bar */}
                {isAI && (
                  <div className="flex items-center gap-2 px-1 text-[10px] text-slate-500 dark:text-[#8E959E] font-mono">
                    {msg.feedbackRating ? (
                      <span className="text-amber-500 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">star</span>
                        Feedback Recorded ({msg.feedbackRating}/5)
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-[9px]">Helpful?</span>
                        <button
                          onClick={() => rateAIMessage(msg.id, 5)}
                          title="Great response"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#191D22] text-slate-500 dark:text-[#8E959E] hover:text-emerald-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">thumb_up</span>
                        </button>
                        <button
                          onClick={() => rateAIMessage(msg.id, 2)}
                          title="Needs improvement"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#191D22] text-slate-500 dark:text-[#8E959E] hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">thumb_down</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Streaming Response / Typing Indicator */}
        {isAITyping && (
          <div className="flex gap-2.5 self-start mr-4 font-mono">
            <div className="w-8 h-8 rounded-full bg-[#D71921] text-white flex items-center justify-center text-xs shrink-0">
              <span className="material-symbols-outlined text-base animate-spin">autorenew</span>
            </div>
            <div className="space-y-1.5 max-w-[84%]">
              <div className="bg-white dark:bg-[#14171A] rounded-3xl p-4 border border-slate-200 dark:border-[#24292F] text-xs text-slate-900 dark:text-white shadow-card dark:shadow-none">
                {streamingResponse ? (
                  <div>{renderFormattedText(streamingResponse, 'streaming')}</div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-[#8E959E]">
                    <span className="w-2 h-2 rounded-full bg-[#D71921] animate-ping" />
                    <p className="italic text-[11px] font-mono">{typingStatus}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Floating Bottom Input & Suggestions Area */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto p-3 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1A1D20] space-y-2 z-40 transition-colors">

        {/* Dynamic Contextual Quick Replies Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
          {quickReplies.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPrompt(prompt)}
              disabled={isAITyping}
              className="px-3 py-1 rounded-full bg-slate-100 dark:bg-[#14171A] text-slate-700 dark:text-[#C5C9D0] hover:text-slate-900 dark:hover:text-white text-[10px] font-mono whitespace-nowrap border border-slate-200 dark:border-[#24292F] transition-all shrink-0 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Text Input Bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isAITyping}
            placeholder={isAITyping ? "Skille is thinking..." : "Ask Skille about code, jobs, quizzes..."}
            className="flex-1 bg-white dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2.5 px-3.5 text-xs font-mono outline-none focus:border-[#D71921] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] shadow-xs dark:shadow-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAITyping}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              inputText.trim() && !isAITyping
                ? 'bg-[#D71921] hover:bg-[#b0141b] text-white active:scale-95 shadow-none'
                : 'bg-slate-200 dark:bg-[#191D22] text-slate-400 dark:text-[#666666] cursor-not-allowed opacity-50'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {isAITyping ? 'hourglass_top' : 'send'}
            </span>
          </button>
        </form>
      </div>

      {/* Intelligence & Mood Analytics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-mono">
          <div className="bg-white dark:bg-[#14171A] rounded-3xl p-5 w-full max-w-sm border border-slate-200 dark:border-[#24292F] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#24292F] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#D71921]/15 text-[#D71921] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">psychology</span>
                </div>
                <div>
                  <h3 className="font-headline text-xs md:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Skille Brain & Mood</h3>
                  <p className="text-[10px] text-slate-500 dark:text-[#8E959E]">Learning Engine Analytics</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#191D22] flex items-center justify-center text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Engine Status Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] space-y-1">
                <p className="text-[10px] text-slate-500 dark:text-[#8E959E] font-medium">Backend Status</p>
                <p className="font-bold text-[#D71921] flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${chatbotStatus.online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {chatbotStatus.online ? 'Python API v2.0' : 'Local NLP'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] space-y-1">
                <p className="text-[10px] text-slate-500 dark:text-[#8E959E] font-medium">Dominant Sentiment</p>
                <p className="font-bold text-slate-900 dark:text-white capitalize">
                  {getMoodEmoji(botMood.dominant_mood)} {botMood.dominant_mood || 'Positive'}
                </p>
              </div>
            </div>

            {/* Total Messages & Training */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-[#8E959E]">Stored Messages:</span>
                <span className="font-bold text-slate-900 dark:text-white">{chatMessages.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-[#8E959E]">Intent Recognition:</span>
                <span className="font-bold text-[#D71921]">29 Intents / 500+ Patterns</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-[#8E959E]">Humor Engine:</span>
                <span className="font-bold text-emerald-500">Active</span>
              </div>
            </div>

            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2.5 rounded-2xl bg-[#D71921] hover:bg-[#b0141b] text-white font-bold text-xs shadow-none active:scale-98 transition-transform cursor-pointer"
            >
              BACK TO CHAT
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
