// @ts-nocheck
import { pad, today, addDays, rng, ageFrom, nowISO } from "./util";

export const ROLES = [
  "Administrator", "Receptionist", "Doctor", "Nurse", "Billing Staff", "Laboratory Staff", "Pharmacist", "Inventory Manager",
];
export const DEPTS = [
  "General Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Gynecology", "Dermatology", "ENT", "General Surgery", "Neurology", "Ophthalmology",
];
export const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const WARDS = ["General Ward A", "Semi-Private", "Private", "ICU"];
export const OT_ROOMS = ["OT-1", "OT-2", "OT-3"];
export const LAB_CATS = ["Blood Test", "Urine Test", "Blood Sugar", "Lipid Profile", "Thyroid Profile", "ECG", "X-Ray", "Ultrasound"];

const DOCS = [
  ["Dr. Arvind Kulkarni", "MBBS, MD (General Medicine)", "Internal Medicine"],
  ["Dr. Sneha Raghavan", "MBBS, MD, DM (Cardiology)", "Interventional Cardiology"],
  ["Dr. Vivek Hegde", "MBBS, MS (Orthopaedics)", "Joint Replacement"],
  ["Dr. Farah Siddiqui", "MBBS, MD (Paediatrics)", "Neonatology"],
  ["Dr. Lalitha Prasad", "MBBS, MS (OBG)", "Obstetrics & Gynaecology"],
  ["Dr. Rohan Bhat", "MBBS, MD (Dermatology)", "Clinical Dermatology"],
  ["Dr. Meenakshi Subramanian", "MBBS, MS (ENT)", "Otorhinolaryngology"],
  ["Dr. Karthik Narayan", "MBBS, MS (General Surgery)", "Laparoscopic Surgery"],
  ["Dr. Imran Qureshi", "MBBS, MD, DM (Neurology)", "Clinical Neurology"],
  ["Dr. Shreya Kapoor", "MBBS, MS (Ophthalmology)", "Cataract & Retina"],
];
const FM = ["Rahul", "Amit", "Suresh", "Vikram", "Arjun", "Manoj", "Rajesh", "Kiran", "Deepak", "Sanjay", "Prakash", "Naveen", "Harish", "Ganesh", "Mohan"];
const FF = ["Priya", "Anjali", "Kavya", "Sunita", "Meera", "Lakshmi", "Divya", "Pooja", "Rekha", "Swati", "Asha", "Nandini", "Shalini", "Geeta", "Radha"];
const LN = ["Sharma", "Reddy", "Patel", "Nair", "Iyer", "Kumar", "Singh", "Gowda", "Rao", "Verma", "Joshi", "Menon", "Das", "Pillai", "Shetty"];
const CITIES = [["Bengaluru", "Karnataka", "5600"], ["Mysuru", "Karnataka", "5700"], ["Hyderabad", "Telangana", "5000"], ["Chennai", "Tamil Nadu", "6000"], ["Pune", "Maharashtra", "4110"]];
const MEDS = [
  ["Paracetamol", "650 mg", "Analgesic"], ["Amoxicillin", "500 mg", "Antibiotic"], ["Pantoprazole", "40 mg", "Antacid"], ["Cetirizine", "10 mg", "Antihistamine"],
  ["Metformin", "500 mg", "Antidiabetic"], ["Amlodipine", "5 mg", "Antihypertensive"], ["Atorvastatin", "10 mg", "Statin"], ["Vitamin D3", "60000 IU", "Supplement"],
  ["Azithromycin", "500 mg", "Antibiotic"], ["Ibuprofen", "400 mg", "NSAID"], ["ORS Sachet", "21 g", "Electrolyte"], ["Calcium Carbonate", "500 mg", "Supplement"],
  ["Montelukast", "10 mg", "Anti-asthmatic"], ["Omeprazole", "20 mg", "Antacid"], ["Multivitamin", "1 tab", "Supplement"],
];
const DX = ["Viral fever", "Hypertension – review", "Type 2 diabetes – review", "Acute gastritis", "Allergic rhinitis", "Lower back pain", "Upper respiratory infection", "Migraine", "Knee osteoarthritis", "Contact dermatitis"];
const TESTS = [["Complete Blood Count", "Blood Test"], ["Urine Routine", "Urine Test"], ["Fasting Blood Sugar", "Blood Sugar"], ["HbA1c", "Blood Sugar"], ["Lipid Profile", "Lipid Profile"], ["TSH / T3 / T4", "Thyroid Profile"], ["12-Lead ECG", "ECG"], ["Chest X-Ray PA", "X-Ray"], ["Abdomen USG", "Ultrasound"]];

