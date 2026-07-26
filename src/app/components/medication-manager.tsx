import React, { useState, useEffect } from 'react';
import { medications as medsApi, ocr as ocrApi, type OCRLiveResult, type ParsedLog } from '../../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Plus, Pill, Clock, AlertCircle, CheckCircle2, ScanLine } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { VoiceLogInput } from './voice-log-input';
import { DetectedExtras } from './detected-extras';

// The desktop live scanner needs a local camera + the Python process, so it
// only works when the backend runs on the user's machine. In cloud/production
// builds it's disabled (the server has no camera). Set VITE_ENABLE_LIVE_SCAN=true
// to force-enable it (e.g. for a local production build).
const LIVE_SCAN_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_LIVE_SCAN === 'true';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  taken: boolean[];
  notes: string;
  genericName?: string | null;
  category?: string | null;
  source?: 'manual' | 'ocr';
}

export function MedicationManager() {
  const [medications, setMedications] = useState<Medication[]>([]);

  // Today's local date (YYYY-MM-DD) for persisting/reading dose status.
  const todayKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  useEffect(() => {
    Promise.all([
      medsApi.list(),
      medsApi.today(todayKey).catch(() => ({ meds: [] as any[], taken: 0, total: 0, date: todayKey })),
    ]).then(([list, today]) => {
      const takenById = new Map<string, boolean[]>(
        (today.meds ?? []).map((m: any) => [m.id, m.takenFlags as boolean[]])
      );
      setMedications(
        list.map((m) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          time: m.scheduleTimes,
          // Prefer today's persisted taken flags; fall back to all-false.
          taken: takenById.get(m.id) ?? m.scheduleTimes.map(() => false),
          notes: m.notes ?? '',
          genericName: m.genericName,
          category: m.category,
          source: m.source,
        }))
      );
    }).catch(() => {});
  }, []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [lastParsed, setLastParsed] = useState<ParsedLog | null>(null);
  const [scanPhase, setScanPhase] = useState<'idle' | 'choosing' | 'scanning'>('idle');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<OCRLiveResult | null>(null);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    time: '',
    notes: '',
  });

  const addMedication = async () => {
    if (!newMed.name || !newMed.dosage) return;

    const times = newMed.time.split(',').map((t) => t.trim()).filter(Boolean);
    const scheduleTimes = times.length ? times : [];

    // If this entry was filled from a scan, pull structured fields + provenance
    // from the currently-selected match so they persist as the prescription.
    const chosenMatch = scanResult?.matches?.find((m) => m.name === newMed.name);
    const fromScan = Boolean(scanResult && chosenMatch);

    const medication: Medication = {
      id: Date.now().toString(),
      name: newMed.name,
      dosage: newMed.dosage,
      frequency: newMed.frequency,
      time: scheduleTimes,
      taken: scheduleTimes.map(() => false),
      notes: newMed.notes,
      genericName: chosenMatch?.generic ?? null,
      category: chosenMatch?.category ?? null,
      source: fromScan ? 'ocr' : 'manual',
    };

    try {
      const created = await medsApi.create({
        name: newMed.name,
        dosage: newMed.dosage,
        frequency: newMed.frequency,
        timesPerDay: scheduleTimes.length || 1,
        scheduleTimes,
        startDate: new Date().toISOString(),
        color: '#7293BB',
        notes: newMed.notes,
        genericName: chosenMatch?.generic ?? null,
        category: chosenMatch?.category ?? null,
        // Persist the raw OCR scan details so the scan is stored & traceable.
        ocr: fromScan
          ? {
              rawText: scanResult!.ocr_raw ?? '',
              confidence: chosenMatch?.score ?? null,
              documentType: 'medication',
              parsedData: scanResult!.fields ?? null,
              matchCandidates: scanResult!.matches ?? null,
              confirmedMatch: chosenMatch ?? null,
            }
          : undefined,
      });
      medication.id = created.id;
    } catch {}

    setMedications([...medications, medication]);
    setNewMed({ name: '', dosage: '', frequency: 'Daily', time: '', notes: '' });
    setScanResult(null);
    setScanError(null);
    setLastParsed(null);
    setShowAddForm(false);
  };

  const toggleTaken = (medId: string, timeIndex: number) => {
    let nextValue = false;
    setMedications(
      medications.map((med) => {
        if (med.id === medId) {
          const newTaken = [...med.taken];
          newTaken[timeIndex] = !newTaken[timeIndex];
          nextValue = newTaken[timeIndex];
          return { ...med, taken: newTaken };
        }
        return med;
      })
    );
    // Persist today's dose status so the dashboard + reloads reflect it.
    medsApi.toggleDose(medId, timeIndex, nextValue, todayKey).catch(() => {});
  };

  const getCompletionStatus = (med: Medication) => {
    const taken = med.taken.filter((t) => t).length;
    const total = med.taken.length;
    return { taken, total, percentage: (taken / total) * 100 };
  };

  // Voice note processed → fill the medication form from the first medication
  // mentioned, and surface any diet/symptoms for one-tap cross-logging.
  const handleMedVoiceParsed = (parsed: ParsedLog) => {
    const med = parsed.medications[0];
    if (med) {
      const noteParts = [med.notes, parsed.summary].filter(Boolean);
      setNewMed((prev) => ({
        ...prev,
        name: med.name,
        dosage: med.dose ?? prev.dosage,
        notes: noteParts.join(' — '),
      }));
    }
    setLastParsed(parsed);
  };

  // ── Live desktop scanner (Python OCR) ────────────────────────────────────────
  // Drop OCR "not detected" sentinels and blanks.
  const cleanVal = (v?: string | null) =>
    !v || v.trim().toLowerCase() === 'not detected' ? '' : v.trim();

  // Map the scanner's free-text schedule onto the form's frequency options.
  const scheduleToFrequency = (schedule?: string): string | null => {
    const s = (schedule ?? '').toLowerCase();
    if (!s || s === 'not detected') return null;
    if (s.includes('week')) return 'Weekly';
    if (s.includes('month')) return 'Monthly';
    if (s.includes('as needed') || s.includes('as-needed')) return 'As Needed';
    if (
      s.includes('once') || s.includes('twice') || s.includes('time') ||
      s.includes('daily') || s.includes('day') || s.includes('bedtime') ||
      s.includes('morning') || s.includes('night') || s.includes('hour')
    ) {
      return 'Daily';
    }
    return null;
  };

  // Apply a scan result (optionally a specific alternative match) into the form.
  const applyScanResult = (res: OCRLiveResult, matchIndex = 0) => {
    const matches = res.matches ?? [];
    const m = matches[matchIndex] ?? matches[0];
    const f = res.fields;
    if (!m && !f) return;

    const instructions = (f?.doctors_instructions ?? []).filter(
      (x) => x && x.toLowerCase() !== 'not detected'
    );
    const noteParts: string[] = [];
    if (m?.category) noteParts.push(`Category: ${m.category}`);
    if (m?.generic) noteParts.push(`Generic: ${m.generic}`);
    if (cleanVal(f?.schedule)) noteParts.push(`Schedule: ${f!.schedule}`);
    if (instructions.length) noteParts.push(instructions.join(' '));

    const freq = scheduleToFrequency(f?.schedule);

    setNewMed((prev) => ({
      ...prev,
      name: m?.name || cleanVal(f?.medication_name) || prev.name,
      dosage: cleanVal(f?.dosage) || prev.dosage,
      frequency: freq ?? prev.frequency,
      notes: noteParts.join(' • ') || prev.notes,
    }));
  };

  // Step 1: user clicked "Scan medication" → ask Box vs Bottle.
  const startMedicationScan = () => {
    setScanError(null);
    setScanResult(null);
    setScanPhase('choosing');
  };

  const cancelScanChoice = () => setScanPhase('idle');

  // Step 2: user picked a label type → launch the desktop scanner.
  const runMedicationScan = async (labelType: 'box' | 'bottle') => {
    setScanError(null);
    setScanPhase('scanning');
    try {
      const res = await ocrApi.scanLive({ type: labelType, camera: 2 });

      if (res.aborted || !res.ok) {
        setScanError(
          res.error ??
            res.message ??
            'Scan cancelled, or camera 2 could not be opened. Make sure the camera is connected and not in use, then try again.'
        );
        setScanPhase('idle');
        return;
      }

      const matches = res.matches ?? [];
      if (!res.fields || matches.length === 0) {
        setScanError(
          res.warning ??
            'No medication matched. Center the label in the green box, improve lighting, and try again.'
        );
        setScanPhase('idle');
        return;
      }

      setScanResult(res);
      applyScanResult(res, 0);
      setScanPhase('idle');
    } catch (err: any) {
      const msg =
        err?.name === 'AbortError'
          ? 'Scan timed out. Close the scanner window and try again.'
          : err.message ?? 'Scan failed. Please try again.';
      setScanError(msg);
      setScanPhase('idle');
    }
  };

  // Cancel an in-progress scan — kills the desktop scanner window/process.
  const cancelActiveScan = async () => {
    try {
      await ocrApi.cancelScan();
    } catch {
      /* best effort */
    }
    setScanError('Scan cancelled.');
    setScanPhase('idle');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Medication Manager</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track your medications and doses
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showAddForm && (
          <div className="p-4 border rounded-lg bg-card space-y-4">
            {/* Voice Input — Whisper STT → editable transcript → smart parse */}
            <VoiceLogInput
              hint='e.g. "Started hydroxychloroquine 200mg, take with breakfast"'
              onParsed={handleMedVoiceParsed}
            />
            <DetectedExtras parsed={lastParsed} show={['symptoms', 'diet']} />

            {/* Scan Input Option — desktop Python OCR scanner */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#F2EEDA' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">Scan medication</p>
                  <p className="text-xs text-muted-foreground">
                    {LIVE_SCAN_ENABLED
                      ? "Opens the camera scanner — line up the label and we'll fill in the details"
                      : 'Available in the desktop app only. Enter the details manually below.'}
                  </p>
                </div>
                {!LIVE_SCAN_ENABLED ? (
                  <Button size="sm" variant="outline" disabled>
                    <ScanLine className="h-4 w-4 mr-2" />
                    Desktop only
                  </Button>
                ) : scanPhase === 'idle' ? (
                  <Button
                    size="sm"
                    onClick={startMedicationScan}
                    style={{ backgroundColor: '#7293BB' }}
                  >
                    <ScanLine className="h-4 w-4 mr-2" />
                    Scan medication
                  </Button>
                ) : scanPhase === 'choosing' ? (
                  <Button variant="ghost" size="sm" onClick={cancelScanChoice}>
                    Cancel
                  </Button>
                ) : null}
              </div>

              {/* Step 1 — choose label type */}
              {scanPhase === 'choosing' && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    What are you scanning?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-1"
                      onClick={() => runMedicationScan('box')}
                    >
                      <span className="text-lg">📦</span>
                      <span className="text-sm font-medium">Box / Flat</span>
                      <span className="text-[10px] text-muted-foreground">single shot</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 flex flex-col items-center gap-1"
                      onClick={() => runMedicationScan('bottle')}
                    >
                      <span className="text-lg">💊</span>
                      <span className="text-sm font-medium">Bottle / Jar</span>
                      <span className="text-[10px] text-muted-foreground">rotate to scan</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2 — scanning in progress */}
              {scanPhase === 'scanning' && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <span className="w-3 h-3 mt-1 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span className="text-blue-800">
                      A scanner window opened on your desktop (camera 2). Line up the
                      label inside the <strong>green box</strong> and press{' '}
                      <strong>SPACE</strong>. For a bottle, rotate it slowly while
                      scanning. Press <strong>ESC</strong> (or Cancel) to stop.
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={cancelActiveScan}
                  >
                    Cancel scan
                  </Button>
                </div>
              )}

              {/* Result — matched alternatives to switch between */}
              {scanResult && scanPhase === 'idle' && (scanResult.matches?.length ?? 0) > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Matched (tap to use a different result):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {scanResult.matches!.map((m, i) => (
                      <button
                        key={`${m.name}-${i}`}
                        type="button"
                        onClick={() => applyScanResult(scanResult, i)}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                          newMed.name === m.name
                            ? 'bg-[#7293BB] text-white border-[#7293BB]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#7293BB]'
                        }`}
                      >
                        {m.name}{' '}
                        <span className="opacity-70">
                          ({Math.round(m.score * 100)}%)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {scanError && (
                <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm mt-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-red-700">{scanError}</span>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="med-name">Medication Name</Label>
                <Input
                  id="med-name"
                  placeholder="e.g., Methotrexate"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  placeholder="e.g., 15mg"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newMed.frequency}
                  onValueChange={(value) =>
                    setNewMed({ ...newMed, frequency: value })
                  }
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="As Needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time(s)</Label>
                <Input
                  id="time"
                  placeholder="e.g., 8:00 AM, 8:00 PM"
                  value={newMed.time}
                  onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple times with commas
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="med-notes">Notes</Label>
              <Input
                id="med-notes"
                placeholder="Special instructions..."
                value={newMed.notes}
                onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addMedication} className="flex-1">
                Add Medication
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewMed({
                    name: '',
                    dosage: '',
                    frequency: 'Daily',
                    time: '',
                    notes: '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4>Today's Medications</h4>
          {medications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No medications added yet. Click "Add Medication" to get started.
            </p>
          ) : (
            medications.map((med, index) => {
              const status = getCompletionStatus(med);
              return (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(114, 147, 187, 0.1)' }}
                  className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: '#CDADD0' }}
                    >
                      <Pill className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h4>{med.name}</h4>
                            {med.source === 'ocr' && (
                              <Badge
                                variant="outline"
                                className="text-[10px] gap-1 border-[#7293BB] text-[#7293BB]"
                              >
                                <ScanLine className="h-3 w-3" />
                                Scanned
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline">{med.frequency}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage}
                          {med.genericName ? ` · ${med.genericName}` : ''}
                          {med.category ? ` · ${med.category}` : ''}
                        </p>
                      </div>

                      {med.notes && (
                        <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span className="text-amber-800">{med.notes}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        {med.time.map((time, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-muted/30 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={med.taken[idx]}
                                onCheckedChange={() => toggleTaken(med.id, idx)}
                              />
                              {med.taken[idx] && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${status.percentage}%`,
                              backgroundColor: '#7293BB',
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {status.taken}/{status.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}