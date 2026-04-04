const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// Multer setup – store PDF resumes in /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume_${req.user?.id || 'guest'}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

// ─────────────────────────────────────────────────────────────
//  IN-MEMORY DATABASE
// ─────────────────────────────────────────────────────────────
const db = {
  users: [
    {
      id: '1', name: 'student1', email: 'student1@gmail.com', password: 'password123', role: 'student',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      githubLink: 'https://github.com/rahulsharma',
      leetcodeStats: { solved: 150, easy: 80, medium: 50, hard: 20 },
      resume: 'Experienced full-stack developer with 2 years of experience in React, Node.js, Python, and MongoDB. Built multiple projects including e-commerce platforms and real-time chat applications. Strong problem-solving skills with 150+ LeetCode problems solved.',
      portfolioLink: 'https://rahulsharma.dev',
      experience: 2,
      scores: {
        resumeScore: 72, githubScore: 80, codingScore: 65, portfolioScore: 85, finalScore: 74,
        matchedSkills: ['javascript', 'react', 'node.js', 'python', 'mongodb'],
        missingSkills: ['docker', 'aws', 'typescript', 'sql'],
        breakdown: { resumeWeight: '40% – Skills & experience depth', githubWeight: '30% – Code activity & presence', codingWeight: '20% – LeetCode problem-solving', portfolioWeight: '10% – Project showcase' }
      },
      resumeAnalysis: null,
      createdAt: new Date().toISOString()
    },
    {
      id: '2', name: 'student2', email: 'student2@gmail.com', password: 'password123', role: 'student',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
      githubLink: 'https://github.com/priyapatel',
      leetcodeStats: { solved: 200, easy: 100, medium: 70, hard: 30 },
      resume: 'Data science enthusiast with expertise in Python, Machine Learning, TensorFlow, and SQL. Published research paper on NLP. Experience with data pipelines and model deployment using Docker and AWS.',
      portfolioLink: 'https://priyapatel.dev',
      experience: 1,
      scores: {
        resumeScore: 68, githubScore: 77, codingScore: 80, portfolioScore: 85, finalScore: 75,
        matchedSkills: ['python', 'machine learning', 'tensorflow', 'sql', 'docker', 'aws'],
        missingSkills: ['javascript', 'react', 'node.js', 'typescript'],
        breakdown: { resumeWeight: '40% – Skills & experience depth', githubWeight: '30% – Code activity & presence', codingWeight: '20% – LeetCode problem-solving', portfolioWeight: '10% – Project showcase' }
      },
      resumeAnalysis: null,
      createdAt: new Date().toISOString()
    },
    {
      id: '5', name: 'TechCorp HR', email: 'hr@techcorp.com', password: 'password123', role: 'recruiter',
      company: 'TechCorp Solutions', createdAt: new Date().toISOString()
    },
    {
      id: '6', name: 'InnovateTech HR', email: 'hr@innovatetech.com', password: 'password123', role: 'recruiter',
      company: 'InnovateTech', createdAt: new Date().toISOString()
    }
  ],
  jobs: [
    {
      id: 'j1', recruiterId: '5', company: 'TechCorp Solutions', role: 'Full Stack Developer',
      description: 'Looking for a passionate full-stack developer to join our engineering team. You will work on building scalable web applications using modern technologies.',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      experienceLevel: '0-1', // "0-1" | "1-3" | "3+"
      salary: '₹8-12 LPA', location: 'Bangalore', vacancyLimit: 3, applicationsCount: 0,
      status: 'open', createdAt: new Date().toISOString()
    },
    {
      id: 'j2', recruiterId: '5', company: 'TechCorp Solutions', role: 'Data Scientist',
      description: 'Join our data science team to build ML models and data pipelines. Work with large datasets and cutting-edge AI technologies.',
      requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
      experienceLevel: '0-1',
      salary: '₹10-15 LPA', location: 'Hyderabad', vacancyLimit: 2, applicationsCount: 0,
      status: 'open', createdAt: new Date().toISOString()
    },
    {
      id: 'j3', recruiterId: '6', company: 'InnovateTech', role: 'Backend Engineer',
      description: 'Build robust backend services and APIs. Work with microservices architecture and cloud technologies.',
      requiredSkills: ['Java', 'Spring Boot', 'AWS', 'Docker', 'Microservices'],
      experienceLevel: '1-3',
      salary: '₹9-13 LPA', location: 'Pune', vacancyLimit: 4, applicationsCount: 0,
      status: 'open', createdAt: new Date().toISOString()
    },
    {
      id: 'j4', recruiterId: '6', company: 'InnovateTech', role: 'Frontend Developer',
      description: 'Create beautiful and performant user interfaces. Work closely with designers and backend teams.',
      requiredSkills: ['React', 'TypeScript', 'CSS', 'GraphQL'],
      experienceLevel: '0-1',
      salary: '₹7-10 LPA', location: 'Remote', vacancyLimit: 2, applicationsCount: 0,
      status: 'open', createdAt: new Date().toISOString()
    }
  ],
  applications: [],
  notifications: []
};

