import api from "../api/axios";

const API = import.meta.env.VITE_API_URL;

// Sign in / sign up with a provider (full-page redirect to the API, which redirects on).
export function startGitHubLogin() {
  window.location.href = `${API}/auth/github/login`;
}
export function startGoogleLogin() {
  window.location.href = `${API}/auth/google/login`;
}

// Link GitHub to the CURRENT logged-in account: get a signed state, then redirect.
export async function startGitHubLink() {
  const { data } = await api.post("/auth/github/link-intent");
  window.location.href = `${API}/auth/github/login?state=${encodeURIComponent(data.state)}`;
}
