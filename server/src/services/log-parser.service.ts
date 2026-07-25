/**
 * Log parser — turns a free-form voice/text note into structured, category-
 * routed data for logging (diet + symptoms + medications + mood).
 *
 * Primary path: OpenAI (accurate for arbitrary foods, times, cross-category).
 * Fallback:     the dictionary NLP service + regex (works with no API key).
 *
 * Example input:
 *   "I had mac and cheese at 12pm, felt kinda nauseous after, taking digene"
 * →
 *   diet: { food: "mac and cheese", mealType: "Lunch", time: "12:00",
 *           reaction: "negative", notes: "felt nauseous after" }
 *   symptoms: [{ name: "nausea", severity: 4, ... }]
 *   medications: [{ name: "digene", dose: null, ... }]
 */

import OpenAI from 'openai';
import { analyzeText } from './nlp.service';

export interface ParsedDiet {
  food: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Beverage';
  time: string; // "HH:MM" 24h, or ""
  reaction: 'positive' | 'negative' | 'neutral';
  notes: string;
}

export interface ParsedSymptom {
  name: string;
  severity: number | null;
  bodyPart: string | null;
  notes: string;
}

export interface ParsedMedication {
  name: string;
  dose: string | null;
  notes: string;
}

export interface ParsedLog {
  diet: ParsedDiet | null;
  symptoms: ParsedSymptom[];
  medications: ParsedMedication[];
  mood: number | null;
  summary: string;
  transcript: string;
  usedAI: boolean;
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage'];

const SYSTEM_PROMPT = `You are a health-logging assistant. Extract structured data from a user's spoken note about food, symptoms, medications and mood. Respond ONLY with a JSON object with this exact shape:

{
  "diet": { "food": string, "mealType": "Breakfast"|"Lunch"|"Dinner"|"Snack"|"Beverage", "time": "HH:MM" 24-hour or "", "reaction": "positive"|"negative"|"neutral", "notes": string } | null,
  "symptoms": [ { "name": string, "severity": integer 1-10 or null, "bodyPart": string or null, "notes": string } ],
  "medications": [ { "name": string, "dose": string or null, "notes": string } ],
  "mood": integer 1-10 or null,
  "summary": string
}

Rules:
- diet: set only if they mention eating/drinking. "food" is the actual item(s) said, verbatim (e.g. "mac and cheese"). Infer mealType from the food and time. Convert spoken times to 24h "HH:MM": "12pm"/"noon" -> "12:00", "8am" -> "08:00", "7 in the evening" -> "19:00". "reaction" reflects how they felt after eating: nausea/pain/bloating -> "negative", energized/fine/good -> "positive", otherwise "neutral".
- symptoms: any physical or mental symptom mentioned. Normalize ("nauseous" -> "nausea"). severity from words (mild=3, moderate=5, severe=8) or a stated number.
- medications: any medicine, drug or supplement mentioned (e.g. "digene", "ibuprofen 200mg"), with dose if stated.
- mood: overall mood 1-10 only if clearly expressed, else null.
- Use [] for empty arrays, null for an absent diet or mood. Never invent data that is not in the note.`;

// ── OpenAI path ──────────────────────────────────────────────────────────────

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

async function parseWithOpenAI(text: string): Promise<ParsedLog> {
  const resp = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ],
  });

  const raw = resp.choices[0]?.message?.content ?? '{}';
  const data = JSON.parse(raw);
  return normalise(data, text, true);
}

// ── Dictionary fallback (no API key) ─────────────────────────────────────────

