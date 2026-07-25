/**
 * Flaire NLP Service
 *
 * Extracts structured health data from free text (voice notes, chat messages,
 * typed entries). Uses the `compromise` library for entity recognition plus
 * hand-crafted medical terminology dictionaries for autoimmune / chronic-illness
 * specific vocabulary.
 */

// @ts-ignore — compromise ships CJS; types available via @types/compromise
import nlp from 'compromise';

// ─── Dictionaries ──────────────────────────────────────────────────────────────

const BODY_PARTS: Record<string, string> = {
  // Head & neck
  head: 'head', skull: 'head', scalp: 'head',
  jaw: 'jaw', tmj: 'jaw',
  neck: 'neck', cervical: 'neck',
  // Spine
  back: 'back', spine: 'back', spinal: 'back',
  'upper back': 'upper-back', 'lower back': 'lower-back', lumbar: 'lower-back', sacrum: 'lower-back',
  // Shoulders
  shoulder: 'shoulder', 'left shoulder': 'left-shoulder', 'right shoulder': 'right-shoulder',
  // Arms
  elbow: 'elbow', 'left elbow': 'left-elbow', 'right elbow': 'right-elbow',
  forearm: 'forearm', arm: 'arm',
  wrist: 'wrist', 'left wrist': 'left-wrist', 'right wrist': 'right-wrist',
  hand: 'hand', 'left hand': 'left-hand', 'right hand': 'right-hand',
  finger: 'fingers', fingers: 'fingers', knuckle: 'fingers', knuckles: 'fingers',
  thumb: 'fingers',
  // Hips & legs
  hip: 'hip', 'left hip': 'left-hip', 'right hip': 'right-hip', pelvis: 'hip',
  thigh: 'thigh', groin: 'hip',
  knee: 'knee', 'left knee': 'left-knee', 'right knee': 'right-knee', kneecap: 'knee',
  calf: 'lower-leg', shin: 'lower-leg', leg: 'leg',
  ankle: 'ankle', 'left ankle': 'left-ankle', 'right ankle': 'right-ankle',
  foot: 'foot', feet: 'foot', toe: 'foot', toes: 'foot', heel: 'foot',
  // Torso / organs
  chest: 'chest', sternum: 'chest', rib: 'ribs', ribs: 'ribs',
  abdomen: 'abdomen', stomach: 'abdomen', belly: 'abdomen',
  'hip flexor': 'hip',
};

const SYMPTOMS: string[] = [
  'pain', 'ache', 'aching', 'hurt', 'hurts', 'hurting', 'sore', 'soreness',
  'swelling', 'swollen', 'inflamed', 'inflammation',
  'stiffness', 'stiff', 'tight', 'tightness',
  'fatigue', 'tired', 'exhausted', 'exhaustion', 'weakness', 'weak',
  'brain fog', 'fog', 'fuzzy', 'confusion', 'forgetful',
  'nausea', 'nauseous', 'vomiting', 'sick',
  'numbness', 'numb', 'tingling', 'pins and needles',
  'burning', 'hot', 'warm', 'heat',
  'redness', 'red', 'rash',
  'itching', 'itchy',
  'dizziness', 'dizzy', 'lightheaded',
  'headache', 'migraine',
  'insomnia', 'sleep',
  'shortness of breath', 'breathless', 'breathing',
  'palpitations', 'heart racing',
  'dry eyes', 'dry mouth', 'mouth sores',
  'hair loss',
  'depression', 'anxiety', 'mood',
];

const SEVERITY_WORDS: Record<string, number> = {
  // Mild
  mild: 2, slight: 2, minor: 2, little: 2, tiny: 2, manageable: 3, 'barely noticeable': 1,
  // Moderate
  moderate: 5, medium: 5, some: 4, noticeable: 5, significant: 6,
  // Severe
  severe: 8, bad: 7, terrible: 9, awful: 9, horrible: 9, intense: 8,
  strong: 7, extreme: 9, excruciating: 10, unbearable: 10, worst: 10,
  overwhelming: 9, serious: 8, rough: 7,
};

