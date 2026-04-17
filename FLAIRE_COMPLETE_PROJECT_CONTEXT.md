# 🌸 FLAIRE - COMPLETE PROJECT CONTEXT
## Autoimmune Care Tracking Application

**Last Updated:** April 15, 2026  
**Current Version:** 3.0 (Animated & AI-Enhanced)  
**Purpose:** This document provides complete end-to-end context for ANY AI assistant (Claude, ChatGPT, Gemini, etc.) to understand the entire Flaire project and continue development seamlessly.

---

## 📖 TABLE OF CONTENTS

1. [Quick Start for AI Assistants](#quick-start-for-ai-assistants)
2. [Project Overview & Philosophy](#project-overview--philosophy)
3. [Complete Tech Stack](#complete-tech-stack)
4. [Design System (Colors, Typography, Spacing)](#design-system)
5. [Project File Structure](#project-file-structure)
6. [All Components - Complete Reference](#all-components---complete-reference)
7. [Data Structures & Interfaces](#data-structures--interfaces)
8. [Version History - All Changes](#version-history---all-changes)
9. [Current State (What Works, What Doesn't)](#current-state)
10. [Development Guidelines & Best Practices](#development-guidelines--best-practices)
11. [Known Issues & Future Enhancements](#known-issues--future-enhancements)

---

## 🚀 QUICK START FOR AI ASSISTANTS

### If you're an AI reading this document:

**What is this project?**  
Flaire is a compassionate, low-pressure health tracking web app for people with autoimmune diseases (RA, Lupus, Crohn's, etc.). It helps them track symptoms, medications, diet, and identify patterns WITHOUT guilt or pressure.

**Current Status (Version 3.0 - April 2026):**
- ✅ Fully functional frontend (React + TypeScript)
- ✅ All UI components built (60+ components)
- ✅ **NEW:** Complete animation system with Motion library (formerly Framer Motion)
- ✅ **NEW:** AI-powered Quick Help chatbot with speech-to-text and image analysis
- ✅ **NEW:** Comprehensive authentication system with persistent login
- ✅ **NEW:** Flare Day Mode with compassionate simplified interface
- ✅ **NEW:** Customizable daily check-in with tracking tabs
- ✅ **NEW:** Full dashboard with 8 feature pages (all animated)
- ✅ Mock data throughout (no backend yet)
- ❌ No database (everything is localStorage)
- ❌ Mock authentication (no real user accounts)
- ❌ Simulated voice input (Web Speech API, Chrome/Edge only)

**Tech:**
- React 18.3.1 + TypeScript
- Tailwind CSS 4.1.12
- Radix UI components (shadcn/ui)
- Recharts for data visualization
- Lucide React for icons

**Colors to use:**
```css
Primary Blue:    #7293BB
Mint:            #A5D3CF
Pink/Rose:       #E89BA1
Light Purple:    #CDADD0
Cream:           #F2EEDA
Amber:           #F59E0B
```

**When making changes:**
1. Use `fast_apply_tool` for edits (NOT `edit_tool` unless it fails)
2. Never edit protected files: `ImageWithFallback.tsx`, `pnpm-lock.yaml`
3. Use compassionate, non-judgmental language always
4. Test mobile + desktop responsiveness
5. Use inline styles for brand colors (e.g., `style={{ backgroundColor: '#7293BB' }}`)

**Main entry point:** `/src/app/App.tsx`

---

## 🆕 LATEST CHANGES (VERSION 3.0 - APRIL 2026)

### Major Features Added

#### 1. **Complete Animation System**
- **Created:** `/src/app/components/motion-utils.tsx` with reusable animation components
- **Implemented on:**
  - Auth page (login/signup): Logo entrance, cursor glow, floating particles
  - Dashboard: Animated page transitions with AnimatePresence
  - All 7 sub-pages: Staggered card animations (symptoms, medications, diet, calendar, insights, records, community)
  - Navigation: Hover effects, active indicators
  - Loading screen: Pulsing butterfly logo
- **Components:**
  - `CursorGlow`: Mouse-following gradient blob
  - `FloatingParticles`: Animated background particles
  - `StaggerContainer` / `StaggerItem`: Parent-child stagger system
  - `TiltCard`: 3D tilt on hover
  - `FadeInView`: Fade in on mount
  - `AnimatedNumber`: Number counter animation
  - `PageTransition`: Page change wrapper
  - `BreathingGlow`: Pulsing glow effect
- **Pattern used:** `initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}` with stagger delays
- **Motion library:** `motion/react` v12.23.24 (formerly Framer Motion)

#### 2. **AI-Powered Quick Help Chatbot**
- **Location:** Left sidebar, purple "Quick Help" button
- **Features:**
  - Full chat interface with user/assistant messages
  - **Speech-to-text:** Mic button using Web Speech API (Chrome/Edge only)
  - **Image-to-text:** Camera button for uploading images
  - Quick action buttons ("Log symptoms", "Add medication", etc.)
  - Mocked AI responses based on input/image content
  - Recently increased container height to 600px
- **Implementation:** Dialog component with chat message array in dashboard.tsx state
- **Use cases:** Navigation help, symptom logging guidance, medication reminders

#### 3. **Enhanced Authentication System**
- **Full login/signup flows** with tabs
- **Google authentication** button (mocked)
- **Persistent login:** User saved to localStorage as `'flaireUser'`
- **Auto-login:** Checks localStorage on app mount
- **Logout:** Clears localStorage and returns to auth page
- **Caregiver login modal:** On dashboard overview, separate caregiver auth flow (mocked)
- **Beautiful auth page:** Radial gradient background, animated logo, cursor glow effect

#### 4. **Flare Day Mode**
- **Purpose:** Simplified interface for bad health days
- **Features:**
  - Encouraging quotes with heart icon
  - Large voice note button (pulsing mic)
  - Quick pain slider (0-10, color-coded)
  - Quick energy slider (0-10)
  - Minimal meal logging
  - Symptom notes
  - Exit button to return to normal dashboard
- **Design:** Reduced cognitive load, compassionate language, large touch targets
- **Activation:** "Enable Flare Mode" button on dashboard overview

#### 5. **Customizable Quick Check-In**
- **Multi-step modal flow:**
  - Step 1: Energy, pain, mood sliders + notes
  - Step 2+: Custom tracking tabs
- **Default tracking factors:**
  - Water intake (0-12 glasses slider)
  - Stress level (0-10 slider)
  - Sleep quality (5-emoji selector)
  - Period (checkbox)
  - Exercise (checkbox)
  - Meditation (checkbox)
- **Customization:** Toggle factors on/off, add custom tracking items
- **Summary display:** Shows all logged data including custom factors
- **Pain prompt:** If pain > 0, asks if user wants to log symptoms

#### 6. **Dashboard UI Refinements**
- **Header:** Updated with butterfly logo, welcome message, logout button
- **Desktop sidebar:** Fixed left navigation with animations
- **Mobile bottom nav:** 4 main tabs (dashboard, symptoms, medications, diet)
- **Hamburger menu:** Sheet/drawer for full navigation on mobile
- **Merged greeting & check-in:** Combined into single card on dashboard
- **Centered content:** All cards have centered text and buttons for cleaner look
- **Demo data:** Pre-populated appointments, symptoms, medications

#### 7. **Additional Feature Updates**
- **Medication scanning:** Camera icon in Add Medication form, mocked OCR functionality
- **Health Insights time filters:** 7 days, 30 days, 90 days, 6 months, 1 year, all time
- **Community Caregivers tab:** Dedicated channel for caregiver support
- **Medical Records Prescriptions button:** Links to prescription management
- **Calendar demo appointments:** Shows example doctor visits

### Recent Issue: Body Map Skeleton Image Replacement (FAILED)

**Attempted on:** April 15, 2026

**What happened:**
- User tried to replace the skeleton image in body-map-new.tsx
- Uploaded new 3D skeleton image to `/src/imports/image.png`
- Attempted to import with `import skeletonFront from '../imports/image.png'`
- Got Vite error: "Failed to resolve import"
- Tried correcting path to `../../imports/image.png` - still failed
- User restored app to previous version

**Why it failed:**
- Figma Make environment has special image import requirements
- Standard relative imports from `/src/imports/` don't work
- Must use `figma:asset` scheme for images OR base64 encoding
- Vite cache was causing stale import errors

**Current state:**
- Body map uses base64-encoded skeleton images (working)
- Defined in `skeletonImages` object in body-map-new.tsx
- Front, side, and back views all functional
- Hotspots mapped to anatomical positions

**Resolution:**
- Cleared Vite cache (`.vite`, `node_modules/.vite`, `dist`)
- File was reverted to use base64 images
- App is stable and working

**Lesson learned:**
- Do NOT try to import images from `/src/imports/` with relative paths
- Use `figma:asset` import scheme for new images
- Or convert to base64 and embed directly

---

## 🎯 PROJECT OVERVIEW & PHILOSOPHY

### What is Flaire?

Flaire is a **compassionate, low-pressure** mobile-first web application designed specifically for autoimmune patients to track symptoms, medications, diet, and overall health patterns.

### The Compassionate Design Philosophy

This is NOT just a design preference - it's the CORE of the product:

#### ❌ NEVER Use:
- "Failed", "Missed", "Warning" (harsh language)
- Red colors for alerts
- Streak counters
- Required fields everywhere
- Guilt-inducing notifications
- Aggressive reminders

#### ✅ ALWAYS Use:
- "When you're ready", "No pressure", "Gentle reminder"
- Soft pastels (mint, pink, lavender)
- Optional fields
- Patterns over perfection
- Gentle insights
- Empowering language

### Target Users

People living with autoimmune conditions:
- Rheumatoid Arthritis (RA)
- Lupus (SLE)
- Crohn's Disease
- Psoriatic Arthritis
- Multiple Sclerosis
- Fibromyalgia
- Sjögren's Syndrome
- Other chronic autoimmune conditions

**User Challenges:**
- Brain fog / cognitive difficulties
- Chronic fatigue
- Unpredictable symptom flares
- Multiple medications
- Complex dietary restrictions
- Need for pattern recognition
- Doctor appointment preparation

---

## 🛠 COMPLETE TECH STACK

### Core Framework
```json
{
  "react": "18.3.1",
  "vite": "6.3.5",
  "typescript": "5.7.3"
}
```

### Styling & UI
```json
{
  "tailwindcss": "4.1.12",
  "@radix-ui/*": "Multiple packages (accordion, dialog, select, etc.)",
  "lucide-react": "0.487.0",
  "@mui/material": "7.3.5",
  "@emotion/react": "11.14.0",
  "@emotion/styled": "11.14.0",
  "class-variance-authority": "0.7.1",
  "clsx": "2.1.1",
  "tailwind-merge": "3.2.0"
}
```

### Data Visualization
```json
{
  "recharts": "2.15.2"
}
```

### Date & Time
```json
{
  "date-fns": "3.6.0",
  "react-day-picker": "8.10.1"
}
```

### Animation & Interaction
```json
{
  "motion": "12.23.24",
  "react-dnd": "16.0.1"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "7.55.0",
  "sonner": "2.0.3"
}
```

### State Management
- **None** - Using React `useState` hooks only
- All state is local to components
- No Redux, Zustand, or Context API

### Backend / Database
- **None currently** - All data is mock/hardcoded
- Future: Supabase recommended for:
  - User authentication
  - Data persistence
  - Cloud storage for medical records
  - Sharing with doctors/caregivers

---

## 🎨 DESIGN SYSTEM

### Brand Color Palette

```css
/* Primary Colors */
--flaire-blue: #7293BB;           /* Primary - Buttons, Navigation, Active States */
--flaire-mint: #A5D3CF;           /* Secondary - Mild Severity, Diet, Calm Accents */
--flaire-cream: #F2EEDA;          /* Neutral - Backgrounds, Muted Sections */
--flaire-light-purple: #CDADD0;   /* Accent - Medications, Background */
--flaire-purple: #B48CBF;         /* Accent - Symptoms, Medium Severity */
--flaire-pink: #E89BA1;           /* Alert - Flares, Severe Symptoms (NOT harsh red) */
--flaire-amber: #F59E0B;          /* Warning - Moderate Severity, Caution */
```

### Severity Color Scale

**CRITICAL: Used consistently across ALL features**

```typescript
const getSeverityColor = (severity: number) => {
  if (severity >= 8) return '#E89BA1';  // Severe (8-10) - Soft Pink/Rose
  if (severity >= 5) return '#F59E0B';  // Moderate (5-7) - Amber
  return '#A5D3CF';                      // Mild (1-4) - Mint
};
```

**Visual Examples:**
- 1-4: 🟢 Mint - "Manageable", "Gentle"
- 5-7: 🟡 Amber - "Noticeable", "Attention Needed"
- 8-10: 🔴 Pink - "Severe", "Difficult Day"

### Typography

```css
/* Fonts */
Font Family: System fonts (SF Pro, Segoe UI, Roboto, etc.)
Base Size: 16px
Line Height: 1.5

/* Hierarchy */
h1: 24px / 600 weight / color: #7293BB
h2: 20px / 600 weight
h3: 18px / 500 weight
h4: 16px / 500 weight
Body: 16px / 400 weight / color: #2D2540
Small: 14px / 400 weight / color: #7A6E8A
```

### Spacing & Layout

```css
/* Container */
Max Width: 1280px (max-w-7xl)
Padding: 16px mobile, 32px desktop

/* Cards */
Border Radius: 20px (standard), 28px (modals)
Padding: 16px-24px
Shadow: 0 4px 24px rgba(114,147,187,0.13)

/* Buttons */
Border Radius: 12px
Padding: 8px 16px (small), 12px 24px (default)
Shadow (hover): 0 4px 14px rgba(114,147,187,0.4)

/* Spacing Scale */
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### Component Variants

```typescript
// Button Styles
Primary: bg-[#7293BB] text-white
Secondary: bg-white text-[#7293BB] border
Ghost: transparent hover:bg-gray-100
Destructive: bg-red-600 text-white (rarely used)

// Badge Styles
Default: bg-gray-100 text-gray-800
Success: bg-green-100 text-green-800
Warning: bg-amber-100 text-amber-800
Error: bg-pink-100 text-pink-800 (soft pink, not harsh red)
```

---

## 📁 PROJECT FILE STRUCTURE

```
flaire-app/
├── src/
│   ├── app/
│   │   ├── App.tsx                          ← Main entry point with auth routing ⭐ V3.0
│   │   └── components/
│   │       ├── auth.tsx                     ← Login/signup page ⭐ NEW V3.0
│   │       ├── dashboard.tsx                ← Dashboard container with Quick Help ⭐ NEW V3.0
│   │       ├── dashboard-overview.tsx       ← Dashboard home with check-in ⭐ V3.0 UPDATED
│   │       ├── flare-mode.tsx               ← Flare Day Mode interface ⭐ NEW V3.0
│   │       ├── motion-utils.tsx             ← Animation utilities ⭐ NEW V3.0
│   │       ├── daily-checkin.tsx            ← Daily check-in flows
│   │       ├── body-map-new.tsx             ← Body map with base64 skeleton ⭐ CURRENT
│   │       ├── symptoms-view.tsx            ← Symptoms page with animations ⭐ V3.0
│   │       ├── medication-manager.tsx       ← Medications with scanning ⭐ V3.0
│   │       ├── diet-tracker.tsx             ← Diet tracking with animations ⭐ V3.0
│   │       ├── health-calendar.tsx          ← Calendar with demo appointments ⭐ V3.0
│   │       ├── health-insights.tsx          ← Charts with time filters ⭐ V3.0
│   │       ├── medical-records.tsx          ← Records with prescriptions ⭐ V3.0
│   │       ├── community.tsx                ← Community with caregivers tab ⭐ V3.0
│   │       ├── symptom-tracker.tsx          ← Symptom logging helper
│   │       ├── body-map.tsx                 ← OLD - SVG skeleton (DEPRECATED)
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx    ← ⚠️ PROTECTED - DO NOT EDIT
│   │       └── ui/                          ← 60+ Radix UI components
│   │           ├── accordion.tsx
│   │           ├── alert.tsx
│   │           ├── badge.tsx
│   │           ├── button.tsx
│   │           ├── calendar.tsx
│   │           ├── card.tsx
│   │           ├── checkbox.tsx
│   │           ├── dialog.tsx              ← Used in dashboard modal
│   │           ├── input.tsx
│   │           ├── label.tsx
│   │           ├── progress.tsx            ← Used in medical records
│   │           ├── select.tsx
│   │           ├── sheet.tsx               ← Mobile menu
│   │           ├── slider.tsx              ← Pain slider in modal
│   │           ├── switch.tsx
│   │           ├── tabs.tsx
│   │           ├── textarea.tsx            ← Notes in modal
│   │           ├── tooltip.tsx
│   │           └── [40+ more components]
│   │
│   └── styles/
│       ├── fonts.css        ← Font imports ONLY (Google Fonts)
│       ├── index.css        ← Main CSS entry point
│       ├── tailwind.css     ← Tailwind imports
│       └── theme.css        ← Custom CSS variables & theme (188 lines)
│
├── package.json             ← Dependencies
├── vite.config.ts           ← Vite configuration
├── postcss.config.mjs       ← PostCSS configuration
├── tsconfig.json            ← TypeScript configuration
│
├── FLAIRE_PROJECT_CONTEXT.md              ← Original context doc
├── FLAIRE_UI_UPDATE_SUMMARY.md            ← V1.0 changes summary
├── FLAIRE_UI_UPDATE_V2_SUMMARY.md         ← V2.0 changes summary
├── FLAIRE_COMPLETE_CHANGELOG.md           ← Complete version history
└── FLAIRE_COMPLETE_PROJECT_CONTEXT.md     ← ⭐ THIS FILE (master context)
```

---

## 🧩 ALL COMPONENTS - COMPLETE REFERENCE

### 1. App.tsx - Main Application Entry

**File:** `/src/app/App.tsx` (158 lines)

**Purpose:** Main application shell with navigation

**Key Features:**
- Tab-based navigation (8 tabs)
- Desktop sidebar (hidden on mobile)
- Mobile bottom navigation (4 tabs)
- Mobile hamburger menu
- Header with app name and status indicator

**Navigation Tabs:**
1. Dashboard - `<DashboardOverview />`
2. Symptoms - `<SymptomsView />`
3. Medications - `<MedicationManager />`
4. Diet - `<DietTracker />`
5. Calendar - `<HealthCalendar />`
6. Insights - `<HealthInsights />`
7. Community - `<Community />`
8. Records - `<MedicalRecords />`

**State:**
```typescript
const [activeTab, setActiveTab] = useState('dashboard');
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
```

**Responsive Behavior:**
- Desktop: Sidebar + main content
- Mobile: Bottom nav (4 tabs) + hamburger menu (all 8 tabs)
- Breakpoint: `lg:` (1024px)

---

### 2. Dashboard Overview - Main Landing Page

**File:** `/src/app/components/dashboard-overview.tsx`  
**Version:** V1.0 - Enhanced with 4-step check-in modal  
**Lines:** ~600+ (with modal)

**Purpose:** Main dashboard showing today's health snapshot + check-in flow

**Key Sections:**

#### A. Today's Status Card
```typescript
interface TodayStatus {
  energy?: string;    // 'Low', 'Okay', 'High'
  pain?: string;      // 'Mild', 'Moderate', 'Severe'
  flare: boolean;     // Is this a flare day?
  message?: string;   // e.g., "Feeling steady today"
}
```

**Visual:** 
- Flare day = Pink border (#E89BA1)
- Normal day = Standard card

#### B. 4-Step Check-In Modal (V1.0 NEW)

**Trigger:** Click "Check in" / "Quick check-in" button

**Step 1: Energy Level**
- 5 emoji buttons: 😴 Exhausted → ⚡ Energized
- Values: 1-5
- Active state: Blue background with scale animation

**Step 2: Pain Level**
- Slider: 0-10
- Live color-coded display:
  - 0-3: Mint (#A5D3CF)
  - 4-7: Amber (#F59E0B)
  - 8-10: Pink (#E89BA1)
- Labels: "0 - No pain" to "10 - Worst pain"

**Step 3: Mood**
- 5 emoji buttons: 😢 Very Low → 😄 Great
- Values: 1-5
- Same interaction as Energy

**Step 4: Notes (Optional)**
- Textarea for freeform input
- Contextual badges (e.g., "3/4 meds taken", "2 meals logged")
- Placeholder: "How are you feeling today? Any observations..."

**Modal Specs:**
```typescript
{
  maxWidth: '520px',
  borderRadius: '28px',
  padding: '32px',
  closeButton: 'top-right',
  stepDots: 'bottom-center',
  navigation: 'Back/Continue buttons'
}
```

**Check-In Data Structure:**
```typescript
interface CheckInData {
  energy: number;      // 1-5
  pain: number;        // 0-10
  mood: number;        // 1-5
  notes: string;       // freeform text
}
```

#### C. Other Dashboard Features
- **Flare Awareness Card** - Shows when `isFlareDay === true`
  - Days since flare started
  - Gentle suggestions
  - Tracking reminder
- **Last 7 Days Summary** - Mini bar charts (hardcoded mock data)
- **Body Map Summary** - Small preview of body pain locations
- **Medication Status** - Non-judgmental adherence percentage
- **Recent Notes** - Voice/text notes list
- **Support Actions** - Share, caregiver access, export

**Important State:**
```typescript
const [hasCheckedIn, setHasCheckedIn] = useState(false);
const [isFlareDay, setIsFlareDay] = useState(true);
const [showCheckInModal, setShowCheckInModal] = useState(false);
const [checkInStep, setCheckInStep] = useState(1); // 1-4
const [checkInData, setCheckInData] = useState({
  energy: 0,
  pain: 5,
  mood: 0,
  notes: ''
});
```

---

### 3. Medical Records - Document Management

**File:** `/src/app/components/medical-records.tsx`  
**Version:** V1.0 - Complete redesign  
**Lines:** ~400+

**Purpose:** Store and manage medical documents, export for doctors

**Layout:** Two-column (2/3 records + 1/3 sidebar)

#### A. Records List (Left Column)

**Features:**
- Pill tab navigation (All, Lab Results, Imaging, Notes)
- Type-specific color-coded cards
- Left border accent matching record type
- Record metadata: Date, Provider, File Size
- Chevron right arrow for interaction hint

**Record Types & Colors:**
```typescript
{
  'lab': {
    color: 'rgba(165,211,207,0.2)',  // Mint
    border: '#A5D3CF',
    icon: FlaskConical
  },
  'imaging': {
    color: 'rgba(205,173,208,0.2)',  // Light Purple
    border: '#CDADD0',
    icon: ImageIcon
  },
  'notes': {
    color: 'rgba(114,147,187,0.15)', // Blue
    border: '#7293BB',
    icon: FileText
  },
  'reports': {
    color: 'rgba(242,238,218,0.8)',  // Cream
    border: '#F2EEDA',
    icon: File
  }
}
```

**Data Structure:**
```typescript
interface MedicalRecord {
  id: string;
  type: 'lab' | 'imaging' | 'notes' | 'reports';
  title: string;
  date: Date;
  provider?: string;
  size?: string;    // e.g., "2.3 MB"
}
```

#### B. Sidebar Panels (Right Column)

**1. Export for Doctor Card**
- Gradient background: `linear-gradient(135deg, #A5D3CF 0%, #7293BB 100%)`
- White text
- Two buttons:
  - Export as PDF
  - Export as CSV

**2. Storage Usage Card**
- Progress bar
- Percentage used (e.g., "45% used")
- Capacity info (e.g., "450 MB of 1 GB")

**3. Care Team Card**
- List of doctors with:
  - Avatar (circular with User icon)
  - Name
  - Specialty
  - Next appointment date

**Mock Data:**
```typescript
{
  records: [
    { type: 'lab', title: 'Blood Work - CRP & RF', date: '2025-01-05', provider: 'City Medical Lab', size: '2.3 MB' },
    { type: 'imaging', title: 'Hand X-Ray Results', date: '2024-12-20', provider: 'Radiology Center', size: '8.1 MB' },
    // ... more records
  ],
  storageUsed: 45, // percentage
  careTeam: [
    { name: 'Dr. Sarah Johnson', specialty: 'Rheumatologist', next: 'Apr 20, 2025' },
    { name: 'Dr. Michael Chen', specialty: 'Primary Care', next: 'Mar 15, 2025' }
  ]
}
```

---

### 4. Community - Social Support Features

**File:** `/src/app/components/community.tsx`  
**Version:** V1.0 - Enhanced with sidebar panels  
**Lines:** ~600+

**Purpose:** Connect with other autoimmune patients, share experiences

**Layout:** Two-column (2/3 posts + 1/3 sidebar)

#### A. Posts Feed (Left Column)

**Features:**
- Pill-style channel navigation
- Search bar
- Trending/Latest filter buttons
- Post cards with engagement metrics
- Pinned posts (with Pin badge)

**Channels:**
```typescript
const channels = [
  { id: 'all', name: 'All Channels', color: '#7293BB', members: '12.4k' },
  { id: 'ra', name: 'Rheumatoid Arthritis', color: '#B48CBF', members: '4.2k' },
  { id: 'lupus', name: 'Lupus', color: '#A5D3CF', members: '3.8k' },
  { id: 'pain-management', name: 'Pain Management', color: '#CDADD0', members: '5.1k' },
  { id: 'working-out', name: 'Working Out with Symptoms', color: '#E89BA1', members: '2.9k' }
];
```

**Post Structure:**
```typescript
interface ForumPost {
  id: string;
  channel: string;
  author: string;
  authorInitials: string;  // For avatar
  title: string;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;       // e.g., "2 hours ago"
  isPinned?: boolean;
}
```

**Engagement Actions:**
- ❤️ Like (Heart icon + count)
- 💬 Reply (MessageCircle icon + count)
- 🔗 Share (Share2 icon)

#### B. Sidebar Panels (Right Column) - V1.0 NEW

**1. Trending Topics Panel**
```typescript
interface TrendingTopic {
  topic: string;
  posts: number;
}

// Example:
[
  { topic: 'Morning Stiffness Tips', posts: 42 },
  { topic: 'Medication Side Effects', posts: 38 },
  { topic: 'Diet & Inflammation', posts: 35 }
]
```

**2. Upcoming Events Panel**
```typescript
interface CommunityEvent {
  title: string;
  date: string;
  attendees: number;
}

// Example:
[
  { title: 'Weekly Support Group', date: 'Every Thursday 7PM EST', attendees: 45 },
  { title: 'Yoga for Joint Health', date: 'Mar 30, 2026 - 10AM EST', attendees: 28 },
  { title: 'Ask a Rheumatologist', date: 'Apr 5, 2026 - 3PM EST', attendees: 156 }
]
```

**3. Community Guidelines Panel**
- Light purple background: `#F8F6FF`
- 4 key rules with checkmark icons:
  - ✅ Be kind and supportive
  - ✅ Respect privacy - no medical advice
  - ✅ Share experiences, not judgments
  - ✅ Report concerning content

---

### 5. Body Map - Interactive Symptom Mapping

**File:** `/src/app/components/body-map-new.tsx` (V2.0 - CURRENT)  
**Deprecated:** `/src/app/components/body-map.tsx` (V1.0 - SVG skeleton)  
**Version:** V2.0 - 3D skeleton with aligned hotspots  
**Lines:** ~500+

**Purpose:** Visual body diagram for logging pain/symptom locations

#### A. V2.0 Features (Current)

**Three Anatomical Views:**
1. **Front View** - Anterior skeleton (20 hotspots)
2. **Side View** - Lateral profile (14 hotspots)
3. **Back View** - Posterior skeleton (25 hotspots)

**3D Skeleton Images:**
- Realistic 3D renders (base64-encoded)
- Front: 70px width, 380px height
- Side: 65px width, 380px height
- Back: 70px width, 380px height
- Object-fit: cover (cropped to show skeleton only)

**Hotspot System:**
```typescript
interface Hotspot {
  id: string;
  name: string;
  top: string;    // CSS percentage (e.g., "65%")
  left: string;   // CSS percentage (e.g., "35%")
}

// Front View Example:
const frontHotspots = [
  { id: 'head', name: 'Head', top: '4%', left: '35%' },
  { id: 'left-shoulder', name: 'Left Shoulder', top: '16%', left: '22%' },
  { id: 'left-knee', name: 'Left Knee', top: '65%', left: '35%' },
  // ... 17 more
];
```

**Interactive Hotspots:**
- Color-coded by severity (Mint/Amber/Pink)
- Animated pulse for active symptoms
- Hover tooltips: Body part name + severity
- Click to view/manage symptoms

**Visual Legend:**
- 🟢 Mint - Mild (1-4)
- 🟡 Amber - Moderate (5-7)
- 🔴 Pink - Severe (8-10)

**Symptom Data:**
```typescript
interface BodyPartSymptom {
  id: string;
  part: string;        // Hotspot ID (e.g., 'left-knee')
  symptoms: string[];  // e.g., ['Pain', 'Swelling']
  severity: number;    // 1-10
  date: Date;
}
```

**View Selector:**
- Three pill-style buttons (Front, Side, Back)
- Active state: Blue background (#7293BB)
- Smooth transitions between views

#### B. V1.0 (Deprecated - Reference Only)

**Original Implementation:**
- Hand-drawn SVG skeleton
- Single front view only
- 40+ clickable regions using SVG rectangles
- Custom `Bone` component for realistic bone shapes
- Purple-highlighted joints

**Why Replaced:**
- V2.0 has 3D photorealistic skeleton
- V2.0 has multiple views (front, side, back)
- V2.0 has better alignment and UX

---

### 6. Symptoms View - Symptom Tracking Wrapper

**File:** `/src/app/components/symptoms-view.tsx`  
**Version:** V2.0 - Updated to use BodyMapNew  
**Lines:** ~30

**Purpose:** Tab-based interface for symptom tracking

**Tabs:**
1. **Symptom Tracker** - `<SymptomTracker />` component
2. **Body Map** - `<BodyMapNew />` component (V2.0)

**Code:**
```typescript
export function SymptomsView() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="tracker" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracker">
            <Activity className="h-4 w-4" />
            Symptom Tracker
          </TabsTrigger>
          <TabsTrigger value="bodymap">
            <User className="h-4 w-4" />
            Body Map
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tracker">
          <SymptomTracker />
        </TabsContent>
        <TabsContent value="bodymap">
          <BodyMapNew />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### 7. Symptom Tracker - Individual Symptom Logging

**File:** `/src/app/components/symptom-tracker.tsx`  
**Lines:** ~400+

**Purpose:** Log individual symptoms with severity and triggers

**Key Features:**
- Symptom name input
- Severity slider (1-10)
- Trigger tags
- Time tracking
- Notes field
- Symptom history list

**Data Structure:**
```typescript
interface Symptom {
  id: string;
  name: string;
  severity: number;      // 1-10
  triggers: string[];    // e.g., ['Weather', 'Stress']
  time: string;          // HH:MM format
  date: Date;
  notes: string;
}
```

**Common Symptom Types:**
- Pain
- Fatigue
- Stiffness
- Swelling
- Brain Fog
- Nausea

**Common Triggers:**
- Weather
- Stress
- Diet
- Sleep
- Overexertion
- Medications

---

### 8. Medication Manager - Medication Tracking

**File:** `/src/app/components/medication-manager.tsx`  
**Lines:** ~350+

**Purpose:** Track medications, dosages, schedules, adherence

**Key Features:**
- Voice input (mock)
- Manual entry form
- Frequency options (Daily, Weekly, As Needed, etc.)
- Multi-time support (e.g., 8am, 2pm, 8pm)
- Checkbox tracking for each dose
- Progress bars for adherence
- Alert notes (e.g., "Take with food")

**Data Structure:**
```typescript
interface Medication {
  id: string;
  name: string;
  dosage: string;          // e.g., "200mg"
  frequency: string;       // 'Daily', 'Weekly', 'As Needed'
  time: string[];          // ['08:00', '20:00']
  taken: boolean[];        // [true, false] (matches time array)
  notes: string;
}
```

**Frequency Options:**
- Daily
- Weekly
- Bi-weekly
- Monthly
- As Needed

**Mock Voice Feature:**
- Simulates 2.5 second recording
- Auto-fills: "Hydroxychloroquine 200mg, 9:00 AM, Take with breakfast"
- Uses Mic icon from lucide-react

**Adherence Calculation:**
```typescript
const adherencePercentage = 
  (takenCount / totalDoses) * 100;
```

**Visual:**
- Progress bar with percentage
- Color-coded (green > 80%, amber 60-80%, pink < 60%)

---

### 9. Diet Tracker - Food & Trigger Tracking

**File:** `/src/app/components/diet-tracker.tsx`  
**Lines:** ~530+

**Purpose:** Log meals, identify food triggers, track reactions

**Key Features:**
- Voice input (mock)
- Manual food entry
- Reaction tracking (😊 Positive, 😐 Neutral, 😟 Negative)
- Auto-flagging of negative reactions
- Confirmed triggers list (user-maintained)
- Potential triggers list (auto-detected)
- Common triggers reference

**Data Structure:**
```typescript
interface FoodEntry {
  id: string;
  name: string;
  category: string;        // Breakfast, Lunch, Dinner, Snack, Beverage
  time: string;            // HH:MM
  reaction: 'positive' | 'negative' | 'neutral';
  notes: string;
  date: Date;
}

interface FoodTrigger {
  name: string;
  confirmedByUser: boolean;
}
```

**Food Categories:**
- Breakfast
- Lunch
- Dinner
- Snack
- Beverage

**Common Autoimmune Triggers (Reference):**
- Dairy
- Gluten
- Nightshades (tomatoes, peppers, eggplant)
- Sugar
- Processed Foods
- Caffeine
- Alcohol
- Fried Foods

**Visual Sections:**

1. **Today's Meals** - Chronological list with reaction emojis
2. **Confirmed Triggers** - Red background, user-maintained
3. **Potential Triggers** - Amber background, auto-detected from negative reactions
4. **Common Triggers** - Educational reference list

**Trigger Detection Logic:**
```typescript
// Auto-flag foods with negative reactions
if (foodEntry.reaction === 'negative') {
  addToPotentialTriggers(foodEntry.name);
}
```

---

### 10. Health Insights - Data Visualization

**File:** `/src/app/components/health-insights.tsx`  
**Version:** Fixed Recharts duplicate key warnings  
**Lines:** ~250+

**Purpose:** Charts, graphs, pattern recognition, recommendations

**Key Features:**
- Insight cards (positive trends, warnings)
- Symptom trends chart (7-day area chart)
- Top triggers bar chart
- Medication adherence line chart
- Personalized recommendations

**Charts (Recharts):**

**1. Symptom Trends - AreaChart**
```typescript
<AreaChart id="symptom-trends-chart" data={symptomData} ...>
  <Area 
    dataKey="pain" 
    stackId="1" 
    stroke="#E89BA1" 
    fill="#E89BA1" 
    key="pain-area"
  />
  <Area 
    dataKey="fatigue" 
    stackId="1" 
    stroke="#F59E0B" 
    fill="#F59E0B" 
    key="fatigue-area"
  />
</AreaChart>
```

**2. Triggers - BarChart**
```typescript
<BarChart id="triggers-chart" data={triggerData} ...>
  <Bar 
    dataKey="count" 
    fill="#7293BB" 
    radius={[0, 8, 8, 0]}
    key="trigger-bar"
  />
</BarChart>
```

**3. Medication Adherence - LineChart**
```typescript
<LineChart id="adherence-chart" data={medicationAdherence} ...>
  <Line 
    dataKey="adherence" 
    stroke="#A5D3CF" 
    strokeWidth={3}
    key="adherence-line"
  />
</LineChart>
```

**CRITICAL FIX APPLIED:**
- All Recharts components have explicit `id` attributes
- All child elements (Area, Bar, Line) have unique `key` props
- No more "Encountered two children with the same key" warnings

**Mock Data:**
```typescript
const symptomData = [
  { date: 'Jan 6', severity: 4, fatigue: 3, pain: 5 },
  { date: 'Jan 7', severity: 5, fatigue: 4, pain: 6 },
  // ... 7 days
];

const triggerData = [
  { trigger: 'Stress', count: 8 },
  { trigger: 'Weather', count: 6 },
  { trigger: 'Lack of Sleep', count: 5 }
];

const medicationAdherence = [
  { week: 'Week 1', adherence: 85 },
  { week: 'Week 2', adherence: 90 },
  { week: 'Week 3', adherence: 88 },
  { week: 'Week 4', adherence: 92 }
];
```

**Insight Cards:**
- 🎉 Positive Trends (green background)
- ⚠️ Patterns to Watch (amber background)
- 💡 Recommendations (blue background)

---

### 11. Health Calendar - Event Tracking Calendar

**File:** `/src/app/components/health-calendar.tsx`  
**Version:** Enhanced with warning indicators  
**Lines:** ~400+

**Purpose:** Visual calendar showing medications, symptoms, diet, flares

**Key Features:**
- Monthly calendar grid
- Flare day indicators (pink border + flame icon)
- Warning indicators (amber AlertCircle)
- Activity icons (Symptoms, Medications, Nutrition)
- Day details dialog
- Legend explaining icons

**Warning System (GENTLE, NON-JUDGMENTAL):**

**Warnings appear when:**
1. Any medication marked as `taken: false`
2. Any nutrition item matches trigger foods list

**Trigger Foods List:**
```typescript
const TRIGGER_FOODS = [
  'Sugar', 'Dairy', 'Gluten', 'Alcohol', 
  'Bread', 'Pasta', 'Fried Food', 
  'Processed Food', 'Caffeine', 'Toast'
];
```

**Visual Indicators:**
- 🔥 Flame icon - Flare day (pink border)
- ⚠️ AlertCircle (amber) - Missed meds or trigger foods
- 💊 Pill icon - Medications logged
- 🍎 Apple icon - Nutrition logged
- 📊 Activity icon - Symptoms logged

**Data Structure:**
```typescript
interface DayData {
  date: Date;
  symptoms: { name: string; severity: number }[];
  medications: { name: string; taken: boolean }[];
  nutrition: { meal: string; items: string[] }[];
  isFlareDay: boolean;
  notes?: string;
}
```

**Current Demo Date:** January 13, 2025  
**Current Month:** January 2025 (hardcoded for demo)

**Day Details Dialog:**
```typescript
// Click any day to see:
- All symptoms with severity
- All medications with taken status
- All meals with food items
- Warning badges (if applicable)
- Notes
```

**Calendar Legend:**
- 🔥 Flare Day
- ⚠️ Attention Needed (missed meds or triggers)
- 💊 Medications
- 🍎 Nutrition
- 📊 Symptoms

---

### 12. Daily Check-In (Standalone Component)

**File:** `/src/app/components/daily-checkin.tsx`  
**Lines:** ~200+

**Note:** This component exists but is NOT currently used in the main app. The check-in functionality is integrated into the Dashboard component (dashboard-overview.tsx) with the 4-step modal.

**Purpose:** Quick daily health snapshot (legacy/alternative implementation)

---

## 📊 DATA STRUCTURES & INTERFACES

### Global Types

```typescript
// Severity Scale (1-10)
type Severity = number; // 1-10

// Severity Color Function
const getSeverityColor = (severity: number): string => {
  if (severity >= 8) return '#E89BA1';  // Severe
  if (severity >= 5) return '#F59E0B';  // Moderate
  return '#A5D3CF';                      // Mild
};

// Date Format
type DateString = string; // ISO format YYYY-MM-DD
type TimeString = string; // HH:MM format

// Reactions
type Reaction = 'positive' | 'negative' | 'neutral';

// Frequency Options
type MedicationFrequency = 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly' | 'As Needed';

// Food Categories
type FoodCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Beverage';
```

### Component-Specific Interfaces

**Dashboard:**
```typescript
interface CheckInData {
  energy: number;      // 1-5
  pain: number;        // 0-10
  mood: number;        // 1-5
  notes: string;
}

interface TodayStatus {
  energy?: string;
  pain?: string;
  flare: boolean;
  message?: string;
}
```

**Body Map:**
```typescript
interface BodyPartSymptom {
  id: string;
  part: string;
  symptoms: string[];
  severity: number;
  date: Date;
}

interface Hotspot {
  id: string;
  name: string;
  top: string;
  left: string;
}

type ViewType = 'front' | 'side' | 'back';
```

**Medical Records:**
```typescript
interface MedicalRecord {
  id: string;
  type: 'lab' | 'imaging' | 'notes' | 'reports';
  title: string;
  date: Date;
  provider?: string;
  size?: string;
}
```

**Community:**
```typescript
interface ForumPost {
  id: string;
  channel: string;
  author: string;
  authorInitials: string;
  title: string;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
  isPinned?: boolean;
}

interface Channel {
  id: string;
  name: string;
  icon: React.ComponentType;
  color: string;
  description: string;
  members: string;
}

interface TrendingTopic {
  topic: string;
  posts: number;
}

interface CommunityEvent {
  title: string;
  date: string;
  attendees: number;
}
```

**Medications:**
```typescript
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  time: string[];
  taken: boolean[];
  notes: string;
}
```

**Diet:**
```typescript
interface FoodEntry {
  id: string;
  name: string;
  category: FoodCategory;
  time: string;
  reaction: Reaction;
  notes: string;
  date: Date;
}

interface FoodTrigger {
  name: string;
  confirmedByUser: boolean;
}
```

**Symptoms:**
```typescript
interface Symptom {
  id: string;
  name: string;
  severity: number;
  triggers: string[];
  time: string;
  date: Date;
  notes: string;
}
```

**Calendar:**
```typescript
interface DayData {
  date: Date;
  symptoms: { name: string; severity: number }[];
  medications: { name: string; taken: boolean }[];
  nutrition: { meal: string; items: string[] }[];
  isFlareDay: boolean;
  notes?: string;
}
```

**Insights:**
```typescript
interface SymptomDataPoint {
  date: string;
  severity: number;
  fatigue: number;
  pain: number;
}

interface TriggerData {
  trigger: string;
  count: number;
}

interface AdherenceData {
  week: string;
  adherence: number;
}
```

---

## 📜 VERSION HISTORY - ALL CHANGES

### Version 2.0 - Body Map 3D Skeleton Update
**Date:** March 29, 2026 (Session 2)

**Files Modified:**
- ✅ Created `/src/app/components/body-map-new.tsx`
- ✅ Updated `/src/app/components/symptoms-view.tsx`

**Changes:**
1. **New 3D Skeleton Images**
   - Replaced 2D SVG with realistic 3D renders
   - Three views: Front, Side, Back
   - Base64-encoded images from HTML prototype

2. **59 Aligned Hotspots**
   - Front: 20 hotspots
   - Side: 14 hotspots
   - Back: 25 hotspots
   - Percentage-based positioning for responsiveness

3. **Enhanced UX**
   - View selector (pill-style buttons)
   - Color-coded severity indicators
   - Animated pulse for active symptoms
   - Hover tooltips with body part + severity
   - Visual legend

**Why:**
- More anatomically accurate
- Multiple perspectives (front, side, back)
- Better alignment and precision
- Professional medical appearance

---

### Version 1.0 - Core UI Redesign
**Date:** March 29, 2026 (Session 1)

**Files Modified:**
- ✅ Updated `/src/app/components/medical-records.tsx`
- ✅ Updated `/src/app/components/dashboard-overview.tsx`
- ✅ Updated `/src/app/components/community.tsx`

#### A. Medical Records - Complete Redesign

**Changes:**
1. Two-column layout (records + sidebar)
2. Pill tab navigation (All, Lab, Imaging, Notes)
3. Type-specific color-coded cards
4. "Export for Doctor" gradient panel
5. Storage usage progress bar
6. Care team cards

**Why:**
- Matches Figma design prototype
- Better organization
- Export functionality for doctor visits
- Visual hierarchy improvements

#### B. Dashboard - 4-Step Check-In Modal

**Changes:**
1. Step 1: Energy level (5 emojis)
2. Step 2: Pain slider (0-10 with color coding)
3. Step 3: Mood (5 emojis)
4. Step 4: Notes (optional textarea)
5. Step dots navigation
6. Back/Continue buttons

**Why:**
- Reduces cognitive load (one question at a time)
- More engaging than long form
- Color-coded pain slider for clarity
- Optional notes reduces pressure

#### C. Community - Enhanced Sidebar

**Changes:**
1. Trending Topics panel
2. Upcoming Events panel
3. Community Guidelines panel
4. Two-column layout

**Why:**
- Increased engagement
- Better community discovery
- Clear guidelines for safe space
- Matches Figma design

---

### Version 0.9 - Pre-Redesign State
**Date:** Before March 29, 2026

**Completed Features:**
- ✅ All core components built
- ✅ Dashboard with flare tracking
- ✅ Health calendar with warning indicators
- ✅ Body map with SVG skeleton (V1.0 - deprecated)
- ✅ Medication tracking
- ✅ Diet tracking
- ✅ Symptom logging
- ✅ Health insights charts
- ✅ Community features
- ✅ Medical records

**Fixes Applied:**
- ✅ Fixed Recharts duplicate key warnings
- ✅ Added calendar warning indicators
- ✅ Aligned body map hotspots (V1.0)

---

## ⚡ CURRENT STATE

### What Works ✅

1. **Navigation**
   - ✅ Desktop sidebar navigation
   - ✅ Mobile bottom navigation (4 tabs)
   - ✅ Mobile hamburger menu (8 tabs)
   - ✅ Tab switching

2. **Dashboard**
   - ✅ Today's status card
   - ✅ 4-step check-in modal (energy, pain, mood, notes)
   - ✅ Flare awareness section
   - ✅ Last 7 days summary (mock data)
   - ✅ Medication status
   - ✅ Support actions

3. **Medical Records**
   - ✅ Two-column layout
   - ✅ Pill tab filtering
   - ✅ Color-coded record types
   - ✅ Export panels
   - ✅ Storage usage display
   - ✅ Care team cards

4. **Community**
   - ✅ Channel navigation
   - ✅ Post feed with engagement
   - ✅ Trending topics sidebar
   - ✅ Upcoming events sidebar
   - ✅ Community guidelines
   - ✅ Search functionality

5. **Body Map (V2.0)**
   - ✅ Three 3D skeleton views (front, side, back)
   - ✅ 59 aligned hotspots
   - ✅ View switching
   - ✅ Color-coded severity
   - ✅ Hover tooltips
   - ✅ Active symptoms list

6. **Medications**
   - ✅ Voice input (mock)
   - ✅ Manual entry form
   - ✅ Multi-time support
   - ✅ Checkbox tracking
   - ✅ Adherence progress

7. **Diet**
   - ✅ Voice input (mock)
   - ✅ Reaction tracking
   - ✅ Auto-trigger detection
   - ✅ Confirmed triggers list
   - ✅ Common triggers reference

8. **Symptoms**
   - ✅ Individual symptom logging
   - ✅ Severity tracking
   - ✅ Trigger tagging
   - ✅ History list

9. **Calendar**
   - ✅ Monthly grid
   - ✅ Flare day indicators
   - ✅ Warning indicators (missed meds, triggers)
   - ✅ Activity icons
   - ✅ Day details dialog
   - ✅ Legend

10. **Insights**
    - ✅ Symptom trends chart
    - ✅ Triggers bar chart
    - ✅ Adherence line chart
    - ✅ Insight cards
    - ✅ Recommendations

11. **Responsive Design**
    - ✅ Mobile layout (< 640px)
    - ✅ Tablet layout (640-1024px)
    - ✅ Desktop layout (> 1024px)
    - ✅ All components adapt

### What Doesn't Work ❌

1. **Data Persistence**
   - ❌ No backend database
   - ❌ Data lost on page refresh
   - ❌ No cross-device sync
   - **Why:** All data is local component state (useState)

2. **Authentication**
   - ❌ No user login/logout
   - ❌ No user profiles
   - ❌ No multi-user support
   - **Why:** No backend authentication system

3. **Voice Input**
   - ❌ Not real speech-to-text
   - ❌ Just simulates recording (setTimeout)
   - ❌ Auto-fills with mock data
   - **Why:** Would require Web Speech API or cloud service

4. **File Upload**
   - ❌ Medical record uploads are mock
   - ❌ No file storage
   - ❌ No image preview
   - **Why:** Would require cloud storage (S3, Supabase, etc.)

5. **Export Functions**
   - ❌ PDF export doesn't work
   - ❌ CSV export doesn't work
   - ❌ Share features are placeholders
   - **Why:** Would require PDF generation library

6. **Notifications**
   - ❌ No push notifications
   - ❌ No email reminders
   - ❌ No SMS alerts
   - **Why:** Would require backend + notification service

7. **Real-time Features**
   - ❌ Community posts don't update live
   - ❌ No real-time collaboration
   - ❌ No live chat
   - **Why:** Would require WebSockets or real-time database

### What's Mock/Simulated 🎭

1. **Calendar Data** - Hardcoded January 2025
2. **Chart Data** - Hardcoded 7-day symptom trends
3. **Community Posts** - Hardcoded forum posts
4. **Medical Records** - Hardcoded documents
5. **Voice Input** - 2.5 second setTimeout
6. **Medication Adherence** - Calculated from mock data
7. **Trigger Detection** - Client-side only
8. **Today's Date** - Hardcoded to Jan 13, 2025

---

## 📝 DEVELOPMENT GUIDELINES & BEST PRACTICES

### 1. File Editing Rules

**ALWAYS:**
- ✅ Use `fast_apply_tool` for edits (preferred)
- ✅ Read file first with `read` tool before editing
- ✅ Use `// ... existing code ...` markers in fast_apply
- ✅ Provide clear context (3-5 lines before/after changes)

**NEVER:**
- ❌ Use `edit_tool` unless `fast_apply_tool` fails
- ❌ Edit protected files:
  - `/src/app/components/figma/ImageWithFallback.tsx`
  - `/pnpm-lock.yaml`
- ❌ Rewrite entire files unless absolutely necessary

### 2. Styling Guidelines

**CSS Framework:**
- Use Tailwind CSS classes for layout and spacing
- Use inline styles ONLY for brand colors (hex values)
- Do NOT create new CSS files (use theme.css for variables)

**Color Usage:**
```typescript
// ✅ CORRECT - Inline styles for brand colors
style={{ backgroundColor: '#7293BB' }}
style={{ color: '#E89BA1' }}

// ❌ WRONG - Don't use Tailwind color classes for brand colors
className="bg-blue-500"  // NO
className="text-pink-400"  // NO

// ✅ CORRECT - Tailwind for layout/spacing
className="flex items-center gap-4 p-6"

// ❌ WRONG - Don't use Tailwind font classes (theme.css handles it)
className="text-2xl font-bold"  // Avoid unless overriding
```

**Responsive Design:**
```typescript
// ✅ CORRECT - Mobile-first
className="flex flex-col lg:flex-row"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// ✅ CORRECT - Breakpoints
sm: 640px   (mobile landscape)
md: 768px   (tablet)
lg: 1024px  (desktop)
xl: 1280px  (large desktop)
```

### 3. Component Patterns

**State Management:**
```typescript
// ✅ CORRECT - Local state only
const [data, setData] = useState<DataType[]>([]);

// ❌ WRONG - No global state (no Context, Redux, etc.)
```

**Props & Types:**
```typescript
// ✅ CORRECT - Define interfaces
interface ComponentProps {
  title: string;
  onClose: () => void;
  data?: DataType[];
}

export function Component({ title, onClose, data = [] }: ComponentProps) {
  // ...
}
```

**Icon Usage:**
```typescript
// ✅ CORRECT - Import from lucide-react
import { Heart, MessageCircle, Share2 } from 'lucide-react';

<Heart className="h-4 w-4" />

// ❌ WRONG - Don't use Material UI icons in new code
```

### 4. Compassionate Language Guidelines

**CRITICAL: This is not optional - it's the CORE product philosophy**

**Words to AVOID:**
- ❌ "Failed"
- ❌ "Missed" (use "Skipped" or "Not yet logged")
- ❌ "Warning" (use "Reminder" or "Attention")
- ❌ "Must", "Required", "Mandatory"
- ❌ "Streak broken"
- ❌ "You should"
- ❌ "Overdue"

**Words to USE:**
- ✅ "When you're ready"
- ✅ "No pressure"
- ✅ "Gentle reminder"
- ✅ "Optional"
- ✅ "How are you feeling?"
- ✅ "You got this"
- ✅ "Take your time"

**Examples:**

```typescript
// ❌ WRONG
<p>You failed to log your symptoms today.</p>
<Badge variant="destructive">Missed Medication</Badge>
<Alert>Warning: You haven't checked in for 3 days!</Alert>

// ✅ CORRECT
<p>Ready to check in when you are.</p>
<Badge variant="outline" style={{ borderColor: '#F59E0B' }}>
  Medication not logged yet
</Badge>
<Alert style={{ backgroundColor: '#F2EEDA' }}>
  Gentle reminder: It's been a few days since your last check-in
</Alert>
```

### 5. Color Application

**Severity Colors:**
```typescript
const getSeverityColor = (severity: number) => {
  if (severity >= 8) return '#E89BA1';  // Severe - Soft Pink
  if (severity >= 5) return '#F59E0B';  // Moderate - Amber
  return '#A5D3CF';                      // Mild - Mint
};

// Usage:
<div style={{ backgroundColor: getSeverityColor(severity) }}>
  {/* content */}
</div>
```

**Feature Colors:**
```typescript
// Medications
style={{ backgroundColor: '#CDADD0' }}  // Light Purple

// Diet
style={{ backgroundColor: '#A5D3CF' }}  // Mint

// Symptoms
style={{ backgroundColor: '#B48CBF' }}  // Medium Purple

// Flares
style={{ backgroundColor: '#E89BA1', borderColor: '#E89BA1' }}  // Pink

// Primary Actions
style={{ backgroundColor: '#7293BB' }}  // Blue
```

### 6. Image Handling

**New Images:**
```typescript
// ✅ CORRECT - Use ImageWithFallback component
import { ImageWithFallback } from './components/figma/ImageWithFallback';

<ImageWithFallback 
  src="https://example.com/image.jpg" 
  alt="Description"
/>
```

**Figma Assets:**
```typescript
// ✅ CORRECT - Use figma:asset scheme (no path prefix!)
import img from "figma:asset/abc123.png";

// ❌ WRONG - Don't add path
import img from "../imports/figma:asset/abc123.png";  // NO
```

**SVG Imports:**
```typescript
// ✅ CORRECT - Relative path from component
import svgPaths from "../imports/svg-wg56ef214f";
```

### 7. Font Imports

**ONLY add font imports to `/src/styles/fonts.css`**

```css
/* ✅ CORRECT - In fonts.css */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

/* ❌ WRONG - Don't add in theme.css, index.css, or components */
```

### 8. Chart Implementation (Recharts)

**CRITICAL FIX: Always add explicit IDs and keys**

```typescript
// ✅ CORRECT
<AreaChart id="unique-chart-id" data={data} ...>
  <Area 
    dataKey="value" 
    stroke="#7293BB" 
    fill="#7293BB"
    key="unique-area-key"
  />
</AreaChart>

// ❌ WRONG - Missing id and key
<AreaChart data={data} ...>
  <Area dataKey="value" stroke="#7293BB" fill="#7293BB" />
</AreaChart>
```

### 9. Accessibility

**Required:**
```typescript
// ✅ Semantic HTML
<button>, <nav>, <main>, <aside>, <header>

// ✅ ARIA labels for icon-only buttons
<button aria-label="Close modal">
  <X className="h-4 w-4" />
</button>

// ✅ Alt text for images
<img src="..." alt="Descriptive text" />

// ✅ Keyboard navigation
onKeyDown={(e) => e.key === 'Enter' && handleClick()}
```

### 10. Testing Before Committing

**Checklist:**
- [ ] Mobile view (< 640px)
- [ ] Tablet view (640-1024px)
- [ ] Desktop view (> 1024px)
- [ ] All buttons clickable
- [ ] All forms functional
- [ ] Colors match design system
- [ ] Language is compassionate
- [ ] No console errors/warnings
- [ ] Component renders without crashing

---

## ⚠️ KNOWN ISSUES & FUTURE ENHANCEMENTS

### Known Issues (None Currently)

**Console:**
- ✅ No errors
- ✅ No warnings
- ✅ Recharts duplicate key issue fixed

**Visual:**
- ✅ All components render correctly
- ✅ Responsive on all screen sizes
- ✅ No layout shifts

### Limitations (By Design)

1. **No Backend**
   - All data is local state
   - Lost on page refresh
   - No persistence

2. **No Authentication**
   - Single user experience
   - No login/logout
   - No user profiles

3. **Mock Voice**
   - Simulated recording
   - Auto-fills with example data
   - Not real speech-to-text

4. **Mock Exports**
   - Export buttons don't actually export
   - Would need PDF/CSV generation

5. **Hardcoded Dates**
   - Demo date: January 13, 2025
   - Calendar shows January 2025
   - Not using real-time dates

### Future Enhancements (Planned)

#### Phase 1: Backend Integration (HIGH PRIORITY)

**Recommendation: Supabase**

```typescript
// What to implement:
1. User Authentication
   - Email/password signup/login
   - OAuth (Google, Apple)
   - Password reset

2. Data Persistence
   - Symptoms table
   - Medications table
   - Food entries table
   - Body part symptoms table
   - Calendar events table

3. Cloud Storage
   - Medical record uploads
   - Profile pictures
   - Export files

4. Sharing
   - Share with doctor (view-only link)
   - Caregiver access (limited permissions)
   - Export data as PDF/CSV
```

**Why Supabase:**
- PostgreSQL database (structured data)
- Built-in authentication
- Row-level security (RLS)
- Storage buckets for files
- Real-time subscriptions
- Generous free tier

#### Phase 2: Real Voice Input

```typescript
// Options:
1. Web Speech API (browser-native)
   - Pros: Free, no API keys
   - Cons: Spotty browser support

2. OpenAI Whisper API
   - Pros: Accurate, multi-language
   - Cons: Costs money

3. Google Cloud Speech-to-Text
   - Pros: Very accurate
   - Cons: Costs money, complex setup
```

#### Phase 3: Advanced Features

1. **Smart Insights**
   - ML pattern detection
   - Weather correlation (API integration)
   - Medication effectiveness analysis
   - Trigger prediction

2. **Export & Sharing**
   - PDF report generation (jsPDF)
   - CSV export (real implementation)
   - Email reports to doctor
   - Printable summaries

3. **Notifications**
   - Gentle medication reminders (opt-in)
   - Flare pattern alerts
   - Weekly summary emails
   - Push notifications (if PWA)

4. **PWA Conversion**
   - Install as app
   - Offline mode
   - Push notifications
   - Home screen icon

5. **Accessibility Improvements**
   - Screen reader optimization
   - High contrast mode toggle
   - Font size controls
   - Voice navigation

6. **Multi-Language Support**
   - i18n implementation
   - Translation files
   - RTL language support

#### Phase 4: Community Features

1. **Real-time Chat**
   - Supabase real-time
   - Direct messages
   - Group chats
   - Moderation tools

2. **Events**
   - Virtual support groups
   - Video calls (Zoom/Jitsi integration)
   - Calendar integration
   - RSVP system

3. **Resources**
   - Doctor directory
   - Educational articles
   - Recipe database
   - Exercise videos

---

## 🔍 QUICK REFERENCE

### Common Tasks for AI Assistants

#### Task: Add a new symptom type

```typescript
// 1. Update SymptomTracker component
// 2. Add to common symptom types list
const commonSymptoms = [
  'Pain',
  'Fatigue',
  'Stiffness',
  'Swelling',
  'Brain Fog',
  'Nausea',
  'NEW_SYMPTOM_HERE'  // Add here
];
```

#### Task: Change a color throughout the app

```typescript
// 1. Update color in this context document
// 2. Search codebase for hex value (e.g., #7293BB)
// 3. Replace all instances
// 4. Test all components
// 5. Update theme.css if needed
```

#### Task: Add a new tab to navigation

```typescript
// 1. Create new component: /src/app/components/new-feature.tsx
// 2. Add to App.tsx navigation array:
const navigation = [
  // ... existing tabs
  { id: 'new-feature', name: 'New Feature', icon: IconName },
];
// 3. Add to main content switch:
{activeTab === 'new-feature' && <NewFeature />}
```

#### Task: Fix a Recharts warning

```typescript
// 1. Add explicit id to chart component:
<AreaChart id="unique-id" ...>

// 2. Add unique key to all child elements:
<Area dataKey="value" key="unique-key" .../>
```

#### Task: Add a new body part to Body Map

```typescript
// 1. Open /src/app/components/body-map-new.tsx
// 2. Add to appropriate hotspots array (frontHotspots, sideHotspots, or backHotspots):
{ id: 'new-part', name: 'New Part Name', top: 'XX%', left: 'XX%' }
// 3. Test click detection and alignment
```

---

## 📞 CONTEXT KEYWORDS FOR SEARCH

**When user mentions:**
- "Flare" → Active symptom episode, empathy mode, Flare Day Mode feature
- "Warning" → Calendar amber AlertCircle indicators
- "Duplicate keys" → Fixed in health-insights.tsx (Recharts)
- "Body map" → body-map-new.tsx with base64 skeleton images (3D image import failed)
- "Check-in" → Multi-step modal with customizable tracking tabs
- "Medical records" → Redesigned with prescriptions button
- "Community" → Enhanced with Caregivers channel
- "Compassionate" → Core philosophy, gentle language required
- "Mock data" → All data is hardcoded/localStorage, no backend
- "Trigger foods" → List in diet-tracker and health-calendar
- "Animation" → Motion library (motion/react), see motion-utils.tsx
- "AI chatbot" → Quick Help feature with speech-to-text and image upload
- "Authentication" → Full login/signup system with localStorage persistence
- "Flare Mode" → Simplified interface for bad health days (flare-mode.tsx)

**Code Patterns to Look For:**
- `#7293BB` → Primary blue (buttons, navigation)
- `#B48CBF` → Purple (secondary actions, AI features)
- `#A5D3CF` → Mint (mild severity, success)
- `#E89BA1` → Pink (severe/flare, warnings)
- `#F59E0B` → Amber (moderate severity)
- `motion.div` → Animated component from Motion library
- `AnimatePresence` → Page transition wrapper
- `initial=` `animate=` `exit=` → Motion animation props
- `whileHover=` `whileTap=` → Interactive animations
- `getSeverityColor` → Severity color function
- `useState` → Component state
- `localStorage.getItem('flaireUser')` → User persistence
- `interface` → TypeScript types
- `AlertCircle` → Warning icon (lucide-react)
- `Sparkles` → AI/magic icon (Quick Help chatbot)
- `style={{` → Inline styles for colors

---

## 🎓 ONBOARDING CHECKLIST FOR NEW AI

If you're a new AI assistant reading this document, confirm you understand:

- [ ] **Project Purpose:** Compassionate autoimmune care tracker
- [ ] **Tech Stack:** React 18 + TypeScript + Tailwind 4 + Radix UI + Motion (animations)
- [ ] **Current Version:** 3.0 (Animated & AI-Enhanced - April 2026)
- [ ] **Data:** Mock data + localStorage for user auth, no real backend
- [ ] **Colors:** Primary #7293BB (blue), #B48CBF (purple), #A5D3CF (mint), #E89BA1 (pink), #F59E0B (amber)
- [ ] **Philosophy:** NO harsh language, pressure, or guilt - compassion ALWAYS
- [ ] **Animations:** motion/react library, motion-utils.tsx has reusable components
- [ ] **Authentication:** Login/signup with localStorage persistence (mocked, no real accounts)
- [ ] **AI Features:** Quick Help chatbot with speech-to-text and image upload (mocked responses)
- [ ] **Flare Mode:** Simplified interface for bad health days (flare-mode.tsx)
- [ ] **File Editing:** Use Edit tool for modifications
- [ ] **Styling:** Tailwind for layout, inline styles for brand colors (e.g., `style={{ backgroundColor: '#7293BB' }}`)
- [ ] **Components:** 60+ UI components in /ui/, 15+ feature components in /components/
- [ ] **Image Imports:** Use `figma:asset` scheme OR base64, NOT relative paths from /src/imports/
- [ ] **Known Limits:** No real backend, no database, mocked AI responses, Web Speech API only on Chrome/Edge

---

## 📄 SUMMARY

Flaire is a **fully functional, beautifully animated frontend application** with comprehensive features for autoimmune health tracking. All UI is built with a compassionate, low-pressure philosophy using a soothing color palette and smooth, delightful animations.

**Version 3.0 (April 2026)** is the most complete version yet:
- ✨ **Complete animation system** with Motion library across all pages
- 🤖 **AI-powered Quick Help chatbot** with speech-to-text and image analysis
- 🔐 **Full authentication system** with persistent login via localStorage
- 🌸 **Flare Day Mode** - compassionate simplified interface for bad health days
- 📊 **8 main feature pages:** Dashboard, Symptoms, Medications, Diet, Calendar, Insights, Community, Records
- 🎨 **Customizable quick check-in** with tracking tabs (water, stress, sleep, etc.)
- 📱 **Fully responsive** with mobile bottom nav and desktop sidebar

**Recent V3.0 additions:**
- Created `/src/app/components/motion-utils.tsx` with 8 reusable animation components
- Implemented staggered card animations on all 7 sub-pages
- Added Quick Help AI chatbot dialog with voice and image input
- Built complete auth flow (login, signup, Google auth, logout, persistence)
- Enhanced dashboard with caregiver login, merged greeting card, demo data
- Added medication scanning, time period filters, caregivers community channel

**Technical highlights:**
- React 18.3.1 + TypeScript (.tsx files)
- Motion (motion/react) v12.23.24 for all animations
- Tailwind CSS 4.1.12 for styling
- Radix UI components (60+ UI primitives)
- Recharts for data visualization
- Web Speech API for voice input (Chrome/Edge)

The codebase is **well-organized**, **fully responsive**, **production-ready UI**, and **ready for backend integration**. All components follow consistent patterns, use the same color system, have smooth animations, and maintain the compassionate design philosophy throughout.

**Known limitation from latest session:** Cannot import images from `/src/imports/` with relative paths - must use `figma:asset` scheme or base64 encoding. Attempted body map skeleton image replacement failed due to Vite import resolution in Figma Make environment.

**Next steps** would typically involve:
1. Backend integration (Supabase for auth + database)
2. Real AI/ML for chatbot and image recognition
3. Real voice recognition processing (beyond Web Speech API)
4. Data export functionality (PDF reports, CSV)
5. Wearable device integration
6. Push notifications for medication reminders

---

**END OF COMPLETE PROJECT CONTEXT**

*Last Updated: April 15, 2026*  
*Document Version: 3.0*  
*Project Version: 3.0 (Animated & AI-Enhanced)*

---

## 📎 RELATED DOCUMENTS

- `/FLAIRE_PROJECT_CONTEXT.md` - Original context document
- `/FLAIRE_UI_UPDATE_SUMMARY.md` - V1.0 changes (Medical Records, Dashboard, Community)
- `/FLAIRE_UI_UPDATE_V2_SUMMARY.md` - V2.0 changes (Body Map 3D skeleton)
- `/FLAIRE_COMPLETE_CHANGELOG.md` - Detailed version history

**🌸 This document is your complete guide to the Flaire project. Any AI assistant reading this should have everything needed to continue development seamlessly. 🌸**
