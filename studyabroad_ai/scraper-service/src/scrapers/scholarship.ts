/**
 * Scholarship Page Parser
 */
export interface ScholarshipData {
  url: string;
  name?: string;
  amount_usd?: number;
  deadline?: string;
  eligibility?: string;
  country?: string;
  level?: 'undergraduate' | 'graduate' | 'phd' | 'any';
  raw_text?: string; // Sent to Python for LLM extraction
}

export async function parseScholarshipPage(html: string, url: string): Promise<ScholarshipData> {
  const rawText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 30000);

  const data: ScholarshipData = { url, raw_text: rawText };

  // Extract scholarship amount
  const amountMatch = rawText.match(/\$([0-9,]+)\s*(?:per\s*year|annually|award|scholarship)/i);
  if (amountMatch) data.amount_usd = parseInt(amountMatch[1].replace(/,/g, ''));

  // Extract deadline
  const deadlineMatch = rawText.match(/deadline[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i);
  if (deadlineMatch) data.deadline = deadlineMatch[1];

  return data;
}
