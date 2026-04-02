import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, GraduationCap, Building2, Eye, EyeOff, ArrowRight, Zap, ShieldCheck, Globe, Trophy } from 'lucide-react';

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await signup({ ...form, role });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const demoLogin = async (email) => {
    setLoading(true);
    try {
      await login(email, 'password123');
    } catch (err) {
      setError('Demo login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex mesh-gradient selection:bg-indigo-500/30">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden flex-col justify-center px-24">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[5%] right-[5%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[160px]" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-10 animate-fade-in shadow-xl shadow-indigo-500/5">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Next-Gen Placement Intelligence</span>
          </div>
          
          <h1 className="text-8xl font-black text-white mb-8 leading-[1.05] tracking-tight animate-fade-in">
            Bridge the Gap<br />
            <span className="gradient-text">Between Talent & Opportunity.</span>
          </h1>
          
          <p className="text-2xl text-slate-400 mb-16 max-w-2xl leading-relaxed animate-fade-in font-medium" style={{ animationDelay: '0.1s' }}>
            Empowering students and recruiters with AI-driven insights, automated technical ranking, and a seamless placement ecosystem.
          </p>

          <div className="grid grid-cols-2 gap-8 max-w-2xl mb-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: Sparkles, label: 'AI Profiles', desc: 'Gen-AI driven resume analysis' },
              { icon: ShieldCheck, label: 'Verified Skills', desc: 'Automated technical ranking' },
              { icon: Globe, label: 'Nationwide', desc: 'Connect with top-tier companies' },
              { icon: Trophy, label: 'Leaderboard', desc: 'Rank against the best candidates' }
            ].map((feature, i) => (
              <div key={i} className="flex gap-6 p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/20 transition-all group cursor-default shadow-lg">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform shadow-inner">
                  <feature.icon className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1.5">{feature.label}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Floating Logo Branding */}
        <div className="absolute bottom-16 left-24 flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity duration-500">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white italic text-xl shadow-lg shadow-indigo-600/30">P</div>
          <span className="text-2xl font-black tracking-tighter text-white">PLACEAI <span className="text-indigo-500 text-sm tracking-[0.2em] font-bold ml-2">CORE</span></span>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-[500px] z-10 px-4">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white italic text-2xl shadow-lg shadow-indigo-600/20">P</div>
              <span className="text-3xl font-black tracking-tighter text-white">PLACEAI</span>
            </div>
          </div>

          <div className="glass-card premium-border p-12 animate-slide-right shadow-2xl">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-black text-white mb-3 font-outfit tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-base font-medium">
                {isLogin ? 'Your intelligence-driven career starts here.' : 'Join the elite community of emerging talent.'}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-4 animate-fade-in shadow-inner">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="flex p-1.5 bg-slate-900 border border-slate-800 rounded-[22px] mb-10 shadow-inner">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-[18px] text-xs font-black tracking-[0.15em] transition-all duration-300 ${
                    role === 'student'
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/10'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  STUDENT
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-[18px] text-xs font-black tracking-[0.15em] transition-all duration-300 ${
                    role === 'recruiter'
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-white/10'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  RECRUITER
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-6 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:border-indigo-500 text-base shadow-sm"
                    placeholder="Jane Cooper"
                  />
                </div>
              )}

              {!isLogin && role === 'recruiter' && (
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1.5">Company Entity</label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={e => setForm({...form, company: e.target.value})}
                    className="w-full px-6 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:border-indigo-500 text-base shadow-sm"
                    placeholder="Enter company name"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1.5">Work Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-6 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:border-indigo-500 text-base shadow-sm"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1.5">Security Token</label>
                  {isLogin && <button type="button" className="text-xs font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Forgot?</button>}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    className="w-full px-6 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder-slate-600 focus:border-indigo-500 text-base pr-14 shadow-sm"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400 transition-colors bg-slate-900/50 p-1.5 rounded-lg border border-white/5">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="glow-btn w-full py-5 text-base font-black flex items-center justify-center gap-3 disabled:opacity-50 mt-6 group shadow-2xl"
              >
                {loading ? <div className="spinner" /> : (
                  <>
                    <span>{isLogin ? 'INITIALIZE DASHBOARD' : 'START RECRUITING'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center pt-10 border-t border-slate-800/60 relative">
              <p className="text-xs text-slate-500 mb-8 font-black uppercase tracking-[0.25em]">Reviewer Quick Pass</p>
              <div className="flex gap-4">
                <button onClick={() => demoLogin('rahul@student.com')}
                  className="flex-1 flex flex-col items-center gap-2.5 p-5 rounded-[24px] bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all group shadow-sm">
                  <div className="p-2.5 bg-slate-800 rounded-xl group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all">
                    <GraduationCap className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-200 uppercase tracking-widest leading-none">STUDENT</span>
                </button>
                <button onClick={() => demoLogin('hr@techcorp.com')}
                  className="flex-1 flex flex-col items-center gap-2.5 p-5 rounded-[24px] bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all group shadow-sm">
                  <div className="p-2.5 bg-slate-800 rounded-xl group-hover:bg-emerald-500/10 group-hover:scale-110 transition-all">
                    <Building2 className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-200 uppercase tracking-widest leading-none">RECRUITER</span>
                </button>
              </div>

              <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="mt-12 text-sm font-black text-slate-500 hover:text-indigo-400 transition-all tracking-wider uppercase group">
                {isLogin ? (
                  <>Don't have an account? <span className="text-indigo-400 group-hover:underline ml-1">Sign Up</span></>
                ) : (
                  <>Already have an account? <span className="text-indigo-400 group-hover:underline ml-1">Sign In</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
