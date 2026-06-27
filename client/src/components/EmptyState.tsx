import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  actionLabel?: string;
  actionTo?: string;
}

// Consistent, designed empty state used across pages.
export default function EmptyState({ icon, title, children, actionLabel, actionTo }: Props) {
  return (
    <div className="empty">
      {icon && <div className="empty__glyph">{icon}</div>}
      <h4 className="empty__title">{title}</h4>
      {children && <p>{children}</p>}
      {actionLabel && actionTo && <Link className="btn btn--primary btn--sm" to={actionTo}>{actionLabel}</Link>}
    </div>
  );
}