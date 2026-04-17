import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import {
  Mic,
  X,
  Activity,
  Heart,
  Zap,
  Apple,
  CheckCircle2,
  Flame,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

interface FlareModeProps {
  onExit: () => void;
  userName: string;
}

const encouragingQuotes = [
  "You're doing the best you can, and that's enough.",
  "Rest is not weakness, it's wisdom.",
  "This flare is temporary. You've gotten through them before.",
  "Be gentle with yourself today. You deserve compassion.",
  "Your body is fighting hard. Give it the care it needs.",
  "One moment at a time. You've got this.",
  "It's okay to do less today. Healing takes priority.",
  "You are stronger than this flare.",
];

export function FlareMode({ onExit, userName }: FlareModeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const [painLevel, setPainLevel] = useState(5);
  const [energy, setEnergy] = useState(2);
  const [currentQuote] = useState(
    encouragingQuotes[Math.floor(Math.random() * encouragingQuotes.length)]
  );
  const [mealLog, setMealLog] = useState('');
  const [symptomNotes, setSymptomNotes] = useState('');
  const [hasLogged, setHasLogged] = useState(false);

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // In a real app, this would trigger voice recognition
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setVoiceNote('Voice note recorded');
      }, 2000);
    }
  };

  const getPainColor = (value: number) => {
    if (value <= 3) return '#A5D3CF';
    if (value <= 7) return '#F59E0B';
    return '#E89BA1';
  };

  const handleQuickLog = () => {
    setHasLogged(true);
    setTimeout(() => setHasLogged(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header with Exit */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onExit}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit Flare Mode
        </Button>
        <Badge
          className="text-white border-0"
          style={{ backgroundColor: '#E89BA1' }}
        >
          <Flame className="h-3 w-3 mr-1" />
          Flare Mode Active
        </Badge>
      </div>

      {/* Encouraging Quote */}
      <Card
        className="border-0 text-center"
        style={{
          background: 'linear-gradient(135deg, #B48CBF 0%, #7293BB 100%)',
        }}
      >
        <CardContent className="pt-8 pb-8">
          <Heart className="h-8 w-8 mx-auto mb-4 text-white" />
          <p className="text-xl text-white font-medium leading-relaxed">
            {currentQuote}
          </p>
          <p className="text-white/80 text-sm mt-3">— You've got this, {userName}</p>
        </CardContent>
      </Card>

      {/* Voice Input - Primary Action */}
      <Card className="border-2" style={{ borderColor: '#A5D3CF' }}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Quick Voice Note</h3>
            <p className="text-sm text-muted-foreground">
              Record how you're feeling
            </p>
            
            <button
              onClick={handleVoiceInput}
              className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all ${
                isRecording ? 'animate-pulse' : ''
              }`}
              style={{
                backgroundColor: isRecording ? '#E89BA1' : '#A5D3CF',
              }}
            >
              {isRecording ? (
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse mb-2" />
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
              ) : (
                <Mic className="h-12 w-12 text-white" />
              )}
            </button>

            <p className="text-sm font-medium">
              {isRecording ? 'Recording...' : 'Tap to record'}
            </p>

            {voiceNote && (
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Voice note saved
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Simplified Symptom Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" style={{ color: '#E89BA1' }} />
            Quick Symptom Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pain Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Pain Level</label>
              <span
                className="text-3xl font-bold"
                style={{ color: getPainColor(painLevel) }}
              >
                {painLevel}
              </span>
            </div>
            <Slider
              value={[painLevel]}
              onValueChange={(value) => setPainLevel(value[0])}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>No pain</span>
              <span>Worst pain</span>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: '#A5D3CF' }} />
                Energy Level
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEnergy(level)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      energy >= level ? 'scale-110' : 'opacity-40'
                    }`}
                    style={{
                      backgroundColor: energy >= level ? '#A5D3CF' : '#E5E7EB',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Symptoms or Notes</label>
            <Textarea
              placeholder="What's bothering you most right now?"
              value={symptomNotes}
              onChange={(e) => setSymptomNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Simplified Diet Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" style={{ color: '#F2EEDA' }} />
            What Did You Eat?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Just jot down what you remember eating today
          </p>
          <Textarea
            placeholder="e.g., Oatmeal for breakfast, chicken soup for lunch..."
            value={mealLog}
            onChange={(e) => setMealLog(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex gap-2">
            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((meal) => (
              <Button
                key={meal}
                variant="outline"
                size="sm"
                onClick={() => setMealLog(mealLog + (mealLog ? '\n' : '') + meal + ': ')}
              >
                + {meal}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card className="border-2" style={{ borderColor: '#7293BB' }}>
        <CardContent className="pt-6">
          <Button
            size="lg"
            className="w-full text-lg"
            style={{ backgroundColor: '#7293BB' }}
            onClick={handleQuickLog}
            disabled={hasLogged}
          >
            {hasLogged ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Logged Successfully
              </>
            ) : (
              <>
                Save Today's Log
                <ChevronRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-3">
            You can always add more details later
          </p>
        </CardContent>
      </Card>

      {/* Gentle Reminders */}
      <Card style={{ backgroundColor: '#FEF2F3' }}>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-3">Gentle Reminders</h4>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-lg">💊</span>
              <span>Remember your medications when you can</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">💧</span>
              <span>Stay hydrated - keep water nearby</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">🛏️</span>
              <span>Rest is healing. Listen to your body</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
