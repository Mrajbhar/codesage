import { useState } from "react";
import { useNotifications } from "./Notificationsprovider";
import { ClockIcon } from "./icons";

function ago(iso: string) {
  const s = Math.max(1, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.round(s / 60) + "m ago";
  return Math.round(s / 3600) + "h ago";
}

export default function NotificationBell() {
  const { notes, unread, markRead, hasMore, loadMore } = useNotifications();
  const [open, setOpen] = useState(false);

  function toggle() {
    setOpen((o) => !o);
    if (!open) markRead();
  }

  return (
    <div className="bell">
      <button className="bell__btn" onClick={toggle} aria-label="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && <span className="bell__dot">{unread}</span>}
      </button>
      {open && (
        <div className="bell__panel">
          <div className="bell__head">Notifications</div>
          {notes.length === 0 ? (
            <div className="bell__empty">Nothing yet. Reviews, invites and indexing updates show up here live.</div>
          ) : notes.map((n, i) => (
            <div className="bell__item" key={i}>
              <ClockIcon className="bell__ic" />
              <div><div className="bell__msg">{n.message}</div><div className="bell__time">{ago(n.at)}</div></div>
            </div>
          ))}
          {hasMore && (
            <button className="bell__more" onClick={loadMore}>Load older</button>
          )}
        </div>
      )}
    </div>
  );
}