// Lightweight inline icons (stroke = currentColor). No external dependency.
type P = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const GitHubIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.9c-2.78.62-3.37-1.2-3.37-1.2-.46-1.18-1.11-1.5-1.11-1.5-.9-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.36 1.11 2.93.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.72 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.78-4.57 5.04.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
  </svg>
);

export const GoogleIcon = ({ className }: P) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.7-.06-1.36-.18-2H12v3.79h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.31Z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.23-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.41 13.91a6 6 0 0 1 0-3.82V7.5H3.07a10 10 0 0 0 0 9l3.34-2.59Z" />
    <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.5l2.86-2.86C16.96 2.99 14.7 2 12 2A10 10 0 0 0 3.07 7.5l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z" />
  </svg>
);

export const GridIcon = ({ className }: P) => (
  <svg className={className} {...base}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);
export const RepoIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V4.5Z" /><path d="M4 17.5A1.5 1.5 0 0 1 5.5 16H20" /></svg>
);
export const ReviewIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M9 11l3 3 8-8" /><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" /></svg>
);
export const SettingsIcon = ({ className }: P) => (
  <svg className={className} {...base}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.4.7 1.65 1.65 0 0 0-1 1.51V22a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 20.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6h.09A1.65 1.65 0 0 0 9 2.09V2a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 14 3.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 8v.09A1.65 1.65 0 0 0 22 9h.09a2 2 0 0 1 0 4H22a1.65 1.65 0 0 0-1.51 1Z" /></svg>
);
export const LogoutIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
);
export const InboxIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5Z" /></svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M20 6 9 17l-5-5" /></svg>
);

export const UserIcon = ({ className }: P) => (
  <svg className={className} {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>
);
export const ShieldIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M12 3l8 3v6c0 4.5-3.2 7.7-8 9-4.8-1.3-8-4.5-8-9V6l8-3Z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const StarIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" /></svg>
);
export const ExternalIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>
);

export const CodeIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M8 9l-3 3 3 3" /><path d="M16 9l3 3-3 3" /><path d="M13 5l-2 14" /></svg>
);
export const SparklesIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M12 3l1.7 4.8L18 9.5l-4.3 1.7L12 16l-1.7-4.8L6 9.5l4.3-1.7z" /><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" /></svg>
);
export const FileIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M6 2h8l4 4v16H6z" /><path d="M14 2v4h4" /></svg>
);

export const MessageIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M4 5h16v11H8l-4 4z" /></svg>
);
export const TrashIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /></svg>
);

export const BuildingIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16" /><path d="M15 9h4a1 1 0 0 1 1 1v11" /><path d="M8 8h3M8 12h3M8 16h3" /><path d="M3 21h18" /></svg>
);
export const MailIcon = ({ className }: P) => (
  <svg className={className} {...base}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></svg>
);

export const CardIcon = ({ className }: P) => (
  <svg className={className} {...base}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></svg>
);
export const ChartIcon = ({ className }: P) => (
  <svg className={className} {...base}><path d="M4 20V8" /><path d="M10 20V4" /><path d="M16 20v-8" /><path d="M22 20H2" /></svg>
);

export const ClockIcon = ({ className }: P) => (
  <svg className={className} {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);