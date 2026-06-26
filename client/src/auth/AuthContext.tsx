import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import { tokenStore } from "./tokenStore";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  gitHubConnected: boolean;
  gitHubLogin?: string | null;
  googleId?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  loginWithTokens: (access: string, refresh: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.getAccess()) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  function applyAuth(data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }) {
    tokenStore.set(data.accessToken, data.refreshToken);
    setUser(data.user);
  }

  async function login(email: string, password: string) {
    const r = await api.post("/auth/login", { email, password });
    applyAuth(r.data);
  }

  async function register(
    email: string,
    password: string,
    displayName: string,
  ) {
    const r = await api.post("/auth/register", {
      email,
      password,
      displayName,
    });
    applyAuth(r.data);
  }

  // Used by the OAuth callback page: we receive tokens (not a user) in the redirect.
  async function loginWithTokens(access: string, refresh: string) {
    tokenStore.set(access, refresh);
    const r = await api.get("/auth/me");
    setUser(r.data);
  }

  async function refreshUser() {
    const r = await api.get("/auth/me");
    setUser(r.data);
  }

  async function logout() {
    const refreshToken = tokenStore.getRefresh();
    try {
      await api.post("/auth/logout", { refreshToken });
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithTokens,
        refreshUser,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
