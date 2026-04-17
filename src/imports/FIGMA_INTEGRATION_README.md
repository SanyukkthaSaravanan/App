# Flaire — Figma Integration Guide
## Merging `flaire.html` v2 into the Existing Figma Design

---

## Overview

This document guides the Figma team on how to integrate the updated `flaire.html` prototype into the existing Figma design system. The updated prototype contains several enhancements across sections. Each section below specifies the integration strategy.

---

## Colour Scheme

> **Important:** The existing Figma file uses a different background colour palette. The HTML prototype uses `#EDE8F5` as the page background, whereas the Figma CSS tokens file supplied (`flaire.html` CSS block) defines `--background: #CDADD0` (light purple). **The Figma colour tokens should be treated as the source of truth.** When integrating any component from the HTML into Figma, use the following token mapping:

| Token | Figma Value | HTML Variable |
|---|---|---|
| Background | `#CDADD0` | `--bg` |
| Card | `#FFFFFF` | `--card` |
| Primary (Blue) | `#7293BB` | `--blue` / `--flaire-blue` |
| Mint | `#A5D3CF` | `--mint` / `--flaire-mint` |
| Cream | `#F2EEDA` | `--cream` / `--flaire-cream` |
| Light Purple | `#CDADD0` | `--light-purple` / `--flaire-light-purple` |
| Purple | `#B48CBF` | `--purple` / `--flaire-purple` |
| Text | `#2D2540` | `--text` |
| Text Muted | `#7A6E8A` | `--text-muted` |
| Destructive | `#d4183d` | `--destructive` |

All colours in the HTML prototype match the Figma token file except for the root background. Apply Figma tokens when pulling components into the design.

---

## Section-by-Section Integration Instructions

---

### 1. Body Map — **REPLACE IMAGES**

**Action: Replace the three skeleton view images.**

The updated `flaire.html` now contains three new 3D skeleton render images:

- **Front View** — `1774783353493_image.png`
- **Side View** — `1774783675776_image.png`
- **Back View** — `1774783723372_image.png`

In Figma:
1. Locate the **Body Map** component (inside the `Symptoms` screen, `Body Map` tab).
2. Select the existing front-view skeleton image frame and replace with the new front image.
3. Repeat for side and back views.
4. The hotspot overlay system (clickable dots with colour-coded severity) is retained from the original — do not modify the overlay logic.
5. Image sizing: Front and Back views use ~200px wide containers at full height. Side view uses ~180px wide. Maintain these proportions.

The legend (Mild = Mint, Moderate = Amber, Severe = Pink, Neurological = Purple) stays unchanged.

---

### 2. Medical Records — **COMPLETELY REPLACE**

**Action: Replace the entire Medical Records section with the new design from the updated HTML.**

The updated prototype substantially redesigns the Records screen. Key changes to implement in Figma:

- **New layout:** Two-column grid (record list on left, contextual panels on right).
- **Pill tab navigation:** All · Lab Results · Imaging · Notes
- **Record card style:** Icon badge + name + meta + right arrow, with left-border colour accent by record type.
- **Right column panels:**
  - "Export for Doctor" card with PDF and CSV export buttons (gradient background)
  - Storage usage bar
  - Care Team mini-cards with avatar, doctor name, specialty and next appointment
- **Record icon colour mapping:**
  - 🧪 Lab Results → Mint (`rgba(165,211,207,0.2)`)
  - 🩻 Imaging → Light Purple (`rgba(205,173,208,0.2)`)
  - 📋 Doctor Notes → Blue (`rgba(114,147,187,0.15)`)
  - 📊 Reports → Cream (`rgba(242,238,218,0.8)`)

Discard the previous Records screen designs entirely and rebuild from the HTML structure.

---

### 3. Community — **MERGE: Retain Original + Add New Features**

**Action: Keep the existing Figma community design but add features from the updated HTML.**

Retain from Figma:
- Channel pill navigation (All, Lupus Warriors, RA Support, etc.)
- Post card layout (avatar, author, timestamp, body, actions)
- Like / comment / share action row

Add from updated HTML:
- **Trending Topics** sidebar panel (right column on desktop)
- **Upcoming Events** card with event items
- **Community Guidelines** reminder card
- Channel pill active state: filled blue (`#7293BB`) with white text and box-shadow

