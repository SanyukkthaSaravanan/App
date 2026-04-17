import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Plus, Pill, Clock, AlertCircle, CheckCircle2, Mic, MicOff, ScanLine } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  taken: boolean[];
  notes: string;
}

export function MedicationManager() {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Methotrexate',
      dosage: '15mg',
      frequency: 'Weekly',
      time: ['Monday 9:00 AM'],
      taken: [true],
      notes: 'Take with food',
    },
    {
      id: '2',
      name: 'Prednisone',
      dosage: '5mg',
      frequency: 'Daily',
      time: ['8:00 AM', '8:00 PM'],
      taken: [true, false],
      notes: 'Do not take on empty stomach',
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    time: '',
    notes: '',
  });

  const addMedication = () => {
    if (!newMed.name || !newMed.dosage) return;

    const times = newMed.time.split(',').map((t) => t.trim());
    const medication: Medication = {
      id: Date.now().toString(),
      name: newMed.name,
      dosage: newMed.dosage,
      frequency: newMed.frequency,
      time: times,
      taken: times.map(() => false),
      notes: newMed.notes,
    };

    setMedications([...medications, medication]);
    setNewMed({ name: '', dosage: '', frequency: 'Daily', time: '', notes: '' });
    setShowAddForm(false);
  };

  const toggleTaken = (medId: string, timeIndex: number) => {
    setMedications(
      medications.map((med) => {
        if (med.id === medId) {
          const newTaken = [...med.taken];
          newTaken[timeIndex] = !newTaken[timeIndex];
          return { ...med, taken: newTaken };
        }
        return med;
      })
    );
  };

  const getCompletionStatus = (med: Medication) => {
    const taken = med.taken.filter((t) => t).length;
    const total = med.taken.length;
    return { taken, total, percentage: (taken / total) * 100 };
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // Mock voice recording - simulates voice input for medication logging
    if (!isRecording) {
      setTimeout(() => {
        setNewMed({
          ...newMed,
          name: 'Hydroxychloroquine',
          dosage: '200mg',
          time: '9:00 AM',
          notes: 'Take with breakfast to reduce stomach upset',
        });
        setIsRecording(false);
      }, 2500);
    }
  };

  const toggleMedicationScan = () => {
    setIsScanning(!isScanning);
    // Mock medication scan - simulates scanning a medication bottle/package
    if (!isScanning) {
      setTimeout(() => {
        setNewMed({
          ...newMed,
          name: 'Sulfasalazine',
          dosage: '500mg',
          frequency: 'Daily',
          time: '7:00 AM, 7:00 PM',
          notes: 'May cause orange discoloration of urine',
        });
        setIsScanning(false);
      }, 2000);
    }
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
            {/* Voice Input Option */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#F2EEDA' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">Quick voice entry</p>
                  <p className="text-xs text-muted-foreground">
                    Tell us about your medication and we'll fill in the details
                  </p>
                </div>
                <Button
                  variant={isRecording ? 'destructive' : 'default'}
                  size="sm"
                  onClick={toggleVoiceRecording}
                  style={!isRecording ? { backgroundColor: '#7293BB' } : undefined}
                >
                  {isRecording ? (
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
              {isRecording && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm mt-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-blue-800">
                    Listening... Say something like "Hydroxychloroquine 200mg daily at 9 AM with breakfast"
                  </span>
                </div>
              )}
            </div>

            {/* Scan Input Option */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#F2EEDA' }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">Quick scan entry</p>
                  <p className="text-xs text-muted-foreground">
                    Scan your medication bottle/package and we'll fill in the details
                  </p>
                </div>
                <Button
                  variant={isScanning ? 'destructive' : 'default'}
                  size="sm"
                  onClick={toggleMedicationScan}
                  style={!isScanning ? { backgroundColor: '#7293BB' } : undefined}
                >
                  {isScanning ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <ScanLine className="h-4 w-4 mr-2" />
                      Start scan input
                    </>
                  )}
                </Button>
              </div>
              {isScanning && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm mt-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-blue-800">
                    Scanning... Hold your medication bottle/package in front of the camera
                  </span>
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
                          <h4>{med.name}</h4>
                          <Badge variant="outline">{med.frequency}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage}
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