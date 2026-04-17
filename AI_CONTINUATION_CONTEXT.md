# 🤖 FLAIRE - AI CONTINUATION CONTEXT
## Complete Project State for Seamless AI Handoff

**Created:** April 15, 2026  
**Version:** 3.0 (Animated & AI-Enhanced)  
**Purpose:** This document contains EVERYTHING an AI needs to understand Flaire and continue development as if the entire project was made in a single chat session.

---

## 🎯 WHAT IS FLAIRE?

Flaire is a **compassionate, low-pressure health tracking web application** designed specifically for autoimmune patients (Rheumatoid Arthritis, Lupus, Crohn's, MS, etc.). It helps users track symptoms, medications, diet, and health patterns **without judgment, guilt, or pressure**.

### Core Philosophy (CRITICAL)
- **Compassionate language only** - Never use "failed", "missed", "warning" (use "gentle reminder")
- **Soothing color palette** - Blues, purples, mint, pink (no harsh reds)
- **Low-pressure interactions** - Everything is optional, nothing is required
- **Flare Day Mode** - Simplified interface for bad health days

---

## 📊 PROJECT STATUS

### What's Complete ✅
- Full React + TypeScript frontend application
- Complete authentication system (login/signup/logout with localStorage)
- 8 main feature pages (all animated and functional)
- AI-powered Quick Help chatbot (speech-to-text + image upload)
- Flare Day Mode (compassionate simplified interface)
- Customizable daily check-in system
- Animation system with Motion library (all pages animated)
- Mobile responsive (bottom nav + hamburger menu)
- 60+ UI components (Radix UI/shadcn)

### What's Mocked (No Backend) ❌
- User authentication (localStorage only, no real accounts)
- All health data (hardcoded/local state)
- AI chatbot responses (random mocked responses)
- Voice recognition (Web Speech API, Chrome/Edge only)
- Image analysis (random responses to uploaded images)
- Medication scanning (simulated OCR)

### Current Version: 3.0 (April 2026)
**Major Changes from V2.0:**
1. Complete animation system with motion/react
2. Full authentication flow (auth.tsx, dashboard.tsx)
3. Quick Help AI chatbot with speech & image input
4. Flare Day Mode (flare-mode.tsx)
5. Customizable check-in tracking tabs
6. All 7 sub-pages have staggered card animations
7. Dashboard UI refinements (merged greeting, caregiver login, etc.)

---

## 🛠️ TECHNICAL STACK

### Core Technologies
```json
{
  "framework": "React 18.3.1",
  "language": "TypeScript (.tsx files)",
  "build": "Vite 6.3.5",
  "styling": "Tailwind CSS 4.1.12",
  "animations": "Motion (motion/react) 12.23.24",
  "components": "Radix UI (shadcn/ui)",
  "charts": "Recharts 2.15.2",
  "icons": "Lucide React 0.487.0",
  "forms": "React Hook Form 7.55.0",
  "package_manager": "pnpm"
}
```

### Key Dependencies
```bash
# UI Components
@radix-ui/* (40+ primitives)

# Animation
motion@12.23.24

# Data Visualization
recharts@2.15.2

# Icons
lucide-react@0.487.0

# Forms
react-hook-form@7.55.0

# Dates
date-fns@3.6.0

# Notifications
sonner@2.0.3
```

---

## 🎨 DESIGN SYSTEM

### Brand Colors (Use Inline Styles)
```css
/* Primary Colors */
--primary-blue: #7293BB;      /* Main actions, navigation, buttons */
--secondary-purple: #B48CBF;  /* Secondary actions, AI features, Quick Help */
--mint: #A5D3CF;              /* Success, mild severity, calming accents */
--pink: #E89BA1;              /* Warnings, high severity, flare indicators */
--amber: #F59E0B;             /* Moderate severity, caution */

/* Usage in code */
style={{ backgroundColor: '#7293BB' }}
style={{ color: '#B48CBF' }}
```

### Severity Color Coding
```typescript
function getSeverityColor(severity: number): string {
  if (severity >= 8) return '#E89BA1';  // Severe (pink)
  if (severity >= 5) return '#F59E0B';  // Moderate (amber)
  return '#A5D3CF';                     // Mild (mint)
}
```

### Typography
- Headings: System font stack (defined in theme.css)
- Body: Default Tailwind font
- Compassionate voice: Gentle, supportive, never harsh

---

## 📁 PROJECT STRUCTURE

```
/workspaces/default/code/
├── src/
│   ├── app/
│   │   ├── App.tsx                      # Entry point, manages auth state
│   │   └── components/
│   │       ├── auth.tsx                 # Login/signup page ⭐ V3.0
│   │       ├── dashboard.tsx            # Dashboard container ⭐ V3.0
│   │       ├── dashboard-overview.tsx   # Dashboard home page
│   │       ├── flare-mode.tsx           # Flare Day Mode ⭐ V3.0
│   │       ├── motion-utils.tsx         # Animation utilities ⭐ V3.0
│   │       ├── daily-checkin.tsx        # Check-in component
│   │       ├── symptoms-view.tsx        # Symptoms page
│   │       ├── medication-manager.tsx   # Medications page
│   │       ├── diet-tracker.tsx         # Diet tracking
│   │       ├── health-calendar.tsx      # Calendar view
│   │       ├── health-insights.tsx      # Charts & insights
│   │       ├── medical-records.tsx      # Medical records
│   │       ├── community.tsx            # Community features
│   │       ├── body-map-new.tsx         # Body mapping (current)
│   │       ├── symptom-tracker.tsx      # Symptom helper
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx  # ⚠️ PROTECTED
│   │       └── ui/                      # 60+ Radix UI components
│   ├── imports/
│   │   └── Flaire_name_logo_updated.png  # Full logo
│   └── styles/
│       ├── theme.css        # CSS variables
│       ├── tailwind.css     # Tailwind config
│       ├── fonts.css        # Font imports
│       └── index.css        # Global styles
├── package.json
└── .npmrc
```

---

## 🧩 KEY COMPONENTS EXPLAINED

### 1. App.tsx - Root Component
**Purpose:** Manages authentication state and routing

**Flow:**
```typescript
1. On mount → Check localStorage for 'flaireUser'
2. If user exists → Show <Dashboard>
3. If no user → Show <Auth>
4. Loading state → Animated butterfly logo
```

**Key State:**
```typescript
const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState(true);

interface User {
  email: string;
  name: string;
}
```

**Callbacks:**
- `handleLogin(email, name)` → Save user to state + localStorage
- `handleLogout()` → Clear user state + localStorage

---

### 2. Auth.tsx - Login/Signup Page
**Location:** `/src/app/components/auth.tsx`

**Features:**
- Tabs for Login vs Signup
- Email/password forms
- Google auth button (mocked)
- Animated logo entrance
- Cursor glow effect
- Floating particles background
- Radial gradient background

**Props:**
```typescript
interface AuthProps {
  onLogin: (email: string, name: string) => void;
}
```

**Animations:**
- Logo: `initial={{ opacity: 0, scale: 0.7, rotate: -10 }}`
- Cards: `whileHover={{ y: -2 }}`
- Background: `CursorGlow` + `FloatingParticles` from motion-utils

---

### 3. Dashboard.tsx - Main Container
**Location:** `/src/app/components/dashboard.tsx`

**Purpose:** Wrapper for all authenticated pages

**Features:**
- Header with logo + welcome + logout
- Desktop sidebar navigation (8 tabs)
- Mobile bottom nav (4 tabs) + hamburger menu
- Quick Help AI chatbot (bottom-left sidebar button)
- AnimatePresence for page transitions
- Flare Mode toggle

**Props:**
```typescript
interface DashboardProps {
  userName: string;
  onLogout: () => void;
}
```

**Navigation Structure:**
```typescript
const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'symptoms', name: 'Symptoms', icon: Activity },
  { id: 'medications', name: 'Medications', icon: Pill },
  { id: 'diet', name: 'Diet', icon: Apple },
  { id: 'calendar', name: 'Calendar', icon: Calendar },
  { id: 'insights', name: 'Insights', icon: TrendingUp },
  { id: 'community', name: 'Community', icon: Users },
  { id: 'records', name: 'Records', icon: FileText },
];
```

**Quick Help Chatbot:**
- Purple button with Sparkles icon (#B48CBF)
- Dialog with chat interface
- Speech-to-text (mic button, Web Speech API)
- Image upload (camera button)
- Quick action buttons
- Mocked AI responses

---

### 4. DashboardOverview.tsx - Dashboard Home
**Location:** `/src/app/components/dashboard-overview.tsx`

**Features:**
- Greeting card with user name
- Quick Check-In button (merged with greeting)
- Today's status card
- Flare day indicator (if active)
- Stats cards (medications due, symptoms logged)
- Enable Flare Mode button
- Caregiver Login button

**Check-In Modal (Multi-step):**
1. **Check-In Tab:**
   - Energy slider (0-10)
   - Pain slider (0-10)
   - Mood slider (0-10)
   - Notes textarea

2. **Custom Tracking Tabs** (if enabled):
   - Water intake (0-12 glasses)
   - Stress level (0-10)
   - Sleep quality (5 emoji options)
   - Period (checkbox)
   - Exercise (checkbox)
   - Meditation (checkbox)

3. **Customize Tab:**
   - Toggle tracking factors on/off
   - Add custom tracking items

**Pain Prompt:**
- If pain > 0 after check-in → Dialog asks if user wants to log symptoms
- Two buttons: "Log Symptoms" (navigate to symptoms page) or "Maybe Later"

---

### 5. FlareMode.tsx - Flare Day Interface
**Location:** `/src/app/components/flare-mode.tsx`

**Purpose:** Simplified, compassionate interface for bad health days

**Features:**
- Encouraging quote card (randomized)
- Large voice note button (circular mic, pulsing)
- Quick pain slider (0-10, color-coded)
- Quick energy slider (0-10)
- Minimal meal log (simple textarea)
- Symptom notes (simple textarea)
- Quick Log button (one-tap save)
- Exit button (returns to normal dashboard)

**Design Principles:**
- Reduced cognitive load
- Large touch targets
- Minimal text input
- Voice-first interactions
- No pressure to log everything
- Compassionate language throughout

**Quote Examples:**
```typescript
const encouragingQuotes = [
  "You're doing the best you can, and that's enough.",
  "Rest is not weakness, it's wisdom.",
  "This flare is temporary. You've gotten through them before.",
  // ...more quotes
];
```

---

### 6. motion-utils.tsx - Animation Utilities
**Location:** `/src/app/components/motion-utils.tsx`

**Purpose:** Reusable animation components

**Components:**

1. **CursorGlow** - Mouse-following gradient blob
```tsx
<CursorGlow color="rgba(114, 147, 187, 0.15)" size={600} />
```

2. **FloatingParticles** - Animated background dots
```tsx
<FloatingParticles count={20} />
```

3. **StaggerContainer** / **StaggerItem** - Parent/child stagger
```tsx
<StaggerContainer stagger={0.06}>
  <StaggerItem>Card 1</StaggerItem>
  <StaggerItem>Card 2</StaggerItem>
</StaggerContainer>
```

4. **TiltCard** - 3D tilt on mouse move
```tsx
<TiltCard tiltAmount={4}>
  <Card />
</TiltCard>
```

5. **FadeInView** - Fade in on mount
```tsx
<FadeInView delay={0.3}>
  <Content />
</FadeInView>
```

6. **AnimatedNumber** - Smooth number transitions
```tsx
<AnimatedNumber value={count} className="text-2xl" />
```

7. **PageTransition** - Wrapper for page changes
```tsx
<PageTransition key={activeTab}>
  <PageContent />
</PageTransition>
```

8. **BreathingGlow** - Pulsing box-shadow
```tsx
<BreathingGlow color="rgba(180, 140, 191, 0.3)">
  <Logo />
</BreathingGlow>
```

---

## 🎬 ANIMATION PATTERNS

### Page Transitions
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3 }}
  >
    {pageContent}
  </motion.div>
