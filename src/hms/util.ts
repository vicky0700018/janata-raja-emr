// @ts-nocheck
export const pad = (n, w = 4) => String(n).padStart(w, "0");
export const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`;
export const today = () => isoOf(new Date());
export const addDays = (n, base) => {
  const d = base ? new Date(base + "T00:00:00") : new Date();
  d.setDate(d.getDate() + n);
  return isoOf(d);
};
export const nowISO = () => new Date().toISOString();
export const fmtDate = (s) => {
  if (!s) return "—";
  const [y, m, d] = String(s).slice(0, 10).split("-");
  if (!d) return String(s);
  return `${d}/${m}/${y}`;
};
export const fmtDT = (s) =>
  s
    ? new Date(s).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";
export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const initials = (name = "") =>
  String(name).replace(/^Dr\.\s*/, "").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
export const ageFrom = (dob) => {
  if (!dob) return "";
  const b = new Date(dob + "T00:00:00");
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a >= 0 ? a : "";
};
export const daysBetween = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);

export function toCSV(rows) {
  if (!rows || !rows.length) return "";
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const esc = (v) => {
    const s = typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}
export function download(name, text, type = "text/csv") {
  const b = new Blob([text], { type });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 500);
}

export const BILL_CATS = ["Consultation", "Lab", "Procedure", "Medicine", "Room", "Other"];
export function calcInvoice(inv) {
  const items = inv?.items || [];
  const sub = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  const disc = Math.min(Math.max(0, Number(inv?.discount || 0)), sub);
  const tax = ((sub - disc) * Number(inv?.taxPct || 0)) / 100;
  const total = Math.round((sub - disc + tax) * 100) / 100;
  const paid = Number(inv?.paid || 0);
  const byCat = {};
  BILL_CATS.forEach((c) => (byCat[c] = 0));
  items.forEach((i) => (byCat[i.category || "Other"] = (byCat[i.category || "Other"] || 0) + Number(i.amount || 0)));
  return { sub, disc, tax, total, paid, balance: Math.max(0, Math.round((total - paid) * 100) / 100), byCat };
}
export function invStatus(inv) {
  if (inv.status === "Cancelled") return "Cancelled";
  const c = calcInvoice(inv);
  if (c.paid <= 0) return "Pending";
  if (c.paid >= c.total) return "Paid";
  return "Partially Paid";
}
export function rng(seed) {
  let s = seed % 2147483647;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
