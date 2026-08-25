import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navigation/Navbar';
import { COMMUNITY_PROJECTS } from '../data/communityProjects';

export default function DiscoverScreen() {
  const { projects, openProjectRepo, navigate, userProfile, userRole, showToast, openPublicProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const isRecruiter = userRole === 'recruiter' || userRole === 'hr';

  // Like State Map: { [projectId]: { liked: boolean, count: number } }
  const [likesState, setLikesState] = useState({});

  // Comments State Map: { [projectId]: Array<Comment> }
  const [commentsState, setCommentsState] = useState({
    'comm_proj_1': [
      {
        id: 'c1',
        author: 'Marcus Vance',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVz8ccn75U6PEveqo2Gd6S-MC5oDR_F1Z_uvXiVjuderm9XVEYN5WJOX1Swa3MoJSmhp8M2rAa0_HfLwyDKkVtOFAbeEuJDN6yKKM2Yw5k6YFlO9AkUBNtc2Gm0XGVmnGHO8I09aegiFn8M83GDJlEVF5A9rxXnl3j_nPB_U3Fu_gnFNOBu_2hhAguZ9NVm4Fh0qWAzZKiw3qka8qBhRs2gjvBglccXSwYl-qVmhv7QPq4KydK109dyQ',
        text: 'The AST traversal performance is super snappy! Loved the PyTorch integration.',
        time: '1h ago'
      },
      {
        id: 'c2',
        author: 'Elena Rostova',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKKj6LVRj6za4b24SRqtjKKmW1JLRDJRyrWiHbxQZdg_ohwzJn-vZ29CTar7loXWqesAuTWKvPhwBtjqdW-zRp31xeHQcYqI90y6UaDDhD956vasWtK7NwGrrsR4mGYWfJoG6ar3kjZKjkF7aN89NBqeRMbxHhS5b9ARyvVau1ppYmfwQI4gFOLZVr5xsl62sMNPIPm9BYZmzG_zEow5ekx7pBHmu3CCJf3h0NGCyY9F9OSX_bbqKy-A',
        text: 'Great vulnerability ruleset for catching SQL injections and buffer misuse.',
        time: '3h ago'
      }
    ],
    'comm_proj_2': [
      {
        id: 'c3',
        author: 'Sophia Chen',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeN3wwzsfdCsKXyrCzamH7UFahjiEsN31mrLWG1dTJZdmoHpREvwUtzc4tXlXJvvZkiTKgnzU3pF6riYsq5MivKqaV7FOSlRalhtEQUPvFGe5L0xQ_iqOr2GQ3Pz5LLlZzjC1MBXQeW8LYjYcXWdLgoYanVyMrZj55berG-dYzEpklh-h-1msbQDrmiysCEy4htKIK8eDiNNtgrkzdHoQe5qGu7TPRJ6LijD9QoGtzJOWc9CIIRlbRoA',
        text: 'The Envoy sidecar auto-injection is brilliantly implemented! 🚀',
        time: '4h ago'
      }
    ],
    'comm_proj_3': [
      {
        id: 'c4',
        author: 'David Kim',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        text: 'eBPF in kernel space without context switching overhead is pure engineering beauty.',
        time: '1d ago'
      }
    ]
  });

  // Active expanded comments project ID
  const [activeCommentProjectId, setActiveCommentProjectId] = useState(null);
  const [commentInputText, setCommentInputText] = useState('');

  const categories = ['All', 'Web Dev', 'Data Science', 'Machine Learning', 'Computer Science', 'Systems'];

  // Combine curated community projects with any user-submitted projects
  const allDiscoverProjects = [
    ...COMMUNITY_PROJECTS,
    ...projects.filter(p => !COMMUNITY_PROJECTS.some(cp => cp.id === p.id))
  ];

  const filteredProjects = allDiscoverProjects.filter(p => {
    const matchCategory = activeCategory === 'All' ||
      (p.category && p.category.toLowerCase().includes(activeCategory.toLowerCase())) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(activeCategory.toLowerCase())));

    const matchSearch = !searchQuery ||
      (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.author && p.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchCategory && matchSearch;
  });

  // Like Action Handler
  const handleLike = (projectId, defaultLikes = 124) => {
    setLikesState(prev => {
      const current = prev[projectId] || { liked: false, count: defaultLikes };
      const newLiked = !current.liked;
      const newCount = newLiked ? current.count + 1 : current.count - 1;

      if (newLiked) {
        showToast("❤️ Project added to your liked projects!");
      } else {
        showToast("Removed like from project.");
      }

      return {
        ...prev,
        [projectId]: {
          liked: newLiked,
          count: newCount
        }
      };
    });
  };

  // Toggle Comment Section
  const toggleComments = (projectId) => {
    if (activeCommentProjectId === projectId) {
      setActiveCommentProjectId(null);
    } else {
      setActiveCommentProjectId(projectId);
      setCommentInputText('');
    }
  };

  // Add Comment Handler
  const handleAddComment = (e, projectId) => {
    e.preventDefault();
    if (!commentInputText.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      author: userProfile.name || 'Alex Rivera',
      avatar: userProfile.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBODQKML9QTCJYoZkx7q1l4hmZZjoUuKcRUiLQeXgTZup-R0Oh5yYulzUc5-5XS06ChjcpHA8SqM0lxiGKpxlH2U2zwkDv8_-GhQNOsgE6_O_z1FOnTg2hRfckqKeLz6c4NX1zhf5zdIFd9ACqR47xg8LP1Mbb52T15n3LJtX770FtO2mKmy9Gj1lsTxPdjJ1ZAx7wnkt5bwJkzLoTQIRhidZSi1LWLDbUhkaNXCfpx6Vfd7U3BWKk0IQ',
      text: commentInputText.trim(),
      time: 'Just now'
    };

    setCommentsState(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newComment]
    }));

    setCommentInputText('');
    showToast("💬 Comment posted successfully!");
  };

  // Share Action Handler
  const handleShare = async (project) => {
    const shareData = {
      title: project.title,
      text: `Check out ${project.title} on Skillify AI! ${project.description}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast("🚀 Shared successfully!");
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyShareLink(project);
        }
      }
    } else {
      copyShareLink(project);
    }
  };

  const copyShareLink = (project) => {
    try {
      navigator.clipboard.writeText(`${window.location.origin}/#project-${project.id}`);
      showToast("📋 Project link copied to clipboard!");
    } catch (e) {
      showToast("📋 Link ready to share!");
    }
  };

  return (
    <div className="w-full pb-24 transition-colors">
      <Navbar title="PROJECT" />

      <main className="px-4 py-4 space-y-4 w-full">

        {/* Header & Submit Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline text-lg font-extrabold text-on-surface dark:text-inverse-on-surface">
              Project
            </h1>
            <p className="text-xs text-secondary">
              Explore open-source student repositories & portfolio code
            </p>
          </div>
          <button
            onClick={() => navigate('submit-project')}
            className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary-container transition-all flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Submit</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, tags, or students..."
            className="w-full bg-white dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-2xl py-2.5 pl-10 pr-10 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#8E959E] outline-none focus:border-[#D71921] shadow-xs dark:shadow-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E959E] hover:text-slate-700 dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-transparent border border-[#D71921] text-[#D71921] font-bold'
                  : 'bg-white dark:bg-[#16181A] text-slate-600 dark:text-[#B0B4BA] border border-slate-200 dark:border-[#2C3036] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Internships Section (Nothing OS Card) */}
        <section className="bg-white dark:bg-[#14171A] rounded-3xl p-5 border border-slate-200 dark:border-[#24292F] shadow-card dark:shadow-none space-y-3.5">
          <div className="space-y-1">
            <h2 className="font-headline text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Internships
            </h2>
            <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] leading-relaxed">
              {isRecruiter
                ? 'Manage active listings and review student applications.'
                : 'Connect with top companies and kickstart your career with verified credentials.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 pt-0.5">
            {!isRecruiter && (
              <button
                onClick={() => navigate('find-internship')}
                className="flex items-center gap-1.5 bg-[#D71921] hover:bg-[#b0141b] text-white px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-none"
              >
                <span className="material-symbols-outlined text-base">search</span>
                <span>FIND INTERNSHIP</span>
              </button>
            )}
            {isRecruiter && (
              <button
                onClick={() => navigate('list-internship')}
                className="flex items-center gap-1.5 bg-[#D71921] hover:bg-[#b0141b] text-white px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer shadow-none"
              >
                <span className="material-symbols-outlined text-base">add_circle</span>
                <span>LIST INTERNSHIP</span>
              </button>
            )}
          </div>
        </section>

        {/* Projects Feed */}
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const likeInfo = likesState[project.id] || { liked: false, count: project.likes || 124 };
            const projectComments = commentsState[project.id] || [];
            const isCommentsOpen = activeCommentProjectId === project.id;

            return (
              <article
                key={project.id}
                className="bg-white dark:bg-[#14171A] rounded-3xl overflow-hidden shadow-card dark:shadow-none border border-slate-200 dark:border-[#24292F] hover:border-[#D71921] dark:hover:border-[#3A3A3A] transition-all"
              >
                {/* Image banner */}
                {project.image && (
                  <div className="relative h-36 w-full bg-slate-100 dark:bg-[#191D22] overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border border-white/10">
                      <span className={`material-symbols-outlined text-xs ${likeInfo.liked ? 'text-[#D71921]' : 'text-white'}`}>
                        favorite
                      </span>
                      <span>{likeInfo.count}</span>
                    </div>
                    <div className="absolute top-2.5 left-2.5 bg-[#D71921] text-white px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase">
                      {project.badge || "Public"}
                    </div>
                  </div>
                )}

                <div className="p-4 md:p-5 space-y-3">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {(project.tags || [project.language, project.category]).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-800 dark:text-[#D0D4DC] text-xs font-mono px-2.5 py-0.5 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div>
                    <h2 className="font-headline text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {project.title}
                    </h2>
                    <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  </div>

                  {/* Author & Star info */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#24292F] text-[11px] font-mono text-slate-500 dark:text-[#8E959E]">
                    <button
                      type="button"
                      onClick={() => openPublicProfile(project.authorUsername || project.author)}
                      className="font-medium truncate max-w-[200px] hover:text-[#D71921] transition-colors flex items-center gap-1.5 cursor-pointer text-left group"
                    >
                      {project.authorAvatar ? (
                        <img
                          src={project.authorAvatar}
                          alt={project.author}
                          className="w-4 h-4 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10"
                        />
                      ) : (
                        <span className="text-xs">👤</span>
                      )}
                      <span className="group-hover:underline font-bold text-slate-900 dark:text-white">{project.author || "Community Developer"}</span>
                      {project.authorCollege && (
                        <span className="text-[9px] text-slate-400 dark:text-[#666666] hidden xs:inline">• {project.authorCollege}</span>
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <span className="material-symbols-outlined text-xs">star</span>
                        {project.stars || 24}
                      </span>
                    </div>
                  </div>

                  {/* SOCIAL ACTIONS: Like, Comment, Share */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#24292F] text-xs font-mono">
                    {/* Like Button */}
                    <button
                      type="button"
                      onClick={() => handleLike(project.id, project.likes || 124)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer ${
                        likeInfo.liked
                          ? 'bg-[#D71921]/15 text-[#D71921]'
                          : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                      title={likeInfo.liked ? "Unlike" : "Like Project"}
                    >
                      <span
                        className={`material-symbols-outlined text-base transition-transform duration-200 ${
                          likeInfo.liked ? 'text-[#D71921] scale-110' : ''
                        }`}
                      >
                        favorite
                      </span>
                      <span>{likeInfo.count}</span>
                    </button>

                    {/* Comment Button */}
                    <button
                      type="button"
                      onClick={() => toggleComments(project.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer ${
                        isCommentsOpen
                          ? 'bg-[#D71921]/15 text-[#D71921]'
                          : 'text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                      title="View & Add Comments"
                    >
                      <span className="material-symbols-outlined text-base">
                        chat_bubble
                      </span>
                      <span>{projectComments.length}</span>
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={() => handleShare(project)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-95 cursor-pointer font-bold"
                      title="Share Project Link"
                    >
                      <span className="material-symbols-outlined text-base">
                        share
                      </span>
                      <span>Share</span>
                    </button>
                  </div>

                  {/* EXPANDABLE COMMENTS SECTION */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-slate-100 dark:border-[#24292F] space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-900 dark:text-white uppercase">
                        <span>Comments ({projectComments.length})</span>
                        <button
                          type="button"
                          onClick={() => setActiveCommentProjectId(null)}
                          className="text-slate-500 dark:text-[#8E959E] hover:text-slate-900 dark:hover:text-white text-[10px]"
                        >
                          Hide
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-2 max-h-44 overflow-y-auto hide-scrollbar">
                        {projectComments.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-start gap-2.5 text-xs bg-slate-50 dark:bg-[#191D22] p-2.5 rounded-2xl border border-slate-200 dark:border-[#2D333B]"
                          >
                            <img
                              src={c.avatar}
                              alt={c.author}
                              onClick={() => openPublicProfile(c.author)}
                              className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-slate-300 dark:border-white/10 cursor-pointer hover:scale-110 transition-transform"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <button
                                  type="button"
                                  onClick={() => openPublicProfile(c.author)}
                                  className="font-bold text-slate-900 dark:text-white text-[11px] truncate hover:text-[#D71921] transition-colors cursor-pointer text-left font-mono"
                                >
                                  {c.author}
                                </button>
                                <span className="text-[9px] font-mono text-slate-400 dark:text-[#666666] shrink-0">
                                  {c.time}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-[#A0A0A0] mt-0.5 font-mono leading-relaxed">
                                {c.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddComment(e, project.id);
                        }}
                        className="flex gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={commentInputText}
                          onChange={(e) => setCommentInputText(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-slate-50 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] rounded-xl py-2 px-3 text-xs font-mono outline-none focus:border-[#D71921] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#666666]"
                        />
                        <button
                          type="submit"
                          disabled={!commentInputText.trim()}
                          className="px-3.5 py-2 bg-[#D71921] disabled:opacity-40 text-white rounded-xl text-xs font-mono font-bold hover:bg-[#b0141b] transition-all flex items-center justify-center cursor-pointer shadow-none active:scale-95 shrink-0"
                        >
                          <span className="material-symbols-outlined text-sm">send</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Explore Repository Button */}
                  <button
                    onClick={() => openProjectRepo(project)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#24292F] dark:hover:bg-[#2C323A] border border-slate-200 dark:border-[#323842] text-slate-800 dark:text-white text-xs font-mono font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span className="material-symbols-outlined text-sm">code</span>
                    <span>EXPLORE REPOSITORY & CODE</span>
                  </button>
                </div>
              </article>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="text-center py-10 px-4 bg-white dark:bg-[#14171A] rounded-3xl border border-slate-200 dark:border-[#24292F] space-y-3 shadow-card dark:shadow-none">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#191D22] border border-slate-200 dark:border-[#2D333B] text-slate-900 dark:text-white flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-2xl">folder_open</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-headline text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {searchQuery || activeCategory !== 'All' ? 'No Matching Projects' : 'No Projects Uploaded Yet'}
                </h3>
                <p className="text-xs font-mono text-slate-600 dark:text-[#8E959E] max-w-xs mx-auto">
                  {searchQuery || activeCategory !== 'All'
                    ? `No projects found matching "${searchQuery || activeCategory}".`
                    : 'Be the first to submit a project and showcase your code to the community!'}
                </p>
              </div>
              {searchQuery || activeCategory !== 'All' ? (
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                  className="text-xs font-mono text-[#D71921] font-bold underline cursor-pointer"
                >
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={() => navigate('submit-project')}
                  className="px-4 py-2 bg-[#D71921] hover:bg-[#b0141b] text-white text-xs font-mono font-bold rounded-2xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-none active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">upload_file</span>
                  <span>UPLOAD YOUR PROJECT</span>
                </button>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
