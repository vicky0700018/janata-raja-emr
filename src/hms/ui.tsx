// @ts-nocheck
import { useEffect, useRef } from "react";
import { initials, fmtDate } from "./util";

const P = {
  dashboard: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  card: "M2 5h20v14H2zM6 9h4v4H6zM13 10h6M13 14h4",
  calendar: "M3 5h18v16H3zM16 3v4M8 3v4M3 10h18",
  clinic: "M3 21V7l9-4 9 4v14M9 21v-6h6v6M12 8v4M10 10h4",
  queue: "M4 6h16M4 12h10M4 18h6M18 15l3 3-3 3",
  doctor: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0M12 15v4M10 17h4",
  stetho: "M6 3v6a4 4 0 0 0 8 0V3M10 13v3a5 5 0 0 0 10 0v-2M20 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  rx: "M6 3h12v18H6zM9 7h6M9 11h6M9 15h3",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8zM3 12h4l2-3 3 6 2-3h7",
  siren: "M7 18v-6a5 5 0 0 1 10 0v6M5 21h14v-3H5zM12 3v2M4.2 6.2l1.4 1.4M19.8 6.2l-1.4 1.4",
  nurse: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6zM12 8v6M9 11h6",
  flask: "M9 3h6M10 3v6L4 19a1 1 0 0 0 .9 1.5h14.2A1 1 0 0 0 20 19l-6-10V3M7 14h10",
  bed: "M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9",
  ward: "M3 21h18M5 21V5h14v16M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4",
  scalpel: "M3 21l9-9M14 4l6 6-8 8-4-4zM16 6l2 2",
  pill: "M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7zM8.5 8.5l7 7",
  box: "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  drop: "M12 2.7l5.7 5.6a8 8 0 1 1-11.4 0z",
  ambulance: "M3 6h11v10H3zM14 9h4l3 4v3h-7M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8.5 8v5M6 10.5h5",
  rupee: "M6 3h12M6 8h12M6 13l8.5 8M6 13h3a5 5 0 0 0 0-10",
  shield: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6zM9 12l2 2 4-4",
  refund: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4",
  exit: "M9 21H4V3h5M16 17l5-5-5-5M21 12H9",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5",
  staff: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  tool: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z",
  wallet: "M3 7h18v13H3zM3 7l3-4h12l3 4M16 13h2",
  star: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z",
  repeat: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  chart: "M3 3v18h18M7 16V10M12 16V6M17 16v-4",
  audit: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9",
  database: "M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  x: "M18 6L6 18M6 6l12 12",
  menu: "M3 6h18M3 12h18M3 18h18",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  print: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  chevron: "M15 18l-6-6 6-6",
  down: "M6 9l6 6 6-6",
  check: "M20 6L9 17l-5-5",
  expand: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
};
export function Icon({ name, size = 18, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={P[name] || P.doc} />
    </svg>
  );
}

export function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Hospital logo" role="img">
      <path d="M24 3l17 7v12c0 11-7.4 19.4-17 23C14.4 41.4 7 33 7 22V10z" fill="var(--primary)" />
      <path d="M24 3l17 7v12c0 11-7.4 19.4-17 23z" fill="var(--navy)" opacity=".35" />
      <path d="M20 14h8v6h6v8h-6v6h-8v-6h-6v-8h6z" fill="white" />
      <path d="M22 16h4v6h6v4h-6v6h-4v-6h-6v-4h6z" fill="var(--accent)" />
    </svg>
  );
}

