import type { CSSProperties } from "react";

// Minimal inline styles so these pages work with zero CSS/Tailwind setup.
// Swap for your design system later.
export const styles: Record<string, CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    width: 360,
    padding: 32,
    borderRadius: 12,
    background: "#1e293b",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
  },
  title: { color: "#f1f5f9", fontSize: 22, margin: "0 0 8px", fontWeight: 600 },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#f1f5f9",
    fontSize: 14,
  },
  button: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "none",
    background: "#6366f1",
    color: "white",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  muted: { color: "#94a3b8", fontSize: 13, textAlign: "center", margin: 0 },
  error: { color: "#f87171", fontSize: 13, margin: 0 },
};
