# Suyash Pandey — Portfolio

> *"Don't just scroll through the portfolio. Experience it."*

A scroll-driven, cinematic personal portfolio. Not a page with sections — one
continuous narrative in seven chapters, where scroll position *is* the timeline.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

---

## 1. Edit your content first

**Everything you need to change lives in one file: [`data/content.ts`](data/content.ts).**
Nothing personal is hardcoded in components.

Anything written as `[ SQUARE BRACKETS ]` is an **unfilled placeholder**. It renders
with a dashed underline so you can spot it at a glance, and the styling disappears
the moment you replace the string. No company names, dates, metrics, or tech stacks
have been invented for you.

| Export | What it drives |
| --- | --- |
| `personalInfo` | Name, hero lines, about paragraphs, location, status, facts strip |
| `experience` | The 5 internships (chapter 03) |
| `experienceConclusion` | `5 INTERNSHIPS.` → `5 DIFFERENT PERSPECTIVES.` → `ONE EVOLVING DEVELOPER.` |
| `journeyChain` | `AI → DATA → AI → WEB → SOLUTIONS` |
| `skills` | The floating typography field (chapter 04) |
| `projects` | The horizontal gallery + detail overlay (chapter 05) |
| `interests` | CHESS / BADMINTON / COMICS / MUSIC / EXPLORING (chapter 06) |
| `socialLinks` | EMAIL / LINKEDIN / GITHUB / INSTAGRAM / RESUME (chapter 07) |
| `chapters` | The 7 chapter ids, numbers, labels and accent colours |

### An internship

```ts
{
  id: 'exp-01',
  index: '01',
  role: 'AI INTERN',                 // the only thing that is known
  company: '[ COMPANY NAME ]',
  duration: '[ MONTH YEAR — MONTH YEAR ]',
  description: '[ One or two lines… ]',
  technologies: ['[ TECH 1 ]', '[ TECH 2 ]', '[ TECH 3 ]'],
  responsibilities: ['[ Responsibility one ]', …],
  learnings: ['[ Key learning from this internship ]'],
  phase: 'ai',                       // ai | data | ai2 | web | system
  accent: '#B14AFF',
  themeLabel: 'ARTIFICIAL INTELLIGENCE',
}
```

`phase` picks the canvas visual behind the panel: `ai` → neural network,
`data` → data table, `ai2` → a denser network, `web` → a browser assembling
itself, `system` → an interconnected ecosystem. They morph into each other as
you scroll, so the five internships read as one evolving system.

### Project images

Drop replacements in `public/projects/` using the same filenames
(`project-01.jpg` … `project-04.jpg`), or point `projects[].image` elsewhere.
Each needs an `alt` string — it is used, not decorative.

---

## 2. How the scroll engine works

Every chapter is the same shape:

```tsx
<section className="chapter hero">   {/* tall — height set in CSS       */}
  <div className="stage hero__stage"> {/* sticky, 100svh, overflow: clip */}
    …
  </div>
</section>
```

Sticky + `scrub` rather than ScrollTrigger's `pin`. Pinning rewrites the DOM and
fights `overflow`, and gets expensive once nine chapters do it at once. Sticky is
native, cheap, and leaves the document height honest.

```ts
scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub }
```

Chapter length is pure CSS, so retiming a beat means changing one number:

| Chapter | Scroll length |
| --- | --- |
| Hero | `340vh` |
| About | `270vh` |
| Experience | `660vh` (`620vh` under 1100px) |
| Skills | `280vh` |
| Projects | `(projects.length + 1) × 100vh` — set inline from the data |
| Chaos | `210vh` |
| Personality | natural flow (~340vh) |
| Contact | `280vh` |
| Outro | `300vh` |

### Two things worth knowing before you retime anything

**GSAP normalises a timeline to its own duration.** A tween placed at `0.56` is
not "56% of the scroll" — it's 56% of whatever the *last* tween ends at. The
Contact chapter therefore ends with a deliberate empty spacer
(`tl.to({}, { duration: 0.32 }, 0.64)`) so the link list finishes assembling at
~65% of the chapter and then *stays* on screen instead of completing on the last
pixel.

**Prefer `tl.set()` over `fromTo()` for a scrubbed starting state.** A
`ScrollTrigger` refresh invalidates tweens the playhead hasn't reached yet, and
their `from` values quietly stop being applied — elements appear before their
cue. Setting the state explicitly inside the timeline survives seeks in both
directions.

### Velocity

Lenis reports velocity → smoothed once per frame in a `gsap.ticker` callback →
written to `scrollState` and a couple of CSS custom properties. Nothing in the
velocity path triggers a React render.

---

## 3. Chapter map

