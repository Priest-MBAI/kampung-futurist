import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, mono, sans } from "./theme";

// One transparent overlay composition, switched by `kind`. Rendered as ProRes 4444 and
// composited over live-action clips in ffmpeg.
export type OverlayProps = {
  kind: "intro" | "lower" | "pop" | "ticks" | "split" | "stack" | "end" | "cta";
  title?: string;
  kicker?: string;
  items?: string[];
  seconds: number;
  times?: number[]; // seconds at which each item/card reveals (synced to words; SFX use the same times)
  side?: "left" | "right" | "center";
  valign?: "top" | "center" | "bottom";
  x?: number; // explicit placement (px) for lower-thirds
  y?: number;
};

// Frame at which item i reveals: explicit `times` if given, else a fixed stagger.
const revealFrame = (times: number[] | undefined, i: number, fps: number, stagger: number, start = 6) =>
  times?.[i] !== undefined ? Math.round(times[i] * fps) : start + i * Math.round(fps * stagger);

const useInOut = (inDelay = 0) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame: f - inDelay, fps, config: { damping: 14, stiffness: 140 } });
  const exit = interpolate(f, [durationInFrames - 8, durationInFrames - 1], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return { f, fps, enter, exit };
};

const Chip: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.kopi, style }) => (
  <span style={{ background: color, color: C.ink, fontFamily: sans, fontWeight: 900, fontSize: 30,
    letterSpacing: 2, padding: "8px 18px", borderRadius: 8, textTransform: "uppercase", ...style }}>{children}</span>
);

const Intro: React.FC<OverlayProps> = ({ title, kicker }) => {
  const { enter, exit } = useInOut();
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-start", padding: "70px 90px", opacity: exit }}>
      <div style={{ transform: `translateY(${(1 - enter) * -40}px)`, opacity: enter, background: C.panel,
        padding: "22px 28px 20px", borderRadius: 16, borderLeft: `8px solid ${C.kopi}` }}>
        <Chip>The Kampung Futurist</Chip>
        <div style={{ marginTop: 18, fontFamily: sans, fontWeight: 900, fontSize: 68, color: C.white, lineHeight: 1.05,
          textShadow: "0 4px 24px rgba(0,0,0,.55)" }}>{title}</div>
        {kicker && <div style={{ marginTop: 8, fontFamily: mono, fontSize: 30, color: C.cream, textShadow: "0 2px 12px rgba(0,0,0,.6)" }}>{kicker}</div>}
      </div>
    </AbsoluteFill>
  );
};

const Lower: React.FC<OverlayProps> = ({ title, kicker, x, y }) => {
  const { enter, exit } = useInOut();
  const placed = x !== undefined && y !== undefined;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 90px 90px", opacity: exit }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: enter,
        ...(placed ? { position: "absolute", left: x, top: y } : {}),
        transform: placed ? `scale(${0.6 + enter * 0.4})` : `translateX(${(1 - enter) * -120}px)`, transformOrigin: "left center" }}>
        {kicker && <Chip color={C.olive} style={{ alignSelf: "flex-start", fontSize: 26 }}>{kicker}</Chip>}
        <div style={{ alignSelf: "flex-start", background: C.panel, color: C.white, fontFamily: sans, fontWeight: 800,
          fontSize: 50, padding: "14px 26px", borderRadius: 12, borderLeft: `8px solid ${C.kopi}` }}>{title}</div>
      </div>
    </AbsoluteFill>
  );
};

const Pop: React.FC<OverlayProps> = ({ title, kicker }) => {
  const { f, fps, exit } = useInOut();
  // Sticker pop-up: scale from 0 with a bouncy overshoot, a settling wobble and a burst ring.
  const s = spring({ frame: f, fps, config: { damping: 7, stiffness: 220, mass: 0.6 } });
  const wobble = Math.sin(f / 2.2) * 4 * Math.exp(-f / 9);
  const ring = interpolate(f, [0, 9], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-end", padding: "90px 100px", opacity: exit }}>
      <div style={{ position: "absolute", right: 210, top: 120, width: 260, height: 260, marginRight: -130, marginTop: -130,
        borderRadius: "50%", border: `10px solid ${C.kopi}`, opacity: 1 - ring, transform: `scale(${0.3 + ring * 1.4})` }} />
      <div style={{ transform: `scale(${s}) rotate(${-4 + wobble}deg)`, transformOrigin: "75% 30%", textAlign: "right" }}>
        <div style={{ display: "inline-block", background: C.kopi, color: C.ink, fontFamily: sans, fontWeight: 900, fontSize: 84,
          padding: "6px 26px", borderRadius: 14, boxShadow: "0 10px 40px rgba(0,0,0,.35)" }}>{title}</div>
        {kicker && <div style={{ marginTop: 14, fontFamily: sans, fontWeight: 800, fontSize: 38, color: C.white,
          textShadow: "0 3px 16px rgba(0,0,0,.7)" }}>{kicker}</div>}
      </div>
    </AbsoluteFill>
  );
};

