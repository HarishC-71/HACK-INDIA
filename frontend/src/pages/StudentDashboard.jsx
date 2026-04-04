import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getJobs, applyToJob, getMyApplications, analyzeProfile,
  updateProfile, getNotifications, uploadResumePDF
} from '../services/api';
import {
  LogOut, GraduationCap, Briefcase, BarChart3, Bell, User, Sparkles,
  Code, Globe, FileText, Plus, X, Send, CheckCircle, Clock, XCircle,
  ChevronRight, TrendingUp, Target, Zap, BookOpen, Upload, AlertCircle,
  Award, Star, Info, ChevronDown
} from 'lucide-react';

// ── helper ──────────────────────────────────────────────────
const ScoreBar = ({ score, color = '#6366f1', label }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-black text-white">{score}%</span>
    </div>
    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
      />
    </div>
  </div>
);

const Badge = ({ text, color = 'indigo' }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-${color}-500/30 bg-${color}-500/10 text-${color}-300`}>
    {text}
  </span>
);

// ── Component ────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [jobs, setJobs]               = useState([]);
  const [myApps, setMyApps]           = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analyzing, setAnalyzing]     = useState(false);
  const [toast, setToast]             = useState(null);

  // Profile form
  const [skills, setSkills]           = useState(user?.skills || []);
  const [newSkill, setNewSkill]       = useState('');
  const [githubLink, setGithubLink]   = useState(user?.githubLink || '');
  const [portfolioLink, setPortfolioLink] = useState(user?.portfolioLink || '');
  const [resume, setResume]           = useState(user?.resume || '');
  const [experience, setExperience]   = useState(user?.experience ?? 0);
  const [leetcode, setLeetcode]       = useState(user?.leetcodeStats || { solved: 0, easy: 0, medium: 0, hard: 0 });

  // Resume upload
  const fileInputRef                  = useRef(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [jobsRes, appsRes, notifsRes] = await Promise.all([
        getJobs(), getMyApplications(), getNotifications()
      ]);
      setJobs(jobsRes.data);
      setMyApps(appsRes.data);
      setNotifications(notifsRes.data);
    } catch (err) { console.error(err); }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = async () => {
    try {
      const res = await updateProfile({ skills, githubLink, portfolioLink, resume, leetcodeStats: leetcode, experience });
      updateUser(res.data);
      showToast('Profile updated successfully!');
    } catch (err) { console.error('Save profile error:', err); showToast('Failed to update profile', 'error'); }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await handleSaveProfile();
      const res = await analyzeProfile();
      if (res.data.user) updateUser(res.data.user);
      showToast('AI analysis complete! Check your scores.');
      setActiveTab('scores');
    } catch (err) { console.error('Analysis error:', err); showToast('Analysis failed — check console', 'error'); }
    setAnalyzing(false);
  };

  const handleApply = async (jobId) => {
    try {
      await applyToJob(jobId);
      showToast('Application submitted!');
      loadData();
    } catch (err) { showToast(err.response?.data?.error || 'Failed to apply', 'error'); }
  };

  // PDF upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { showToast('Please upload a PDF file', 'error'); return; }
    setUploading(true);
    try {
      const res = await uploadResumePDF(file);
      const { analysis, resumeText } = res.data;
      if (resumeText) setResume(resumeText);
      setUploadResult(analysis);
      if (res.data.user) updateUser(res.data.user);
      showToast('Resume uploaded and parsed!');
    } catch (err) {
      console.error(err);
      showToast('Upload failed – try pasting text manually', 'error');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  const removeSkill = (s) => setSkills(skills.filter(sk => sk !== s));

  const appliedJobIds = myApps.map(a => a.jobId);
  const scores        = user?.scores;

  const tabs = [
    { id: 'dashboard',    label: 'Dashboard',    icon: BarChart3 },
    { id: 'profile',      label: 'Profile',      icon: User },
    { id: 'resume',       label: 'Resume AI',    icon: FileText },
    { id: 'scores',       label: 'AI Scores',    icon: Sparkles },
    { id: 'jobs',         label: 'Jobs',         icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: Send },
  ];

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex mesh-gradient overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-80 min-h-screen sidebar-glass flex flex-col sticky top-0 shadow-2xl z-20">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white italic text-2xl shadow-xl shadow-indigo-600/30 ring-1 ring-white/10">P</div>
            <h1 className="text-3xl font-black tracking-tighter text-white">PLACEAI</h1>
          </div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] ml-1.5 opacity-80">Student Intelligence</p>
        </div>

        <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[22px] text-sm font-black tracking-wide transition-all duration-300 group ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 ring-1 ring-white/10'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
              }`}>
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'group-hover:text-indigo-400 transition-colors'}`} />
              {tab.label.toUpperCase()}
              {tab.id === 'resume' && (
                <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-black tracking-widest">
                  NEW
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto">
          <div className="glass-card p-6 premium-border bg-indigo-600/5 mb-8 shadow-inner">
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-[20px] bg-indigo-500/15 flex items-center justify-center border border-indigo-500/25 shadow-lg">
                  <GraduationCap className="w-7 h-7 text-indigo-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-[#020617] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate leading-tight uppercase">{user?.name}</p>
                <p className="text-[10px] font-black text-slate-500 truncate uppercase tracking-[0.1em] mt-1.5 opacity-60">{user?.email?.split('@')[0]}</p>
                {scores?.finalScore > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${scores.finalScore}%` }} />
                    </div>
                    <span className="text-[9px] font-black text-indigo-400">{scores.finalScore}</span>
                  </div>
                )}
              </div>
            </div>
            <button onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-[18px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all text-xs font-black uppercase tracking-[0.15em]">
              <LogOut className="w-4 h-4" /> TERMINATE
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto relative">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-8 right-8 z-50 px-8 py-4 rounded-2xl flex items-center gap-3 text-sm font-black shadow-2xl animate-fade-in ${
            toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'
          }`}>
            {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            {toast.message}
          </div>
        )}

        <div className="p-12 max-w-[1400px] mx-auto">

          {/* ══ DASHBOARD TAB ══════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <div className="mb-14 lg:flex items-end justify-between">
                <div>
                  <h2 className="text-6xl font-black text-white tracking-tight mb-4">
                    Core <span className="gradient-text">Intelligence</span> 👋
                  </h2>
                  <p className="text-xl text-slate-400 font-medium">Your AI-driven placement ecosystem is active.</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
                  { label: 'AI Score',      value: scores?.finalScore || '–',  icon: Zap,       color: 'indigo',  sub: 'Final Intelligence Index' },
                  { label: 'Applications',  value: myApps.length,              icon: Send,      color: 'emerald', sub: 'Active pipelines' },
                  { label: 'LeetCode',      value: leetcode?.solved || 0,      icon: Code,      color: 'blue',    sub: 'Problems solved' },
                  { label: 'Open Jobs',     value: jobs.filter(j => j.status === 'open').length, icon: Globe, color: 'purple', sub: 'Available positions' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-8 premium-border group shadow-xl">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-[20px] bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-${stat.color}-500/50 transition-all duration-500 shadow-inner group-hover:scale-110`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                      </div>
                      <div className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] mt-1.5">{stat.label}</div>
                    </div>
                    <span className="text-5xl font-black text-white tracking-tighter">{stat.value}</span>
                    <p className="text-xs text-slate-500 font-black mt-3 uppercase tracking-widest opacity-60">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* CTA + Recent Jobs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 glass-card p-14 premium-border relative overflow-hidden group shadow-2xl">
                  <div className="absolute -top-10 -right-10 p-12 opacity-5 group-hover:opacity-10 transition-all duration-700">
                    <Sparkles className="w-64 h-64 text-indigo-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-black uppercase tracking-[0.25em] text-indigo-300">Neural Engine Active</span>
                    </div>
                    <h3 className="text-5xl font-black text-white mb-6 leading-[1.1]">
                      Upload Your Resume,<br />Get Instant AI Analysis.
                    </h3>
                    <p className="text-xl text-slate-400 mb-12 leading-relaxed font-medium">
                      Our AI extracts your skills, calculates a match score against job requirements, and identifies gaps.
                    </p>
                    <div className="flex gap-4 flex-wrap">
                      <button onClick={() => setActiveTab('resume')} className="glow-btn px-10 py-5 text-sm font-black tracking-[0.2em] flex items-center gap-4 shadow-2xl">
                        <Upload className="w-5 h-5" /> UPLOAD RESUME
                      </button>
                      <button onClick={() => setActiveTab('profile')} className="px-10 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white text-sm font-black uppercase tracking-widest transition-all border border-slate-700">
                        UPDATE PROFILE
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-10 premium-border flex flex-col shadow-2xl">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-4">
                      <Briefcase className="w-6 h-6 text-emerald-400" /> TOP MATCHES
                    </h3>
                  </div>
                  <div className="space-y-5 flex-1">
                    {jobs.filter(j => j.status === 'open').slice(0, 5).map(job => (
                      <div key={job.id} onClick={() => setActiveTab('jobs')}
                        className="flex items-center justify-between p-5 rounded-[24px] bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all cursor-pointer group">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-indigo-400 text-lg">
                            {job.company.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase">{job.role}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-60">{job.company}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ RESUME AI TAB ══════════════════════════════════ */}
          {activeTab === 'resume' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
              <div className="mb-12">
                <h2 className="text-5xl font-black text-white tracking-tight">
                  Resume <span className="gradient-text">AI Analysis</span>
                </h2>
                <p className="text-xl text-slate-400 mt-2 font-medium">Upload your PDF or paste text to get instant skill detection &amp; match score.</p>
              </div>

              {/* Upload Zone */}
              <div className="glass-card p-10 mb-8 shadow-2xl">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <Upload className="w-5 h-5 text-indigo-400" /> UPLOAD PDF RESUME
                </h3>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-[28px] p-16 text-center cursor-pointer transition-all group bg-slate-900/20 hover:bg-indigo-500/5"
                >
                  <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={handleFileUpload} />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="spinner w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Parsing PDF...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-[24px] bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-10 h-10 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-white font-black text-lg mb-2">Drop your PDF here or click to browse</p>
                        <p className="text-slate-500 text-sm font-medium">Supports PDF files up to 5MB</p>
                      </div>
                      <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
                        CHOOSE FILE
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Results */}
              {uploadResult && (
                <div className="glass-card p-10 mb-8 shadow-2xl animate-fade-in border border-indigo-500/20">
                  <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-400" /> ANALYSIS RESULTS
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900/60 rounded-[24px] p-6 border border-slate-800 text-center">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Resume Score</p>
                      <p className="text-5xl font-black text-indigo-400">{uploadResult.resumeScore}</p>
                      <p className="text-xs text-slate-600 mt-1">/ 100</p>
                    </div>
                    <div className="bg-slate-900/60 rounded-[24px] p-6 border border-slate-800 text-center">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Skills Found</p>
                      <p className="text-5xl font-black text-emerald-400">{uploadResult.matchedSkills?.length || 0}</p>
                      <p className="text-xs text-slate-600 mt-1">recognized</p>
                    </div>
                    <div className="bg-slate-900/60 rounded-[24px] p-6 border border-slate-800 text-center">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Word Count</p>
                      <p className="text-5xl font-black text-blue-400">{uploadResult.wordCount || 0}</p>
                      <p className="text-xs text-slate-600 mt-1">words</p>
                    </div>
                  </div>

                  {/* Detected Skills */}
                  {uploadResult.matchedSkills?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> DETECTED SKILLS
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {uploadResult.matchedSkills.map(s => (
                          <span key={s} className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-black text-emerald-300 uppercase tracking-tight">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {uploadResult.missingSkills?.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400" /> MISSING SKILLS (POPULAR)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {uploadResult.missingSkills.map(s => (
                          <span key={s} className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-black text-amber-300 uppercase tracking-tight">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <button onClick={handleAnalyze} disabled={analyzing}
                      className="glow-btn px-10 py-4 text-sm font-black flex items-center gap-3 disabled:opacity-50">
                      {analyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {analyzing ? 'COMPUTING FULL SCORE...' : 'RUN FULL AI ANALYSIS'}
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Text Entry */}
              <div className="glass-card p-10 shadow-2xl">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" /> OR PASTE RESUME TEXT MANUALLY
                </h3>
                <textarea
                  value={resume}
                  onChange={e => setResume(e.target.value)}
                  rows={10}
                  className="w-full px-8 py-6 bg-slate-800/40 border border-slate-700/50 rounded-[28px] text-white placeholder-slate-600 focus:border-indigo-500 text-base shadow-inner leading-relaxed resize-none"
                  placeholder="Paste your resume or professional summary here for deep semantic analysis..."
                />
                <div className="flex gap-4 mt-6">
                  <button onClick={handleSaveProfile}
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white text-sm font-black uppercase tracking-widest transition-all border border-slate-700">
                    SAVE TEXT
                  </button>
                  <button onClick={handleAnalyze} disabled={analyzing}
                    className="glow-btn px-10 py-4 text-sm font-black flex items-center gap-3 disabled:opacity-50">
                    {analyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {analyzing ? 'ANALYZING...' : 'ANALYZE'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ PROFILE TAB ════════════════════════════════════ */}
          {activeTab === 'profile' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h2 className="text-5xl font-black text-white tracking-tight">Identity <span className="gradient-text">Matrix</span></h2>
                  <p className="text-xl text-slate-400 mt-2 font-medium">Configure your professional parameters for AI mapping.</p>
                </div>
                <button onClick={handleAnalyze} disabled={analyzing}
                  className="glow-btn px-10 py-5 text-sm flex items-center gap-4 disabled:opacity-50">
                  {analyzing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  <span>{analyzing ? 'ANALYZING...' : 'RUN ANALYTICS'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-10">
                {/* Skills */}
                <div className="glass-card p-10 shadow-2xl">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-yellow-400" /> SKILL PARAMETERS
                  </h3>
                  <div className="flex gap-3 mb-6">
                    <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-6 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white placeholder-slate-600 focus:border-indigo-500 text-base shadow-inner"
                      placeholder="Add skill and press Enter..." />
                    <button onClick={addSkill} className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-[14px] text-xs font-black text-indigo-300 uppercase">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="text-indigo-400 hover:text-red-400 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* LeetCode */}
                  <div className="glass-card p-10 shadow-2xl">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                      <Code className="w-5 h-5 text-emerald-400" /> LEETCODE STATS
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'solved', label: 'TOTAL',  color: 'text-white' },
                        { key: 'easy',   label: 'EASY',   color: 'text-emerald-400' },
                        { key: 'medium', label: 'MEDIUM', color: 'text-yellow-400' },
                        { key: 'hard',   label: 'HARD',   color: 'text-red-400' },
                      ].map(item => (
                        <div key={item.key}>
                          <label className={`block text-[10px] font-black ${item.color} mb-2 uppercase tracking-widest opacity-70`}>{item.label}</label>
                          <input type="number" value={leetcode[item.key]}
                            onChange={e => setLeetcode({ ...leetcode, [item.key]: parseInt(e.target.value) || 0 })}
                            className="w-full px-5 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white text-base font-black focus:border-indigo-500 shadow-inner" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Links + Experience */}
                  <div className="glass-card p-10 shadow-2xl">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-400" /> LINKS & EXPERIENCE
                    </h3>
                    <div className="space-y-4">
                      <input value={githubLink} onChange={e => setGithubLink(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white placeholder-slate-600 focus:border-indigo-500 text-sm shadow-inner"
                        placeholder="GitHub URL (e.g. https://github.com/username)" />
                      <input value={portfolioLink} onChange={e => setPortfolioLink(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white placeholder-slate-600 focus:border-indigo-500 text-sm shadow-inner"
                        placeholder="Portfolio URL" />
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Experience (Years)</label>
                        <input type="number" min={0} max={30} value={experience} onChange={e => setExperience(Number(e.target.value))}
                          className="w-full px-6 py-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-white text-base font-black focus:border-indigo-500 shadow-inner" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-5">
                  <button onClick={handleSaveProfile}
                    className="px-10 py-5 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white text-sm font-black uppercase tracking-widest transition-all shadow-xl border border-slate-700">
                    SAVE PROFILE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ SCORES TAB ═════════════════════════════════════ */}
          {activeTab === 'scores' && (
            <div className="animate-fade-in max-w-5xl mx-auto pb-20">
              <div className="mb-14">
                <h2 className="text-6xl font-black text-white tracking-tight uppercase">
                  AI <span className="gradient-text">Intelligence Report</span>
                </h2>
                <p className="text-lg text-slate-400 mt-2">Deterministic scoring – same input always produces the same output.</p>
              </div>

              {!scores ? (
                <div className="glass-card p-24 text-center shadow-2xl border border-white/5">
                  <Sparkles className="w-20 h-20 text-indigo-400/30 mx-auto mb-10" />
                  <h3 className="text-4xl font-black text-white mb-6 uppercase">No Analysis Yet</h3>
                  <p className="text-slate-400 mb-10">Upload your resume or update your profile, then run the AI analysis.</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setActiveTab('resume')} className="glow-btn px-12 py-5 text-sm font-black">UPLOAD RESUME</button>
                    <button onClick={() => setActiveTab('profile')} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-white text-sm font-black uppercase border border-slate-700">UPDATE PROFILE</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Main Score Gauge */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="glass-card p-14 flex flex-col items-center justify-center text-center relative overflow-hidden bg-indigo-600/5 shadow-2xl">
                      <div className="relative mb-8">
                        <svg className="w-56 h-56 transform -rotate-90">
                          <circle cx="112" cy="112" r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
                          <circle cx="112" cy="112" r="100" fill="none"
                            stroke={scores.finalScore >= 70 ? '#10b981' : scores.finalScore >= 40 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="14" strokeLinecap="round"
                            strokeDasharray="628"
                            strokeDashoffset={628 - (628 * scores.finalScore / 100)}
                            className="transition-all duration-[2500ms] ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-7xl font-black text-white tracking-tighter">{scores.finalScore}</span>
                          <span className="text-xs font-black text-slate-500 mt-2 uppercase tracking-[0.3em]">FINAL SCORE</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {scores.finalScore >= 80
                          ? <><Award className="w-6 h-6 text-amber-400" /><span className="text-2xl font-black text-amber-400">ELITE MATCH</span></>
                          : scores.finalScore >= 60
                          ? <><Star className="w-6 h-6 text-indigo-400" /><span className="text-2xl font-black text-indigo-400">STRONG</span></>
                          : <><TrendingUp className="w-6 h-6 text-slate-400" /><span className="text-2xl font-black text-slate-400">DEVELOPING</span></>
                        }
                      </div>
                      <div className="mt-6 text-xs text-slate-500 font-medium">
                        40% Resume · 30% GitHub · 20% Coding · 10% Portfolio
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: 'RESUME SCORE',     score: scores.resumeScore,    icon: FileText, color: '#6366f1', weight: '40%', desc: 'Skills depth & experience' },
                        { label: 'GITHUB SCORE',     score: scores.githubScore,    icon: Code,     color: '#8b5cf6', weight: '30%', desc: 'Code presence & activity' },
                        { label: 'CODING SCORE',     score: scores.codingScore,    icon: Code,     color: '#10b981', weight: '20%', desc: 'LeetCode problem solving' },
                        { label: 'PORTFOLIO SCORE',  score: scores.portfolioScore, icon: Globe,    color: '#3b82f6', weight: '10%', desc: 'Project showcase quality' },
                      ].map((item, i) => (
                        <div key={i} className="glass-card p-8 shadow-xl border border-white/5 hover:border-indigo-500/20 transition-all">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                <item.icon className="w-5 h-5" style={{ color: item.color }} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-white uppercase tracking-widest">{item.label}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-slate-600 uppercase">{item.weight}</span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-black text-white tracking-tighter">{item.score}</span>
                            <span className="text-xs font-black text-slate-600">/ 100</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                            <div className="h-full rounded-full transition-all duration-1500 delay-300"
                              style={{ width: `${item.score}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}80)` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {scores.matchedSkills?.length > 0 && (
                      <div className="glass-card p-10 shadow-xl border border-white/5">
                        <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-400" /> DETECTED SKILLS ({scores.matchedSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {scores.matchedSkills.map(s => (
                            <span key={s} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-black text-emerald-300 uppercase">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {scores.missingSkills?.length > 0 && (
                      <div className="glass-card p-10 shadow-xl border border-white/5">
                        <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <AlertCircle className="w-4 h-4 text-amber-400" /> SKILL GAPS TO FILL
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {scores.missingSkills.map(s => (
                            <span key={s} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-black text-amber-300 uppercase">
                              {s}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Learning these in-demand skills will significantly boost your match rate.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ JOBS TAB ═══════════════════════════════════════ */}
          {activeTab === 'jobs' && (
            <div className="animate-fade-in max-w-6xl mx-auto pb-20">
              <div className="mb-14">
                <h2 className="text-5xl font-black text-white tracking-tight uppercase leading-tight">
                  Verified <span className="gradient-text">Openings</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {jobs.map(job => {
                  const hasApplied = appliedJobIds.includes(job.id);
                  const isClosed   = job.status === 'closed' || job.applicationsCount >= job.vacancyLimit;

                  // compute skill match %
                  const mySkillsLower = skills.map(s => s.toLowerCase());
                  const reqLower      = (job.requiredSkills || []).map(s => s.toLowerCase());
                  const matchCount    = reqLower.filter(r => mySkillsLower.includes(r)).length;
                  const matchPct      = reqLower.length > 0 ? Math.round((matchCount / reqLower.length) * 100) : 0;
                  const isTopMatch    = matchPct >= 80;

                  return (
                    <div key={job.id} className={`glass-card p-10 flex flex-col shadow-2xl transition-all duration-500 border ${isTopMatch ? 'border-indigo-500/40 bg-indigo-600/5' : 'border-white/5 hover:border-indigo-500/20'} hover:scale-[1.01]`}>
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-[22px] bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl font-black text-indigo-400">
                            {job.company.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase leading-tight">{job.role}</h3>
                            <p className="text-base text-indigo-400 font-black uppercase tracking-[0.1em] mt-1 opacity-70">{job.company}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase ${isClosed ? 'badge-closed' : 'badge-open'}`}>
                            {isClosed ? 'CLOSED' : 'ACTIVE'}
                          </span>
                          {isTopMatch && !isClosed && (
                            <span className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                              <Star className="w-3 h-3" /> TOP MATCH
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-base text-slate-400 mb-6 line-clamp-2 leading-relaxed font-medium">{job.description}</p>

                      {/* Match Score Bar */}
                      {reqLower.length > 0 && (
                        <div className="mb-6">
                          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-1.5">
                            <span>SKILL MATCH</span>
                            <span className={matchPct >= 80 ? 'text-emerald-400' : matchPct >= 50 ? 'text-amber-400' : 'text-red-400'}>
                              {matchPct}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${matchPct}%`, background: matchPct >= 80 ? '#10b981' : matchPct >= 50 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-900/50 p-3 rounded-[16px] border border-slate-800 text-center">
                          <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Location</span>
                          <span className="text-xs font-black text-white">📍 {job.location}</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-[16px] border border-slate-800 text-center">
                          <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Salary</span>
                          <span className="text-xs font-black text-white">💰 {job.salary}</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded-[16px] border border-slate-800 text-center">
                          <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Exp</span>
                          <span className="text-xs font-black text-white">🎓 {job.experienceLevel}yr</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {(job.requiredSkills || []).map(s => {
                          const matched = mySkillsLower.includes(s.toLowerCase());
                          return (
                            <span key={s} className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight border ${
                              matched ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-800/80 border-slate-700 text-slate-400'
                            }`}>
                              {matched ? '✓ ' : ''}{s}
                            </span>
                          );
                        })}
                      </div>

                      <div className="mt-auto">
                        <button onClick={() => !hasApplied && !isClosed && handleApply(job.id)} disabled={hasApplied || isClosed}
                          className={`w-full py-5 rounded-[22px] text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl transition-all ${
                            hasApplied ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                            isClosed   ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'glow-btn'
                          }`}>
                          {hasApplied ? <><CheckCircle className="w-5 h-5" /> APPLIED</> :
                           isClosed   ? 'CLOSED' :
                           <><Send className="w-5 h-5" /> APPLY NOW</>}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ APPLICATIONS TAB ══════════════════════════════ */}
          {activeTab === 'applications' && (
            <div className="animate-fade-in max-w-6xl mx-auto pb-20">
              <div className="mb-14">
                <h2 className="text-5xl font-black text-white tracking-tight uppercase">
                  Active <span className="gradient-text">Pipelines</span>
                </h2>
              </div>
              <div className="glass-card overflow-hidden shadow-2xl border border-white/5">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ROLE</th>
                      <th>COMPANY</th>
                      <th>STATUS</th>
                      <th>MATCH %</th>
                      <th>AI SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApps.map(app => (
                      <tr key={app.id}>
                        <td className="font-black text-white uppercase">{app.job?.role || '—'}</td>
                        <td className="text-slate-300 font-bold uppercase opacity-60">{app.job?.company || '—'}</td>
                        <td>
                          <span className={`px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase badge-${app.status}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          {app.jobMatchScore != null ? (
                            <span className={`font-black text-lg ${app.jobMatchScore >= 80 ? 'text-emerald-400' : app.jobMatchScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                              {app.jobMatchScore}%
                            </span>
                          ) : '—'}
                        </td>
                        <td className="font-black text-indigo-400 text-2xl">{app.scores?.finalScore || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {myApps.length === 0 && (
                  <div className="py-20 text-center">
                    <Send className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest">No applications yet – explore open jobs!</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
