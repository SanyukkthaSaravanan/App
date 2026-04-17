import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import {
  Zap,
  Activity,
  Flame,
  Moon,
  Brain,
  Pill,
  Apple,
  Mic,
  X,
  Check,
} from 'lucide-react';

interface CheckInData {
  energy?: number;
  painLocations?: string[];
  painIntensity?: 'mild' | 'moderate' | 'severe';
  painTypes?: string[];
  flareStatus?: 'no' | 'maybe' | 'yes';
  flareSeverity?: 'mild' | 'moderate' | 'severe';
  sleep?: 'poor' | 'okay' | 'good';
  sleepDisrupted?: boolean;
  stress?: number;
  medications?: 'yes' | 'some' | 'no';
  sideEffects?: string[];
  gutIssues?: string[];
  foodTriggers?: string[];
  mobility?: 'hard' | 'some-difficulty' | 'okay';
  notes?: string;
}

interface DailyCheckInProps {
  isFlareDay?: boolean;
  onComplete?: (data: CheckInData) => void;
  onSkip?: () => void;
}

export function DailyCheckIn({ isFlareDay = false, onComplete, onSkip }: DailyCheckInProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [checkInData, setCheckInData] = useState<CheckInData>({});
  const [isRecording, setIsRecording] = useState(false);

  const updateData = (key: keyof CheckInData, value: any) => {
    setCheckInData({ ...checkInData, [key]: value });
  };

  const toggleArrayItem = (key: keyof CheckInData, item: string) => {
    const currentArray = (checkInData[key] as string[]) || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateData(key, newArray);
  };

  const handleSave = () => {
    if (onComplete) {
      onComplete(checkInData);
    }
  };

  // Flare Day Mode - Ultra Minimal
  if (isFlareDay) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-2" style={{ borderColor: '#E89BA1', backgroundColor: '#FEF2F3' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" style={{ color: '#E89BA1' }} />
              Flare day detected
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              We'll keep this as easy as possible.
              <br />
              Log only what you can — or nothing at all.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1. Overall State */}
            <div className="space-y-3">
              <label>How bad does today feel?</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'mild', label: '⚠️ Mild flare', color: '#FEF3C7' },
                  { value: 'moderate', label: '🔥 Moderate flare', color: '#FED7AA' },
                  { value: 'severe', label: '🚨 Severe flare', color: '#FECACA' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={checkInData.flareSeverity === option.value ? 'default' : 'outline'}
                    className="h-auto py-4 justify-start text-left"
                    style={
                      checkInData.flareSeverity === option.value
                        ? { backgroundColor: '#E89BA1', color: 'white' }
                        : { backgroundColor: option.color }
                    }
                    onClick={() => updateData('flareSeverity', option.value)}
                  >
                    <span className="text-base">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 2. Biggest Issue */}
            <div className="space-y-3">
              <label>
                What's bothering you the most?
                <span className="text-sm text-muted-foreground ml-2">
                  (Pick one — or skip)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['Exhaustion', 'Pain', 'Brain fog', 'GI issues', 'Mobility', 'Mood'].map(
                  (issue) => (
                    <Badge
                      key={issue}
                      variant={checkInData.notes === issue ? 'default' : 'outline'}
                      className="cursor-pointer px-3 py-1.5"
                      style={
                        checkInData.notes === issue
                          ? { backgroundColor: '#E89BA1', color: 'white' }
                          : {}
                      }
                      onClick={() => updateData('notes', issue)}
                    >
                      {issue}
                    </Badge>
                  )
                )}
              </div>
            </div>

            {/* 3. Meds */}
            <div className="space-y-3">
              <label>Were you able to take your meds today?</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'yes', label: '✅ Yes' },
                  { value: 'some', label: '⚠️ Some' },
                  { value: 'no', label: '❌ No' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={checkInData.medications === option.value ? 'default' : 'outline'}
                    style={
                      checkInData.medications === option.value
                        ? { backgroundColor: '#7293BB' }
                        : {}
                    }
                    onClick={() => updateData('medications', option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 4. One-Tap Note */}
            <div className="space-y-3">
              <label>
                Want to leave a quick note?
                <span className="text-sm text-muted-foreground ml-2">One word is enough.</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setIsRecording(!isRecording)}>
                  <Mic className="h-4 w-4 mr-2" />
                  Say it
                </Button>
                <Button variant="outline">✍️ Type it</Button>
              </div>
              {isRecording && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Listening...
                  </p>
                </div>
              )}
            </div>

            {/* Save & Exit */}
            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full"
                style={{ backgroundColor: '#7293BB' }}
                onClick={handleSave}
              >
                Save and rest
              </Button>
              <Button variant="ghost" className="w-full" onClick={onSkip}>
                Skip for now
              </Button>
            </div>

            {/* Empty state message */}
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Flare days are hard. We've marked today as a flare — no details needed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normal Check-In Flow
  const steps = [
    {
      id: 'energy',
      title: 'Energy level',
      subtitle: 'How much energy do you feel you have right now?',
      content: (
        <div className="space-y-4">
          <div className="space-y-6">
            {[
              { value: 1, emoji: '🪫', label: 'Completely drained' },
              { value: 2, emoji: '😴', label: 'Low energy' },
              { value: 3, emoji: '😐', label: 'Okay' },
              { value: 4, emoji: '🙂', label: 'Good' },
              { value: 5, emoji: '⚡', label: 'Full of energy' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={checkInData.energy === option.value ? 'default' : 'outline'}
                className="w-full h-auto py-4 justify-start text-left"
                style={
                  checkInData.energy === option.value
                    ? { backgroundColor: '#A5D3CF' }
                    : {}
                }
                onClick={() => updateData('energy', option.value)}
              >
                <span className="text-2xl mr-3">{option.emoji}</span>
                <span>{option.label}</span>
              </Button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'pain',
      title: 'Any pain today?',
      subtitle: 'Tap where it hurts.',
      content: (
        <div className="space-y-4">
          <div className="p-6 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-4">Body map would appear here</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {checkInData.painLocations?.map((location) => (
                <Badge key={location} variant="secondary">
                  {location}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => toggleArrayItem('painLocations', location)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {checkInData.painLocations && checkInData.painLocations.length > 0 && (
            <>
              <div className="space-y-3">
                <label>How intense is it?</label>
                <div className="grid grid-cols-3 gap-2">
                  {['mild', 'moderate', 'severe'].map((intensity) => (
                    <Button
                      key={intensity}
                      variant={checkInData.painIntensity === intensity ? 'default' : 'outline'}
                      style={
                        checkInData.painIntensity === intensity
                          ? { backgroundColor: '#B48CBF' }
                          : {}
                      }
                      onClick={() => updateData('painIntensity', intensity)}
                    >
                      {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">Optional:</label>
                <div className="flex flex-wrap gap-2">
                  {['Aching', 'Sharp', 'Burning', 'Stiff'].map((type) => (
                    <Badge
                      key={type}
                      variant={checkInData.painTypes?.includes(type) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      style={
                        checkInData.painTypes?.includes(type)
                          ? { backgroundColor: '#E89BA1', color: 'white' }
                          : {}
                      }
                      onClick={() => toggleArrayItem('painTypes', type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      id: 'flare',
      title: 'Does today feel like a flare?',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'no', label: '❌ No' },
              { value: 'maybe', label: '⚠️ Maybe' },
              { value: 'yes', label: '🔥 Yes' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={checkInData.flareStatus === option.value ? 'default' : 'outline'}
                className="h-auto py-4"
                style={
                  checkInData.flareStatus === option.value
                    ? { backgroundColor: option.value === 'yes' ? '#E89BA1' : '#7293BB' }
                    : {}
                }
                onClick={() => updateData('flareStatus', option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {(checkInData.flareStatus === 'yes' || checkInData.flareStatus === 'maybe') && (
            <div className="space-y-3 pt-4">
              <label>How bad does it feel?</label>
              <div className="grid grid-cols-3 gap-2">
                {['mild', 'moderate', 'severe'].map((severity) => (
                  <Button
                    key={severity}
                    variant={checkInData.flareSeverity === severity ? 'default' : 'outline'}
                    style={
                      checkInData.flareSeverity === severity
                        ? { backgroundColor: '#E89BA1' }
                        : {}
                    }
                    onClick={() => updateData('flareSeverity', severity)}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'sleep',
      title: 'How did you sleep?',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'poor', emoji: '😴', label: 'Poor' },
              { value: 'okay', emoji: '😐', label: 'Okay' },
              { value: 'good', emoji: '🙂', label: 'Good' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={checkInData.sleep === option.value ? 'default' : 'outline'}
                className="h-auto py-4 flex-col"
                style={
                  checkInData.sleep === option.value
                    ? { backgroundColor: '#B48CBF' }
                    : {}
                }
                onClick={() => updateData('sleep', option.value)}
              >
                <span className="text-2xl mb-1">{option.emoji}</span>
                <span>{option.label}</span>
              </Button>
            ))}
          </div>

          {checkInData.sleep && checkInData.sleep !== 'good' && (
            <div className="space-y-3 pt-4">
              <label>Did pain or symptoms wake you up?</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={checkInData.sleepDisrupted === true ? 'default' : 'outline'}
                  style={
                    checkInData.sleepDisrupted === true
                      ? { backgroundColor: '#7293BB' }
                      : {}
                  }
                  onClick={() => updateData('sleepDisrupted', true)}
                >
                  Yes
                </Button>
                <Button
                  variant={checkInData.sleepDisrupted === false ? 'default' : 'outline'}
                  style={
                    checkInData.sleepDisrupted === false
                      ? { backgroundColor: '#7293BB' }
                      : {}
                  }
                  onClick={() => updateData('sleepDisrupted', false)}
                >
                  No
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'stress',
      title: 'Stress level today',
      subtitle: 'Emotional stress counts too.',
      content: (
        <div className="space-y-6">
          {[
            { value: 1, emoji: '🌿', label: 'Very calm' },
            { value: 2, emoji: '😐', label: 'Some stress' },
            { value: 3, emoji: '😣', label: 'High stress' },
          ].map((option) => (
            <Button
              key={option.value}
              variant={checkInData.stress === option.value ? 'default' : 'outline'}
              className="w-full h-auto py-4 justify-start text-left"
              style={
                checkInData.stress === option.value
                  ? { backgroundColor: '#A5D3CF' }
                  : {}
              }
              onClick={() => updateData('stress', option.value)}
            >
              <span className="text-2xl mr-3">{option.emoji}</span>
              <span>{option.label}</span>
            </Button>
          ))}
        </div>
      ),
    },
    {
      id: 'medications',
      title: 'Medications',
      subtitle: 'Did you take your meds today?',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'yes', label: '✅ Yes' },
              { value: 'some', label: '⚠️ Some' },
              { value: 'no', label: '❌ No' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={checkInData.medications === option.value ? 'default' : 'outline'}
                className="h-auto py-4"
                style={
                  checkInData.medications === option.value
                    ? { backgroundColor: '#CDADD0' }
                    : {}
                }
                onClick={() => updateData('medications', option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {checkInData.medications && checkInData.medications !== 'yes' && (
            <div className="space-y-3 pt-4">
              <label>Any side effects?</label>
              <div className="flex flex-wrap gap-2">
                {['Nausea', 'Dizziness', 'Brain fog', 'Other'].map((effect) => (
                  <Badge
                    key={effect}
                    variant={checkInData.sideEffects?.includes(effect) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={
                      checkInData.sideEffects?.includes(effect)
                        ? { backgroundColor: '#CDADD0', color: 'white' }
                        : {}
                    }
                    onClick={() => toggleArrayItem('sideEffects', effect)}
                  >
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'notes',
      title: 'Anything else you want to remember?',
      subtitle: 'One sentence is enough.',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-auto py-4"
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className="h-5 w-5 mr-2" />
              Talk instead
            </Button>
            <Button variant="outline" className="h-auto py-4">
              ✍️ Type a note
            </Button>
          </div>
          {isRecording && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Listening...
              </p>
            </div>
          )}
          <Textarea
            placeholder="How are you feeling? What's on your mind?"
            rows={4}
            value={checkInData.notes || ''}
            onChange={(e) => updateData('notes', e.target.value)}
          />
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>How are you feeling today?</CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            No pressure — log as much or as little as you can.
          </p>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                  backgroundColor: '#7293BB',
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2">{currentStepData.title}</h3>
            {currentStepData.subtitle && (
              <p className="text-sm text-muted-foreground mb-4">
                {currentStepData.subtitle}
              </p>
            )}
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex gap-2 pt-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </Button>
            )}
            <Button
              className="flex-1"
              style={{ backgroundColor: '#7293BB' }}
              onClick={() => {
                if (isLastStep) {
                  handleSave();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
            >
              {isLastStep ? 'Save check-in' : 'Next'}
            </Button>
            <Button variant="ghost" onClick={onSkip}>
              Skip for today
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gentle reminder */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          No data logged today — and that's okay.
          <br />
          Rest days count too. You can always add this later.
        </p>
      </div>
    </div>
  );
}
