// @ts-nocheck
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { COLLECTIONS, DEFAULT_SETTINGS, makeSeed } from "./data";
import { pad, nowISO } from "./util";

const K = (k) => "jrh_" + k;
export function lsRead(k) {
  try {
    const v = localStorage.getItem(K(k));
    return v ? JSON.parse(v) : undefined;
  } catch {
    return undefined;
  }
}
export function lsWrite(k, v) {
  try {
    localStorage.setItem(K(k), JSON.stringify(v));
  } catch {}
}
export const getSession = () => {
  const s = lsRead("session");
  return s && s.user ? s : null;
};
export const setSessionLS = (s) => (s ? lsWrite("session", s) : localStorage.removeItem(K("session")));

export function loadDb() {
  let seed = null;
  const db = {};
  for (const k of COLLECTIONS) {
    const v = lsRead(k);
    if (Array.isArray(v)) db[k] = v;
    else {
      seed ??= makeSeed();
      db[k] = seed[k] || [];
      lsWrite(k, db[k]);
    }
  }
  const s = lsRead("settings");
  db.settings = s && typeof s === "object" ? { ...DEFAULT_SETTINGS, ...s } : { ...DEFAULT_SETTINGS };
  if (!s) lsWrite("settings", db.settings);
  return db;
}

const Ctx = createContext(null);
export const useHMS = () => useContext(Ctx);

export function HMSProvider({ children, session, setSession }) {
  const [db, setDb] = useState(loadDb);
  const dbRef = useRef(db);
  dbRef.current = db;
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const commit = useCallback((changes) => {
    setDb((prev) => {
      const next = { ...prev, ...changes };
      Object.keys(changes).forEach((k) => lsWrite(k, next[k]));
      dbRef.current = next;
      return next;
    });
  }, []);

  const log = useCallback(
    (action, type, recordId, desc) => {
      const cur = dbRef.current.audit || [];
      const n = (lsRead("counters")?.ACT || cur.length) + 1;
      const c = lsRead("counters") || {};
      c.ACT = n;
      lsWrite("counters", c);
      const entry = { id: `ACT-${pad(n, 6)}`, user: session?.user || "system", role: session?.role || "System", action, type, recordId, at: nowISO(), desc };
      commit({ audit: [entry, ...cur].slice(0, 1000) });
    },
    [session, commit],
  );

  const nextId = useCallback((coll, prefix, yearly = true, width = 4) => {
    const c = lsRead("counters") || {};
    const rx = new RegExp("^" + prefix.replace(/[-]/g, "\\-") + "-(?:\\d{4}-)?(\\d+)$");
    const max = (dbRef.current[coll] || []).reduce((m, r) => {
      const x = String(r.id).match(rx);
      return x ? Math.max(m, Number(x[1])) : m;
    }, 0);
    const n = Math.max(c[prefix] || 0, max) + 1;
    c[prefix] = n;
    lsWrite("counters", c);
    return yearly ? `${prefix}-${new Date().getFullYear()}-${pad(n, width)}` : `${prefix}-${pad(n, width)}`;
  }, []);

  const upsert = useCallback(
    (coll, rec, label) => {
      const list = dbRef.current[coll] || [];
      const exists = list.some((r) => r.id === rec.id);
      commit({ [coll]: exists ? list.map((r) => (r.id === rec.id ? rec : r)) : [rec, ...list] });
      if (label !== false) log(`${label || coll} ${exists ? "Updated" : "Created"}`, label || coll, rec.id, `${exists ? "Updated" : "Created"} ${rec.id}`);
      return rec;
    },
    [commit, log],
  );
  const patch = useCallback(
    (coll, id, changes, action) => {
      const list = dbRef.current[coll] || [];
      commit({ [coll]: list.map((r) => (r.id === id ? { ...r, ...changes } : r)) });
      if (action) log(action, coll, id, action + " – " + id);
    },
    [commit, log],
  );
  const remove = useCallback(
    (coll, id, label) => {
      commit({ [coll]: (dbRef.current[coll] || []).filter((r) => r.id !== id) });
      log(`${label || coll} Deleted`, label || coll, id, `Deleted ${id}`);
    },
    [commit, log],
  );
  const notify = useCallback(
    (type, title, link) => {
      const cur = dbRef.current.notifications || [];
      commit({ notifications: [{ id: "NTF-" + Date.now(), type, title, link, at: nowISO(), read: false }, ...cur] });
    },
    [commit],
  );
  const setSettings = useCallback(
    (s) => {
      commit({ settings: s });
      log("Settings Updated", "Settings", "settings", "Hospital settings saved");
    },
    [commit, log],
  );
  const replaceAll = useCallback((data) => {
    COLLECTIONS.forEach((k) => lsWrite(k, Array.isArray(data[k]) ? data[k] : []));
    lsWrite("settings", { ...DEFAULT_SETTINGS, ...(data.settings || {}) });
    localStorage.removeItem(K("counters"));
    setDb(loadDb());
  }, []);
  const resetAll = useCallback(() => {
    COLLECTIONS.forEach((k) => localStorage.removeItem(K(k)));
    localStorage.removeItem(K("settings"));
    localStorage.removeItem(K("counters"));
    setDb(loadDb());
  }, []);

  const helpers = useMemo(() => {
    const byId = (coll) => Object.fromEntries((db[coll] || []).map((r) => [r.id, r]));
    const P = byId("patients"), D = byId("doctors");
    return { P, D, pName: (id) => P[id]?.name || (id ? id : "—"), dName: (id) => D[id]?.name || (id ? id : "—") };
  }, [db]);

  const value = { db, session, setSession, toast, log, nextId, upsert, patch, remove, commit, notify, setSettings, replaceAll, resetAll, ...helpers, settings: db.settings };
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="no-print fixed bottom-4 right-4 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
