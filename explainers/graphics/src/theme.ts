import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const sans = loadSans("normal", { weights: ["500", "700", "900"], subsets: ["latin"] }).fontFamily;
export const mono = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;

// Kampung Futurist palette: olive shirt, kopi brown, void-deck concrete, terminal ink.
export const C = {
  ink: "#0b0f17",
  panel: "rgba(11,15,23,0.86)",
  olive: "#a7bd6c",
  kopi: "#e0a85e",
  cream: "#fbf4e6",
  white: "#ffffff",
  mute: "#9aa6b8",
  claude: "#d97757", // Claude Code accent (terracotta)
  ok: "#5fd38d",
};

export const FPS = 24;