The community section in the HTML prototype and the Figma version share the same visual language — channel pills, post cards, avatar style. The merge is largely additive.

---

### 4. Dashboard — **RETAIN AS-IS + Add Comprehensive Quick Check-In**

**Action: Keep existing dashboard layout. Replace the simple check-in CTA with the comprehensive modal from the updated HTML.**

Retain from Figma:
- Greeting banner (gradient, flare status chip)
- 4-column stats grid (Sleep, Pain, Energy, Med Adherence)
- Pain Locations Today card
- Today's Medications card
- Gentle Insight card

Replace / upgrade in Figma:
- **Quick Check-In CTA** → now triggers a **4-step modal**:
  1. **Step 1 — Energy Level:** 5 emoji buttons (😴 → ⚡), exhausted to energised
  2. **Step 2 — Pain Level:** Slider 0–10 with live colour-coded number display (mint at 0, amber mid, pink at 10)
  3. **Step 3 — Mood:** 5 emoji buttons (😢 → 😄)
  4. **Step 4 — Notes (optional):** Textarea + contextual badges showing already-logged data (meds, meals)
- **Modal design specs:**
  - White card, 28px border-radius, max-width 520px
  - Step dots at bottom (active dot expands to pill shape)
  - Back / Continue navigation buttons
  - Backdrop blur overlay

This is the most important dashboard enhancement. The 4-step check-in replaces the previous one-click "How are you feeling?" CTA.

---

### 5. Everything Else — **USE UPDATED HTML AS IMPROVEMENT**

For all remaining sections not listed above, the updated HTML represents design improvements that should be adopted into Figma as-is. These include:

**Symptom Tracker:**
- Two-tab layout (Symptom Tracker / Body Map) with pill tab toggle
- Log a Symptom form: type select, severity slider, notes textarea, submit button
- Today's Symptoms list with time-stamped severity badges

**Medications:**
- Adherence summary card (top of left column, gradient mint/teal)
- Medication cards with left-border accent, time chips (toggleable taken state), adherence mini-bars
- Side effects / warnings inline callout (amber-tinted, ⚠️ icon)
- Refill reminder cards

**Calendar:**
- 7-column month grid
- Day states: today (white + blue border), flare day (pink tint), other month (30% opacity)
- Click-to-expand day detail panel with Symptoms / Medications / Nutrition / Status breakdown
- Mini dot indicators per day (colour-coded by type)

**Insights:**
- Weekly bar charts (Chart.js-style) per metric
- AI insight cards with coloured icon and body text
- Correlation insights (e.g. sleep vs pain)

**Diet & Triggers:**
- Meal section groupings (Breakfast / Lunch / Dinner)
- Food item cards with trigger flag badges
- Trigger reaction emoji scale

---

## Component Tokens to Update in Figma

When pulling any component into Figma from the HTML, ensure these shared component specs are applied:

| Property | Value |
|---|---|
| Card border-radius | `20px` |
| Card background | `#FFFFFF` |
| Card box-shadow | `0 4px 24px rgba(114,147,187,0.13)` |
| Button border-radius | `12px` |
| Primary button gradient | `linear-gradient(135deg, #7293BB, #8BA8CC)` |
| Primary button shadow | `0 4px 14px rgba(114,147,187,0.4)` |
| Badge border-radius | `999px` |
| Sidebar width | `240px` |
| Font — Display | `DM Serif Display` |
| Font — Body | `DM Sans` |
| Base font size | `16px` |

---

## Files Delivered

| File | Purpose |
|---|---|
| `flaire_updated.html` | Full working prototype with all updates applied |
| `FIGMA_INTEGRATION_README.md` | This document |
| `1774783353493_image.png` | New front skeleton view |
| `1774783675776_image.png` | New side skeleton view |
| `1774783723372_image.png` | New back skeleton view |

---

## Notes

- All images in the HTML are embedded as base64 for portability — extract them from the HTML if you need standalone PNG files.
- The colour palette in the HTML `globals.css` block (the CSS at the top of the document) matches the Figma token file. The only intentional difference is `--background` which the HTML sets to `#CDADD0` to match Figma, whereas the previous version used `#EDE8F5`.
- JavaScript interactions in the prototype (modal steps, hotspots, tab switching) are for prototype fidelity only and do not need to be replicated in Figma components — use Figma's native prototype interactions instead.
