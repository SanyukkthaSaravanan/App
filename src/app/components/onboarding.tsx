import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { ChevronRight, ChevronLeft, X, Plus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { markerFor } from '../../lib/trackers';

const CONDITION_SUGGESTIONS = [
  'Rheumatoid Arthritis', 'Lupus', 'Psoriatic Arthritis', 'Crohn’s / IBD',
  'Fibromyalgia', 'Multiple Sclerosis', 'Endometriosis', 'IBS',
];

const DEFAULT_FACTORS = [
  { id: 'pain', label: 'Pain', default: true },
  { id: 'fatigue', label: 'Fatigue / Energy', default: true },
  { id: 'sleep', label: 'Sleep', default: true },
  { id: 'mood', label: 'Mood', default: true },
  { id: 'stress', label: 'Stress', default: false },
  { id: 'water', label: 'Water intake', default: false },
  { id: 'exercise', label: 'Exercise', default: false },
  { id: 'diet', label: 'Diet / Food', default: true },
];

export function Onboarding() {
  const { user, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [condition, setCondition] = useState('');
  const [factors, setFactors] = useState<string[]>(
    DEFAULT_FACTORS.filter((f) => f.default).map((f) => f.label)
  );
  const [customFactor, setCustomFactor] = useState('');
  const [customFactors, setCustomFactors] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [triggerInput, setTriggerInput] = useState('');
  const [consent, setConsent] = useState(false);

  const firstName = user?.firstName || user?.username || 'there';
  const totalSteps = 4;

  const toggleFactor = (label: string) =>
    setFactors((prev) => (prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]));

  const addCustomFactor = () => {
    const v = customFactor.trim();
    if (v && !customFactors.includes(v) && !factors.includes(v)) {
      setCustomFactors((prev) => [...prev, v]);
      setFactors((prev) => [...prev, v]);
      setCustomFactor('');
    }
  };

  const addTrigger = () => {
    const v = triggerInput.trim();
    if (v && !triggers.includes(v)) {
      setTriggers((prev) => [...prev, v]);
      setTriggerInput('');
    }
  };

  const finish = async () => {
    if (!consent) return;
    setSaving(true);
    setError('');
    try {
      await completeOnboarding({
        condition: condition.trim() || undefined,
        trackedFactors: factors,
        knownTriggers: triggers,
        consent: true,
      });
      // On success the app re-renders to the dashboard (needsOnboarding → false)
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  const canNext = step === 4 ? consent : true;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at center, #F5F0F6 0%, #E8D5EC 40%, #CDADD0 70%, #A5D3CF 100%)' }}
    >
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold" style={{ color: '#5A4A6A' }}>
            Welcome, {firstName} 🌸
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            A few quick questions to personalise Flaire for you
          </p>
        </div>

        <Card className="border-0 shadow-2xl" style={{ boxShadow: '0 20px 60px rgba(114, 147, 187, 0.15)' }}>
          <CardContent className="p-6">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s === step ? 'w-8 bg-[#7293BB]' : s < step ? 'w-2 bg-[#7293BB]' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="min-h-[280px]"
              >
                {/* Step 1 — Condition */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">What are you managing?</h2>
                      <p className="text-sm text-muted-foreground">Your main condition (or the one you track most).</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Input
                        id="condition"
                        placeholder="e.g. Rheumatoid Arthritis"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CONDITION_SUGGESTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCondition(c)}
                          className={`px-3 py-1 rounded-full text-xs border transition-all ${
                            condition === c
                              ? 'bg-[#7293BB] text-white border-[#7293BB]'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2 — What to track */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">What would you like to track?</h2>
                      <p className="text-sm text-muted-foreground">Pick what matters to you — you can change this anytime in Settings.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[...DEFAULT_FACTORS.map((f) => f.label), ...customFactors].map((label) => (
                        <label
                          key={label}
                          className="flex items-start gap-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={factors.includes(label)}
                            onCheckedChange={() => toggleFactor(label)}
                            className="mt-0.5"
                          />
                          <span className="leading-tight">
                            <span className="text-sm block">{label}</span>
                            <span className="text-[10px] text-muted-foreground">{markerFor(label)}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add your own…"
                        value={customFactor}
                        onChange={(e) => setCustomFactor(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFactor())}
                      />
                      <Button type="button" variant="outline" onClick={addCustomFactor}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Known triggers */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">Any known triggers?</h2>
                      <p className="text-sm text-muted-foreground">Foods, activities, or situations that tend to set off symptoms. Optional.</p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Stress, Dairy, Cold weather"
                        value={triggerInput}
                        onChange={(e) => setTriggerInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrigger())}
                      />
                      <Button type="button" variant="outline" onClick={addTrigger}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {triggers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No triggers added yet.</p>
                      ) : (
                        triggers.map((t) => (
                          <Badge key={t} variant="outline" className="bg-white text-sm py-1.5 px-3">
                            {t}
                            <button
                              onClick={() => setTriggers((prev) => prev.filter((x) => x !== t))}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4 — PDPA consent */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" style={{ color: '#7293BB' }} />
                      <h2 className="text-xl font-semibold">Privacy & your data</h2>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground space-y-2">
                      <p><strong>PDPA Notice & Consent (placeholder).</strong> This is filler text to be replaced with your finalised privacy policy.</p>
                      <p>Flaire collects the health information you choose to log (symptoms, medications, diet, check-ins and related notes) to provide personalised tracking and insights. Your data is stored securely and is used only to operate the app for you.</p>
                      <p>In accordance with the Personal Data Protection Act (PDPA), you consent to the collection, use and storage of your personal data for these purposes. You may withdraw consent or request deletion of your data at any time. We do not sell your personal data.</p>
                      <p>By continuing, you acknowledge that Flaire is a self-tracking tool and does not provide medical advice, diagnosis or treatment.</p>
                    </div>
                    <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer">
                      <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
                      <span className="text-sm">
                        I have read and agree to the privacy policy and consent to Flaire processing my health data as described.
                      </span>
                    </label>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)} disabled={saving}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              {step < totalSteps ? (
                <Button
                  className="flex-1"
                  style={{ backgroundColor: '#7293BB' }}
                  onClick={() => setStep(step + 1)}
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  style={{ backgroundColor: '#7293BB' }}
                  onClick={finish}
                  disabled={!canNext || saving}
                >
                  {saving ? 'Setting up…' : 'Finish & enter Flaire'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
