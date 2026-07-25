/**
 * Flaire API client
 * All HTTP communication with the backend goes through here.
 * Token is stored in localStorage under 'flaireToken'.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// ── Token helpers ──────────────────────────────────────────────────────────────
export const token = {
  get: () => localStorage.getItem('flaireToken'),
  set: (t: string) => localStorage.setItem('flaireToken', t),
  clear: () => localStorage.removeItem('flaireToken'),
};

// ── Core fetch wrapper ─────────────────────────────────────────────────────────
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: { auth?: boolean } = { auth: true },
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.auth !== false) {
    const t = token.get();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let msg = `${method} ${path} → ${res.status}`;
    try { msg = (await res.json()).error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

const get  = <T>(path: string) => request<T>('GET', path);
const post = <T>(path: string, body: unknown) => request<T>('POST', path, body);
const del  = <T>(path: string) => request<T>('DELETE', path);

// ── Auth ───────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const auth = {
  login: (email: string, password: string) =>
    post<AuthResponse>('/api/auth/login', { email, password }),
  register: (email: string, username: string, password: string, firstName?: string, lastName?: string) =>
    post<AuthResponse>('/api/auth/register', { email, username, password, firstName, lastName }),
  me: () => get<{ user: AuthUser }>('/api/auth/me'),
};

// ── Symptoms ───────────────────────────────────────────────────────────────────
export interface SymptomEntry {
  id: string;
  bodyPart: string | null;
  bodyPartName: string | null;
  symptoms: string[];
  severity: number;
  notes?: string;
  view?: string | null;
  loggedAt: string;
}

export const symptoms = {
  list: () => get<SymptomEntry[]>('/api/symptoms'),
  create: (data: Omit<SymptomEntry, 'id' | 'loggedAt'> & { loggedAt?: string }) =>
    post<SymptomEntry>('/api/symptoms', data),
  remove: (id: string) => del<void>(`/api/symptoms/${id}`),
};

// ── Medications ────────────────────────────────────────────────────────────────
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timesPerDay: number;
  scheduleTimes: string[];
  startDate: string;
  endDate?: string | null;
  color: string;
  notes?: string;
  active: boolean;
  // OCR-derived / provenance fields
  genericName?: string | null;
  drugClass?: string | null;
  category?: string | null;
  prescribedBy?: string | null;
  source?: 'manual' | 'ocr';
  ocrDocumentId?: string | null;
}

export interface MedicationDose {
  id: string;
  medicationId: string;
  scheduledAt: string;
  takenAt: string | null;
  skipped: boolean;
}

// Raw scan provenance saved alongside an OCR-created prescription.
export interface MedicationOcrProvenance {
  rawText: string;
  confidence?: number | null;
  documentType?: string;
  parsedData?: unknown;
  matchCandidates?: unknown;
  confirmedMatch?: unknown;
}

export interface CreateMedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  timesPerDay: number;
  scheduleTimes: string[];
  startDate: string;
  endDate?: string | null;
  color?: string;
  notes?: string;
  genericName?: string | null;
  drugClass?: string | null;
  category?: string | null;
  prescribedBy?: string | null;
  ocr?: MedicationOcrProvenance;
}

export const medications = {
  list: () => get<Medication[]>('/api/medications'),
  create: (data: CreateMedicationInput) =>
    post<Medication>('/api/medications', data),
  doses: (medId: string) => get<MedicationDose[]>(`/api/medications/${medId}/doses`),
  markTaken: (medId: string, doseId: string) =>
    post<{ ok: boolean }>(`/api/medications/${medId}/doses/${doseId}/taken`, {}),
  markSkipped: (medId: string, doseId: string) =>
    post<{ ok: boolean }>(`/api/medications/${medId}/doses/${doseId}/skip`, {}),
};

// ── Check-ins ──────────────────────────────────────────────────────────────────
export interface CheckIn {
  id: string;
  date: string;
  energy?: number;
  painIntensity?: 'mild' | 'moderate' | 'severe';
  painLocations?: string[];
  painTypes?: string[];
  flareStatus?: 'no' | 'maybe' | 'yes';
  flareSeverity?: 'mild' | 'moderate' | 'severe';
  sleep?: 'poor' | 'okay' | 'good';
  sleepHours?: number;
  sleepDisrupted?: boolean;
  stress?: number;
  mood?: number;
  medsTaken?: 'yes' | 'some' | 'no';
  sideEffects?: string[];
  gutIssues?: string[];
  foodTriggers?: string[];
  mobility?: 'hard' | 'some-difficulty' | 'okay';
  notes?: string;
}

export const checkins = {
  list: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const q = params.toString();
    return get<CheckIn[]>(`/api/checkins${q ? `?${q}` : ''}`);
  },
  today: () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    return checkins.list(start.toISOString(), end.toISOString());
  },
  save: (data: Partial<CheckIn>) => post<CheckIn>('/api/checkins', data),
};

// ── Diet ───────────────────────────────────────────────────────────────────────
export interface DietLog {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: string[];
  triggers: string[];
  calories?: number;
  notes?: string;
  ateAt: string;
}

export const diet = {
  list: () => get<DietLog[]>('/api/diet'),
  create: (data: Omit<DietLog, 'id' | 'ateAt'> & { ateAt?: string }) =>
    post<DietLog>('/api/diet', data),
  remove: (id: string) => del<void>(`/api/diet/${id}`),
};

// ── Flares ─────────────────────────────────────────────────────────────────────
export interface FlareEvent {
  id: string;
  startedAt: string;
  endedAt?: string | null;
  severity: number;
  triggers: string[];
  locations: string[];
  notes?: string;
  resolved: boolean;
}

export const flares = {
  list: () => get<FlareEvent[]>('/api/flares'),
  create: (data: Omit<FlareEvent, 'id' | 'resolved'> & { resolved?: boolean }) =>
    post<FlareEvent>('/api/flares', data),
  resolve: (id: string) => post<{ ok: boolean }>(`/api/flares/${id}/resolve`, {}),
};

// ── Medical Records ────────────────────────────────────────────────────────────
export interface MedicalRecord {
  id: string;
  title: string;
  type: 'lab' | 'imaging' | 'visit' | 'prescription' | 'other';
  providerName?: string;
  date: string;
  fileUrl?: string;
  notes?: string;
  tags: string[];
}

export const medicalRecords = {
  list: () => get<MedicalRecord[]>('/api/medical-records'),
  create: (data: Omit<MedicalRecord, 'id' | 'tags'> & { tags?: string[] }) =>
    post<MedicalRecord>('/api/medical-records', data),
};

// ── Community ──────────────────────────────────────────────────────────────────
export interface CommunityPost {
  id: string;
  content: string;
  tags: string[];
  likes: number;
  createdAt: string;
  user: { username: string; firstName?: string; avatarUrl?: string };
  comments: CommunityComment[];
}

export interface CommunityComment {
  id: string;
  content: string;
  createdAt: string;
  user: { username: string; firstName?: string; avatarUrl?: string };
}

export const community = {
  posts: () => get<CommunityPost[]>('/api/community/posts'),
  createPost: (content: string, tags?: string[]) =>
    post<CommunityPost>('/api/community/posts', { content, tags }),
  likePost: (id: string) => post<{ likes: number }>(`/api/community/posts/${id}/like`, {}),
  comment: (postId: string, content: string) =>
    post<CommunityComment>(`/api/community/posts/${postId}/comments`, { content }),
};

// ── Insights ───────────────────────────────────────────────────────────────────
export interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  data?: unknown;
  severity: 'info' | 'warning' | 'positive';
  createdAt: string;
}

export const insights = {
  list: () => get<Insight[]>('/api/insights'),
  refresh: () => post<Insight[]>('/api/insights/refresh', {}),
};

// ── Calendar ───────────────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  type: 'symptom' | 'checkin' | 'medication' | 'flare' | 'appointment';
  date: string;
  endDate?: string;
  title: string;
  severity: number;
  payload: Record<string, unknown>;
}

export const calendar = {
  list: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to)   params.set('to', to);
    const q = params.toString();
    return get<CalendarEvent[]>(`/api/calendar${q ? `?${q}` : ''}`);
  },
};

// ── NLP ────────────────────────────────────────────────────────────────────────
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

// Structured, category-routed parse of a voice/text log entry
export interface ParsedDiet {
  food: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Beverage';
  time: string;
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

export const nlp = {
  analyze: (text: string) => post<NLPResult>('/api/nlp/analyze', { text }),
  parseLog: (text: string) => post<ParsedLog>('/api/nlp/parse-log', { text }),
};

// ── STT (Speech-to-Text via Whisper) ──────────────────────────────────────────
export interface STTResult {
  transcript: string;
  language: string;
  durationSeconds: number | null;
}

// ── OCR (Medication Scan) ──────────────────────────────────────────────────────
export interface OCRMedMatch {
  name: string;
  generic: string;
  category: string;
  score: number;
  dose: string | null;
}

export interface OCRMedResult {
  rawText: string;
  matches: OCRMedMatch[];
}

// Live desktop scanner (Python OCR over the physical camera)
export interface OCRLiveMatch {
  name: string;
  generic: string;
  category: string;
  score: number;
  matched_token?: string;
}

export interface OCRLiveFields {
  medication_name: string;
  dosage: string;
  doctors_instructions: string[];
  schedule: string;
  generic?: string;
  category?: string;
  match_score?: number;
}

export interface OCRLiveResult {
  ok: boolean;
  aborted?: boolean;
  type: 'box' | 'bottle';
  camera: string;
  ocr_raw?: string;
  warning?: string | null;
  fields?: OCRLiveFields | null;
  matches?: OCRLiveMatch[];
  online?: Record<string, unknown>;
  message?: string;
  error?: string;
  processing_time_s?: number;
}

export const ocr = {
  scanMedication: (base64Image: string): Promise<OCRMedResult> =>
    post<OCRMedResult>('/api/ocr/medication', { image: base64Image }),

  /**
   * Launch the desktop Python scanner. Opens a native camera window on the
   * machine running the backend; resolves with the extracted medication once
   * the user captures the label (or aborts). Long-running — uses a 5-minute
   * client timeout to match the server.
   */
  scanLive: async (opts: {
    type: 'box' | 'bottle';
    camera?: number | string;
    seconds?: number;
    online?: boolean;
  }): Promise<OCRLiveResult> => {
    const controller = new AbortController();
    // Longer than the server's 5-min timeout so the server's clean 408 wins
    // the race instead of the client aborting with a raw DOMException.
    const timeout = setTimeout(() => controller.abort(), 330_000);
    try {
      const t = token.get();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (t) headers['Authorization'] = `Bearer ${t}`;
      const res = await fetch(`${BASE}/api/ocr/scan-live`, {
        method: 'POST',
        headers,
        body: JSON.stringify(opts),
        signal: controller.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Scan failed' }));
        throw new Error(err.error ?? 'Scan failed');
      }
      return res.json();
    } finally {
      clearTimeout(timeout);
    }
  },

  scanStatus: (): Promise<{ inProgress: boolean }> =>
    get<{ inProgress: boolean }>('/api/ocr/scan-status'),

  cancelScan: (): Promise<{ cancelled: boolean }> =>
    post<{ cancelled: boolean }>('/api/ocr/scan-cancel', {}),

  // The user's stored OCR scans (provenance of scanned prescriptions)
  documents: (): Promise<OCRDocumentRecord[]> =>
    get<OCRDocumentRecord[]>('/api/ocr/documents'),
};

export interface OCRDocumentRecord {
  id: string;
  userId: string;
  documentType: string;
  rawText: string;
  confidence: number | null;
  parsedData: OCRLiveFields | null;
  matchCandidates: OCRLiveMatch[] | null;
  confirmedMatch: OCRLiveMatch | null;
  capturedAt: string;
  createdAt: string;
}

export const stt = {
  /**
   * Send an audio Blob to the backend Whisper endpoint.
   * Returns { transcript } on success; throws on error.
   */
  transcribe: async (audioBlob: Blob): Promise<STTResult> => {
    const form = new FormData();
    form.append('audio', audioBlob, 'recording.webm');
    const t = token.get();
    const headers: Record<string, string> = {};
    if (t) headers['Authorization'] = `Bearer ${t}`;
    const res = await fetch(`${BASE}/api/stt/transcribe`, {
      method: 'POST',
      headers,
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'STT request failed' }));
      throw new Error(err.error ?? 'STT request failed');
    }
    return res.json();
  },
};