let nextId = 100;
const generateId = () => String(++nextId);

// ─────────────────────────────────────────────────────────────
//  DETERMINISTIC SCORING (fallback when Python AI is offline)
//  Same input → same output.  No Math.random() anywhere.
// ─────────────────────────────────────────────────────────────

const ALL_KNOWN_SKILLS = [
  'javascript', 'react', 'node.js', 'python', 'java', 'typescript', 'mongodb', 'sql',
  'aws', 'docker', 'machine learning', 'tensorflow', 'spring boot', 'graphql', 'css',
  'html', 'git', 'kubernetes', 'redis', 'postgresql', 'next.js', 'angular', 'vue',
  'flask', 'django', 'fastapi', 'go', 'rust', 'flutter', 'swift', 'kotlin',
];

const POPULAR_SKILLS = ['javascript', 'python', 'react', 'node.js', 'sql', 'docker', 'git', 'aws', 'typescript', 'mongodb'];

const RESUME_KEYWORDS = ['experience', 'project', 'built', 'developed', 'implemented',
  'designed', 'published', 'research', 'team', 'leadership', 'deployed', 'optimized'];

function extractSkills(resumeText, manualSkills) {
  const text = (resumeText || '').toLowerCase();
  const found = new Set();
  for (const skill of ALL_KNOWN_SKILLS) {
    const pattern = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`);
    if (pattern.test(text)) found.add(skill);
  }
  for (const s of (manualSkills || [])) {
    const sl = s.toLowerCase().trim();
    if (sl) found.add(sl);
  }
  return [...found].sort();
}

function calcResumeScore(matchedSkills, resumeText) {
  const skillScore   = Math.min(60, Math.round((matchedSkills.length / 10) * 60));
  const wordCount    = (resumeText || '').split(/\s+/).filter(Boolean).length;
  const detailBonus  = Math.min(20, Math.floor(wordCount / 50));
  const kwCount      = RESUME_KEYWORDS.filter(k => (resumeText || '').toLowerCase().includes(k)).length;
  const kwBonus      = Math.min(20, kwCount * 2);
  return Math.min(100, skillScore + detailBonus + kwBonus);
}

function calcGithubScore(githubLink) {
  if (!githubLink || githubLink.trim() === '') return 20;
  const parts    = githubLink.replace(/\/$/, '').split('/');
  const username = parts[parts.length - 1] || '';
  const usernameBonus  = Math.min(25, username.length * 2);
  const protocolBonus  = githubLink.startsWith('https://github.com/') ? 5 : 0;
  return Math.min(100, 50 + usernameBonus + protocolBonus);
}

function calcCodingScore(leetcodeStats) {
  const { solved = 0, easy = 0, medium = 0, hard = 0 } = leetcodeStats || {};
  if (solved === 0) return 5;
  const weighted     = easy * 1 + medium * 2.5 + hard * 5;
  const normalized   = Math.min(80, Math.round((weighted / 500) * 80));
  const volumeBonus  = Math.min(20, Math.floor(solved / 15));
  return Math.min(100, normalized + volumeBonus);
}

function calcPortfolioScore(portfolioLink) {
  if (!portfolioLink || portfolioLink.trim() === '') return 15;
  const isCustom    = !['github.io', 'vercel.app', 'netlify.app'].some(d => portfolioLink.includes(d));
  const customBonus = isCustom ? 20 : 10;
  const kwBonus     = ['portfolio', 'dev', 'work', 'lab'].some(k => portfolioLink.toLowerCase().includes(k)) ? 15 : 0;
  return Math.min(100, 50 + customBonus + kwBonus);
}

function calcJobMatchScore(matchedSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 0;
  const reqLower   = requiredSkills.map(r => r.toLowerCase());
  const matchCount = reqLower.filter(r => matchedSkills.includes(r)).length;
  return Math.round((matchCount / reqLower.length) * 100);
}

function fallbackScoring(user, requiredSkills = []) {
  const matchedSkills  = extractSkills(user.resume, user.skills);
  const resumeScore    = calcResumeScore(matchedSkills, user.resume);
  const githubScore    = calcGithubScore(user.githubLink);
  const codingScore    = calcCodingScore(user.leetcodeStats);
  const portfolioScore = calcPortfolioScore(user.portfolioLink);

  const finalScore = Math.round(
    resumeScore * 0.40 +
    githubScore * 0.30 +
    codingScore * 0.20 +
    portfolioScore * 0.10
  );

  const missingSkills = POPULAR_SKILLS.filter(s => !matchedSkills.includes(s));
  const jobMatchScore = calcJobMatchScore(matchedSkills, requiredSkills);

  return {
    resumeScore, githubScore, codingScore, portfolioScore, finalScore,
    matchedSkills, missingSkills,
    jobMatchScore: requiredSkills.length > 0 ? jobMatchScore : null,
    breakdown: {
      resumeWeight:    '40% – Skills & experience depth',
      githubWeight:    '30% – Code activity & presence',
      codingWeight:    '20% – LeetCode problem-solving',
      portfolioWeight: '10% – Project showcase',
    }
  };
}

// ─────────────────────────────────────────────────────────────
//  AUTH MIDDLEWARE
// ─────────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  const userId = token.replace('mock_token_', '');
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(401).json({ error: 'Invalid token' });
  req.user = user;
  next();
};

// ─────────────────────────────────────────────────────────────
//  HEALTH CHECK
// ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));

// ─────────────────────────────────────────────────────────────
//  AUTH ROUTES
// ─────────────────────────────────────────────────────────────
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, role, company } = req.body;
  if (db.users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email already registered' });

  const user = {
    id: generateId(), name, email, password, role,
    ...(role === 'student'
      ? { skills: [], githubLink: '', leetcodeStats: { solved: 0, easy: 0, medium: 0, hard: 0 },
          resume: '', portfolioLink: '', experience: 0, scores: null, resumeAnalysis: null }
      : { company: company || '' }),
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  const { password: _, ...safeUser } = user;
  res.json({ token: `mock_token_${user.id}`, user: safeUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const { password: _, ...safeUser } = user;
  res.json({ token: `mock_token_${user.id}`, user: safeUser });
});

// ─────────────────────────────────────────────────────────────
//  USER ROUTES
// ─────────────────────────────────────────────────────────────
app.get('/api/users/me', authMiddleware, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json(safeUser);
});

app.put('/api/users/profile', authMiddleware, (req, res) => {
  const { skills, githubLink, leetcodeStats, resume, portfolioLink, name, experience } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (name !== undefined)          user.name = name;
  if (skills !== undefined)        user.skills = skills;
  if (githubLink !== undefined)    user.githubLink = githubLink;
  if (leetcodeStats !== undefined) user.leetcodeStats = leetcodeStats;
  if (resume !== undefined)        user.resume = resume;
  if (portfolioLink !== undefined) user.portfolioLink = portfolioLink;
  if (experience !== undefined)    user.experience = Number(experience);
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

// ─────────────────────────────────────────────────────────────
//  PDF RESUME UPLOAD + ANALYSIS
// ─────────────────────────────────────────────────────────────
app.post('/api/resume/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded' });

  try {
    // Parse PDF text
    const pdfParse = require('pdf-parse');
    const buffer   = fs.readFileSync(req.file.path);
    const data     = await pdfParse(buffer);
    const text     = data.text || '';

    // Store resume text on user
    const user = db.users.find(u => u.id === req.user.id);
    user.resume = text;
    user.resumeFilePath = req.file.path;

    // Quick skill analysis from extracted text
    const matchedSkills = extractSkills(text, user.skills || []);
    const missingSkills = POPULAR_SKILLS.filter(s => !matchedSkills.includes(s));
    const resumeScore   = calcResumeScore(matchedSkills, text);

    const analysis = { matchedSkills, missingSkills, resumeScore, wordCount: text.split(/\s+/).filter(Boolean).length };
    user.resumeAnalysis = analysis;

    const { password: _, ...safeUser } = user;
    res.json({ message: 'Resume uploaded and parsed', resumeText: text, analysis, user: safeUser });
  } catch (err) {
    console.error('PDF parse error:', err.message);
    // Fallback: still save the file path but skip text extraction
    const user = db.users.find(u => u.id === req.user.id);
    user.resumeFilePath = req.file.path;
    const { password: _, ...safeUser } = user;
    res.json({ message: 'Resume uploaded (text extraction failed – use manual entry)', analysis: null, user: safeUser });
  }
});

// ─────────────────────────────────────────────────────────────
//  AI ANALYSIS ROUTE
// ─────────────────────────────────────────────────────────────
app.post('/api/analyze', authMiddleware, async (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user || user.role !== 'student')
    return res.status(400).json({ error: 'Only students can analyze profiles' });

  try {
    const axios    = require('axios');
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/analyze`,
      {
        resume:            user.resume        || '',
        skills:            user.skills        || [],
        githubLink:        user.githubLink     || '',
        leetcodeStats:     user.leetcodeStats  || {},
        portfolioLink:     user.portfolioLink  || '',
        jobRequiredSkills: req.body?.jobRequiredSkills || []
      },
      { timeout: 6000 }
    );
    user.scores = response.data;
    const { password: _, ...safeUser } = user;
    res.json({ scores: response.data, user: safeUser });
  } catch (err) {
    console.log('AI service unavailable – using deterministic fallback scoring');
    const scores = fallbackScoring(user, req.body?.jobRequiredSkills || []);
    user.scores  = scores;
    const { password: _, ...safeUser } = user;
    res.json({ scores, user: safeUser });
  }
});

