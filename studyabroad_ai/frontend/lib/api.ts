/**
 * StudyAbroad.AI — API Client (BFF pattern via Next.js proxy)
 * All API calls go through Next.js /api/[...path] proxy to avoid CORS.
 * The proxy forwards to Python FastAPI backend at localhost:8000.
 */

// Use the BFF proxy (same origin) — avoids all CORS issues
const BFF_BASE = "";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("/api/") ? path : `/api${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(`${BFF_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${url} failed (${res.status}): ${err}`);
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
  publications?: number;
  projects?: number;
  target_countries?: string[];
  target_programs?: string[];
  budget_usd?: number;
  budget_usd_per_year?: number;
  degree_level?: string;
  field_of_study?: string;
  scholarship_required?: boolean;
}

export interface ProfileAnalysisResult {
  session_id: string;
  completeness_score: number;
  overall_score: number;
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  tier_guidance?: Record<string, string>;
  action_plan?: string[];
  target_countries?: string[];
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
  reasoning?: string;
}

export async function matchUniversities(profile: ProfileInput): Promise<{ matches: UniversityMatch[]; total: number }> {
  return apiFetch<{ matches: UniversityMatch[]; total: number }>("/api/v1/universities/match", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

export async function searchUniversities(query: string, limit = 20): Promise<{ results: UniversityMatch[]; count: number }> {
  return apiFetch<{ results: UniversityMatch[]; count: number }>(`/api/v1/universities/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

// ── SOP Generation ───────────────────────────────────────────────────────────

export interface SOPRequest {
  university?: string;
  university_name?: string;
  program?: string;
  program_name?: string;
  profile?: ProfileInput;
  profile_summary?: string;
  template?: "general" | "research" | "industry" | "scholarship";
  target_professor?: string;
  word_limit?: number;
  tone?: string;
  session_id?: string;
}

export interface SOPResult {
  sop_text: string;
  word_count: number;
  session_id: string;
  model_used: string;
  scores?: Record<string, number>;
}

export async function generateSOP(data: SOPRequest): Promise<SOPResult> {
  return apiFetch<SOPResult>("/api/v1/sop/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refineSOP(sessionId: string, instruction: string, sopText?: string, university?: string, program?: string): Promise<SOPResult> {
  return apiFetch<SOPResult>("/api/v1/sop/refine", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, instruction, sop_text: sopText, university, program }),
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
  match_score?: number;
  tips?: string;
}

export async function getScholarships(profile: ProfileInput): Promise<{ scholarships: Scholarship[] }> {
  return apiFetch<{ scholarships: Scholarship[] }>("/api/v1/scholarships/match", {
    method: "POST",
    body: JSON.stringify({ profile, top_n: 10 }),
  });
}

// ── Email Draft ──────────────────────────────────────────────────────────────

export interface EmailDraftRequest {
  profile?: ProfileInput;
  email_type?: "professor" | "scholarship" | "inquiry";
  professor_name?: string;
  professor_research?: string;
  university_name?: string;
  program_name?: string;
  scholarship_name?: string;
  country?: string;
  word_limit?: number;
}

export interface EmailDraftResult {
  subject?: string;
  body?: string;
  email_text?: string;
  word_count?: number;
}

export async function draftEmail(data: EmailDraftRequest): Promise<EmailDraftResult> {
  return apiFetch<EmailDraftResult>("/api/v1/email/draft", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Visa Guide ───────────────────────────────────────────────────────────────

export interface VisaGuide {
  country: string;
  visa_type: string;
  key_requirements: string[];
  required_documents: string[];
  financial_requirements: string;
  processing_time: string;
  post_study_work?: string;
}

export async function getVisaGuide(country: string): Promise<VisaGuide> {
  return apiFetch<VisaGuide>(`/api/v1/visa/guide/${encodeURIComponent(country)}`);
}

export async function getVisaCountries(): Promise<{ countries: string[] }> {
  return apiFetch<{ countries: string[] }>("/api/v1/visa/countries");
}

// ── City Life ────────────────────────────────────────────────────────────────

export interface CityLifeData {
  city: string;
  country: string;
  total_monthly_min_usd: number;
  total_monthly_avg_usd: number;
  breakdown: Record<string, number>;
}

export async function getCityInfo(city: string): Promise<CityLifeData> {
  return apiFetch<CityLifeData>(`/api/v1/city/${encodeURIComponent(city)}`);
}

// ── Career ROI ───────────────────────────────────────────────────────────────

export interface CareerROI {
  estimated_starting_salary_usd?: number;
  payback_months?: number;
  roi_pct?: number;
  post_study_work_rights?: string;
}

export async function getCareerROI(data: {
  profile?: ProfileInput;
  university_name?: string;
  country?: string;
  annual_tuition_usd?: number;
  program_duration_years?: number;
}): Promise<CareerROI> {
  return apiFetch<CareerROI>("/api/v1/career/roi", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Document Audit ───────────────────────────────────────────────────────────

export async function auditDocuments(data: {
  profile?: ProfileInput;
  target_countries?: string[];
  existing_documents?: string[];
}): Promise<{
  readiness_pct?: number;
  country_audits?: Record<string, unknown>;
  missing_documents?: string[];
}> {
  return apiFetch("/api/v1/documents/audit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export async function sendChat(message: string, sessionId: string): Promise<{ response: string; session_id: string }> {
  return apiFetch<{ response: string; session_id: string }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId }),
  });
}

// ── System Health ────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: string;
  version: string;
  free_llm_apis?: Record<string, { configured: boolean; cost?: string }>;
  own_tools?: Record<string, unknown>;
  llm_usage?: Record<string, unknown>;
  sessions_active?: number;
  timestamp: string;
}

export async function getHealth(): Promise<HealthStatus> {
  return apiFetch<HealthStatus>("/api/health");
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_requests: number;
  active_sessions: number;
  llm_usage: Record<string, unknown>;
  vector_store: Record<string, unknown>;
  agents_status: Record<string, string>;
}

export async function getAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>("/api/health");
}

export async function triggerScrape(type: "universities" | "scholarships", countries?: string[]): Promise<{ message: string; session_id: string }> {
  return apiFetch<{ message: string; session_id: string }>("/api/scrape/universities", {
    method: "POST",
    body: JSON.stringify({ countries, limit_per_country: 5 }),
  });
}