const MEDICATIONS: string[] = [
  // DMARDs
  'methotrexate', 'hydroxychloroquine', 'plaquenil', 'sulfasalazine', 'leflunomide',
  'azathioprine', 'mycophenolate', 'cyclophosphamide', 'tacrolimus',
  // Biologics
  'adalimumab', 'humira', 'etanercept', 'enbrel', 'infliximab', 'remicade',
  'rituximab', 'tocilizumab', 'abatacept', 'belimumab', 'benlysta',
  'secukinumab', 'cosentyx', 'ustekinumab', 'stelara', 'ixekizumab',
  // JAK inhibitors
  'tofacitinib', 'xeljanz', 'baricitinib', 'olumiant', 'upadacitinib', 'rinvoq',
  // Steroids
  'prednisone', 'prednisolone', 'methylprednisolone', 'medrol', 'cortisone', 'dexamethasone',
  // NSAIDs
  'ibuprofen', 'naproxen', 'celecoxib', 'celebrex', 'diclofenac', 'indomethacin',
  'meloxicam', 'aspirin',
  // Supplements
  'folic acid', 'vitamin d', 'calcium', 'omega 3', 'fish oil', 'turmeric',
  // Other common
  'gabapentin', 'lyrica', 'tramadol', 'duloxetine', 'cymbalta',
  'amitriptyline', 'cyclobenzaprine',
];

const FOODS: string[] = [
  'gluten', 'dairy', 'wheat', 'sugar', 'alcohol', 'caffeine', 'coffee',
  'nightshades', 'tomato', 'tomatoes', 'pepper', 'peppers', 'potato', 'potatoes',
  'eggplant', 'red meat', 'processed food', 'fried food', 'soy',
  'bread', 'pasta', 'rice', 'cheese', 'milk', 'chocolate',
  'wine', 'beer', 'citrus', 'orange', 'lemon',
  'salad', 'vegetables', 'fruit', 'soup', 'oatmeal',
  'salmon', 'fish', 'chicken', 'eggs',
];

// ─── Helper utilities ──────────────────────────────────────────────────────────

function normalise(text: string): string {
  return text.toLowerCase().replace(/['']/g, "'").replace(/\s+/g, ' ').trim();
}

function extractNumbers(text: string): number[] {
  const matches = text.match(/\b(\d+(?:\.\d+)?)\b/g);
  return (matches ?? []).map(Number);
}

function scoreInRange(n: number, min: number, max: number): boolean {
  return n >= min && n <= max;
}

// ─── Main analysis function ────────────────────────────────────────────────────

export interface NLPResult {
  bodyParts: string[];
  symptoms: string[];
  severity: number | null;
  severityLabel: string | null;
  medications: Array<{ name: string; dose: string | null }>;
  foods: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  intent: 'log_symptom' | 'log_medication' | 'log_diet' | 'log_mood' | 'general';
  rawEntities: string[];
}

