import React, { useState, useEffect } from 'react';
import { symptoms as symptomsApi, nlp, type ParsedLog } from '../../lib/api';
import { startLogTimer, trackLogCompleted } from '../../lib/analytics';
import { useAuth } from '../../context/auth-context';
import { useWhisper } from '../../hooks/useWhisper';
import { DetectedExtras } from './detected-extras';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Plus, Mic, MicOff, Sparkles, Pencil } from 'lucide-react';
import skeletonFront from 'figma:asset/skeleton-front.png';
import skeletonSide from 'figma:asset/skeleton-side.png';

interface BodyPartSymptom {
  id: string;
  // `part` is the hotspot id for location-based logs, or null for general (e.g. fatigue)
  part: string | null;
  partName: string;
  symptoms: string[];
  severity: number;
  notes: string;
  date: Date;
}

type ViewType = 'front' | 'side';

interface Hotspot {
  id: string;
  name: string;
  top: string;
  left: string;
}

// Symptom options that can be logged for a body part
const SYMPTOM_OPTIONS = [
  'Pain',
  'Swelling',
  'Stiffness',
  'Numbness',
  'Tingling',
  'Burning',
  'Weakness',
  'Redness',
  'Bruising',
];

// Whole-body / non-localized symptom suggestions
const GENERAL_SYMPTOM_SUGGESTIONS = [
  'Fatigue',
  'Brain Fog',
  'Headache',
  'Nausea',
  'Fever',
  'Dizziness',
  'Insomnia',
  'Anxiety',
  'Low Mood',
];

// Whisper tends to "hallucinate" these stock phrases when it hears silence or
// noise instead of speech (they're common in its training data). Treat them as
// no input so we can prompt the user for a real symptom.
const WHISPER_NOISE = new Set([
  'thank you for watching', 'thanks for watching', 'thank you for watching!',
  'thank you', 'thanks', 'you', 'bye', 'okay', 'ok', 'so', 'um', 'uh',
  'please subscribe', 'like and subscribe', 'subscribe',
]);

const VALID_SYMPTOM_MSG = 'Please input a valid symptom (e.g. Headache).';

/** True when a transcript is empty or a known Whisper noise phrase. */
function isNoiseTranscript(text: string): boolean {
  const norm = text.toLowerCase().replace(/[.!?,]/g, '').trim();
  return norm.length === 0 || WHISPER_NOISE.has(norm);
}

/** Local YYYY-MM-DD key for a date (used to compare/group by day). */
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Stable identity for "the same symptom" across days (body part + symptom names). */
function symptomKey(s: { part: string | null; partName: string; symptoms: string[] }): string {
  const names = [...s.symptoms].map((x) => x.toLowerCase().trim()).filter(Boolean).sort().join(',');
  return `${s.part ?? 'general'}::${names || s.partName.toLowerCase().trim()}`;
}