</AnimatePresence>
```

### Staggered Cards (Used on ALL sub-pages)
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.4 }}
  >
    <Card>{item}</Card>
  </motion.div>
))}
```

### Hover Effects
```tsx
<motion.div
  whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(114, 147, 187, 0.15)' }}
  whileTap={{ scale: 0.98 }}
>
```

### Logo Entrance
```tsx
<motion.img
  initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
  animate={{ opacity: 1, scale: 1, rotate: 0 }}
  transition={{ duration: 0.6 }}
  whileHover={{ scale: 1.08, rotate: 3 }}
/>
```

---

## 🔐 AUTHENTICATION SYSTEM

### Flow Diagram
```
User Visits App
    ↓
App.tsx checks localStorage
    ↓
┌─────────────────┬─────────────────┐
│ User found?     │ No user?        │
│ ↓               │ ↓               │
│ <Dashboard>     │ <Auth>          │
│                 │ ↓               │
│                 │ Login/Signup    │
│                 │ ↓               │
│                 │ onLogin()       │
│                 │ ↓               │
│                 │ Save to LS      │
│                 │ ↓               │
│                 │ <Dashboard>     │
└─────────────────┴─────────────────┘
```

### Implementation Details

**localStorage Key:** `'flaireUser'`

**User Object:**
```typescript
interface User {
  email: string;
  name: string;
}
```

