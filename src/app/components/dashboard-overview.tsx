import React, { useState, useEffect } from 'react';
import { checkins as checkinsApi } from '../../lib/api';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { VisuallyHidden } from './ui/visually-hidden';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import fullLogoImage from '../../imports/Flaire_name_logo_updated.png';
import {
  Activity,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Pill,
  Apple,
  FileText,
  Flame,
  User,
  Heart,
  Mic,
  Share2,
  Download,
  Users,
  Moon,
  Zap,
  Brain,
  X,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Gauge,
  Settings,
  Plus,
  Trash2,
  Mail,
  Lock,
  Chrome,
} from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
  onEnableFlareMode: () => void;
}

// Tracking factor types
type InputType = 'checkbox' | 'slider' | 'emoji';

interface TrackingFactor {
  id: string;
  name: string;
  inputType: InputType;
  icon: string;
  color: string;
  enabled: boolean;
  min?: number;
  max?: number;
  emojiOptions?: { emoji: string; label: string; value: number }[];
}

// Default tracking factors
const defaultFactors: TrackingFactor[] = [
  {
    id: 'water',
    name: 'Water Intake',
    inputType: 'slider',
    icon: '💧',
    color: '#7293BB',
    enabled: false,
    min: 0,
    max: 12,
  },
  {
    id: 'stress',
    name: 'Stress Level',
    inputType: 'slider',
    icon: '🧠',
    color: '#E89BA1',
    enabled: false,
    min: 0,
    max: 10,
  },
  {
    id: 'sleep',
    name: 'Sleep Quality',
    inputType: 'emoji',
    icon: '🌙',
    color: '#B48CBF',
    enabled: false,
    emojiOptions: [
      { emoji: '😫', label: 'Terrible', value: 1 },
      { emoji: '😴', label: 'Poor', value: 2 },
      { emoji: '😐', label: 'Okay', value: 3 },
      { emoji: '🙂', label: 'Good', value: 4 },
      { emoji: '😊', label: 'Great', value: 5 },
    ],
  },
  {
    id: 'period',
    name: 'Period',
    inputType: 'checkbox',
    icon: '🩸',
    color: '#E89BA1',
    enabled: false,
  },
  {
    id: 'exercise',
    name: 'Exercise',
    inputType: 'checkbox',
    icon: '🏃',
    color: '#A5D3CF',
    enabled: false,
  },
  {
    id: 'meditation',
    name: 'Meditation',
    inputType: 'checkbox',
    icon: '🧘',
    color: '#B48CBF',
    enabled: false,
  },
];

