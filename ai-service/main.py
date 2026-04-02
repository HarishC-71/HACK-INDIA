from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import io
import re

app = FastAPI(title="AI Campus Placement Analyzer", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Skill Database ────────────────────────────────────────────────────────────
SKILL_DATABASE = {
    "frontend":  ["html", "css", "javascript", "react", "angular", "vue", "typescript",
                  "tailwind", "sass", "bootstrap", "next.js", "svelte", "graphql", "redux"],
    "backend":   ["node.js", "express", "python", "django", "flask", "java", "spring boot",
                  "ruby", "rails", "php", "laravel", "go", "rust", "fastapi", "nestjs"],
    "database":  ["mongodb", "mysql", "postgresql", "sql", "redis", "firebase",
                  "dynamodb", "cassandra", "elasticsearch", "sqlite"],
    "devops":    ["docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins",
                  "terraform", "linux", "nginx", "ansible", "github actions"],
    "ai_ml":     ["machine learning", "deep learning", "tensorflow", "pytorch",
                  "scikit-learn", "nlp", "computer vision", "pandas", "numpy", "keras", "xgboost"],
    "mobile":    ["react native", "flutter", "swift", "kotlin", "android", "ios"],
    "tools":     ["git", "github", "jira", "figma", "postman", "webpack", "vite", "jest", "selenium"],
}

ALL_SKILLS: List[str] = []
for _cat in SKILL_DATABASE.values():
    ALL_SKILLS.extend(_cat)

# Top-10 popular skills used for "missing skills" detection
POPULAR_SKILLS = ["javascript", "python", "react", "node.js", "sql", "docker",
                  "git", "aws", "typescript", "mongodb"]

# Resume quality keywords
RESUME_KEYWORDS = ["experience", "project", "built", "developed", "implemented",
                   "designed", "published", "research", "team", "leadership",
                   "deployed", "optimized", "managed", "collaborated", "achieved"]

# Insight templates keyed by dominant category
INSIGHT_TEMPLATES = {
    "frontend":  "Strong in frontend development",
    "backend":   "Strong in backend/server-side development",
    "ai_ml":     "Strong in AI/ML and data science",
    "devops":    "Strong in DevOps and cloud infrastructure",
    "database":  "Strong in database design and management",
    "mobile":    "Strong in mobile app development",
    "tools":     "Proficient with modern development tooling",
}


# ─── Pydantic models ───────────────────────────────────────────────────────────
class ProfileData(BaseModel):
    resume: str = ""
    skills: List[str] = []
    githubLink: str = ""
    leetcodeStats: Dict = {}
    portfolioLink: str = ""
    jobRequiredSkills: List[str] = []    # optional: from a specific job posting


class ResumeAnalysisRequest(BaseModel):
    resumeText: str
    jobRequiredSkills: List[str] = []


class AnalysisResponse(BaseModel):
    resumeScore: int
    githubScore: int
    codingScore: int
    portfolioScore: int
    finalScore: int
    matchedSkills: List[str]
    missingSkills: List[str]
    skillCategories: Dict[str, List[str]]
    recommendations: List[str]
    insights: List[str]
    breakdown: Dict[str, str]
    jobMatchScore: Optional[int] = None    # match % against specific job


# ─── Core helpers ──────────────────────────────────────────────────────────────
def extract_skills(resume_text: str, manual_skills: List[str]) -> List[str]:
    """
    Deterministic skill extraction:
    1. Scan resume text for known skill keywords.
    2. Merge with manually added skills (normalised to lowercase).
    """
    text_lower = resume_text.lower()
    found: set = set()

    for skill in ALL_SKILLS:
        # Use word-boundary matching so 'java' doesn't match 'javascript'
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)

    for skill in manual_skills:
        s = skill.lower().strip()
        if s:
            found.add(s)

    return sorted(found)


def categorize_skills(skills: List[str]) -> Dict[str, List[str]]:
    categories: Dict[str, List[str]] = {}
    for cat_name, cat_skills in SKILL_DATABASE.items():
        matched = [s for s in skills if s in cat_skills]
        if matched:
            categories[cat_name] = matched
    return categories


# ─── Deterministic scoring functions ─────────────────────────────────────────