function extractTime(text: string): string {
  const t = text.toLowerCase();
  if (/\bnoon\b|\bmidday\b/.test(t)) return '12:00';
  if (/\bmidnight\b/.test(t)) return '00:00';
  // "12:30", "8:15 am"
  let m = t.match(/\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/);
  if (m) {
    let h = Number(m[1]);
    const min = m[2];
    if (m[3] === 'pm' && h < 12) h += 12;
    if (m[3] === 'am' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${min}`;
  }
  // "12pm", "8 am", "at 7"
  m = t.match(/\b(\d{1,2})\s*(am|pm)\b/);
  if (m) {
    let h = Number(m[1]);
    if (m[2] === 'pm' && h < 12) h += 12;
    if (m[2] === 'am' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:00`;
  }
  return '';
}

function extractFoodPhrase(text: string): string {
  // Capture the phrase after ate/had/eating/drank, up to a clause boundary.
  const m = text.match(
    /\b(?:ate|had|eating|having|drank|drinking|ate some|had some)\s+(.+?)(?:[.,;]| and (?:i|then|felt|feeling)| at \d| for | before | after |$)/i
  );
  return m ? m[1].trim() : '';
}

function guessMeal(time: string): ParsedDiet['mealType'] {
  if (!time) return 'Snack';
  const h = Number(time.slice(0, 2));
  if (h < 11) return 'Breakfast';
  if (h < 15) return 'Lunch';
  if (h < 21) return 'Dinner';
  return 'Snack';
}

function parseWithDictionary(text: string): ParsedLog {
  const nlp = analyzeText(text);
  const time = extractTime(text);

  const foodPhrase = extractFoodPhrase(text) || nlp.foods.join(', ');
  const reaction: ParsedDiet['reaction'] =
    nlp.sentiment === 'negative' ? 'negative'
    : nlp.sentiment === 'positive' ? 'positive'
    : 'neutral';

  const diet: ParsedDiet | null = foodPhrase
    ? { food: foodPhrase, mealType: guessMeal(time), time, reaction, notes: '' }
    : null;

  const symptoms: ParsedSymptom[] = nlp.symptoms.map((name) => ({
    name,
    severity: nlp.severity,
    bodyPart: nlp.bodyParts[0] ?? null,
    notes: '',
  }));

  const medications: ParsedMedication[] = nlp.medications.map((m) => ({
    name: m.name,
    dose: m.dose,
    notes: '',
  }));

  return {
    diet,
    symptoms,
    medications,
    mood: null,
    summary: '',
    transcript: text,
    usedAI: false,
  };
}

// ── Normalisation / validation ───────────────────────────────────────────────

function normalise(data: any, transcript: string, usedAI: boolean): ParsedLog {
  const clampSev = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 1 && n <= 10 ? Math.round(n) : null;
  };

  let diet: ParsedDiet | null = null;
  if (data?.diet && typeof data.diet.food === 'string' && data.diet.food.trim()) {
    const mealType = MEAL_TYPES.includes(data.diet.mealType) ? data.diet.mealType : 'Snack';
    const reaction = ['positive', 'negative', 'neutral'].includes(data.diet.reaction)
      ? data.diet.reaction : 'neutral';
    const time = typeof data.diet.time === 'string' && /^\d{2}:\d{2}$/.test(data.diet.time)
      ? data.diet.time : '';
    diet = {
      food: data.diet.food.trim(),
      mealType,
      reaction,
      time,
      notes: typeof data.diet.notes === 'string' ? data.diet.notes : '',
    };
  }

  const symptoms: ParsedSymptom[] = Array.isArray(data?.symptoms)
    ? data.symptoms
        .filter((s: any) => s && typeof s.name === 'string' && s.name.trim())
        .map((s: any) => ({
          name: s.name.trim(),
          severity: clampSev(s.severity),
          bodyPart: typeof s.bodyPart === 'string' ? s.bodyPart : null,
          notes: typeof s.notes === 'string' ? s.notes : '',
        }))
    : [];

  const medications: ParsedMedication[] = Array.isArray(data?.medications)
    ? data.medications
        .filter((m: any) => m && typeof m.name === 'string' && m.name.trim())
        .map((m: any) => ({
          name: m.name.trim(),
          dose: typeof m.dose === 'string' && m.dose.trim() ? m.dose.trim() : null,
          notes: typeof m.notes === 'string' ? m.notes : '',
        }))
    : [];

  return {
    diet,
    symptoms,
    medications,
    mood: clampSev(data?.mood),
    summary: typeof data?.summary === 'string' ? data.summary : '',
    transcript,
    usedAI,
  };
}

// ── Public entrypoint ────────────────────────────────────────────────────────

export async function parseLog(text: string): Promise<ParsedLog> {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await parseWithOpenAI(text);
    } catch {
      // Fall back to the dictionary parser on any OpenAI failure.
    }
  }
  return parseWithDictionary(text);
}
