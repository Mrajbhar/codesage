import axios from "axios";
import { tokenStore } from "../auth/tokenStore";
import { orgStore } from "../auth/OrgPicker";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. https://localhost:7123/api
});

// Attach the access token to every outgoing request.
api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const org = orgStore.get();
  if (org) config.headers["X-Org-Id"] = org;
  return config;
});

// On a 401, transparently refresh the access token ONCE, then replay the request.
// `refreshing` de-duplicates concurrent 401s so we only hit /auth/refresh a single time.
let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as any;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        if (!refreshing) {
          const refreshToken = tokenStore.getRefresh();
          refreshing = axios
            .post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken })
            .then((r) => {
              tokenStore.set(r.data.accessToken, r.data.refreshToken);
              return r.data.accessToken as string;
            })
            .finally(() => {
              refreshing = null;
            });
        }
        const newAccess = await refreshing;
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch {
        tokenStore.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;