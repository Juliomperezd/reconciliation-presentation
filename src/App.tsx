import { useState, useRef, useEffect, useCallback } from "react";

// ── Tokens ───────────────────────────────────────────────
const C = { black: "#000000", white: "#FFFFFF", magenta: "#FF17E9", grey: "#F5F5F6", mid: "#B7B5BB" };
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// ── Typography scale ─────────────────────────────────────
const T = {
  display: "clamp(40px, 6vw, 84px)",
  title:   "clamp(28px, 4vw, 56px)",
  heading: "clamp(18px, 2.6vw, 36px)",
  body:    "clamp(13px, 1.1vw, 16px)",
};

// ── Beat animation — scroll-driven ──────────────────────
function beatAnim(p: number, i: number, n: number): { opacity: number; yOffset: number } {
  const bw = 1 / n;
  const ff = 0.25;

  if (i === 0) {
    const foS = bw * (1 - ff);
    if (p <= foS) return { opacity: 1, yOffset: 0 };
    const t = Math.min(1, (p - foS) / (bw * ff));
    return { opacity: 1 - t, yOffset: -t * 70 };
  }

  const s   = i * bw;
  const e   = (i + 1) * bw;
  const fiE = s + bw * ff;
  const foS = e - bw * ff;

  if (p < s)   return { opacity: 0, yOffset: 70 };
  if (p < fiE) { const t = (p - s)   / (bw * ff); return { opacity: t, yOffset: (1 - t) * 70 }; }
  if (i === n - 1) return { opacity: 1, yOffset: 0 };
  if (p < foS) return { opacity: 1, yOffset: 0 };
  if (p < e)   { const t = (p - foS) / (bw * ff); return { opacity: 1 - t, yOffset: -t * 70 }; }
  return { opacity: 0, yOffset: -70 };
}

// ── Dark image background for Chapter 1 ─────────────────
function ContextImageBg({ progress, totalBeats }: { progress: number; totalBeats: number }) {
  const bw   = 1 / totalBeats;
  const inS  = bw;
  const inE  = bw + bw * 0.45;
  const outS = 3 * bw - bw * 0.3;
  const outE = 3 * bw;

  let op = 0;
  if      (progress < inS)  op = 0;
  else if (progress < inE)  op = (progress - inS) / (inE - inS);
  else if (progress < outS) op = 1;
  else if (progress < outE) op = 1 - (progress - outS) / (outE - outS);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: op, pointerEvents: "none" }}>
      <img
        src="/context-bg.png"
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.52)" }} />
    </div>
  );
}

// ── Word-by-word reveal ──────────────────────────────────
function WordReveal({
  text, subProgress, color, fontSize, lineHeight = "120%", accentColor,
}: {
  text: string; subProgress: number; color: string; fontSize: string; lineHeight?: string; accentColor?: string;
}) {
  const words = text.split(" ");
  const n = words.length;
  return (
    <p style={{ fontFamily: F, fontSize, lineHeight, letterSpacing: "-0.02em", color, margin: 0 }}>
      {words.map((w, wi) => {
        const thresh = wi / n;
        const soft   = 2.5 / n;
        let op = 0;
        if      (subProgress >= thresh + soft) op = 1;
        else if (subProgress >= thresh)        op = (subProgress - thresh) / soft;
        const wColor = accentColor && wi === n - 1 ? accentColor : color;
        return (
          <span key={wi} style={{ opacity: op, marginRight: "0.25em", display: "inline-block", color: wColor }}>
            {w}
          </span>
        );
      })}
    </p>
  );
}

