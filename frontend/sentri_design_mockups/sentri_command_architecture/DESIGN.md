---
name: Sentri Command Architecture
colors:
  surface: '#0e141c'
  surface-dim: '#0e141c'
  surface-bright: '#343943'
  surface-container-lowest: '#090e17'
  surface-container-low: '#171c25'
  surface-container: '#1b2029'
  surface-container-high: '#252a33'
  surface-container-highest: '#30353e'
  on-surface: '#dee2ef'
  on-surface-variant: '#d6c3af'
  inverse-surface: '#dee2ef'
  inverse-on-surface: '#2c313a'
  outline: '#9f8e7c'
  outline-variant: '#514535'
  surface-tint: '#ffb958'
  primary: '#ffc77f'
  on-primary: '#462b00'
  primary-container: '#f0a73b'
  on-primary-container: '#643f00'
  inverse-primary: '#845400'
  secondary: '#abc8f4'
  on-secondary: '#103155'
  secondary-container: '#2a486d'
  on-secondary-container: '#9ab7e2'
  tertiary: '#ffc2bb'
  on-tertiary: '#680104'
  tertiary-container: '#ff9a8e'
  on-tertiary-container: '#891c17'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb5'
  primary-fixed-dim: '#ffb958'
  on-primary-fixed: '#2a1800'
  on-primary-fixed-variant: '#643f00'
  secondary-fixed: '#d3e3ff'
  secondary-fixed-dim: '#abc8f4'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#2a486d'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4aa'
  on-tertiary-fixed: '#410001'
  on-tertiary-fixed-variant: '#891c17'
  background: '#0e141c'
  on-background: '#dee2ef'
  surface-variant: '#30353e'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  data-mono:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for high-stakes security environments, prioritizing rapid data ingestion, authoritative presence, and unwavering reliability. The brand personality is vigilant and sophisticated, utilizing a "Tactical Modernism" aesthetic that balances high-tech precision with utilitarian clarity.

The interface is exclusively dark-mode, designed to reduce ocular fatigue for personnel monitoring screens in low-light environments. Visual hierarchy is established through structural rigidity and purposeful color application rather than decorative flourishes. The emotional response should be one of absolute control and situational awareness.

## Colors

The palette is anchored by **Void (#12151A)**, a deep, desaturated black that serves as the foundation for the entire ecosystem. 

- **Primary Action (Gold):** Reserved for high-priority interactions, active states, and system-level confirmations.
- **Secondary/Info (Steel):** Used for non-critical telemetry, navigation accents, and low-severity informational states.
- **Critical (Ember):** Strictly applied to high-severity alerts, destructive actions, and active security breaches.
- **Surface (Panel):** Elevated components and card containers utilize this shade to create a distinct secondary layer above the background.

Status must always be communicated through a triad of color, text label, and icon to ensure accessibility and clarity under duress.

## Typography

This design system employs a three-tier typographic hierarchy:
1. **Space Grotesk:** Used for headlines and display elements. Its geometric, technical nature reinforces the "Command Center" aesthetic.
2. **IBM Plex Sans:** The workhorse for all body copy and descriptions, chosen for its exceptional legibility and neutral, professional tone.
3. **IBM Plex Mono:** Dedicated to technical data, unique identifiers (IDs), rates, and timestamp logs. 

All technical labels and data points should be set in Mono to signify their status as "read-only" or "system-generated" telemetry. Large display headings should utilize negative letter spacing to maintain a compact, authoritative look.

## Layout & Spacing

The layout philosophy follows a strict 4px grid system. 

- **Grid:** A 12-column fluid grid for desktop with 24px gutters. Mobile scales to a 4-column grid with 16px margins.
- **Hero Panels:** Exactly one panel per screen may feature a 45-degree chamfered corner (top-right or bottom-left) to signify the primary focal point of the view.
- **Density:** High information density is preferred. Use tight spacing (8px-12px) between related data points and more generous spacing (32px+) between distinct functional blocks.

## Elevation & Depth

This design system rejects ambient shadows in favor of **Tonal Layering** and **Low-Contrast Outlines**.

- **Level 0 (Background):** Void (#12151A).
- **Level 1 (Panels):** Surface Panel (#1B2029) with a 1px border of #2D3748.
- **Level 2 (Popovers/Modals):** Surface Panel (#1B2029) with a 1px border of #3D5A80 (Steel) to indicate temporary focus.

Depth is communicated through brightness: elements closer to the user are slightly lighter in tone. Interactive elements should never use "glow" effects unless they are indicating an active Critical (Ember) alert.

## Shapes

The design system uses a **Sharp (0px)** roundedness philosophy to reinforce a rigid, industrial feel. 

- **Standard Elements:** Hard 90-degree corners for all buttons, inputs, and cards.
- **The Chamfer:** Primary hero sections utilize a 45-degree cut (24px offset) on a single corner.
- **Diamond Aperture:** Status indicators are 12x12px squares rotated 45 degrees. These are used for "Online/Offline" status and progress pips.

## Components

### Buttons & Inputs
- **Primary Button:** Solid Gold (#F0A73B) background with Black text. No radius.
- **Secondary Button:** 1px Steel (#3D5A80) outline with transparent background.
- **Input Fields:** Void background, 1px Steel bottom-border only. Labels are always "Label-Caps" style in IBM Plex Mono.

### Dispatch-Ticket Rows
Specialized list items for personnel or incident logs.
- **Structure:** 1px Steel border on all sides.
- **Accent:** A 4px solid color bar on the far-left edge indicating status (Gold, Steel, or Ember).
- **Notch:** A small "V" shaped notch cut into the center-right of the top and bottom borders to mimic physical ticket perforation.

### The Navigation Dock
A floating capsule positioned at the bottom-center of the screen. 
- **Style:** Semi-transparent Panel (#1B2029 at 90% opacity) with a heavy backdrop blur.
- **Shape:** Full pill-shaped radius (the only exception to the sharp-corner rule).

### Status Pips
Utilize the "Diamond Aperture" motif. 
- **Active:** Solid Diamond.
- **Inactive:** Outlined Diamond.
- **Processing:** Diamond with a vertical split-fill animation.