| # | Id | Chapter | The idea | Accent |
| --- | --- | --- | --- | --- |
| 01 | `hero` | Hero | Six staged beats: `HEY.` moves upper-left, `I'M` enters from the right, `SUYASH.` scales, `I BUILD` takes its own band, `DIGITAL` stretches past both edges, `EXPERIENCES.` rotates out | Electric purple |
| 02 | `about` | About | `WHO / AM / I?` at three parallax depths; the paragraph arrives through a mask wipe; an orb canvas spins with scroll velocity | Electric blue |
| 03 | `experience` | Experience | Five internships as a journey, not cards. A growing 01–05 timeline, each panel with its own entrance grammar, morphing canvas themes behind them, then the four-line conclusion | Electric purple |
| — | `chaos` | Chaos Zone | `THINGS GET WEIRD HERE.` Counter-scrolling marquees, drifting shapes, velocity-reactive — and still readable | Hot pink |
| 04 | `skills` | Skills | A floating typography field that converges into a legible column, then explodes outward into Projects | Neon green |
| 05 | `projects` | Projects | Vertical scroll drives a horizontal gallery (0.85 / 1.0 / 0.85, rotation, perspective, blur). Click → FLIP expand to full screen | Hot pink |
| 06 | `weird` | Personality | `WHEN I'M NOT CODING…` — five interests, each with its own canvas micro-animation | Orange |
| 07 | `contact` | Contact | Four words fly in from four directions and assemble, then five oversized links with a width-axis stretch on hover | Electric purple |
| — | `outro` | Outro | `YOU MADE IT.` → `SCROLL BACK UP.` → the whole story rewinds as a visual illusion | Electric purple |

The accent is a single registered custom property (`@property --accent`) set from
`ScrollProgress`, so the entire palette cross-fades over 700ms as you move between
chapters.

---

## 4. Interaction details

**Custom cursor** — a dot plus a lerped follower. Hovering a `data-cursor="view |
open | explore | click"` element swaps the label and the shape. Disabled entirely
on touch and under reduced motion.

**Project detail** — a hand-rolled GSAP FLIP: measure the card's rect, mount the
overlay, animate the delta with a counter-scaled inner image, `expo.inOut`,
reverse on close. Framer Motion's `layoutId` was the obvious choice and the wrong
one — it miscalculates under the transformed ancestors this page is full of.

Closing restores **the exact scroll offset** and returns focus to the card's
button. The lock deliberately does *not* clamp `body { height }` — doing so
collapses the scroll range and the browser silently discards the position.

**Rewind ending** — purely visual. Scan lines, a counting-down readout, a
shrinking bar, and the chapter titles replaying in reverse. The page never
manipulates your scroll; the only programmatic scroll on the whole site is the
`BACK TO 00` button you choose to press.

---

## 5. Responsive, motion and access

**Mobile** is a different strategy, not a squeeze. The chapter rail becomes a
minimal top progress line; experience panels dock to the bottom of the viewport
and fit inside it; the project gallery goes single-column; the chaos headline
swings in pixels instead of percentages so it can never lose its first letter.
Breakpoint logic lives in `gsap.matchMedia()` (`min-width: 900px`) so handlers
are torn down and rebuilt on resize rather than reading a stale flag.

**`prefers-reduced-motion`** is a real alternative layout, not a disabled one.
Chapters drop their scroll length, stages become `position: relative`, and every
section reflows into readable static content — the page shrinks from ~28,700px to
~16,800px and tells the same story without a single transform.

**Accessibility** — semantic landmarks and headings, a skip link, visible focus
states, `aria-live` chapter announcements, `sr-only` text behind every split-letter
headline (so screen readers get `"5 INTERNSHIPS."` rather than fourteen letters),
real `alt` text, Escape-to-close on both the menu and the project overlay, and
focus restoration on close.

**Performance** — transforms and opacity only; no layout thrash in any scroll
handler. Velocity is smoothed once per frame and shared. Canvas scenes are small,
capped, and wrapped in a guard that disables a scene rather than letting a bad
frame take down the page. No particle systems.

---

## 6. Layout tokens

`app/globals.css` holds the design tokens. Two are worth knowing:

- `--gut` — the page gutter.
- `--rail-space` — `0px` on mobile, `78px` from 900px up. Everything that could
  collide with the chapter rail is inset by it. If you move or resize the rail,
  change this one value.

---

## 7. Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · GSAP 3 + ScrollTrigger ·
Lenis · Framer Motion (menu transitions only) · hand-written CSS, no utility
framework · `Archivo` variable (the `wdth` axis does the link-stretch hover) and
`JetBrains Mono`.

```
app/        layout, page composition, globals.css + sections.css
components/ one file per chapter, plus the shared primitives
  visuals/  canvas scenes (journey, orb, interests)
data/       content.ts — the only file you need to edit
lib/        scroll state + helpers, hooks
public/     project images
```