const TONES = {
  green: ["Paid", "Completed", "Available", "Active", "Approved", "Administered", "Settled", "Final", "Processed", "Received", "Reviewed", "Discharged", "In Stock", "Normal", "Scheduled ✓"],
  blue: ["Scheduled", "Checked In", "Submitted", "Requested", "Sample Collected", "In Use", "Admitted", "Draft", "New", "Pending Approval", "Preparation", "Arrived"],
  amber: ["Waiting", "Partially Paid", "Pending", "Processing", "Under Review", "Under Assessment", "Reserved", "Delayed", "Partially Approved", "Low Stock", "Near Expiry", "High", "Dispatched", "On Trip", "On Leave", "Due Today", "Under Maintenance", "Maintenance"],
  teal: ["In Consultation", "In Progress", "Under Treatment", "Occupied", "In OPD", "Transferred", "Critical Care"],
  red: ["Cancelled", "No Show", "Rejected", "Critical", "Not Administered", "Expired", "Out of Service", "Overdue", "Inactive", "Out of Stock"],
};
export function toneOf(s) {
  for (const [t, arr] of Object.entries(TONES)) if (arr.includes(s)) return t;
  return "gray";
}
export function Badge({ children, tone }) {
  const t = tone || toneOf(children);
  return (
    <span className={`badge tone-${t}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

export function Avatar({ name, size = 36, tone = "blue" }) {
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full font-semibold tone-${tone}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}

export function Modal({ title, onClose, children, footer, wide, xl }) {
  const ref = useRef(null);
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    ref.current?.querySelector("input,select,textarea,button")?.focus();
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <div className="modal-root fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={`modal-panel card flex max-h-[94vh] w-full flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${xl ? "sm:max-w-5xl" : wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}>
        <div className="no-print flex items-center justify-between border-b px-5 py-3.5">
          <h2 className="font-semibold">{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="modal-body overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="no-print flex flex-wrap justify-end gap-2 border-t bg-muted px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Confirm({ title = "Are you sure?", message, onCancel, onConfirm, confirmLabel = "Delete", danger = true }) {
  return (
    <Modal title={title} onClose={onCancel} footer={<><button className="btn btn-outline" onClick={onCancel}>Cancel</button><button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button></>}>
      <p className="text-sm text-muted-foreground">{message}</p>
    </Modal>
  );
}

export function Field({ label, children, error, span }) {
  return (
    <label className={`block ${span ? "sm:col-span-2" : ""}`}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function Stat({ label, value, icon = "chart", tone = "blue", sub }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg tone-${tone}`}><Icon name={icon} size={20} /></span>
      <div className="min-w-0">
        <div className="truncate text-xs font-medium text-muted-foreground">{label}</div>
        <div className="text-xl font-bold tracking-tight">{value}</div>
        {sub && <div className="truncate text-[11px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

export function Bars({ data, money, max }) {
  const m = max || Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <Empty text="No data for the selected range." />;
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-2 text-xs">
          <span className="truncate text-muted-foreground">{d.label}</span>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(d.value / m) * 100}%` }} /></div>
          <span className="font-semibold tabular-nums">{money ? "₹" + Number(d.value).toLocaleString("en-IN") : d.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Progress({ value, tone = "primary" }) {
  return <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full bg-${tone}`} style={{ width: `${Math.min(100, value)}%` }} /></div>;
}

export function Empty({ text = "No records found.", icon = "folder" }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-muted"><Icon name={icon} size={22} /></span>
      {text}
    </div>
  );
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-navy sm:text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Note({ children }) {
  return <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground">{children}</div>;
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="no-print mb-4 flex gap-1 overflow-x-auto border-b" role="tablist">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={value === t} onClick={() => onChange(t)} className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors ${value === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

export function Barcode({ value, height = 40 }) {
  const bars = [];
  let x = 0;
  const s = String(value);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    for (let b = 0; b < 6; b++) {
      const w = ((c >> b) & 1) + 1;
      if (b % 2 === 0) bars.push(<rect key={i + "-" + b} x={x} y="0" width={w} height={height} fill="currentColor" />);
      x += w + 0.6;
    }
  }
  return <svg viewBox={`0 0 ${x} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-label={`Barcode ${value}`}>{bars}</svg>;
}

export function DocHeader({ settings, title }) {
  return (
    <div className="avoid-break mb-4 flex items-start justify-between gap-4 border-b-2 border-primary pb-3">
      <div className="flex items-center gap-3">
        <Logo size={46} />
        <div>
          <div className="text-lg font-bold text-navy">{settings.hospitalName}</div>
          <div className="text-xs text-muted-foreground">{[settings.address, settings.phone, settings.email].filter(Boolean).join(" · ") || "Contact details not configured"}</div>
          {settings.regNo && <div className="text-xs text-muted-foreground">Reg. No: {settings.regNo}</div>}
        </div>
      </div>
      {title && <div className="text-right text-sm font-semibold uppercase tracking-wide text-primary">{title}</div>}
    </div>
  );
}
export function DocFooter({ settings, sign = true }) {
  return (
    <div className="avoid-break mt-8">
      {sign && (
        <div className="flex justify-end">
          <div className="w-56 border-t border-foreground/40 pt-1 text-center text-xs text-muted-foreground">Authorised Signature</div>
        </div>
      )}
      <p className="mt-6 border-t pt-2 text-center text-[10px] text-muted-foreground">{settings.footerText} · Printed {fmtDate(new Date().toISOString().slice(0, 10))}</p>
    </div>
  );
}

export function PrintModal({ title, onClose, children, extra }) {
  return (
    <Modal title={title} onClose={onClose} xl footer={<>{extra}<button className="btn btn-outline" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={() => window.print()}><Icon name="print" size={16} />Print</button></>}>
      <div className="print-area mx-auto max-w-[210mm] bg-card p-2 text-sm sm:p-6">{children}</div>
    </Modal>
  );
}

export function KV({ items, cols = 2 }) {
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-2 text-sm ${cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {items.filter(Boolean).map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
          <dd className="break-words">{v === "" || v == null ? "—" : v}</dd>
        </div>
      ))}
    </dl>
  );
}
