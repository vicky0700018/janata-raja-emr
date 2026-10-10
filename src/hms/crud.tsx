// @ts-nocheck
import { useMemo, useState } from "react";
import { useHMS } from "./store";
import { Badge, Confirm, DocFooter, DocHeader, Empty, Field, Icon, KV, Modal, PageHead, Note, PrintModal, Stat } from "./ui";
import { download, fmtDate, fmtDT, inr, toCSV } from "./util";
import { DEPTS } from "./data";

export function optionsOf(f, db) {
  if (f.type === "patient") return db.patients.map((p) => ({ value: p.id, label: `${p.name} · ${p.id}` }));
  if (f.type === "doctor") return db.doctors.map((d) => ({ value: d.id, label: `${d.name} · ${d.department}` }));
  if (f.type === "dept") return (db.departments.length ? db.departments.map((d) => d.name) : DEPTS).map((x) => ({ value: x, label: x }));
  const o = typeof f.options === "function" ? f.options(db) : f.options || [];
  return o.map((x) => (typeof x === "object" ? x : { value: x, label: x }));
}

export function display(f, v, api, rec) {
  if (f.render) return f.render(rec, api);
  if (v === "" || v == null) return <span className="text-muted-foreground">—</span>;
  switch (f.type) {
    case "patient": return <span><span className="font-medium">{api.pName(v)}</span><span className="block text-[11px] text-muted-foreground">{v}</span></span>;
    case "doctor": return api.dName(v);
    case "date": return fmtDate(v);
    case "datetime": return fmtDT(v);
    case "money": return inr(v);
    case "status": return <Badge>{v}</Badge>;
    case "checklist": return (v || []).join(", ");
    case "select": {
      const o = optionsOf(f, api.db).find((x) => x.value === v);
      return o ? o.label : v;
    }
    default: return String(v);
  }
}
const textOf = (f, v, api) => (f.type === "patient" ? api.pName(v) + " " + v : f.type === "doctor" ? api.dName(v) : String(v ?? ""));

export function RecordForm({ cfg, initial, onClose, onSaved }) {
  const api = useHMS();
  const [rec, setRec] = useState(initial);
  const [errs, setErrs] = useState({});
  const isNew = !initial.id;
  const set = (k, v) => setRec((r) => {
    let n = { ...r, [k]: v };
    if (cfg.onChange) n = cfg.onChange(n, k, api.db) || n;
    return n;
  });
  const fields = cfg.fields.filter((f) => !f.readonly && !f.hideInForm);
  const save = () => {
    const e = {};
    fields.forEach((f) => {
      if (f.required && (rec[f.k] === "" || rec[f.k] == null)) e[f.k] = "Required";
      if (f.type === "number" || f.type === "money") if (rec[f.k] !== "" && rec[f.k] != null && (isNaN(rec[f.k]) || Number(rec[f.k]) < 0)) e[f.k] = "Enter a valid non-negative number";
      if (f.pattern && rec[f.k] && !f.pattern.test(rec[f.k])) e[f.k] = f.patternMsg || "Invalid format";
    });
    setErrs(e);
    if (Object.keys(e).length) return api.toast("Please fix the highlighted fields", "error");
    let out = { ...rec };
    fields.forEach((f) => { if ((f.type === "number" || f.type === "money") && out[f.k] !== "" && out[f.k] != null) out[f.k] = Number(out[f.k]); });
    if (cfg.compute) out = cfg.compute(out, api.db) || out;
    const msg = cfg.validate?.(out, api.db, isNew);
    if (msg) return api.toast(msg, "error");
    if (isNew) out.id = cfg.makeId ? cfg.makeId(api) : api.nextId(cfg.coll, cfg.prefix, cfg.yearly !== false, cfg.width || 4);
    const prev = (api.db[cfg.coll] || []).find((r) => r.id === out.id);
    api.upsert(cfg.coll, out, cfg.label);
    cfg.afterSave?.(out, api, isNew, prev);
    api.toast(`${cfg.label} ${isNew ? "created" : "updated"} · ${out.id}`);
    onSaved?.(out);
    onClose();
  };
  return (
    <Modal title={`${isNew ? "New" : "Edit"} ${cfg.label}${isNew ? "" : " · " + rec.id}`} onClose={onClose} wide footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}><Icon name="check" size={16} />Save</button></>}>
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); save(); }}>
        {fields.map((f) => (
          <Field key={f.k} label={f.label + (f.required ? " *" : "")} error={errs[f.k]} span={f.type === "textarea" || f.type === "checklist" || f.span}>
            <Input f={f} value={rec[f.k]} onChange={(v) => set(f.k, v)} db={api.db} />
          </Field>
        ))}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}