export function DashboardOverview({ onNavigate, onEnableFlareMode }: DashboardOverviewProps) {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    checkinsApi.today().then((list) => {
      if (list.length > 0) setHasCheckedIn(true);
    }).catch(() => {});
  }, []);
  const [isFlareDay, setIsFlareDay] = useState(true);
  const [flareStartDate] = useState(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)); // 2 days ago
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInStep, setCheckInStep] = useState(1);
  const [showCheckInData, setShowCheckInData] = useState(false);
  const [showPainPrompt, setShowPainPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState('checkin');
  const [trackingFactors, setTrackingFactors] = useState<TrackingFactor[]>(defaultFactors);
  const [additionalData, setAdditionalData] = useState<Record<string, any>>({});
  const [checkInData, setCheckInData] = useState({
    energy: 0,
    pain: 5,
    mood: 0,
    notes: '',
  });
  const [showCaregiverLogin, setShowCaregiverLogin] = useState(false);
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [caregiverPassword, setCaregiverPassword] = useState('');

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const daysSinceFlare = Math.floor(
    (today.getTime() - flareStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Today's Status (auto-generated)
  const todayStatus = isFlareDay
    ? {
        energy: 'Low',
        pain: 'Moderate',
        flare: true,
      }
    : {
        message: 'Feeling steady today',
        flare: false,
      };

  const handleCheckInComplete = () => {
    setHasCheckedIn(true);
    setShowCheckInModal(false);
    setCheckInStep(1);
    setActiveTab('checkin'); // Reset to checkin tab

    // Check if pain level is greater than 0
    if (checkInData.pain > 0) {
      setShowPainPrompt(true);
    }

    checkinsApi.save({
      energy: checkInData.energy || undefined,
      stress: additionalData.stress || undefined,
      sleep: additionalData.sleep === 1 ? 'poor' : additionalData.sleep === 5 ? 'good' : 'okay',
      notes: checkInData.notes || undefined,
    }).catch(console.error);
  };

  const handleCaregiverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (caregiverEmail && caregiverPassword) {
      // Mock caregiver login - just close the modal
      setShowCaregiverLogin(false);
      setCaregiverEmail('');
      setCaregiverPassword('');
      // In a real app, this would authenticate and navigate to caregiver view
      alert('Caregiver login successful! (This is a demo)');
    }
  };

  const hasEnabledFactors = trackingFactors.filter(f => f.enabled).length > 0;
  const totalSteps = hasEnabledFactors ? 5 : 4; // 5 steps if we have additional tracking, 4 otherwise

  const nextStep = () => {
    if (checkInStep < totalSteps) {
      // Skip step 4 if no enabled factors
      if (checkInStep === 3 && !hasEnabledFactors) {
        setCheckInStep(5); // Jump to notes
      } else {
        setCheckInStep(checkInStep + 1);
      }
    } else {
      handleCheckInComplete();
    }
  };

  const prevStep = () => {
    if (checkInStep > 1) {
      // Skip step 4 when going back if no enabled factors
      if (checkInStep === 5 && !hasEnabledFactors) {
        setCheckInStep(3); // Jump back to mood
      } else {
        setCheckInStep(checkInStep - 1);
      }
    }
  };

  const getPainColor = (value: number) => {
    if (value <= 3) return '#A5D3CF'; // mint
    if (value <= 7) return '#F59E0B'; // amber
    return '#E89BA1'; // pink
  };

  const energyLevels = [
    { emoji: '😴', label: 'Exhausted', value: 1 },
    { emoji: '😪', label: 'Tired', value: 2 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '🙂', label: 'Good', value: 4 },
    { emoji: '⚡', label: 'Energized', value: 5 },
  ];

  const moodLevels = [
    { emoji: '😢', label: 'Very Low', value: 1 },
    { emoji: '😞', label: 'Low', value: 2 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '🙂', label: 'Good', value: 4 },
    { emoji: '😄', label: 'Great', value: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Action: Daily Check-In */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
      <Card className="border-2" style={{ borderColor: '#7293BB' }}>
        <CardHeader className="text-center pb-2">
          <p className="text-lg">Hey there San!</p>
          <p className="text-sm text-muted-foreground">{todayStr}</p>
        </CardHeader>
        <CardContent className="pt-2">
          {hasCheckedIn && showCheckInData ? (
            // View logged check-in data
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl">Today's Check-in</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCheckInData(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Energy */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" style={{ color: '#A5D3CF' }} />
                  <span className="font-medium">Energy</span>
                </div>
                <div className="flex items-center gap-2">
                  {checkInData.energy > 0 && (
                    <>
                      <span className="text-2xl">{energyLevels[checkInData.energy - 1].emoji}</span>
                      <span className="text-sm text-muted-foreground">{energyLevels[checkInData.energy - 1].label}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Pain */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" style={{ color: '#E89BA1' }} />
                  <span className="font-medium">Pain Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: getPainColor(checkInData.pain) }}
                  >
                    {checkInData.pain}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 10</span>
                </div>
              </div>

              {/* Mood */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" style={{ color: '#B48CBF' }} />
                  <span className="font-medium">Mood</span>
                </div>
                <div className="flex items-center gap-2">
                  {checkInData.mood > 0 && (
                    <>
                      <span className="text-2xl">{moodLevels[checkInData.mood - 1].emoji}</span>
                      <span className="text-sm text-muted-foreground">{moodLevels[checkInData.mood - 1].label}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              {checkInData.notes && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="h-5 w-5 mt-0.5" style={{ color: '#7293BB' }} />
                    <span className="font-medium">Notes</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">{checkInData.notes}</p>
                </div>
              )}

              {/* Additional Tracking Factors */}
              {Object.keys(additionalData).length > 0 && (
                <div className="space-y-3 mt-6 pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground">Additional Tracking</h4>
                  {trackingFactors.filter(f => additionalData[f.id] !== undefined).map((factor) => {
                    const value = additionalData[factor.id];
                    
                    return (
                      <div key={factor.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{factor.icon}</span>
                          <span className="font-medium">{factor.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {factor.inputType === 'checkbox' && (
                            <Badge 
                              variant="outline" 
                              style={{ 
                                backgroundColor: value ? `${factor.color}20` : '#f3f4f6',
                                borderColor: value ? factor.color : '#e5e7eb',
                                color: value ? factor.color : '#6b7280'
                              }}
                            >
                              {value ? 'Yes' : 'No'}
                            </Badge>
                          )}
                          {factor.inputType === 'slider' && (
                            <>
                              <span 
                                className="text-xl font-bold"
                                style={{ color: factor.color }}
                              >
                                {value}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {factor.id === 'water' ? 'glasses' : `/ ${factor.max}`}
                              </span>
                            </>
                          )}
                          {factor.inputType === 'emoji' && factor.emojiOptions && (
                            <>
                              <span className="text-2xl">
                                {factor.emojiOptions.find(opt => opt.value === value)?.emoji}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {factor.emojiOptions.find(opt => opt.value === value)?.label}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Default check-in view
            <div className="text-center space-y-4">
              <h3 className="text-xl">
                {hasCheckedIn
                  ? "You've checked in today ✓"
                  : isFlareDay
                  ? 'Quick check-in'
                  : 'Check in'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {hasCheckedIn ? 'Come back tomorrow' : 'Takes seconds'}
              </p>
              {hasCheckedIn ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCheckInData(true)}
                >
                  View today's check-in
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full"
                  style={{ backgroundColor: '#7293BB' }}
                  onClick={() => setShowCheckInModal(true)}
                >
                  {isFlareDay ? 'Quick check-in' : 'Check in'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* 4-Step Check-In Modal */}
      <Dialog open={showCheckInModal} onOpenChange={setShowCheckInModal}>
        <DialogContent className="max-w-[600px] rounded-[28px] p-0 max-h-[90vh] overflow-hidden flex flex-col">
          <VisuallyHidden>
            <DialogTitle>Daily Health Check-in</DialogTitle>
            <DialogDescription>
              Complete a check-in to log your health data and manage tracking settings
            </DialogDescription>
          </VisuallyHidden>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="p-6 pb-0">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="checkin">Daily Check-in</TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Customise
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Daily Check-in Tab */}
            <TabsContent value="checkin" className="flex-1 overflow-y-auto p-8 pt-4">
              <div className="space-y-6">
                {/* Core Check-in Steps */}
                {checkInStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-semibold mb-2">How's your energy?</h2>
                      <p className="text-sm text-muted-foreground">Select how you're feeling</p>
                    </div>
                    <div className="flex justify-center gap-3">
                      {energyLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setCheckInData({ ...checkInData, energy: level.value })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                            checkInData.energy === level.value
                              ? 'bg-[#7293BB] text-white scale-110'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-3xl">{level.emoji}</span>
                          <span className="text-xs">{level.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {checkInStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-semibold mb-2">Pain level?</h2>
                      <p className="text-sm text-muted-foreground">0 is no pain, 10 is worst pain</p>
                    </div>
                    <div className="space-y-4">
                      <div
                        className="text-6xl font-bold text-center"
                        style={{ color: getPainColor(checkInData.pain) }}
                      >
                        {checkInData.pain}
                      </div>
                      <Slider
                        value={[checkInData.pain]}
                        onValueChange={(value) => setCheckInData({ ...checkInData, pain: value[0] })}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 - No pain</span>
                        <span>10 - Worst pain</span>
                      </div>
                    </div>
                  </div>
                )}

                {checkInStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-semibold mb-2">How's your mood?</h2>
                      <p className="text-sm text-muted-foreground">Select how you're feeling emotionally</p>
                    </div>
                    <div className="flex justify-center gap-3">
                      {moodLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setCheckInData({ ...checkInData, mood: level.value })}
                          className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                            checkInData.mood === level.value
                              ? 'bg-[#7293BB] text-white scale-110'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-3xl">{level.emoji}</span>
                          <span className="text-xs">{level.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Tracking Factors */}
                {checkInStep === 4 && (
                  <div className="space-y-6">
                    {trackingFactors.filter(f => f.enabled).length > 0 && (
                      <div className="space-y-4">
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-semibold mb-2">Additional tracking</h2>
                          <p className="text-sm text-muted-foreground">Track your customized factors</p>
                        </div>
                        {trackingFactors.filter(f => f.enabled).map((factor) => (
                          <div key={factor.id} className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{factor.icon}</span>
                              <span className="font-medium">{factor.name}</span>
                            </div>
                            
                            {factor.inputType === 'checkbox' && (
                              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                <span className="text-sm">Did you have {factor.name.toLowerCase()} today?</span>
                                <Switch
                                  checked={additionalData[factor.id] || false}
                                  onCheckedChange={(checked) => 
                                    setAdditionalData({ ...additionalData, [factor.id]: checked })
                                  }
                                />
                              </div>
                            )}
                            
                            {factor.inputType === 'slider' && (
                              <div className="space-y-3">
                                <div className="text-center">
                                  <span 
                                    className="text-4xl font-bold"
                                    style={{ color: factor.color }}
                                  >
                                    {additionalData[factor.id] ?? Math.floor((factor.max! - factor.min!) / 2)}
                                  </span>
                                  {factor.id === 'water' && <span className="text-sm ml-2 text-muted-foreground">glasses</span>}
                                </div>
                                <Slider
                                  value={[additionalData[factor.id] ?? Math.floor((factor.max! - factor.min!) / 2)]}
                                  onValueChange={(value) => 
                                    setAdditionalData({ ...additionalData, [factor.id]: value[0] })
                                  }
                                  min={factor.min}
                                  max={factor.max}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{factor.min}</span>
                                  <span>{factor.max}</span>
                                </div>
                              </div>
                            )}
                            
                            {factor.inputType === 'emoji' && factor.emojiOptions && (
                              <div className="flex justify-center gap-2">
                                {factor.emojiOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => 
                                      setAdditionalData({ ...additionalData, [factor.id]: option.value })
                                    }
                                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                                      additionalData[factor.id] === option.value
                                        ? 'scale-110'
                                        : 'opacity-60 hover:opacity-100'
                                    }`}
                                    style={{
                                      backgroundColor: additionalData[factor.id] === option.value ? factor.color : '#f3f4f6',
                                      color: additionalData[factor.id] === option.value ? 'white' : 'inherit',
                                    }}
                                  >
                                    <span className="text-2xl">{option.emoji}</span>
                                    <span className="text-xs">{option.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Notes */}
                {checkInStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-semibold mb-2">Any notes?</h2>
                      <p className="text-sm text-muted-foreground">Optional - add anything you'd like to remember</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" style={{ backgroundColor: '#A5D3CF20', borderColor: '#A5D3CF' }}>
                          3/4 meds taken
                        </Badge>
                        <Badge variant="outline" style={{ backgroundColor: '#F2EEDA', borderColor: '#F2EEDA' }}>
                          2 meals logged
                        </Badge>
                      </div>
                      <Textarea
                        placeholder="How are you feeling today? Any observations..."
                        value={checkInData.notes}
                        onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step Dots */}
                <div className="flex justify-center gap-2 mt-8 mb-6">
                  {[1, 2, 3, trackingFactors.filter(f => f.enabled).length > 0 ? 4 : null, 5].filter(Boolean).map((step, idx, arr) => (
                    <div
                      key={step}
                      className={`h-2 rounded-full transition-all ${
                        step === checkInStep
                          ? 'w-8 bg-[#7293BB]'
                          : (step ?? 0) < checkInStep
                          ? 'w-2 bg-[#7293BB]'
                          : 'w-2 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3">
                  {checkInStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}
                  <Button
                    onClick={nextStep}
                    className="flex-1"
                    style={{ backgroundColor: '#7293BB' }}
                  >
                    {checkInStep === 5 ? 'Complete' : 'Continue'}
                    {checkInStep < 5 && <ChevronRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="flex-1 overflow-y-auto p-8 pt-4">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Customize Your Tracking</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose what you want to track in your daily check-in
                  </p>
                </div>

                {/* Tracking Factors List */}
                <div className="space-y-4">
                  {trackingFactors.map((factor) => (
                    <div
                      key={factor.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{factor.icon}</span>
                        <div>
                          <p className="font-medium">{factor.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            Input: {factor.inputType === 'checkbox' ? 'Yes/No' : factor.inputType}
                            {factor.inputType === 'slider' && ` (${factor.min}-${factor.max})`}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={factor.enabled}
                        onCheckedChange={(checked) => {
                          setTrackingFactors(trackingFactors.map(f => 
                            f.id === factor.id ? { ...f, enabled: checked } : f
                          ));
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    Enable the factors you want to include in your daily check-in. Changes will apply to your next check-in.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Flare Awareness Section (Conditional) */}
      {isFlareDay && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="border-2" style={{ borderColor: '#E89BA1', backgroundColor: '#FEF2F3' }}>
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: '#E89BA1' }}
                >
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="mb-1">You're currently in a flare</h4>
                  <p className="text-sm text-muted-foreground">
                    Flare started {daysSinceFlare} {daysSinceFlare === 1 ? 'day' : 'days'} ago
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="text-white border-0"
                  style={{ backgroundColor: '#E89BA1' }}
                  onClick={onEnableFlareMode}
                >
                  Enable flare day mode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      )}

      {/* Core Symptom Snapshot - Last 7 Days */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <h4 className="mb-3">Last 7 days</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'Energy',
              icon: Zap,
              color: '#A5D3CF',
              trend: 'up',
              visual: [3, 4, 3, 5, 4, 6, 5],
            },
            {
              label: 'Pain',
              icon: Activity,
              color: '#E89BA1',
              trend: 'down',
              visual: [7, 6, 5, 6, 5, 4, 5],
            },
            {
              label: 'Sleep',
              icon: Moon,
              color: '#B48CBF',
              trend: 'stable',
              visual: [4, 5, 3, 6, 5, 5, 4],
            },
            {
              label: 'Stress',
              icon: Brain,
              color: '#7293BB',
              trend: 'down',
              visual: [6, 5, 5, 4, 4, 3, 4],
            },
          ].map((symptom, i) => {
            const Icon = symptom.icon;
            return (
              <motion.div key={symptom.label} whileHover={{ y: -3, scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-1.5 rounded"
                          style={{ backgroundColor: symptom.color }}
                        >
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm">{symptom.label}</span>
                      </div>
                      {symptom.trend === 'up' && (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      )}
                      {symptom.trend === 'down' && (
                        <TrendingDown className="h-3 w-3 text-amber-600" />
                      )}
                    </div>
                    {/* Mini visual representation */}
                    <div className="flex items-end gap-0.5 h-8">
                      {symptom.visual.map((value, idx) => (
                        <div
                          key={idx}
                          className="flex-1 rounded-sm"
                          style={{
                            backgroundColor: symptom.color,
                            height: `${(value / 10) * 100}%`,
                            opacity: 0.6,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Body Map Summary */}
      

      {/* Medication Status - Non-Policing */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" style={{ color: '#CDADD0' }} />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Taken today ✓</span>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                3 of 4 medications logged
              </p>
            </div>
            <Button variant="outline" onClick={() => onNavigate('medications')}>Log meds</Button>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Gentle Insights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
      <Card style={{ backgroundColor: '#F8F6FF' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" style={{ color: '#B48CBF' }} />
            Patterns & Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              insight: 'Flares often follow poor sleep',
              confidence: 'Strong pattern',
            },
            {
              insight: 'Pain is higher on high-stress days',
              confidence: 'Moderate pattern',
            },
            {
              insight: 'Energy improves when meds are taken consistently',
              confidence: 'Strong pattern',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-lg border flex items-start justify-between"
            >
              <div>
                <p className="text-sm font-medium mb-1">{item.insight}</p>
                <p className="text-xs text-muted-foreground">{item.confidence}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2" onClick={() => onNavigate('insights')}>
            View details
          </Button>
        </CardContent>
      </Card>
      </motion.div>

      {/* Notes & Voice Logs */}
      

      {/* Care / Support Access */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-5 w-5" style={{ color: '#7293BB' }} />
            Support
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Button variant="outline" className="w-full justify-center" onClick={() => setShowCaregiverLogin(true)}>
            <Users className="h-4 w-4 mr-2" />
            Caregiver access
          </Button>
        </CardContent>
      </Card>
      </motion.div>

      {/* Empty State (shown when no data) */}
      {false && ( // Toggle this based on data presence
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="mb-2">You don't need perfect data to get value here.</h3>
            <p className="text-muted-foreground mb-6">
              Start with how today feels.
            </p>
            <Button size="lg" style={{ backgroundColor: '#7293BB' }}>
              First check-in
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pain Logging Prompt Dialog */}
      <Dialog open={showPainPrompt} onOpenChange={setShowPainPrompt}>
        <DialogContent className="max-w-[440px] rounded-[28px] p-0">
          <VisuallyHidden>
            <DialogTitle>Log Pain Details</DialogTitle>
            <DialogDescription>
              You mentioned experiencing pain. Would you like to log more details about it?
            </DialogDescription>
          </VisuallyHidden>
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setShowPainPrompt(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-8 text-center space-y-6">
              {/* Pain icon */}
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: '#E89BA1' }}
              >
                <Activity className="h-8 w-8 text-white" />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  You have mentioned a pain level of {checkInData.pain}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Do you want to log the pain?
                </p>
              </div>

              {/* Yes button */}
              <Button
                size="lg"
                className="w-full"
                style={{ backgroundColor: '#7293BB' }}
                onClick={() => {
                  setShowPainPrompt(false);
                  onNavigate('symptoms');
                }}
              >
                Yes, log pain details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Caregiver Login Dialog */}
      <Dialog open={showCaregiverLogin} onOpenChange={setShowCaregiverLogin}>
        <DialogContent className="max-w-[500px] rounded-[28px] p-0 max-h-[90vh] overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Caregiver Login</DialogTitle>
            <DialogDescription>
              Login to your caregiver account to access patient information
            </DialogDescription>
          </VisuallyHidden>
          <div className="p-8">
            {/* Logo & Welcome */}
            <div className="text-center mb-8">
              <img src={fullLogoImage} alt="Flaire" className="mb-4 mx-auto h-auto max-w-[200px]" style={{ mixBlendMode: 'multiply' }} />
              <h2 className="text-2xl font-semibold mb-2">Login to your Caregiver Account</h2>
              <p className="text-sm text-muted-foreground">Access and support your loved ones</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleCaregiverLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caregiver-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="caregiver-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={caregiverEmail}
                    onChange={(e) => setCaregiverEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="caregiver-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="caregiver-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={caregiverPassword}
                    onChange={(e) => setCaregiverPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-6"
                size="lg"
                style={{ backgroundColor: '#7293BB' }}
              >
                Log In
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => {
                  // Mock Google login for caregiver
                  setShowCaregiverLogin(false);
                  alert('Caregiver Google login successful! (This is a demo)');
                }}
              >
                <Chrome className="mr-2 h-5 w-5" />
                Log In with Google
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                className="text-sm text-muted-foreground hover:underline"
                style={{ color: '#7293BB' }}
              >
                Forgot password?
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}