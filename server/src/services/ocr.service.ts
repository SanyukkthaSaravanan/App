/**
 * Flaire OCR Service
 *
 * 1. Accepts a base64-encoded image (JPEG / PNG / WebP).
 * 2. Runs Tesseract.js (LSTM engine, English) to extract raw text.
 * 3. Tries three matching strategies in order of reliability:
 *      a. Direct substring match — catches exact/near-exact hits from clean OCR
 *      b. N-gram fuzzy search   — handles OCR typos (1-, 2-, 3-word windows)
 *      c. Token-level fuzzy     — last resort for very garbled text
 * 4. Extracts a dose string (e.g. "200mg", "500 mg") from the surrounding text.
 * 5. Returns a ranked list of medication candidates.
 */

import Tesseract from 'tesseract.js';
import Fuse from 'fuse.js';
import path from 'path';
import fs from 'fs';

// ── Types ──────────────────────────────────────────────────────────────────────

interface MedEntry {
  name: string;
  generic: string;
  category: string;
}

export interface OCRMedResult {
  rawText: string;
  matches: Array<{
    name: string;
    generic: string;
    category: string;
    score: number; // 0–1, higher = better
    dose: string | null;
  }>;
}

// ── Load medication dataset ────────────────────────────────────────────────────

const DATA_PATH = path.join(__dirname, '../data/medications.json');
let _dataset: MedEntry[] | null = null;

function getDataset(): MedEntry[] {
  if (!_dataset) {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    _dataset = JSON.parse(raw) as MedEntry[];
  }
  return _dataset;
}

// ── Fuse.js fuzzy searcher ─────────────────────────────────────────────────────
// Threshold 0.55 → tolerates ~1-2 character OCR errors per word while avoiding
// too many false positives.

let _fuse: Fuse<MedEntry> | null = null;

function getFuse(): Fuse<MedEntry> {
  if (!_fuse) {
    _fuse = new Fuse(getDataset(), {
      keys: ['name', 'generic'],
      threshold: 0.55,
      includeScore: true,
      minMatchCharLength: 3,
      ignoreLocation: true,
      useExtendedSearch: false,
    });
  }
  return _fuse;
}

// ── Text utilities ─────────────────────────────────────────────────────────────

function normalise(s: string): string {
  return s
    .toLowerCase()
    // OCR commonly confuses 0↔O, 1↔l↔I — normalise for substring checks
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract all clean words from OCR text */
function extractWords(raw: string): string[] {
  return raw
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, '').trim())
    .filter((w) => w.length >= 3);
}

/**
 * Generate sliding n-gram windows (n = 1, 2, 3 words) from an array of words.
 * E.g. ["Folic", "Acid", "200mg"] → ["Folic", "Folic Acid", "Folic Acid 200mg",
 *                                     "Acid", "Acid 200mg", "200mg"]
 */
function ngrams(words: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    for (let n = 1; n <= 3; n++) {
      if (i + n > words.length) break;
      out.push(words.slice(i, i + n).join(' '));
    }
  }
  return out;
}

// ── Dose extraction ────────────────────────────────────────────────────────────

function extractDose(rawText: string, medName: string): string | null {
  // Look for a dose within 80 characters after the med name
  const escaped = medName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nearPattern = new RegExp(
    `${escaped}[\\s\\S]{0,80}?(\\d+(?:\\.\\d+)?\\s*(?:mg|mcg|g|ml|milligrams?|micrograms?|units?))`,
    'i'
  );
  const near = rawText.match(nearPattern);
  if (near) return near[1].trim();

  // Fallback: any dose-like string anywhere in the text
  const any = rawText.match(/\b(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|milligrams?|micrograms?))\b/i);
  return any ? any[1].trim() : null;
}

// ── Main OCR pipeline ──────────────────────────────────────────────────────────

export async function scanMedicationImage(base64Image: string): Promise<OCRMedResult> {
  // Strip data-URL prefix if present
  const imageData = base64Image.replace(/^data:image\/[a-z+]+;base64,/, '');
  const buffer = Buffer.from(imageData, 'base64');

  // Run Tesseract with sparse-text page-seg mode (good for labels/packages)
  const { data: { text: rawText } } = await Tesseract.recognize(buffer, 'eng', {
    logger: () => {},
  } as any);

  const dataset = getDataset();
  const fuse = getFuse();
  const normRaw = normalise(rawText);
  const seen = new Set<string>();
  const results: OCRMedResult['matches'] = [];

  const addMatch = (item: MedEntry, score: number) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    results.push({
      name: item.name,
      generic: item.generic,
      category: item.category,
      score,
      dose: extractDose(rawText, item.name),
    });
  };

  // ── Strategy 1: Direct substring match ──────────────────────────────────────
  // Check whether each medication name appears literally in the OCR output.
  // This is the most reliable path when Tesseract reads the label cleanly.
  for (const entry of dataset) {
    const normName = normalise(entry.name);
    const normGeneric = normalise(entry.generic);
    if (normRaw.includes(normName) || normRaw.includes(normGeneric)) {
      addMatch(entry, 1.0);
    }
  }

  // ── Strategy 2: N-gram fuzzy search ──────────────────────────────────────────
  // Slide a 1-/2-/3-word window over the OCR words and fuzzy-match each window.
  if (results.length === 0) {
    const words = extractWords(rawText);
    const grams = [...new Set(ngrams(words))]; // deduplicate

    for (const gram of grams) {
      if (gram.length < 3) continue;
      const hits = fuse.search(gram, { limit: 1 });
      if (!hits.length) continue;
      const top = hits[0];
      addMatch(top.item, 1 - (top.score ?? 0.5));
    }
  }

  // ── Strategy 3: Full-line fuzzy ───────────────────────────────────────────────
  // If still nothing, run each non-empty OCR line through Fuse directly.
  if (results.length === 0) {
    const lines = rawText
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter((l) => l.length >= 4);

    for (const line of lines) {
      const hits = fuse.search(line, { limit: 1 });
      if (!hits.length) continue;
      const top = hits[0];
      addMatch(top.item, 1 - (top.score ?? 0.6));
    }
  }

  // Sort best match first
  results.sort((a, b) => b.score - a.score);

  return { rawText: rawText.trim(), matches: results.slice(0, 5) };
}