**Login Function (auth.tsx):**
```typescript
const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  if (loginEmail && loginPassword) {
    const name = loginEmail.split('@')[0];
    onLogin(loginEmail, name);
  }
};
```

**Save to localStorage (App.tsx):**
```typescript
const handleLogin = (email: string, name: string) => {
  const newUser = { email, name };
  setUser(newUser);
  localStorage.setItem('flaireUser', JSON.stringify(newUser));
};
```

**Auto-login on mount (App.tsx):**
```typescript
useEffect(() => {
  const savedUser = localStorage.getItem('flaireUser');
  if (savedUser) {
    try {
      setUser(JSON.parse(savedUser));
    } catch (error) {
      localStorage.removeItem('flaireUser');
    }
  }
  setIsLoading(false);
}, []);
```

**Logout (App.tsx):**
```typescript
const handleLogout = () => {
  setUser(null);
  localStorage.removeItem('flaireUser');
};
```

---

## 🤖 QUICK HELP AI CHATBOT

### Location & Trigger
- **Button:** Left sidebar, bottom position (below navigation)
- **Style:** Purple background (#B48CBF), Sparkles icon
- **Label:** "Quick Help"
- **Animation:** `whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(180, 140, 191, 0.3)' }}`

### Features

#### 1. Speech-to-Text
- Mic button toggles recording
- Uses Web Speech API (Chrome/Edge only)
- Displays "Listening..." animation
- Transcribes to input field

**Implementation:**
```typescript
const handleVoiceInput = () => {
  const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInputMessage(transcript);
  };
  
  recognition.start();
};
```

#### 2. Image Upload & Analysis
- Camera button opens file picker
- Accepts images only
- Displays uploaded image in chat
- Mocked AI response based on image

**Responses:**
```typescript
const imageResponses = [
  "I can see this is a medication bottle. Let me help you add this...",
  "This appears to be a food item. I can help you track this...",
  "I can see some symptoms in this image. Would you like me to log this?",
  // ...more responses
];
```

#### 3. Chat Interface
**Message Format:**
```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string; // base64
}
```

**Initial Message:**
```typescript
const [chatMessages, setChatMessages] = useState([
  {
    role: 'assistant',
    content: "Hi! I'm your Flaire assistant. I can help you with anything..."
  }
]);
```

#### 4. Quick Actions
Pre-defined action buttons:
- "Log symptoms"
- "Add medication"
- "Track diet"
- "View insights"
- "Check calendar"

Clicking a button auto-fills input and sends message.

---

## 📝 DATA STRUCTURES

### User (Authentication)
```typescript
interface User {
  email: string;
  name: string;
}
```

### Medication
```typescript
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // 'Daily' | 'Weekly' | 'Monthly'
  time: string[]; // ['8:00 AM', '8:00 PM']
  taken: boolean[]; // Parallel array to time
  notes: string;
}
```

### Symptom
```typescript
interface BodyPartSymptom {
  id: string;
  part: string; // body part ID (e.g., 'left-knee')
  symptoms: string[]; // ['Pain', 'Swelling']
  severity: number; // 1-10
  date: Date;
}
```

### Check-In Data
```typescript
interface CheckInData {
  energy: number; // 0-10
  pain: number; // 0-10
  mood: number; // 0-10
  notes: string;
  
  // Optional custom tracking
  water?: number; // 0-12
  stress?: number; // 0-10
  sleep?: number; // 1-5 (emoji rating)
  period?: boolean;
  exercise?: boolean;
  meditation?: boolean;
  [customFactorId]?: any;
}
```

### Tracking Factor
```typescript
interface TrackingFactor {
  id: string;
  name: string;
  inputType: 'checkbox' | 'slider' | 'emoji';
  icon: string; // emoji
  color: string; // hex color
  enabled: boolean;
  min?: number; // for slider
  max?: number; // for slider
  emojiOptions?: { emoji: string; label: string; value: number }[];
}
```

---

## 🚨 CRITICAL CONSTRAINTS

### Image Import Issues (IMPORTANT!)

**Problem:**
Cannot import images from `/src/imports/` using relative paths in Figma Make environment.

**Failed Attempt:**
```typescript
// ❌ DOES NOT WORK
import skeletonFront from '../imports/image.png';
import skeletonFront from '../../imports/image.png';
```

**Solutions:**
```typescript
// ✅ Option 1: Use figma:asset scheme
import logo from 'figma:asset/dac63097a8bd4bc07af4c535e6815efced768f3f.png';

// ✅ Option 2: Use base64 encoding (current body map solution)
const skeletonImages = {
  front: 'data:image/png;base64,/9j/4AAQSkZJRgABAQAA...',
  side: 'data:image/png;base64,...',
  back: 'data:image/png;base64,...'
};
```

**What Happened (April 15, 2026):**
- User tried to replace skeleton image in body-map-new.tsx
- Got "Failed to resolve import" error
- Tried correcting path - still failed
- Cleared Vite cache
- Reverted to base64 images
- App restored to working state

**Lesson:** Do NOT attempt to import images from `/src/imports/` - use figma:asset or base64.

---

### Build Environment Constraints

**This is a Figma Make environment, NOT standard Vite:**

❌ **DO NOT:**
- Run `vite build` or `npm run build` (will fail)
- Create or modify `index.html` (auto-generated)
- Try to access localhost URLs in browser
- Manually start dev server

✅ **DO:**
- Use Figma Make preview
- Let dev server auto-run
- Use hot reload (automatic)
- Import images via `figma:asset` scheme

---

### Browser Compatibility

**Web Speech API (Voice Input):**
- ✅ Chrome, Edge
- ❌ Firefox, Safari

**Workaround:**
```typescript
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
  alert('Speech recognition is not supported in your browser.');
  return;
}
```

---

## 🎯 DEVELOPMENT PATTERNS

### Adding a New Feature

1. **Create component** in `/src/app/components/`
2. **Import in parent** (usually dashboard.tsx)
3. **Add to navigation** if needed
4. **Use brand colors** with inline styles
5. **Add animations** from motion-utils
6. **Follow existing patterns** (staggered cards, etc.)

### Example: Adding a New Page

```tsx
// 1. Create new file: /src/app/components/new-feature.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function NewFeature() {
  const [items, setItems] = useState([]);
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <h2 className="text-3xl font-bold">New Feature</h2>
      
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              {/* Content */}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// 2. Import in dashboard.tsx
import { NewFeature } from './new-feature';

// 3. Add to navigation array
const navigation = [
  // ...existing items
  { id: 'new-feature', name: 'New Feature', icon: IconName },
];

// 4. Add to routing in dashboard.tsx
{activeTab === 'new-feature' && <NewFeature />}
```

### Styling Patterns

**Colors:**
```tsx
// ✅ Use inline styles for brand colors
<Button style={{ backgroundColor: '#7293BB' }}>Click Me</Button>
<div style={{ color: '#B48CBF' }}>Text</div>

// ❌ Don't try to add to Tailwind config
className="bg-primary-blue" // Won't work
```

**Layout:**
```tsx
// ✅ Use Tailwind for layout
className="grid grid-cols-1 md:grid-cols-2 gap-6"

// ✅ Common pattern for pages
<div className="space-y-6 pb-20 lg:pb-6">
  {/* pb-20 for mobile bottom nav clearance */}
```

---

## 🐛 KNOWN ISSUES

### 1. Body Map Skeleton Image Import
- **Issue:** Cannot import custom images from /src/imports/
- **Status:** FAILED on April 15, 2026
- **Current:** Using base64 encoded images
- **Solution:** Use figma:asset scheme for new images

### 2. Voice Recognition Browser Support
- **Issue:** Web Speech API only works in Chrome/Edge
- **Impact:** Mic buttons don't work in Firefox/Safari
- **Workaround:** Alert message shown on unsupported browsers

### 3. No Real Backend
- **Issue:** All data is mocked or in localStorage
- **Impact:** No data persistence, no multi-user support
- **Future:** Need Supabase or similar backend

### 4. AI Responses are Mocked
- **Issue:** Chatbot gives random responses
- **Impact:** No real conversational AI
- **Future:** Need real NLP/AI integration

### 5. Image Analysis is Simulated
- **Issue:** Camera upload shows random responses
- **Impact:** No real OCR or image recognition
- **Future:** Need ML model for image analysis

---

## 🚀 NEXT STEPS / FUTURE ENHANCEMENTS

### Backend Integration
1. **Supabase Setup**
   - User authentication (JWT)
   - Database for symptoms, medications, diet
   - Real-time sync
   - Row-level security

2. **API Endpoints**
   - POST /symptoms
   - GET /medications
   - PUT /checkins
   - GET /insights

### Real AI/ML
1. **Chatbot**
   - OpenAI API integration
   - Context-aware responses
   - Symptom pattern recognition

2. **Image Recognition**
   - OCR for medication labels
   - Food recognition for diet tracking
   - Skin condition analysis

### Enhanced Features
1. **Wearable Integration**
   - Fitbit, Apple Watch sync
   - Auto-log sleep, activity
   - Heart rate, stress data

2. **Export & Sharing**
   - PDF reports for doctors
   - CSV data export
   - Share with caregivers

3. **Push Notifications**
   - Medication reminders
   - Check-in prompts
   - Flare warnings

4. **Offline Support**
   - Service worker
   - Offline data sync
   - PWA functionality

---

## 📚 CODE EXAMPLES

### Adding Animations to a New Component

```tsx
import { motion } from 'motion/react';
import { FadeInView, StaggerContainer, StaggerItem } from './motion-utils';

export function MyComponent() {
  const items = [1, 2, 3];
  
  return (
    <FadeInView delay={0.2}>
      <h2>My Component</h2>
      
      <StaggerContainer stagger={0.08}>
        {items.map((item, index) => (
          <StaggerItem key={item}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card>Item {item}</Card>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </FadeInView>
  );
}
```

### Adding a New Tracking Factor

```tsx
// In dashboard-overview.tsx
const newFactor: TrackingFactor = {
  id: 'new-factor',
  name: 'New Factor',
  inputType: 'slider',
  icon: '📊',
  color: '#7293BB',
  enabled: false,
  min: 0,
  max: 10,
};

// Add to defaultFactors array
const defaultFactors: TrackingFactor[] = [
  // ...existing factors
  newFactor,
];
```

### Adding a Mock API Response

```tsx
// In chatbot message handler
const handleSendMessage = () => {
  // User message
  const newMessages = [...chatMessages, {
    role: 'user',
    content: inputMessage
  }];
  
  // Mock AI response
  setTimeout(() => {
    const responses = [
      "I can help you with that!",
      "Let me guide you through the steps.",
      "Here's what I found...",
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    setChatMessages([...newMessages, {
      role: 'assistant',
      content: response
    }]);
  }, 1000);
};
```

---

## 🎓 FOR AI ASSISTANTS READING THIS

### Quick Checklist
- [ ] I understand this is a **compassionate health app** for autoimmune patients
- [ ] I know the **tech stack**: React 18 + TypeScript + Tailwind 4 + Motion
- [ ] I know the **color palette**: #7293BB, #B48CBF, #A5D3CF, #E89BA1, #F59E0B
- [ ] I understand **authentication** is mocked with localStorage
- [ ] I understand **all data is mocked** (no real backend)
- [ ] I know **animations** use motion/react and are applied to all pages
- [ ] I know **image imports** must use figma:asset or base64
- [ ] I know the **environment** is Figma Make, not standard Vite
- [ ] I understand the **philosophy**: compassionate, gentle, no pressure
- [ ] I can find components in `/src/app/components/`

### Common Questions Answered

**Q: Where do I add a new feature page?**
A: Create in `/src/app/components/`, import in dashboard.tsx, add to navigation array

**Q: How do I style with brand colors?**
A: Use inline styles: `style={{ backgroundColor: '#7293BB' }}`

**Q: How do I add animations?**
A: Import from motion-utils.tsx or use motion.div with initial/animate props

**Q: How do I save user data?**
A: Currently use useState for mock data, or localStorage for persistence

**Q: Can I import images from /src/imports/?**
A: No, use `figma:asset` scheme or base64 encoding

**Q: How do I test the app?**
A: Use Figma Make preview, not localhost

**Q: Where is authentication logic?**
A: App.tsx (state), auth.tsx (UI), localStorage for persistence

**Q: How do I add a new tracking factor?**
A: Add to defaultFactors array in dashboard-overview.tsx

**Q: How do I make text compassionate?**
A: Avoid "failed", "missed", "error" - use "gentle reminder", "let's try", etc.

---

## 📖 VERSION HISTORY SUMMARY

### V1.0 (March 2026)
- Initial app with 8 pages
- Basic UI with Radix components
- Mock data throughout
- No animations

### V2.0 (March 2026)
- Body map redesign with 3D skeleton (base64)
- Medical records redesign
- Community enhancements
- Dashboard modal improvements

### V3.0 (April 2026) ⭐ CURRENT
- Complete animation system
- Full authentication with localStorage
- Quick Help AI chatbot (speech + image)
- Flare Day Mode
- Customizable check-in
- All pages animated
- Dashboard UI refinements
- Medication scanning
- Time period filters
- Caregivers community channel

---

## 🌸 FINAL NOTES

This document contains **EVERYTHING** an AI assistant needs to understand Flaire and continue development seamlessly. If you're an AI reading this:

1. **Start by understanding the philosophy** - compassion is not optional
2. **Review the tech stack** - React 18, TypeScript, Tailwind 4, Motion
3. **Check the color palette** - use inline styles for brand colors
4. **Understand constraints** - no backend, mocked AI, image import issues
5. **Follow patterns** - animations, staggered cards, brand colors
6. **Be compassionate** - gentle language, no pressure, supportive

**You now have complete context to work on Flaire as if you built it yourself. Go forth and build compassionately! 🌸**

---

**Document Created:** April 15, 2026  
**Project Version:** 3.0 (Animated & AI-Enhanced)  
**Status:** Production-ready UI, ready for backend integration  
**Next Session:** Continue from here with full context