// ─────────────────────────────────────────────────────────────
//  JOB ROUTES
// ─────────────────────────────────────────────────────────────
app.get('/api/jobs', (req, res) => {
  res.json(db.jobs);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

app.post('/api/jobs', authMiddleware, (req, res) => {
  if (req.user.role !== 'recruiter')
    return res.status(403).json({ error: 'Only recruiters can post jobs' });

  const { role, description, requiredSkills, experienceLevel, salary, location, vacancyLimit } = req.body;
  const job = {
    id: generateId(),
    recruiterId: req.user.id,
    company: req.user.company || 'Unknown Company',
    role, description,
    requiredSkills:  requiredSkills  || [],
    experienceLevel: experienceLevel || '0-1',   // "0-1" | "1-3" | "3+"
    salary:          salary          || 'Not disclosed',
    location:        location        || 'Not specified',
    vacancyLimit:    Math.max(1, Math.min(1000, parseInt(vacancyLimit) || 10)),
    applicationsCount: 0,
    status: 'open',
    createdAt: new Date().toISOString()
  };
  db.jobs.push(job);
  res.json(job);
});

app.delete('/api/jobs/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'recruiter')
    return res.status(403).json({ error: 'Only recruiters can delete jobs' });
  const idx = db.jobs.findIndex(j => j.id === req.params.id && j.recruiterId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Job not found' });
  db.jobs.splice(idx, 1);
  db.applications = db.applications.filter(a => a.jobId !== req.params.id);
  res.json({ message: 'Job deleted' });
});

// ─── Candidate matches for a job (AI-suggested, haven't applied yet) ─────────
app.get('/api/jobs/:id/matches', authMiddleware, (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Access denied' });

  const job = db.jobs.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const appliedIds = db.applications
    .filter(a => a.jobId === req.params.id)
    .map(a => a.studentId);

  // Experience range filter helper
  const expFilter = (studentExp, jobExpLevel) => {
    const exp = Number(studentExp) || 0;
    if (jobExpLevel === '0-1') return exp <= 1;
    if (jobExpLevel === '1-3') return exp >= 1 && exp <= 3;
    if (jobExpLevel === '3+')  return exp >= 3;
    return true;
  };

  const potentials = db.users
    .filter(u => u.role === 'student' && !appliedIds.includes(u.id))
    .map(student => {
      const matchedSkills = extractSkills(student.resume, student.skills);
      const skillScore    = calcJobMatchScore(matchedSkills, job.requiredSkills);
      const aiScore       = student.scores?.finalScore || 0;
      const finalMatch    = aiScore > 0 ? Math.round((aiScore + skillScore) / 2) : skillScore;

      return {
        id: student.id, name: student.name, email: student.email,
        skills: student.skills, scores: student.scores,
        experience: student.experience || 0,
        matchScore: finalMatch,
        skillMatchScore: skillScore,
        matchedSkills: matchedSkills.filter(s =>
          job.requiredSkills.map(r => r.toLowerCase()).includes(s)
        ),
        expMatch: expFilter(student.experience, job.experienceLevel)
      };
    })
    .filter(p => p.matchScore > 20)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8);

  res.json(potentials);
});

// ─────────────────────────────────────────────────────────────
//  RECRUITER CANDIDATE SEARCH / FILTER
// ─────────────────────────────────────────────────────────────
/**
 * GET /api/recruiter/candidates?minScore=&maxScore=&experience=&skills=
 * Returns all students with optional filters, sorted by AI score descending.
 */
app.get('/api/recruiter/candidates', authMiddleware, (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Access denied' });

  const {
    minScore   = 0,
    maxScore   = 100,
    experience,   // "0-1" | "1-3" | "3+"
    skills,       // comma-separated
  } = req.query;

  const skillFilter = skills ? skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];

  const expFilter = (studentExp, level) => {
    if (!level) return true;
    const exp = Number(studentExp) || 0;
    if (level === '0-1') return exp <= 1;
    if (level === '1-3') return exp >= 1 && exp <= 3;
    if (level === '3+')  return exp >= 3;
    return true;
  };

  let candidates = db.users
    .filter(u => u.role === 'student')
    .map(u => {
      const score = u.scores?.finalScore || 0;
      const matchedSkills = extractSkills(u.resume, u.skills);
      return { ...u, password: undefined, score, matchedSkillsList: matchedSkills };
    })
    .filter(u => {
      const scoreOk = u.score >= Number(minScore) && u.score <= Number(maxScore);
      const expOk   = expFilter(u.experience, experience);
      const skillOk = skillFilter.length === 0 || skillFilter.every(sf =>
        u.matchedSkillsList.includes(sf) ||
        (u.skills || []).map(s => s.toLowerCase()).includes(sf)
      );
      return scoreOk && expOk && skillOk;
    })
    .sort((a, b) => b.score - a.score)
    .map((u, idx) => ({
      id: u.id, name: u.name, email: u.email,
      skills: u.skills, experience: u.experience || 0,
      score: u.score, scores: u.scores,
      rank: idx + 1,
      isTopMatch: u.score >= 80,
      resumeUrl: u.resumeFilePath ? `/uploads/${path.basename(u.resumeFilePath)}` : null,
      githubLink: u.githubLink
    }));

  res.json(candidates);
});