const Ticks: React.FC<OverlayProps> = ({ items = [], kicker, times, side = "right", valign = "center" }) => {
  const { f, fps, enter, exit } = useInOut();
  return (
    <AbsoluteFill style={{ justifyContent: valign === "bottom" ? "flex-end" : "center", paddingBottom: valign === "bottom" ? 80 : 0, alignItems: side === "left" ? "flex-start" : "flex-end", padding: "0 90px", opacity: exit }}>
      <div style={{ background: C.panel, borderRadius: 18, padding: "26px 34px", minWidth: 620, opacity: enter }}>
        {kicker && <div style={{ fontFamily: mono, color: C.mute, fontSize: 26, marginBottom: 12 }}>{kicker}</div>}
        {items.map((t, i) => {
          const s = spring({ frame: f - revealFrame(times, i, fps, 0.9), fps, config: { damping: 9, stiffness: 180 } });
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 18, margin: "10px 0", opacity: s,
              transform: `translateX(${(1 - s) * 40}px)` }}>
              <span style={{ width: 46, height: 46, borderRadius: 23, background: C.ok, color: C.ink, display: "grid",
                placeItems: "center", fontFamily: sans, fontWeight: 900, fontSize: 30 }}>✓</span>
              <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 44, color: C.white }}>{t}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Three cards, each popping in as Marcus says it: Chat → Code → Files & tools.
const Split: React.FC<OverlayProps> = ({ times, side = "right", valign = "top" }) => {
  const { f, fps, exit } = useInOut();
  const pop = (i: number) => spring({ frame: f - revealFrame(times, i, fps, 1.0, 4), fps, config: { damping: 8, stiffness: 200, mass: 0.6 } });
  const card = (s: number, head: string, verb: string, sub: string, color: string, width = 330) => (
    <div style={{ background: C.panel, borderRadius: 18, padding: "20px 26px", width, borderTop: `8px solid ${color}`,
      opacity: Math.min(1, s * 1.5), transform: `scale(${0.3 + s * 0.7})`, transformOrigin: "center top" }}>
      <div style={{ fontFamily: mono, fontSize: 26, color: C.mute }}>{head}</div>
      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 64, color, lineHeight: 1.05 }}>{verb}</div>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 26, color: C.cream }}>{sub}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ justifyContent: valign === "bottom" ? "flex-end" : "flex-start", alignItems: side === "left" ? "flex-start" : side === "right" ? "flex-end" : "center",
      padding: "70px 80px", opacity: exit }}>
      <div style={{ display: "flex", gap: 18 }}>
        {card(pop(0), "Claude Chat", "THINK", "ideas · drafts · Q&A", C.cream)}
        {card(pop(1), "Claude Code", "DO", "it takes action", C.claude)}
        {card(pop(2), "on your", "FILES & TOOLS", "folders · terminal · browser", C.kopi, 400)}
      </div>
    </AbsoluteFill>
  );
};

const Stack: React.FC<OverlayProps> = ({ items = [], times }) => {
  const { f, fps, exit } = useInOut();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-end", padding: "0 90px", opacity: exit }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((t, i) => {
          const s = spring({ frame: f - revealFrame(times, i, fps, 0.7, 4), fps, config: { damping: 8, stiffness: 200, mass: 0.6 } });
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 20, background: C.panel, borderRadius: 14,
              padding: "14px 26px", opacity: s, transform: `scale(${0.7 + s * 0.3})`, transformOrigin: "right center" }}>
              <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 52, color: C.kopi, width: 44 }}>{i + 1}</span>
              <span style={{ fontFamily: i === 0 ? mono : sans, fontWeight: 800, fontSize: 50, color: C.white }}>{t}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC<OverlayProps> = ({ title = "@kampungfuturist", kicker = "AI, tested in the heartlands." }) => {
  const { enter } = useInOut();
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70,
      background: `linear-gradient(transparent 55%, rgba(0,0,0,${0.65 * enter}))` }}>
      <div style={{ textAlign: "center", opacity: enter, transform: `translateY(${(1 - enter) * 30}px)` }}>
        <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 80, color: C.white }}>{title}</div>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 36, color: C.cream }}>{kicker}</div>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<OverlayProps> = ({ title, kicker }) => {
  const { f, fps, enter } = useInOut();
  const cmd = spring({ frame: f - fps, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 64,
      background: `linear-gradient(transparent 40%, rgba(0,0,0,${0.72 * enter}))` }}>
      <div style={{ textAlign: "center", opacity: enter }}>
        <Chip color={C.olive}>{kicker}</Chip>
        <div style={{ marginTop: 18, fontFamily: sans, fontWeight: 900, fontSize: 70, color: C.white }}>{title}</div>
        <div style={{ marginTop: 14, display: "inline-block", fontFamily: mono, fontWeight: 700, fontSize: 64, color: C.ink,
          background: C.kopi, padding: "4px 26px", borderRadius: 12, transform: `scale(${0.6 + cmd * 0.4})` }}>&gt; /init</div>
        <div style={{ marginTop: 16, fontFamily: sans, fontWeight: 700, fontSize: 36, color: C.cream }}>Follow @kampungfuturist</div>
      </div>
    </AbsoluteFill>
  );
};

export const Overlay: React.FC<OverlayProps> = (p) => {
  const map = { intro: Intro, lower: Lower, pop: Pop, ticks: Ticks, split: Split, stack: Stack, end: End, cta: Cta };
  const K = map[p.kind];
  return <K {...p} />;
};
