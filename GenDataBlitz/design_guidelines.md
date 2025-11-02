# Design Guidelines: Rural Health Education Platform

## Design Foundation

**System**: Material Design customized for healthcare accessibility and multi-literacy audiences
**Principle**: Trustworthy, clear interfaces with scalable complexity (clinical → public → gamified)

## Typography

**Fonts** (Google Fonts):
- **Inter**: Data, forms, dashboards (clinical interfaces)
- **Poppins**: Educational content, public-facing

**Scale**:
```
Display (Hero):     text-3xl to 5xl (32-72px, responsive)
Headlines:          text-xl to 2xl (24-36px)
Body Large:         text-lg (18px) - alerts, critical info
Body:               text-base (16px) - general content
Small:              text-sm (14px) - metadata
Micro:              text-xs (12px) - timestamps
```

**Weights**:
- **700 (Bold)**: Alert headlines, critical warnings, CTAs
- **600 (Semibold)**: Section headers, statistics
- **500 (Medium)**: Form labels, navigation
- **400 (Regular)**: Body text

## Layout & Spacing

**Spacing Scale** (Tailwind): 2, 4, 6, 8, 12, 16, 20, 24, 32
- Micro (1-2): Inline elements
- Component (4-8): Related elements
- Section (12-20): Vertical padding
- Major (24-32): Section separations

**Grids**:
- Doctor App: Single-column forms, `max-w-2xl` containers
- Dashboards: 12-column responsive (2-4 column cards)
- Education: 60/40 asymmetric content/visual split
- Public Displays: 2-column hierarchy layouts

## Core Components

### Navigation

**Doctor App Header**:
- Fixed top: Logo left, profile/notifications right
- Tab navigation below (Patients, Alerts, Reports)
- Mobile: Bottom nav, 4 primary actions

**Public Header**:
- Transparent→solid on scroll, centered logo
- Navigation: Learn, Alerts, Resources, Contact
- Utilities: Language selector, voice input
- Mobile: Full-screen hamburger overlay

**Footer** (3-column):
- About/Mission | Quick Links (categorized) | Contact
- Emergency helpline prominent
- Health org logos, newsletter signup, social links

### Data Display

**Health Alert Cards**:
- 4px left border (severity indicator)
- Bold headline + icon, large stat numbers (text-2xl to 3xl)
- Expandable "Learn More" with symptoms/prevention
- Timestamp + source attribution

**Dashboard Metric Cards**:
- 3-4 column grid, large numbers with trend indicators
- Sparkline graphs, compact legends
- Time range selectors

**Disease Panels** (Accordion):
- Collapsed: Icon + title + brief description
- Expanded: Symptoms list, prevention, treatment, emergency actions
- Related resources highlighted

### Forms (Doctor Data Entry)

- Generous spacing: `p-6` to `p-8` (touch-friendly)
- Structure: Label above → Input → Helper text below
- Visual validation: Success/error icons + messages
- Quick-select chips for common diagnoses
- Sticky submit button (long forms)

**Search/Filters**:
- Prominent search with voice input icon
- Toggle filter pills, visual date picker
- "Clear all" action

### Gamification

**Quiz Interface**:
- Large readable question cards
- Options: 48px+ height tap targets
- Visual feedback: Expanding animations, icons (300ms)
- Top progress bar, animated score updates

**Achievements**:
- Badge icons with unlock states, progress rings
- Celebratory micro-animations
- Illustrated leaderboard

**Interactive Learning**:
- Before/after sliders, flip cards
- Drag-drop matching games
- Branching scenario choices

### Public Display

**Full-Screen Alerts**:
- Headline in upper third, high-contrast gradients
- Rotating carousel (15s intervals)
- QR code corner, auto-refresh
- Bottom scrolling ticker for supplementary info

### Modals

**Health Alert Details**:
- Full-screen mobile, `max-w-3xl` desktop card
- Scrollable with sticky header
- Bottom actions: Share, Save, Get Help

**Voice Input**:
- Centered circular mic visualization
- Pulsing animation during recording
- Real-time transcription, cancel/submit actions

## Page Templates

### Landing Page

**Hero** (90vh):
- Full-width rural health illustration background
- Centered headline (`max-w-3xl`) with dual CTAs
- Stats ticker bottom: "X Lives Educated, Y Alerts Sent"

**Disease Grid** (`py-20`):
- 3-col grid (responsive: 2→1), icon + name + description
- Hover reveals "Start Learning" button
- Featured disease: larger card

**How It Works** (`py-24`):
- Alternating 60/40 image-text sections
- Large outlined step numbers, process flow viz

**Live Alerts** (`py-20`, subtle bg):
- Real-time card feed, map visualization
- Filters: disease type, severity
- "Subscribe to Alerts" CTA

**Impact Stats** (`py-16`):
- 4-col numbers, scroll-triggered counting
- Icons for each metric

**Get Started** (`py-24`):
- Centered dual-path CTAs: "Health Worker" / "I Want to Learn"
- App badges, accessibility info

### Doctor Dashboard

**Header Stats**: 4 horizontal metric cards (today's entries, pending alerts, active cases, trends)

**Main** (2/3 width): Recent entries table, sortable, inline edit, pagination

**Sidebar** (1/3): Active alerts widget, seasonal reminders, quick links

### Learning Module

**Progress Dashboard**: User level/XP, completion rings, achievements, streak counter

**Interface**: 60/40 content/visual split, breadcrumbs, inline quizzes, Practice/Test mode toggle

**Certificate**: Decorative borders, social-optimized, download/print

## Visual Assets

**Illustration Style**: Warm flat illustrations, diverse characters, rural contexts (avoid clinical sterility)

**Key Images**:
- Hero: Community health education scene
- Disease cards: Icon illustrations (mosquito for dengue, etc.)
- How It Works: Doctor app → AI processing → Public display (3 custom illustrations)
- Testimonials: Circular photos (120px diameter)
- Learning: Disease transmission diagrams, symptom infographics

## Motion & Accessibility

**Animations** (Purposeful only):
- Alert pulse on new, stat count-up on scroll
- Quiz feedback 300ms transitions
- Voice mic pulse during recording
- Support `prefers-reduced-motion`

**Accessibility (WCAG AA)**:
- 48x48px minimum touch targets
- 4.5:1 contrast ratio (normal text)
- 2px focus outlines on all interactive elements
- Visual + text form validation
- Comprehensive alt text
- Full keyboard navigation
- Semantic HTML for screen readers
- Persistent language toggle

---

**Design Philosophy**: Professional credibility for health workers + approachable education for communities, scaled by interface context.