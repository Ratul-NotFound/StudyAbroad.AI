/**
 * StudyAbroad.AI — FastAPI Client (BFF pattern)
 * All API calls go through Next.js BFF routes to avoid CORS issues.
 * Fallback directly to Python backend if BFF is unavailable.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${err}`);
  }
  return res.json() as Promise<T>;
}

// ── Profile ─────────────────────────────────────────────────────────────────

export interface ProfileInput {
  gpa: number;
  gpa_scale?: number;
  gre_verbal?: number;
  gre_quant?: number;
  gre_aw?: number;
  ielts_score?: number;
  toefl_score?: number;
  work_experience_years?: number;
  research_papers?: number;
  projects?: number;
  target_countries?: string[];
  target_programs?: string[];
  budget_usd?: number;
}

export interface ProfileAnalysisResult {
  completeness_score: number;
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  llm_analysis?: string;
}

export async function analyzeProfile(data: ProfileInput): Promise<ProfileAnalysisResult> {
  return apiFetch<ProfileAnalysisResult>("/api/v1/profile/analyze", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── University Matching ──────────────────────────────────────────────────────

export interface UniversityMatch {
  university_id: number;
  name: string;
  country: string;
  match_score: number;
  tier: "Reach" | "Match" | "Safe";
  program: string;
  tuition_annual: number;
  rank: number;
  deadline: string;
  requirements: {
    min_gpa: number;
    min_ielts?: number;
    min_toefl?: number;
    min_gre?: number;
  };
  scholarship_available: boolean;
}

export async function matchUniversities(profile: ProfileInput): Promise<{ matches: UniversityMatch[] }> {
  return apiFetch<{ matches: UniversityMatch[] }>("/api/v1/universities/match", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

export async function searchUniversities(query: string, limit = 20): Promise<{ results: UniversityMatch[] }> {
  return apiFetch<{ results: UniversityMatch[] }>(`/api/v1/universities/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

// ── SOP Generation ───────────────────────────────────────────────────────────

export interface SOPRequest {
  university: string;
  program: string;
  profile_summary: string;
  template?: "general" | "research" | "industry" | "scholarship";
  target_professor?: string;
  word_limit?: number;
}

export interface SOPResult {
  sop_text: string;
  word_count: number;
  session_id: string;
  model_used: string;
}

export async function generateSOP(data: SOPRequest): Promise<SOPResult> {
  return apiFetch<SOPResult>("/api/v1/sop/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refineSOP(sessionId: string, instruction: string): Promise<SOPResult> {
  return apiFetch<SOPResult>("/api/v1/sop/refine", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, instruction }),
  });
}

// ── Scholarships ─────────────────────────────────────────────────────────────

export interface Scholarship {
  id: number;
  name: string;
  provider: string;
  amount_usd: number;
  deadline: string;
  eligibility: string[];
  countries: string[];
  programs: string[];
  url: string;
}

export async function getScholarships(profile: ProfileInput): Promise<{ scholarships: Scholarship[] }> {
  return apiFetch<{ scholarships: Scholarship[] }>("/api/v1/scholarships/match", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

// ── System Health ────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: string;
  version: string;
  llm_available: boolean;
  vector_store_ready: boolean;
  active_agents: number;
  timestamp: string;
}

export async function getHealth(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>("/health");
}
