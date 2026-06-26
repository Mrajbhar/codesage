import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as signalR from "@microsoft/signalr";
import api from "../api/axios";
import { tokenStore } from "../auth/tokenStore";
import { orgStore } from "../auth/orgStore";

export interface Note {
  id?: string;
  type: string;
  message: string;
  at: string;
  read?: boolean;
}

interface Ctx {
  notes: Note[];
  unread: number;
  markRead: () => void;
}
const NotificationsContext = createContext<Ctx>({
  notes: [],
  unread: 0,
  markRead: () => {},
});
export const useNotifications = () => useContext(NotificationsContext);

function hubUrl() {
  const apiUrl = import.meta.env.VITE_API_URL ?? "";
  return apiUrl.replace(/\/api\/?$/, "") + "/hub/notifications";
}

// Loads stored history on connect, then merges live pushes on top.
// Independent of AuthContext so nesting/casing can't crash it.
export default function NotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);
  const connRef = useRef<signalR.HubConnection | null>(null);
  const keyRef = useRef<string>("");

  async function loadHistory() {
    try {
      const r = await api.get("/notifications", { params: { limit: 30 } });
      setNotes(r.data.items ?? []);
      setUnread(r.data.unread ?? 0);
    } catch {
      /* not fatal */
    }
  }

  async function markRead() {
    setUnread(0);
    setNotes((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.post("/notifications/read");
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function connect(token: string, orgId: string) {
      await loadHistory(); // history first, so the bell survives refresh

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${hubUrl()}?orgId=${orgId}&access_token=${token}`, {
          transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect()
        .build();

      conn.on("notify", (n: Note) => {
        setNotes((prev) => [n, ...prev].slice(0, 30));
        setUnread((u) => u + 1);
      });

      try {
        await conn.start();
        if (cancelled) {
          conn.stop();
          return;
        }
        connRef.current = conn;
        console.info("[notifications] connected");
      } catch (e: any) {
        console.warn("[notifications] connect failed:", e?.message ?? e);
        keyRef.current = ""; // allow retry next tick
      }
    }

    const timer = setInterval(() => {
      const token = tokenStore.getAccess();
      const orgId = orgStore.get();
      const key = token && orgId ? `${orgId}` : "";

      if (key && key !== keyRef.current) {
        keyRef.current = key;
        connRef.current?.stop();
        connRef.current = null;
        connect(token!, orgId!);
      }
      if (!token && connRef.current) {
        // logged out
        connRef.current.stop();
        connRef.current = null;
        keyRef.current = "";
        setNotes([]);
        setUnread(0);
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(timer);
      connRef.current?.stop();
    };
  }, []);

  return (
    <NotificationsContext.Provider value={{ notes, unread, markRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}