// ─────────────────────────────────────────────────────────────
//  APPLICATION ROUTES
// ─────────────────────────────────────────────────────────────
app.post('/api/applications', authMiddleware, (req, res) => {
  if (req.user.role !== 'student')
    return res.status(403).json({ error: 'Only students can apply' });

  const { jobId } = req.body;
  const job = db.jobs.find(j => j.id === jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (job.applicationsCount >= job.vacancyLimit)
    return res.status(400).json({ error: 'Applications closed. Vacancy limit reached.' });

  if (db.applications.find(a => a.jobId === jobId && a.studentId === req.user.id))
    return res.status(400).json({ error: 'Already applied to this job' });

  // Compute job-specific match score on apply
  const matchedSkills  = extractSkills(req.user.resume, req.user.skills);
  const jobMatchScore  = calcJobMatchScore(matchedSkills, job.requiredSkills);

  const application = {
    id: generateId(), jobId, studentId: req.user.id,
    studentName: req.user.name, studentEmail: req.user.email,
    skills: req.user.skills || [], experience: req.user.experience || 0,
    scores: req.user.scores || null, jobMatchScore,
    status: 'applied', appliedAt: new Date().toISOString()
  };
  db.applications.push(application);
  job.applicationsCount++;
  if (job.applicationsCount >= job.vacancyLimit) job.status = 'closed';

  db.notifications.push({
    id: generateId(), userId: req.user.id,
    message: `Application submitted for ${job.role} at ${job.company}`,
    type: 'success', read: false, createdAt: new Date().toISOString()
  });

  res.json(application);
});

app.post('/api/applications/assign', authMiddleware, (req, res) => {
  if (req.user.role !== 'recruiter')
    return res.status(403).json({ error: 'Only recruiters can assign candidates' });

  const { jobId, studentId } = req.body;
  const job     = db.jobs.find(j => j.id === jobId);
  const student = db.users.find(u => u.id === studentId);
  if (!job || !student) return res.status(404).json({ error: 'Job or Student not found' });

  if (db.applications.find(a => a.jobId === jobId && a.studentId === studentId))
    return res.status(400).json({ error: 'Candidate already assigned/applied' });

  const matchedSkills = extractSkills(student.resume, student.skills);
  const jobMatchScore = calcJobMatchScore(matchedSkills, job.requiredSkills);

  const application = {
    id: generateId(), jobId, studentId,
    studentName: student.name, studentEmail: student.email,
    skills: student.skills || [], experience: student.experience || 0,
    scores: student.scores || null, jobMatchScore,
    status: 'shortlisted', appliedAt: new Date().toISOString(),
    assignedByRecruiter: true
  };
  db.applications.push(application);
  job.applicationsCount++;

  db.notifications.push({
    id: generateId(), userId: studentId,
    message: `🚀 You've been scouted and assigned to ${job.role} at ${job.company}!`,
    type: 'success', read: false, createdAt: new Date().toISOString()
  });

  res.json(application);
});

app.get('/api/applications/my', authMiddleware, (req, res) => {
  const apps = db.applications
    .filter(a => a.studentId === req.user.id)
    .map(app => ({ ...app, job: db.jobs.find(j => j.id === app.jobId) }));
  res.json(apps);
});

app.get('/api/applications/job/:jobId', authMiddleware, (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Access denied' });

  const apps = db.applications
    .filter(a => a.jobId === req.params.jobId)
    .map(app => {
      const student = db.users.find(u => u.id === app.studentId);
      return {
        ...app,
        student: student
          ? {
              name: student.name, email: student.email, skills: student.skills,
              githubLink: student.githubLink, scores: student.scores,
              experience: student.experience || 0,
              resumeUrl: student.resumeFilePath ? `/uploads/${path.basename(student.resumeFilePath)}` : null
            }
          : null
      };
    })
    .sort((a, b) => {
      const sa = a.scores?.finalScore || a.student?.scores?.finalScore || 0;
      const sb = b.scores?.finalScore || b.student?.scores?.finalScore || 0;
      return sb - sa;
    });

  res.json(apps);
});

app.put('/api/applications/:id/status', authMiddleware, (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Access denied' });

  const { status } = req.body;
  const appDoc = db.applications.find(a => a.id === req.params.id);
  if (!appDoc) return res.status(404).json({ error: 'Application not found' });

  appDoc.status = status;
  const job = db.jobs.find(j => j.id === appDoc.jobId);
  db.notifications.push({
    id: generateId(), userId: appDoc.studentId,
    message: status === 'shortlisted'
      ? `🎉 You've been shortlisted for ${job?.role} at ${job?.company}!`
      : `Your application for ${job?.role} at ${job?.company} was not selected.`,
    type: status === 'shortlisted' ? 'success' : 'info',
    read: false, createdAt: new Date().toISOString()
  });
  res.json(appDoc);
});

// ─────────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
app.get('/api/notifications', authMiddleware, (req, res) => {
  res.json(
    db.notifications
      .filter(n => n.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  );
});

app.put('/api/notifications/read', authMiddleware, (req, res) => {
  db.notifications.filter(n => n.userId === req.user.id).forEach(n => n.read = true);
  res.json({ message: 'All notifications marked as read' });
});

// ─────────────────────────────────────────────────────────────
//  RECRUITER STATS
// ─────────────────────────────────────────────────────────────
app.get('/api/recruiter/stats', authMiddleware, (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ error: 'Access denied' });

  const myJobs   = db.jobs.filter(j => j.recruiterId === req.user.id);
  const myJobIds = myJobs.map(j => j.id);
  const myApps   = db.applications.filter(a => myJobIds.includes(a.jobId));

  res.json({
    totalJobs:        myJobs.length,
    totalApplications: myApps.length,
    shortlisted:      myApps.filter(a => a.status === 'shortlisted').length,
    rejected:         myApps.filter(a => a.status === 'rejected').length,
    pending:          myApps.filter(a => a.status === 'applied').length,
  });
});

// ─────────────────────────────────────────────────────────────
//  START
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Scoring: deterministic (no randomness)`);
  console.log(`📄 PDF Resume upload: POST /api/resume/upload`);
});
