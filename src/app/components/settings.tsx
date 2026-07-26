import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Plus, X, Check, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

const BASE_FACTORS = [
  'Pain', 'Fatigue / Energy', 'Sleep', 'Mood', 'Stress',
  'Water intake', 'Exercise', 'Diet / Food',
];

const CONDITION_SUGGESTIONS = [
  'Rheumatoid Arthritis', 'Lupus', 'Psoriatic Arthritis', 'Crohn’s / IBD',
  'Fibromyalgia', 'Multiple Sclerosis', 'Endometriosis', 'IBS',
];

export function Settings() {
  const { user, completeOnboarding } = useAuth();

  const [condition, setCondition] = useState(user?.condition ?? '');
  const [factors, setFactors] = useState<string[]>(user?.trackedFactors ?? []);
  const [customFactor, setCustomFactor] = useState('');
  const [triggers, setTriggers] = useState<string[]>(user?.knownTriggers ?? []);
  const [triggerInput, setTriggerInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Factors to show = base set plus any custom ones the user already has.
  const allFactors = Array.from(new Set([...BASE_FACTORS, ...factors]));

  const toggleFactor = (label: string) => {
    setSaved(false);
    setFactors((prev) => (prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]));
  };

  const addCustomFactor = () => {
    const v = customFactor.trim();
    if (v && !factors.includes(v)) {
      setFactors((prev) => [...prev, v]);
      setCustomFactor('');
      setSaved(false);
    }
  };

  const addTrigger = () => {
    const v = triggerInput.trim();
    if (v && !triggers.includes(v)) {
      setTriggers((prev) => [...prev, v]);
      setTriggerInput('');
      setSaved(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await completeOnboarding({
        condition: condition.trim() || undefined,
        trackedFactors: factors,
        knownTriggers: triggers,
        consent: true, // already consented at onboarding
      });
      setSaved(true);
    } catch (e: any) {
      setError(e.message ?? 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" style={{ color: '#7293BB' }} />
          Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Customise your condition, what you track, and your known triggers.
        </p>
      </div>

      {/* Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="s-condition">Condition</Label>
            <Input
              id="s-condition"
              placeholder="e.g. Rheumatoid Arthritis"
              value={condition}
              onChange={(e) => { setCondition(e.target.value); setSaved(false); }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CONDITION_SUGGESTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setCondition(c); setSaved(false); }}
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
        </CardContent>
      </Card>

      {/* Tracked factors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">What you track</CardTitle>
          <p className="text-sm text-muted-foreground">Pick the things you want Flaire to help you keep an eye on.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {allFactors.map((label) => (
              <label
                key={label}
                className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-gray-50"
              >
                <Checkbox checked={factors.includes(label)} onCheckedChange={() => toggleFactor(label)} />
                <span className="text-sm">{label}</span>
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
        </CardContent>
      </Card>

      {/* Known triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Known triggers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
                  <button onClick={() => { setTriggers((prev) => prev.filter((x) => x !== t)); setSaved(false); }} className="ml-2 hover:text-red-600">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving} style={{ backgroundColor: '#7293BB' }}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </motion.div>
  );
}