export function BodyMapNew() {
  const { user } = useAuth();
  const [selectedView, setSelectedView] = useState<ViewType>('front');
  const [symptoms, setSymptoms] = useState<BodyPartSymptom[]>([]);
  // Symptoms the user has confirmed are no longer present (so we stop asking to
  // carry them forward). Kept per-device in localStorage: { symptomKey: 'YYYY-MM-DD' }.
  const resolvedStoreKey = `flaire_sym_resolved_${user?.id ?? 'anon'}`;
  const [resolved, setResolved] = useState<Record<string, string>>({});
  // Per-candidate severity chosen in the carry-forward banner (defaults to last).
  const [carrySeverity, setCarrySeverity] = useState<Record<string, number>>({});

  useEffect(() => {
    symptomsApi.list().then((list) => {
      setSymptoms(
        list.map((s) => ({
          id: s.id,
          part: s.bodyPart,
          partName: s.bodyPartName ?? s.bodyPart ?? 'General',
          symptoms: s.symptoms,
          severity: s.severity,
          notes: s.notes ?? '',
          date: new Date(s.loggedAt),
        }))
      );
    }).catch(() => {});
  }, []);

  // Load the "resolved" markers for this user.
  useEffect(() => {
    try {
      setResolved(JSON.parse(localStorage.getItem(resolvedStoreKey) || '{}'));
    } catch {
      setResolved({});
    }
  }, [resolvedStoreKey]);

  const persistResolved = (next: Record<string, string>) => {
    setResolved(next);
    try {
      localStorage.setItem(resolvedStoreKey, JSON.stringify(next));
    } catch {}
  };

  // Dialog state for adding a symptom to a clicked body part
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [draftSymptoms, setDraftSymptoms] = useState<string[]>([]);
  const [draftSeverity, setDraftSeverity] = useState<number>(5);
  const [draftNotes, setDraftNotes] = useState<string>('');

  // Dialog state for adding a general (non-localized) symptom
  const [generalOpen, setGeneralOpen] = useState(false);
  const [generalName, setGeneralName] = useState('');
  const [generalSeverity, setGeneralSeverity] = useState<number>(5);
  const [generalNotes, setGeneralNotes] = useState('');
  const [nlpParsed, setNlpParsed] = useState(false);

  // Error shown under the symptom voice input when nothing usable was heard.
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const whisper = useWhisper({
    onTranscript: (transcript) => {
      // Silence/noise → Whisper often returns "Thank you for watching!" etc.
      // Don't stuff that into the note; prompt for a real symptom instead.
      if (isNoiseTranscript(transcript)) {
        setVoiceError(VALID_SYMPTOM_MSG);
        return;
      }
      setVoiceError(null);
      setGeneralNotes((prev) => (prev ? prev + ' ' : '') + transcript);
      applyNlpResult(transcript);
    },
    onError: (err) => console.warn('[STT]', err),
  });
  const isRecording = whisper.state === 'recording';
  const isProcessing = whisper.state === 'processing';
  // Cross-category items (meds/food) detected in a symptom voice note.
  const [crossParsed, setCrossParsed] = useState<ParsedLog | null>(null);
  // Guards against double-clicking Save (accidental duplicate symptom logs).
  const [savingSymptom, setSavingSymptom] = useState(false);
  // Editing an existing logged symptom (any symptom can be edited).
  const [editing, setEditing] = useState<BodyPartSymptom | null>(null);
  const [editSymptomsText, setEditSymptomsText] = useState('');
  const [editSeverity, setEditSeverity] = useState(5);
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Front view hotspots
  const frontHotspots: Hotspot[] = [
    { id: 'head', name: 'Head', top: '16%', left: '50%' },
    { id: 'jaw', name: 'Jaw', top: '25%', left: '50%' },
    { id: 'neck', name: 'Neck', top: '30%', left: '50%' },
    { id: 'left-shoulder', name: 'Left Shoulder', top: '32%', left: '39%' },
    { id: 'right-shoulder', name: 'Right Shoulder', top: '32%', left: '63%' },
    { id: 'chest', name: 'Chest', top: '36%', left: '50%' },
    { id: 'left-elbow', name: 'Left Elbow', top: '43%', left: '32%' },
    { id: 'right-elbow', name: 'Right Elbow', top: '43%', left: '68%' },
    { id: 'abdomen', name: 'Abdomen', top: '46%', left: '50%' },
    { id: 'left-wrist', name: 'Left Wrist', top: '53%', left: '28%' },
    { id: 'right-wrist', name: 'Right Wrist', top: '53%', left: '72%' },
    { id: 'left-hip', name: 'Left Hip', top: '54%', left: '45%' },
    { id: 'right-hip', name: 'Right Hip', top: '54%', left: '55%' },
    { id: 'left-hand', name: 'Left Hand', top: '57%', left: '26%' },
    { id: 'right-hand', name: 'Right Hand', top: '57%', left: '74%' },
    { id: 'left-fingers', name: 'Left Fingers', top: '62%', left: '24%' },
    { id: 'right-fingers', name: 'Right Fingers', top: '62%', left: '76%' },
    { id: 'left-knee', name: 'Left Knee', top: '74%', left: '46%' },
    { id: 'right-knee', name: 'Right Knee', top: '74%', left: '55%' },
    { id: 'left-ankle', name: 'Left Ankle', top: '91%', left: '44%' },
    { id: 'right-ankle', name: 'Right Ankle', top: '91%', left: '56%' },
    { id: 'left-foot', name: 'Left Foot', top: '96%', left: '42%' },
    { id: 'right-foot', name: 'Right Foot', top: '96%', left: '58%' },
  ];

  // Side view hotspots
  const sideHotspots: Hotspot[] = [
    { id: 'head', name: 'Head', top: '16%', left: '50%' },
    { id: 'neck', name: 'Neck', top: '28%', left: '45%' },
    { id: 'shoulder', name: 'Shoulder', top: '32%', left: '47%' },
    { id: 'upper-back', name: 'Upper Back', top: '36%', left: '43%' },
    { id: 'chest', name: 'Chest', top: '38%', left: '56%' },
    { id: 'elbow', name: 'Elbow', top: '43%', left: '44%' },
    { id: 'lower-back', name: 'Lower Back', top: '48%', left: '45%' },
    { id: 'abdomen', name: 'Abdomen', top: '46%', left: '55%' },
    { id: 'wrist', name: 'Wrist', top: '54%', left: '48%' },
    { id: 'hip', name: 'Hip', top: '54%', left: '47%' },
    { id: 'hand', name: 'Hand', top: '60%', left: '48%' },
    { id: 'fingers', name: 'Fingers', top: '62%', left: '47%' },
    { id: 'thigh', name: 'Thigh', top: '64%', left: '50%' },
    { id: 'knee', name: 'Knee', top: '74%', left: '49%' },
    { id: 'shin', name: 'Shin', top: '83%', left: '47%' },
    { id: 'ankle', name: 'Ankle', top: '91%', left: '46%' },
    { id: 'foot', name: 'Foot', top: '96%', left: '54%' },
  ];

  const getHotspots = (): Hotspot[] =>
    selectedView === 'front' ? frontHotspots : sideHotspots;

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return '#E89BA1'; // Pink - Severe
    if (severity >= 5) return '#F59E0B'; // Amber - Moderate
    return '#A5D3CF'; // Mint - Mild
  };

  const getPartSymptoms = (partId: string) =>
    symptoms.filter((s) => s.part === partId);

  const hasSymptoms = (partId: string) => getPartSymptoms(partId).length > 0;

  const getMaxSeverity = (partId: string) => {
    const partSymptoms = getPartSymptoms(partId);
    if (partSymptoms.length === 0) return 0;
    return Math.max(...partSymptoms.map((s) => s.severity));
  };

  const removeSymptom = (id: string) => {
    symptomsApi.remove(id).catch(() => {});
    setSymptoms(symptoms.filter((s) => s.id !== id));
  };

  // Symptoms that were logged on an earlier day and not yet updated today, and
  // that the user hasn't marked resolved. We ask (via a banner) whether they're
  // still ongoing so each active day gets counted.
  const todayKey = dateKey(new Date());
  const carryCandidates = (() => {
    const byKey = new Map<string, BodyPartSymptom[]>();
    for (const s of symptoms) {
      const k = symptomKey(s);
      const arr = byKey.get(k);
      if (arr) arr.push(s);
      else byKey.set(k, [s]);
    }
    const out: { key: string; latest: BodyPartSymptom; since: Date }[] = [];
    byKey.forEach((recs, k) => {
      recs.sort((a, b) => +b.date - +a.date);
      const latest = recs[0];
      const loggedToday = recs.some((r) => dateKey(r.date) === todayKey);
      const resolvedOn = resolved[k];
      const isResolved = resolvedOn != null && resolvedOn >= dateKey(latest.date);
      if (!loggedToday && dateKey(latest.date) < todayKey && !isResolved) {
        out.push({ key: k, latest, since: recs[recs.length - 1].date });
      }
    });
    return out.sort((a, b) => +b.latest.date - +a.latest.date);
  })();

  const carrySeverityFor = (c: { key: string; latest: BodyPartSymptom }) =>
    carrySeverity[c.key] ?? c.latest.severity;

  // "Yes, still ongoing" → log it for today with the chosen severity.
  const confirmPersistent = async (c: { key: string; latest: BodyPartSymptom }) => {
    const sev = carrySeverityFor(c);
    const entry: BodyPartSymptom = {
      id: Date.now().toString(),
      part: c.latest.part,
      partName: c.latest.partName,
      symptoms: c.latest.symptoms,
      severity: sev,
      notes: c.latest.notes,
      date: new Date(),
    };
    try {
      const created = await symptomsApi.create({
        bodyPart: c.latest.part,
        bodyPartName: c.latest.part === null ? null : c.latest.partName,
        symptoms: c.latest.symptoms,
        severity: sev,
        notes: c.latest.notes || undefined,
        view: c.latest.part === null ? null : selectedView,
      });
      entry.id = created.id;
    } catch {}
    setSymptoms((prev) => [entry, ...prev]);
    // No longer resolved (it's active again today).
    if (resolved[c.key]) {
      const next = { ...resolved };
      delete next[c.key];
      persistResolved(next);
    }
  };

  // "No, it's gone" → stop carrying it forward; earlier days stay as history.
  const markResolved = (c: { key: string }) => {
    persistResolved({ ...resolved, [c.key]: todayKey });
  };

  const openEdit = (symptom: BodyPartSymptom) => {
    setEditing(symptom);
    setEditSymptomsText(symptom.symptoms.join(', '));
    setEditSeverity(symptom.severity);
    setEditNotes(symptom.notes ?? '');
  };

  const saveEdit = async () => {
    if (!editing || savingEdit) return;
    const list = editSymptomsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) return;
    setSavingEdit(true);
    const updated: BodyPartSymptom = {
      ...editing,
      symptoms: list,
      // Keep the label in step with the symptom for general entries.
      partName: editing.part === null ? list[0] : editing.partName,
      severity: editSeverity,
      notes: editNotes.trim(),
    };
    try {
      await symptomsApi.update(editing.id, {
        symptoms: list,
        severity: editSeverity,
        notes: editNotes.trim(),
        ...(editing.part === null ? { bodyPartName: null } : {}),
      });
    } catch {}
    setSavingEdit(false);
    setSymptoms(symptoms.map((s) => (s.id === editing.id ? updated : s)));
    setEditing(null);
  };

  const openHotspot = (hotspot: Hotspot) => {
    startLogTimer('symptom'); // time from opening the form to a successful save
    // Pre-fill with the most recent existing entry for this part, if any
    const existing = getPartSymptoms(hotspot.id)[0];
    setActiveHotspot(hotspot);
    setDraftSymptoms(existing?.symptoms ?? []);
    setDraftSeverity(existing?.severity ?? 5);
    setDraftNotes(existing?.notes ?? '');
  };

  const closeDialog = () => {
    setActiveHotspot(null);
    setDraftSymptoms([]);
    setDraftSeverity(5);
    setDraftNotes('');
  };

  const toggleDraftSymptom = (name: string) => {
    setDraftSymptoms((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const saveSymptom = async () => {
    if (!activeHotspot || draftSymptoms.length === 0 || savingSymptom) return;
    setSavingSymptom(true);
    const entry: BodyPartSymptom = {
      id: Date.now().toString(),
      part: activeHotspot.id,
      partName: activeHotspot.name,
      symptoms: draftSymptoms,
      severity: draftSeverity,
      notes: draftNotes.trim(),
      date: new Date(),
    };
    try {
      const created = await symptomsApi.create({
        bodyPart: activeHotspot.id,
        bodyPartName: activeHotspot.name,
        symptoms: entry.symptoms,
        severity: entry.severity,
        notes: entry.notes,
        view: selectedView,
      });
      entry.id = created.id;
    } catch {}
    setSavingSymptom(false);
    trackLogCompleted('symptom', { surface: 'body_map', method: 'manual', severity: entry.severity });
    setSymptoms([entry, ...symptoms]);
    closeDialog();
  };

  const openGeneralDialog = () => {
    startLogTimer('symptom'); // time from opening the form to a successful save
    setGeneralName('');
    setGeneralSeverity(5);
    setGeneralNotes('');
    setNlpParsed(false);
    setVoiceError(null);
    setCrossParsed(null);
    setGeneralOpen(true);
  };

  const closeGeneralDialog = () => {
    if (whisper.state !== 'idle') whisper.stop();
    setGeneralOpen(false);
    setCrossParsed(null);
  };

  const saveGeneralSymptom = async () => {
    const name = generalName.trim();
    if (!name || savingSymptom) return;
    setSavingSymptom(true);
    const entry: BodyPartSymptom = {
      id: Date.now().toString(),
      part: null,
      partName: name,
      symptoms: [name],
      severity: generalSeverity,
      notes: generalNotes.trim(),
      date: new Date(),
    };
    try {
      const created = await symptomsApi.create({
        bodyPart: null,
        // Store the symptom itself as the label (not a "General" category) so
        // the calendar and lists show WHAT the symptom is, e.g. "Nausea".
        bodyPartName: null,
        symptoms: [name],
        severity: generalSeverity,
        notes: generalNotes.trim(),
      });
      entry.id = created.id;
    } catch {}
    setSavingSymptom(false);
    trackLogCompleted('symptom', { surface: 'general', method: nlpParsed ? 'voice' : 'manual', severity: generalSeverity });
    setSymptoms([entry, ...symptoms]);
    closeGeneralDialog();
  };

  // Parse the transcript into structured data: fill the symptom fields from the
  // primary symptom, and surface any medications/food for one-tap cross-logging.
  const applyNlpResult = async (transcript: string) => {
    try {
      const parsed = await nlp.parseLog(transcript);
      const primary = parsed.symptoms[0];
      if (primary && primary.name?.trim()) {
        setGeneralName(primary.name);
        if (primary.severity != null) setGeneralSeverity(primary.severity);
        const extra = parsed.symptoms.slice(1).map((s) => s.name);
        if (extra.length) {
          setGeneralNotes((prev) =>
            (prev ? prev + ' ' : '') + `Also mentioned: ${extra.join(', ')}`
          );
        }
        setVoiceError(null);
        setCrossParsed(parsed);
        setNlpParsed(true);
      } else {
        // Heard speech, but nothing that reads as a symptom.
        setVoiceError(VALID_SYMPTOM_MSG);
      }
    } catch {
      // Parser unavailable — transcript is already in the notes field, no-op
    }
  };

  // Voice input — delegates to useWhisper (Whisper API → Web Speech fallback)
  const toggleRecording = () => whisper.toggle();

  const skeletonImages: Record<ViewType, string> = {
    front: skeletonFront,
    side: skeletonSide,
  };

  const dialogOpen = activeHotspot !== null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Body Mapping</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track where you experience symptoms - click on any body part to log
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Skeleton View */}
          <div className="flex-1 flex flex-col items-center gap-4">
            {/* View Selector */}
            <div className="flex gap-2">
              {(['front', 'side'] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedView === view
                      ? 'bg-[#7293BB] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)} View
                </button>
              ))}
            </div>

            {/* Skeleton Image with Hotspots */}
            <div className="relative w-full max-w-[360px] mx-auto">
              <img
                src={skeletonImages[selectedView]}
                alt={`${selectedView} skeleton view`}
                className="w-full h-auto select-none pointer-events-none"
                draggable={false}
              />

              {/* Hotspots Overlay */}
              {getHotspots().map((hotspot) => {
                const partHasSymptoms = hasSymptoms(hotspot.id);
                const severity = getMaxSeverity(hotspot.id);
                const color = partHasSymptoms
                  ? getSeverityColor(severity)
                  : '#7293BB';

                return (
                  <div
                    key={hotspot.id}
                    className="absolute cursor-pointer group"
                    style={{
                      top: hotspot.top,
                      left: hotspot.left,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={() => openHotspot(hotspot)}
                  >
                    {/* Hotspot Dot */}
                    <div
                      className={`w-4 h-4 rounded-full transition-all hover:scale-125 ${
                        partHasSymptoms ? 'animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor: color,
                        border: `2px solid ${
                          partHasSymptoms ? color : 'white'
                        }`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {hotspot.name}
                      {partHasSymptoms && ` (${severity}/10)`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#A5D3CF' }}
                />
                <span>Mild</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#F59E0B' }}
                />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#E89BA1' }}
                />
                <span>Severe</span>
              </div>
            </div>
          </div>

          {/* Symptom Details */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3 gap-2">
                <h4>Symptoms</h4>
                <Button size="sm" variant="outline" onClick={openGeneralDialog}>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Log other symptom
                </Button>
              </div>

              {/* Ongoing symptoms from earlier days awaiting confirmation */}
              {carryCandidates.length > 0 && (
                <div className="space-y-2 mb-3">
                  {carryCandidates.map((c) => {
                    const label = c.latest.symptoms.join(', ');
                    return (
                      <div
                        key={c.key}
                        className="p-3 rounded-lg border border-[#B48CBF] bg-[#F5F0F6] space-y-2"
                      >
                        <p className="text-sm text-[#7A5A85]">
                          {user?.firstName ? `Hi ${user.firstName}, you` : 'You'} logged{' '}
                          <strong>{label}</strong>
                          {c.latest.part !== null ? ` (${c.latest.partName})` : ''} on{' '}
                          {c.latest.date.toLocaleDateString()} and haven't updated it today. Is it
                          still ongoing?
                        </p>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">
                            Today's severity: {carrySeverityFor(c)}/10
                          </span>
                          <Slider
                            value={[carrySeverityFor(c)]}
                            onValueChange={(v) =>
                              setCarrySeverity((prev) => ({ ...prev, [c.key]: v[0] }))
                            }
                            min={1}
                            max={10}
                            step={1}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            style={{ backgroundColor: '#7293BB' }}
                            onClick={() => confirmPersistent(c)}
                          >
                            Yes, still have it
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => markResolved(c)}>
                            No, it's gone
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {symptoms.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No symptoms logged yet. Click a body part on the skeleton, or use
                  "Log other symptom" for things like fatigue.
                </p>
              ) : (
                <div className="space-y-3">
                  {[...symptoms].sort((a, b) => +b.date - +a.date).map((symptom) => (
                    <div
                      key={symptom.id}
                      className="p-3 bg-card rounded-lg border flex items-start justify-between"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">
                            {symptom.partName}
                          </span>
                          {symptom.part === null && (
                            <Badge variant="secondary" className="text-xs">
                              General
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: getSeverityColor(
                                symptom.severity
                              ),
                              color: 'white',
                              borderColor: getSeverityColor(symptom.severity),
                            }}
                          >
                            Severity {symptom.severity}/10
                          </Badge>
                        </div>
                        {/* Hide symptom chips for general entries where the single tag duplicates the name */}
                        {!(
                          symptom.part === null &&
                          symptom.symptoms.length === 1 &&
                          symptom.symptoms[0] === symptom.partName
                        ) && (
                          <div className="flex flex-wrap gap-1">
                            {symptom.symptoms.map((s, idx) => (
                              <Badge key={idx} variant="secondary">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {symptom.notes && (
                          <p className="text-sm text-muted-foreground">
                            {symptom.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {dateKey(symptom.date) === todayKey
                            ? 'Today'
                            : symptom.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(symptom)}
                          aria-label="Edit symptom"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSymptom(symptom.id)}
                          aria-label="Delete symptom"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Add-symptom dialog triggered by clicking a hotspot */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Log symptom — {activeHotspot?.name}</DialogTitle>
            <DialogDescription>
              Select the symptoms you're experiencing at this location and rate
              their severity.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Symptom multi-select */}
            <div className="space-y-2">
              <Label>Symptoms</Label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_OPTIONS.map((name) => {
                  const active = draftSymptoms.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleDraftSymptom(name)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        active
                          ? 'bg-[#7293BB] text-white border-[#7293BB]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {active && <Plus className="inline h-3 w-3 mr-1 rotate-45" />}
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity slider */}
            <div className="space-y-2">
              <Label>Severity: {draftSeverity}/10</Label>
              <Slider
                value={[draftSeverity]}
                onValueChange={(v) => setDraftSeverity(v[0])}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="hotspot-notes">Notes (optional)</Label>
              <Textarea
                id="hotspot-notes"
                rows={3}
                placeholder="Any extra detail — when it started, what makes it worse..."
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={saveSymptom}
              disabled={draftSymptoms.length === 0 || savingSymptom}
            >
              {savingSymptom ? 'Saving…' : 'Save Symptom'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for general / non-localized symptoms (fatigue, brain fog, etc.) */}
      <Dialog
        open={generalOpen}
        onOpenChange={(open) => {
          if (!open) closeGeneralDialog();
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Log other symptom</DialogTitle>
            <DialogDescription>
              For whole-body or non-localized symptoms like fatigue, headaches,
              or brain fog.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Symptom name — typed with suggestion chips */}
            <div className="space-y-2">
              <Label htmlFor="general-symptom-name">Symptom</Label>
              <Input
                id="general-symptom-name"
                placeholder="e.g. Fatigue, Headache…"
                value={generalName}
                onChange={(e) => setGeneralName(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {GENERAL_SYMPTOM_SUGGESTIONS.map((name) => {
                  const active =
                    generalName.trim().toLowerCase() === name.toLowerCase();
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setGeneralName(name)}
                      className={`px-3 py-1 rounded-full text-xs border transition-all ${
                        active
                          ? 'bg-[#7293BB] text-white border-[#7293BB]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extent / severity slider */}
            <div className="space-y-2">
              <Label>Extent: {generalSeverity}/10</Label>
              <Slider
                value={[generalSeverity]}
                onValueChange={(v) => setGeneralSeverity(v[0])}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Notes with voice input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="general-notes">Notes (optional)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={isRecording ? 'destructive' : 'outline'}
                    onClick={toggleRecording}
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing…
                      </>
                    ) : isRecording ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start voice input
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <Textarea
                id="general-notes"
                rows={3}
                placeholder="When it started, what helps or makes it worse…"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
              />
              {isRecording && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Listening… speak clearly, then press Stop
                </p>
              )}
              {isProcessing && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  Processing…
                </p>
              )}
              {voiceError && !isRecording && !isProcessing && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  {voiceError}
                </p>
              )}
            </div>

            {/* Medications / food mentioned in the note — log to their sections */}
            <DetectedExtras parsed={crossParsed} show={['medications', 'diet']} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeGeneralDialog}>
              Cancel
            </Button>
            <Button
              onClick={saveGeneralSymptom}
              disabled={!generalName.trim() || savingSymptom}
            >
              {savingSymptom ? 'Saving…' : 'Save Symptom'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit any logged symptom */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit symptom</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-symptoms">Symptom(s)</Label>
              <Input
                id="edit-symptoms"
                value={editSymptomsText}
                onChange={(e) => setEditSymptomsText(e.target.value)}
                placeholder="e.g. Nausea, Cramping"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple symptoms with commas.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Severity: {editSeverity}/10</Label>
              <Slider
                value={[editSeverity]}
                onValueChange={(v) => setEditSeverity(v[0])}
                min={1}
                max={10}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (optional)</Label>
              <Textarea
                id="edit-notes"
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              disabled={!editSymptomsText.trim() || savingEdit}
            >
              {savingEdit ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
