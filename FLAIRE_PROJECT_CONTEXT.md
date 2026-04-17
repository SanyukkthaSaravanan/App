# Flaire - Autoimmune Care Tracker
## Complete Project Context Document

**Last Updated:** March 29, 2026  
**Purpose:** This document provides complete context for AI assistants (Claude, ChatGPT, AI Studio, etc.) to understand and continue working on the Flaire project.

---

## 📋 TABLE OF CONTENTS
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Design System & Color Palette](#design-system--color-palette)
4. [Project Structure](#project-structure)
5. [Core Features & Components](#core-features--components)
6. [Data Structures](#data-structures)
7. [Recent Changes & Current State](#recent-changes--current-state)
8. [Known Issues & Future Enhancements](#known-issues--future-enhancements)
9. [Development Guidelines](#development-guidelines)

---

## 🎯 PROJECT OVERVIEW

**Flaire** is a compassionate, low-pressure mobile-first web application designed specifically for autoimmune patients to track symptoms, medications, diet, and overall health patterns.

### Core Philosophy
- **Compassionate Design**: No harsh language, guilt, or pressure on users
- **Low Cognitive Load**: Simple, intuitive interfaces suitable for people experiencing brain fog or fatigue
- **Patient-Centered**: Built with understanding of the unique challenges autoimmune patients face
- **Pattern Recognition**: Helps users identify triggers and patterns without being judgmental
- **Gentle Reminders**: Warning indicators instead of aggressive notifications

### Target Users
People living with autoimmune conditions such as:
- Rheumatoid Arthritis
- Lupus
- Crohn's Disease
- Psoriatic Arthritis
- Multiple Sclerosis
- And other chronic autoimmune conditions

---

## 🛠 TECH STACK

### Frontend Framework
- **React** 18.3.1
- **TypeScript** (via JSX/TSX)
- **Vite** 6.3.5 (Build tool)

### UI Framework & Styling
- **Tailwind CSS** 4.1.12
- **Radix UI** (Complete component library for accessible primitives)
- **Lucide React** 0.487.0 (Icon library)
- **Material UI** 7.3.5 (@mui/material, @emotion/react, @emotion/styled)

### Charting & Visualization
- **Recharts** 2.15.2 (For health insights graphs and charts)

### Additional Libraries
- **date-fns** 3.6.0 (Date manipulation)
- **react-day-picker** 8.10.1 (Calendar component)
- **motion** 12.23.24 (Animation library - formerly Framer Motion)
- **react-dnd** 16.0.1 (Drag and drop)
- **react-hook-form** 7.55.0 (Form management)
- **sonner** 2.0.3 (Toast notifications)
- **class-variance-authority** 0.7.1 (Component variants)
- **clsx** 2.1.1 (Conditional classes)
- **tailwind-merge** 3.2.0 (Merge Tailwind classes)

### State Management
- React useState hooks (no external state management library)
- Local component state only

---

## 🎨 DESIGN SYSTEM & COLOR PALETTE

### Brand Colors (Soothing Autoimmune-Friendly Palette)

```css
--flaire-blue: #7293BB (Primary - Blue/Slate)
--flaire-mint: #A5D3CF (Secondary - Soft Mint/Teal)
--flaire-cream: #F2EEDA (Neutral - Warm Cream)
--flaire-light-purple: #CDADD0 (Accent - Light Lavender)
--flaire-purple: #B48CBF (Accent - Medium Purple)
--flaire-pink: #E89BA1 (Warning/Alert - Soft Rose/Pink)
```

### Color Usage Guidelines

**Primary Actions & Navigation:**
- Main blue (`#7293BB`) - Buttons, links, active states, header

**Symptom Severity:**
- Mild (1-4): Mint `#A5D3CF`
- Moderate (5-7): Amber `#F59E0B`
- Severe (8-10): Rose `#E89BA1`

**Feature-Specific Colors:**
- Medications: Light purple `#CDADD0`
- Diet/Nutrition: Mint `#A5D3CF`
- Symptoms: Medium purple `#B48CBF`
- Flare Days: Rose pink `#E89BA1`
- Calendar Warnings: Amber `#F59E0B`

**Background:**
- Main background: Light purple `#CDADD0`
- Cards: White `#ffffff`
- Muted sections: Cream `#F2EEDA` or light purple tints

### Typography
- Font size: 16px base
- Headings: Medium weight (500)
- Body text: Normal weight (400)
- Line height: 1.5 for readability

---

## 📁 PROJECT STRUCTURE

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                          # Main application entry point
│   │   └── components/
│   │       ├── body-map.tsx                 # Interactive body pain mapping
│   │       ├── community.tsx                # Community support features
│   │       ├── daily-checkin.tsx            # Daily check-in component
│   │       ├── dashboard-overview.tsx       # Main dashboard
│   │       ├── diet-tracker.tsx             # Food logging & trigger tracking
│   │       ├── health-calendar.tsx          # Calendar with health events
│   │       ├── health-insights.tsx          # Charts and data visualization
│   │       ├── medical-records.tsx          # Medical records management
│   │       ├── medication-manager.tsx       # Medication tracking
│   │       ├── symptom-tracker.tsx          # Individual symptom logging
│   │       ├── symptoms-view.tsx            # Symptom tracking wrapper
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx    # Protected image component
│   │       └── ui/                          # Shadcn/Radix UI components
│   │           ├── accordion.tsx
│   │           ├── alert.tsx
│   │           ├── badge.tsx
│   │           ├── button.tsx
│   │           ├── calendar.tsx
│   │           ├── card.tsx
│   │           ├── checkbox.tsx
│   │           ├── dialog.tsx
│   │           ├── input.tsx
│   │           ├── label.tsx
│   │           ├── progress.tsx
│   │           ├── select.tsx
│   │           ├── sheet.tsx
│   │           ├── slider.tsx
│   │           ├── switch.tsx
│   │           ├── tabs.tsx
│   │           ├── textarea.tsx
│   │           ├── tooltip.tsx
│   │           └── [30+ other UI primitives]
│   │
│   └── styles/
│       ├── fonts.css        # Font imports (Google Fonts, etc.)
│       ├── index.css        # Main CSS entry
│       ├── tailwind.css     # Tailwind imports
│       └── theme.css        # Custom CSS variables & theming
│
├── package.json
├── vite.config.ts
├── postcss.config.mjs
└── ATTRIBUTIONS.md
```

---

## 🧩 CORE FEATURES & COMPONENTS

### 1. Dashboard Overview (`dashboard-overview.tsx`)
**Purpose:** Main landing page showing today's health snapshot

**Key Features:**
- **Today's Status Card** - Personalized greeting with current energy, pain, and flare status
- **Daily Check-In Button** - Primary CTA for logging daily health
- **Flare Awareness Section** - Conditional card shown during active flares
- **Last 7 Days Summary** - Mini bar charts for Energy, Pain, Sleep, Stress
- **Body Map Summary** - Quick view of current pain locations
- **Medication Status** - Non-judgmental medication adherence display
- **Gentle Insights** - Pattern recognition without pressure
- **Recent Notes** - Voice/text notes with timestamps
- **Support Access** - Quick links to share with doctor, caregiver access, export records

**State:**
```typescript
const [hasCheckedIn, setHasCheckedIn] = useState(false);
const [isFlareDay, setIsFlareDay] = useState(true);
```

---

### 2. Health Calendar (`health-calendar.tsx`)
**Purpose:** Visual calendar showing health events, medications, symptoms, and diet

**Key Features:**
- **Monthly Calendar Grid** - Shows days with health data
- **Flare Day Indicators** - Pink border and flame icon
- **Warning Indicators** - Amber alert icon for missed meds or trigger foods
- **Activity Icons** - Symptoms (Activity), Medications (Pill), Nutrition (Apple)
- **Day Details Dialog** - Click any day to see full details
- **Legend** - Clear explanation of icons and colors

**Special Warning System:**
- Missed Medications: Amber AlertCircle icon
- Trigger Foods Consumed: Amber AlertCircle icon
- Trigger foods list: `['Sugar', 'Dairy', 'Gluten', 'Alcohol', 'Bread', 'Pasta', 'Fried Food', 'Processed Food', 'Caffeine', 'Toast']`

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

**Current Month:** January 2025 (hardcoded for demo)
**Today's Date:** January 13, 2025

---

### 3. Symptoms View (`symptoms-view.tsx`)
**Purpose:** Tab-based symptom tracking interface

**Tabs:**
1. **Tracker** - Log individual symptoms (`SymptomTracker` component)
2. **Body Map** - Visual body pain mapping (`BodyMap` component)

---

### 4. Body Map (`body-map.tsx`)
**Purpose:** Interactive anatomical diagram for logging pain/symptom locations

**Key Features:**
- **Detailed SVG Skeleton** - Hand-drawn, anatomically-inspired skeleton with highlighted joints
- **Interactive Hotspots** - 40+ clickable body regions
- **Visual Symptom Indicators** - Colored overlays and pulsing dots
- **Severity Color Coding** - Same as global severity scale
- **Active Symptoms List** - Shows all logged body symptoms with severity badges
- **Severity Legend** - Explains color meanings

**Body Parts Tracked (40+ regions):**
- Head, Neck
- Shoulders (L/R)
- Upper Arms, Elbows, Forearms (L/R)
- Wrists, Hands, Fingers, Thumbs (L/R)
- Chest, Abdomen, Upper Back, Lower Back
- Hips (L/R)
- Thighs, Knees, Shins (L/R)
- Ankles, Feet, Toes (L/R)
- Spine (cervical, thoracic, lumbar regions)

**Data Structure:**
```typescript
interface BodyPartSymptom {
  id: string;
  part: string;        // Body part ID
  symptoms: string[];  // e.g., ['Pain', 'Swelling']
  severity: number;    // 1-10
  date: Date;
}
```

**Skeleton Rendering:**
- Uses custom `Bone` component for natural bone shapes
- Highlighted joints shown with purple circles
- Interactive rectangles overlay skeleton for click detection

---

### 5. Medication Manager (`medication-manager.tsx`)
**Purpose:** Track medication schedules and adherence

**Key Features:**
- **Voice Input** - Mock voice recording for quick medication logging
- **Manual Entry Form** - Name, dosage, frequency, times, notes
- **Frequency Options** - Daily, Weekly, Bi-weekly, Monthly, As Needed
- **Multi-Time Support** - Can log multiple daily doses
- **Checkbox Tracking** - Mark each dose as taken
- **Progress Bars** - Visual adherence percentage
- **Alert Notes** - Special instructions highlighted in amber

**Data Structure:**
```typescript
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];      // Multiple times possible
  taken: boolean[];    // Corresponds to time array
  notes: string;
}
```

**Mock Voice Feature:**
- Simulates 2.5 second recording
- Auto-fills form with example: "Hydroxychloroquine 200mg, 9:00 AM, Take with breakfast"

---

### 6. Diet Tracker (`diet-tracker.tsx`)
**Purpose:** Log meals and identify food triggers

**Key Features:**
- **Voice Input** - Mock voice recording for meal logging
- **Manual Food Entry** - Name, category, time, reaction, notes
- **Reaction Tracking** - Positive 😊, Neutral 😐, Negative 😟
- **Auto-Flagging** - Foods with negative reactions auto-flagged
- **Confirmed Triggers Card** - User-maintained list of known triggers (red background)
- **Potential Triggers Card** - Auto-detected from logged reactions (amber background)
- **Common Triggers Reference** - Educational list of typical autoimmune triggers

**Food Categories:**
- Breakfast, Lunch, Dinner, Snack, Beverage

**Common Triggers List:**
- Dairy, Gluten, Nightshades, Sugar, Processed Foods, Caffeine, Alcohol

**Data Structure:**
```typescript
interface FoodEntry {
  id: string;
  name: string;
  category: string;
  time: string;
  reaction: 'positive' | 'negative' | 'neutral';
  notes: string;
  date: Date;
}
```

---

### 7. Health Insights (`health-insights.tsx`)
**Purpose:** Data visualization and pattern recognition

**Key Features:**
- **Insight Cards** - Highlights of positive trends, patterns, warnings
- **Symptom Trends Chart** - 7-day area chart (Pain & Fatigue stacked)
- **Top Triggers Bar Chart** - Horizontal bar chart of symptom triggers
- **Medication Adherence Line Chart** - Weekly adherence percentage
- **Personalized Recommendations** - AI-like suggestions based on data

**Chart Components (Recharts):**
- AreaChart (Symptom trends)
- BarChart (Triggers)
- LineChart (Medication adherence)
- All charts have explicit `id` attributes to prevent React key warnings

**Important Fix Applied:**
- Each Recharts component (AreaChart, BarChart, LineChart) has explicit `id` attribute
- All child elements (Area, Bar, Line) are uniquely keyed to prevent duplicate key warnings

**Mock Data:**
```typescript
const symptomData = [
  { date: 'Jan 6', severity: 4, fatigue: 3, pain: 5 },
  { date: 'Jan 7', severity: 5, fatigue: 4, pain: 6 },
  // ... 7 days total
];

const triggerData = [
  { trigger: 'Stress', count: 8 },
  { trigger: 'Weather', count: 6 },
  // ... etc
];

const medicationAdherence = [
  { week: 'Week 1', adherence: 85 },
  { week: 'Week 2', adherence: 90 },
  // ... etc
];
```

---

### 8. Community (`community.tsx`)
**Purpose:** Social support and connection features

**Key Features:**
- **Channel System** - All, My Conditions, Local Groups, Newbies
- **Post Feed** - Community posts with engagement metrics
- **Search** - Find relevant posts
- **Community Guidelines** - Safe space rules
- **Mock Data** - Pre-populated example posts

---

### 9. Medical Records (`medical-records.tsx`)
**Purpose:** Store and manage medical documents and history

**Key Features:**
- Lab results, Test reports, Imaging, Doctor's notes
- Upload functionality (mock)
- Categorization and search
- Export capabilities

---

## 📊 DATA STRUCTURES

### Global Severity Scale
Used consistently across all features:
```typescript
const getSeverityColor = (severity: number) => {
  if (severity >= 8) return '#E89BA1';  // Severe - Pink/Rose
  if (severity >= 5) return '#F59E0B';  // Moderate - Amber
  return '#A5D3CF';                      // Mild - Mint
};
```

### Date Format
- Display: `toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })`
- Storage: ISO format `YYYY-MM-DD` for keys
- Current demo date: January 13, 2025

---

## 🔄 RECENT CHANGES & CURRENT STATE

### Completed Work

#### 1. ✅ Fixed React Duplicate Key Warnings (Recharts)
**Issue:** Console warnings about "Encountered two children with the same key"
**Location:** `/src/app/components/health-insights.tsx`
**Solution:** 
- Added explicit `id` attributes to all Recharts components (AreaChart, BarChart, LineChart)
- Ensured all child elements (Area, Bar, Line) have unique keys
- No more duplicate key warnings in console

#### 2. ✅ Added Calendar Warning Indicators
**Issue:** Need gentle way to alert users about missed medications or trigger foods
**Location:** `/src/app/components/health-calendar.tsx`
**Solution:**
- Added `AlertCircle` icon (amber) on calendar days with warnings
- Warnings appear when:
  - Any medication marked as `taken: false`
  - Any nutrition items match trigger foods list
- Legend updated to explain warning icon
- Day details dialog shows warning badges
- Non-judgmental, informative approach

#### 3. 🔨 Body Map SVG Structure Developed
**Location:** `/src/app/components/body-map.tsx`
**Implementation:**
- Detailed hand-drawn SVG skeleton (169+ lines of SVG code)
- Anatomically-inspired structure with highlighted joints
- Custom `Bone` component for natural bone rendering
- 40+ interactive body part regions
- Purple-highlighted major joints
- Responsive SVG viewBox (360x620)

---

## ⚠️ KNOWN ISSUES & FUTURE ENHANCEMENTS

### Known Issues
None currently reported.

### Planned Enhancements

1. **Backend Integration (Future)**
   - Currently all data is mock/local state
   - Would benefit from Supabase for:
     - User authentication
     - Data persistence across devices
     - Doctor/caregiver sharing
     - Cloud storage for medical documents

2. **Voice Input (Real Implementation)**
   - Current voice features are mock/simulated
   - Real speech-to-text would reduce cognitive load

3. **Data Export**
   - PDF reports for doctor appointments
   - CSV export for personal analysis

4. **Notifications**
   - Gentle medication reminders (opt-in)
   - Flare pattern alerts

5. **Advanced Analytics**
   - Machine learning for trigger prediction
   - Weather correlation
   - Sleep quality analysis

6. **Accessibility**
   - Screen reader optimization
   - High contrast mode
   - Font size controls

---

## 📝 DEVELOPMENT GUIDELINES

### File Editing Best Practices

1. **Always use the `fast_apply_tool` for edits**
   - Fallback to `edit_tool` only if fast_apply fails
   - Provide clear context with `// ... existing code ...` markers

2. **Never modify protected files:**
   - `/src/app/components/figma/ImageWithFallback.tsx`
   - `/pnpm-lock.yaml`

3. **Font imports:**
   - Only add to `/src/styles/fonts.css`
   - Always add at top of file

4. **Image handling:**
   - Use `ImageWithFallback` component for new images
   - Import with `figma:asset` scheme (NOT file paths)
   - SVGs use relative paths from `/src/imports` directory

### Component Guidelines

1. **State Management:**
   - Use local useState for component state
   - No global state management currently

2. **Styling:**
   - Tailwind CSS classes preferred
   - Inline styles for brand colors using hex values
   - Do NOT use Tailwind's text-size, font-weight classes unless overriding

3. **Icons:**
   - Use `lucide-react` package
   - Import specific icons: `import { IconName } from 'lucide-react'`

4. **Forms:**
   - Use react-hook-form@7.55.0 for complex forms
   - Use Radix UI components (Input, Select, Textarea, etc.)

5. **Accessibility:**
   - All interactive elements have proper ARIA labels
   - Semantic HTML elements
   - Keyboard navigation support

### Color Usage Patterns

```typescript
// Primary actions
style={{ backgroundColor: '#7293BB' }}

// Severity indicators
style={{ 
  backgroundColor: severity >= 8 ? '#E89BA1' : 
                   severity >= 5 ? '#F59E0B' : '#A5D3CF'
}}

// Feature-specific
// Medications
style={{ backgroundColor: '#CDADD0' }}
// Diet
style={{ backgroundColor: '#A5D3CF' }}
// Symptoms
style={{ backgroundColor: '#B48CBF' }}
```

### Component Import Pattern
```typescript
import { ComponentName } from './ui/component-name';
import { Icon1, Icon2 } from 'lucide-react';
```

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Cards stack on mobile, grid on desktop
- Mobile bottom navigation (4 tabs)
- Desktop sidebar navigation

---

## 🚀 GETTING STARTED FOR NEW AI ASSISTANT

If you are an AI assistant reading this document:

1. **Project Nature:** This is a compassionate health tracking app for autoimmune patients
2. **Current State:** Fully functional frontend with mock data, no backend
3. **Tech:** React + Tailwind + Radix UI + Recharts
4. **Files to Know:**
   - `/src/app/App.tsx` - Main entry with tab navigation
   - `/src/styles/theme.css` - Complete color system
   - All `/src/app/components/*.tsx` - Feature components
5. **When Making Changes:**
   - Always check `/src/styles/theme.css` for color variables
   - Use `fast_apply_tool` for edits
   - Maintain compassionate, non-judgmental language
   - Test responsiveness (mobile + desktop)
6. **Color Palette:** Refer to section "Design System & Color Palette"
7. **Data is Mock:** All data is hardcoded/local state - explain limitations if asked about persistence

---

## 📞 SUPPORT & CONTEXT QUESTIONS

If user mentions:
- **"Flare"** → Active symptom episode, show empathy
- **"Warning indicators"** → Refers to amber AlertCircle on calendar
- **"Duplicate keys"** → Fixed in health-insights.tsx with explicit IDs
- **"Body map skeleton"** → Refers to detailed SVG in body-map.tsx
- **"Trigger foods"** → List in diet-tracker and health-calendar
- **"Compassionate design"** → Core philosophy, no guilt/pressure language

---

## 🎨 DESIGN PRINCIPLES

1. **Soothing Colors** - Avoid harsh reds, bright alerts
2. **Low Pressure** - No "streaks", no guilt about missed logs
3. **Gentle Language** - "How are you feeling?" not "Log your symptoms"
4. **Visual Hierarchy** - Most important info first
5. **Cognitive Load** - Minimal required fields, voice options
6. **Empathy** - Acknowledge bad days, celebrate good days
7. **Flexibility** - "As needed" options, no forced routines

---

## 📄 FILE MANIFEST

**Main Application:**
- `/src/app/App.tsx` (158 lines) - Main app with navigation

**Feature Components:**
- `/src/app/components/dashboard-overview.tsx` (393 lines)
- `/src/app/components/health-calendar.tsx` (403 lines)
- `/src/app/components/health-insights.tsx` (253 lines)
- `/src/app/components/body-map.tsx` (500+ lines with detailed SVG)
- `/src/app/components/medication-manager.tsx` (348 lines)
- `/src/app/components/diet-tracker.tsx` (527 lines)
- `/src/app/components/symptom-tracker.tsx`
- `/src/app/components/symptoms-view.tsx`
- `/src/app/components/community.tsx`
- `/src/app/components/medical-records.tsx`
- `/src/app/components/daily-checkin.tsx`

**UI Components:** 50+ Radix UI primitives in `/src/app/components/ui/`

**Styling:**
- `/src/styles/theme.css` (188 lines) - Complete theme system
- `/src/styles/tailwind.css` - Tailwind imports
- `/src/styles/index.css` - Main CSS entry
- `/src/styles/fonts.css` - Font imports

**Config:**
- `/package.json` - Dependencies
- `/vite.config.ts` - Vite configuration
- `/postcss.config.mjs` - PostCSS configuration

---

## 🔍 SEARCH KEYWORDS FOR AI ASSISTANTS

When searching code, look for:
- `#7293BB` - Primary blue
- `#A5D3CF` - Mint secondary
- `#E89BA1` - Flare/warning pink
- `#CDADD0` - Light purple
- `useState` - Component state
- `interface` - TypeScript types
- `getSeverityColor` - Severity color logic
- `TRIGGER_FOODS` - Trigger food list
- `AlertCircle` - Warning indicators
- `Recharts` - Chart components
- `BodyMap` - Body diagram
- `mockDayData` - Calendar mock data

---

## 📜 VERSION HISTORY

- **v0.0.1** - Initial build
  - All core features implemented
  - Mock data throughout
  - Responsive design complete
  - Recharts duplicate key warning fixed
  - Calendar warning indicators added
  - Detailed SVG body map created

---

**END OF CONTEXT DOCUMENT**

*This document should be sufficient for any AI assistant to understand and continue development on the Flaire project. Update this document when significant changes are made.*
