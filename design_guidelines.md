# Design Guidelines: Educational Platform for Computer Basics

## Design Approach
**Hybrid Approach:** Material Design system principles combined with patterns from modern educational platforms (Khan Academy, Coursera). Focus on clarity, progress visibility, and learner confidence.

**Core Principles:**
- Clear learning hierarchy - students should always know where they are
- Achievement-focused - celebrate progress and completion
- Distraction-free content presentation
- Kazakh language-first with appropriate typography support

---

## Typography

**Font Family:** 
- Primary: Inter or Noto Sans (excellent Cyrillic support for Kazakh)
- All text rendered in Kazakh language

**Type Scale:**
- Hero/Page Titles: text-5xl font-bold (48px)
- Module Titles: text-3xl font-semibold (30px)
- Section Headers: text-2xl font-semibold (24px)
- Body Text: text-base leading-relaxed (16px, 1.625 line-height)
- Captions/Metadata: text-sm (14px)
- Button Text: text-base font-medium

---

## Layout System

**Spacing Primitives:** Tailwind units of **4, 6, 8, 12, 16, 24**
- Component padding: p-6 or p-8
- Section spacing: space-y-12 or space-y-16
- Card gaps: gap-6
- Page margins: px-4 md:px-8

**Container Widths:**
- Main content: max-w-6xl mx-auto
- Reading content: max-w-3xl
- Quiz containers: max-w-2xl

**Grid Systems:**
- Module cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Two-column layouts: grid-cols-1 lg:grid-cols-2

---

## Component Library

### Authentication Pages (Login/Register)
- Centered card layout with max-w-md
- Clean form design with clear input labels above fields
- Email/password authentication with email verification
- Subtle decorative pattern in background (geometric shapes, low opacity)
- Logo/branding at top of card

### Main Dashboard/Home Page
- **Hero Section:** Welcome banner with student's name, overall progress ring chart, motivational message. Height: natural content flow, not forced viewport.
- **Module Grid:** Four prominent cards, each representing a learning module
  - Card structure: Icon/illustration at top, Kazakh module title, brief description (2-3 lines), progress indicator (percentage or fraction), "Бастау" (Start) or "Жалғастыру" (Continue) button
  - Hover state: subtle lift with shadow increase
- **Progress Summary:** Sidebar or top stats showing completed modules, average test scores, study streak

### Module Detail Pages
- **Header:** Module title, description, estimated time, completion status
- **Content Area:** 
  - Clean reading layout with generous line spacing
  - Content organized in sections with clear headings
  - Visual breaks between concepts (use of horizontal rules or spacing)
  - Supportive diagrams/icons where helpful (computer parts, browser icons, file types)
  - Sticky progress sidebar showing current section
- **Bottom CTA:** Prominent "Тестті бастау" (Start Test) button when content is read

### Quiz/Test Interface
- **Clean, focused layout:** Question number indicator at top
- **Question Card:** Large, readable question text, numbered options with radio buttons or clickable cards
- **Navigation:** "Алдыңғы" (Previous) and "Келесі" (Next) buttons, progress dots showing total questions
- **Submit State:** Review screen showing all answers before final submission
- **Results Page:** 
  - Large score display (e.g., "75%" with circular progress)
  - Pass/fail indication with encouraging message
  - Breakdown showing correct/incorrect answers
  - "Қайта өту" (Retake) or "Келесі модуль" (Next Module) buttons

### Navigation
- **Top Navigation Bar:** Logo left, user profile/avatar right, module links in center
- Active module highlighted
- Dropdown for user menu (profile, settings, logout)

### Progress Indicators
- Circular progress rings for module completion
- Linear progress bars for quiz progress
- Check badges for completed modules
- Percentage displays for test scores

---

## Images

**Where to Include:**
- **Authentication Pages:** Background pattern (abstract geometric shapes, educational theme)
- **Module Cards:** Icon illustrations representing each topic (computer, folders, browser, software) - use icon library or simple SVG illustrations
- **Module Content:** Diagrams explaining computer concepts (not photography, but instructional graphics)

**No Large Hero Image** - This is a utility-focused educational app, not a marketing site. Focus on functional clarity.

---

## Animation Strategy
Minimal, purposeful animations only:
- Smooth transitions between quiz questions (slide/fade)
- Progress ring fill animations on results page
- Subtle hover lifts on cards
- NO distracting decorative animations during learning

---

## Accessibility
- High contrast text (WCAG AA minimum)
- Clear focus indicators on all interactive elements
- Keyboard navigation through quizzes
- Consistent button states across all forms and quizzes
- Label all form inputs clearly