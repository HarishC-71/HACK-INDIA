import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getJobs, createJob, deleteJob, getJobApplications, updateApplicationStatus,
  getRecruiterStats, getJobMatches, assignCandidate, getCandidates
} from '../services/api';
import {
  LogOut, Building2, Briefcase, BarChart3, Users, Plus, X, Trash2,
  CheckCircle, XCircle, Eye, Crown, Sparkles, UserPlus, Filter,
  Search, Star, Award, TrendingUp, ChevronDown, SlidersHorizontal,
  Clock, Code, FileText, Globe
} from 'lucide-react';

// ─── tiny helper ────────────────────────────────────────────
const ScoreBar = ({ value, color = '#6366f1' }) => (
  <div className="flex items-center gap-2 w-full">
    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
    </div>
    <span className="text-xs font-black text-slate-400 w-8 text-right">{value}</span>
  </div>
);

// ─── Component ───────────────────────────────────────────────
export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [jobs, setJobs]             = useState([]);
  const [stats, setStats]           = useState(null);
  const [toast, setToast]           = useState(null);

  // Job form
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    role: '', description: '', requiredSkills: '',
    experienceLevel: '0-1', salary: '', location: '', vacancyLimit: 5
  });

  // Applicants view
  const [selectedJob, setSelectedJob]       = useState(null);
  const [applicants, setApplicants]         = useState([]);
  const [matches, setMatches]               = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Candidate search (Talent Pool tab)
  const [candidates, setCandidates]         = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [filters, setFilters] = useState({
    minScore: '',
    maxScore: '',
    experience: '',
    skills: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [jobsRes, statsRes] = await Promise.all([getJobs(), getRecruiterStats()]);
      setJobs(jobsRes.data.filter(j => j.recruiterId === user.id));
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await createJob({
        ...jobForm,
        requiredSkills: jobForm.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        vacancyLimit:   parseInt(jobForm.vacancyLimit)
      });
      showToast('Job posted!');
      setShowJobForm(false);
      setJobForm({ role: '', description: '', requiredSkills: '', experienceLevel: '0-1', salary: '', location: '', vacancyLimit: 5 });
      loadData();
    } catch (err) { console.error('Post job error:', err); showToast('Failed to post job', 'error'); }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await deleteJob(jobId);
      showToast('Job deleted');
      loadData();
      if (selectedJob?.id === jobId) { setSelectedJob(null); setApplicants([]); }
    } catch (err) { console.error('Delete job error:', err); showToast('Failed to delete job', 'error'); }
  };

  const viewApplicants = async (job) => {
    setSelectedJob(job);
    setLoadingApplicants(true);
    setActiveTab('applicants');
    try {
      const [appsRes, matchesRes] = await Promise.all([
        getJobApplications(job.id), getJobMatches(job.id)
      ]);
      setApplicants(appsRes.data);
      setMatches(matchesRes.data);
    } catch (err) { console.error('Load applicants error:', err); showToast('Failed to load applicants', 'error'); }
    setLoadingApplicants(false);
  };

  const handleStatus = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      showToast(status === 'shortlisted' ? 'Candidate shortlisted!' : 'Candidate rejected');
      if (selectedJob) {
        const res = await getJobApplications(selectedJob.id);
        setApplicants(res.data);
      }
      loadData();
    } catch (err) { console.error('Update status error:', err); showToast('Failed to update status', 'error'); }
  };

  const handleAssign = async (studentId) => {
    if (!selectedJob) return;
    try {
      await assignCandidate(selectedJob.id, studentId);
      showToast('Candidate assigned!');
      const [appsRes, matchesRes] = await Promise.all([
        getJobApplications(selectedJob.id), getJobMatches(selectedJob.id)
      ]);
      setApplicants(appsRes.data);
      setMatches(matchesRes.data);
      loadData();
    } catch (err) { showToast(err.response?.data?.error || 'Failed to assign', 'error'); }
  };

  const loadCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const res = await getCandidates({
        minScore:   filters.minScore   || undefined,
        maxScore:   filters.maxScore   || undefined,
        experience: filters.experience || undefined,
        skills:     filters.skills     || undefined,
      });
      setCandidates(res.data);
    } catch (err) { console.error('Load candidates error:', err); showToast('Failed to load candidates', 'error'); }
    setLoadingCandidates(false);
  };

  useEffect(() => {
    if (activeTab === 'talent') loadCandidates();
  }, [activeTab]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard',   icon: BarChart3 },
    { id: 'jobs',      label: 'My Jobs',     icon: Briefcase },
    { id: 'applicants',label: 'Applicants',  icon: Users },
    { id: 'talent',    label: 'Talent Pool', icon: Search },
  ];

  // ─── RENDER ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex mesh-gradient text-slate-100 overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-80 min-h-screen sidebar-glass flex flex-col sticky top-0 shadow-2xl z-20">
        <div className="p-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white italic text-2xl shadow-xl shadow-indigo-600/30 ring-1 ring-white/10">P</div>
            <h1 className="text-3xl font-black tracking-tighter text-white">PLACEAI</h1>
          </div>
          <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] ml-1.5 opacity-80">Recruiter Portal</p>
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
              {tab.id === 'applicants' && selectedJob && (
                <span className="ml-auto text-xs bg-white text-indigo-600 px-3 py-1 rounded-full font-black border border-indigo-500">
                  {applicants.length}
                </span>
              )}
              {tab.id === 'talent' && (
                <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black tracking-widest">NEW</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto">
          <div className="glass-card p-6 premium-border bg-emerald-600/5 mb-8 shadow-inner">
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-[20px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25 shadow-lg">
                  <Building2 className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 border-[3px] border-[#020617]">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse m-1" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate leading-tight uppercase">{user?.name}</p>
                <p className="text-[10px] font-black text-slate-500 truncate uppercase mt-1.5 opacity-60">{user?.company}</p>
              </div>
            </div>
            <button onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-[18px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all text-xs font-black uppercase tracking-[0.15em]">
              <LogOut className="w-4 h-4" /> TERMINATE
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
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

        <div className="p-12 max-w-[1600px] mx-auto">

          {/* ══ DASHBOARD ════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <div className="mb-14 lg:flex items-end justify-between">
                <div>
                  <h2 className="text-6xl font-black text-white tracking-tight mb-4 uppercase">
                    Command <span className="gradient-text">Center</span>
                  </h2>
                  <p className="text-xl text-slate-400 font-medium italic opacity-80">AI-driven talent acquisition and deployment metrics.</p>
                </div>
                <button onClick={() => { setActiveTab('jobs'); setShowJobForm(true); }}
                  className="glow-btn px-12 py-5 text-sm font-black flex items-center gap-4 shadow-2xl group">
                  <Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                  <span>NEW PLACEMENT DRIVE</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
                {[
                  { label: 'ACTIVE DRIVES',    value: stats?.totalJobs         || 0, icon: Briefcase,    color: 'indigo' },
                  { label: 'TALENT POOL',      value: stats?.totalApplications  || 0, icon: Users,        color: 'blue' },
                  { label: 'SHORTLISTED',      value: stats?.shortlisted        || 0, icon: CheckCircle,  color: 'emerald' },
                  { label: 'EVALUATED',        value: (stats?.shortlisted||0) + (stats?.rejected||0), icon: BarChart3, color: 'purple' },
                  { label: 'PENDING',          value: stats?.pending            || 0, icon: Clock,        color: 'amber' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-8 premium-border group shadow-xl">
                    <div className="flex items-start justify-between mb-8">
                      <div className={`w-14 h-14 rounded-[20px] bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-${stat.color}-500/50 transition-all duration-500 shadow-inner group-hover:scale-110`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                      </div>
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">{stat.label}</div>
                    </div>
                    <span className="text-5xl font-black text-white tracking-tighter">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Live Jobs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
                <div className="lg:col-span-2 glass-card p-12 premium-border shadow-2xl">
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-5 uppercase">
                      <TrendingUp className="w-8 h-8 text-indigo-400" /> LIVE ANALYTICS
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {jobs.length === 0 ? (
                      <div className="py-24 text-center bg-slate-900/40 rounded-[32px] border border-slate-800">
                        <Users className="w-20 h-20 text-slate-800 mx-auto mb-6 opacity-30" />
                        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">No active job posts</p>
                      </div>
                    ) : (
                      jobs.slice(0, 3).map(job => (
                        <div key={job.id} className="p-8 rounded-[32px] bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 transition-all group">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-2xl font-black text-white uppercase group-hover:text-indigo-400 transition-colors">{job.role}</h4>
                              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1 opacity-60">
                                📍 {job.location} · 🎓 {job.experienceLevel}yr exp · {job.salary}
                              </p>
                            </div>
                            <span className={`px-5 py-2 rounded-full text-xs font-black uppercase ${job.status === 'open' ? 'badge-open' : 'badge-closed'}`}>
                              {job.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                                style={{ width: `${(job.applicationsCount / job.vacancyLimit) * 100}%` }} />
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase whitespace-nowrap">{job.applicationsCount}/{job.vacancyLimit}</span>
                          </div>
                          <div className="flex gap-4">
                            <button onClick={() => viewApplicants(job)}
                              className="flex-1 py-4 bg-indigo-600 text-white rounded-[18px] text-xs font-black tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20">
                              <Eye className="w-5 h-5" /> ANALYZE CANDIDATES
                            </button>
                            <button onClick={() => handleDeleteJob(job.id)}
                              className="w-14 h-14 bg-slate-900 border border-slate-800 text-slate-600 hover:text-red-400 hover:border-red-500/50 rounded-[18px] flex items-center justify-center transition-all">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="glass-card p-12 premium-border flex flex-col items-center justify-center text-center relative overflow-hidden bg-indigo-600/5 shadow-2xl">
                  <div className="w-24 h-24 rounded-[32px] bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 mb-10 shadow-xl">
                    <Sparkles className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tight leading-tight">Neural Ranking<br />Active</h3>
                  <p className="text-base text-slate-500 font-medium mb-12 opacity-80 leading-relaxed">
                    Deterministic AI scores – same resume always produces the same score. No randomness.
                  </p>
                  <div className="w-full space-y-4">
                    <div className="p-5 rounded-[24px] bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div className="text-left font-black">
                        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] mb-1">SCORING MODEL</p>
                        <p className="text-lg text-emerald-400">DETERMINISTIC</p>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-800" />
                      <div className="text-right font-black">
                        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] mb-1">WEIGHTS</p>
                        <p className="text-lg text-indigo-400">40/30/20/10</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ JOBS TAB ══════════════════════════════════════════ */}
          {activeTab === 'jobs' && (
            <div className="animate-fade-in max-w-6xl mx-auto pb-20">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h2 className="text-5xl font-black text-white tracking-tight uppercase leading-tight">Placement <span className="gradient-text">Deployments</span></h2>
                  <p className="text-xl text-slate-400 mt-2 font-medium opacity-80">Manage corporate talent acquisitions.</p>
                </div>
                <button onClick={() => setShowJobForm(!showJobForm)}
                  className="glow-btn px-10 py-5 text-sm flex items-center gap-4 shadow-2xl">
                  {showJobForm ? <><X className="w-5 h-5" /> CANCEL</> : <><Plus className="w-5 h-5" /> INITIALIZE DRIVE</>}
                </button>
              </div>

              {showJobForm && (
                <div className="glass-card p-12 mb-12 animate-fade-in shadow-2xl border border-white/5">
                  <h3 className="text-2xl font-black text-white mb-10 uppercase">New Job Drive</h3>
                  <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Job Role *</label>
                      <input required value={jobForm.role} onChange={e => setJobForm({ ...jobForm, role: e.target.value })}
                        className="w-full px-8 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-700 focus:border-indigo-500 shadow-inner"
                        placeholder="e.g. Full Stack Developer" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Location</label>
                      <input value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                        className="w-full px-8 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-700 focus:border-indigo-500 shadow-inner"
                        placeholder="e.g. Bangalore / Remote" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Description</label>
                      <textarea value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-8 py-5 bg-slate-900/50 border border-slate-800 rounded-[24px] text-white placeholder-slate-700 focus:border-indigo-500 resize-none shadow-inner"
                        placeholder="Role description..." />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Required Skills (CSV) *</label>
                      <input required value={jobForm.requiredSkills} onChange={e => setJobForm({ ...jobForm, requiredSkills: e.target.value })}
                        className="w-full px-8 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-700 focus:border-indigo-500 shadow-inner"
                        placeholder="React, Node.js, MongoDB..." />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Experience Level *</label>
                      <select value={jobForm.experienceLevel} onChange={e => setJobForm({ ...jobForm, experienceLevel: e.target.value })}
                        className="w-full px-8 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white focus:border-indigo-500 shadow-inner">
                        <option value="0-1">Fresher (0–1 years)</option>
                        <option value="1-3">Junior (1–3 years)</option>
                        <option value="3+">Senior (3+ years)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Salary</label>
                      <input value={jobForm.salary} onChange={e => setJobForm({ ...jobForm, salary: e.target.value })}
                        className="w-full px-8 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-700 focus:border-indigo-500 shadow-inner"
                        placeholder="e.g. ₹12-18 LPA" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Vacancies</label>
                      <input type="number" min={1} value={jobForm.vacancyLimit} onChange={e => setJobForm({ ...jobForm, vacancyLimit: e.target.value })}
                        className="w-full px-8 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white focus:border-indigo-500 shadow-inner" />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button type="submit" className="glow-btn px-14 py-5 text-sm font-black shadow-2xl">DEPLOY JOB</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {jobs.map(job => (
                  <div key={job.id} className="glass-card p-10 shadow-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-500">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[22px] bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl font-black text-emerald-400">
                          {job.role.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white uppercase leading-tight">{job.role}</h3>
                          <p className="text-sm text-slate-500 font-bold uppercase mt-1 opacity-60">📍 {job.location}</p>
                        </div>
                      </div>
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest uppercase ${job.status === 'open' ? 'badge-open' : 'badge-closed'}`}>
                        {job.status}
                      </span>
                    </div>

                    <p className="text-slate-400 mb-6 line-clamp-2 text-sm leading-relaxed">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(job.requiredSkills || []).map(s => (
                        <span key={s} className="px-3 py-1 bg-slate-800/80 rounded-xl text-xs font-black text-slate-300 border border-slate-700 uppercase">{s}</span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-black text-slate-500 uppercase mb-8 flex-wrap gap-y-2">
                      <span>🎓 {job.experienceLevel}yr exp</span>
                      <span>💰 {job.salary}</span>
                      <span>👥 {job.applicationsCount}/{job.vacancyLimit} filled</span>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => viewApplicants(job)}
                        className="flex-1 px-6 py-4 bg-indigo-500/10 border border-indigo-500/30 rounded-[18px] text-xs font-black text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> VIEW PIPELINE
                      </button>
                      <button onClick={() => handleDeleteJob(job.id)}
                        className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-[18px] text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ APPLICANTS TAB ════════════════════════════════════ */}
          {activeTab === 'applicants' && (
            <div className="animate-fade-in pb-20">
              {!selectedJob ? (
                <div className="glass-card p-32 text-center shadow-2xl border border-white/5">
                  <Users className="w-24 h-24 text-slate-800 mx-auto mb-10 opacity-30" />
                  <h3 className="text-4xl font-black text-white mb-8 uppercase">Select a Job First</h3>
                  <button onClick={() => setActiveTab('jobs')} className="glow-btn px-14 py-6 text-sm font-black">GO TO JOBS</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                  <div className="xl:col-span-3 space-y-8">
                    <div className="mb-10">
                      <h2 className="text-5xl font-black text-white tracking-tight uppercase leading-tight">
                        Pipeline <span className="gradient-text">Evaluation</span>
                      </h2>
                      <p className="text-slate-400 mt-2 font-medium">
                        {selectedJob.role} @ {selectedJob.company} — ranked by AI score
                      </p>
                    </div>

                    {loadingApplicants ? (
                      <div className="glass-card p-20 text-center">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest">Loading candidates...</p>
                      </div>
                    ) : applicants.length === 0 ? (
                      <div className="glass-card p-20 text-center border border-white/5">
                        <Users className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                        <p className="text-slate-500 font-black uppercase tracking-widest">No applicants yet</p>
                      </div>
                    ) : (
                      applicants.map((app, index) => {
                        const score    = app.scores?.finalScore || app.student?.scores?.finalScore || 0;
                        const jobMatch = app.jobMatchScore;
                        const isTop    = index === 0 && score > 0;
                        const isTopMatch = score >= 80;
                        const resumeScore  = app.scores?.resumeScore    || 0;
                        const githubScore  = app.scores?.githubScore    || 0;
                        const codingScore  = app.scores?.codingScore    || 0;
                        const portfolioScore = app.scores?.portfolioScore || 0;
                        const exp = app.experience || app.student?.experience || 0;

                        return (
                          <div key={app.id} className={`glass-card p-12 shadow-2xl border transition-all duration-500 hover:scale-[1.005] overflow-hidden ${isTop ? 'border-amber-500/30 bg-amber-500/5' : isTopMatch ? 'border-indigo-500/30 bg-indigo-600/5' : 'border-white/5'}`}>
                            <div className="flex flex-col xl:flex-row gap-10">
                              {/* Rank + Score */}
                              <div className="flex flex-col items-center gap-6 min-w-[100px]">
                                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl border ${
                                  isTop ? 'bg-amber-500 text-white border-white/20' :
                                  isTopMatch ? 'bg-indigo-600 text-white border-white/20' :
                                  'bg-slate-900 text-slate-700 border-slate-800'
                                }`}>
                                  {isTop ? <Crown className="w-10 h-10" /> : <span className="text-3xl font-black">{index + 1}</span>}
                                </div>
                                <div className="text-center">
                                  <div className="text-5xl font-black text-white tracking-tighter">{score}</div>
                                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">AI SCORE</div>
                                </div>
                                {jobMatch != null && (
                                  <div className="text-center">
                                    <div className={`text-2xl font-black ${jobMatch >= 80 ? 'text-emerald-400' : jobMatch >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{jobMatch}%</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">JOB MATCH</div>
                                  </div>
                                )}
                              </div>

                              {/* Main info */}
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-4 mb-3">
                                  <h3 className="text-3xl font-black text-white uppercase">{app.studentName || app.student?.name}</h3>
                                  {isTop && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1"><Crown className="w-3 h-3" /> TOP CANDIDATE</span>}
                                  {isTopMatch && !isTop && <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center gap-1"><Star className="w-3 h-3" /> TOP MATCH</span>}
                                  <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                    app.status === 'shortlisted' ? 'badge-shortlisted' :
                                    app.status === 'rejected'    ? 'badge-rejected' : 'bg-slate-800 text-slate-500'
                                  }`}>{app.status}</span>
                                </div>

                                <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-4 opacity-60">
                                  {app.studentEmail || app.student?.email} · 🎓 {exp} yr exp · Applied {new Date(app.appliedAt).toLocaleDateString()}
                                </p>

                                {/* Skill Match tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                  {(app.skills || app.student?.skills || []).slice(0, 12).map(s => {
                                    const req = (selectedJob.requiredSkills || []).map(r => r.toLowerCase());
                                    const matched = req.includes(s.toLowerCase());
                                    return (
                                      <span key={s} className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase border ${
                                        matched ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                                      }`}>
                                        {matched ? '✓ ' : ''}{s}
                                      </span>
                                    );
                                  })}
                                </div>

                                {/* Score breakdown bars */}
                                {score > 0 && (
                                  <div className="grid grid-cols-2 gap-3 mb-6">
                                    <ScoreBar value={resumeScore}    color="#6366f1" />
                                    <ScoreBar value={githubScore}    color="#8b5cf6" />
                                    <ScoreBar value={codingScore}    color="#10b981" />
                                    <ScoreBar value={portfolioScore} color="#3b82f6" />
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 flex-wrap">
                                  {app.status === 'applied' ? (
                                    <>
                                      <button onClick={() => handleStatus(app.id, 'shortlisted')}
                                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20">
                                        SHORTLIST
                                      </button>
                                      <button onClick={() => handleStatus(app.id, 'rejected')}
                                        className="px-8 py-4 bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/50 rounded-2xl text-xs font-black uppercase transition-all">
                                        REJECT
                                      </button>
                                    </>
                                  ) : (
                                    <div className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/5 ${
                                      app.status === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                    }`}>{app.status}</div>
                                  )}
                                  {app.student?.githubLink && (
                                    <a href={app.student.githubLink} target="_blank" rel="noreferrer"
                                      className="px-6 py-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all">
                                      <Code className="w-4 h-4" /> GITHUB
                                    </a>
                                  )}
                                  {app.student?.resumeUrl && (
                                    <a href={`http://localhost:5000${app.student.resumeUrl}`} target="_blank" rel="noreferrer"
                                      className="px-6 py-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all">
                                      <FileText className="w-4 h-4" /> VIEW RESUME
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* AI Suggestions Panel */}
                  <div className="xl:col-span-1">
                    <div className="glass-card p-8 shadow-2xl border border-white/5 bg-indigo-600/5 sticky top-12">
                      <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3 uppercase">
                        <Sparkles className="w-5 h-5 text-indigo-400" /> AI SUGGESTIONS
                      </h3>
                      <p className="text-xs text-slate-500 mb-6 font-medium">Students who haven't applied but match expereince &amp; skills.</p>
                      <div className="space-y-4">
                        {matches.length === 0 ? (
                          <p className="text-xs text-slate-600 font-black uppercase tracking-widest text-center py-8">No suggestions found</p>
                        ) : (
                          matches.map(m => (
                            <div key={m.id} className="p-5 rounded-[20px] bg-slate-900/60 border border-slate-800 group hover:border-indigo-500/30 transition-all">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-sm font-black text-white uppercase truncate w-28">{m.name}</p>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">🎓 {m.experience}yr exp</p>
                                </div>
                                <button onClick={() => handleAssign(m.id)}
                                  className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all hover:bg-indigo-500">
                                  <UserPlus className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full"
                                    style={{ width: `${m.matchScore}%`, background: m.matchScore >= 80 ? '#10b981' : m.matchScore >= 50 ? '#f59e0b' : '#ef4444' }} />
                                </div>
                                <span className={`text-[10px] font-black ${m.matchScore >= 80 ? 'text-emerald-400' : m.matchScore >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                  {m.matchScore}%
                                </span>
                              </div>
                              {m.expMatch && (
                                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">✓ Experience matches</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ TALENT POOL TAB ══════════════════════════════════ */}
          {activeTab === 'talent' && (
            <div className="animate-fade-in pb-20">
              <div className="mb-10">
                <h2 className="text-5xl font-black text-white tracking-tight uppercase leading-tight">
                  Talent <span className="gradient-text">Pool</span>
                </h2>
                <p className="text-xl text-slate-400 mt-2 font-medium">Search and filter all candidates by experience, skills, and AI score.</p>
              </div>

              {/* Filters Panel */}
              <div className="glass-card p-8 mb-10 shadow-2xl border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <SlidersHorizontal className="w-5 h-5 text-indigo-400" /> FILTER CANDIDATES
                  </h3>
                  <button onClick={() => setShowFilters(!showFilters)}
                    className="text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest flex items-center gap-2">
                    {showFilters ? 'HIDE' : 'SHOW'} FILTERS <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Min AI Score</label>
                      <input type="number" min={0} max={100} value={filters.minScore}
                        onChange={e => setFilters({ ...filters, minScore: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-white placeholder-slate-700 focus:border-indigo-500 text-sm"
                        placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Max AI Score</label>
                      <input type="number" min={0} max={100} value={filters.maxScore}
                        onChange={e => setFilters({ ...filters, maxScore: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-white placeholder-slate-700 focus:border-indigo-500 text-sm"
                        placeholder="100" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Experience Level</label>
                      <select value={filters.experience} onChange={e => setFilters({ ...filters, experience: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-white focus:border-indigo-500 text-sm">
                        <option value="">All Levels</option>
                        <option value="0-1">Fresher (0–1 yr)</option>
                        <option value="1-3">Junior (1–3 yr)</option>
                        <option value="3+">Senior (3+ yr)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Skills (comma separated)</label>
                      <input value={filters.skills} onChange={e => setFilters({ ...filters, skills: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-white placeholder-slate-700 focus:border-indigo-500 text-sm"
                        placeholder="React, Python..." />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button onClick={loadCandidates}
                    className="glow-btn px-10 py-4 text-sm font-black flex items-center gap-3">
                    <Filter className="w-4 h-4" /> APPLY FILTERS
                  </button>
                  <button onClick={() => { setFilters({ minScore: '', maxScore: '', experience: '', skills: '' }); setTimeout(loadCandidates, 50); }}
                    className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white text-sm font-black uppercase border border-slate-700 transition-all">
                    RESET
                  </button>
                </div>
              </div>

              {/* Candidate Table */}
              {loadingCandidates ? (
                <div className="glass-card p-20 text-center">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 font-black uppercase tracking-widest">Loading talent pool...</p>
                </div>
              ) : (
                <div className="glass-card overflow-hidden shadow-2xl border border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800/80">
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">RANK</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">CANDIDATE</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">EXPERIENCE</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">SKILLS</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">SCORE BREAKDOWN</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">AI SCORE</th>
                          <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map((c, i) => (
                          <tr key={c.id} className={`border-b border-slate-800/40 hover:bg-white/2 transition-all ${c.isTopMatch ? 'bg-indigo-600/5' : ''}`}>
                            <td className="px-8 py-6">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                                i === 0 ? 'bg-amber-500 text-white' :
                                i === 1 ? 'bg-slate-600 text-white' :
                                i === 2 ? 'bg-amber-700/60 text-amber-200' :
                                'bg-slate-900 text-slate-600 border border-slate-800'
                              }`}>
                                {i === 0 ? <Crown className="w-5 h-5" /> : c.rank}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-black text-white uppercase text-sm">{c.name}</p>
                                  <p className="text-xs text-slate-500 opacity-60 font-medium">{c.email}</p>
                                </div>
                                {c.isTopMatch && (
                                  <span className="px-2 py-1 rounded-full text-[8px] font-black uppercase bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5" /> TOP
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1.5 bg-slate-800 rounded-xl text-xs font-black text-slate-300 border border-slate-700 uppercase">
                                {c.experience === 0 ? 'Fresher' : `${c.experience} yr`}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                {(c.skills || []).slice(0, 4).map(s => (
                                  <span key={s} className="px-2 py-1 bg-slate-800/80 rounded-lg text-[10px] font-black text-slate-400 border border-slate-700 uppercase">{s}</span>
                                ))}
                                {(c.skills || []).length > 4 && (
                                  <span className="px-2 py-1 bg-slate-800/80 rounded-lg text-[10px] font-black text-slate-500 border border-slate-700">+{c.skills.length - 4}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6 min-w-[180px]">
                              {c.scores ? (
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-slate-600 w-16 uppercase">Resume</span>
                                    <ScoreBar value={c.scores.resumeScore} color="#6366f1" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-slate-600 w-16 uppercase">GitHub</span>
                                    <ScoreBar value={c.scores.githubScore} color="#8b5cf6" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-slate-600 w-16 uppercase">Coding</span>
                                    <ScoreBar value={c.scores.codingScore} color="#10b981" />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600 font-black uppercase">Not analyzed</span>
                              )}
                            </td>
                            <td className="px-8 py-6">
                              <span className={`text-4xl font-black tracking-tighter ${
                                c.score >= 80 ? 'text-emerald-400' :
                                c.score >= 60 ? 'text-indigo-400' :
                                c.score >= 40 ? 'text-amber-400' : 'text-slate-500'
                              }`}>
                                {c.score || '–'}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex gap-2">
                                {c.githubLink && (
                                  <a href={c.githubLink} target="_blank" rel="noreferrer"
                                    className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                                    title="GitHub">
                                    <Code className="w-4 h-4" />
                                  </a>
                                )}
                                {c.resumeUrl && (
                                  <a href={`http://localhost:5000${c.resumeUrl}`} target="_blank" rel="noreferrer"
                                    className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
                                    title="View Resume">
                                    <FileText className="px-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {candidates.length === 0 && (
                      <div className="py-20 text-center">
                        <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No candidates match your filters</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
