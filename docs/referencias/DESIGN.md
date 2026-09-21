---
name: Apex Dirt Arcade
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e18'
  surface-container-low: '#171b26'
  surface-container: '#1c1f2a'
  surface-container-high: '#262a35'
  surface-container-highest: '#313540'
  on-surface: '#dfe2f1'
  on-surface-variant: '#e5beb2'
  inverse-surface: '#dfe2f1'
  inverse-on-surface: '#2c303b'
  outline: '#ac897e'
  outline-variant: '#5c4037'
  surface-tint: '#ffb59c'
  primary: '#ffb59c'
  on-primary: '#5c1900'
  primary-container: '#ff5708'
  on-primary-container: '#511500'
  inverse-primary: '#aa3600'
  secondary: '#9ddf2e'
  on-secondary: '#213600'
  secondary-container: '#83c300'
  on-secondary-container: '#304b00'
  tertiary: '#efc200'
  on-tertiary: '#3c2f00'
  tertiary-container: '#cea700'
  on-tertiary-container: '#4e3e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59c'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#822700'
  secondary-fixed: '#b2f746'
  secondary-fixed-dim: '#98da27'
  on-secondary-fixed: '#121f00'
  on-secondary-fixed-variant: '#334f00'
  tertiary-fixed: '#ffe083'
  tertiary-fixed-dim: '#eec200'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#0f131d'
  on-background: '#dfe2f1'
  surface-variant: '#313540'
typography:
  display-hero:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 68px
    letterSpacing: 0.04em
  display-hero-mobile:
    fontFamily: Anton
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: 0.03em
  headline-xl:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: 0.03em
  headline-xl-mobile:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Chivo
    fontSize: 24px
    fontWeight: '900'
    lineHeight: 28px
    letterSpacing: 0.01em
  headline-sm:
    fontFamily: Chivo
    fontSize: 18px
    fontWeight: '900'
    lineHeight: 22px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
  body-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-badge:
    fontFamily: Chivo
    fontSize: 13px
    fontWeight: '900'
    lineHeight: 16px
    letterSpacing: 0.06em
  label-hud-numeric:
    fontFamily: Anton
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.02em
  label-caption:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies the adrenaline-fueled aggression, speed, and tactile chaos of competitive motocross and extreme arcade racing. Crafted for mobile, console, and web interfaces, it targets arcade racing enthusiasts, mobile action gamers, and extreme sports fans who demand instant readability at breakneck speeds.

The visual style blends **High-Contrast Action Sports Neo-Brutalism** with **Tactile 90s/2000s Arcade HUDs**:
- **Aggressive Kinetic Energy:** Slanted geometries, dynamic 8-degree to 12-degree forward skews, heavy display letterforms, and hazard chevron striping.
- **Physical Arcade Tactility:** Chunky beveled elements, hard-edged isometric offsets, extruded tactile buttons, and high-impact press animations that mimic physical arcade cabinet switches.
- **Asphalt & Dirt Industrial Grounding:** Heavy carbon/asphalt dark canvases punctuated by blistering neon safety accents, tire-tread corner textures, and industrial track-side iconography.
- **Immediate Legibility:** High visual hierarchy built for peripheral vision and split-second cognitive parsing during high-speed physics gameplay.

## Colors

The palette leverages intense high-visibility safety hues anchored against deep asphalt, cold mud, and carbon chassis tones.

- **Primary (`#FF5500` / `#FF6B00`):** Electric Safety Orange. Drives immediate primary calls-to-action, active engine RPM spikes, turbo states, and destructive level hazards.
- **Secondary (`#A3E635`):** Neon Racing Lime. Reserved for nitro/boost reserves, perfect landings, high scores, check-marks, and optimal gear shifts.
- **Tertiary (`#FACC15`):** Hazard Warning Yellow. Denotes coin/currency collection, track warnings, fuel reserves, and intermediate achievements.
- **Warm Dirt Accents (`#D97706` / `#78350F`):** Used for terrain badges, rust finishes, dirt track progress ribbons, and secondary HUD telemetry.
- **Asphalt Chassis & Neutrals:**
  - `canvas-dark`: `#0B0F19` (Deep void chassis base)
  - `surface-base`: `#0F172A` (Textured dark asphalt)
  - `surface-raised`: `#1E293B` (Carbon armor plates, dialog modals)
  - `surface-highlight`: `#334155` (Bevel edges, hard dividing strips)
