import { useState, useEffect } from 'react';
import { 
  Upload, FileText, Briefcase, Sparkles, Send, 
  ChevronRight, ChevronLeft, Plus, X, 
  CheckCircle, Globe, Zap, BarChart3, Clock,
  GraduationCap, Building2, Wallet, MapPin, 
  Search, Wand2, Loader2, Award, User, Target
} from 'lucide-react';

const Stepper = ({ currentStep, totalSteps = 5 }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-16 relative px-4">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
      
      {/* Progress Line */}
      <div 
        className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 -translate-y-1/2 z-0 transition-all duration-700 ease-out-expo rounded-full" 
        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
      />

      <div className="relative z-10 flex justify-between items-center">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <div key={step} className="flex flex-col items-center group">
              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl relative
                  ${isActive ? 'bg-indigo-600 scale-110 ring-4 ring-indigo-500/20' : 
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-900 border border-slate-700'}
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <span className={`text-lg font-black ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {step}
                  </span>
                )}
                
                {/* Glowing Aura for Active Component */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-indigo-500 blur-xl opacity-40 animate-pulse" />
                )}
              </div>
              <span className={`mt-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300
                ${isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-500'}`}>
                STEP {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ResumeUpload = ({ data, updateData, onNext }) => {
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateData({ 
        resumeFile: { name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' }
      });
    }
  };

  const startAnalysis = () => {
    setAnalyzing(true);
    // Simulate AI Extraction
    setTimeout(() => {
      updateData({
        extractedData: {
          skills: ["React", "JavaScript", "Python", "Node.js", "Tailwind CSS"],
          experience: "2 Years",
          projects: ["E-commerce App", "AI Chatbot", "Portfolio Website"]
        }
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="animate-fade-in w-full max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">Upload <span className="gradient-text">Dossier</span></h2>
        <p className="text-slate-400 font-medium">Our AI will parse your experience metrics immediately.</p>
      </div>

      <div 
        className={`glass-card p-12 border-2 border-dashed transition-all duration-500 cursor-pointer group mb-8
          ${dragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 hover:border-indigo-500/20'}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if(file) handleFileChange({target:{files:[file]}}); }}
      >
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
            <Upload className="w-10 h-10 text-indigo-400" />
          </div>
          <p className="text-xl font-black text-white mb-2 uppercase tracking-tight">Drop Resume Here</p>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-6 focus:outline-none">or click to browse filesystem</p>
          <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
        
        {data.resumeFile && (
          <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-black text-white">{data.resumeFile.name}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{data.resumeFile.size}</p>
              </div>
            </div>
            <button onClick={() => updateData({resumeFile: null})} className="text-slate-400 hover:text-red-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <textarea 
          placeholder="Or paste resume text here for manual ingestion..."
          className="w-full bg-slate-900/60 border border-slate-800 rounded-3xl px-8 py-6 text-slate-200 focus:border-indigo-500 outline-none min-h-[160px] font-medium transition-all"
        />
        
        <button 
          onClick={startAnalysis}
          disabled={!data.resumeFile || analyzing}
          className="glow-btn w-full py-6 group disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {analyzing ? 'ANALYZING NODES...' : 'INITIALIZE AI ANALYSIS'}
        </button>
      </div>

      {data.extractedData && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div className="glass-card p-6 border-indigo-500/30">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Extracted Skills</p>
            <div className="flex flex-wrap gap-2">
              {data.extractedData.skills.map(s => (
                <span key={s} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase tracking-tight">{s}</span>
              ))}
            </div>
          </div>
          <div className="glass-card p-6 border-indigo-500/30">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Exp Level</p>
            <p className="text-2xl font-black text-white">{data.extractedData.experience}</p>
          </div>
          <div className="glass-card p-6 border-indigo-500/30">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Projects Detected</p>
            <p className="text-2xl font-black text-white">{data.extractedData.projects.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ExperienceForm = ({ data, updateData }) => {
  const addSkill = (val) => {
    if (val && !data.skills.includes(val)) {
      updateData({ skills: [...data.skills, val] });
    }
  };

  const removeSkill = (val) => {
    updateData({ skills: data.skills.filter(s => s !== val) });
  };

  return (
    <div className="animate-fade-in w-full max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">Experience <span className="gradient-text">Metrics</span></h2>
        <p className="text-slate-400 font-medium">Fine-tune your professional telemetry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Total Experience (Years)</label>
          <input 
            type="number" 
            min="0"
            value={data.experienceYears}
            onChange={(e) => updateData({ experienceYears: e.target.value })}
            className="input-field"
            placeholder="e.g. 5"
          />
          {data.experienceYears === '0' && (
            <span className="text-[10px] font-black text-emerald-400 ml-2 uppercase tracking-widest opacity-80">✓ Fresher Protocol Enabled</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Primary Domain</label>
          <select 
            className="input-field appearance-none"
            value={data.domain}
            onChange={(e) => updateData({ domain: e.target.value })}
          >
            <option value="">Select Domain</option>
            <option value="Frontend">Frontend Development</option>
            <option value="Backend">Backend Engineering</option>
            <option value="Fullstack">Fullstack Architecture</option>
            <option value="AI / ML">AI & Machine Learning</option>
            <option value="DevOps">DevOps & Cloud</option>
            <option value="Cybersecurity">Cybersecurity</option>
          </select>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Professional Skillset / Tags</label>
        <div className="relative group">
          <input 
            type="text" 
            className="input-field pr-12"
            placeholder="Type skill and press enter..."
            onKeyDown={(e) => { if(e.key === 'Enter') { addSkill(e.target.value); e.target.value = ''; } }}
          />
          <Plus className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {data.skills.map(skill => (
            <span key={skill} className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-2 group hover:border-red-500/30 transition-all">
              {skill}
              <button onClick={() => removeSkill(skill)} className="text-slate-500 group-hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Legacy Organizations (Previous Companies)</label>
        <textarea 
          value={data.companies}
          onChange={(e) => updateData({ companies: e.target.value })}
          className="input-field min-h-[120px]"
          placeholder="List your previous strongholds..."
        />
      </div>
    </div>
  );
};

const RequirementForm = ({ data, updateData }) => {
  const roles = ["Software Engineer", "Frontend Developer", "Backend Developer", "System Architect", "DevOps Engineer", "Data Scientist"];
  
  const autoSuggest = () => {
    if (data.jobRole === "Frontend Developer") {
      updateData({ requiredSkills: ["React", "TypeScript", "Tailwind", "Vite", "Next.js"] });
    } else if (data.jobRole === "Backend Developer") {
      updateData({ requiredSkills: ["Node.js", "PostgreSQL", "Redis", "Docker", "GraphQL"] });
    } else if (data.jobRole.includes("AI")) {
      updateData({ requiredSkills: ["PyTorch", "TensorFlow", "Scikit-Learn", "FastAPI"] });
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">Target <span className="gradient-text">Parameters</span></h2>
        <p className="text-slate-400 font-medium">Define the ideal node requirements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Job Role Index</label>
          <div className="relative">
            <select 
              className="input-field appearance-none pr-12"
              value={data.jobRole}
              onChange={(e) => updateData({ jobRole: e.target.value })}
            >
              <option value="">Select Role</option>
              {roles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
            </select>
            <button 
              onClick={autoSuggest}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-inner"
              title="Auto Suggest Skills"
            >
              <Wand2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Salary Magnitude (Range)</label>
          <input 
            type="text" 
            value={data.salary}
            onChange={(e) => updateData({ salary: e.target.value })}
            className="input-field"
            placeholder="e.g. $120k - $160k"
          />
        </div>
      </div>

      <div className="mb-10 p-10 glass-card">
        <div className="flex justify-between items-center mb-6">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Min Intelligence Seniority (Experience)</label>
          <span className="text-2xl font-black text-indigo-400">{data.minExperience} YEARS</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="15" 
          step="1"
          value={data.minExperience}
          onChange={(e) => updateData({ minExperience: e.target.value })}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between mt-4">
          <span className="text-[10px] font-black text-slate-600">JUNIOR (0)</span>
          <span className="text-[10px] font-black text-slate-600">SENIOR (15+)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Geographic Node (Location)</label>
          <div className="relative">
            <input 
              type="text" 
              value={data.location}
              onChange={(e) => updateData({ location: e.target.value })}
              className="input-field pl-12"
              placeholder="e.g. Remote, SF, London"
            />
            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Critical Skills Required</label>
          <div className="flex flex-wrap gap-2">
            {data.requiredSkills.map(s => (
              <span key={s} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-tight">{s}</span>
            ))}
            {data.requiredSkills.length === 0 && <p className="text-slate-600 text-[10px] italic">No requirements defined...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const AIMatchPreview = ({ data }) => {
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [analyzed, setAnalyzed] = useState(false);

  const runAnalysis = () => {
    setRunning(true);
    setAnalyzed(false);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 85) {
        clearInterval(interval);
        setScore(85);
        setRunning(false);
        setAnalyzed(true);
      } else {
        setScore(Math.floor(progress));
      }
    }, 150);
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">Neural <span className="gradient-text">Matchmaker</span></h2>
        <p className="text-slate-400 font-medium">Cross-referencing telemetry with target requirements.</p>
      </div>

      {!analyzed && !running ? (
        <div className="glass-card p-20 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8 animate-pulse">
            <Zap className="w-12 h-12 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-black text-white mb-6 uppercase">Ready for Logic Processing</h3>
          <button onClick={runAnalysis} className="glow-btn px-12 py-6">
            <Search className="w-5 h-5" />
            RUN AI ANALYSIS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center bg-indigo-600/5 group">
            <div className="relative mb-10">
              <svg className="w-64 h-64 transform -rotate-90">
                <circle cx="128" cy="128" r="110" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle 
                  cx="128" cy="128" r="110" fill="none"
                  stroke={score >= 80 ? '#10b981' : '#6366f1'}
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray="691"
                  strokeDashoffset={691 - (691 * score / 100)}
                  className="transition-all duration-1000 ease-out-expo shadow-2xl"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl">{score}%</span>
                <span className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-[0.4em]">COMPATIBILITY</span>
              </div>
            </div>
            <div className="px-8 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-bounce">
              ELITE MATCH DETECTED
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Skill Alignment</p>
                <span className="text-emerald-400 font-bold">92%</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 w-[92%] transition-all duration-1000" />
              </div>
            </div>

            <div className="glass-card p-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Experience Match</p>
                <span className="text-indigo-400 font-bold">78%</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[78%] transition-all duration-1000" />
              </div>
            </div>

            <div className="glass-card p-8 border-red-500/20 bg-red-500/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Internal Inconsistencies / Missing Skills</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-tight">Docker</span>
                <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-tight">System Design</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {analyzed && (
        <button onClick={runAnalysis} className="mt-8 text-indigo-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest mx-auto flex items-center gap-2">
          <Loader2 className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          RE-CALIBRATE NEURAL ENGINE
        </button>
      )}
    </div>
  );
};

const Summary = ({ data }) => {
  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">System <span className="gradient-text">Verification</span></h2>
        <p className="text-slate-400 font-medium">Verify all telemetry before final deployment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="glass-card p-10">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <User className="w-5 h-5 text-indigo-400" />
            Candidate Profile
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-black text-slate-600 uppercase">Resume</span>
              <span className="text-sm font-bold text-white uppercase">{data.resumeFile?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-black text-slate-600 uppercase">Seniority</span>
              <span className="text-sm font-bold text-white uppercase">{data.experienceYears} Years</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-black text-slate-600 uppercase">Domain</span>
              <span className="text-sm font-bold text-indigo-400 uppercase">{data.domain || 'Not Set'}</span>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-600 uppercase mb-4 block">Skill Hierarchy</span>
              <div className="flex flex-wrap gap-2">
                {data.skills.map(s => (
                  <span key={s} className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black uppercase">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-10">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <Target className="w-5 h-5 text-purple-400" />
            Requirement Spectrum
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-black text-slate-600 uppercase">Job Role</span>
              <span className="text-sm font-bold text-white uppercase">{data.jobRole || 'Not Set'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-black text-slate-600 uppercase">Min Experience</span>
              <span className="text-sm font-bold text-white uppercase">{data.minExperience} Years</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-black text-slate-600 uppercase">Location</span>
              <span className="text-sm font-bold text-white uppercase">{data.location || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-600 uppercase mb-4 block">Comp Range</span>
              <span className="text-2xl font-black text-emerald-400 uppercase">{data.salary || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PlacementWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('next');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    resumeFile: null,
    extractedData: null,
    experienceYears: '0',
    domain: '',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    companies: '',
    jobRole: '',
    salary: '',
    minExperience: '2',
    location: '',
    requiredSkills: []
  });

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (step < 5) {
      setDirection('next');
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection('prev');
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    // Simulate API Submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-gradient p-10">
        <div className="glass-card p-20 text-center max-w-2xl animate-fade-in relative overflow-hidden">
          {/* Animated Success Background */}
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 animate-pulse" />
          
          <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-5xl font-black text-white mb-6 uppercase tracking-tighter">Mission <span className="text-emerald-400">Accomplished</span></h2>
          <p className="text-xl text-slate-400 mb-12 font-medium">Your telemetry has been successfully injected into the placement matrix. AI agents are now negotiating on your behalf.</p>
          <button 
            onClick={() => { window.location.href = '/'; }}
            className="glow-btn px-12 py-5 bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-500"
          >
            RETURN TO COMMAND CENTER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient flex flex-col relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="p-10 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white italic text-2xl shadow-xl shadow-indigo-600/30 ring-1 ring-white/10">P</div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">PLACEAI <span className="text-slate-500 font-bold opacity-50">/</span> <span className="text-indigo-400">PROTOCOL</span></h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1 opacity-80">Autonomous Matchmaking Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 opacity-60">Session State</p>
            <p className="text-xs font-black text-emerald-400">ENCRYPTED_AUTH_PASS</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Flow Area */}
      <main className="flex-1 px-8 pb-32 relative z-10">
        <Stepper currentStep={step} />

        <div className="transition-all duration-700">
          {step === 1 && <ResumeUpload data={formData} updateData={updateFormData} onNext={nextStep} />}
          {step === 2 && <ExperienceForm data={formData} updateData={updateFormData} />}
          {step === 3 && <RequirementForm data={formData} updateData={updateFormData} />}
          {step === 4 && <AIMatchPreview data={formData} />}
          {step === 5 && <Summary data={formData} />}
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-8 flex justify-center z-50">
        <div className="max-w-4xl w-full glass-card p-6 flex justify-between items-center shadow-3xl bg-slate-950/80 border-t border-white/10">
          <button 
            onClick={prevStep}
            disabled={step === 1 || loading}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
              ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous Phase
          </button>

          <div className="hidden lg:flex items-center gap-4 text-slate-500">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">System Metadata :</p>
            <p className="text-[10px] font-black uppercase tracking-widest">Active_Node_302</p>
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <p className="text-[10px] font-black uppercase tracking-widest">Latency_12ms</p>
          </div>

          <button 
            onClick={step === 5 ? handleSubmit : nextStep}
            disabled={loading}
            className="glow-btn px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 min-w-[200px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 5 ? 'DEPLOY PROTOCOL' : 'Next Phase'}
                {step !== 5 && <ChevronRight className="w-5 h-5" />}
                {step === 5 && <Award className="w-5 h-5 ml-1" />}
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
