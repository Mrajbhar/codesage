// Stores which organization the user is currently working in.
// Read at app boot, written by the org picker and Team page.
export const orgStore = {
  KEY: "cs_org",
  get(): string | null { try { return localStorage.getItem(this.KEY); } catch { return null; } },
  set(id: string) { try { localStorage.setItem(this.KEY, id); } catch {} },
  clear() { try { localStorage.removeItem(this.KEY); } catch {} },
};