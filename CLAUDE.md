# Reconciliation Presentation

Scroll-driven product presentation for the sunday Reconciliation feature. Built as a standalone Vite + React + TypeScript app, ported from a Dust platform prototype (Reconciliation_v3.tsx).

## Stack

- **Vite + React + TypeScript** — no framework, inline styles throughout
- **No UI library** — all components use inline styles with the token system
- **Native `<video>`** — no react-player, just HTML5 video for all players
- Deployed on **Vercel**: https://rec-plum.vercel.app
- GitHub: https://github.com/Juliomperezd/reconciliation-presentation

## Project structure

```
rec/
├── public/
│   ├── context-bg.png     # Background image for Section 01 (manager with receipts)
│   ├── superhuman.png     # UX inspiration card image
│   ├── shazam.webp        # UX inspiration card image
│   ├── vision.mp4         # Vision demo video (Section 02)
│   ├── v0.mp4             # V0 demo video (Section 05)
│   ├── v1.mp4             # V1 demo video (Section 06)
│   └── qr.png             # QR code for final CTA section
├── src/
│   ├── main.tsx           # Entry point
│   └── App.tsx            # Entire presentation (~900 lines)
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Design tokens (src/App.tsx top)

```ts
const C = { black: "#000000", white: "#FFFFFF", magenta: "#FF17E9", grey: "#F5F5F6", mid: "#B7B5BB" };
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const T = {
  display: "clamp(40px, 6vw, 84px)",
  title:   "clamp(28px, 4vw, 56px)",
  heading: "clamp(18px, 2.6vw, 36px)",
  body:    "clamp(13px, 1.1vw, 16px)",
};
```

## Sections

| # | ID | Title | Dark | Height | Beats |
|---|---|---|---|---|---|
| 01 | context | Context | ✓ | 500vh | 5 — opener, image bg, word reveal, tool chaos, punchline |
| 02 | vision | Vision | ✗ | 350vh | 4 — timestamp, feature pitch, vision.mp4, validation |
| 03 | hypotheses | What we learned | ✓ | 280vh | 3 — headline, insight cards, conclusion |
| 04 | prototype | First Prototype | ✗ | 300vh | 2 — Superhuman/Shazam cards, checklist |
| 05 | v0 | V0 | ✗ | 100vh | 1 — v0.mp4 player |
| 06 | v1 | V1 | ✗ | 100vh | 1 — v1.mp4 player |
| 07 | nextsteps | Next steps | ✓ | 350vh | 4 — "And then?", quote, iterations grid, FAQ |
| 08 | cta | Try it | ✗ | 100vh | 1 — QR + names |

## Key mechanics

- **`beatAnim(p, i, n)`** — pure scroll-driven opacity + yOffset. No CSS transitions. Scroll IS the animation.
- **`SectionDef.height`** — controls total scroll distance per section. Divides evenly across beats (~80-100vh per beat target).
- **`ctaShowThreshold`** — progress % at which the continue button appears (default 0.85). Set to `0` for static sections (V0, V1, CTA).
- **`noScrollHint: true`** — hides the "scroll ↓" indicator (used on V0, V1).
- **`pointerEvents`** — beat wrappers set `pointerEvents: "none"` when `opacity < 0.1` to prevent invisible beats blocking video controls.
- **`GlowDecor`** — decorative magenta radial gradient, corner rotates per section index.

## Adding new videos

Drop an `.mp4` into `public/` and reference it in the beat:
```tsx
() => <VideoPlayer src="/yourfile.mp4" label="Label" />
```

## Deploy

```bash
git add . && git commit -m "your message" && git push
vercel --yes --prod
```
