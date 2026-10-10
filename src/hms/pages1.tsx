// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { useHMS } from "./store";
import { CFG, medStatus, fupStatus } from "./configs";
import { CrudPage, DataTable } from "./crud";
import { Avatar, Badge, Barcode, Bars, Empty, Icon, KV, Logo, Modal, PageHead, Progress, Stat, Tabs, DocFooter, DocHeader, PrintModal } from "./ui";
import { addDays, calcInvoice, fmtDate, fmtDT, inr, invStatus, today } from "./util";
import { DEPTS } from "./data";

const isActiveAdm = (a) => a.status !== "Discharged";

export function Dashboard() {
  const api = useHMS();
  const { db, session } = api;
  const T = today();
  const s = useMemo(() => {
    const ap = db.appointments.filter((a) => a.date === T);
    const invT = db.payments.filter((p) => p.date === T);
    return {
      total: db.patients.length, regT: db.patients.filter((p) => p.regDate === T).length, apT: ap.length,
      opd: ap.filter((a) => ["Checked In", "Waiting", "In Consultation", "Completed"].includes(a.status)).length,
      waiting: ap.filter((a) => ["Checked In", "Waiting"].includes(a.status)).length, docs: db.doctors.length,
      adm: db.admissions.filter(isActiveAdm).length, beds: db.beds.filter((b) => b.status === "Available").length,
      lab: db.lab.filter((l) => !["Completed", "Cancelled"].includes(l.status)).length,
      pend: db.invoices.filter((i) => ["Pending", "Partially Paid"].includes(invStatus(i))).length,
      rev: invT.reduce((x, p) => x + Number(p.amount), 0), low: db.medicines.filter((m) => ["Low Stock", "Out of Stock"].includes(medStatus(m))).length, ap,
    };
  }, [db]);
  const occ = db.beds.length ? Math.round((db.beds.filter((b) => b.status === "Occupied").length / db.beds.length) * 100) : 0;
  const deptStats = DEPTS.map((d) => ({ label: d, value: db.appointments.filter((a) => a.department === d).length })).filter((x) => x.value);
  const revDays = Array.from({ length: 7 }, (_, i) => addDays(i - 6)).map((d) => ({ label: fmtDate(d).slice(0, 5), value: db.payments.filter((p) => p.date === d).reduce((x, p) => x + Number(p.amount), 0) }));
  const pendingTasks = [
    ...db.lab.filter((l) => l.status === "Requested").map((l) => ({ t: `Collect sample: ${l.testName} (${l.id})`, m: "lab" })),
    ...db.nursing.filter((n) => ["Pending", "Delayed"].includes(n.status)).map((n) => ({ t: `${n.task} – ${n.bedId}`, m: "nursing" })),
    ...db.followups.filter((f) => fupStatus(f) === "Overdue").map((f) => ({ t: `Overdue follow-up: ${api.pName(f.patientId)}`, m: "followups" })),
    ...db.refunds.filter((r) => ["Requested", "Pending Approval"].includes(r.status)).map((r) => ({ t: `Approve refund ${r.id}`, m: "refunds" })),
  ].slice(0, 7);
  const quick = [["Register Patient", "patients", "users"], ["Book Appointment", "appointments", "calendar"], ["Create Prescription", "prescriptions", "rx"], ["Generate Invoice", "billing", "rupee"], ["Admit Patient", "admissions", "bed"], ["Register Emergency", "emergency", "siren"], ["Add Lab Test", "lab", "flask"]];
  const stats = [
    ["Total Registered Patients", s.total, "users", "blue", "patients"], ["Today's Registrations", s.regT, "plus", "teal", "patients"], ["Today's Appointments", s.apT, "calendar", "blue", "appointments"],
    ["Today's OPD Visits", s.opd, "clinic", "teal", "opd"], ["Patients Waiting", s.waiting, "queue", "amber", "queue"], ["Total Doctors", s.docs, "doctor", "blue", "doctors"],
    ["Active Admissions", s.adm, "bed", "teal", "admissions"], ["Available Beds", s.beds, "ward", "green", "beds"], ["Pending Lab Reports", s.lab, "flask", "amber", "lab"],
    ["Pending Payments", s.pend, "wallet", "red", "billing"], ["Today's Revenue", inr(s.rev), "rupee", "green", "billing"], ["Low-Stock Medicines", s.low, "pill", "red", "pharmacy"],
  ];
  return (
    <div className="space-y-5">
      <div className="card relative overflow-hidden bg-navy p-5 text-navy-foreground sm:p-6">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/20" />
        <div className="relative grid gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm opacity-80">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">Welcome back, {session.name.split(" ")[0]}</h1>
            <p className="mt-1 text-sm opacity-80">{s.waiting} patients waiting · {s.apT} appointments today · {occ}% bed occupancy</p>
          </div>
          <Badge tone="teal">{session.role}</Badge>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {quick.map(([l, m, i]) => <button key={l} className="btn btn-outline" onClick={() => api.go(m, { new: 1 })}><Icon name={i} size={16} className="text-primary" />{l}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {stats.map(([l, v, i, t, m]) => <button key={l} className="text-left transition hover:-translate-y-0.5" onClick={() => api.go(m)}><Stat label={l} value={v} icon={i} tone={t} /></button>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Live OPD Queue" action={() => api.go("queue")}>
          {s.ap.filter((a) => ["Checked In", "Waiting", "In Consultation"].includes(a.status)).sort((a, b) => a.token - b.token).slice(0, 7).map((a) => (
            <Row key={a.id} left={<><span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-xs font-bold text-primary">T{a.token}</span><span className="min-w-0"><span className="block truncate font-medium">{api.pName(a.patientId)}</span><span className="block truncate text-xs text-muted-foreground">{api.dName(a.doctorId)}</span></span></>} right={<Badge>{a.status}</Badge>} />
          ))}
          {!s.ap.some((a) => ["Checked In", "Waiting", "In Consultation"].includes(a.status)) && <Empty text="Queue is clear." />}
        </Panel>
        <Panel title="Today's Appointments" action={() => api.go("appointments")}>
          {s.ap.slice(0, 7).map((a) => <Row key={a.id} left={<span className="min-w-0"><span className="block truncate font-medium">{a.time} · {api.pName(a.patientId)}</span><span className="block truncate text-xs text-muted-foreground">{a.department}</span></span>} right={<Badge>{a.status}</Badge>} />)}
          {!s.ap.length && <Empty text="No appointments today." />}
        </Panel>
        <Panel title="Doctor Availability" action={() => api.go("doctors")}>
          {db.doctors.slice(0, 7).map((d) => <Row key={d.id} left={<><Avatar name={d.name} size={30} /><span className="min-w-0"><span className="block truncate font-medium">{d.name}</span><span className="block truncate text-xs text-muted-foreground">{d.department} · {d.timings}</span></span></>} right={<Badge>{d.availability}</Badge>} />)}
        </Panel>
        <Panel title="Department-wise Patients"><Bars data={deptStats} /></Panel>
        <Panel title="Bed Occupancy" action={() => api.go("beds")}>
          <div className="mb-3 flex items-end justify-between"><span className="text-3xl font-bold">{occ}%</span><span className="text-xs text-muted-foreground">{db.beds.filter((b) => b.status === "Occupied").length}/{db.beds.length} beds occupied</span></div>
          <Progress value={occ} />
          <div className="mt-4 space-y-2">{["General Ward A", "Semi-Private", "Private", "ICU"].map((w) => { const bs = db.beds.filter((b) => b.ward === w); const o = bs.filter((b) => b.status === "Occupied").length; return <div key={w} className="text-xs"><div className="mb-1 flex justify-between"><span>{w}</span><span>{o}/{bs.length}</span></div><Progress value={bs.length ? (o / bs.length) * 100 : 0} tone="accent" /></div>; })}</div>
        </Panel>
        <Panel title="Revenue – last 7 days" action={() => api.go("reports")}><Bars data={revDays} money /></Panel>
        <Panel title="Recent Registrations" action={() => api.go("patients")}>
          {[...db.patients].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 6).map((p) => <Row key={p.id} onClick={() => api.go("patient", { id: p.id })} left={<><Avatar name={p.name} size={30} tone="teal" /><span className="min-w-0"><span className="block truncate font-medium">{p.name}</span><span className="block text-xs text-muted-foreground">{p.id}</span></span></>} right={<span className="text-xs text-muted-foreground">{fmtDate(p.regDate)}</span>} />)}
        </Panel>
        <Panel title="Recent Admissions" action={() => api.go("admissions")}>
          {db.admissions.slice(0, 6).map((a) => <Row key={a.id} left={<span className="min-w-0"><span className="block truncate font-medium">{api.pName(a.patientId)}</span><span className="block text-xs text-muted-foreground">{a.ward} · {a.bedId}</span></span>} right={<Badge>{a.status}</Badge>} />)}
        </Panel>
        <Panel title="Pending Tasks">
          {pendingTasks.length ? pendingTasks.map((t, i) => <Row key={i} onClick={() => api.go(t.m)} left={<span className="flex min-w-0 items-center gap-2"><span className="h-2 w-2 shrink-0 rounded-full bg-warning" /><span className="truncate">{t.t}</span></span>} right={<Icon name="chevron" size={14} className="rotate-180 text-muted-foreground" />} />) : <Empty text="All caught up." />}
        </Panel>
        <Panel title="Pharmacy Alerts" action={() => api.go("pharmacy")}>
          {db.medicines.filter((m) => medStatus(m) !== "In Stock").map((m) => <Row key={m.id} left={<span className="min-w-0"><span className="block truncate font-medium">{m.name} {m.strength}</span><span className="block text-xs text-muted-foreground">Stock {m.stock} · Exp {fmtDate(m.expiry)}</span></span>} right={<Badge>{medStatus(m)}</Badge>} />)}
          {!db.medicines.some((m) => medStatus(m) !== "In Stock") && <Empty text="No pharmacy alerts." />}
        </Panel>
        <Panel title="Revenue Summary" action={() => api.go("billing")}>
          {(() => { const all = db.invoices.filter((i) => i.status !== "Cancelled").map(calcInvoice); const t = all.reduce((x, c) => x + c.total, 0), p = all.reduce((x, c) => x + Math.min(c.paid, c.total), 0); return <KV items={[["Total Billed", inr(t)], ["Collected", inr(p)], ["Outstanding", inr(t - p)], ["Today Collected", inr(s.rev)]]} />; })()}
        </Panel>
      </div>
    </div>
  );
}
function Panel({ title, children, action }) {
  return (
    <section className="card flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-navy">{title}</h2>{action && <button className="text-xs font-semibold text-primary hover:underline" onClick={action}>View all</button>}</div>
      <div className="flex-1">{children}</div>
    </section>
  );
}
function Row({ left, right, onClick }) {
  const C = onClick ? "button" : "div";
  return <C onClick={onClick} className="flex w-full items-center justify-between gap-2 border-b py-2 text-left text-sm last:border-0"><span className="flex min-w-0 items-center gap-2">{left}</span><span className="shrink-0">{right}</span></C>;
}

export function PatientProfile({ search }) {
  const api = useHMS();
  const { db } = api;
  const p = db.patients.find((x) => x.id === search.id);
  const [tab, setTab] = useState("Overview");
  const [print, setPrint] = useState(false);
  if (!p) return <div className="card p-6"><Empty text="Patient not found. It may have been deleted." /><div className="text-center"><button className="btn btn-primary" onClick={() => api.go("patients")}>Back to patients</button></div></div>;
  const by = (c) => (db[c] || []).filter((r) => r.patientId === p.id);
  const ap = by("appointments"), rx = by("prescriptions"), lab = by("lab"), inv = by("invoices"), adm = by("admissions"), docs = by("documents"), fu = by("followups"), vit = by("vitals"), cons = by("consultations");
  const timeline = [
    ...ap.map((a) => ({ d: a.date, t: `Appointment ${a.id} with ${api.dName(a.doctorId)}`, s: a.status })),
    ...cons.map((c) => ({ d: c.date, t: `Consultation ${c.id}: ${c.diagnosis || c.complaint}`, s: c.status })),
    ...rx.map((r) => ({ d: r.date, t: `Prescription ${r.id}`, s: r.status })),
    ...lab.map((l) => ({ d: l.requestDate, t: `Lab ${l.testName} (${l.id})`, s: l.status })),
    ...adm.map((a) => ({ d: a.admitAt.slice(0, 10), t: `Admitted ${a.id} · ${a.ward} ${a.bedId}`, s: a.status })),
    ...vit.map((v) => ({ d: v.date, t: `Vitals: BP ${v.bp}, Pulse ${v.pulse}, SpO₂ ${v.spo2}%`, s: "Recorded" })),
  ].sort((a, b) => b.d.localeCompare(a.d));
  const T = (cols, rows, empty) => <div className="card"><DataTable cols={cols} rows={rows} empty={empty} /></div>;
  const c = (k, label, f) => ({ k, label, cell: f || ((r) => r[k] ?? "—") });
  return (
    <div>
      <div className="no-print mb-3"><button className="btn btn-ghost btn-sm" onClick={() => api.go("patients")}><Icon name="chevron" size={14} />Patients</button></div>
      <div className="card mb-4 grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={p.name} size={60} />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-navy">{p.name}</h1>
            <p className="text-sm text-muted-foreground"><span className="font-mono font-semibold text-primary">{p.id}</span> · {p.age || "—"} y · {p.gender} · {p.bloodGroup || "Blood group not recorded"}</p>
            <div className="mt-1 flex flex-wrap gap-2"><Badge>{p.status}</Badge>{p.allergies && p.allergies !== "None known" && <Badge tone="red">Allergy: {p.allergies}</Badge>}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={() => api.go("consultations", { patient: p.id })}><Icon name="plus" size={16} />New Consultation</button>
          <button className="btn btn-outline" onClick={() => api.go("idcards", { id: p.id })}><Icon name="card" size={16} />ID Card</button>
          <button className="btn btn-outline" onClick={() => setPrint(true)}><Icon name="print" size={16} />Print</button>
        </div>
      </div>
      <Tabs tabs={["Overview", "Personal Information", "Medical History", "Visits & Consultations", "Prescriptions", "Lab Reports", "Billing History", "Admissions", "Documents", "Follow-ups"]} value={tab} onChange={setTab} />
      {tab === "Overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-3">
            <Stat label="Visits" value={ap.length} icon="calendar" /><Stat label="Prescriptions" value={rx.length} icon="rx" tone="teal" /><Stat label="Lab Tests" value={lab.length} icon="flask" />
            <Stat label="Admissions" value={adm.length} icon="bed" tone="teal" /><Stat label="Outstanding" value={inr(inv.reduce((s, i) => s + (i.status === "Cancelled" ? 0 : calcInvoice(i).balance), 0))} icon="rupee" tone="red" /><Stat label="Follow-ups" value={fu.length} icon="repeat" tone="amber" />
          </div>
          <div className="card p-4"><h3 className="mb-2 text-sm font-semibold">Latest vitals</h3>{vit[0] ? <KV items={[["BP", vit[0].bp + " mmHg"], ["Pulse", vit[0].pulse + " bpm"], ["Temp", vit[0].temp + " °F"], ["SpO₂", vit[0].spo2 + " %"], ["Weight", vit[0].weight + " kg"], ["Recorded", fmtDate(vit[0].date)]]} /> : <Empty text="No vitals recorded." />}</div>
          <div className="card p-4 lg:col-span-3">
            <h3 className="mb-3 text-sm font-semibold">Visit timeline</h3>
            {timeline.length ? <ol className="relative ml-2 border-l pl-5">{timeline.map((e, i) => <li key={i} className="mb-3"><span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary" /><div className="text-xs text-muted-foreground">{fmtDate(e.d)}</div><div className="flex flex-wrap items-center gap-2 text-sm">{e.t} <Badge>{e.s}</Badge></div></li>)}</ol> : <Empty text="No visits yet." />}
          </div>
        </div>
      )}
      {tab === "Personal Information" && <div className="card p-5"><KV cols={3} items={[["Mobile", p.phone], ["Alternate", p.altPhone], ["Date of Birth", fmtDate(p.dob)], ["Address", p.address], ["City", p.city], ["State", p.state], ["PIN", p.pin], ["Emergency Contact", p.emergencyName], ["Emergency Number", p.emergencyPhone], ["Registered", fmtDate(p.regDate)], ["Registration Type", p.regType], ["Referred By", p.referredBy], ["Assigned Doctor", api.dName(p.doctorId)], ["Notes", p.notes]]} /></div>}
      {tab === "Medical History" && (
        <div className="space-y-4">
          <div className="card p-5"><KV items={[["Known Allergies", p.allergies], ["Existing Conditions", p.conditions], ["Previous Diagnoses (doctor-recorded)", [...new Set([...cons.map((c) => c.diagnosis), ...rx.map((r) => r.diagnosis)].filter(Boolean))].join(", ")], ["Doctor Notes", cons.map((c) => c.treatment).filter(Boolean).join(" · ")]]} /></div>
          {T([c("date", "Date", (r) => fmtDate(r.date)), c("bp", "BP"), c("pulse", "Pulse"), c("temp", "Temp °F"), c("spo2", "SpO₂"), c("weight", "Wt kg"), c("recordedBy", "By")], vit, "No vitals recorded.")}
        </div>
      )}
      {tab === "Visits & Consultations" && <div className="space-y-4">{T([c("id", "Appointment"), c("date", "Date", (r) => `${fmtDate(r.date)} ${r.time}`), c("doctorId", "Doctor", (r) => api.dName(r.doctorId)), c("reason", "Reason"), c("status", "Status", (r) => <Badge>{r.status}</Badge>)], ap, "No visits.")}{T([c("id", "Consultation"), c("date", "Date", (r) => fmtDate(r.date)), c("complaint", "Complaint"), c("diagnosis", "Diagnosis"), c("status", "Status", (r) => <Badge>{r.status}</Badge>)], cons, "No consultations.")}</div>}
      {tab === "Prescriptions" && T([c("id", "ID"), c("date", "Date", (r) => fmtDate(r.date)), c("doctorId", "Doctor", (r) => api.dName(r.doctorId)), c("diagnosis", "Diagnosis"), c("m", "Medicines", (r) => r.medicines.length), c("a", "", (r) => <button className="btn btn-outline btn-sm" onClick={() => api.go("prescriptions", { id: r.id })}>Open</button>)], rx, "No prescriptions.")}
      {tab === "Lab Reports" && T([c("id", "ID"), c("testName", "Test"), c("requestDate", "Requested", (r) => fmtDate(r.requestDate)), c("result", "Result"), c("status", "Status", (r) => <Badge>{r.status}</Badge>)], lab, "No lab tests.")}
      {tab === "Billing History" && T([c("id", "Invoice"), c("date", "Date", (r) => fmtDate(r.date)), c("t", "Total", (r) => inr(calcInvoice(r).total)), c("b", "Balance", (r) => inr(calcInvoice(r).balance)), c("s", "Status", (r) => <Badge>{invStatus(r)}</Badge>), c("a", "", (r) => <button className="btn btn-outline btn-sm" onClick={() => api.go("billing", { id: r.id })}>Open</button>)], inv, "No invoices.")}
      {tab === "Admissions" && T([c("id", "Admission"), c("admitAt", "Admitted", (r) => fmtDT(r.admitAt)), c("bedId", "Bed"), c("reason", "Reason"), c("dischargeDate", "Discharged", (r) => fmtDate(r.dischargeDate)), c("status", "Status", (r) => <Badge>{r.status}</Badge>)], adm, "No admissions.")}
      {tab === "Documents" && T([c("id", "ID"), c("title", "Title"), c("category", "Category"), c("date", "Date", (r) => fmtDate(r.date)), c("fileType", "Type")], docs, "No documents.")}
      {tab === "Follow-ups" && T([c("id", "ID"), c("date", "Date", (r) => fmtDate(r.date)), c("doctorId", "Doctor", (r) => api.dName(r.doctorId)), c("reason", "Reason"), c("s", "Status", (r) => <Badge>{fupStatus(r)}</Badge>)], fu, "No follow-ups.")}
      {print && (
        <PrintModal title={`Patient Details · ${p.id}`} onClose={() => setPrint(false)}>
          <DocHeader settings={api.settings} title="Patient Details" />
          <KV items={[["Patient ID", p.id], ["Name", p.name], ["Age / Gender", `${p.age} / ${p.gender}`], ["Blood Group", p.bloodGroup], ["Mobile", p.phone], ["Address", [p.address, p.city, p.state, p.pin].filter(Boolean).join(", ")], ["Emergency Contact", `${p.emergencyName || ""} ${p.emergencyPhone || ""}`], ["Allergies", p.allergies], ["Conditions", p.conditions], ["Registered", fmtDate(p.regDate)], ["Assigned Doctor", api.dName(p.doctorId)], ["Status", p.status]]} />
          <h4 className="mt-5 mb-2 font-semibold">Recent visits</h4>
          <ul className="text-xs">{timeline.slice(0, 10).map((e, i) => <li key={i}>{fmtDate(e.d)} — {e.t} ({e.s})</li>)}</ul>
          <DocFooter settings={api.settings} />
        </PrintModal>
      )}
    </div>
  );
}

export function IdCards({ search }) {
  const api = useHMS();
  const [id, setId] = useState(search.id || api.db.patients[0]?.id || "");
  const p = api.db.patients.find((x) => x.id === id);
  const s = api.settings;
  return (
    <div>
      <PageHead title="Patient ID Cards" sub="Preview and print a CR-80 size (85.6 × 54 mm) patient identification card.">
        <button className="btn btn-primary" disabled={!p} onClick={() => window.print()}><Icon name="print" size={16} />Print ID Card</button>
      </PageHead>
      <div className="no-print card mb-5 p-4"><label className="label" htmlFor="idc">Select patient</label><select id="idc" className="input max-w-md" value={id} onChange={(e) => setId(e.target.value)}>{api.db.patients.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.id}</option>)}</select></div>
      {p ? (
        <div className="flex justify-center py-6">
          <div className="print-area">
            <div className="idcard overflow-hidden rounded-xl border bg-card shadow-lg" style={{ width: "85.6mm", height: "54mm" }}>
              <div className="flex items-center gap-2 bg-primary px-3 py-1.5 text-primary-foreground"><Logo size={22} /><div className="min-w-0 leading-tight"><div className="truncate text-[9px] font-bold">{s.hospitalName}</div><div className="text-[7px] opacity-80">PATIENT IDENTITY CARD</div></div></div>
              <div className="flex gap-2.5 px-3 pt-2">
                <Avatar name={p.name} size={52} />
                <div className="min-w-0 text-[8px] leading-snug">
                  <div className="truncate text-[11px] font-bold text-navy">{p.name}</div>
                  <div><b>UHID:</b> <span className="font-mono">{p.id}</span></div>
                  <div><b>Registered:</b> {fmtDate(p.regDate)}</div>
                  {p.bloodGroup && <div><b>Blood Group:</b> <span className="font-bold text-destructive">{p.bloodGroup}</span></div>}
                  <div><b>{p.gender}</b>{p.age ? ` · ${p.age} y` : ""}</div>
                </div>
              </div>
              <div className="px-3 pt-1 text-navy"><Barcode value={p.id} height={18} /><div className="text-center font-mono text-[7px] tracking-widest">{p.id}</div></div>
              <div className="truncate px-3 text-center text-[6.5px] text-muted-foreground">{[s.address, s.phone].filter(Boolean).join(" · ") || "Present this card at every visit"}</div>
            </div>
          </div>
        </div>
      ) : <Empty text="No patients registered yet." />}
      <p className="no-print text-center text-xs text-muted-foreground">The barcode encodes only the patient ID — no medical information.</p>
    </div>
  );
}

const QSTAT = ["Checked In", "Waiting", "In Consultation", "Completed", "Cancelled", "No Show"];
export function Queue() {
  const api = useHMS();
  const { db } = api;
  const [doc, setDoc] = useState("");
  const [dept, setDept] = useState("");
  const [full, setFull] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(t); }, []);
  const T = today();
  const list = db.appointments.filter((a) => a.date === T && (!doc || a.doctorId === doc) && (!dept || a.department === dept));
  const doctors = db.doctors.filter((d) => list.some((a) => a.doctorId === d.id));
  const set = (a, status, msg) => { api.patch("appointments", a.id, { status, ...(status === "Checked In" ? { arrivedAt: new Date().toISOString() } : {}) }, `Queue: ${status}`); api.toast(msg || `Token ${a.token} → ${status}`); };
  const callNext = (d) => {
    const q = list.filter((a) => a.doctorId === d.id);
    q.filter((a) => a.status === "In Consultation").forEach((a) => api.patch("appointments", a.id, { status: "Completed" }, "Queue: Completed"));
    const next = q.filter((a) => ["Waiting", "Checked In"].includes(a.status)).sort((a, b) => a.token - b.token)[0];
    if (!next) return api.toast("No patients waiting for " + d.name, "error");
    api.patch("appointments", next.id, { status: "In Consultation", calledAt: new Date().toISOString() }, "Queue: Called Next");
    api.toast(`Calling token ${next.token} – ${api.pName(next.patientId)}`);
  };
  const wait = (a) => (a.arrivedAt ? Math.max(0, Math.round((Date.now() - new Date(a.arrivedAt)) / 60000)) + " min" : "—");
  if (full)
    return (
      <div className="fixed inset-0 z-[60] overflow-auto bg-navy p-6 text-navy-foreground">
        <div className="mb-6 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><Logo size={48} /><div><div className="text-2xl font-bold">{api.settings.hospitalName}</div><div className="opacity-70">OPD Token Display · {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div></div></div><button className="btn btn-outline" onClick={() => { setFull(false); document.fullscreenElement && document.exitFullscreen?.(); }}>Exit display</button></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((d) => {
            const q = list.filter((a) => a.doctorId === d.id);
            const cur = q.find((a) => a.status === "In Consultation");
            const nx = q.filter((a) => ["Waiting", "Checked In"].includes(a.status)).sort((a, b) => a.token - b.token).slice(0, 4);
            return (
              <div key={d.id} className="rounded-2xl bg-card/10 p-5 ring-1 ring-navy-foreground/15">
                <div className="text-lg font-semibold">{d.name}</div><div className="text-sm opacity-70">{d.department}</div>
                <div className="my-4 text-center"><div className="text-xs uppercase tracking-widest opacity-70">Now serving</div><div className="text-7xl font-black text-accent tabular-nums">{cur ? cur.token : "—"}</div></div>
                <div className="text-xs uppercase tracking-widest opacity-70">Next</div>
                <div className="mt-2 flex flex-wrap gap-2">{nx.length ? nx.map((a) => <span key={a.id} className="rounded-lg bg-card/15 px-3 py-1.5 text-xl font-bold">{a.token}</span>) : <span className="opacity-60">No one waiting</span>}</div>
              </div>
            );
          })}
        </div>
        {!doctors.length && <p className="text-center opacity-70">No active queue today.</p>}
      </div>
    );
  return (
    <div>
      <PageHead title="Live Queue & Token Display" sub="Doctor-wise OPD queue for today. Updates are local to this browser (no multi-device sync).">
        <button className="btn btn-accent" onClick={() => { setFull(true); document.documentElement.requestFullscreen?.().catch(() => {}); }}><Icon name="expand" size={16} />Token Display Mode</button>
      </PageHead>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {["Waiting", "Checked In", "In Consultation", "Completed", "Cancelled"].map((s) => <Stat key={s} label={s} value={list.filter((a) => (s === "Cancelled" ? ["Cancelled", "No Show"].includes(a.status) : a.status === s)).length} icon="queue" tone={s === "Completed" ? "green" : s === "Cancelled" ? "red" : s === "In Consultation" ? "teal" : "amber"} />)}
      </div>
      <div className="card mb-4 flex flex-wrap gap-2 p-3">
        <select className="input w-auto" aria-label="Doctor" value={doc} onChange={(e) => setDoc(e.target.value)}><option value="">All doctors</option>{db.doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <select className="input w-auto" aria-label="Department" value={dept} onChange={(e) => setDept(e.target.value)}><option value="">All departments</option>{DEPTS.map((d) => <option key={d}>{d}</option>)}</select>
        <button className="btn btn-outline" onClick={() => api.go("appointments", { new: 1 })}><Icon name="plus" size={16} />New token / appointment</button>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {doctors.map((d) => {
          const q = list.filter((a) => a.doctorId === d.id).sort((a, b) => a.token - b.token);
          const cur = q.find((a) => a.status === "In Consultation");
          return (
            <div key={d.id} className="card p-4">
              <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="flex min-w-0 items-center gap-3"><Avatar name={d.name} /><div className="min-w-0"><div className="truncate font-semibold">{d.name}</div><div className="truncate text-xs text-muted-foreground">{d.department} · Now: {cur ? `T${cur.token}` : "—"}</div></div></div>
                <button className="btn btn-primary btn-sm" onClick={() => callNext(d)}>Call Next</button>
              </div>
              <ul className="divide-y text-sm">
                {q.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-2 py-2">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md font-bold ${a.status === "In Consultation" ? "bg-accent text-accent-foreground" : "bg-secondary text-primary"}`}>{a.token}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-medium">{api.pName(a.patientId)}</span><span className="block text-xs text-muted-foreground">{a.time} · wait {wait(a)}</span></span>
                    <Badge>{a.status}</Badge>
                    <span className="flex gap-1">
                      {a.status === "Scheduled" && <button className="btn btn-outline btn-sm" onClick={() => set(a, "Checked In")}>Arrived</button>}
                      {a.status === "Checked In" && <button className="btn btn-outline btn-sm" onClick={() => set(a, "Waiting")}>To Queue</button>}
                      {["Waiting", "Checked In"].includes(a.status) && <button className="btn btn-outline btn-sm" onClick={() => set(a, "In Consultation")}>Consult</button>}
                      {a.status === "In Consultation" && <><button className="btn btn-outline btn-sm" onClick={() => set(a, "Completed")}>Complete</button><button className="btn btn-ghost btn-sm" onClick={() => set(a, "Waiting", "Moved back to queue")}>Back</button></>}
                      {["Scheduled", "Checked In", "Waiting"].includes(a.status) && <button className="btn btn-ghost btn-sm text-destructive" onClick={() => set(a, "Cancelled", `Token ${a.token} cancelled`)}>Cancel</button>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {!doctors.length && <div className="card"><Empty text="No appointments for today with the selected filters." /></div>}
    </div>
  );
}

export function Opd() {
  const api = useHMS();
  const T = today();
  const ap = api.db.appointments.filter((a) => a.date === T);
  return (
    <div>
      <PageHead title="OPD Management" sub={`Out-patient visits for ${fmtDate(T)}`}><button className="btn btn-primary" onClick={() => api.go("appointments", { new: 1 })}><Icon name="plus" size={16} />New OPD Visit</button></PageHead>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {DEPTS.map((d) => { const n = ap.filter((a) => a.department === d); return <div key={d} className="card p-3"><div className="truncate text-xs text-muted-foreground">{d}</div><div className="text-lg font-bold">{n.length}</div><div className="text-[11px] text-muted-foreground">{n.filter((a) => a.status === "Completed").length} completed</div></div>; })}
      </div>
      <CrudPage cfg={{ ...CFG.appointments, title: "Today's OPD visits", baseFilter: (a) => a.date === T, dateField: null }} embedded />
    </div>
  );
}

export function Appointments({ search }) {
  const api = useHMS();
  const [mode, setMode] = useState("Table");
  const [start, setStart] = useState(today());
  const [doc, setDoc] = useState("");
  const days = Array.from({ length: 7 }, (_, i) => addDays(i, start));
  return (
    <div>
      <PageHead title="Appointments" sub="Book, check-in, reschedule and follow up on appointments.">
        <div className="flex rounded-lg border bg-card p-0.5">{["Table", "Calendar"].map((m) => <button key={m} className={`btn btn-sm ${mode === m ? "btn-primary" : "btn-ghost"}`} onClick={() => setMode(m)}>{m}</button>)}</div>
      </PageHead>
      {mode === "Table" ? <AutoNew cfg={CFG.appointments} open={search.new} /> : (
        <div className="card p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => setStart(addDays(-7, start))}>‹ Prev week</button>
            <input type="date" className="input w-auto" value={start} onChange={(e) => setStart(e.target.value || today())} aria-label="Week start" />
            <button className="btn btn-outline btn-sm" onClick={() => setStart(addDays(7, start))}>Next week ›</button>
            <select className="input w-auto" value={doc} onChange={(e) => setDoc(e.target.value)} aria-label="Doctor"><option value="">All doctors</option>{api.db.doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
            {days.map((d) => {
              const list = api.db.appointments.filter((a) => a.date === d && (!doc || a.doctorId === doc)).sort((a, b) => a.time.localeCompare(b.time));
              return (
                <div key={d} className={`min-h-40 rounded-lg border p-2 ${d === today() ? "border-primary bg-secondary/50" : ""}`}>
                  <div className="mb-2 text-xs font-semibold">{new Date(d + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" })}</div>
                  {list.map((a) => <div key={a.id} className={`mb-1 rounded px-1.5 py-1 text-[11px] tone-${a.status === "Cancelled" ? "red" : a.status === "Completed" ? "green" : "blue"}`} title={`${a.id} · ${api.dName(a.doctorId)}`}><b>{a.time}</b> {api.pName(a.patientId)}</div>)}
                  {!list.length && <div className="text-[11px] text-muted-foreground">—</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import { RecordForm } from "./crud";
export function AutoNew({ cfg, open, presetFilter }) {
  const api = useHMS();
  const [show, setShow] = useState(!!open);
  return (
    <>
      <CrudPage cfg={cfg} embedded={false} presetFilter={presetFilter} />
      {show && <RecordForm cfg={cfg} initial={cfg.defaults ? cfg.defaults(api.db, api) : {}} onClose={() => setShow(false)} />}
    </>
  );
}

export function DoctorsDepts() {
  const [t, setT] = useState("Doctors");
  return (
    <div>
      <PageHead title="Doctors & Departments" sub="Fictional doctor records, OPD timings, availability and departments." />
      <Tabs tabs={["Doctors", "Departments"]} value={t} onChange={setT} />
      {t === "Doctors" ? <CrudPage cfg={CFG.doctors} embedded /> : <CrudPage cfg={CFG.departments} embedded />}
    </div>
  );
}

export function Inventory() {
  const [t, setT] = useState("Items");
  return (
    <div>
      <PageHead title="Inventory & Suppliers" sub="Supplies, equipment stock, suppliers and purchase orders." />
      <Tabs tabs={["Items", "Suppliers", "Purchase Orders"]} value={t} onChange={setT} />
      {t === "Items" && <CrudPage cfg={{ ...CFG.inventory, stats: (all) => [{ label: "Items", value: all.length, icon: "box" }, { label: "Low Stock", value: all.filter((i) => i.qty <= i.reorder).length, icon: "box", tone: "red" }, { label: "Stock Value", value: inr(all.reduce((s, i) => s + i.qty * i.cost, 0)), icon: "rupee", tone: "green" }, { label: "Pending POs", value: useHMS().db.purchaseOrders.filter((p) => p.status === "Pending").length, icon: "clock", tone: "amber" }] }} embedded />}
      {t === "Suppliers" && <CrudPage cfg={CFG.suppliers} embedded />}
      {t === "Purchase Orders" && <CrudPage cfg={CFG.purchaseOrders} embedded />}
    </div>
  );
}

export function Beds() {
  const api = useHMS();
  const [ward, setWard] = useState("");
  const [sel, setSel] = useState(null);
  const beds = api.db.beds.filter((b) => !ward || b.ward === ward);
  const wards = [...new Set(api.db.beds.map((b) => b.ward))];
  const tone = { Available: "green", Occupied: "teal", Reserved: "amber", Maintenance: "red" };
  const counts = ["Available", "Occupied", "Reserved", "Maintenance"].map((s) => ({ s, n: api.db.beds.filter((b) => b.status === s).length }));
  const b = sel && api.db.beds.find((x) => x.id === sel);
  return (
    <div>
      <PageHead title="Bed & Ward Management" sub="Visual bed board. Beds are assigned through admissions, preventing double booking.">
        <button className="btn btn-primary" onClick={() => api.go("admissions", { new: 1 })}><Icon name="plus" size={16} />Admit / Assign</button>
      </PageHead>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{counts.map((c) => <Stat key={c.s} label={c.s} value={c.n} icon="bed" tone={tone[c.s]} />)}</div>
      <div className="mb-3 flex flex-wrap gap-2"><button className={`btn btn-sm ${!ward ? "btn-primary" : "btn-outline"}`} onClick={() => setWard("")}>All wards</button>{wards.map((w) => <button key={w} className={`btn btn-sm ${ward === w ? "btn-primary" : "btn-outline"}`} onClick={() => setWard(w)}>{w}</button>)}</div>
      {wards.filter((w) => !ward || w === ward).map((w) => (
        <div key={w} className="card mb-4 p-4">
          <h3 className="mb-3 text-sm font-semibold">{w} <span className="font-normal text-muted-foreground">· {beds.filter((x) => x.ward === w)[0]?.floor}</span></h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {beds.filter((x) => x.ward === w).map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} className={`rounded-lg border-2 p-3 text-left transition hover:shadow-md border-${tone[x.status] === "green" ? "success" : tone[x.status] === "teal" ? "accent" : tone[x.status] === "amber" ? "warning" : "destructive"}/50`}>
                <div className="flex items-center justify-between"><span className="font-bold">{x.id}</span><Icon name="bed" size={16} /></div>
                <div className="mt-1 truncate text-xs text-muted-foreground">{x.patientId ? api.pName(x.patientId) : x.type}</div>
                <div className="mt-2"><Badge>{x.status}</Badge></div>
              </button>
            ))}
          </div>
        </div>
      ))}
      <h2 className="mb-2 mt-6 text-sm font-semibold">All beds</h2>
      <CrudPage cfg={CFG.beds} embedded />
      {b && (
        <Modal title={`${b.id} · ${b.ward}`} onClose={() => setSel(null)} footer={
          <>
            {b.status === "Available" && <><button className="btn btn-outline" onClick={() => { api.patch("beds", b.id, { status: "Reserved" }, "Bed Reserved"); setSel(null); }}>Reserve</button><button className="btn btn-outline" onClick={() => { api.patch("beds", b.id, { status: "Maintenance" }, "Bed Maintenance"); setSel(null); }}>Maintenance</button><button className="btn btn-primary" onClick={() => api.go("admissions", { new: 1, bed: b.id })}>Assign Patient</button></>}
            {["Reserved", "Maintenance"].includes(b.status) && <button className="btn btn-primary" onClick={() => { api.patch("beds", b.id, { status: "Available" }, "Bed Released"); setSel(null); }}>Mark Available</button>}
            {b.status === "Occupied" && <button className="btn btn-danger" onClick={() => { const a = api.db.admissions.find((x) => x.id === b.admissionId); if (a) { CFG.admissions.actions[0].run(a, api); } setSel(null); }}>Discharge & Release</button>}
          </>
        }>
          <KV items={[["Ward", b.ward], ["Floor", b.floor], ["Type", b.type], ["Daily rate", inr(b.rate)], ["Status", <Badge>{b.status}</Badge>], ["Patient", b.patientId ? `${api.pName(b.patientId)} (${b.patientId})` : "—"], ["Admission", b.admissionId || "—"]]} />
        </Modal>
      )}
    </div>
  );
}
