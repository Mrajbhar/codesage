import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as signalR from "@microsoft/signalr";
import { tokenStore } from "../auth/tokenStore";
import { orgStore } from "../auth/orgStore";

export interface Note {
  type: string;
  message: string;
  at: string;
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
  const api = import.meta.env.VITE_API_URL ?? "";
  return api.replace(/\/api\/?$/, "") + "/hub/notifications";
}

// Does NOT depend on AuthContext, so it's safe anywhere in the tree.
// It watches for a token + org appearing and (re)connects when they do.
export default function NotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);
  const connRef = useRef<signalR.HubConnection | null>(null);
  const keyRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;

    async function connect(token: string, orgId: string) {
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
        keyRef.current = ""; // allow a retry on the next tick
      }
    }

    // Poll for auth/org becoming available; reconnect when they change.
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
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(timer);
      connRef.current?.stop();
    };
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notes, unread, markRead: () => setUnread(0) }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
