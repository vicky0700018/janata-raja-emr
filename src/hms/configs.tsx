// @ts-nocheck
import { useState } from "react";
import { Badge, Bars, Field, Modal, Icon, Progress } from "./ui";
import { Input } from "./crud";
import { BLOOD, DEPTS, LAB_CATS, OT_ROOMS, ROLES, WARDS } from "./data";
import { addDays, ageFrom, calcInvoice, daysBetween, fmtDate, inr, invStatus, nowISO, today } from "./util";

export function PromptModal({ title, fields, initial = {}, onSubmit, onClose, submitLabel = "Save" }) {
  const [v, setV] = useState(initial);
  const [err, setErr] = useState("");
  return (
    <Modal title={title} onClose={onClose} footer={<><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => { const m = onSubmit(v); if (typeof m === "string") setErr(m); else onClose(); }}>{submitLabel}</button></>}>
      <div className="grid gap-3">
        {fields.map((f) => (
          <Field key={f.k} label={f.label}>
            <InputDb f={f} value={v[f.k]} onChange={(x) => setV({ ...v, [f.k]: x })} />
          </Field>
        ))}
        {err && <p className="text-sm text-destructive">{err}</p>}
      </div>
    </Modal>
  );
}
import { useHMS } from "./store";
function InputDb(props) {
  const { db } = useHMS();
  return <Input {...props} db={db} />;
}

export function createInvoice(api, patientId, items, extra = {}) {
  const id = api.nextId("invoices", "INV");
  const inv = { id, patientId, date: today(), items, discount: 0, taxPct: Number(api.settings.taxPct || 0), paid: 0, method: "", payDate: "", status: "Active", ...extra };
  api.upsert("invoices", inv, false);
  api.log("Invoice Generated", "Invoice", id, `Invoice ${id} generated for ${patientId}`);
  api.notify("Pending Invoice", `${id} generated for ${api.pName(patientId)}`, "billing");
  return id;
}
const step = (label, from, to, coll, extra) => ({
  label,
  show: (r) => from.includes(r.status),
  run: (r, api) => {
    api.patch(coll, r.id, { status: to, ...(extra ? extra(r) : {}) }, `${to} – ${coll}`);
    api.toast(`${r.id} → ${to}`);
  },
});
const isActiveAdm = (a) => a.status !== "Discharged" && a.status !== "Cancelled";
export const medStatus = (m) => {
  const d = daysBetween(today(), m.expiry);
  if (d < 0) return "Expired";
  if (Number(m.stock) <= 0) return "Out of Stock";
  if (Number(m.stock) <= Number(m.reorder)) return "Low Stock";
  if (d <= 60) return "Near Expiry";
  return "In Stock";
};
export const fupStatus = (f) => (f.status === "Completed" || f.status === "Cancelled" ? f.status : f.date < today() ? "Overdue" : f.date === today() ? "Due Today" : "Upcoming");
const elapsed = (iso) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
};
const dRef = (k = "doctorId", label = "Doctor", extra = {}) => ({ k, label, type: "doctor", col: true, ...extra });
const pRef = (extra = {}) => ({ k: "patientId", label: "Patient", type: "patient", col: true, required: true, ...extra });
const PH = /^[6-9]\d{9}$/;

export function releaseBed(api, bedId) {
  if (bedId) api.patch("beds", bedId, { status: "Available", patientId: "", admissionId: "" });
}
export function dischargeAdmission(api, adm) {
  if (!isActiveAdm(adm)) return;
  api.patch("admissions", adm.id, { status: "Discharged", dischargeDate: today() }, "Discharge Recorded");
  releaseBed(api, adm.bedId);
  api.patch("patients", adm.patientId, { status: "Active" });
}

