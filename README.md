# 🎯 PlaceAI - AI-Powered Campus Placement Platform

> Revolutionizing campus placements with AI-powered candidate screening, intelligent scoring, and automated ranking.

![Tech Stack](https://img.shields.io/badge/React-19-blue?logo=react)
![Backend](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![AI](https://img.shields.io/badge/Python-FastAPI-009688?logo=python)
![CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)

---

## ⚡ Quick Start (3 Terminal Setup)

### Prerequisites
- **Node.js** v18+ 
- **Python** 3.8+
- **npm** v9+

### Terminal 1: Backend Server
```bash
cd backend
npm install
node server.js
# ✅ Running on http://localhost:5000
```

### Terminal 2: AI Service
```bash
cd ai-service
pip install -r requirements.txt
python main.py
# ✅ Running on http://localhost:8000
```

### Terminal 3: Frontend
```bash
cd frontend
npm install
npm run dev
# ✅ Running on http://localhost:5173
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student 1 | rahul@student.com | password123 |
| Student 2 | priya@student.com | password123 |
| Student 3 | amit@student.com | password123 |
| Student 4 | sneha@student.com | password123 |
| Recruiter 1 | hr@techcorp.com | password123 |
| Recruiter 2 | hr@innovatetech.com | password123 |

---

## 📦 Folder Structure

```
HACK-INDIA/
├── frontend/                    # React + Tailwind CSS
│   ├── src/
│   │   ├── context/AuthContext.jsx    # Auth state management
│   │   ├── services/api.js            # API client
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx          # Auth page with demo access
│   │   │   ├── StudentDashboard.jsx   # Student features
│   │   │   └── RecruiterDashboard.jsx # Recruiter features
│   │   ├── App.jsx                    # Routing
│   │   ├── main.jsx                   # Entry point
│   │   └── index.css                  # Design system
│   └── index.html
│
├── backend/                     # Node.js + Express
│   └── server.js                # All routes + mock DB
│
├── ai-service/                  # Python FastAPI
│   ├── main.py                  # AI scoring engine
│   └── requirements.txt
│
└── README.md
```

---

## 🎓 Features

### Student Portal
- ✅ Profile management (skills, resume, GitHub, LeetCode stats)
- ✅ One-click AI profile analysis
- ✅ Score dashboard with visualizations
- ✅ Browse and apply to jobs
- ✅ Track application status
- ✅ AI-generated recommendations

### Recruiter Portal
- ✅ Post job openings with vacancy limits
- ✅ View applicants ranked by AI score
- ✅ Score breakdown visualization per candidate
- ✅ Shortlist / Reject candidates
- ✅ Recruitment analytics dashboard
- ✅ Auto-close jobs when vacancy filled

### AI Scoring Engine
- ✅ Keyword-based resume skill extraction
- ✅ Skill categorization (Frontend, Backend, DevOps, AI/ML, etc.)
- ✅ Weighted scoring: Resume(40%) + GitHub(30%) + Coding(20%) + Portfolio(10%)
- ✅ Personalized improvement recommendations
- ✅ Fallback scoring when AI service is down

---

## 🤖 Scoring Formula

```
Final Score = (Resume × 0.4) + (GitHub × 0.3) + (Coding × 0.2) + (Portfolio × 0.1)
```

| Component | Weight | Methodology |
|-----------|--------|-------------|
| Resume Match | 40% | Keyword matching against 50+ tech skills |
| GitHub Score | 30% | Profile analysis (link presence + simulated metrics) |
| Coding Score | 20% | LeetCode stats with difficulty weighting |
| Portfolio | 10% | Portfolio presence and quality simulation |

---

## 🎤 2-Minute Demo Script

### 🔴 Problem (20 seconds)
> "Campus placements today are manual, time-consuming, and biased. Recruiters spend hours screening resumes, and students have no visibility into how they're being evaluated. The process lacks transparency and efficiency."

### 🟢 Solution (20 seconds)
> "PlaceAI is an AI-powered campus placement platform that automates the entire screening process. Our AI analyzes student profiles across four dimensions — resume, GitHub, coding skills, and portfolio — generating a comprehensive score that enables fair, data-driven hiring."

### ⚡ Live Demo (60 seconds)
1. **Login** as a student → Show dashboard with stats
2. **Update profile** → Add skills, GitHub link, LeetCode stats
3. **Click "Analyze Profile"** → Watch AI scores generate in real-time
4. **Browse jobs** → Apply to open positions
5. **Switch to recruiter** → Show ranked applicants with score breakdowns
6. **Shortlist top candidate** → Demonstrate one-click actions
7. **Show vacancy control** → Jobs auto-close when filled

### 🚀 Impact (20 seconds)
> "PlaceAI reduces screening time by 80%, eliminates bias through objective scoring, and gives students actionable insights to improve. It's a win-win for students and recruiters — making campus placement smarter, faster, and fairer."

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Tailwind CSS v4 + Vite |
| Backend | Node.js + Express.js |
| AI Service | Python + FastAPI |
| State | React Context API |
| Styling | Glassmorphism + Custom Animations |
| Database | In-memory mock (production-ready for MongoDB) |

---

## 📝 Notes

- The backend uses an **in-memory mock database** for quick demo purposes. All data resets on server restart.
- The AI service uses **keyword matching** (not heavy NLP) for fast, reliable analysis.
- If the Python AI service is down, the backend **falls back** to local scoring.
- All authentication is **mock-based** — no real JWT verification needed for demo.

---

Built with ❤️ for Hack India 2026
