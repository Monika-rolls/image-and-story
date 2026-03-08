import { useState } from "react";
import { Brain, Code, Mail, ExternalLink, Award, Zap } from "lucide-react";

const themes = {
  current: {
    name: "Current (Neural Cyan)",
    bg: "#0a0d14",
    card: "#121820",
    primary: "#2dd4bf",
    accent: "#8b5cf6",
    text: "#e0e5ec",
    muted: "#6b7280",
    border: "#1e2736",
  },
  ember: {
    name: "🔥 Warm Ember",
    bg: "#1a1410",
    card: "#221c14",
    primary: "#f59e0b",
    accent: "#ef4444",
    text: "#f5e6d3",
    muted: "#8b7355",
    border: "#3d2e1e",
  },
  rose: {
    name: "🌹 Midnight Rose",
    bg: "#0a0a1a",
    card: "#12102a",
    primary: "#e91e8c",
    accent: "#7c3aed",
    text: "#ede4f5",
    muted: "#7b6b8a",
    border: "#2a1e3d",
  },
  hacker: {
    name: "💚 Forest Hacker",
    bg: "#050505",
    card: "#0a0f0a",
    primary: "#00ff41",
    accent: "#00b33c",
    text: "#c8e6c9",
    muted: "#4a6a4a",
    border: "#1a2e1a",
  },
  frost: {
    name: "❄️ Arctic Frost",
    bg: "#0c1220",
    card: "#111b2e",
    primary: "#38bdf8",
    accent: "#818cf8",
    text: "#dce8f5",
    muted: "#5a7a9a",
    border: "#1c2d45",
  },
};

type ThemeKey = keyof typeof themes;

const ThemeCard = ({ theme }: { theme: typeof themes.current }) => (
  <div
    className="rounded-xl overflow-hidden w-full max-w-md mx-auto"
    style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
  >
    {/* Navbar */}
    <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${theme.border}` }}>
      <div className="flex items-center gap-2">
        <Brain size={18} style={{ color: theme.primary }} />
        <span style={{ color: theme.text, fontWeight: 700, fontSize: 14 }}>MK</span>
      </div>
      <div className="flex gap-4">
        {["About", "Skills", "Projects"].map((l) => (
          <span key={l} style={{ color: theme.muted, fontSize: 12 }}>{l}</span>
        ))}
      </div>
    </div>

    {/* Hero */}
    <div className="px-5 py-8 text-center">
      <p style={{ color: theme.primary, fontSize: 10, letterSpacing: 3, marginBottom: 6 }}>AI ENGINEER</p>
      <h2 style={{ color: theme.text, fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Monika</h2>
      <h2 style={{ color: theme.primary, fontSize: 24, fontWeight: 800, textShadow: `0 0 20px ${theme.primary}44` }}>
        Kusumanchi
      </h2>
      <p style={{ color: theme.muted, fontSize: 12, marginTop: 8 }}>
        Building intelligent systems with deep learning & LLMs
      </p>
      <div className="flex justify-center gap-3 mt-4">
        <button
          className="px-4 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: theme.primary, color: theme.bg }}
        >
          Contact Me
        </button>
        <button
          className="px-4 py-1.5 rounded-lg text-xs font-semibold"
          style={{ border: `1px solid ${theme.primary}`, color: theme.primary }}
        >
          Projects
        </button>
      </div>
    </div>

    {/* Cards */}
    <div className="px-5 pb-5 grid grid-cols-3 gap-2">
      {[
        { icon: Award, label: "Hackathons" },
        { icon: Code, label: "AI Systems" },
        { icon: Zap, label: "Production" },
      ].map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="rounded-lg p-3 text-center"
          style={{ background: theme.card, border: `1px solid ${theme.border}` }}
        >
          <Icon size={16} style={{ color: theme.primary, margin: "0 auto 4px" }} />
          <span style={{ color: theme.text, fontSize: 10 }}>{label}</span>
        </div>
      ))}
    </div>

    {/* Project card */}
    <div className="px-5 pb-5">
      <div
        className="rounded-lg p-4"
        style={{ background: theme.card, border: `1px solid ${theme.border}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: theme.text, fontSize: 13, fontWeight: 600 }}>HR Agent</span>
          <ExternalLink size={12} style={{ color: theme.primary }} />
        </div>
        <p style={{ color: theme.muted, fontSize: 11 }}>Multi-agent AI recruitment system</p>
        <div className="flex gap-1.5 mt-2">
          {["CrewAI", "LLM", "API"].map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded text-[9px]"
              style={{ color: theme.primary, border: `1px solid ${theme.primary}33`, background: `${theme.primary}11` }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>

    {/* Footer accent */}
    <div className="h-1" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})` }} />
  </div>
);

const ThemePreview = () => {
  const [selected, setSelected] = useState<ThemeKey>("ember");

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
          Theme Preview
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Click a theme to preview how your portfolio will look
        </p>

        {/* Theme selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {(Object.keys(themes) as ThemeKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`px-4 py-2 rounded-lg text-sm font-heading transition-all ${
                selected === key
                  ? "bg-primary text-primary-foreground scale-105 shadow-lg"
                  : "bg-card border border-border text-foreground hover:border-primary/40"
              }`}
            >
              {themes[key].name}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <ThemeCard theme={themes[selected]} />
        </div>

        {/* Apply button */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-xs mb-3">
            Like this theme? Tell me to apply <strong>{themes[selected].name}</strong>!
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-4">
          <a href="/" className="text-primary text-sm hover:underline">← Back to portfolio</a>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