// ── Inspiration beat — UX reference cards ────────────────
function InspirationBeat() {
  const cards = [
    {
      tag: "UX Inspiration 1",
      title: "Superhuman",
      img: "/superhuman.png",
      desc: "You have one clear goal. The app walks you through it in a linear, organized flow. And when you're done — there's a small moment of reward. The interface works for you, not against you.",
    },
    {
      tag: "UX Inspiration 2",
      title: "Shazam",
      img: "/shazam.webp",
      desc: "One use case — done exceptionally well. No feature creep, no extra personas, no edge cases bloating the experience. One action, executed perfectly.",
    },
  ];

  return (
    <div style={{ textAlign: "center", width: "min(700px, 46vw)" }}>
      <p style={{ fontFamily: F, fontSize: T.title, lineHeight: "96%", letterSpacing: "-0.048em", color: C.black, fontWeight: 400, margin: "0 0 24px" }}>
        A v0 built to learn.
      </p>
      <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
        {cards.map((card) => (
          <div key={card.title} style={{ background: C.grey, borderRadius: 20, padding: "24px 28px 28px", flex: 1, minWidth: 0, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontFamily: F, fontSize: T.body, letterSpacing: "0.08em", color: C.mid, textTransform: "uppercase", marginBottom: 8 }}>{card.tag}</div>
            <div style={{ fontFamily: F, fontSize: T.heading, color: C.black, fontWeight: 500, marginBottom: 12 }}>{card.title}</div>
            <div style={{ width: "50%", height: 150, borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
              <img src={card.img} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
            <div style={{ fontFamily: F, fontSize: T.body, color: C.black, lineHeight: "1.25" }}>{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Animated checklist beat ──────────────────────────────
function ChecklistBeat({ progress }: { progress: number }) {
  const beatStart = 0.5;
  const subP = Math.max(0, Math.min(1, (progress - beatStart) / 0.36));
  const items = [
    { text: "Open the app at close.", threshold: 0.05 },
    { text: "Tap 3 buttons.",          threshold: 0.38 },
    { text: "Go home.",                threshold: 0.70 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "flex-start" }}>
      {items.map(({ text, threshold }, i) => {
        const t = Math.max(0, Math.min(1, (subP - threshold) / 0.24));
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11, flexShrink: 0,
              border: `2.5px solid ${t > 0 ? C.magenta : "rgba(0,0,0,0.18)"}`,
              background: t > 0.45 ? C.magenta : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {t > 0.45 && (
                <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
                  <path d="M2 7.5L8 13L18 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <span style={{
                fontFamily: F, fontWeight: 400,
                fontSize: T.title,
                lineHeight: "100%", letterSpacing: "-0.045em",
                color: `rgba(0,0,0,${1 - t * 0.68})`,
              }}>{text}</span>
              <div style={{
                position: "absolute", top: "54%", left: 0,
                transform: "translateY(-50%)",
                height: 2.5, background: C.black,
                width: `${t * 100}%`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Glow decoration ──────────────────────────────────────
const GLOW_CORNERS = ["br", "tl", "tr", "bl"] as const;
type GlowCorner = typeof GLOW_CORNERS[number];

function GlowDecor({ corner, isDark }: { corner: GlowCorner; isDark: boolean }) {
  const pos: Record<GlowCorner, React.CSSProperties> = {
    br: { bottom: "-22%", right: "-16%" },
    tl: { top:    "-22%", left:  "-16%" },
    tr: { top:    "-22%", right: "-16%" },
    bl: { bottom: "-22%", left:  "-16%" },
  };
  return (
    <div style={{
      position: "absolute",
      ...pos[corner],
      width: "clamp(440px, 60vw, 740px)",
      height: "clamp(440px, 60vw, 740px)",
      borderRadius: "50%",
      background: "radial-gradient(circle at center, rgba(255,23,233,0.88) 0%, rgba(255,23,233,0.42) 26%, rgba(255,23,233,0.1) 54%, transparent 72%)",
      filter: "blur(54px)",
      zIndex: 0,
      pointerEvents: "none",
      opacity: isDark ? 0.72 : 0.36,
      transition: "opacity 0.5s ease",
    }} />
  );
}

// ── FAQ accordion ────────────────────────────────────────
function FAQBeat({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const faqs = [
    {
      q: "What if I want to check the data mid-service, not just at close?",
      a: "This app does one thing: end-of-shift reconciliation. Shazam didn't add a search bar or a \"hum a tune\" feature when it launched — they solved one problem perfectly. We made the same call. If we see consistent demand for mid-service checks, we'll revisit it. For now, the constraint is the feature.",
    },
    {
      q: "What if the discrepancy is really large — something serious?",
      a: "Our engineering team is working on an AI layer that surfaces the context behind any gap automatically. Instead of you writing an explanation from scratch, the app suggests one and you confirm or edit it. No typing, no digging. That's where this is headed.",
    },
    {
      q: "What if I forget to reconcile one night?",
      a: "That's exactly why the app shows the status of the last few days at the top. Not every manager closes every night — teams rotate, schedules shift. The visual recap keeps everyone accountable: catch a missed night and log it the next day. Nothing is lost.",
    },
    {
      q: "Why a checklist instead of jumping straight to the numbers?",
      a: "Psychology. A checklist works like a quest in a video game — you always know what to do next, you can't get lost, and finishing it feels satisfying. Open-world games with no objectives feel overwhelming. Dashboards with no clear action do too. We give you 3 taps and get out of your way.",
    },
    {
      q: "What if there's no internet at end of service?",
      a: "Same answer as forgetting a night: do it the next day. It's not a blocker.",
    },
    {
      q: "Who actually reads all these comments?",
      a: "Your accountant or group manager. When they sit down to review the week or month, all the context is already there — no chasing, no \"can you explain this €200 gap from two weeks ago\" emails. The narrative is baked in.",
    },
    {
      q: "Could AI just take a photo of the POS screen and reconcile automatically?",
      a: "Yes — and it's something we're actively exploring as a possible solution. A photo-first flow could make this even faster. We're starting with the simplest version first, and we'll test the camera approach once the core habit is established.",
    },
  ];

  const left  = faqs.filter((_, i) => i % 2 === 0);
  const right = faqs.filter((_, i) => i % 2 !== 0);

  const renderCol = (col: typeof faqs, offset: number) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      {col.map((faq, ci) => {
        const idx = offset + ci * 2;
        return (
          <div key={idx} style={{
            background: open === idx
              ? (dark ? "rgba(255,255,255,0.13)" : "#E2E2E5")
              : hovered === idx
                ? (dark ? "rgba(255,255,255,0.09)" : "#EBEBEE")
                : (dark ? "rgba(255,255,255,0.07)" : "#F4F4F6"),
            borderRadius: 12,
            transition: "background 0.18s ease",
            padding: "4px 16px",
            marginBottom: 8,
          }}>
            <button
              onClick={() => setOpen(open === idx ? null : idx)}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                width: "100%", background: "none", border: "none", cursor: "pointer",
                fontFamily: F, fontSize: T.body, color: dark ? C.white : C.black,
                textAlign: "left", padding: "18px 0", letterSpacing: "-0.01em",
              }}
            >
              <span>{faq.q}</span>
              <span style={{ fontSize: T.body, color: C.mid, flexShrink: 0, marginLeft: 16 }}>
                {open === idx ? "−" : "+"}
              </span>
            </button>
            {open === idx && (
              <p style={{ fontFamily: F, fontSize: T.body, color: dark ? C.mid : "#666", margin: "0 0 18px", lineHeight: "1.5" }}>
                {faq.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ width: "min(1200px, 92vw)" }}>
      <div style={{ fontFamily: F, fontSize: T.body, letterSpacing: "0.08em", color: C.mid, textTransform: "uppercase", marginBottom: 32 }}>FAQ</div>
      <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
        {renderCol(left, 0)}
        {renderCol(right, 1)}
      </div>
    </div>
  );
}

// ── Video Player ─────────────────────────────────────────
function VideoPlayer({ src, label }: { src: string; label: string }) {
  return (
    <div style={{ width: "min(820px, 86vw)", margin: "0 auto" }}>
      <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", background: C.black }}>
        <video
          src={src}
          controls
          playsInline
          preload="metadata"
          title={label}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}

// ── Section type ─────────────────────────────────────────
interface SectionDef {
  id: string;
  num: string;
  title: string;
  dark: boolean;
  height: string;
  beats: ((progress: number) => React.ReactNode)[];
  beatPos?: ("center" | "bottom")[];
  Background?: React.FC<{ progress: number }>;
  ctaLabel?: string;
  ctaShowThreshold?: number;
  noScrollHint?: boolean;
}

// ── All sections ─────────────────────────────────────────
const SECTIONS: SectionDef[] = [

  // ── 01 CONTEXT ────────────────────────────────────────
  {
    id: "context", num: "01", title: "Context", dark: true,
    height: "500vh",
    beatPos: ["center", "center", "center", "center", "center"],
    Background: ({ progress }) => <ContextImageBg progress={progress} totalBeats={5} />,
    beats: [
      () => (
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontFamily: F, fontSize: T.display, lineHeight: "94%",
            letterSpacing: "-0.055em", color: C.white, fontWeight: 400,
            margin: "0 0 20px", whiteSpace: "nowrap",
          }}>
            It's 2:07 AM.
          </h1>
          <p style={{ fontFamily: F, fontSize: T.body, color: C.mid, letterSpacing: "-0.01em", margin: 0, fontWeight: 400 }}>
            You're the manager closing the day.
          </p>
        </div>
      ),

      () => null,

      (p) => {
        const n = 5;
        const beatStart = 2 / n;
        const subP = Math.max(0, Math.min(1, (p - beatStart) / ((1 / n) * 0.22)));
        return (
          <div style={{ maxWidth: "min(1100px, 92vw)", textAlign: "center" }}>
            <WordReveal
              text="Your report says €4,847. The POS says €4,912. The difference is €65. You don't know why."
              subProgress={subP}
              color={C.white}
              accentColor={C.magenta}
              fontSize={T.heading}
              lineHeight="115%"
            />
          </div>
        );
      },

      () => (
        <div style={{ position: "relative", width: "min(1040px, 96vw)", height: "clamp(400px, 56vh, 580px)" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center", zIndex: 2,
          }}>
            <p style={{
              fontFamily: F, fontSize: T.heading, lineHeight: "108%",
              letterSpacing: "-0.04em", color: C.white, margin: 0, whiteSpace: "nowrap",
            }}>
              You open Excel.<br />
              Then a paper report.<br />
              Then another tab.<br />
              And you spend an hour figuring out what happened.
            </p>
          </div>

          {/* Excel card */}
          <div style={{ position: "absolute", top: "0%", left: "0%", transform: "rotate(-5deg)", opacity: 0.8, zIndex: 1 }}>
            <div style={{ background: "#1D6F42", borderRadius: 10, padding: "18px 20px", width: 160 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, marginBottom: 8 }}>
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} style={{ background: i % 4 === 0 ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)", height: 7, borderRadius: 1 }} />
                ))}
              </div>
              <span style={{ fontFamily: F, fontSize: T.body, color: "rgba(255,255,255,0.65)" }}>Excel</span>
            </div>
          </div>

          {/* Paper report card */}
          <div style={{ position: "absolute", top: "10%", right: "0%", transform: "rotate(4deg)", opacity: 0.85, zIndex: 1 }}>
            <div style={{ background: C.white, borderRadius: 10, padding: "18px 20px", width: 160, boxShadow: "0 2px 14px rgba(0,0,0,0.35)" }}>
              {[85, 58, 72, 44, 68].map((w, i) => (
                <div key={i} style={{ background: i === 0 ? "#333" : "#ccc", height: i === 0 ? 4 : 3, width: `${w}%`, borderRadius: 2, marginBottom: 5 }} />
              ))}
              <span style={{ fontFamily: F, fontSize: T.body, color: "#aaa" }}>Paper report</span>
            </div>
          </div>

          {/* Browser tab card */}
          <div style={{ position: "absolute", bottom: "0%", left: "8%", transform: "rotate(-3deg)", opacity: 0.78, zIndex: 1 }}>
            <div style={{ background: "#1C1C1E", borderRadius: 10, overflow: "hidden", width: 160 }}>
              <div style={{ background: "#2C2C2E", padding: "6px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                {["#FF5F57", "#FEBC2E", "#28C840"].map(col => (
                  <div key={col} style={{ width: 6, height: 6, borderRadius: "50%", background: col }} />
                ))}
                <div style={{ flex: 1, marginLeft: 3, background: "rgba(255,255,255,0.08)", borderRadius: 3, height: 9 }} />
              </div>
              <div style={{ padding: "10px 8px" }}>
                {[90, 65, 80, 50].map((w, i) => (
                  <div key={i} style={{ height: 3, width: `${w}%`, background: `rgba(255,255,255,${i === 0 ? 0.25 : 0.1})`, borderRadius: 2, marginBottom: 4 }} />
                ))}
              </div>
              <div style={{ padding: "0 8px 10px" }}>
                <span style={{ fontFamily: F, fontSize: T.body, color: C.mid }}>Another tab</span>
              </div>
            </div>
          </div>
        </div>
      ),

      () => (
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontFamily: F, fontSize: T.display, lineHeight: "90%",
            letterSpacing: "-0.055em", color: C.white, fontWeight: 400, margin: 0,
          }}>
            This happens<br />every night.
          </p>
        </div>
      ),
    ],
  },

  // ── 02 VISION ─────────────────────────────────────────
  {
    id: "vision", num: "02", title: "Vision", dark: false,
    height: "350vh",
    ctaLabel: "→ How we're going to start",
    beats: [
      () => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: F, fontSize: T.body, color: C.mid, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>What we could do?</div>
          <h1 style={{
            fontFamily: F, fontSize: T.display, lineHeight: "88%",
            letterSpacing: "-0.055em", color: C.black, fontWeight: 400, margin: 0,
          }}>
            Now it's winter '26.
          </h1>
        </div>
      ),

      () => (
        <div style={{ textAlign: "center", maxWidth: 960 }}>
          <p style={{
            fontFamily: F, fontSize: T.heading, lineHeight: "112%",
            letterSpacing: "-0.03em", color: C.black, margin: "0 0 22px",
          }}>
            sunday has a feature that turns end-of-service reconciliation from a nightly dread into a 3-minute ritual.
          </p>
          <span style={{
            fontFamily: F, fontSize: T.body, letterSpacing: "-0.01em", fontWeight: 600,
            background: "linear-gradient(90deg, #FF6B00, #E8000D)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF6B00" />
                  <stop offset="100%" stopColor="#E8000D" />
                </linearGradient>
              </defs>
              <path d="M12 3c0 0 .8 3.5 2.5 5.5S19 11 19 11s-3.5.8-5.5 2.5S11 19 11 19s-.8-3.5-2.5-5.5S4 11 4 11s3.5-.8 5.5-2.5S12 3 12 3z" fill="url(#sparkGrad)" />
              <path d="M19 3c0 0 .4 1.5 1.2 2.3S22 7 22 7s-1.5.4-2.3 1.2S18 10 18 10s-.4-1.5-1.2-2.3S15 7 15 7s1.5-.4 2.3-1.2S19 3 19 3z" fill="url(#sparkGrad)" opacity="0.8" />
              <path d="M6 16c0 0 .3 1.2 1 1.8S9 19 9 19s-1.2.3-1.8 1S6 22 6 22s-.3-1.2-1-1.8S3 19 3 19s1.2-.3 1.8-1S6 16 6 16z" fill="url(#sparkGrad)" opacity="0.7" />
            </svg>
            Powered by sundayAI
          </span>
        </div>
      ),

      () => <VideoPlayer src="/vision.mp4" label="Vision — Recon demo" />,

      () => (
        <div style={{ textAlign: "center", maxWidth: 1200 }}>
          <p style={{
            fontFamily: F, fontSize: T.heading, lineHeight: "105%",
            letterSpacing: "-0.04em", color: C.black, margin: 0,
          }}>
            But before that we will need<br />to validate some assumptions we have.
          </p>
        </div>
      ),
    ],
  },

  // ── 03 WHAT WE LEARNED ───────────────────────────────
  {
    id: "hypotheses", num: "03", title: "What we learned", dark: true,
    height: "280vh",
    ctaLabel: "Stop the theory, let me see the thing!",
    beats: [
      () => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: F, fontSize: T.body, color: C.mid, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>Where are we going to start?</div>
          <h1 style={{
            fontFamily: F, fontSize: T.title, lineHeight: "88%",
            letterSpacing: "-0.055em", color: C.white, fontWeight: 400, margin: 0,
          }}>
            The key insight we learned
          </h1>
        </div>
      ),

      () => (
        <div style={{ position: "relative", width: "min(1700px, 100vw)", height: "clamp(540px, 74vh, 780px)" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center", zIndex: 3,
          }}>
            <p style={{
              fontFamily: F, fontSize: T.title, lineHeight: "100%",
              letterSpacing: "-0.04em", color: C.white, fontWeight: 500,
              margin: "0 0 24px", whiteSpace: "nowrap",
            }}>
              Managers need to explain,<br />not fix.
            </p>
            <p style={{
              fontFamily: F, fontSize: T.body, color: C.mid, lineHeight: "1.4",
              letterSpacing: "-0.01em", margin: 0, maxWidth: 540,
            }}>
              Most of the time, actions are irreversible or there's simply no time for them.<br />An explanation is more than enough.
            </p>
          </div>

          {[
            { top: "0%",  left: "0%",  rotate: "-5deg", opacity: 0.82, amount: "Missing €25",      detail: "Card terminal failed at table 7. Taken manually." },
            { top: "0%",  right: "0%", rotate: "4deg",  opacity: 0.80, amount: "−€40 discrepancy", detail: "Waiter voided two orders after kitchen errors. On paper." },
            { bottom: "0%", left: "1%", rotate: "-4deg", opacity: 0.78, amount: "+€18 surplus",    detail: "Group paid cash, tip included. Not entered in POS." },
            { bottom: "0%", right: "0%", rotate: "3deg", opacity: 0.76, amount: "−€15 gap",        detail: "Staff gave change from own pocket for a regular client. Untracked." },
            { top: "38%", right: "0%", rotate: "-3deg", opacity: 0,    amount: "Ticket missing",   detail: "Online order came after system close. Delivered but not counted." },
          ].map((card, i) => (
            <div key={i} style={{
              position: "absolute",
              top: card.top, bottom: card.bottom,
              left: card.left, right: card.right,
              transform: `rotate(${card.rotate})`,
              opacity: card.opacity, zIndex: 1,
            }}>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 11, padding: "24px 28px", width: 420 }}>
                <div style={{ fontFamily: F, fontSize: T.body, color: C.white, fontWeight: 500, marginBottom: 8 }}>{card.amount}</div>
                <div style={{ fontFamily: F, fontSize: T.body, color: C.mid, lineHeight: "1.25", marginBottom: 12 }}>{card.detail}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ fontFamily: F, fontSize: T.body, color: "#22c55e" }}>Explained</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),

      () => (
        <div style={{ textAlign: "center", maxWidth: 1200 }}>
          <div style={{ fontSize: T.heading, marginBottom: 16 }}>💡</div>
          <p style={{
            fontFamily: F, fontSize: T.heading, lineHeight: "106%",
            letterSpacing: "-0.04em", color: C.white, margin: 0,
          }}>
            So let's just start by letting them<br />check the figures and add context.
          </p>
        </div>
      ),
    ],
  },

  // ── 04 PROTOTYPE ─────────────────────────────────────
  {
    id: "prototype", num: "04", title: "First Prototype", dark: false,
    height: "300vh",
    ctaLabel: "Let me see the fucking design, Julio",
    beats: [
      () => <InspirationBeat />,
      (p) => <ChecklistBeat progress={p} />,
    ],
  },

  // ── 05 V0 ─────────────────────────────────────────────
  {
    id: "v0", num: "05", title: "V0", dark: false,
    height: "100vh",
    ctaLabel: "What's next",
    ctaShowThreshold: 0,
    noScrollHint: true,
    beats: [
      () => (
        <div style={{ textAlign: "center", width: "min(920px, 96vw)", paddingBottom: "120px" }}>
          <div style={{ fontFamily: F, fontSize: T.body, letterSpacing: "0.08em", color: C.mid, textTransform: "uppercase", marginBottom: 20 }}>
            V0 — First release
          </div>
          <VideoPlayer src="/v0.mp4" label="V0 demo" />
        </div>
      ),
    ],
  },

  // ── 06 V1 ─────────────────────────────────────────────
  {
    id: "v1", num: "06", title: "V1", dark: false,
    height: "100vh",
    ctaLabel: "What's next",
    ctaShowThreshold: 0,
    noScrollHint: true,
    beats: [
      () => (
        <div style={{ textAlign: "center", width: "min(920px, 96vw)", paddingBottom: "120px" }}>
          <div style={{ fontFamily: F, fontSize: T.body, letterSpacing: "0.08em", color: C.mid, textTransform: "uppercase", marginBottom: 20 }}>
            V1
          </div>
          <VideoPlayer src="/v1.mp4" label="V1 demo" />
        </div>
      ),
    ],
  },

  // ── 07 NEXT STEPS ─────────────────────────────────────
  {
    id: "nextsteps", num: "07", title: "Next steps", dark: true,
    height: "350vh",
    ctaLabel: "Try V0",
    beats: [
      () => (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: F, fontSize: T.body, letterSpacing: "0.08em", color: C.mid, textTransform: "uppercase", marginBottom: 24 }}>Next steps</div>
          <h1 style={{ fontFamily: F, fontSize: T.display, lineHeight: "88%", letterSpacing: "-0.055em", color: C.white, fontWeight: 400, margin: 0 }}>
            And then....?
          </h1>
        </div>
      ),

      () => (
        <div style={{ textAlign: "center", maxWidth: 960 }}>
          <p style={{ fontFamily: F, fontSize: T.title, lineHeight: "106%", letterSpacing: "-0.04em", color: C.white, fontWeight: 400, margin: "0 0 28px" }}>
            "we'll cross that bridge<br />when we come to it"
          </p>
          <p style={{ fontFamily: F, fontSize: T.body, color: C.mid, letterSpacing: "-0.01em", margin: 0 }}>
            — Julio, trying to win time
          </p>
        </div>
      ),

      () => (
        <div style={{ textAlign: "center", maxWidth: 1200 }}>
          <p style={{ fontFamily: F, fontSize: T.heading, lineHeight: "108%", letterSpacing: "-0.03em", color: C.white, fontWeight: 400, margin: "0 0 48px" }}>
            Jokes aside, we are exploring<br />some potential iterations
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, textAlign: "left" }}>
            {[
              { n: "01", title: "Ask AI to comment",  desc: "Managers type less — AI drafts the context explanation, they just confirm or edit it." },
              { n: "02", title: "Photo of the POS",   desc: "Point your phone at the screen. AI reads the figures and reconciles automatically." },
              { n: "03", title: "External tenders",   desc: "Not only sunday payments — cash, Uber Eats, external apps. Everything in one place." },
              { n: "04", title: "Accountant side",    desc: "The other end: giving accountants a structured, annotated view. No more chasing." },
            ].map(({ n, title, desc }) => (
              <div key={n} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 18, padding: "32px 32px 36px" }}>
                <div style={{ fontFamily: F, fontSize: T.body, color: C.mid, marginBottom: 16, letterSpacing: "0.06em" }}>{n}</div>
                <div style={{ fontFamily: F, fontSize: T.body, color: C.white, fontWeight: 600, marginBottom: 14, lineHeight: "1.2", letterSpacing: "-0.01em" }}>{title}</div>
                <div style={{ fontFamily: F, fontSize: T.body, color: C.mid, lineHeight: "1.35" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      ),

      () => <FAQBeat dark />,
    ],
  },

  // ── 08 CTA ────────────────────────────────────────────
  {
    id: "cta", num: "08", title: "Try it", dark: false,
    height: "100vh",
    ctaShowThreshold: 0,
    beats: [
      () => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 48, textAlign: "center" }}>
          <h1 style={{ fontFamily: F, fontSize: T.display, lineHeight: "88%", letterSpacing: "-0.05em", color: C.black, margin: 0, fontWeight: 400 }}>
            Ready to try V0?
          </h1>
          <img src="/qr.png" alt="QR code" style={{ width: 180, height: 180, borderRadius: 18, objectFit: "cover" }} />
          <div>
            <p style={{ fontFamily: F, fontSize: T.body, color: C.mid, margin: "0 0 12px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Any comments? Ping
            </p>
            <p style={{ fontFamily: F, fontSize: T.body, color: C.black, margin: 0, lineHeight: "1.25" }}>
              Bernard Notarinni · Floris Tisseyre · JB Rieu<br />
              Julio Perez · Xabi Duport · Xavier Besson
            </p>
          </div>
        </div>
      ),
    ],
  },
];

// ── Main App ─────────────────────────────────────────────
export default function App() {
  const [activeIdx,     setActiveIdx]     = useState(0);
  const [progress,      setProgress]      = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const section    = SECTIONS[activeIdx];
  const isLast     = activeIdx === SECTIONS.length - 1;
  const n          = section.beats.length;
  const showContinue  = progress >= (section.ctaShowThreshold ?? 0.85) && !transitioning;
  const showScrollHint = progress < 0.04 && !isLast && !section.noScrollHint;

  useEffect(() => {
    setProgress(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    const t = setTimeout(() => setTransitioning(false), 80);
    return () => clearTimeout(t);
  }, [activeIdx]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const max = scrollHeight - clientHeight;
    setProgress(max > 0 ? scrollTop / max : 0);
  }, []);

  const handleContinue = () => {
    if (isLast || transitioning) return;
    setTransitioning(true);
    setProgress(0);
    setTimeout(() => setActiveIdx(i => i + 1), 430);
  };

  const Bg     = section.Background;
  const isDark = section.dark;

  return (
    <div style={{
      height: "100vh", overflow: "hidden", position: "relative",
      background: isDark ? C.black : C.white,
      fontFamily: F,
      transition: "background 0.5s ease",
    }}>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 49 }}>
        <div style={{ height: "100%", background: C.magenta, width: `${progress * 100}%`, transition: "width 0.04s linear" }} />
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ height: "100vh", overflowY: "auto", opacity: transitioning ? 0 : 1, transition: "opacity 0.43s ease" }}
      >
        <div style={{ height: section.height, position: "relative" }}>
          {/* Sticky stage */}
          <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

            <GlowDecor corner={GLOW_CORNERS[activeIdx % GLOW_CORNERS.length]} isDark={isDark} />

            {Bg && (
              <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
                <Bg progress={progress} />
              </div>
            )}

            {section.beats.map((beatFn, i) => {
              const { opacity, yOffset } = beatAnim(progress, i, n);
              const pos = section.beatPos?.[i] ?? "center";
              return (
                <div
                  key={`${section.id}-${i}`}
                  style={{
                    position: "absolute", zIndex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 clamp(16px, 4vw, 56px)", boxSizing: "border-box",
                    opacity, transform: `translateY(${yOffset}px)`,
                    pointerEvents: opacity < 0.1 ? "none" : "auto",
                    ...(pos === "bottom"
                      ? { left: 0, right: 0, bottom: "96px" }
                      : { inset: 0 }),
                  }}
                >
                  {beatFn(progress)}
                </div>
              );
            })}

            {/* Scroll hint */}
            <div style={{
              position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              opacity: showScrollHint ? 0.45 : 0, transition: "opacity 0.7s ease",
              pointerEvents: "none", zIndex: 2,
            }}>
              <span style={{ fontFamily: F, fontSize: T.body, color: isDark ? C.mid : "#999", letterSpacing: "0.06em" }}>scroll</span>
              <span style={{ fontSize: T.body, color: isDark ? C.mid : "#999" }}>↓</span>
            </div>

            {/* Continue button */}
            {!isLast && (
              <div style={{
                position: "absolute", bottom: 44, left: "50%",
                transform: `translateX(-50%) translateY(${showContinue ? 0 : 28}px)`,
                opacity: showContinue ? 1 : 0,
                transition: "opacity 0.55s ease, transform 0.55s ease",
                pointerEvents: showContinue ? "auto" : "none",
                zIndex: 10, width: "min(560px, 88vw)",
              }}>
                <button
                  onClick={handleContinue}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  style={{
                    width: "100%",
                    background: isDark ? C.white : C.black,
                    color: isDark ? C.black : C.white,
                    border: "none", borderRadius: 9999, padding: "28px 0",
                    fontSize: T.body, fontFamily: F, fontWeight: 500,
                    cursor: "pointer", letterSpacing: "-0.02em",
                    transition: "opacity 0.16s ease",
                  }}
                >
                  {section.ctaLabel ?? "→ What we could do?"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
