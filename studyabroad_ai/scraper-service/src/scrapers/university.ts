/**
 * University Page Parser — extracts structured data from raw HTML
 */

import { logger } from '../logger';

export interface UniversityData {
  name?: string;
  url: string;
  country?: string;
  world_ranking?: number;
  programs?: ProgramData[];
  requirements?: AdmissionRequirements;
  deadlines?: Deadline[];
  tuition_usd?: number;
  scholarships_available?: boolean;
  raw_text?: string; // Sent to Python for AI extraction
}

export interface ProgramData {
  name: string;
  degree: string;
  duration?: string;
  department?: string;
}

export interface AdmissionRequirements {
  gpa_min?: number;
  ielts_min?: number;
  toefl_min?: number;
  gre_required?: boolean;
  gre_min_quant?: number;
  gre_min_verbal?: number;
}

export interface Deadline {
  program?: string;
  type: 'fall' | 'spring' | 'rolling';
  date?: string;
}

/**
 * Parse HTML into structured university data.
 * Extracts what it can via regex/DOM patterns.
 * The rest is sent as raw_text to Python for LLM extraction.
 */
export async function parseUniversityPage(
  html: string,
  url: string,
  metadata: Record<string, any> = {}
): Promise<UniversityData> {
  // Strip HTML tags for text extraction
  const rawText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50000); // Cap at 50K chars for MongoDB storage

  // Try to extract basic info via patterns
  const data: UniversityData = {
    url,
    raw_text: rawText, // Python AI will extract structured data from this
    ...metadata,
  };

  // Extract GPA requirements (pattern: "minimum GPA of X.X" or "GPA: X.X")
  const gpaMatch = rawText.match(/(?:minimum\s+)?GPA\s*(?:of|:)?\s*([0-9]\.[0-9])/i);
  if (gpaMatch) data.requirements = { ...data.requirements, gpa_min: parseFloat(gpaMatch[1]) };

  // Extract IELTS (pattern: "IELTS X.X" or "IELTS score of X.X")
  const ieltsMatch = rawText.match(/IELTS\s*(?:score\s*of\s*)?([0-9]\.?[0-9]?)/i);
  if (ieltsMatch) data.requirements = { ...data.requirements, ielts_min: parseFloat(ieltsMatch[1]) };

  // Extract TOEFL
  const toeflMatch = rawText.match(/TOEFL\s*(?:iBT\s*)?(?:score\s*of\s*)?([0-9]{2,3})/i);
  if (toeflMatch) data.requirements = { ...data.requirements, toefl_min: parseInt(toeflMatch[1]) };

  // Extract tuition (pattern: "$XX,XXX per year")
  const tuitionMatch = rawText.match(/\$([0-9,]+)\s*(?:per\s*year|annually)/i);
  if (tuitionMatch) data.tuition_usd = parseInt(tuitionMatch[1].replace(/,/g, ''));

  logger.debug(`[Parser] Parsed ${url}: GPA=${data.requirements?.gpa_min}, IELTS=${data.requirements?.ielts_min}`);

  return data;
}
