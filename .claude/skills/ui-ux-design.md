---
name: ui-ux-design
description: Checklist and reference for what separates distinctive UI/UX design from merely competent design, covering structure/layout, typography, color systems, iconography/motion, microcopy, and usability heuristics. Use this whenever designing, building, or reviewing a UI — new screens, components, landing pages, dashboards — or when asked to make something look "distinctive," "polished," "less generic," or "less AI-slop." Also use when reviewing existing UI/frontend work for design quality, or when picking a color palette, type scale, or icon system for a project. Pairs with the frontend-design skill (which covers concrete CSS/token constraints for this environment) — frontend-design tells you what you *can* do technically, this skill tells you what's worth doing.
---

# UI/UX Design Checklist

A working reference for evaluating and producing UI design work — organized around seven
categories. Use it two ways:

1. **Generative** — before/while building a UI, scan the relevant section(s) to make
   deliberate choices instead of defaulting to the first reasonable-looking option.
2. **Evaluative** — when reviewing a UI (yours or a client's), walk the checklist and flag
   what's missing, then point at the specific "distinctive execution" example to explain
   what a stronger version would look like.

The throughline across all seven: **distinctive design isn't more of anything** — not more
color, more motion, more decoration. It's a system with an owner making specific, defensible
choices at every level. Good design commits; generic design defaults. When in doubt, ask
"is this a deliberate choice, or just what happened to render first?"

---

## 1. Structural Principles

- One clear focal point per screen — established through size, contrast, and position
  working together, not any single one alone.
- Real grid discipline — elements line up; nothing drifts. Alignment is what makes a layout
  read as intentional rather than assembled.
- Proximity encodes relationship — a label and its input never sit visually disconnected;
  unrelated things get real separation, not just a hairline border.
- Whitespace as an active tool, not leftover space — generous space around a primary action
  isolates it and lowers cognitive load (Google's homepage is the extreme case).
- Deliberate asymmetry, when earned — breaking the grid to give one element more weight
  should serve a specific hierarchy goal, not be asymmetry for its own sake.
- Repetition with intentional breaks — consistent patterns build recognition; a pattern
  broken on purpose, at the right moment, is what grabs attention. Repetition alone is just
  template rhythm.
- Progressive disclosure — complex flows sequenced so the user sees only what's relevant at
  each step, not everything at once.

**Distinctive vs. competent:** competent execution follows the grid correctly. Distinctive
execution knows exactly when and why to break it — one element that ignores the grid on
purpose reads as confidence, not sloppiness, because everything else around it proves the
grid was a choice.

---

## 2. Typographic Craft

- A real modular scale, not ad-hoc sizes — sizes relate through a deliberate ratio (Minor
  Third 1.2 for subtle contrast, Major Third 1.25 for moderate, Golden Ratio 1.618 for
  high-impact display), not picked one at a time by eye.
- Genuine weight/size contrast between levels — a large low-contrast heading can still lose
  to a smaller, higher-contrast element beneath it.
- A capped number of heading levels (six is a reasonable ceiling) so hierarchy stays legible.
- Distinct roles for distinct type — a display voice for impact, a body voice for extended
  reading, a monospace/tabular voice for data or numbers.
- Tracking and line-height as deliberate design decisions, not left at default.
- The scale documented and applied consistently, not reinvented per screen.

**Distinctive vs. competent:** a competent system picks a reasonable scale and stops. A
distinctive one uses weight as an active tool — Stripe runs display headlines at an
unusually *light* weight (300) with tightened tracking, rejecting the reflexive bold-hero
convention because the brand's point is quiet authority, not shouting.

---

## 3. Color Systems That Work

- One dominant neutral system, one primary action color, one supporting accent — not an
  evenly distributed palette where nothing commits to being the loud color.
- A small, deliberate set of semantic colors (success, warning, error, info) named for
  *function*, not appearance — `action-primary` / `text-error`, not `blue-500` / `red-400`
  — so meaning survives a rebrand.
- Primitive/semantic token separation — raw values sit underneath purpose-driven aliases;
  changing the brand primary updates one base token, not every usage.
- Color never carries meaning alone — status is reinforced by icon, label, or shape too, so
  it still works for someone who can't distinguish the hues.
- Every pairing contrast-tested, not eyeballed — including hover/focus and dark-mode
  variants per semantic token.
- Accent usage documented and restrained — primary actions, active states, critical alerts
  specifically, not sprinkled wherever something needs to "pop."

**Distinctive vs. competent:** a competent palette is accessible and consistent. A
distinctive one is recognizable on its own — Cash App's near-black plus one saturated
green, Robinhood's single bright green against clean minimal charts — because exactly one
color does the identity work and everything else gets out of its way.

---

## 4. Purposeful Iconography and Motion

- Every icon earns its place — disambiguates, speeds recognition, or replaces needed text,
  not decoration next to a label that was already clear.
- One consistent icon system, one grid (commonly a multiple of the base spacing unit, e.g.
  16/32px on an 8pt grid), one source — not assembled ad hoc from whichever library has the
  closest match.
- Icons representational and unambiguous — never require guessing from context alone.
- Motion has a job — feedback on system status, a state transition made legible, or genuine
  delight at one high-impact moment, not decoration applied uniformly.
- Restraint is itself a choice — one well-orchestrated moment (a staggered page-load reveal)
  does more than scattered micro-interactions on every hover.

**Distinctive vs. competent:** competent icon use is consistent and correctly sized.
Distinctive icon work is bespoke to the product's own vocabulary — a custom mark or two tied
to what the product actually does, rather than the same generic library search everyone
else draws from.

---

## 5. Content and Microcopy Craft

- Clarity over cleverness — marketing copy can be a poem; microcopy is an instruction
  manual, and if it isn't clear it isn't usable no matter how clever.
- Action-oriented, specific labels — "Start free trial" over "Submit."
- Say it once — no label/sublabel/helper-text/hint-text chain repeating the same idea.
- Errors explain and guide, not just report — plain language, no error codes, states what
  went wrong and what to do next.
- Tone matches context, not just brand — crisp in a data table, warmer in an empty state.
- A documented pattern library for recurring copy decisions ("sign in" vs. "log in") so
  voice doesn't drift screen to screen.
- Real content in every design pass — not lorem ipsum standing in for copy that was never
  actually considered.

**Distinctive vs. competent:** competent microcopy is clear and correct. Distinctive
microcopy uses *purposeful friction* — a confirmation step or specific warning exactly where
it prevents a costly mistake, understanding frictionless isn't always good.

---

## 6. Interaction and Usability Fundamentals

Grounded in Nielsen's ten heuristics — still the baseline forty years on:

- Visibility of system status — the interface always tells the user what's happening, in
  reasonable time.
- Match between system and real world — language and concepts speak the user's language,
  not internal jargon or error codes.
- User control and freedom — clear undo/cancel/back for any accidental action.
- Consistency and standards — the same word, icon, or pattern always means the same thing;
  platform conventions followed, not reinvented.
- Error prevention over error messages — real-time validation and confirmation before a
  destructive action beat a good message after the fact.
- Recognition rather than recall — options visible and in context; never require
  remembering information from an earlier screen.
- Flexibility and efficiency of use — shortcuts for expert users without complicating the
  interface for first-timers.
- Minimalist, essential-only content — every unit of information competes for attention.
- Help users recognize, diagnose, and recover from errors — plain language, no error codes.
- Accessibility as first-class, not a pass at the end — contrast, keyboard nav,
  screen-reader compatibility considered from the start.

**Distinctive vs. competent:** competent usability follows the heuristics as a checklist.
Distinctive usability treats them as instinct so deeply the user never consciously notices
any of them working — the interface never asks a question it should have already answered.

---

## 7. Named References — Where Craft Actually Lives

Awwwards' judging weights are a useful proxy: **Design 40%, Usability 30%, Creativity 20%,
Content 10%.** Usability alone is nearly as heavily weighted as visual design — most
submissions fail on usability, not on looking interesting enough. Creativity is rewarded
when it serves the user, not for risk-taking's own sake; content (lowest-weighted) is still
enough to sink a submission — real, purposeful copy, not a pasted-in afterthought.

| Principle  | Competent execution                          | Distinctive execution                                                          | Who does this |
|---|---|---|---|
| Typography | Safe, readable font at reasonable sizes      | A commissioned/unusual typeface used as an active brand signal                 | Vercel commissioned Geist; Stripe runs display type at weight 300 with tight negative tracking |
| Color      | Accessible, consistent palette               | One color doing all identity work, restrained everywhere else                  | Cash App (near-black + one green); Robinhood (one green, minimal charts) |
| Structure  | Clean grid, correctly followed                | The grid broken once, deliberately, at the moment something deserves more weight | Editorial layouts: large photography, controlled asymmetry for content discovery |
| Icons      | Consistent, correctly-sized icon set          | A small bespoke mark set tied to the product's own vocabulary                  | Custom sets built on one grid, one tool — not pulled from a generic library |
| Motion     | Standard transitions, applied consistently    | One orchestrated, high-impact moment vs. scattered micro-interactions          | A single staggered page-load reveal beating a dozen small hover animations |
| Copy       | Clear, grammatically correct microcopy        | Purposeful friction — a deliberate pause exactly where it prevents real harm   | Confirmation steps placed only where a mistake would be costly |

---

## How to use this in practice

**When building a new UI:** before writing markup, decide — out loud, briefly — what the
one dominant color is, what the type scale ratio is, and what the single focal point of the
screen is. If you can't answer those three in one sentence each, the design isn't specified
enough yet to be distinctive; it'll default to generic.

**When reviewing a UI:** don't just say "this looks generic." Point to the specific
category (e.g. "the palette has four colors all competing for attention — pick one to
commit to, per Color Systems") so the feedback is actionable, not just vibes.

**When picking between two options:** prefer the one that's a deliberate, explainable
choice over the one that's merely "not wrong." A safe default and a considered choice can
look identical at first glance — the test is whether you can say *why* it's that way and
not something else.

This skill is a checklist of principles, not a CSS/component reference — for concrete
implementation constraints (available Tailwind classes, design tokens, etc.) in this
environment, use the frontend-design skill alongside it.