export function Input({ f, value, onChange, db }) {
  const v = value ?? "";
  if (["select", "patient", "doctor", "dept", "status"].includes(f.type)) {
    const opts = f.type === "status" ? (f.options || []).map((x) => ({ value: x, label: x })) : optionsOf(f, db);
    return (
      <select className="input" value={v} onChange={(e) => onChange(e.target.value)}>
        <option value="">{f.placeholder || "Select…"}</option>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (f.type === "textarea") return <textarea className="input min-h-20" value={v} onChange={(e) => onChange(e.target.value)} />;
  if (f.type === "checklist")
    return (
      <div className="flex flex-wrap gap-3 rounded-lg border p-3">
        {f.options.map((o) => (
          <label key={o} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={(value || []).includes(o)} onChange={(e) => onChange(e.target.checked ? [...(value || []), o] : (value || []).filter((x) => x !== o))} />
            {o}
          </label>
        ))}
      </div>
    );
  const type = f.type === "money" ? "number" : f.type === "datetime" ? "datetime-local" : f.type || "text";
  const val = f.type === "datetime" && v ? new Date(v).toISOString().slice(0, 16) : v;
  return <input className="input" type={type} min={type === "number" ? 0 : undefined} step={f.type === "money" ? "0.01" : undefined} value={val} onChange={(e) => onChange(f.type === "datetime" ? (e.target.value ? new Date(e.target.value).toISOString() : "") : e.target.value)} />;
}

export function RecordView({ cfg, rec, onClose }) {
  const api = useHMS();
  return (
    <PrintModal title={`${cfg.label} · ${rec.id}`} onClose={onClose}>
      <DocHeader settings={api.settings} title={cfg.printTitle || cfg.label} />
      <div className="mb-3 flex items-center justify-between"><span className="font-mono text-sm font-semibold">{rec.id}</span>{cfg.statusField && <Badge>{cfg.statusOf ? cfg.statusOf(rec, api.db) : rec[cfg.statusField]}</Badge>}</div>
      <KV items={cfg.fields.filter((f) => !f.noView).map((f) => [f.label, display(f, rec[f.k], api, rec)])} />
      {cfg.detailExtra && <div className="mt-5">{cfg.detailExtra(rec, api)}</div>}
      {cfg.disclaimer && <p className="mt-4 text-[11px] italic text-muted-foreground">{cfg.disclaimer}</p>}
      <DocFooter settings={api.settings} sign={cfg.sign !== false} />
    </PrintModal>
  );
}

export function DataTable({ cols, rows, onSort, sort, empty }) {
  if (!rows.length) return <Empty text={empty} />;
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.k} scope="col">
                {c.sortable !== false && onSort ? (
                  <button className="inline-flex items-center gap-1 uppercase" onClick={() => onSort(c.k)}>
                    {c.label}{sort?.k === c.k ? (sort.d > 0 ? " ↑" : " ↓") : ""}
                  </button>
                ) : c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map((r, i) => <tr key={r.id || i}>{cols.map((c) => <td key={c.k}>{c.cell(r)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

const PER = 10;
export function CrudPage({ cfg, embedded, presetFilter }) {
  const api = useHMS();
  const { db } = api;
  const all = db[cfg.coll] || [];
  const [q, setQ] = useState("");
  const [flt, setFlt] = useState(presetFilter || {});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState({ k: cfg.defaultSort || null, d: -1 });
  const [page, setPage] = useState(1);
  const [edit, setEdit] = useState(null);
  const [view, setView] = useState(null);
  const [del, setDel] = useState(null);
  const [custom, setCustom] = useState(null);
  const canWrite = cfg.canWrite ? cfg.canWrite(api.session.role) : true;
  const fieldsByK = Object.fromEntries(cfg.fields.map((f) => [f.k, f]));
  const statusOf = (r) => (cfg.statusOf ? cfg.statusOf(r, db) : r[cfg.statusField]);

  const rows = useMemo(() => {
    let r = cfg.baseFilter ? all.filter((x) => cfg.baseFilter(x, db)) : all;
    const s = q.trim().toLowerCase();
    if (s) r = r.filter((x) => [x.id, ...(cfg.search || []).map((k) => textOf(fieldsByK[k] || {}, x[k], api))].join(" ").toLowerCase().includes(s));
    Object.entries(flt).forEach(([k, v]) => { if (v) r = r.filter((x) => (k === cfg.statusField ? statusOf(x) : String(x[k])) === v); });
    if (cfg.dateField && from) r = r.filter((x) => String(x[cfg.dateField]).slice(0, 10) >= from);
    if (cfg.dateField && to) r = r.filter((x) => String(x[cfg.dateField]).slice(0, 10) <= to);
    if (sort.k) r = [...r].sort((a, b) => {
      const av = a[sort.k], bv = b[sort.k];
      return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av ?? "").localeCompare(String(bv ?? ""), "en", { numeric: true })) * sort.d;
    });
    return r;
  }, [all, q, flt, from, to, sort, db]);
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const pg = Math.min(page, pages);
  const shown = rows.slice((pg - 1) * PER, pg * PER);

  const colFields = cfg.fields.filter((f) => f.col);
  const cols = [
    { k: "id", label: "ID", cell: (r) => <span className="font-mono text-xs font-semibold text-primary">{r.id}</span> },
    ...colFields.map((f) => ({ k: f.k, label: f.colLabel || f.label, cell: (r) => (f.k === cfg.statusField ? <Badge>{statusOf(r)}</Badge> : display(f, r[f.k], api, r)) })),
    {
      k: "_a", label: "Actions", sortable: false,
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          {(cfg.actions || []).filter((a) => (!a.show || a.show(r, db)) && (canWrite || a.readOnly)).map((a) => (
            <button key={a.label} className="btn btn-outline btn-sm" onClick={() => a.run(r, api, { setCustom, setEdit })}>{a.label}</button>
          ))}
          <button className="btn btn-ghost btn-sm" aria-label="View" title="View / Print" onClick={() => setView(r)}><Icon name="eye" size={16} /></button>
          {canWrite && cfg.editable !== false && <button className="btn btn-ghost btn-sm" aria-label="Edit" title="Edit" onClick={() => setEdit(r)}><Icon name="edit" size={16} /></button>}
          {canWrite && cfg.deletable !== false && <button className="btn btn-ghost btn-sm text-destructive" aria-label="Delete" title="Delete" onClick={() => setDel(r)}><Icon name="trash" size={16} /></button>}
        </div>
      ),
    },
  ];
  const filterFields = (cfg.filters || []).map((k) => fieldsByK[k]).filter(Boolean);
  const newRec = () => setEdit({ ...(cfg.defaults ? cfg.defaults(db, api) : {}) });

  return (
    <div>
      {!embedded && (
        <PageHead title={cfg.title} sub={cfg.sub}>
          <button className="btn btn-outline" onClick={() => download(`${cfg.coll}.csv`, toCSV(rows))}><Icon name="download" size={16} />CSV</button>
          {canWrite && cfg.creatable !== false && <button className="btn btn-primary" onClick={newRec}><Icon name="plus" size={16} />Add {cfg.label}</button>}
        </PageHead>
      )}
      {embedded && canWrite && cfg.creatable !== false && (
        <div className="mb-3 flex justify-end gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => download(`${cfg.coll}.csv`, toCSV(rows))}><Icon name="download" size={14} />CSV</button>
          <button className="btn btn-primary btn-sm" onClick={newRec}><Icon name="plus" size={14} />Add {cfg.label}</button>
        </div>
      )}
      {cfg.note && <Note>{cfg.note}</Note>}
      {cfg.stats && <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{cfg.stats(all, db).map((s) => <Stat key={s.label} {...s} />)}</div>}
      {cfg.headerExtra && <div className="mb-4">{cfg.headerExtra(api, { setCustom, setEdit })}</div>}
      <div className="card">
        <div className="flex flex-wrap items-end gap-2 border-b p-3">
          <div className="relative min-w-0 flex-1 basis-56">
            <Icon name="search" size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <input className="input pl-8" placeholder={`Search ${cfg.title.toLowerCase()}…`} aria-label="Search" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          </div>
          {filterFields.map((f) => {
            const opts = f.k === cfg.statusField ? (f.options || []).map((x) => ({ value: x, label: x })) : optionsOf(f, db);
            return (
              <select key={f.k} className="input w-auto max-w-48" aria-label={`Filter by ${f.label}`} value={flt[f.k] || ""} onChange={(e) => { setFlt({ ...flt, [f.k]: e.target.value }); setPage(1); }}>
                <option value="">All {f.label}</option>
                {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            );
          })}
          {cfg.dateField && (
            <>
              <input type="date" className="input w-auto" aria-label="From date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <input type="date" className="input w-auto" aria-label="To date" value={to} onChange={(e) => setTo(e.target.value)} />
            </>
          )}
          {(q || from || to || Object.values(flt).some(Boolean)) && <button className="btn btn-ghost btn-sm" onClick={() => { setQ(""); setFlt({}); setFrom(""); setTo(""); }}>Clear</button>}
        </div>
        <DataTable cols={cols} rows={shown} sort={sort} onSort={(k) => setSort((s) => ({ k, d: s.k === k ? -s.d : 1 }))} empty={all.length ? "No records match your filters." : `No ${cfg.title.toLowerCase()} yet. Add the first one.`} />
        <div className="flex items-center justify-between gap-2 border-t px-3 py-2 text-xs text-muted-foreground">
          <span>{rows.length} record{rows.length === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-1">
            <button className="btn btn-outline btn-sm" disabled={pg <= 1} onClick={() => setPage(pg - 1)}>Prev</button>
            <span className="px-2">Page {pg} / {pages}</span>
            <button className="btn btn-outline btn-sm" disabled={pg >= pages} onClick={() => setPage(pg + 1)}>Next</button>
          </div>
        </div>
      </div>
      {edit && <RecordForm cfg={cfg} initial={edit} onClose={() => setEdit(null)} />}
      {view && (cfg.customView ? cfg.customView(view, api, () => setView(null)) : <RecordView cfg={cfg} rec={view} onClose={() => setView(null)} />)}
      {del && (
        <Confirm
          message={`Delete ${cfg.label.toLowerCase()} ${del.id}? This cannot be undone.${cfg.prefix ? " The ID will not be reused." : ""}`}
          onCancel={() => setDel(null)}
          onConfirm={() => {
            const m = cfg.beforeDelete?.(del, api);
            if (m) { api.toast(m, "error"); return setDel(null); }
            api.remove(cfg.coll, del.id, cfg.label);
            cfg.afterDelete?.(del, api);
            api.toast(`${cfg.label} deleted`);
            setDel(null);
          }}
        />
      )}
      {custom}
    </div>
  );
}