- **Text & High-Key Details:**
  - `text-high-contrast`: `#FFFFFF`
  - `text-subdued`: `#94A3B8`
  - `hazard-black`: `#05070B` (For contrast lettering on neon fills)

All interactive elements must feature high contrast: dark UI layers use pure white or fluorescent text; glowing button surfaces use saturated midnight carbon (`#05070B`) glyphs to ensure immediate readability under extreme motion blur.

## Typography

The typography strategy pairs condensed, muscular display power with angular, technical clarity.

- **Headline Font (`Anton`):** Used for game scores, speedometers, victory alerts, coin values, and bold title headers. Set strictly in full uppercase (`text-transform: uppercase`). In dynamic HUD elements, apply a 6° to 10° forward skew (`transform: skewX(-8deg)`) for kinetic momentum.
- **Label & Sub-Headline Font (`Chivo`):** Set at weight 900 for secondary alerts, component tabs, level numbers, and telemetry labels. Provides high-speed legibility without sacrificing industrial punch.
- **Body Font (`Space Grotesk`):** Provides sharp, mechanical grotesque readability for garage loadout statistics, bike specs, track descriptions, settings, and quest logs.
- **Special Treatment:** HUD telemetry uses tabular numerical alignment to eliminate jitter as timers, gear shifts, and distance meters fluctuate rapidly.

## Layout & Spacing

The layout is built around high-density arcade action, pairing screen edge HUD clusters with dynamic center stage action viewports.

- **HUD Safe-Zones & Grid:**
  - Layout relies on edge-pinned tactical anchoring. Primary gameplay HUD components anchor strictly inside 16px (mobile) or 40px (desktop) screen perimeter margins to clear rounded hardware corners and notches.
  - Garage menus, rider customization, and stage select screens utilize a responsive 12-column grid system (4 columns on mobile, 8 on tablet, 12 on widescreen desktop) with consistent 16px to 24px gutters.
- **Slanted Component Modules:**
  - Cards, progress tracks, and tab bars sit on an intentional 6° to 8° angular plane. When stacking angled components, use `space-sm` (8px) along horizontal axes and `space-md` (16px) vertically to maintain negative space between skewed borders.
- **Touch-Target Sizing:**
  - All interactive buttons and touch zones feature a minimum footprint of 48px × 48px, expanding to 64px vertical clearance for throttle, brake, and stunt triggers during mobile runtime.

## Elevation & Depth

Visual hierarchy ignores conventional subtle drop shadows in favor of **Arcade Hard-Drop Extrusions**, **Tactile 3D Bevels**, and **Parallax Backing Plates**:

- **Hard-Drop Offset Surfaces:**
  - Elevation is established by sharp, solid-color 3D extrusions with zero blur.
  - Raised elements (buttons, level cards, badges) feature a `4px 4px 0px #05070B` offset at rest, expanding to `6px 6px 0px #05070B` on hover, and flattening to `1px 1px 0px #05070B` with an inward physical translation (`translate(3px, 3px)`) on active press.