export const DEFAULT_SETTINGS = {
  hospitalName: "Janata Raja Multi-speciality Hospital",
  logoText: "JR",
  address: "",
  phone: "",
  email: "",
  regNo: "",
  prescriptionHeader: "Out-Patient Prescription",
  invoiceHeader: "Hospital Bill / Invoice",
  defaultFee: 500,
  currency: "INR (₹)",
  dateFormat: "DD/MM/YYYY",
  footerText: "Computer-generated document from a frontend demo system. Not valid for clinical or legal use.",
  taxPct: 0,
};

export function makeSeed() {
  const r = rng(20260310);
  const int = (a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (a) => a[Math.floor(r() * a.length)];
  const Y = new Date().getFullYear();
  const id = (p, n) => `${p}-${Y}-${pad(n)}`;
  const T = today();
  const phone = () => `9${int(10000, 99999)}${int(10000, 99999)}`;
  const at = (date, hm) => new Date(`${date}T${hm}:00`).toISOString();

  const doctors = DOCS.map((d, i) => ({
    id: `DOC-${pad(i + 1, 3)}`, name: d[0], qualification: d[1], specialization: d[2], department: DEPTS[i], phone: phone(),
    fee: [500, 800, 700, 600, 700, 600, 500, 800, 900, 600][i], timings: i % 2 ? "10:00 - 14:00" : "09:00 - 13:00",
    availability: i === 5 ? "On Leave" : i % 3 === 0 ? "In OPD" : "Available", experience: int(6, 24), notes: "",
  }));
  const departments = DEPTS.map((name, i) => ({ id: `DEP-${pad(i + 1, 2)}`, name, head: doctors[i].id, floor: `Floor ${1 + (i % 4)}`, status: "Active", description: `${name} out-patient and in-patient services` }));

  const patients = Array.from({ length: 30 }, (_, i) => {
    const female = i % 2 === 1;
    const name = `${female ? FF[i % 15] : FM[i % 15]} ${LN[(i * 7) % 15]}`;
    const dob = `${int(1952, 2019)}-${pad(int(1, 12), 2)}-${pad(int(1, 28), 2)}`;
    const c = CITIES[i % 5];
    return {
      id: id("JRH", i + 1), name, phone: phone(), altPhone: i % 3 ? "" : phone(), dob, age: ageFrom(dob), gender: female ? "Female" : "Male",
      bloodGroup: BLOOD[i % 8], address: `${int(1, 300)}, ${pick(["MG Road", "Gandhi Nagar", "Main Street", "Temple Road", "Station Road"])}`,
      city: c[0], state: c[1], pin: c[2] + pad(int(1, 99), 2), emergencyName: `${pick(FM)} ${LN[(i * 7) % 15]}`, emergencyPhone: phone(),
      allergies: i % 5 === 0 ? "Penicillin" : i % 7 === 0 ? "Sulfa drugs" : "None known", conditions: i % 4 === 0 ? "Hypertension" : i % 6 === 0 ? "Type 2 Diabetes" : "None",
      regDate: i < 3 ? T : addDays(-int(2, 150)), regType: pick(["OPD", "Walk-in", "Referral", "Emergency"]), referredBy: i % 4 === 2 ? "Self" : "",
      notes: "", status: "Active", doctorId: doctors[i % 10].id, lastVisit: addDays(-int(0, 30)),
    };
  });

  const qStat = ["Completed", "Completed", "Completed", "In Consultation", "In Consultation", "Waiting", "Waiting", "Waiting", "Checked In", "Checked In", "Scheduled", "Scheduled", "Scheduled", "Cancelled", "No Show"];
  const tokens = {};
  const appointments = Array.from({ length: 25 }, (_, i) => {
    const todayAppt = i < 15;
    const doc = doctors[i % 5];
    const date = todayAppt ? T : addDays(i < 20 ? -int(1, 12) : int(1, 7));
    const k = doc.id + date;
    tokens[k] = (tokens[k] || 0) + 1;
    const mins = 9 * 60 + Math.floor(i / 5) * 20 + (i % 5) * 4;
    return {
      id: id("APT", i + 1), patientId: patients[i].id, doctorId: doc.id, department: doc.department, date,
      time: `${pad(Math.floor(mins / 60), 2)}:${pad(mins % 60, 2)}`, type: i % 4 === 0 ? "Follow-up" : "New Consultation",
      reason: pick(["Fever and body ache", "BP review", "Chest discomfort", "Knee pain", "Skin rash", "Routine check-up", "Ear pain", "Headache"]),
      token: tokens[k], fee: doc.fee, status: todayAppt ? qStat[i] : date < T ? "Completed" : "Scheduled", arrivedAt: todayAppt && i < 10 ? at(T, "08:50") : "",
    };
  });

  const consultations = appointments.filter((a) => a.status === "Completed").slice(0, 6).map((a, i) => ({
    id: id("CON", i + 1), appointmentId: a.id, patientId: a.patientId, doctorId: a.doctorId, date: a.date, complaint: a.reason,
    symptoms: "As reported by patient", findings: "Recorded by consulting doctor", diagnosis: DX[i], treatment: "As per prescription",
    investigations: i % 2 ? "CBC" : "", followUp: addDays(7, a.date), status: "Completed",
    vitals: { bp: "124/82", pulse: 78, temp: 98.6, spo2: 98, weight: 68, height: 166 },
  }));

  const prescriptions = Array.from({ length: 20 }, (_, i) => {
    const p = patients[i];
    const m1 = MEDS[i % 15], m2 = MEDS[(i + 4) % 15];
    return {
      id: id("PRS", i + 1), patientId: p.id, doctorId: p.doctorId, appointmentId: i < 6 ? consultations[i]?.appointmentId || "" : "",
      date: addDays(-int(0, 40)), symptoms: "Fever, fatigue", findings: "Clinical findings noted by doctor", diagnosis: DX[i % 10],
      vitals: `BP ${int(110, 140)}/${int(70, 90)} mmHg, Pulse ${int(66, 92)}/min, Temp ${98 + int(0, 2)}°F`,
      medicines: [
        { name: m1[0], strength: m1[1], dosage: "1 tab", frequency: "1-0-1", duration: "5 days", qty: 10, food: "After Food" },
        { name: m2[0], strength: m2[1], dosage: "1 tab", frequency: "0-0-1", duration: "7 days", qty: 7, food: "After Food" },
      ],
      instructions: "Plenty of fluids. Review if symptoms persist.", investigations: i % 3 === 0 ? "CBC, Urine Routine" : "",
      followUp: addDays(int(5, 14)), notes: "", status: i === 19 ? "Draft" : "Final",
    };
  });

  const vitals = Array.from({ length: 20 }, (_, i) => ({
    id: id("VIT", i + 1), patientId: patients[i % 15].id, date: addDays(-int(0, 30)), bp: `${int(108, 148)}/${int(68, 94)}`, pulse: int(62, 98),
    temp: (97.6 + r() * 2.4).toFixed(1), weight: int(14, 92), height: int(95, 182), spo2: int(94, 100), recordedBy: pick(["Nurse Asha", "Nurse Divya", "Nurse Kiran"]),
    symptoms: pick(["Fever", "Cough", "None", "Headache", "Body ache"]), notes: "", consultationId: "",
  }));

  const labStat = ["Requested", "Sample Collected", "Processing", "Completed", "Completed", "Completed", "Cancelled"];
  const lab = Array.from({ length: 15 }, (_, i) => {
    const t = TESTS[i % TESTS.length];
    const st = labStat[i % 7];
    const rq = addDays(-int(0, 10));
    return {
      id: id("LAB", i + 1), patientId: patients[i + 2].id, doctorId: patients[i + 2].doctorId, testName: t[0], category: t[1], requestDate: rq,
      sampleDate: st === "Requested" || st === "Cancelled" ? "" : rq, reportDate: st === "Completed" ? addDays(1, rq) : "", status: st,
      result: st === "Completed" ? "Values within demo reference range (fictional)" : "", remarks: "", charge: [350, 150, 120, 500, 600, 700, 400, 550, 1200][i % 9],
    };
  });

  const beds = [];
  [["General Ward A", "Floor 1", "General", [101, 102, 103, 104]], ["Semi-Private", "Floor 2", "Semi-Private", [201, 202]], ["Private", "Floor 2", "Private", [203, 204, 205]], ["ICU", "Floor 3", "ICU", [301, 302, 303]]].forEach(
    ([ward, floor, type, nums]) => nums.forEach((n) => beds.push({ id: `BED-${n}`, ward, floor, type, status: "Available", patientId: "", admissionId: "", rate: { General: 1200, "Semi-Private": 2500, Private: 4000, ICU: 9000 }[type] })),
  );
  beds.find((b) => b.id === "BED-104").status = "Maintenance";
  beds.find((b) => b.id === "BED-202").status = "Reserved";

  const admBeds = ["BED-101", "BED-102", "BED-203", "BED-301", "BED-302", "BED-201"];
  const admissions = admBeds.map((bed, i) => {
    const p = patients[20 + i];
    const doc = doctors[[0, 2, 7, 1, 8, 4][i]];
    const active = i < 5;
    const b = beds.find((x) => x.id === bed);
    if (active) {
      b.status = "Occupied"; b.patientId = p.id; b.admissionId = id("ADM", i + 1); p.status = "Admitted";
    }
    return {
      id: id("ADM", i + 1), patientId: p.id, doctorId: doc.id, department: doc.department, admitAt: at(addDays(-int(1, 6)), "11:30"), ward: b.ward, bedId: bed,
      reason: pick(["Observation", "Post-operative care", "Fever with dehydration", "Chest pain evaluation", "Planned surgery"]),
      prelimDx: DX[i], expectedDischarge: addDays(int(1, 5)), status: active ? (i === 3 ? "Critical Care" : "Admitted") : "Discharged", notes: "",
      dischargeDate: active ? "" : addDays(-1),
    };
  });

  const emergency = Array.from({ length: 5 }, (_, i) => ({
    id: id("EMR", i + 1), patientId: i < 3 ? patients[25 + i].id : "", patientName: i < 3 ? patients[25 + i].name : "Unknown Patient",
    arrivalAt: new Date(Date.now() - (i + 1) * 47 * 60000).toISOString(), contact: i < 3 ? patients[25 + i].phone : "",
    complaint: ["Road traffic injury", "Breathlessness", "High fever", "Abdominal pain", "Fall from height"][i], priority: ["Critical", "High", "Normal", "High", "Critical"][i],
    doctorId: doctors[[7, 1, 0, 7, 2][i]].id, department: ["General Surgery", "Cardiology", "General Medicine", "General Surgery", "Orthopedics"][i],
    status: ["Under Treatment", "Under Assessment", "Arrived", "Transferred", "Under Treatment"][i], notes: "",
  }));

  const ot = Array.from({ length: 5 }, (_, i) => ({
    id: id("OT", i + 1), patientId: admissions[i % 5].patientId, admissionId: admissions[i % 5].id, doctorId: doctors[[7, 2, 7, 4, 9][i]].id,
    department: ["General Surgery", "Orthopedics", "General Surgery", "Gynecology", "Ophthalmology"][i], room: OT_ROOMS[i % 3], date: addDays(i < 3 ? 0 : i - 2),
    start: ["09:00", "10:00", "12:00", "09:30", "11:00"][i], end: ["10:30", "12:30", "13:30", "11:00", "12:00"][i],
    procedure: ["Laparoscopic Appendectomy", "Total Knee Replacement", "Hernia Repair", "Caesarean Section", "Cataract Surgery"][i],
    status: ["Completed", "In Progress", "Scheduled", "Scheduled", "Preparation"][i], notes: "",
  }));

  const suppliers = [
    { id: "SUP-001", name: "MedLine Distributors (Demo)", contact: "Sales Desk", phone: phone(), category: "Pharmaceuticals", status: "Active" },
    { id: "SUP-002", name: "CareSurg Supplies (Demo)", contact: "Order Desk", phone: phone(), category: "Surgical", status: "Active" },
    { id: "SUP-003", name: "LabChem India (Demo)", contact: "Accounts", phone: phone(), category: "Lab Consumables", status: "Active" },
    { id: "SUP-004", name: "CleanPro Services (Demo)", contact: "Manager", phone: phone(), category: "Housekeeping", status: "Active" },
  ];
  const medicines = MEDS.map((m, i) => ({
    id: `MED-${pad(i + 1, 3)}`, name: m[0], category: m[2], strength: m[1], batch: `B${Y % 100}${pad(int(100, 999), 3)}`,
    expiry: i % 6 === 2 ? addDays(int(10, 50)) : addDays(int(150, 700)), stock: i % 5 === 1 ? int(5, 18) : int(60, 400), price: int(2, 40),
    supplierId: "SUP-001", reorder: 25,
  }));
  const inventory = [
    ["Surgical Gloves (box)", "Medical Supplies", 40], ["Disposable Syringes 5ml", "Medical Supplies", 600], ["Face Masks (box)", "Medical Supplies", 8], ["IV Cannula 20G", "Medical Supplies", 150],
    ["Printer Paper (ream)", "Non-medical Supplies", 30], ["Bed Linen Set", "Non-medical Supplies", 6], ["EDTA Vacutainer", "Lab Consumables", 220], ["Glucose Test Strips", "Lab Consumables", 12],
    ["Pulse Oximeter", "Medical Equipment", 9], ["Wheelchair", "Medical Equipment", 4],
  ].map(([name, cat, qty], i) => ({ id: `INV-ITM-${pad(i + 1, 3)}`, name, category: cat, qty, unit: "units", reorder: cat === "Medical Equipment" ? 3 : 20, cost: int(50, 900), supplierId: suppliers[i % 4].id }));
  const purchaseOrders = [
    { id: `PO-${Y}-0001`, supplierId: "SUP-002", itemId: "INV-ITM-003", qty: 50, cost: 9000, date: addDays(-3), status: "Pending" },
    { id: `PO-${Y}-0002`, supplierId: "SUP-003", itemId: "INV-ITM-008", qty: 40, cost: 14000, date: addDays(-6), status: "Received" },
    { id: `PO-${Y}-0003`, supplierId: "SUP-004", itemId: "INV-ITM-006", qty: 30, cost: 21000, date: addDays(-1), status: "Pending" },
  ];
  const blood = ["O+", "A+", "B+", "AB+", "O-", "B+"].map((g, i) => ({
    id: `BU-${Y}-${pad(i + 1)}`, group: g, component: ["Whole Blood", "PRBC", "Platelets", "FFP", "PRBC", "Whole Blood"][i], collected: addDays(-int(2, 20)),
    expiry: i === 2 ? addDays(2) : addDays(int(10, 30)), status: i === 4 ? "Reserved" : "Available", location: `Fridge ${1 + (i % 2)}`, issueRef: "",
  }));
  const ambulances = ["ALS Ambulance", "BLS Ambulance", "BLS Ambulance", "Patient Transport"].map((t, i) => ({
    id: `AMB-${pad(i + 1, 2)}`, reg: "KA-XX-XXXX (placeholder)", driver: `${FM[i + 3]} ${LN[i + 5]}`, driverPhone: phone(), type: t,
    status: ["Available", "Dispatched", "Available", "Maintenance"][i], dispatchAt: i === 1 ? emergency[0].arrivalAt : "", returnAt: "", emergencyId: i === 1 ? emergency[0].id : "",
    destination: i === 1 ? "Scene pickup" : "", notes: "", trips: [2, 5, 1, 0][i],
  }));

  const invoices = Array.from({ length: 20 }, (_, i) => {
    const p = patients[i];
    const items = [{ desc: "Consultation fee", category: "Consultation", amount: doctors[i % 10].fee }];
    if (i % 2 === 0) items.push({ desc: "Lab investigations", category: "Lab", amount: int(3, 12) * 100 });
    if (i % 3 === 0) items.push({ desc: "Pharmacy", category: "Medicine", amount: int(2, 9) * 100 });
    if (i % 7 === 0) items.push({ desc: "Dressing / procedure", category: "Procedure", amount: 800 });
    const total = items.reduce((s, x) => s + x.amount, 0);
    const mode = i % 4;
    const paid = mode === 0 || mode === 1 ? total : mode === 2 ? Math.round(total / 2) : 0;
    return {
      id: id("INV", i + 1), patientId: p.id, appointmentId: appointments[i]?.id || "", date: i < 8 ? T : addDays(-int(1, 25)), items, discount: i % 5 === 0 ? 100 : 0,
      taxPct: 0, paid: Math.max(0, paid - (i % 5 === 0 && paid === total ? 100 : 0)), method: paid ? pick(["Cash", "UPI", "Card"]) : "", payDate: paid ? T : "", status: i === 19 ? "Cancelled" : "Active",
    };
  });
  const payments = invoices.filter((v) => v.paid > 0).map((v, i) => ({ id: `PAY-${Y}-${pad(i + 1)}`, invoiceId: v.id, patientId: v.patientId, amount: v.paid, method: v.method, date: v.date }));

  const insurance = Array.from({ length: 8 }, (_, i) => ({
    id: `INS-${Y}-${pad(i + 1)}`, patientId: patients[20 + i].id, provider: pick(["Star Health (demo)", "HDFC Ergo (demo)", "ICICI Lombard (demo)", "Niva Bupa (demo)"]),
    policyNo: `POL-${int(100000, 999999)}`, tpa: pick(["Medi Assist (demo)", "Paramount TPA (demo)", "Vidal TPA (demo)"]), claimNo: i < 6 ? `CLM-${int(10000, 99999)}` : "",
    admissionId: admissions[i % 6].id, estimate: int(20, 150) * 1000, approved: i % 3 === 0 ? int(15, 80) * 1000 : 0,
    status: ["Draft", "Submitted", "Under Review", "Approved", "Partially Approved", "Rejected", "Settled", "Submitted"][i], submitted: addDays(-int(1, 20)),
    checklist: ["Policy copy", "ID proof"].concat(i % 2 ? ["Pre-auth form"] : []), notes: "",
  }));
  const refunds = [
    { id: `REF-${Y}-0001`, invoiceId: invoices[0].id, patientId: invoices[0].patientId, amount: 200, reason: "Duplicate lab charge", date: addDays(-2), requestedBy: "Billing Desk", status: "Approved", method: "Cash", notes: "" },
    { id: `REF-${Y}-0002`, invoiceId: invoices[4].id, patientId: invoices[4].patientId, amount: 300, reason: "Test cancelled", date: addDays(-1), requestedBy: "Billing Desk", status: "Pending Approval", method: "UPI", notes: "" },
    { id: `REF-${Y}-0003`, invoiceId: invoices[8].id, patientId: invoices[8].patientId, amount: 150, reason: "Overcharge", date: T, requestedBy: "Reception", status: "Requested", method: "Cash", notes: "" },
  ];
  const dAdm = admissions[5];
  const discharge = [{
    id: `DIS-${Y}-0001`, admissionId: dAdm.id, patientId: dAdm.patientId, doctorId: dAdm.doctorId, admitDate: dAdm.admitAt.slice(0, 10), dischargeDate: dAdm.dischargeDate,
    reason: dAdm.reason, diagnosis: dAdm.prelimDx, treatment: "Treated conservatively as documented by attending doctor.", procedures: "CBC, LFT",
    medicines: "As per discharge prescription", instructions: "Rest, adequate hydration, review in OPD.", followUp: addDays(6), notes: "", status: "Final",
  }];

  const staffRoles = ["Nurse", "Nurse", "Nurse", "Receptionist", "Billing Staff", "Laboratory Staff", "Pharmacist", "Inventory Manager", "Nurse", "Receptionist"];
  const staff = staffRoles.map((role, i) => ({
    id: `STF-${pad(i + 1, 3)}`, name: `${role === "Nurse" ? FF[i + 2] : i % 2 ? FF[i] : FM[i]} ${LN[(i * 3) % 15]}`, role, department: role === "Nurse" ? DEPTS[i % 4] : "Administration",
    phone: phone(), status: i === 9 ? "Inactive" : "Active", shift: ["Morning", "Evening", "Night"][i % 3],
  }));
  const roster = [];
  for (let d = 0; d < 7; d++) staff.slice(0, 6).forEach((s, j) => (d + j) % 3 !== 2 && roster.length < 24 && roster.push({ id: `ROS-${pad(roster.length + 1)}`, staffId: s.id, date: addDays(d), shift: ["Morning", "Evening", "Night"][(d + j) % 3], department: s.department, status: d === 2 && j === 1 ? "On Leave" : "Scheduled", notes: "" }));

  const equipment = [["ECG Machine", "Diagnostic"], ["Ventilator", "Critical Care"], ["Defibrillator", "Critical Care"], ["X-Ray Unit", "Radiology"], ["Ultrasound Scanner", "Radiology"], ["Infusion Pump", "Critical Care"], ["Autoclave", "Sterilization"], ["Patient Monitor", "Monitoring"], ["Anaesthesia Workstation", "OT"], ["Slit Lamp", "Ophthalmic"]].map(
    ([name, cat], i) => ({
      id: `EQP-${pad(i + 1, 3)}`, name, category: cat, department: ["Cardiology", "ICU", "Emergency", "Radiology", "Radiology", "ICU", "OT", "ICU", "OT", "Ophthalmology"][i], serial: "SN-XXXX (placeholder)",
      purchase: addDays(-int(300, 1500)), warranty: addDays(int(-100, 700)), lastService: addDays(-int(20, 160)), nextService: addDays(int(-5, 60)),
      status: ["In Use", "In Use", "Available", "Under Maintenance", "Available", "In Use", "Available", "In Use", "Available", "Out of Service"][i], history: [],
    }),
  );
  const expenses = Array.from({ length: 10 }, (_, i) => ({
    id: `EXP-${Y}-${pad(i + 1)}`, category: ["Medical Supplies", "Utilities", "Equipment", "Maintenance", "Staff Expenses", "Housekeeping", "Other", "Utilities", "Medical Supplies", "Maintenance"][i],
    description: ["Surgical consumables", "Electricity bill", "Infusion pump purchase", "AC servicing", "Staff refreshments", "Cleaning chemicals", "Stationery", "Water bill", "Lab reagents", "Lift AMC"][i],
    amount: int(20, 400) * 100, date: addDays(-int(0, 28)), method: pick(["Bank Transfer", "UPI", "Cash", "Cheque"]), vendor: suppliers[i % 4].name, status: i % 4 === 3 ? "Pending" : "Approved",
  }));
  const feedback = Array.from({ length: 10 }, (_, i) => ({
    id: `FDB-${Y}-${pad(i + 1)}`, patientId: patients[i].id, visitRef: appointments[i].id, department: appointments[i].department, rating: [5, 4, 5, 3, 4, 2, 5, 4, 3, 5][i],
    text: ["Very caring staff.", "Short waiting time.", "Doctor explained clearly.", "Billing took long.", "Clean facility.", "Waited over an hour.", "Excellent nursing care.", "Good experience.", "Parking was difficult.", "Thank you!"][i],
    date: addDays(-int(0, 20)), status: i % 3 === 0 ? "Reviewed" : "New",
  }));
  const followups = Array.from({ length: 10 }, (_, i) => ({
    id: `FUP-${Y}-${pad(i + 1)}`, patientId: patients[i + 5].id, doctorId: patients[i + 5].doctorId, prevDate: addDays(-int(7, 20)), date: addDays([-3, -1, 0, 1, 2, 4, 6, 9, -6, 12][i]),
    reason: pick(["Review lab results", "BP monitoring", "Post-procedure review", "Medication review", "Wound check"]), status: i === 8 ? "Completed" : "Pending",
  }));
  const nursing = Array.from({ length: 8 }, (_, i) => {
    const a = admissions[i % 5];
    return {
      id: `NUR-${Y}-${pad(i + 1)}`, patientId: a.patientId, admissionId: a.id, bedId: a.bedId, kind: i % 2 ? "Care Task" : "Medication",
      task: ["Administer IV fluids as charted", "Record 4-hourly vitals", "Oral medication as per order", "Wound dressing check", "Injection as per order", "Ambulation assistance", "Nebulisation as per order", "Diet chart review"][i],
      orderRef: i % 2 ? "" : prescriptions[i].id, scheduled: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"][i], status: ["Administered", "Pending", "Delayed", "Pending", "Administered", "Pending", "Not Administered", "Pending"][i],
      recordedBy: i % 3 ? "Nurse Asha" : "Nurse Divya", shift: ["Morning", "Evening", "Night"][i % 3], notes: "",
    };
  });
  const documents = [
    ["Aadhaar copy (demo)", "Patient Documents"], ["CBC Report", "Lab Reports"], ["OPD Prescription", "Prescriptions"], ["Surgery consent", "Consent Forms"], ["Admission form", "Admission Documents"],
    ["Pre-auth request", "Insurance Documents"], ["Discharge summary", "Discharge Summaries"], ["Final bill", "Billing Documents"], ["Referral letter", "Patient Documents"], ["X-Ray report", "Lab Reports"],
  ].map(([title, cat], i) => ({ id: `DOC-${Y}-${pad(i + 1)}`, title, patientId: patients[20 + (i % 6)].id, category: cat, date: addDays(-int(0, 30)), fileType: i % 3 ? "PDF" : "Image", content: `Sample demo content for “${title}”. No real document is stored.` }));
  const dispensing = [
    { id: `DSP-${Y}-0001`, medicineId: "MED-001", patientId: patients[0].id, qty: 10, date: T, by: "Pharmacist" },
    { id: `DSP-${Y}-0002`, medicineId: "MED-003", patientId: patients[3].id, qty: 14, date: addDays(-1), by: "Pharmacist" },
  ];
  const n = (type, title, link, i) => ({ id: `NTF-${pad(i)}`, type, title, link, at: new Date(Date.now() - i * 900000).toISOString(), read: i > 7 });
  const notifications = [
    n("New Patient Registration", `${patients[0].name} registered (${patients[0].id})`, "patients", 1),
    n("Patient Waiting", "3 patients waiting in OPD queue", "queue", 2),
    n("Pending Lab Report", `${lab[2].testName} for ${lab[2].patientId} is processing`, "lab", 3),
    n("Low Medicine Stock", `${medicines[1].name} below reorder level`, "pharmacy", 4),
    n("Medicine Near Expiry", `${medicines[2].name} batch nearing expiry`, "pharmacy", 5),
    n("Equipment Maintenance", "X-Ray Unit under maintenance", "equipment", 6),
    n("Pending Invoice", `${invoices[3].id} awaiting payment`, "billing", 7),
    n("Insurance Claim Update", `${insurance[2].id} under review`, "insurance", 8),
    n("Follow-up Due", "Follow-ups due today", "followups", 9),
    n("Upcoming OT Schedule", `${ot[2].procedure} today in ${ot[2].room}`, "ot", 10),
    n("Upcoming Appointment", `${appointments[10].id} at ${appointments[10].time}`, "appointments", 11),
  ];
  const audit = [{ id: "ACT-000001", user: "system", role: "System", action: "Demo Data Initialised", type: "System", recordId: "-", at: nowISO(), desc: "Fictional demo records created in this browser." }];
  const leaves = [];

  return {
    patients, doctors, departments, appointments, consultations, prescriptions, vitals, emergency, nursing, lab, admissions, beds, ot, medicines, inventory, suppliers,
    purchaseOrders, blood, ambulances, invoices, payments, insurance, refunds, discharge, staff, roster, equipment, expenses, feedback, followups, notifications, documents,
    audit, dispensing, leaves,
  };
}

export const COLLECTIONS = [
  "patients", "doctors", "departments", "appointments", "consultations", "prescriptions", "vitals", "emergency", "nursing", "lab", "admissions", "beds", "ot", "medicines",
  "inventory", "suppliers", "purchaseOrders", "blood", "ambulances", "invoices", "payments", "insurance", "refunds", "discharge", "staff", "roster", "equipment", "expenses",
  "feedback", "followups", "notifications", "documents", "audit", "dispensing", "leaves",
];
