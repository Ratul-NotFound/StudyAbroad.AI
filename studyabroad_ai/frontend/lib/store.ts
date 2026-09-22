/**
 * StudyAbroad.AI — Shared Client Store (localStorage bridge)
 * Persists profile, analysis, session, and matched data across all pages.
 * Used by Profile, Dashboard, Universities, Scholarships, SOP, Documents.
 */

const PREFIX = "studyabroad_";

export type StoredProfile = {
  full_name?: string;
  email?: string;
  gpa?: number;
  gpa_scale?: number;
  gre_verbal?: number;
  gre_quant?: number;
  ielts_score?: number;
  toefl_score?: number;
  work_experience_years?: number;
  research_papers?: number;
  target_countries?: string[];
  target_programs?: string[];
  target_degree?: string;
  budget_usd?: number;
  preferred_intake?: string;
  current_degree?: string;
  projects?: string;
  achievements?: string;
  extracurriculars?: string;
};

export type StoredAnalysis = {
  overall_score: number;
  completeness_score: number;
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
};

export type StoredSession = {
  session_id: string;
  created_at: string;
};

export type StoredUniversityMatch = {
  id?: number;
  name: string;
  short?: string;
  country: string;
  flag?: string;
  match: number;
  tier: "Reach" | "Match" | "Safe";
  tuition?: number;
  acceptanceRate?: string;
  program: string;
  deadline?: string;
  scholarship?: boolean;
  rank?: number;
};

function safeGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function getStoredProfile(): StoredProfile | null {
  // Try both key formats
  const v = safeGet<StoredProfile>("profile");
  if (v) return v;
  // Legacy key used by profile page
  try {
    const raw = localStorage.getItem("studyabroad_user_profile");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: StoredProfile): void {
  safeSet("profile", profile);
  // Also sync legacy key so profile page still works
  try {
    localStorage.setItem("studyabroad_user_profile", JSON.stringify(profile));
  } catch {}
}

// ─── Analysis Result ──────────────────────────────────────────────────────────

export function getStoredAnalysis(): StoredAnalysis | null {
  return safeGet<StoredAnalysis>("analysis");
}

export function saveAnalysis(analysis: StoredAnalysis): void {
  safeSet("analysis", analysis);
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function getStoredSession(): StoredSession | null {
  return safeGet<StoredSession>("session");
}

export function saveSession(session_id: string): void {
  safeSet("session", { session_id, created_at: new Date().toISOString() });
}

// ─── University Matches ───────────────────────────────────────────────────────

export function getStoredMatches(): StoredUniversityMatch[] {
  return safeGet<StoredUniversityMatch[]>("matches") ?? [];
}

export function saveMatches(matches: StoredUniversityMatch[]): void {
  safeSet("matches", matches);
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export function getBookmarks(): number[] {
  return safeGet<number[]>("bookmarks") ?? [];
}

export function toggleBookmark(id: number): boolean {
  const bk = getBookmarks();
  const has = bk.includes(id);
  safeSet("bookmarks", has ? bk.filter((x) => x !== id) : [...bk, id]);
  return !has;
}

// ─── Convenience: load profile as API-shaped payload ─────────────────────────

export function getProfileAsApiPayload(): Record<string, unknown> {
  const p = getStoredProfile();
  if (!p) return {};
  return {
    gpa: p.gpa ?? 3.5,
    gpa_scale: p.gpa_scale ?? 4.0,
    gre_verbal: p.gre_verbal,
    gre_quant: p.gre_quant,
    ielts_score: p.ielts_score,
    toefl_score: p.toefl_score,
    work_experience_years: p.work_experience_years ?? 0,
    research_papers: p.research_papers ?? 0,
    target_countries: p.target_countries ?? ["USA", "Germany"],
    target_programs: p.target_programs ?? ["Computer Science"],
    target_degree: p.target_degree ?? "Master's",
    budget_usd: p.budget_usd,
    full_name: p.full_name,
    current_degree: p.current_degree,
    projects: p.projects,
    achievements: p.achievements,
  };
}
