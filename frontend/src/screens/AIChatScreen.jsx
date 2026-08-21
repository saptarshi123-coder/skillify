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
      <Navbar title="Skillie AI Chatbot" />

      {/* Connection & Status Banner */}
      <div className="bg-surface-container-high dark:bg-surface-container border-b border-surface-variant/40 px-3.5 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>
                smart_toy
              </span>
            </div>
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface ${
              chatbotStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-headline text-xs font-bold text-on-surface dark:text-inverse-on-surface">Skillie AI</p>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-primary/10 text-primary">
                {chatbotStatus.online ? 'Python v2.0' : 'Local NLP'}
              </span>
            </div>
            <p className="text-[10px] text-secondary flex items-center gap-1">
              <span>{getMoodEmoji(botMood.dominant_mood)} Mood: {botMood.dominant_mood || 'Helpful'}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
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
            className="w-7 h-7 rounded-full bg-surface-container-lowest dark:bg-surface-container hover:bg-surface-variant flex items-center justify-center text-secondary hover:text-primary transition-all border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-sm">sync</span>
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            title="Search Messages"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all border border-outline-variant/30 ${
              showSearch ? 'bg-primary text-white' : 'bg-surface-container-lowest dark:bg-surface-container text-secondary hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">search</span>
          </button>
          <button
            onClick={() => setShowStatsModal(true)}
            title="Bot Intelligence Stats"
            className="w-7 h-7 rounded-full bg-surface-container-lowest dark:bg-surface-container hover:bg-surface-variant flex items-center justify-center text-secondary hover:text-primary transition-all border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-sm">insights</span>
          </button>
          <button
            onClick={clearAIChatHistory}
            title="Clear Chat"
            className="w-7 h-7 rounded-full bg-surface-container-lowest dark:bg-surface-container hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center text-secondary hover:text-red-500 transition-all border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar (Expandable) */}
      {showSearch && (
        <div className="bg-surface-container-low dark:bg-surface-container-high px-4 py-2 border-b border-surface-variant/40 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-secondary">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversation..."
            className="flex-1 bg-transparent text-xs outline-none text-on-surface dark:text-inverse-on-surface"
            autoFocus
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-secondary hover:text-primary">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      )}

      {/* Chat Messages Stream */}
      <main className="px-3.5 py-4 space-y-4 flex-1 overflow-y-auto">
        <div className="flex justify-center">
          <span className="text-[10px] font-bold text-secondary bg-surface-container px-3 py-1 rounded-full shadow-xs">
            {chatbotStatus.online ? '⚡ Synced with Python NLP Backend' : '🧠 Standalone Local Intelligence Active'}
          </span>
        </div>

        {filteredMessages.length === 0 && (
          <div className="py-6 text-center space-y-4 max-w-sm mx-auto animate-fadeIn">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-primary to-primary-container text-white mx-auto flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>smart_toy</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-headline font-bold text-on-surface dark:text-inverse-on-surface">
                Hi, I'm Skillie AI! 👋
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                Your AI coding tutor and freelancing assistant. Ask me anything about algorithms, code optimization, escrow payments, or quizzes!
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
                  className="p-3 rounded-2xl bg-surface-container-lowest dark:bg-surface-container-high border border-surface-variant/50 hover:border-primary text-xs font-semibold text-on-surface dark:text-inverse-on-surface flex items-center justify-between transition-all hover:bg-primary/5 active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-sm text-primary">{p.icon}</span>
                    <span>{p.title}</span>
                  </div>
                  <span className="material-symbols-outlined text-xs text-secondary">arrow_forward</span>
                </button>
              ))}
            </div>

            {/* 30-min auto-delete notice */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-variant/40 text-[10px] text-secondary font-medium">
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
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs overflow-hidden mt-0.5 shadow-sm ${
                isAI ? 'bg-gradient-to-tr from-primary to-primary-container text-white' : 'bg-surface-variant ring-2 ring-primary/20'
              }`}>
                {isAI ? (
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: '"FILL" 1' }}>smart_toy</span>
                ) : (
                  <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
                )}
              </div>

              {/* Message Bubble & Cards */}
              <div className="space-y-2 max-w-[84%]">
                <div className={`rounded-2xl p-3.5 shadow-sm space-y-2 text-xs transition-all ${
                  isAI
                    ? 'bg-surface-container-lowest dark:bg-surface-container-high text-on-surface dark:text-inverse-on-surface border border-surface-variant/40 rounded-tl-xs'
                    : 'bg-primary text-white rounded-tr-xs shadow-primary/20'
                }`}>
                  {/* Text Content */}
                  <div className="text-xs font-normal">
                    {renderFormattedText(msg.text, msg.id)}
                  </div>

                  {/* Bot Metadata & Emotion Badges */}
                  {isAI && (
                    <div className="pt-2 border-t border-surface-variant/30 flex flex-wrap items-center justify-between gap-1.5 text-[9px] text-secondary">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(() => {
                          const badge = getEmotionBadge(msg);
                          if (!badge) return null;
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border shadow-2xs ${badge.color}`}>
                              <span>{badge.emoji}</span>
                              <span>{badge.label}</span>
                            </span>
                          );
                        })()}
                        {msg.engine && (
                          <span className="px-1.5 py-0.5 rounded bg-surface-container/60 text-secondary font-medium text-[8px]">
                            {msg.engine.includes('Python') ? '⚡ Live NLP' : '🧠 Standalone'}
                          </span>
                        )}
                      </div>
                      <span className="font-medium text-[9px] opacity-70">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {!isAI && (
                    <div className="text-[9px] text-right font-medium text-white/70">
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
                          className="px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-primary hover:text-white text-secondary text-[10px] font-semibold transition-all border border-outline-variant/40 flex items-center gap-1 active:scale-95 shadow-2xs cursor-pointer"
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
                  <div className="flex items-center gap-2 px-1 text-[10px] text-secondary">
                    {msg.feedbackRating ? (
                      <span className="text-amber-500 font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                        Feedback Recorded ({msg.feedbackRating}/5)
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-[9px]">Helpful?</span>
                        <button
                          onClick={() => rateAIMessage(msg.id, 5)}
                          title="Great response"
                          className="p-1 rounded hover:bg-surface-variant text-secondary hover:text-emerald-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">thumb_up</span>
                        </button>
                        <button
                          onClick={() => rateAIMessage(msg.id, 2)}
                          title="Needs improvement"
                          className="p-1 rounded hover:bg-surface-variant text-secondary hover:text-red-500 transition-colors"
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
          <div className="flex gap-2.5 self-start mr-4">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs shrink-0 shadow-md">
              <span className="material-symbols-outlined text-base animate-spin">autorenew</span>
            </div>
            <div className="space-y-1.5 max-w-[84%]">
              <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl rounded-tl-xs p-3.5 shadow-sm border border-primary/30 text-xs text-on-surface dark:text-inverse-on-surface">
                {streamingResponse ? (
                  <div>{renderFormattedText(streamingResponse, 'streaming')}</div>
                ) : (
                  <div className="flex items-center gap-2 text-secondary">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                    <p className="italic text-[11px]">{typingStatus}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Floating Bottom Input & Suggestions Area */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto p-3 bg-surface/95 dark:bg-inverse-surface/95 backdrop-blur-md border-t border-surface-variant/40 space-y-2 z-40 shadow-xl">
        
        {/* Dynamic Contextual Quick Replies Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
          {quickReplies.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPrompt(prompt)}
              disabled={isAITyping}
              className="px-2.5 py-1 rounded-full bg-surface-container-lowest dark:bg-surface-container text-secondary hover:text-primary hover:border-primary text-[10px] font-semibold whitespace-nowrap border border-outline-variant/50 transition-all shrink-0 active:scale-95 shadow-xs disabled:opacity-50"
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
            placeholder={isAITyping ? "Skillie is thinking..." : "Ask Skillie about code, escrow, jobs, tips..."}
            className="flex-1 bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant/60 rounded-2xl py-2.5 px-3.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface dark:text-inverse-on-surface shadow-sm disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAITyping}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
              inputText.trim() && !isAITyping
                ? 'bg-primary text-white shadow-md active:scale-95 hover:bg-primary/90'
                : 'bg-surface-variant text-secondary cursor-not-allowed opacity-50'
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface dark:bg-surface-container-high rounded-3xl p-5 w-full max-w-sm border border-surface-variant/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">psychology</span>
                </div>
                <div>
                  <h3 className="font-headline text-sm font-bold text-on-surface dark:text-inverse-on-surface">Skillie Brain & Mood</h3>
                  <p className="text-[10px] text-secondary">Learning Engine Analytics</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-7 h-7 rounded-full bg-surface-variant flex items-center justify-center text-secondary hover:text-primary"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Engine Status Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-surface-container-lowest dark:bg-surface-container border border-surface-variant/40 space-y-1">
                <p className="text-[10px] text-secondary font-medium">Backend Status</p>
                <p className="font-bold text-primary flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${chatbotStatus.online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {chatbotStatus.online ? 'Python API v2.0' : 'Local NLP'}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-lowest dark:bg-surface-container border border-surface-variant/40 space-y-1">
                <p className="text-[10px] text-secondary font-medium">Dominant Sentiment</p>
                <p className="font-bold text-on-surface dark:text-inverse-on-surface capitalize">
                  {getMoodEmoji(botMood.dominant_mood)} {botMood.dominant_mood || 'Positive'}
                </p>
              </div>
            </div>

            {/* Total Messages & Training */}
            <div className="p-3 rounded-2xl bg-surface-container-lowest dark:bg-surface-container border border-surface-variant/40 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Stored Messages (SQLite):</span>
                <span className="font-bold text-on-surface dark:text-inverse-on-surface">{chatMessages.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Intent Recognition Patterns:</span>
                <span className="font-bold text-primary">29 Intents / 500+ Patterns</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary">Humor & Joke Engine:</span>
                <span className="font-bold text-emerald-500">Active</span>
              </div>
            </div>

            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2.5 rounded-2xl bg-primary text-white font-bold text-xs shadow-md active:scale-98 transition-transform"
            >
              Back to Chat
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