export const CFG = {
  patients: {
    key: "patients", coll: "patients", title: "Patient Management", label: "Patient", prefix: "JRH", sub: "Register, search and manage all patients. Patient IDs are never reused.",
    search: ["name", "phone"], filters: ["gender", "status"], dateField: "regDate", statusField: "status", defaultSort: "id", printTitle: "Patient Details",
    fields: [
      { k: "name", label: "Full Name", required: true, col: true },
      { k: "phone", label: "Mobile Number", required: true, col: true, type: "tel", pattern: PH, patternMsg: "Enter a 10-digit Indian mobile number" },
      { k: "altPhone", label: "Alternate Mobile", type: "tel" },
      { k: "dob", label: "Date of Birth", type: "date" },
      { k: "age", label: "Age", type: "number" },
      { k: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], required: true, col: true, colLabel: "Age / Gender", render: (r) => `${r.age || "—"} y / ${r.gender || "—"}` },
      { k: "bloodGroup", label: "Blood Group", type: "select", options: BLOOD },
      { k: "address", label: "Full Address", span: true },
      { k: "city", label: "City" }, { k: "state", label: "State" },
      { k: "pin", label: "PIN Code", pattern: /^\d{6}$/, patternMsg: "6-digit PIN" },
      { k: "emergencyName", label: "Emergency Contact Name" }, { k: "emergencyPhone", label: "Emergency Contact Number", type: "tel" },
      { k: "allergies", label: "Known Allergies" }, { k: "conditions", label: "Existing Conditions" },
      { k: "regDate", label: "Registration Date", type: "date", col: true, required: true },
      { k: "regType", label: "Registration Type", type: "select", options: ["OPD", "Walk-in", "Referral", "Emergency", "IPD"] },
      { k: "referredBy", label: "Referred By" },
      { k: "lastVisit", label: "Last Visit", type: "date", col: true },
      dRef("doctorId", "Assigned Doctor"),
      { k: "status", label: "Status", type: "status", options: ["Active", "Admitted", "Inactive"], col: true },
      { k: "notes", label: "Notes", type: "textarea" },
    ],
    defaults: () => ({ regDate: today(), status: "Active", regType: "OPD", gender: "" }),
    compute: (r) => ({ ...r, age: r.dob ? ageFrom(r.dob) : r.age }),
    afterSave: (r, api, isNew) => isNew && api.notify("New Patient Registration", `${r.name} registered (${r.id})`, "patients"),
    beforeDelete: (r, api) => (api.db.admissions.some((a) => a.patientId === r.id && isActiveAdm(a)) ? "Cannot delete a patient with an active admission." : null),
    actions: [
      { label: "Profile", readOnly: true, run: (r, api) => api.go("patient", { id: r.id }) },
      { label: "ID Card", readOnly: true, run: (r, api) => api.go("idcards", { id: r.id }) },
    ],
  },

  appointments: {
    key: "appointments", coll: "appointments", title: "Appointments", label: "Appointment", prefix: "APT", sub: "Book, reschedule, check-in and track every appointment.",
    search: ["patientId", "doctorId", "reason"], filters: ["doctorId", "department", "status"], dateField: "date", statusField: "status", defaultSort: "date",
    fields: [
      pRef(), dRef("doctorId", "Doctor", { required: true }),
      { k: "department", label: "Department", type: "dept", col: true },
      { k: "date", label: "Date", type: "date", required: true, col: true },
      { k: "time", label: "Time", type: "time", required: true, col: true },
      { k: "type", label: "Appointment Type", type: "select", options: ["New Consultation", "Follow-up", "Review", "Procedure"] },
      { k: "reason", label: "Reason for Visit", span: true },
      { k: "token", label: "Token", col: true, hideInForm: true },
      { k: "fee", label: "Consultation Fee", type: "money", col: true },
      { k: "status", label: "Status", type: "status", options: ["Scheduled", "Checked In", "Waiting", "In Consultation", "Completed", "Cancelled", "No Show"], col: true },
    ],
    defaults: () => ({ date: today(), status: "Scheduled", type: "New Consultation" }),
    onChange: (r, k, db) => {
      if (k === "doctorId") {
        const d = db.doctors.find((x) => x.id === r.doctorId);
        if (d) return { ...r, department: d.department, fee: d.fee };
      }
    },
    compute: (r, db) => {
      const old = db.appointments.find((a) => a.id === r.id);
      if (!old || old.doctorId !== r.doctorId || old.date !== r.date) {
        const n = db.appointments.filter((a) => a.doctorId === r.doctorId && a.date === r.date && a.id !== r.id).reduce((m, a) => Math.max(m, a.token || 0), 0);
        r = { ...r, token: n + 1 };
      }
      const d = db.doctors.find((x) => x.id === r.doctorId);
      return { ...r, department: r.department || d?.department, fee: r.fee === "" || r.fee == null ? d?.fee || 0 : r.fee };
    },
    afterSave: (r, api, isNew) => {
      api.patch("patients", r.patientId, { lastVisit: r.date, doctorId: r.doctorId });
      if (isNew) api.notify("Upcoming Appointment", `${r.id} · ${api.pName(r.patientId)} at ${r.time} (token ${r.token})`, "appointments");
    },
    actions: [
      step("Check In", ["Scheduled"], "Checked In", "appointments", () => ({ arrivedAt: nowISO() })),
      step("Cancel", ["Scheduled", "Checked In", "Waiting"], "Cancelled", "appointments"),
      {
        label: "Invoice", show: (r, db) => !db.invoices.some((i) => i.appointmentId === r.id) && r.status !== "Cancelled",
        run: (r, api) => { const id = createInvoice(api, r.patientId, [{ desc: `Consultation – ${api.dName(r.doctorId)}`, category: "Consultation", amount: Number(r.fee || 0) }], { appointmentId: r.id }); api.toast(`Invoice ${id} created`); api.go("billing", { id }); },
      },
      { label: "Follow-up", show: (r) => r.status === "Completed", run: (r, api, ui) => ui.setEdit({ patientId: r.patientId, doctorId: r.doctorId, department: r.department, fee: r.fee, date: addDays(7), type: "Follow-up", status: "Scheduled", reason: "Follow-up of " + r.id }) },
    ],
  },

  doctors: {
    key: "doctors", coll: "doctors", title: "Doctors", label: "Doctor", prefix: "DOC", yearly: false, width: 3, search: ["name", "specialization", "department"], filters: ["department", "availability"], statusField: "availability",
    fields: [
      { k: "name", label: "Full Name", required: true, col: true, render: (r) => <span className="font-medium">{r.name}<span className="block text-[11px] text-muted-foreground">{r.qualification}</span></span> },
      { k: "qualification", label: "Qualification", required: true },
      { k: "specialization", label: "Specialization", col: true },
      { k: "department", label: "Department", type: "dept", required: true, col: true },
      { k: "phone", label: "Contact Number", type: "tel" },
      { k: "fee", label: "Consultation Fee", type: "money", col: true },
      { k: "timings", label: "OPD Timings", col: true },
      { k: "availability", label: "Availability", type: "status", options: ["Available", "In OPD", "On Leave", "Unavailable"], col: true },
      { k: "experience", label: "Experience (years)", type: "number" },
      { k: "notes", label: "Notes", type: "textarea" },
    ],
    defaults: (db) => ({ availability: "Available", fee: db.settings.defaultFee, timings: "09:00 - 13:00" }),
    beforeDelete: (r, api) => (api.db.appointments.some((a) => a.doctorId === r.id && ["Scheduled", "Checked In", "Waiting", "In Consultation"].includes(a.status)) ? "Doctor has open appointments. Reassign them first." : null),
    actions: [{ label: "Toggle Leave", run: (r, api) => { const s = r.availability === "On Leave" ? "Available" : "On Leave"; api.patch("doctors", r.id, { availability: s }, "Doctor Availability Updated"); api.toast(`${r.name}: ${s}`); } }],
    detailExtra: (r, api) => {
      const ap = api.db.appointments.filter((a) => a.doctorId === r.id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
      const cons = api.db.consultations.filter((c) => c.doctorId === r.id);
      return (
        <div>
          <h4 className="mb-2 font-semibold">Schedule & appointments ({ap.length}) · Consultations: {cons.length}</h4>
          <ul className="divide-y rounded-lg border text-xs">
            {ap.slice(0, 8).map((a) => <li key={a.id} className="flex justify-between gap-2 px-3 py-2"><span>{fmtDate(a.date)} {a.time} · T{a.token} · {api.pName(a.patientId)}</span><Badge>{a.status}</Badge></li>)}
            {!ap.length && <li className="px-3 py-2 text-muted-foreground">No appointments.</li>}
          </ul>
        </div>
      );
    },
  },
  departments: {
    key: "departments", coll: "departments", title: "Departments", label: "Department", prefix: "DEP", yearly: false, width: 2, search: ["name"], statusField: "status", filters: ["status"],
    fields: [
      { k: "name", label: "Department Name", required: true, col: true }, dRef("head", "Head of Department"),
      { k: "floor", label: "Floor / Wing", col: true }, { k: "status", label: "Status", type: "status", options: ["Active", "Inactive"], col: true },
      { k: "description", label: "Description", type: "textarea" },
    ],
    defaults: () => ({ status: "Active" }),
    detailExtra: (r, api) => <p className="text-sm">Doctors: {api.db.doctors.filter((d) => d.department === r.name).map((d) => d.name).join(", ") || "None"}</p>,
  },

  vitals: {
    key: "vitals", coll: "vitals", title: "Medical History & Vitals", label: "Vitals Record", prefix: "VIT", sub: "Chronological vitals and clinical notes linked to patients and consultations.",
    search: ["patientId", "recordedBy", "symptoms"], filters: ["patientId"], dateField: "date", defaultSort: "date",
    fields: [
      pRef(), { k: "date", label: "Recorded Date", type: "date", required: true, col: true },
      { k: "bp", label: "Blood Pressure (mmHg)", col: true, colLabel: "BP", pattern: /^\d{2,3}\/\d{2,3}$/, patternMsg: "Format 120/80" },
      { k: "pulse", label: "Pulse (bpm)", type: "number", col: true }, { k: "temp", label: "Temperature (°F)", type: "number", col: true },
      { k: "spo2", label: "SpO₂ (%)", type: "number", col: true }, { k: "weight", label: "Weight (kg)", type: "number" }, { k: "height", label: "Height (cm)", type: "number" },
      { k: "recordedBy", label: "Recorded By", col: true }, { k: "symptoms", label: "Symptoms" },
      { k: "consultationId", label: "Linked Consultation", type: "select", options: (db) => db.consultations.map((c) => ({ value: c.id, label: `${c.id} · ${c.patientId}` })) },
      { k: "notes", label: "Clinical / Follow-up Notes", type: "textarea" },
    ],
    defaults: (db, api) => ({ date: today(), recordedBy: api.session.name }),
  },

  emergency: {
    key: "emergency", coll: "emergency", title: "Emergency & Triage", label: "Emergency Case", prefix: "EMR", printTitle: "Emergency Intake Summary",
    note: "Triage priority and all emergency treatment decisions remain with qualified medical staff. This software only records them.",
    search: ["patientName", "complaint", "doctorId"], filters: ["priority", "status", "department"], statusField: "status", dateField: "arrivalAt", defaultSort: "arrivalAt",
    fields: [
      { k: "patientId", label: "Existing Patient (if known)", type: "patient" },
      { k: "patientName", label: "Patient Name", col: true, required: true, render: (r) => <span className="font-medium">{r.patientName}<span className="block text-[11px] text-muted-foreground">{r.patientId || "Not registered"}</span></span> },
      { k: "arrivalAt", label: "Arrival Date & Time", type: "datetime", required: true, col: true },
      { k: "elapsed", label: "Elapsed", col: true, hideInForm: true, noView: true, render: (r) => (["Discharged", "Transferred"].includes(r.status) ? "—" : elapsed(r.arrivalAt)) },
      { k: "contact", label: "Contact Information" }, { k: "complaint", label: "Presenting Complaint", required: true, col: true },
      { k: "priority", label: "Triage Priority", type: "select", options: ["Critical", "High", "Normal"], required: true, col: true, render: (r) => <Badge>{r.priority}</Badge> },
      dRef("doctorId", "Assigned Doctor"), { k: "department", label: "Department", type: "dept" },
      { k: "status", label: "Status", type: "status", options: ["Arrived", "Under Assessment", "Under Treatment", "Transferred", "Discharged"], col: true },
      { k: "notes", label: "Notes", type: "textarea" },
    ],
    defaults: () => ({ arrivalAt: nowISO(), patientName: "Unknown Patient", status: "Arrived", priority: "Normal" }),
    onChange: (r, k, db) => {
      if (k === "patientId") { const p = db.patients.find((x) => x.id === r.patientId); if (p) return { ...r, patientName: p.name, contact: p.phone }; }
      if (k === "doctorId") { const d = db.doctors.find((x) => x.id === r.doctorId); if (d) return { ...r, department: d.department }; }
    },
    actions: [
      {
        label: "Create Patient", show: (r) => !r.patientId,
        run: (r, api) => {
          const id = api.nextId("patients", "JRH");
          api.upsert("patients", { id, name: r.patientName, phone: r.contact || "", gender: "", regDate: today(), regType: "Emergency", status: "Active", doctorId: r.doctorId, lastVisit: today(), allergies: "", conditions: "" }, "Patient");
          api.patch("emergency", r.id, { patientId: id }, "Emergency Linked to Patient");
          api.toast(`Patient ${id} created and linked`);
        },
      },
      step("Assess", ["Arrived"], "Under Assessment", "emergency"),
      step("Treat", ["Under Assessment"], "Under Treatment", "emergency"),
      step("Discharge", ["Under Treatment"], "Discharged", "emergency"),
    ],
  },

  nursing: {
    key: "nursing", coll: "nursing", title: "Nursing Station", label: "Nursing Task", prefix: "NUR", sub: "Inpatient care tasks and medication administration records (MAR).",
    note: "Demo data only. Medication orders and care instructions come from doctors; the system does not generate them.",
    search: ["patientId", "task", "recordedBy"], filters: ["kind", "status", "shift"], statusField: "status", defaultSort: "scheduled",
    fields: [
      { k: "admissionId", label: "Admission", type: "select", required: true, options: (db) => db.admissions.filter(isActiveAdm).map((a) => ({ value: a.id, label: `${a.id} · ${a.patientId} · ${a.bedId}` })) },
      pRef({ hideInForm: true }), { k: "bedId", label: "Bed", col: true, hideInForm: true },
      { k: "kind", label: "Type", type: "select", options: ["Medication", "Care Task", "Vitals", "Doctor Instruction"], col: true },
      { k: "task", label: "Task / Instruction", required: true, col: true },
      { k: "orderRef", label: "Medication Order Ref.", type: "select", options: (db) => db.prescriptions.map((p) => ({ value: p.id, label: `${p.id} · ${p.patientId}` })) },
      { k: "scheduled", label: "Scheduled Time", type: "time", col: true },
      { k: "status", label: "Status", type: "status", options: ["Pending", "Administered", "Delayed", "Not Administered", "Completed"], col: true },
      { k: "recordedBy", label: "Recorded By" }, { k: "shift", label: "Shift", type: "select", options: ["Morning", "Evening", "Night"] }, { k: "notes", label: "Care Notes", type: "textarea" },
    ],
    defaults: (db, api) => ({ status: "Pending", kind: "Care Task", recordedBy: api.session.name, shift: "Morning" }),
    compute: (r, db) => { const a = db.admissions.find((x) => x.id === r.admissionId); return a ? { ...r, patientId: a.patientId, bedId: a.bedId } : r; },
    actions: [
      step("Administered", ["Pending", "Delayed"], "Administered", "nursing", () => ({ doneAt: nowISO() })),
      step("Delay", ["Pending"], "Delayed", "nursing"),
    ],
    headerExtra: (api) => {
      const act = api.db.admissions.filter(isActiveAdm);
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {act.map((a) => {
            const tasks = api.db.nursing.filter((n) => n.admissionId === a.id);
            const done = tasks.filter((t) => ["Administered", "Completed"].includes(t.status)).length;
            return (
              <div key={a.id} className="card p-3">
                <div className="flex items-center justify-between gap-2"><span className="truncate font-semibold">{api.pName(a.patientId)}</span><Badge>{a.status}</Badge></div>
                <div className="text-xs text-muted-foreground">{a.ward} · {a.bedId} · {api.dName(a.doctorId)}</div>
                <div className="mt-2 flex items-center gap-2 text-xs"><Progress value={tasks.length ? (done / tasks.length) * 100 : 0} /><span className="shrink-0">{done}/{tasks.length}</span></div>
              </div>
            );
          })}
        </div>
      );
    },
  },

  lab: {
    key: "lab", coll: "lab", title: "Lab Tests & Reports", label: "Lab Test", prefix: "LAB", printTitle: "Laboratory Report",
    note: "Demo only — this software does not perform diagnostic testing. All results shown are fictional.",
    disclaimer: "Fictional demo result. Not for diagnostic use.",
    search: ["patientId", "testName", "doctorId"], filters: ["category", "status", "doctorId"], statusField: "status", dateField: "requestDate", defaultSort: "requestDate",
    fields: [
      pRef(), dRef("doctorId", "Referring Doctor"), { k: "testName", label: "Test Name", required: true, col: true },
      { k: "category", label: "Category", type: "select", options: LAB_CATS, required: true, col: true },
      { k: "requestDate", label: "Request Date", type: "date", required: true, col: true }, { k: "sampleDate", label: "Sample Collection", type: "date" }, { k: "reportDate", label: "Report Date", type: "date" },
      { k: "status", label: "Status", type: "status", options: ["Requested", "Sample Collected", "Processing", "Completed", "Cancelled"], col: true },
      { k: "charge", label: "Charge", type: "money" },
      { k: "result", label: "Result Summary (fictional)", type: "textarea" }, { k: "remarks", label: "Lab Remarks", type: "textarea" },
    ],
    defaults: () => ({ requestDate: today(), status: "Requested", charge: 300 }),
    afterSave: (r, api, isNew) => isNew && api.notify("Pending Lab Report", `${r.testName} requested for ${api.pName(r.patientId)}`, "lab"),
    actions: [
      step("Collect", ["Requested"], "Sample Collected", "lab", () => ({ sampleDate: today() })),
      step("Process", ["Sample Collected"], "Processing", "lab"),
      {
        label: "Complete", show: (r) => r.status === "Processing",
        run: (r, api, ui) => ui.setCustom(<PromptModal title={`Record result · ${r.id}`} fields={[{ k: "result", label: "Result summary (fictional)", type: "textarea" }, { k: "remarks", label: "Remarks", type: "textarea" }]} initial={{ result: r.result }} onClose={() => ui.setCustom(null)} onSubmit={(v) => { if (!v.result) return "Enter a result summary"; api.patch("lab", r.id, { ...v, status: "Completed", reportDate: today() }, "Lab Report Completed"); api.toast("Report completed"); }} />),
      },
      { label: "Bill", show: (r, db) => !r.invoiceId && r.status !== "Cancelled", run: (r, api) => { const id = createInvoice(api, r.patientId, [{ desc: r.testName, category: "Lab", amount: Number(r.charge || 0) }]); api.patch("lab", r.id, { invoiceId: id }); api.toast(`Billed on ${id}`); } },
    ],
  },

  admissions: {
    key: "admissions", coll: "admissions", title: "IPD & Admissions", label: "Admission", prefix: "ADM", printTitle: "Admission Summary",
    search: ["patientId", "doctorId", "bedId", "reason"], filters: ["status", "ward", "department"], statusField: "status", dateField: "admitAt", defaultSort: "admitAt",
    fields: [
      pRef(), dRef("doctorId", "Attending Doctor", { required: true }), { k: "department", label: "Department", type: "dept" },
      { k: "admitAt", label: "Admission Date & Time", type: "datetime", required: true, col: true },
      { k: "bedId", label: "Bed", type: "select", required: true, col: true, options: (db) => db.beds.map((b) => ({ value: b.id, label: `${b.id} · ${b.ward} · ${b.status}` })) },
      { k: "ward", label: "Ward", col: true, hideInForm: true },
      { k: "reason", label: "Admission Reason", required: true }, { k: "prelimDx", label: "Preliminary Diagnosis (by doctor)" },
      { k: "expectedDischarge", label: "Expected Discharge", type: "date" },
      { k: "status", label: "Status", type: "status", options: ["Admitted", "Under Observation", "Critical Care", "Discharged"], col: true },
      { k: "dischargeDate", label: "Discharge Date", type: "date", hideInForm: true },
      { k: "notes", label: "Admission Notes", type: "textarea" },
    ],
    defaults: () => ({ admitAt: nowISO(), status: "Admitted", expectedDischarge: addDays(3) }),
    onChange: (r, k, db) => { if (k === "doctorId") { const d = db.doctors.find((x) => x.id === r.doctorId); if (d) return { ...r, department: d.department }; } },
    compute: (r, db) => ({ ...r, ward: db.beds.find((b) => b.id === r.bedId)?.ward || "" }),
    validate: (r, db) => {
      if (!isActiveAdm(r)) return null;
      const bed = db.beds.find((b) => b.id === r.bedId);
      if (!bed) return "Select a valid bed";
      const clash = db.admissions.find((a) => a.id !== r.id && a.bedId === r.bedId && isActiveAdm(a));
      if (clash) return `${r.bedId} is already assigned to active admission ${clash.id}`;
      if (bed.status !== "Available" && bed.admissionId !== r.id) return `${r.bedId} is ${bed.status}. Choose an available bed.`;
      if (db.admissions.some((a) => a.id !== r.id && a.patientId === r.patientId && isActiveAdm(a))) return "This patient already has an active admission";
      return null;
    },
    afterSave: (r, api, isNew, prev) => {
      if (prev && prev.bedId !== r.bedId) releaseBed(api, prev.bedId);
      if (isActiveAdm(r)) {
        api.patch("beds", r.bedId, { status: "Occupied", patientId: r.patientId, admissionId: r.id }, "Bed Assigned");
        api.patch("patients", r.patientId, { status: "Admitted" });
      } else {
        releaseBed(api, r.bedId);
        api.patch("patients", r.patientId, { status: "Active" });
      }
    },
    beforeDelete: (r) => (isActiveAdm(r) ? "Discharge the patient before deleting this admission." : null),
    actions: [
      {
        label: "Discharge", show: isActiveAdm,
        run: (r, api) => {
          dischargeAdmission(api, r);
          const id = api.nextId("discharge", "DIS");
          api.upsert("discharge", { id, admissionId: r.id, patientId: r.patientId, doctorId: r.doctorId, admitDate: r.admitAt.slice(0, 10), dischargeDate: today(), reason: r.reason, diagnosis: r.prelimDx, treatment: "", procedures: "", medicines: "", instructions: "", followUp: addDays(7), notes: "", status: "Draft" }, "Discharge Summary");
          api.toast(`Discharged. Bed ${r.bedId} released. Draft ${id} created.`);
          api.go("discharge");
        },
      },
    ],
  },

  beds: {
    key: "beds", coll: "beds", title: "Beds", label: "Bed", prefix: "BED", yearly: false, width: 3, search: ["ward", "patientId"], filters: ["ward", "status", "type"], statusField: "status",
    fields: [
      { k: "ward", label: "Ward", type: "select", options: WARDS, required: true, col: true }, { k: "floor", label: "Floor", col: true },
      { k: "type", label: "Bed Type", type: "select", options: ["General", "Semi-Private", "Private", "ICU"], col: true },
      { k: "rate", label: "Daily Rate", type: "money", col: true },
      { k: "status", label: "Status", type: "status", options: ["Available", "Reserved", "Maintenance", "Occupied"], col: true },
      { k: "patientId", label: "Assigned Patient", type: "patient", col: true, hideInForm: true }, { k: "admissionId", label: "Admission ID", hideInForm: true, col: true },
    ],
    defaults: () => ({ status: "Available", type: "General", ward: "General Ward A", floor: "Floor 1", rate: 1200 }),
    validate: (r, db) => {
      const old = db.beds.find((b) => b.id === r.id);
      if (old && old.status === "Occupied" && r.status !== "Occupied") return "Release this bed by discharging or transferring the admission.";
      if ((!old || old.status !== "Occupied") && r.status === "Occupied") return "Beds become Occupied only through an admission.";
      return null;
    },
    beforeDelete: (r) => (r.status === "Occupied" ? "Cannot delete an occupied bed." : null),
  },

  ot: {
    key: "ot", coll: "ot", title: "Operation Theatre", label: "Surgery Schedule", prefix: "OT", printTitle: "OT Schedule",
    search: ["patientId", "doctorId", "procedure"], filters: ["room", "status", "doctorId"], statusField: "status", dateField: "date", defaultSort: "date",
    fields: [
      pRef(), { k: "admissionId", label: "Admission Ref.", type: "select", options: (db) => db.admissions.map((a) => ({ value: a.id, label: `${a.id} · ${a.patientId}` })) },
      dRef("doctorId", "Surgeon", { required: true }), { k: "department", label: "Department", type: "dept" },
      { k: "room", label: "OT Room", type: "select", options: OT_ROOMS, required: true, col: true },
      { k: "date", label: "Date", type: "date", required: true, col: true }, { k: "start", label: "Start", type: "time", required: true, col: true }, { k: "end", label: "End", type: "time", required: true, col: true },
      { k: "procedure", label: "Procedure", required: true, col: true },
      { k: "status", label: "Status", type: "status", options: ["Scheduled", "Preparation", "In Progress", "Completed", "Cancelled"], col: true },
      { k: "notes", label: "Notes", type: "textarea" },
    ],
    defaults: () => ({ date: today(), status: "Scheduled", room: "OT-1" }),
    onChange: (r, k, db) => { if (k === "doctorId") { const d = db.doctors.find((x) => x.id === r.doctorId); if (d) return { ...r, department: d.department }; } },
    validate: (r, db) => {
      if (r.end <= r.start) return "End time must be after start time";
      if (r.status === "Cancelled") return null;
      const c = db.ot.find((o) => o.id !== r.id && o.room === r.room && o.date === r.date && o.status !== "Cancelled" && r.start < o.end && o.start < r.end);
      return c ? `${r.room} is booked ${c.start}–${c.end} for ${c.id}. Choose another slot.` : null;
    },
    afterSave: (r, api, isNew) => isNew && api.notify("Upcoming OT Schedule", `${r.procedure} · ${r.room} ${fmtDate(r.date)} ${r.start}`, "ot"),
    actions: [step("Prepare", ["Scheduled"], "Preparation", "ot"), step("Start", ["Preparation"], "In Progress", "ot"), step("Complete", ["In Progress"], "Completed", "ot")],
    headerExtra: (api) => {
      const t = today();
      return (
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold">Today's OT calendar · {fmtDate(t)}</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {OT_ROOMS.map((room) => {
              const list = api.db.ot.filter((o) => o.room === room && o.date === t && o.status !== "Cancelled").sort((a, b) => a.start.localeCompare(b.start));
              const busy = list.some((o) => o.status === "In Progress");
              return (
                <div key={room} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between"><span className="font-semibold">{room}</span><Badge tone={busy ? "teal" : "green"}>{busy ? "In Use" : "Free now"}</Badge></div>
                  {list.length ? list.map((o) => <div key={o.id} className="mb-1 rounded bg-secondary px-2 py-1 text-xs"><b>{o.start}–{o.end}</b> {o.procedure} · {api.dName(o.doctorId)}</div>) : <p className="text-xs text-muted-foreground">No surgeries today</p>}
                </div>
              );
            })}
          </div>
        </div>
      );
    },
  },

  pharmacy: {
    key: "pharmacy", coll: "medicines", title: "Pharmacy & Medicines", label: "Medicine", prefix: "MED", yearly: false, width: 3,
    note: "The system does not prescribe or recommend medicines. Dispensing follows doctor prescriptions only.",
    search: ["name", "category", "batch"], filters: ["category"], statusField: "status", defaultSort: "name",
    statusOf: (m) => medStatus(m),
    fields: [
      { k: "name", label: "Medicine Name", required: true, col: true }, { k: "category", label: "Category", required: true, col: true }, { k: "strength", label: "Strength", col: true },
      { k: "batch", label: "Batch No.", col: true }, { k: "expiry", label: "Expiry Date", type: "date", required: true, col: true },
      { k: "stock", label: "Stock Qty", type: "number", required: true, col: true }, { k: "price", label: "Unit Price", type: "money", col: true },
      { k: "supplierId", label: "Supplier", type: "select", options: (db) => db.suppliers.map((s) => ({ value: s.id, label: s.name })) },
      { k: "reorder", label: "Reorder Level", type: "number" },
      { k: "status", label: "Status", col: true, hideInForm: true, render: (r) => <Badge>{medStatus(r)}</Badge>, options: ["In Stock", "Low Stock", "Near Expiry", "Out of Stock", "Expired"] },
    ],
    defaults: () => ({ reorder: 25, stock: 0 }),
    stats: (all) => [
      { label: "Medicines", value: all.length, icon: "pill" },
      { label: "Low / Out of Stock", value: all.filter((m) => ["Low Stock", "Out of Stock"].includes(medStatus(m))).length, icon: "box", tone: "amber" },
      { label: "Near Expiry / Expired", value: all.filter((m) => ["Near Expiry", "Expired"].includes(medStatus(m))).length, icon: "clock", tone: "red" },
      { label: "Stock Value", value: inr(all.reduce((s, m) => s + m.stock * m.price, 0)), icon: "rupee", tone: "green" },
    ],
    actions: [
      {
        label: "Dispense",
        run: (r, api, ui) => ui.setCustom(
          <PromptModal title={`Dispense ${r.name} ${r.strength}`} submitLabel="Dispense" fields={[{ k: "patientId", label: "Patient", type: "patient" }, { k: "qty", label: `Quantity (in stock: ${r.stock})`, type: "number" }, { k: "bill", label: "Add charge to billing", type: "select", options: ["Yes", "No"] }]} initial={{ bill: "Yes" }} onClose={() => ui.setCustom(null)}
            onSubmit={(v) => {
              const q = Number(v.qty);
              if (!v.patientId) return "Select patient";
              if (!q || q <= 0) return "Enter a valid quantity";
              if (q > r.stock) return "Quantity exceeds available stock";
              if (medStatus(r) === "Expired") return "Cannot dispense an expired batch";
              api.patch("medicines", r.id, { stock: r.stock - q }, "Medicine Stock Updated");
              api.upsert("dispensing", { id: api.nextId("dispensing", "DSP"), medicineId: r.id, patientId: v.patientId, qty: q, date: today(), by: api.session.name }, "Dispensing");
              if (v.bill === "Yes") createInvoice(api, v.patientId, [{ desc: `${r.name} ${r.strength} × ${q}`, category: "Medicine", amount: q * r.price }]);
              if (r.stock - q <= r.reorder) api.notify("Low Medicine Stock", `${r.name} is at ${r.stock - q} units`, "pharmacy");
              api.toast(`Dispensed ${q} × ${r.name}`);
            }} />,
        ),
      },
      { label: "Restock", run: (r, api, ui) => ui.setCustom(<PromptModal title={`Restock ${r.name}`} fields={[{ k: "qty", label: "Quantity received", type: "number" }, { k: "batch", label: "Batch No." }, { k: "expiry", label: "Expiry", type: "date" }]} initial={{ batch: r.batch, expiry: r.expiry }} onClose={() => ui.setCustom(null)} onSubmit={(v) => { const q = Number(v.qty); if (!q || q <= 0) return "Enter quantity"; api.patch("medicines", r.id, { stock: r.stock + q, batch: v.batch, expiry: v.expiry }, "Medicine Stock Updated"); api.toast("Stock updated"); }} />) },
    ],
    detailExtra: (r, api) => {
      const h = api.db.dispensing.filter((d) => d.medicineId === r.id);
      return <div><h4 className="mb-2 font-semibold">Dispensing history</h4>{h.length ? <ul className="text-xs">{h.map((d) => <li key={d.id}>{fmtDate(d.date)} · {api.pName(d.patientId)} · {d.qty} units · {d.by}</li>)}</ul> : <p className="text-xs text-muted-foreground">None</p>}</div>;
    },
  },

  inventory: {
    key: "inventory", coll: "inventory", title: "Inventory Items", label: "Inventory Item", prefix: "INV-ITM", yearly: false, width: 3, search: ["name", "category"], filters: ["category"], statusField: "stockStatus",
    statusOf: (r) => (r.qty <= r.reorder ? "Low Stock" : "In Stock"),
    fields: [
      { k: "name", label: "Item Name", required: true, col: true },
      { k: "category", label: "Category", type: "select", options: ["Medical Supplies", "Non-medical Supplies", "Lab Consumables", "Medical Equipment"], required: true, col: true },
      { k: "qty", label: "Quantity", type: "number", required: true, col: true }, { k: "unit", label: "Unit" }, { k: "reorder", label: "Reorder Level", type: "number" },
      { k: "cost", label: "Unit Cost", type: "money", col: true }, { k: "supplierId", label: "Supplier", type: "select", options: (db) => db.suppliers.map((s) => ({ value: s.id, label: s.name })), col: true },
      { k: "stockStatus", label: "Stock", col: true, hideInForm: true, noView: true, options: ["In Stock", "Low Stock"] },
    ],
    defaults: () => ({ unit: "units", reorder: 10, qty: 0 }),
    actions: [{ label: "Adjust", run: (r, api, ui) => ui.setCustom(<PromptModal title={`Stock adjustment · ${r.name}`} fields={[{ k: "delta", label: "Change (+/-)", type: "text" }, { k: "reason", label: "Reason" }]} onClose={() => ui.setCustom(null)} onSubmit={(v) => { const d = Number(v.delta); if (!d) return "Enter a non-zero number"; if (r.qty + d < 0) return "Stock cannot go below zero"; api.patch("inventory", r.id, { qty: r.qty + d }, `Stock Adjusted (${d > 0 ? "+" : ""}${d}) ${v.reason || ""}`); api.toast("Stock adjusted"); }} />) }],
  },
  suppliers: {
    key: "suppliers", coll: "suppliers", title: "Suppliers", label: "Supplier", prefix: "SUP", yearly: false, width: 3, search: ["name", "category"], statusField: "status", filters: ["status"],
    fields: [{ k: "name", label: "Supplier Name", required: true, col: true }, { k: "contact", label: "Contact Person", col: true }, { k: "phone", label: "Phone", type: "tel", col: true }, { k: "category", label: "Category", col: true }, { k: "status", label: "Status", type: "status", options: ["Active", "Inactive"], col: true }],
    defaults: () => ({ status: "Active" }),
  },
  purchaseOrders: {
    key: "purchaseOrders", coll: "purchaseOrders", title: "Purchase Orders", label: "Purchase Order", prefix: "PO", search: ["supplierId", "itemId"], statusField: "status", filters: ["status"], dateField: "date",
    fields: [
      { k: "supplierId", label: "Supplier", type: "select", required: true, col: true, options: (db) => db.suppliers.map((s) => ({ value: s.id, label: s.name })) },
      { k: "itemId", label: "Item", type: "select", required: true, col: true, options: (db) => db.inventory.map((s) => ({ value: s.id, label: s.name })) },
      { k: "qty", label: "Quantity", type: "number", required: true, col: true }, { k: "cost", label: "Total Cost", type: "money", col: true },
      { k: "date", label: "Order Date", type: "date", col: true }, { k: "status", label: "Status", type: "status", options: ["Pending", "Received", "Cancelled"], col: true },
    ],
    defaults: () => ({ date: today(), status: "Pending" }),
    actions: [{ label: "Receive", show: (r) => r.status === "Pending", run: (r, api) => { const it = api.db.inventory.find((i) => i.id === r.itemId); if (it) api.patch("inventory", it.id, { qty: it.qty + Number(r.qty) }); api.patch("purchaseOrders", r.id, { status: "Received", receivedDate: today() }, "Stock Received"); api.toast(`Received ${r.qty} units`); } }],
  },

  blood: {
    key: "blood", coll: "blood", title: "Blood Bank", label: "Blood Unit", prefix: "BU", note: "Inventory record-keeping only. Cross-matching, compatibility and clinical release decisions are never automated.",
    search: ["group", "component", "location", "issueRef"], filters: ["group", "component", "status"], statusField: "status", dateField: "expiry",
    statusOf: (r) => (r.status === "Available" && r.expiry < today() ? "Expired" : r.status),
    fields: [
      { k: "group", label: "Blood Group", type: "select", options: BLOOD, required: true, col: true },
      { k: "component", label: "Component", type: "select", options: ["Whole Blood", "PRBC", "Platelets", "FFP", "Cryoprecipitate"], required: true, col: true },
      { k: "collected", label: "Collection Date", type: "date", col: true }, { k: "expiry", label: "Expiry Date", type: "date", required: true, col: true },
      { k: "status", label: "Status", type: "status", options: ["Available", "Reserved", "Issued", "Expired", "Discarded"], col: true },
      { k: "location", label: "Storage Location", col: true }, { k: "issueRef", label: "Issue / Reservation Ref." },
    ],
    defaults: () => ({ status: "Available", collected: today(), expiry: addDays(35), component: "Whole Blood" }),
    actions: [
      { label: "Reserve", show: (r) => r.status === "Available", run: (r, api, ui) => ui.setCustom(<PromptModal title={`Reserve ${r.id}`} fields={[{ k: "ref", label: "Reference (patient / request no.)" }]} onClose={() => ui.setCustom(null)} onSubmit={(v) => { if (!v.ref) return "Reference required"; api.patch("blood", r.id, { status: "Reserved", issueRef: v.ref }, "Blood Unit Reserved"); }} />) },
      { label: "Issue", show: (r) => ["Available", "Reserved"].includes(r.status), run: (r, api, ui) => ui.setCustom(<PromptModal title={`Record issue ${r.id}`} fields={[{ k: "ref", label: "Issue reference (authorised by medical staff)" }]} initial={{ ref: r.issueRef }} onClose={() => ui.setCustom(null)} onSubmit={(v) => { if (!v.ref) return "Reference required"; api.patch("blood", r.id, { status: "Issued", issueRef: v.ref }, "Blood Unit Issued"); }} />) },
    ],
    headerExtra: (api) => (
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {BLOOD.map((g) => {
          const n = api.db.blood.filter((b) => b.group === g && b.status === "Available" && b.expiry >= today()).length;
          return <div key={g} className={`card p-3 text-center ${n < 2 ? "ring-2 ring-destructive/40" : ""}`}><div className="text-lg font-bold text-destructive">{g}</div><div className="text-xs text-muted-foreground">{n} unit{n === 1 ? "" : "s"}</div>{n < 2 && <div className="text-[10px] font-semibold text-destructive">Low</div>}</div>;
        })}
      </div>
    ),
  },

  ambulances: {
    key: "ambulances", coll: "ambulances", title: "Ambulance Management", label: "Ambulance", prefix: "AMB", yearly: false, width: 2, note: "No GPS or live vehicle tracking — statuses are updated manually by staff.",
    search: ["driver", "reg", "destination"], filters: ["type", "status"], statusField: "status",
    fields: [
      { k: "reg", label: "Vehicle Registration", required: true, col: true }, { k: "type", label: "Vehicle Type", type: "select", options: ["ALS Ambulance", "BLS Ambulance", "Patient Transport"], col: true },
      { k: "driver", label: "Driver Name", required: true, col: true }, { k: "driverPhone", label: "Driver Contact", type: "tel" },
      { k: "status", label: "Availability", type: "status", options: ["Available", "Dispatched", "On Trip", "Maintenance"], col: true },
      { k: "dispatchAt", label: "Dispatch Time", type: "datetime", col: true }, { k: "returnAt", label: "Return Time", type: "datetime" },
      { k: "emergencyId", label: "Linked Emergency Case", type: "select", options: (db) => db.emergency.map((e) => ({ value: e.id, label: `${e.id} · ${e.patientName}` })) },
      { k: "destination", label: "Destination" }, { k: "trips", label: "Total Trips", hideInForm: true, col: true }, { k: "notes", label: "Notes", type: "textarea" },
    ],
    defaults: () => ({ status: "Available", trips: 0 }),
    actions: [
      { label: "Dispatch", show: (r) => r.status === "Available", run: (r, api, ui) => ui.setCustom(<PromptModal title={`Dispatch ${r.id}`} submitLabel="Dispatch" fields={[{ k: "emergencyId", label: "Emergency case", type: "select", options: (db) => db.emergency.map((e) => ({ value: e.id, label: `${e.id} · ${e.patientName}` })) }, { k: "destination", label: "Destination" }]} onClose={() => ui.setCustom(null)} onSubmit={(v) => { if (!v.destination) return "Destination required"; api.patch("ambulances", r.id, { ...v, status: "Dispatched", dispatchAt: nowISO(), returnAt: "" }, "Ambulance Dispatched"); }} />) },
      step("On Trip", ["Dispatched"], "On Trip", "ambulances"),
      { label: "Returned", show: (r) => ["Dispatched", "On Trip"].includes(r.status), run: (r, api) => { api.patch("ambulances", r.id, { status: "Available", returnAt: nowISO(), trips: (r.trips || 0) + 1 }, "Ambulance Returned"); api.toast(`${r.id} available`); } },
    ],
  },

  insurance: {
    key: "insurance", coll: "insurance", title: "Insurance & TPA", label: "Insurance Record", prefix: "INS", note: "No external insurer/TPA integration. Claim statuses are updated manually.",
    search: ["patientId", "provider", "policyNo", "claimNo", "tpa"], filters: ["provider", "status"], statusField: "status", dateField: "submitted",
    fields: [
      pRef(), { k: "provider", label: "Insurance Provider", required: true, col: true }, { k: "policyNo", label: "Policy Number", required: true }, { k: "tpa", label: "TPA Name", col: true },
      { k: "claimNo", label: "Claim Number", col: true }, { k: "admissionId", label: "Admission Ref.", type: "select", options: (db) => db.admissions.map((a) => ({ value: a.id, label: `${a.id} · ${a.patientId}` })) },
      { k: "estimate", label: "Estimated Claim", type: "money", col: true }, { k: "approved", label: "Approved Amount", type: "money", col: true },
      { k: "status", label: "Claim Status", type: "status", options: ["Draft", "Submitted", "Under Review", "Approved", "Partially Approved", "Rejected", "Settled"], col: true },
      { k: "submitted", label: "Submission Date", type: "date" },
      { k: "checklist", label: "Document Checklist", type: "checklist", options: ["Policy copy", "ID proof", "Pre-auth form", "Discharge summary", "Final bill", "Investigation reports"] },
      { k: "notes", label: "Notes", type: "textarea" },
    ],
    defaults: () => ({ status: "Draft", submitted: today(), checklist: [] }),
    validate: (r) => (Number(r.approved || 0) > Number(r.estimate || 0) ? "Approved amount cannot exceed the estimate" : null),
    afterSave: (r, api, isNew, prev) => prev && prev.status !== r.status && api.notify("Insurance Claim Update", `${r.id} → ${r.status}`, "insurance"),
    stats: (all) => [
      { label: "Claims", value: all.length, icon: "shield" },
      { label: "Outstanding", value: all.filter((c) => ["Submitted", "Under Review", "Draft"].includes(c.status)).length, icon: "clock", tone: "amber" },
      { label: "Estimated", value: inr(all.reduce((s, c) => s + Number(c.estimate || 0), 0)), icon: "rupee" },
      { label: "Approved", value: inr(all.reduce((s, c) => s + Number(c.approved || 0), 0)), icon: "check", tone: "green" },
    ],
  },

  refunds: {
    key: "refunds", coll: "refunds", title: "Refund Management", label: "Refund", prefix: "REF", search: ["invoiceId", "patientId", "reason"], filters: ["status", "method"], statusField: "status", dateField: "date",
    fields: [
      { k: "invoiceId", label: "Invoice", type: "select", required: true, col: true, options: (db) => db.invoices.filter((i) => Number(i.paid) > 0).map((i) => ({ value: i.id, label: `${i.id} · paid ₹${i.paid}` })) },
      pRef({ hideInForm: true }), { k: "amount", label: "Refund Amount", type: "money", required: true, col: true }, { k: "reason", label: "Reason", required: true, col: true },
      { k: "date", label: "Request Date", type: "date", col: true }, { k: "requestedBy", label: "Requested By" },
      { k: "status", label: "Status", type: "status", options: ["Requested", "Pending Approval", "Approved", "Rejected", "Processed"], col: true },
      { k: "method", label: "Refund Method", type: "select", options: ["Cash", "UPI", "Card", "Bank Transfer"] }, { k: "notes", label: "Notes", type: "textarea" },
    ],
    defaults: (db, api) => ({ date: today(), status: "Requested", requestedBy: api.session.name, method: "Cash" }),
    compute: (r, db) => ({ ...r, patientId: db.invoices.find((i) => i.id === r.invoiceId)?.patientId || r.patientId }),
    validate: (r, db) => {
      const inv = db.invoices.find((i) => i.id === r.invoiceId);
      if (!inv) return "Invalid invoice";
      const other = db.refunds.filter((x) => x.invoiceId === r.invoiceId && x.id !== r.id && x.status !== "Rejected").reduce((s, x) => s + Number(x.amount), 0);
      if (Number(r.amount) <= 0) return "Refund amount must be greater than zero";
      if (Number(r.amount) + other > Number(inv.paid)) return `Refund exceeds refundable amount (${inr(inv.paid - other)})`;
      return null;
    },
    actions: [step("Approve", ["Requested", "Pending Approval"], "Approved", "refunds"), step("Reject", ["Requested", "Pending Approval"], "Rejected", "refunds"), step("Process", ["Approved"], "Processed", "refunds", () => ({ processedDate: today() }))],
    detailExtra: (r, api) => { const inv = api.db.invoices.find((i) => i.id === r.invoiceId); if (!inv) return null; const c = calcInvoice(inv); return <p className="text-sm">Linked invoice {inv.id}: total {inr(c.total)}, paid {inr(c.paid)}, status {invStatus(inv)}.</p>; },
  },

  discharge: {
    key: "discharge", coll: "discharge", title: "Discharge Summary", label: "Discharge Summary", prefix: "DIS", printTitle: "Discharge Summary",
    search: ["patientId", "admissionId", "diagnosis"], filters: ["status"], statusField: "status", dateField: "dischargeDate",
    fields: [
      { k: "admissionId", label: "Admission", type: "select", required: true, col: true, options: (db) => db.admissions.map((a) => ({ value: a.id, label: `${a.id} · ${a.patientId} · ${a.status}` })) },
      pRef({ hideInForm: true }), dRef("doctorId", "Attending Doctor"),
      { k: "admitDate", label: "Admission Date", type: "date" }, { k: "dischargeDate", label: "Discharge Date", type: "date", col: true },
      { k: "reason", label: "Admission Reason" }, { k: "diagnosis", label: "Diagnosis (by doctor)", col: true },
      { k: "treatment", label: "Treatment Summary", type: "textarea" }, { k: "procedures", label: "Procedures & Investigations", type: "textarea" },
      { k: "medicines", label: "Discharge Medicines (as prescribed)", type: "textarea" }, { k: "instructions", label: "Discharge Instructions", type: "textarea" },
      { k: "followUp", label: "Follow-up Date", type: "date" }, { k: "notes", label: "Doctor Notes", type: "textarea" },
      { k: "status", label: "Status", type: "status", options: ["Draft", "Final"], col: true },
    ],
    defaults: () => ({ status: "Draft", dischargeDate: today() }),
    onChange: (r, k, db) => {
      if (k === "admissionId") { const a = db.admissions.find((x) => x.id === r.admissionId); if (a) return { ...r, patientId: a.patientId, doctorId: a.doctorId, admitDate: a.admitAt.slice(0, 10), reason: a.reason, diagnosis: r.diagnosis || a.prelimDx }; }
    },
    compute: (r, db) => ({ ...r, patientId: db.admissions.find((a) => a.id === r.admissionId)?.patientId || r.patientId }),
    afterSave: (r, api) => {
      if (r.status === "Final") { const a = api.db.admissions.find((x) => x.id === r.admissionId); if (a) dischargeAdmission(api, a); }
      if (r.followUp) {
        const exists = api.db.followups.some((f) => f.sourceId === r.id);
        if (!exists) api.upsert("followups", { id: api.nextId("followups", "FUP"), patientId: r.patientId, doctorId: r.doctorId, prevDate: r.dischargeDate, date: r.followUp, reason: "Post-discharge review", status: "Pending", sourceId: r.id }, false);
      }
    },
    actions: [step("Finalize", ["Draft"], "Final", "discharge")],
  },

  staff: {
    key: "staff", coll: "staff", title: "Staff Management", label: "Staff Member", prefix: "STF", yearly: false, width: 3, search: ["name", "role", "department"], filters: ["role", "department", "status"], statusField: "status",
    fields: [
      { k: "name", label: "Name", required: true, col: true }, { k: "role", label: "Role", type: "select", options: ROLES, required: true, col: true },
      { k: "department", label: "Department", type: "select", options: [...DEPTS, "Administration", "ICU", "Emergency"], col: true },
      { k: "phone", label: "Contact Number", type: "tel", col: true }, { k: "shift", label: "Assigned Shift", type: "select", options: ["Morning", "Evening", "Night"], col: true },
      { k: "status", label: "Employment Status", type: "status", options: ["Active", "On Leave", "Inactive"], col: true },
    ],
    defaults: () => ({ status: "Active", shift: "Morning" }),
    actions: [{ label: "Deactivate", show: (r) => r.status !== "Inactive", run: (r, api) => { api.patch("staff", r.id, { status: "Inactive" }, "Staff Deactivated"); api.toast(`${r.name} deactivated`); } }, { label: "Activate", show: (r) => r.status === "Inactive", run: (r, api) => api.patch("staff", r.id, { status: "Active" }, "Staff Activated") }],
  },
  roster: {
    key: "roster", coll: "roster", title: "Duty Roster", label: "Duty Entry", prefix: "ROS", yearly: false, search: ["staffId", "department"], filters: ["shift", "department", "status"], statusField: "status", dateField: "date", defaultSort: "date",
    fields: [
      { k: "staffId", label: "Staff Member", type: "select", required: true, col: true, options: (db) => db.staff.filter((s) => s.status !== "Inactive").map((s) => ({ value: s.id, label: `${s.name} · ${s.role}` })) },
      { k: "date", label: "Date", type: "date", required: true, col: true }, { k: "shift", label: "Shift", type: "select", options: ["Morning", "Evening", "Night"], required: true, col: true },
      { k: "department", label: "Department", type: "select", options: [...DEPTS, "Administration", "ICU", "Emergency"], col: true },
      { k: "status", label: "Duty Status", type: "status", options: ["Scheduled", "Present", "On Leave", "Absent"], col: true }, { k: "notes", label: "Notes / Leave Reason", type: "textarea" },
    ],
    defaults: () => ({ date: today(), status: "Scheduled", shift: "Morning" }),
    validate: (r, db) => (db.roster.some((x) => x.id !== r.id && x.staffId === r.staffId && x.date === r.date && x.shift === r.shift) ? "This staff member already has this shift on that date" : null),
    actions: [step("Present", ["Scheduled"], "Present", "roster"), step("Leave", ["Scheduled"], "On Leave", "roster")],
    headerExtra: (api) => {
      const days = Array.from({ length: 7 }, (_, i) => addDays(i));
      const st = api.db.staff.filter((s) => s.status !== "Inactive");
      return (
        <div className="card overflow-x-auto p-3">
          <h3 className="mb-2 text-sm font-semibold">Weekly roster</h3>
          <table className="tbl text-xs">
            <thead><tr><th>Staff</th>{days.map((d) => <th key={d}>{fmtDate(d).slice(0, 5)}</th>)}</tr></thead>
            <tbody>{st.map((s) => <tr key={s.id}><td className="whitespace-nowrap font-medium">{s.name}</td>{days.map((d) => { const e = api.db.roster.find((r) => r.staffId === s.id && r.date === d); return <td key={d}>{e ? <span className={`badge tone-${e.status === "On Leave" ? "amber" : "blue"}`}>{e.status === "On Leave" ? "Leave" : e.shift[0]}</span> : <span className="text-muted-foreground">·</span>}</td>; })}</tr>)}</tbody>
          </table>
          <p className="mt-2 text-[11px] text-muted-foreground">M = Morning · E = Evening · N = Night</p>
        </div>
      );
    },
  },

  equipment: {
    key: "equipment", coll: "equipment", title: "Equipment Maintenance", label: "Equipment", prefix: "EQP", yearly: false, width: 3, search: ["name", "category", "department"], filters: ["department", "status"], statusField: "status", dateField: "nextService",
    fields: [
      { k: "name", label: "Equipment Name", required: true, col: true }, { k: "category", label: "Category", col: true }, { k: "department", label: "Department", col: true },
      { k: "serial", label: "Serial Number" }, { k: "purchase", label: "Purchase Date", type: "date" }, { k: "warranty", label: "Warranty Expiry", type: "date" },
      { k: "lastService", label: "Last Maintenance", type: "date", col: true }, { k: "nextService", label: "Next Maintenance", type: "date", col: true },
      { k: "status", label: "Status", type: "status", options: ["Available", "In Use", "Under Maintenance", "Out of Service"], col: true },
    ],
    defaults: () => ({ status: "Available", serial: "SN-XXXX (placeholder)" }),
    actions: [{ label: "Record Service", run: (r, api, ui) => ui.setCustom(<PromptModal title={`Maintenance · ${r.name}`} fields={[{ k: "note", label: "Work done" }, { k: "next", label: "Next service date", type: "date" }]} initial={{ next: addDays(90) }} onClose={() => ui.setCustom(null)} onSubmit={(v) => { if (!v.note) return "Describe work done"; api.patch("equipment", r.id, { lastService: today(), nextService: v.next, status: "Available", history: [...(r.history || []), { date: today(), note: v.note, by: api.session.name }] }, "Maintenance Recorded"); }} />) }],
    detailExtra: (r) => <div><h4 className="mb-1 font-semibold">Maintenance history</h4>{(r.history || []).length ? <ul className="text-xs">{r.history.map((h, i) => <li key={i}>{fmtDate(h.date)} · {h.note} · {h.by}</li>)}</ul> : <p className="text-xs text-muted-foreground">No history recorded in this demo.</p>}</div>,
    headerExtra: (api) => {
      const up = api.db.equipment.filter((e) => daysBetween(today(), e.nextService) <= 14 && e.status !== "Out of Service");
      const un = api.db.equipment.filter((e) => ["Under Maintenance", "Out of Service"].includes(e.status));
      return (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="card p-3"><h3 className="mb-2 text-sm font-semibold">Service due in 14 days ({up.length})</h3>{up.map((e) => <div key={e.id} className="flex justify-between text-xs"><span>{e.name}</span><span className={e.nextService < today() ? "font-semibold text-destructive" : ""}>{fmtDate(e.nextService)}</span></div>)}</div>
          <div className="card p-3"><h3 className="mb-2 text-sm font-semibold">Unavailable equipment ({un.length})</h3>{un.map((e) => <div key={e.id} className="flex justify-between text-xs"><span>{e.name}</span><Badge>{e.status}</Badge></div>)}</div>
        </div>
      );
    },
  },

  expenses: {
    key: "expenses", coll: "expenses", title: "Expenses & Purchases", label: "Expense", prefix: "EXP", search: ["description", "vendor"], filters: ["category", "status"], statusField: "status", dateField: "date", defaultSort: "date",
    fields: [
      { k: "category", label: "Category", type: "select", options: ["Medical Supplies", "Utilities", "Equipment", "Maintenance", "Staff Expenses", "Housekeeping", "Other"], required: true, col: true },
      { k: "description", label: "Description", required: true, col: true }, { k: "amount", label: "Amount", type: "money", required: true, col: true }, { k: "date", label: "Date", type: "date", required: true, col: true },
      { k: "method", label: "Payment Method", type: "select", options: ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"] }, { k: "vendor", label: "Vendor", col: true },
      { k: "status", label: "Approval Status", type: "status", options: ["Pending", "Approved", "Rejected"], col: true },
    ],
    defaults: () => ({ date: today(), status: "Pending" }),
    actions: [step("Approve", ["Pending"], "Approved", "expenses"), step("Reject", ["Pending"], "Rejected", "expenses")],
    stats: (all, db) => {
      const exp = all.filter((e) => e.status !== "Rejected").reduce((s, e) => s + Number(e.amount), 0);
      const rev = db.payments.reduce((s, p) => s + Number(p.amount), 0);
      return [
        { label: "Total Expenses", value: inr(exp), icon: "wallet", tone: "red" },
        { label: "Total Collected Revenue", value: inr(rev), icon: "rupee", tone: "green" },
        { label: "Net (Revenue − Expenses)", value: inr(rev - exp), icon: "chart", tone: rev - exp >= 0 ? "green" : "red" },
        { label: "Pending Approvals", value: all.filter((e) => e.status === "Pending").length, icon: "clock", tone: "amber" },
      ];
    },
  },

  feedback: {
    key: "feedback", coll: "feedback", title: "Patient Feedback", label: "Feedback", prefix: "FDB", search: ["patientId", "text", "department"], filters: ["department", "rating", "status"], statusField: "status", dateField: "date",
    fields: [
      pRef(), { k: "visitRef", label: "Visit Reference", type: "select", options: (db) => db.appointments.map((a) => ({ value: a.id, label: `${a.id} · ${a.patientId}` })) },
      { k: "department", label: "Department", type: "dept", col: true },
      { k: "rating", label: "Rating", type: "select", options: ["5", "4", "3", "2", "1"], required: true, col: true, render: (r) => <span className="text-warning">{"★".repeat(r.rating)}<span className="text-muted">{"★".repeat(5 - r.rating)}</span></span> },
      { k: "text", label: "Feedback", type: "textarea", col: true }, { k: "date", label: "Date", type: "date", col: true },
      { k: "status", label: "Status", type: "status", options: ["New", "Reviewed"], col: true },
    ],
    defaults: () => ({ date: today(), status: "New", rating: "5" }),
    compute: (r) => ({ ...r, rating: Number(r.rating) }),
    actions: [step("Mark Reviewed", ["New"], "Reviewed", "feedback")],
    stats: (all) => {
      const avg = all.length ? all.reduce((s, f) => s + Number(f.rating), 0) / all.length : 0;
      return [
        { label: "Average Rating", value: avg.toFixed(1) + " / 5", icon: "star", tone: "amber" },
        { label: "Total Feedback", value: all.length, icon: "users" },
        { label: "Awaiting Review", value: all.filter((f) => f.status === "New").length, icon: "clock", tone: "amber" },
        { label: "Low Ratings (≤2)", value: all.filter((f) => f.rating <= 2).length, icon: "x", tone: "red" },
      ];
    },
  },

  followups: {
    key: "followups", coll: "followups", title: "Follow-up Management", label: "Follow-up", prefix: "FUP", note: "Reminders are shown inside this app only. No SMS, WhatsApp, email or calls are sent.",
    search: ["patientId", "doctorId", "reason"], filters: ["doctorId", "status"], statusField: "status", dateField: "date", defaultSort: "date",
    statusOf: (r) => fupStatus(r),
    fields: [
      pRef(), dRef("doctorId", "Doctor", { required: true }), { k: "prevDate", label: "Previous Visit", type: "date", col: true }, { k: "date", label: "Follow-up Date", type: "date", required: true, col: true },
      { k: "reason", label: "Reason", col: true }, { k: "status", label: "Status", type: "status", options: ["Pending", "Completed", "Cancelled", "Overdue", "Due Today", "Upcoming"], col: true },
    ],
    defaults: () => ({ status: "Pending", date: addDays(7), prevDate: today() }),
    actions: [
      { label: "Book", show: (r) => !["Completed", "Cancelled"].includes(r.status), run: (r, api) => { const d = api.db.doctors.find((x) => x.id === r.doctorId); const n = api.db.appointments.filter((a) => a.doctorId === r.doctorId && a.date === r.date).length; const id = api.nextId("appointments", "APT"); api.upsert("appointments", { id, patientId: r.patientId, doctorId: r.doctorId, department: d?.department, date: r.date < today() ? today() : r.date, time: "11:00", type: "Follow-up", reason: r.reason, token: n + 1, fee: d?.fee || 0, status: "Scheduled" }, "Appointment"); api.patch("followups", r.id, { appointmentId: id }); api.toast(`Appointment ${id} booked`); } },
      step("Complete", ["Pending"], "Completed", "followups"),
    ],
    stats: (all) => [
      { label: "Overdue", value: all.filter((f) => fupStatus(f) === "Overdue").length, icon: "clock", tone: "red" },
      { label: "Due Today", value: all.filter((f) => fupStatus(f) === "Due Today").length, icon: "bell", tone: "amber" },
      { label: "Upcoming", value: all.filter((f) => fupStatus(f) === "Upcoming").length, icon: "calendar" },
      { label: "Completed", value: all.filter((f) => f.status === "Completed").length, icon: "check", tone: "green" },
    ],
  },

  documents: {
    key: "documents", coll: "documents", title: "Document Centre", label: "Document", prefix: "DOC", note: "Sample metadata and demo content only. No files are uploaded or stored externally.",
    search: ["title", "patientId"], filters: ["category", "fileType"], dateField: "date", defaultSort: "date",
    fields: [
      { k: "title", label: "Document Title", required: true, col: true }, pRef(),
      { k: "category", label: "Category", type: "select", required: true, col: true, options: ["Patient Documents", "Lab Reports", "Prescriptions", "Consent Forms", "Admission Documents", "Insurance Documents", "Discharge Summaries", "Billing Documents"] },
      { k: "date", label: "Document Date", type: "date", col: true }, { k: "fileType", label: "File Type", type: "select", options: ["PDF", "Image", "Text"], col: true },
      { k: "content", label: "Demo Content", type: "textarea" },
    ],
    defaults: () => ({ date: today(), fileType: "PDF" }),
  },

  audit: {
    key: "audit", coll: "audit", title: "Audit Trail", label: "Activity", creatable: false, editable: false, deletable: false, defaultSort: "at",
    note: "Browser-based audit records are stored in localStorage. They can be edited or cleared by anyone with access to this browser and are not tamper-proof.",
    search: ["user", "action", "type", "recordId", "desc"], filters: ["user", "type", "action"], dateField: "at",
    fields: [
      { k: "user", label: "User", type: "select", col: true, options: (db) => [...new Set(db.audit.map((a) => a.user))] },
      { k: "role", label: "Role", col: true },
      { k: "action", label: "Action", type: "select", col: true, options: (db) => [...new Set(db.audit.map((a) => a.action))].sort() },
      { k: "type", label: "Record Type", type: "select", col: true, options: (db) => [...new Set(db.audit.map((a) => a.type))].sort() },
      { k: "recordId", label: "Record ID", col: true }, { k: "at", label: "Date & Time", type: "datetime", col: true }, { k: "desc", label: "Description" },
    ],
  },
};
