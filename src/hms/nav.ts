// @ts-nocheck
export const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", group: "Overview" },
  { key: "patients", label: "Patient Management", icon: "users", group: "Patients" },
  { key: "idcards", label: "Patient ID Cards", icon: "card", group: "Patients" },
  { key: "appointments", label: "Appointments", icon: "calendar", group: "Patients" },
  { key: "opd", label: "OPD Management", icon: "clinic", group: "Patients" },
  { key: "queue", label: "Live Queue & Token Display", icon: "queue", group: "Patients" },
  { key: "doctors", label: "Doctors & Departments", icon: "doctor", group: "Clinical" },
  { key: "consultations", label: "Consultations", icon: "stetho", group: "Clinical" },
  { key: "prescriptions", label: "Digital Prescriptions", icon: "rx", group: "Clinical" },
  { key: "vitals", label: "Medical History & Vitals", icon: "heart", group: "Clinical" },
  { key: "emergency", label: "Emergency & Triage", icon: "siren", group: "Clinical" },
  { key: "nursing", label: "Nursing Station", icon: "nurse", group: "Clinical" },
  { key: "lab", label: "Lab Tests & Reports", icon: "flask", group: "Clinical" },
  { key: "admissions", label: "IPD & Admissions", icon: "bed", group: "Inpatient" },
  { key: "beds", label: "Bed & Ward Management", icon: "ward", group: "Inpatient" },
  { key: "ot", label: "Operation Theatre", icon: "scalpel", group: "Inpatient" },
  { key: "pharmacy", label: "Pharmacy & Medicines", icon: "pill", group: "Supplies" },
  { key: "inventory", label: "Inventory & Suppliers", icon: "box", group: "Supplies" },
  { key: "blood", label: "Blood Bank", icon: "drop", group: "Supplies" },
  { key: "ambulances", label: "Ambulance Management", icon: "ambulance", group: "Supplies" },
  { key: "billing", label: "Billing & Payments", icon: "rupee", group: "Finance" },
  { key: "insurance", label: "Insurance & TPA", icon: "shield", group: "Finance" },
  { key: "refunds", label: "Refund Management", icon: "refund", group: "Finance" },
  { key: "discharge", label: "Discharge Summary", icon: "exit", group: "Finance" },
  { key: "staff", label: "Staff Management", icon: "staff", group: "Operations" },
  { key: "roster", label: "Duty Roster", icon: "clock", group: "Operations" },
  { key: "equipment", label: "Equipment Maintenance", icon: "tool", group: "Operations" },
  { key: "expenses", label: "Expenses & Purchases", icon: "wallet", group: "Operations" },
  { key: "feedback", label: "Patient Feedback", icon: "star", group: "Operations" },
  { key: "followups", label: "Follow-up Management", icon: "repeat", group: "Operations" },
  { key: "notifications", label: "Notifications", icon: "bell", group: "System" },
  { key: "documents", label: "Document Centre", icon: "folder", group: "System" },
  { key: "reports", label: "Reports & Analytics", icon: "chart", group: "System" },
  { key: "audit", label: "Audit Trail", icon: "audit", group: "System" },
  { key: "backup", label: "Backup & Restore", icon: "database", group: "System" },
  { key: "settings", label: "Hospital Settings", icon: "settings", group: "System" },
];

const C = ["dashboard", "notifications", "documents"];
export const ROLE_ACCESS = {
  Administrator: "all",
  Receptionist: [...C, "patients", "idcards", "appointments", "opd", "queue", "doctors", "emergency", "ambulances", "followups", "feedback", "billing"],
  Doctor: [...C, "patients", "appointments", "opd", "queue", "consultations", "prescriptions", "vitals", "emergency", "lab", "admissions", "ot", "discharge", "followups", "reports"],
  Nurse: [...C, "patients", "vitals", "nursing", "admissions", "beds", "emergency", "ot", "blood", "roster"],
  "Billing Staff": [...C, "patients", "billing", "insurance", "refunds", "discharge", "expenses", "reports"],
  "Laboratory Staff": [...C, "patients", "lab", "equipment", "reports"],
  Pharmacist: [...C, "pharmacy", "prescriptions", "inventory", "reports"],
  "Inventory Manager": [...C, "inventory", "pharmacy", "equipment", "expenses", "blood", "reports"],
};
export const canAccess = (role, key) => {
  const a = ROLE_ACCESS[role] || ROLE_ACCESS.Receptionist;
  if (a === "all") return true;
  if (key === "patient") return a.includes("patients");
  return a.includes(key);
};