export function analyzeText(rawText: string): NLPResult {
  const text = normalise(rawText);
  const doc = nlp(rawText);

  // ── Body parts ─────────────────────────────────────────────────────────────
  const foundBodyParts = new Set<string>();

  // Check multi-word phrases first (e.g. "lower back", "left knee")
  for (const phrase of Object.keys(BODY_PARTS).sort((a, b) => b.length - a.length)) {
    if (text.includes(phrase)) {
      foundBodyParts.add(BODY_PARTS[phrase]);
    }
  }

  // ── Symptoms ───────────────────────────────────────────────────────────────
  const foundSymptoms = new Set<string>();
  for (const sym of SYMPTOMS) {
    if (text.includes(sym)) {
      foundSymptoms.add(sym);
    }
  }

  // ── Severity ───────────────────────────────────────────────────────────────
  let severity: number | null = null;
  let severityLabel: string | null = null;

  // Numeric mentions: "pain level 7", "7 out of 10", "7/10"
  const numericPatterns = [
    /(?:pain|severity|level|score|rate)[\s:]*(\d+)/,
    /(\d+)\s*(?:out of|\/)\s*10/,
    /(\d+)\/10/,
    /level\s*(\d+)/,
  ];

  for (const pattern of numericPatterns) {
    const m = text.match(pattern);
    if (m) {
      const n = Number(m[1]);
      if (scoreInRange(n, 1, 10)) { severity = n; break; }
    }
  }

  // Standalone number in range 1-10 (if no pattern matched)
  if (severity === null) {
    const nums = extractNumbers(text).filter((n) => scoreInRange(n, 1, 10));
    if (nums.length === 1) severity = nums[0];
  }

  // Word-based severity
  for (const [word, score] of Object.entries(SEVERITY_WORDS)) {
    if (text.includes(word)) {
      severityLabel = word;
      if (severity === null) severity = score;
      break;
    }
  }

  // ── Medications ────────────────────────────────────────────────────────────
  const foundMeds: Array<{ name: string; dose: string | null }> = [];

  for (const med of MEDICATIONS) {
    if (text.includes(med)) {
      // Try to extract dose e.g. "10mg", "200 mg", "10 milligrams"
      const dosePattern = new RegExp(
        `${med.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s,]*([\\d.]+\\s*(?:mg|mcg|g|ml|milligrams?|micrograms?))?`,
        'i'
      );
      const dm = rawText.toLowerCase().match(dosePattern);
      foundMeds.push({
        name: med,
        dose: dm?.[1]?.trim() ?? null,
      });
    }
  }

  // ── Foods ──────────────────────────────────────────────────────────────────
  const foundFoods = new Set<string>();
  for (const food of FOODS) {
    if (text.includes(food)) foundFoods.add(food);
  }

  // ── Sentiment ──────────────────────────────────────────────────────────────
  const positiveWords = ['better', 'good', 'great', 'improved', 'improving', 'well', 'fine', 'okay', 'manageable', 'relief', 'helped'];
  const negativeWords = ['worse', 'bad', 'terrible', 'awful', 'pain', 'hurt', 'struggling', 'difficult', 'hard', 'rough', 'flare', 'exhausted'];

  const posScore = positiveWords.filter((w) => text.includes(w)).length;
  const negScore = negativeWords.filter((w) => text.includes(w)).length;

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (posScore > negScore) sentiment = 'positive';
  else if (negScore > posScore) sentiment = 'negative';

  // ── Intent classification ──────────────────────────────────────────────────
  const hasSymptomSignal = foundBodyParts.size > 0 || foundSymptoms.size > 0 || severity !== null;
  const hasMedSignal = foundMeds.length > 0 || text.match(/\b(took|taken|take|missed|skipped|dose)\b/);
  const hasDietSignal = foundFoods.size > 0 || text.match(/\b(ate|eaten|eat|meal|breakfast|lunch|dinner|snack|food|drink|drank)\b/);
  const hasMoodSignal = text.match(/\b(feel|feeling|mood|emotion|mental|anxious|depressed|happy|sad|hopeful)\b/);

  let intent: NLPResult['intent'] = 'general';
  if (hasMedSignal) intent = 'log_medication';
  else if (hasDietSignal) intent = 'log_diet';
  else if (hasMoodSignal && !hasSymptomSignal) intent = 'log_mood';
  else if (hasSymptomSignal) intent = 'log_symptom';

  // ── Raw entities (compromise nouns + terms) ────────────────────────────────
  const rawEntities: string[] = doc.nouns().out('array').slice(0, 10);

  return {
    bodyParts: [...foundBodyParts],
    symptoms: [...foundSymptoms],
    severity,
    severityLabel,
    medications: foundMeds,
    foods: [...foundFoods],
    sentiment,
    intent,
    rawEntities,
  };
}
