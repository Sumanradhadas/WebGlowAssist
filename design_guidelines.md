# Design Guidelines: VAPI Custom Call Interface

## Design Approach
**Reference-Based:** Drawing inspiration from iOS Phone, FaceTime, and WhatsApp call interfaces - familiar mobile call screen patterns that users instinctively understand.

## Core Design Principles
1. **Immediate Familiarity** - Mirror native mobile call screens so users know exactly what to do
2. **State Clarity** - Each call state (idle, calling, connected, ended) must be visually distinct
3. **Touch-First Design** - Large tap targets optimized for mobile interaction
4. **Minimal Cognitive Load** - Only show what's needed for the current call state

## Layout System

### Viewport Strategy
- Full-screen interface (100vh) - immersive call experience
- Centered vertical layout with content stacked from top to bottom
- Tailwind spacing: Use units of 4, 6, 8, 12, 16, 24 for consistent rhythm

### Call Screen States

**Idle State (Pre-Call):**
- Centered layout with avatar at top (w-32 h-32)
- Company/assistant name below avatar (space-y-4)
- Large circular start button at bottom third (w-20 h-20)
- Minimal text: "Tap to start call" or assistant tagline

**Calling State:**
- Avatar remains centered (w-40 h-40)
- "Calling..." status text below avatar
- Animated pulsing rings around avatar (scale animation)
- Start button morphs/disappears

**Connected State:**
- Avatar at top (w-32 h-32, mt-16)
- Timer directly below avatar (mt-6)
- Waveform visualization in middle third (h-24)
- Red circular end call button at bottom (mb-16, w-20 h-20)

**Call Ended State:**
- Brief transition showing "Call Ended" with duration
- Quick fade back to idle state (2-3 seconds)

## Typography Hierarchy

### Font Selection
- **Primary Font:** Inter or SF Pro Display (via Google Fonts CDN)
- **Weight Range:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Type Scale
- **Assistant Name:** text-2xl font-semibold (call screen header)
- **Status Text:** text-lg font-medium ("Calling...", "Connected")
- **Timer:** text-5xl font-bold tabular-nums (00:00 format)
- **Descriptive Text:** text-base font-normal (subtitles, helper text)
- **Button Labels:** text-sm font-semibold uppercase tracking-wide

## Component Library

### Avatar Component
- Circular container with overflow hidden (rounded-full)
- Gradient background or solid color if no image
- Border: 4px solid with subtle opacity
- Sizes: idle (w-32 h-32), connected (w-32 h-32), calling (w-40 h-40)

### Call Buttons
**Start Button:**
- Large circular button (w-20 h-20)
- Icon: phone or microphone (size-8)
- Subtle shadow for depth

**End Button:**
- Large circular button (w-20 h-20)
- Icon: phone-hangup or X (size-8)
- Strong shadow for emphasis
- Pulse animation on hover

### Timer Display
- Monospaced tabular numbers for smooth transitions
- Format: MM:SS
- Prominent sizing (text-5xl) for instant readability
- Light opacity when inactive

### Waveform Visualization
- Horizontal bars array (5-7 vertical bars)
- Height animated based on audio levels or pulse pattern
- Spacing: gap-1 or gap-2 between bars
- Container height: h-24, centered in viewport

### Status Indicators
- Text-based status ("Calling...", "Connected", "Call Ended")
- Subtle icon accompaniment (animated dots for calling state)
- Smooth fade transitions between states

## Interaction Patterns

### Call Flow Choreography
1. **Idle → Calling:** Start button scales down and fades, avatar scales up, calling text fades in
2. **Calling → Connected:** Status text changes, waveform fades in, end button appears from bottom
3. **Connected → Ended:** Waveform stops, timer freezes, brief "Call Ended" message
4. **Ended → Idle:** Fade out all elements, reset to initial state

### Micro-Interactions
- Avatar subtle breathing animation during connected state
- Button press: scale down to 0.95 on tap
- Waveform: continuous gentle pulse animation
- Timer: smooth digit transitions (no jump)

## Spacing Architecture
- **Screen Padding:** px-6 md:px-8 (horizontal containment)
- **Vertical Rhythm:** space-y-6 for grouped elements, space-y-12 between major sections
- **Button Margins:** mb-16 (bottom floating buttons)
- **Avatar Spacing:** mt-16 (top positioning), mb-6 (separation from content)

## Accessibility Considerations
- ARIA labels for all interactive elements ("Start Call", "End Call")
- Focus visible states with clear outlines
- Screen reader announcements for state changes
- Sufficient contrast for all text (WCAG AA minimum)
- Touch targets minimum 44x44px

## Images
**Avatar/Profile Image:**
- Professional headshot or brand logo representing the AI assistant
- Square format optimized to 256x256px minimum
- Placement: Top-center of call screen
- Fallback: Gradient or solid background with initials