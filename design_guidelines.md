# Scoreboard Overlay Application - Design Guidelines

## Design Approach

**Selected Approach**: Utility-Focused Design System
Given this is a real-time data display tool where reliability, clarity, and instant readability are paramount, we'll use a custom design system optimized for sports scoreboards and control interfaces. The design prioritizes legibility, responsiveness, and clear visual hierarchy over aesthetic embellishment.

**Key Design Principles**:
1. **Instant Readability**: All scores and information must be readable at a glance from any viewing distance
2. **Visual Clarity**: High contrast, bold typography, and clear separation between elements
3. **Functional Efficiency**: Remote control interface optimized for quick, accurate inputs during live events
4. **Overlay Compatibility**: Scoreboard display designed to work cleanly over video content

---

## Core Design Elements

### A. Typography

**Scoreboard Display (Overlay)**:
- Primary Font: Inter or Roboto (web-safe, highly legible)
- Team Names: Bold, 2.5rem-4rem depending on layout
- Scores: Black weight, 4rem-6rem (dominant visual element)
- Labels ("SET", "MATCH"): Medium weight, 0.875rem-1rem, uppercase, letter-spacing

**Remote Control Interface**:
- Headers: Bold, 1.5rem-2rem
- Labels: Medium, 1rem
- Buttons: Medium, 1rem
- Input fields: Regular, 1rem

### B. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, and 12**
- Tight spacing: p-2, m-2 (control buttons, compact elements)
- Standard spacing: p-4, gap-4 (general layout)
- Section spacing: p-6, p-8 (major containers)
- Large spacing: p-12, mb-12 (section separation in remote control)

**Grid System**:
- Scoreboard: Flexbox-based layout, responsive to stacked/side-by-side modes
- Remote Control: 2-column grid on desktop (md:grid-cols-2), single column on mobile

---

## Interface-Specific Guidelines

### 1. Scoreboard Display (Overlay)

**Layout Variations**:

**Side-by-Side Layout**:
- Full-width container with two equal sections
- Team 1 (left) | Team 2 (right)
- Center divider line or gap
- Serve indicator integrated within team section

**Stacked Layout**:
- Vertically stacked team sections
- Team 1 (top) with background
- Team 2 (bottom) with background
- Clear visual separation between teams

**Component Structure**:
- Team container with customizable background
- Team name display (prominent positioning)
- Set score display (large, bold numbers)
- Match score display (secondary size)
- Serve indicator (icon or dot, positioned near active team)

**Visual Treatment**:
- Semi-transparent backgrounds for team sections (allow video visibility)
- High contrast text ensuring readability over any video content
- Rounded corners: rounded-lg for team containers
- Subtle borders or shadows for depth without distraction
- Minimal padding to maximize score visibility: p-4 to p-6

### 2. Remote Control Interface

**Layout Structure**:

**Header Section**:
- Application title "Scoreboard Control"
- Match ID display (current match identifier)
- Connection status indicator (green dot = connected)

**Main Control Area** (2-column grid on desktop):

**Left Column - Team Configuration**:
- Team 1 Section:
  - Team name input field (full width)
  - Color picker for background
  - Font color picker
  - Set score controls (large +/- buttons with current score display)
  - Match score controls (large +/- buttons with current score display)
  - Serve indicator toggle button

- Team 2 Section:
  - Identical structure to Team 1

**Right Column - Display Settings**:
- Layout selector (radio buttons or toggle: "Side by Side" / "Stacked")
- Font family dropdown
- Font size slider or input (with preview)
- Reset button (clear/prominent styling)
- Save configuration button (primary action styling)

**Component Specifications**:

**Score Controls**:
- Large clickable buttons (min-height h-16)
- Plus/Minus buttons on either side of score display
- Current score in center, bold, 2rem font size
- Instant visual feedback on click (subtle scale or brightness change)
- Gap between buttons: gap-4

**Input Fields**:
- Clear labels above each input
- Standard height: h-12
- Rounded borders: rounded-md
- Visible focus states

**Color Pickers**:
- Inline color preview swatch
- Label clearly indicating purpose ("Team Background Color")
- Standard browser color input or custom picker

**Buttons**:
- Primary actions (Save, Update): Larger size (h-12), prominent positioning
- Secondary actions (Reset): Standard size (h-10)
- Icon buttons for +/- controls: Square, h-12 w-12
- All buttons: rounded-md, clear hover states

**Connection Status**:
- Small indicator in header
- Green dot + "Connected" text when active
- Red dot + "Disconnected" text when offline
- Yellow dot + "Reconnecting..." during reconnection

### C. Component Library

**Core UI Elements**:
- Number displays with increment/decrement controls
- Text input fields with clear labels
- Color picker inputs with swatches
- Toggle switches for binary options (serving indicator)
- Radio button groups for layout selection

**Navigation**: 
- Fixed header on remote control with branding and status
- No navigation needed on scoreboard display (single-purpose overlay)

**Forms**:
- Grouped form sections with clear headings
- Vertical rhythm with consistent spacing (gap-6 between form groups)
- Inline validation feedback (if team name too long, etc.)

**Data Displays**:
- Score displays with maximum emphasis (size, weight, contrast)
- Status indicators (connection, serving team)
- Team name displays with background treatment

### D. Responsive Behavior

**Scoreboard Display**:
- Scales text proportionally to viewport
- Maintains layout structure across all screen sizes
- Uses viewport units (vw, vh) for fluid scaling
- Minimum legible sizes enforced

**Remote Control Interface**:
- Desktop (lg): 2-column layout
- Tablet/Mobile: Single column, stacked sections
- All controls remain easily tappable (minimum 44px touch targets)
- Fixed spacing that works across breakpoints

---

## Images

**No images required** for this application. The scoreboard is data-driven and the remote control is a functional interface. All visual elements are text, numbers, colors, and UI controls.

---

## Key Success Metrics

- Scoreboard must be readable from 10+ feet away
- Remote control buttons must provide instant visual feedback
- All text must maintain high contrast ratios (WCAG AA minimum)
- Interface must feel responsive with no perceived lag between button press and visual update