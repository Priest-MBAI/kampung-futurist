import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, mono, sans } from "./theme";

const Backdrop: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)",
        backgroundSize: "64px 64px", transform: `translateY(${-(f % 64)}px)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(900px 500px at 75% 20%, rgba(224,168,94,.18), transparent 70%), radial-gradient(800px 500px at 15% 90%, rgba(167,189,108,.14), transparent 70%)` }} />
      {children}
    </AbsoluteFill>
  );
};

const Brand: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ position: "absolute", top: 60, left: 90, display: "flex", gap: 16, alignItems: "center" }}>
    <span style={{ background: C.kopi, color: C.ink, fontFamily: sans, fontWeight: 900, fontSize: 26, letterSpacing: 2,
      padding: "6px 14px", borderRadius: 8 }}>THE KAMPUNG FUTURIST</span>
    <span style={{ fontFamily: mono, color: C.mute, fontSize: 26 }}>{label}</span>
  </div>
);

// EP1: Alan's workflow. Each step lights up at stepTimes[i] (seconds), where edit.py also fires a ding.
export type WorkflowProps = { seconds: number; stepTimes: number[] };
export const Workflow: React.FC<WorkflowProps> = ({ stepTimes }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const steps: [string, string, string][] = [
    ["PLAN", "Alan typed one prompt into Claude Code", C.cream],
    ["INTERVIEW", "Claude Code asked him 7 questions", C.cream],
    ["PERSONA", "it wrote my look, voice & hook", C.olive],
    ["CHARACTER", "built my face & voice in Flow", C.olive],
    ["SCENES", "made every real-location clip", C.kopi],
    ["EDIT", "cut, graded & mixed the video", C.kopi],
    ["QA", "checked every frame & sound", C.ok],
  ];
  const at = (i: number) => Math.round(stepTimes[i] * fps);
  const line = interpolate(f, [at(0), at(steps.length - 1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const head = spring({ frame: f, fps, config: { damping: 14 } });
  return (
    <Backdrop>
      <Brand label="EP1 · how Alan built me" />
      <div style={{ position: "absolute", top: 150, left: 90, fontFamily: sans, fontWeight: 900, fontSize: 84, color: C.white,
        opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>
        One plan → <span style={{ color: C.claude }}>Claude Code</span> did the rest
      </div>
      <div style={{ position: "absolute", top: 448, left: 160, right: 160, height: 8, background: "rgba(255,255,255,.1)", borderRadius: 4 }}>
        <div style={{ width: `${line * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.olive}, ${C.kopi}, ${C.ok})`, borderRadius: 4 }} />
      </div>
      <div style={{ position: "absolute", top: 400, left: 60, right: 60, display: "flex", justifyContent: "space-between" }}>
        {steps.map(([t, s, col], i) => {
          const k = spring({ frame: f - at(i), fps, config: { damping: 8, stiffness: 200, mass: 0.6 } });
          const lit = f >= at(i);
          return (
            <div key={t} style={{ width: 250, display: "flex", flexDirection: "column", alignItems: "center",
              opacity: lit ? 1 : 0.28 }}>
              <div style={{ width: 104, height: 104, borderRadius: 52, background: lit ? col : "#2a3140", color: C.ink, display: "grid",
                placeItems: "center", fontFamily: sans, fontWeight: 900, fontSize: 46, boxShadow: `0 0 0 10px ${C.ink}`,
                transform: `scale(${lit ? 0.75 + k * 0.25 : 0.75})` }}>{i + 1}</div>
              <div style={{ marginTop: 34, fontFamily: sans, fontWeight: 900, fontSize: 32, color: C.white }}>{t}</div>
              <div style={{ marginTop: 10, fontFamily: sans, fontWeight: 600, fontSize: 25, lineHeight: 1.25, color: lit ? C.cream : C.mute,
                textAlign: "center", opacity: lit ? Math.min(1, k * 1.4) : 0, transform: `translateY(${(1 - k) * 14}px)` }}>{s}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", bottom: 80, left: 90, display: "flex", gap: 18, alignItems: "center",
        opacity: interpolate(f, [at(steps.length - 1) + 4, at(steps.length - 1) + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 40, color: C.white }}>Alan: the plan &amp; approvals</span>
        <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 40, color: C.mute }}>·</span>
        <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 40, color: C.claude }}>Claude Code: everything else</span>
      </div>
    </Backdrop>
  );
};

// EP2: stylised Claude Code + Codex terminals running /init.
const typed = (text: string, f: number, start: number, cps = 14, fps = 24) =>
  text.slice(0, Math.max(0, Math.floor(((f - start) / fps) * cps)));

const Term: React.FC<{ title: string; accent: string; lines: { at: number; text: string; color?: string; type?: boolean }[]; style?: React.CSSProperties }> = ({ title, accent, lines, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ background: "#11161f", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, overflow: "hidden",
      boxShadow: "0 30px 80px rgba(0,0,0,.5)", ...style }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "#0c1017" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
        <span style={{ marginLeft: 14, fontFamily: mono, fontSize: 22, color: C.mute }}>{title}</span>
      </div>
      <div style={{ padding: "22px 28px", fontFamily: mono, fontSize: 30, lineHeight: 1.55, color: "#d6dde8", minHeight: 360 }}>
        {lines.filter((l) => f >= l.at).map((l, i) => (
          <div key={i} style={{ color: l.color ?? "#d6dde8", whiteSpace: "pre" }}>
            {l.type ? typed(l.text, f, l.at) : l.text}
            {l.type && typed(l.text, f, l.at).length < l.text.length && <span style={{ background: accent, color: accent }}>▌</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export const InitTerminal: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  const tag = spring({ frame: f - s(3.4), fps, config: { damping: 11 } });
  return (
    <Backdrop>
      <Brand label="EP2 · before anything, type /init" />
      <Term title="claude · ~/my-project" accent={C.claude} style={{ position: "absolute", top: 150, left: 90, width: 1060 }}
        lines={[
          { at: 0, text: "✻ Welcome to Claude Code", color: C.claude },
          { at: 0, text: "  cwd: ~/my-project", color: C.mute },
          { at: s(0.4), text: "> /init", type: true, color: C.white },
          { at: s(1.3), text: "⏺ Analyzing your project…", color: C.kopi },
          { at: s(1.9), text: "  Read package.json, src/, README.md", color: C.mute },
          { at: s(2.5), text: "⏺ Write(CLAUDE.md)", color: C.kopi },
          { at: s(3.1), text: "✓ Created CLAUDE.md: your project memory", color: C.ok },
        ]} />
      <Term title="codex · ~/my-project" accent={C.olive} style={{ position: "absolute", top: 330, right: 90, width: 640 }}
        lines={[
          { at: s(0.9), text: "› /init", type: true, color: C.white },
          { at: s(2.2), text: "✓ Created AGENTS.md", color: C.ok },
        ]} />
      <div style={{ position: "absolute", bottom: 80, left: 90, right: 90, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ opacity: tag, transform: `translateY(${(1 - tag) * 30}px)` }}>
          <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 64, color: C.white }}>
            One command. <span style={{ color: C.kopi }}>Every session starts smart.</span>
          </div>
        </div>
        <div style={{ fontFamily: mono, fontSize: 20, color: C.mute }}>illustrative recreation</div>
      </div>
    </Backdrop>
  );
};
