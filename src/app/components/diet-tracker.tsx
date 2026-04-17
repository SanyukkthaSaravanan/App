import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Plus, X, Apple, AlertTriangle, Mic, MicOff, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface FoodEntry {
  id: string;
  name: string;
  category: string;
  time: string;
  reaction: 'positive' | 'negative' | 'neutral';
  notes: string;
  date: Date;
}

const foodCategories = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Beverage',
];

const commonTriggers = [
  'Dairy',
  'Gluten',
  'Nightshades',
  'Sugar',
  'Processed Foods',
  'Caffeine',
  'Alcohol',
];

export function DietTracker() {
  const [entries, setEntries] = useState<FoodEntry[]>([
    {
      id: '1',
      name: 'Oatmeal with berries',
      category: 'Breakfast',
      time: '8:00 AM',
      reaction: 'positive',
      notes: 'Felt good, no issues',
      date: new Date(),
    },
    {
      id: '2',
      name: 'Coffee',
      category: 'Beverage',
      time: '8:30 AM',
      reaction: 'negative',
      notes: 'Increased joint pain after 2 hours',
      date: new Date(),
    },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: '',
    category: 'Breakfast',
    time: '',
    reaction: 'neutral' as 'positive' | 'negative' | 'neutral',
    notes: '',
  });
  const [flaggedFoods, setFlaggedFoods] = useState<string[]>([
    'Coffee',
    'Tomatoes',
  ]);
  const [confirmedTriggers, setConfirmedTriggers] = useState<string[]>([
    'Dairy',
    'Gluten',
  ]);
  const [showAddTrigger, setShowAddTrigger] = useState(false);
  const [newTrigger, setNewTrigger] = useState('');

  const addEntry = () => {
    if (!newEntry.name) return;

    const entry: FoodEntry = {
      id: Date.now().toString(),
      name: newEntry.name,
      category: newEntry.category,
      time: newEntry.time,
      reaction: newEntry.reaction,
      notes: newEntry.notes,
      date: new Date(),
    };

    setEntries([entry, ...entries]);
    
    // Auto-flag foods with negative reactions
    if (newEntry.reaction === 'negative' && !flaggedFoods.includes(newEntry.name)) {
      setFlaggedFoods([...flaggedFoods, newEntry.name]);
    }

    setNewEntry({
      name: '',
      category: 'Breakfast',
      time: '',
      reaction: 'neutral',
      notes: '',
    });
    setShowAddForm(false);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const getReactionIcon = (reaction: string) => {
    switch (reaction) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😟';
      default:
        return '😐';
    }
  };

  const getReactionColor = (reaction: string) => {
    switch (reaction) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // Mock voice recording - simulates voice input for food logging
    if (!isRecording) {
      setTimeout(() => {
        setNewEntry({
          ...newEntry,
          name: 'Grilled salmon with quinoa and steamed broccoli',
          category: 'Lunch',
          time: '12:30',
          reaction: 'positive',
          notes: 'Felt energized and no stomach issues',
        });
        setIsRecording(false);
      }, 2500);
    }
  };

  const addTrigger = () => {
    if (!newTrigger) return;

    setConfirmedTriggers([...confirmedTriggers, newTrigger]);
    setNewTrigger('');
    setShowAddTrigger(false);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Diet Tracker</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Log meals and track food reactions
              </p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Food
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
                      Tell us what you ate and how you felt
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
                      Listening... Say something like "I had salmon and quinoa for lunch at 12:30 and felt great"
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
                  <Label htmlFor="food-name">Food/Meal</Label>
                  <Input
                    id="food-name"
                    placeholder="What did you eat?"
                    value={newEntry.name}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newEntry.category}
                    onValueChange={(value) =>
                      setNewEntry({ ...newEntry, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {foodCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEntry.time}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, time: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reaction">How did you feel?</Label>
                  <Select
                    value={newEntry.reaction}
                    onValueChange={(value: any) =>
                      setNewEntry({ ...newEntry, reaction: value })
                    }
                  >
                    <SelectTrigger id="reaction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">😊 Positive</SelectItem>
                      <SelectItem value="neutral">😐 Neutral</SelectItem>
                      <SelectItem value="negative">😟 Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="food-notes">Notes</Label>
                <Textarea
                  id="food-notes"
                  placeholder="Any reactions or observations..."
                  value={newEntry.notes}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addEntry} className="flex-1">
                  Save Entry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewEntry({
                      name: '',
                      category: 'Breakfast',
                      time: '',
                      reaction: 'neutral',
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
            <h4>Today's Food Log</h4>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No entries yet. Start logging your meals to track patterns.
              </p>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: '#A5D3CF' }}
                      >
                        <Apple className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4>{entry.name}</h4>
                          {flaggedFoods.includes(entry.name) && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline">{entry.category}</Badge>
                          <Badge variant="outline">{entry.time}</Badge>
                          <Badge
                            className={`${getReactionColor(entry.reaction)} border`}
                          >
                            {getReactionIcon(entry.reaction)} {entry.reaction}
                          </Badge>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(entry.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmed Trigger Foods - Shows above potential triggers */}
      <Card className="border-red-300 bg-red-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Confirmed Trigger Foods
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddTrigger(!showAddTrigger)}
              style={{ 
                backgroundColor: showAddTrigger ? '#F2EEDA' : '#7293BB',
                color: showAddTrigger ? '#000' : '#fff',
                borderColor: showAddTrigger ? '#ccc' : '#7293BB'
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              {showAddTrigger ? 'Cancel' : 'Add Trigger'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700 mb-3">
            Foods you've identified as consistent triggers for your symptoms
          </p>

          {showAddTrigger && (
            <div className="p-3 mb-4 border rounded-lg bg-white space-y-3">
              <div className="space-y-2">
                <Label htmlFor="trigger-food">Food or ingredient</Label>
                <Input
                  id="trigger-food"
                  placeholder="e.g., Dairy, Eggs, Soy..."
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addTrigger();
                    }
                  }}
                />
              </div>
              <Button
                onClick={addTrigger}
                size="sm"
                className="w-full"
                style={{ backgroundColor: '#7293BB' }}
              >
                Save Trigger
              </Button>
            </div>
          )}

          {confirmedTriggers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center bg-white rounded-lg border border-dashed">
              No confirmed triggers yet. Add foods you know cause symptoms.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {confirmedTriggers.map((trigger) => (
                <Badge
                  key={trigger}
                  variant="outline"
                  className="bg-white border-red-400 text-red-800 text-sm py-1.5 px-3"
                >
                  {trigger}
                  <button
                    onClick={() =>
                      setConfirmedTriggers(confirmedTriggers.filter((t) => t !== trigger))
                    }
                    className="ml-2 hover:text-red-600"
                    aria-label={`Remove ${trigger}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {flaggedFoods.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Potential Trigger Foods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 mb-3">
              Based on your logged reactions, these foods may trigger symptoms:
            </p>
            <div className="flex flex-wrap gap-2">
              {flaggedFoods.map((food) => (
                <Badge
                  key={food}
                  variant="outline"
                  className="bg-white border-amber-300 text-amber-800"
                >
                  {food}
                  <button
                    onClick={() =>
                      setFlaggedFoods(flaggedFoods.filter((f) => f !== food))
                    }
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Common Autoimmune Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Watch for these common food triggers:
          </p>
          <div className="flex flex-wrap gap-2">
            {commonTriggers.map((trigger) => (
              <Badge key={trigger} variant="secondary">
                {trigger}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}