def calculate_resume_score(matched_skills: List[str], resume_text: str) -> int:
    """
    Fully deterministic scoring:
      • skill_score  – up to 60 pts  ( matched_skills / 10 * 60, capped )
      • detail_bonus – up to 20 pts  ( word count / 50, capped )
      • keyword_bonus– up to 20 pts  ( 2 pts per resume keyword found )
    """
    skill_score = min(60, int(len(matched_skills) / 10 * 60))

    word_count = len(resume_text.split())
    detail_bonus = min(20, word_count // 50)

    keyword_count = sum(1 for k in RESUME_KEYWORDS if k in resume_text.lower())
    keyword_bonus = min(20, keyword_count * 2)

    return min(100, skill_score + detail_bonus + keyword_bonus)


def calculate_github_score(github_link: str) -> int:
    """
    Deterministic GitHub score.
    Without API access we score based on link presence + heuristics
    derived from the URL itself (username length acts as a stable proxy).
    
    Score breakdown:
      • No link           → 20 pts
      • Link present      → 50 pts base
      • Username length   → 0-25 pts  (longer = more established)
      • Has custom domain → +5 pts
    """
    if not github_link or github_link.strip() == "":
        return 20

    base = 50
    # Extract username from URL deterministically
    parts = github_link.rstrip("/").split("/")
    username = parts[-1] if parts else ""
    # Longer usernames tend to be older accounts – stable deterministic bonus
    username_bonus = min(25, len(username) * 2)
    # Slight bonus for https
    protocol_bonus = 5 if github_link.startswith("https://github.com/") else 0

    return min(100, base + username_bonus + protocol_bonus)


def calculate_coding_score(leetcode_stats: Dict) -> int:
    """
    Deterministic LeetCode scoring:
      • Weighted solved = easy*1 + medium*2.5 + hard*5
      • Normalized to 0-80 pts
      • Volume bonus: solved//15, capped at 20 pts
      • Total capped at 100
    """
    solved = int(leetcode_stats.get("solved", 0))
    easy   = int(leetcode_stats.get("easy",   0))
    medium = int(leetcode_stats.get("medium", 0))
    hard   = int(leetcode_stats.get("hard",   0))

    if solved == 0:
        return 5  # zero problems → minimal score

    weighted = easy * 1 + medium * 2.5 + hard * 5
    normalized = min(80, int((weighted / 500) * 80))
    volume_bonus = min(20, solved // 15)

    return min(100, normalized + volume_bonus)


def calculate_portfolio_score(portfolio_link: str) -> int:
    """
    Deterministic portfolio score based on URL characteristics.
      • No link              → 15 pts
      • Link present         → 50 pts base
      • Custom domain (non-github) → +20 pts
      • Has 'portfolio' or name keywords → +15 pts
    """
    if not portfolio_link or portfolio_link.strip() == "":
        return 15

    base = 50
    custom_domain = 20 if ("github.io" not in portfolio_link and
                           "vercel.app" not in portfolio_link and
                           "netlify.app" not in portfolio_link) else 10
    keyword_bonus = 15 if any(k in portfolio_link.lower() for k in ["portfolio", "dev", "work", "lab"]) else 0

    return min(100, base + custom_domain + keyword_bonus)


def calculate_job_match_score(matched_skills: List[str], required_skills: List[str]) -> int:
    """
    Match Score = (matched required skills / total required skills) * 100
    """
    if not required_skills:
        return 0
    req_lower = [r.lower() for r in required_skills]
    matched_count = sum(1 for r in req_lower if r in matched_skills)
    return round((matched_count / len(req_lower)) * 100)


def generate_insights(skill_categories: Dict[str, List[str]], scores: dict) -> List[str]:
    """Generate human-readable strength/weakness insights."""
    insights: List[str] = []

    if not skill_categories:
        insights.append("No recognized skills detected – expand your resume with technical details.")
        return insights

    # Dominant category
    dominant = max(skill_categories, key=lambda c: len(skill_categories[c]))
    insights.append(INSIGHT_TEMPLATES.get(dominant, f"Strong in {dominant}"))

    # Weaknesses
    missing_cats = [c for c in SKILL_DATABASE if c not in skill_categories]
    if "backend" in missing_cats and "frontend" in skill_categories:
        insights.append("Needs improvement in backend skills")
    if "devops" in missing_cats:
        insights.append("Consider adding cloud/DevOps skills to stand out")
    if "database" in missing_cats:
        insights.append("Add database knowledge to make your profile more complete")

    # Score-based insights
    if scores["codingScore"] < 40:
        insights.append("Solve more coding problems to boost algorithmic ranking")
    if scores["githubScore"] < 40:
        insights.append("Maintain an active GitHub profile with public projects")
    if scores["resumeScore"] >= 70:
        insights.append("Well-structured resume with strong technical depth")

    return insights


def generate_recommendations(matched_skills: List[str], missing_skills: List[str], scores: dict) -> List[str]:
    recs: List[str] = []

    if scores["resumeScore"] < 60:
        recs.append("📝 Add project details and tech stack descriptions to your resume")
    if scores["githubScore"] < 50:
        recs.append("💻 Contribute to open-source and maintain an active GitHub profile")
    if scores["codingScore"] < 50:
        recs.append("🧩 Solve more LeetCode problems – focus on medium & hard difficulty")
    if scores["portfolioScore"] < 50:
        recs.append("🌐 Build a portfolio website to showcase your best projects")

    if missing_skills:
        top_missing = missing_skills[:3]
        recs.append(f"📚 Consider learning: {', '.join(top_missing)}")

    if scores["finalScore"] >= 80:
        recs.append("🌟 Excellent profile! You're ready to apply to top-tier companies")
    elif scores["finalScore"] >= 60:
        recs.append("💪 Good profile! Focus on improving weaker areas to stand out")
    elif scores["finalScore"] >= 40:
        recs.append("🎯 Build more projects and practice coding to improve your scores")
    else:
        recs.append("🚀 Start with beginner projects and build your skills step by step")

    return recs


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "AI Service v2.0 Running – deterministic scoring enabled", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze", response_model=AnalysisResponse)
def analyze_profile(data: ProfileData):
    """Analyze a student profile and return fully deterministic scores."""

    matched_skills = extract_skills(data.resume, data.skills)
    skill_categories = categorize_skills(matched_skills)

    # Missing skills = popular skills the student doesn't have (deterministic order)
    missing_skills = [s for s in POPULAR_SKILLS if s not in matched_skills]

    resume_score    = calculate_resume_score(matched_skills, data.resume)
    github_score    = calculate_github_score(data.githubLink)
    coding_score    = calculate_coding_score(data.leetcodeStats)
    portfolio_score = calculate_portfolio_score(data.portfolioLink)

    # Weighted final score  (40 / 30 / 20 / 10)
    final_score = round(
        resume_score    * 0.40 +
        github_score    * 0.30 +
        coding_score    * 0.20 +
        portfolio_score * 0.10
    )

    scores = {
        "resumeScore":    resume_score,
        "githubScore":    github_score,
        "codingScore":    coding_score,
        "portfolioScore": portfolio_score,
        "finalScore":     final_score,
    }

    # Optional job-specific match score
    job_match = None
    if data.jobRequiredSkills:
        job_match = calculate_job_match_score(matched_skills, data.jobRequiredSkills)

    insights        = generate_insights(skill_categories, scores)
    recommendations = generate_recommendations(matched_skills, missing_skills, scores)

    return AnalysisResponse(
        resumeScore=resume_score,
        githubScore=github_score,
        codingScore=coding_score,
        portfolioScore=portfolio_score,
        finalScore=final_score,
        matchedSkills=matched_skills,
        missingSkills=missing_skills,
        skillCategories=skill_categories,
        recommendations=recommendations,
        insights=insights,
        jobMatchScore=job_match,
        breakdown={
            "resumeWeight":    "40% – Skills & experience depth",
            "githubWeight":    "30% – Code activity & presence",
            "codingWeight":    "20% – LeetCode problem-solving",
            "portfolioWeight": "10% – Project showcase",
        }
    )


@app.post("/analyze-resume-text")
async def analyze_resume_text(data: ResumeAnalysisRequest):
    """
    Lightweight endpoint: extract skills + compute job-match score
    from raw resume text (used by the PDF-upload flow).
    """
    matched_skills   = extract_skills(data.resumeText, [])
    skill_categories = categorize_skills(matched_skills)
    missing_skills   = [s for s in POPULAR_SKILLS if s not in matched_skills]
    job_match        = calculate_job_match_score(matched_skills, data.jobRequiredSkills)

    resume_score = calculate_resume_score(matched_skills, data.resumeText)

    return {
        "matchedSkills":   matched_skills,
        "missingSkills":   missing_skills,
        "skillCategories": skill_categories,
        "resumeScore":     resume_score,
        "jobMatchScore":   job_match,
        "wordCount":       len(data.resumeText.split()),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
