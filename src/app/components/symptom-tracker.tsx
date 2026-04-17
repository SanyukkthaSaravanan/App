import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Mic, MicOff, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Symptom {
  id: string;
  name: string;
  severity: number;
  triggers: string[];
  notes: string;
  date: Date;
}

const commonSymptoms = [
  'Fatigue',
  'Joint Pain',
  'Muscle Pain',
  'Headache',
  'Nausea',
  'Brain Fog',
  'Fever',
  'Rash',
  'Swelling',
  'Stiffness',
];

export function SymptomTracker() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([
    {
      id: '1',
      name: 'Joint Pain',
      severity: 7,
      triggers: ['Cold Weather', 'Stress'],
      notes: 'Worse in the morning',
      date: new Date(),
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymptom, setNewSymptom] = useState({
    name: '',
    severity: 5,
    triggers: [] as string[],
    notes: '',
  });
  const [newTrigger, setNewTrigger] = useState('');

  const addSymptom = () => {
    if (!newSymptom.name) return;

    const symptom: Symptom = {
      id: Date.now().toString(),
      name: newSymptom.name,
      severity: newSymptom.severity,
      triggers: newSymptom.triggers,
      notes: newSymptom.notes,
      date: new Date(),
    };

    setSymptoms([symptom, ...symptoms]);
    setNewSymptom({ name: '', severity: 5, triggers: [], notes: '' });
    setShowAddForm(false);
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter((s) => s.id !== id));
  };

  const addTrigger = () => {
    if (newTrigger && !newSymptom.triggers.includes(newTrigger)) {
      setNewSymptom({
        ...newSymptom,
        triggers: [...newSymptom.triggers, newTrigger],
      });
      setNewTrigger('');
    }
  };

  const removeTrigger = (trigger: string) => {
    setNewSymptom({
      ...newSymptom,
      triggers: newSymptom.triggers.filter((t) => t !== trigger),
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Mock voice recording - in real app would use Web Speech API
    if (!isRecording) {
      setTimeout(() => {
        setNewSymptom({
          ...newSymptom,
          notes: 'Experiencing increased pain in joints today, particularly in hands and knees.',
        });
        setIsRecording(false);
      }, 2000);
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'bg-red-500';
    if (severity >= 5) return 'bg-amber-500';
    return 'bg-[#A5D3CF]';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Symptom Tracker</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Log and track your daily symptoms
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Symptom
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showAddForm && (
          <div className="p-4 border rounded-lg bg-card space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symptom-select">Symptom</Label>
              <Select
                value={newSymptom.name}
                onValueChange={(value) =>
                  setNewSymptom({ ...newSymptom, name: value })
                }
              >
                <SelectTrigger id="symptom-select">
                  <SelectValue placeholder="Select a symptom" />
                </SelectTrigger>
                <SelectContent>
                  {commonSymptoms.map((symptom) => (
                    <SelectItem key={symptom} value={symptom}>
                      {symptom}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newSymptom.name === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="custom-symptom">Custom Symptom</Label>
                <Input
                  id="custom-symptom"
                  placeholder="Enter symptom name"
                  onChange={(e) =>
                    setNewSymptom({ ...newSymptom, name: e.target.value })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Severity: {newSymptom.severity}/10</Label>
              <Slider
                value={[newSymptom.severity]}
                onValueChange={(value) =>
                  setNewSymptom({ ...newSymptom, severity: value[0] })
                }
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="triggers">Possible Triggers</Label>
              <div className="flex gap-2">
                <Input
                  id="triggers"
                  placeholder="Add a trigger..."
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTrigger();
                    }
                  }}
                />
                <Button type="button" onClick={addTrigger} variant="secondary">
                  Add
                </Button>
              </div>
              {newSymptom.triggers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newSymptom.triggers.map((trigger) => (
                    <Badge key={trigger} variant="secondary">
                      {trigger}
                      <button
                        onClick={() => removeTrigger(trigger)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Notes</Label>
                <Button
                  type="button"
                  variant={isRecording ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={toggleRecording}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Voice Input
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={newSymptom.notes}
                onChange={(e) =>
                  setNewSymptom({ ...newSymptom, notes: e.target.value })
                }
                rows={3}
              />
              {isRecording && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Listening...
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={addSymptom} className="flex-1">
                Save Symptom
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewSymptom({ name: '', severity: 5, triggers: [], notes: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4>Recent Symptoms</h4>
          {symptoms.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No symptoms logged yet. Click "Add Symptom" to get started.
            </p>
          ) : (
            symptoms.map((symptom) => (
              <div
                key={symptom.id}
                className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4>{symptom.name}</h4>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getSeverityColor(
                            symptom.severity
                          )}`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {symptom.severity}/10
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {symptom.date.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSymptom(symptom.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {symptom.triggers.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm mb-1">Triggers:</p>
                    <div className="flex flex-wrap gap-1">
                      {symptom.triggers.map((trigger, idx) => (
                        <Badge key={idx} variant="outline">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {symptom.notes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {symptom.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