- **Chassis Borders & Double Strokes:**
  - Floating panels and cards use a 2px outer stroke in `#1E293B` or `#334155`, coupled with a 1px inner inset highlight (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15)`) to create industrial sheet-metal bevels.
- **Nitro & Hazard Glows:**
  - Critical gameplay feedback utilizes tight, intense perimeter glows: `0 0 16px rgba(255, 85, 0, 0.6)` for turbo engine heat and `0 0 16px rgba(163, 230, 53, 0.6)` for full nitro capacitors.
- **Tire-Tread Ground Planes:**
  - Underlay modal panels feature a diagonal carbon-fiber crosshatch or tire-tread SVG pattern masked along the container's bottom edge to enhance the gritty mechanical aesthetic.

## Shapes

The shape vocabulary emphasizes angular geometry, chamfered edges, and heavy-duty industrial framing:

- **Chamfers and Hard Clips:** Components utilize subtle `rounded-sm` corners (4px radius) combined with 45-degree clipped corners (`clip-path: polygon(...)`) on primary action buttons and badge headers.
- **Dynamic Skews:** Interactive tabs, nitro meters, and level badge plates skew horizontally by -8 degrees to evoke speed, forward propulsion, and comic-book dynamism.
- **Framing Plates:** Containers do not feature delicate round pills; instead, they simulate stamped metal license plates, motorcycle frame brackets, and polycarbonate fairings.

## Components

### Buttons
- **Primary Arcade Action Button:**
  - Background: Electric Safety Orange (`#FF5500`) with a subtle gradient to `#FF6B00`.
  - Border: 2px solid `#05070B`.
  - Extrusion: Solid 4px bottom-right drop shadow (`#05070B`).
  - Typography: `Anton`, all-caps, slanted 8°, crisp white text with a dark 1px text stroke.
  - States: On hover/focus, shifts background toward vibrant amber and deepens offset to 6px; on active press, compresses down-right 3px with zero shadow to simulate a micro-switch press.
- **Secondary / Utility Button:**
  - Background: Dark Asphalt (`#1E293B`) with a neon border (`#A3E635` or `#FACC15`).
  - Text: High-contrast white or neon lime.
  - Extrusion: 3px solid black offset.

### HUD Gauges & Meters (RPM / Nitro / Fuel)
- **Segmented Speed & Fuel Track:**
  - Constructed using a row of parallel, 12-degree angled bar segments rather than a continuous smooth bar.
  - Inactive state: `#0F172A` with a `#1E293B` stroke.
  - Active Nitro: Blazing Neon Lime (`#A3E635`) with an intense outer pulse.
  - Low Fuel / Critical Hazard: Alternating Hazard Yellow (`#FACC15`) and Safety Orange (`#FF5500`) strobe animation.

### Tactile HUD Badges & Track Chips
- **Chips / Track Conditions:**
  - Angled polygon badges featuring miniature high-contrast icons (skull for hazard, lightning for speed trap, dirt mound for jumps).
  - Background: `#0B0F19` with a 1.5px border matching the accent color of the category.
  - Typography: `Chivo` weight 900, 11px uppercase.

### Level & Stage Cards
- **Structure:**
  - Outer housing built with a 2px carbon-slate border, 4px black hard shadow, and a top-right chamfered notch displaying the track star rating.
  - Image banner: High-contrast action screenshot treated with a subtle dirt-grit grain overlay.
  - Footer telemetry bar: Displays terrain type (e.g., "MUD QUARRY - STAGE 04"), par time, and max air-time record in `Space Grotesk` with `Anton` numerical callouts.

### Input Fields & Toggles
- **Garage Text Inputs:**
  - Angled borders with deep inset background (`#0B0F19`), 2px border in `#334155`, focusing to full `#FF5500` outline.
  - Monospace or high-tech grotesque font entry with high-visibility neon caret.
- **Arcade Toggle Switches:**
  - Heavy mechanical rocker switch design. Left state is dark slate with a red status light; active right state snaps with an orange-to-lime LED activation bar and an audible mechanical snap sound effect cue.

### Checkboxes & Selectors
- **Hazard Checkbox:**
  - 24px square with cut corners, deep asphalt fill, 2px border. Checked state renders a bold, diagonal neon-lime check icon or high-visibility hazard cross.