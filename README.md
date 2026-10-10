# Janata Raja EMR

# COMPLETE LOVABLE AI PROMPT
# Janata Raja Multi-speciality Hospital
## Patient Management System Software Demo

### Project Information

**Business Name:** Janata Raja Multi-speciality Hospital

**Client Name:** Raja

**Demo Requirement:** Patient Management System Software

**Developer Credit:** Designed and development by SOSynch Ai Tech

Build a premium, modern, interactive Hospital Management System (HMS) software demo for Janata Raja Multi-speciality Hospital.

The project must be a working software application, not a normal hospital website, landing page, or static dashboard design.

The purpose is to demonstrate how hospital administrators, receptionists, doctors, nurses, and billing staff can manage patient registration, medical records, appointments, prescriptions, admissions, pharmacy, laboratory reports, billing, and hospital operations through one centralized dashboard.

---

## 1. Mandatory Technology Requirements

Use ONLY:

- React
- Vite
- Tailwind CSS
- Standard JavaScript
- React built-in hooks and components
- Standard browser APIs
- Inline SVG icons and CSS-based graphics

**Strictly prohibited:**

- No database.
- No backend.
- No Next.js.
- No Express or server-side application.
- No MongoDB, Supabase, Firebase, MySQL, or PostgreSQL.
- No external APIs.
- No additional UI libraries.
- No icon libraries.
- No chart libraries.
- No form libraries.
- No unnecessary third-party packages.

Use mock data stored in JavaScript files and localStorage for browser-based persistence.

The application must run with:

`npm install`

`npm run dev`

Do not add technologies or libraries outside the specified stack.

## 2. Premium Hospital Software Design

Create a professional hospital ERP interface with a consistent medical color palette.

Use these exact colors:

- Medical Blue: `#1565C0`
- Deep Navy: `#12304A`
- Medical Teal: `#0F9D8A`
- Light Blue: `#EFF6FF`
- Main Background: `#F5F7FA`
- White: `#FFFFFF`
- Main Text: `#1E293B`
- Secondary Text: `#64748B`
- Success Green: `#16A34A`
- Warning Amber: `#F59E0B`
- Danger Red: `#DC2626`
- Border Gray: `#E2E8F0`

Design requirements:

- Premium, clean hospital dashboard.
- Collapsible left sidebar.
- Professional top navigation.
- Modern cards and data tables.
- Rounded corners and subtle shadows.
- Consistent spacing and typography.
- Professional status badges.
- Responsive forms and modal dialogs.
- Search bars and filter controls.
- Clear visual hierarchy.
- Restrained animations.
- Accessible labels and keyboard-friendly interactions.

Create a hospital logo using CSS or inline SVG, such as a medical cross combined with a shield.

Avoid excessive gradients, clutter, unnecessary animations, and generic AI-generated layouts.

## 3. Login Screen and Hospital Banner

Create a professional admin login screen with a high-quality hospital-themed banner image.

Use imagery showing a modern multispeciality hospital, doctors consulting patients, or a clean healthcare environment.

Include:

**Janata Raja Multi-speciality Hospital**

“Patient Management System”

“Manage patients, appointments, prescriptions and hospital operations efficiently from one place.”

Image requirements:

- High-quality, relevant healthcare imagery.
- Responsive sizing and proper aspect ratio.
- Correct image cropping using object-fit.
- Subtle blue overlay where appropriate.
- CSS fallback if the image fails to load.
- No broken image placeholders.
- Verify images work after Vercel deployment.

The banner is part of the software interface, not a large public-facing marketing homepage.

Do not invent the hospital's address, phone number, email address, or registration details. Keep those fields configurable in Hospital Settings.

## 4. Admin Login and Authentication Demo

Create a working demo login page.

Demo credentials:

- Username: `admin`
- Password: `admin123`

Display the credentials on the login screen.

Features:

- Username and password fields.
- Show/hide password button.
- Form validation.
- Invalid login feedback.
- Successful login redirects to the dashboard.
- Logout button.
- Protected dashboard page rendering.
- Redirect unauthenticated users to login.
- Preserve demo session state across refreshes using localStorage.
- Display current user name and role.
- Admin profile dropdown.

Create role-aware demo interfaces for:

- Administrator
- Receptionist
- Doctor
- Nurse
- Billing Staff
- Laboratory Staff
- Pharmacist
- Inventory Manager

Provide appropriate navigation and visible actions for each role.

This is client-side demonstration authentication, not production-grade security. Clearly document this limitation.

## 5. Main Software Layout

Create a shared application layout with:

### Sidebar Navigation

1. Dashboard
2. Patient Management
3. Patient ID Cards
4. Appointments
5. OPD Management
6. Live Queue & Token Display
7. Doctors & Departments
8. Consultations
9. Digital Prescriptions
10. Medical History & Vitals
11. Emergency & Triage
12. Nursing Station
13. Lab Tests & Reports
14. IPD & Admissions
15. Bed & Ward Management
16. Operation Theatre
17. Pharmacy & Medicines
18. Inventory & Suppliers
19. Blood Bank
20. Ambulance Management
21. Billing & Payments
22. Insurance & TPA
23. Refund Management
24. Discharge Summary
25. Staff Management
26. Duty Roster
27. Equipment Maintenance
28. Expenses & Purchases
29. Patient Feedback
30. Follow-up Management
31. Notifications
32. Document Centre
33. Reports & Analytics
34. Audit Trail
35. Backup & Restore
36. Hospital Settings
37. Admin Logout

Every module must have its own functional interface, relevant mock records, working actions, and appropriate empty states. Do not create dead links or blank placeholder pages.

### Top Navigation

Include:

- Hospital logo and name.
- Global search.
- Current date.
- Notification icon and unread count.
- Current user profile.
- Role badge.
- Logout action.
- Mobile navigation toggle.

## 6. Hospital Dashboard

Create an interactive dashboard with statistic cards:

- Total Registered Patients.
- Today's Registrations.
- Today's Appointments.
- Today's OPD Visits.
- Patients Currently Waiting.
- Total Doctors.
- Active Admissions.
- Available Beds.
- Pending Lab Reports.
- Pending Payments.
- Today's Revenue.
- Low-Stock Medicines.

Include:

- Welcome banner.
- Recent patient registrations.
- Today's appointments.
- Live OPD queue.
- Doctor availability.
- Department-wise patient statistics.
- Bed occupancy.
- Recent admissions.
- Pending tasks.
- Revenue summary.
- Pharmacy alerts.
- Quick action buttons.

Quick actions:

- Register Patient.
- Book Appointment.
- Create Prescription.
- Generate Invoice.
- Admit Patient.
- Register Emergency Case.
- Add Lab Test.

All dashboard statistics must be calculated from mock records, not permanently hardcoded totals.

Use simple CSS-based charts and progress indicators.

## 7. Patient Registration and Management

Create a complete patient registration system.

### Patient Registration Fields

- Automatically generated Patient ID / UHID.
- Full Name.
- Mobile Number.
- Alternate Mobile Number.
- Date of Birth.
- Age.
- Gender.
- Blood Group.
- Full Address.
- City.
- State.
- PIN Code.
- Emergency Contact Name.
- Emergency Contact Number.
- Known Allergies.
- Existing Medical Conditions.
- Registration Date.
- Patient Photo or Initials Avatar.
- Registration Type.
- Referred By.
- Notes.

Generate unique patient IDs in a format such as `JRH-2026-0001`.

### Patient Directory

Display:

- Patient ID.
- Patient Name.
- Mobile Number.
- Age and Gender.
- Registration Date.
- Last Visit.
- Assigned Doctor.
- Patient Status.
- Actions.

Features:

- Add patient.
- View patient.
- Edit patient.
- Delete with confirmation.
- Search by patient name, ID, or mobile number.
- Filter by date, gender, and status.
- Pagination.
- View patient profile.
- View medical history.
- View prescriptions.
- View lab reports.
- View billing history.
- Print patient details.

Patient IDs must never be reused after deletion.

## 8. Patient Profile and Medical History

Create a detailed patient profile with these tabs:

- Overview.
- Personal Information.
- Medical History.
- Visits & Consultations.
- Prescriptions.
- Lab Reports.
- Billing History.
- Admissions.
- Documents.
- Follow-ups.

Display:

- Personal and contact information.
- Emergency contact.
- Allergies and existing conditions.
- Previous illnesses.
- Doctor notes.
- Consultation history.
- Prescriptions.
- Lab reports.
- Billing and payment history.
- Admission and discharge records.
- Follow-up appointments.
- Recorded vitals.

Add a chronological patient visit timeline and a New Consultation action.

Every linked record must reference the correct patient ID.

## 9. Patient ID Card

Create a printable patient identification card.

Include:

- Hospital logo and name.
- Patient name.
- Patient ID / UHID.
- Photo or initials.
- Registration date.
- Blood group if recorded.
- Hospital contact details when configured.
- Barcode-style or QR-style visual identifier.

Features:

- ID card preview.
- Print ID Card.
- Correct card dimensions.
- Professional medical styling.

Generate any barcode-style identifier locally using CSS or inline SVG. Do not install an external library.

Do not expose sensitive medical information through the identifier.

## 10. Appointment and OPD Management

Create a working appointment scheduling system.

Fields:

- Appointment ID.
- Patient ID.
- Patient Name.
- Doctor.
- Department.
- Appointment Date.
- Appointment Time.
- Appointment Type.
- Reason for Visit.
- Token Number.
- Consultation Fee.
- Status.

Statuses:

- Scheduled.
- Checked In.
- Waiting.
- In Consultation.
- Completed.
- Cancelled.
- No Show.

Features:

- Book appointments.
- Edit appointments.
- Cancel appointments.
- Search and filter.
- Doctor-wise scheduling.
- Department-wise scheduling.
- Date filters.
- Calendar-style view.
- Table view.
- Patient check-in.
- Consultation status updates.
- Follow-up booking.
- Link appointments to patient profiles and invoices.

Use React and CSS for calendar-style functionality.

## 11. Live Queue and Token Management

Create a separate OPD queue dashboard.

Features:

- Automatic token generation.
- Doctor-wise queue.
- Department-wise queue.
- Waiting patients.
- Currently consulting patient.
- Completed visits.
- Cancelled tokens.
- Patient arrival status.
- Demo waiting time.
- Call Next Patient button.
- Mark In Consultation.
- Mark Completed.
- Move patient back to queue.
- Filter by doctor and department.

Add a full-screen token display mode for waiting-room monitors.

Display:

- Hospital name.
- Current token.
- Doctor or department.
- Next tokens.
- Queue status.

All queue actions must update local mock records. Do not claim multi-device real-time synchronization.

## 12. Doctors and Departments

Create doctor management.

Doctor fields:

- Doctor ID.
- Full Name.
- Photo or initials.
- Qualification.
- Specialization.
- Department.
- Contact Number.
- Consultation Fee.
- OPD Timings.
- Availability Status.
- Experience.
- Notes.

Sample departments:

- General Medicine.
- Cardiology.
- Orthopedics.
- Pediatrics.
- Gynecology.
- Dermatology.
- ENT.
- General Surgery.
- Neurology.
- Ophthalmology.

Features:

- Add, edit, view and delete doctors.
- Add and edit departments.
- Set doctor availability.
- Manage OPD timings.
- View doctor appointments.
- View consultation history.
- Assign doctors to appointments.
- Display doctor schedules.

Use fictional doctor records.

## 13. Consultation Management

Create a consultation workspace.

Include:

- Patient information.
- Appointment information.
- Chief Complaint.
- Symptoms.
- Clinical Findings.
- Vitals.
- Diagnosis entered by the demo doctor.
- Treatment notes.
- Recommended investigations.
- Prescription creation.
- Follow-up date.
- Consultation status.

Allow users to save notes, create prescriptions and complete consultations.

Do not generate autonomous diagnoses or treatment decisions.

## 14. Digital Prescription Management

Create a professional printable prescription system.

Prescription fields:

- Prescription ID.
- Patient ID.
- Patient Name.
- Age and Gender.
- Prescription Date.
- Doctor Name.
- Doctor Qualification.
- Department.
- Symptoms.
- Clinical Findings.
- Diagnosis.
- Allergies.
- Vitals.
- Medicine Name.
- Strength.
- Dosage.
- Frequency.
- Duration.
- Quantity.
- Before Food / After Food.
- Additional Instructions.
- Recommended Investigations.
- Follow-up Date.
- Doctor Notes.
- Signature Placeholder.

Features:

- Add multiple medicine rows.
- Remove medicine rows.
- Create prescription.
- Edit draft.
- Save prescription.
- View prescription history.
- Search by patient, doctor, or date.
- Link to patient profile.
- Preview prescription.
- Print prescription using browser print functionality.

Use a professional A4 print layout with hospital branding, patient details, doctor details, medicines, instructions, follow-up date, and signature placeholder.

Hide navigation and interactive buttons when printing.

Use fictional sample prescriptions. Do not automatically prescribe medicine or generate clinical decisions.

## 15. Medical History and Vitals

Create a dedicated clinical records module.

Track:

- Blood Pressure.
- Pulse Rate.
- Body Temperature.
- Weight.
- Height.
- Oxygen Saturation.
- Recorded Date.
- Recorded By.
- Symptoms.
- Clinical Notes.
- Allergies.
- Existing Conditions.
- Follow-up Notes.

Features:

- Add vitals record.
- View previous readings.
- Display chronological history.
- Link records to consultations.
- Filter by patient and date.

Use appropriate units and fictional sample data.

## 16. Emergency and Triage Management

Create an emergency patient intake module.

Fields:

- Emergency ID.
- Patient ID if known.
- Patient Name or Unknown Patient.
- Arrival Date and Time.
- Contact Information.
- Presenting Complaint.
- Triage Priority.
- Assigned Doctor.
- Assigned Department.
- Emergency Status.
- Notes.

Priority labels:

- Critical.
- High.
- Normal.

Statuses:

- Arrived.
- Under Assessment.
- Under Treatment.
- Transferred.
- Discharged.

Features:

- Register emergency case.
- Link an existing patient.
- Create a patient record if necessary.
- Assign doctor.
- Track status.
- Display arrival time and elapsed time.
- Search emergency records.
- Print intake summary.

Clinical triage and emergency treatment decisions must remain under qualified medical staff.

## 17. Nursing Station

Create a nursing dashboard.

Features:

- Assigned inpatient list.
- Ward and bed details.
- Vitals recording.
- Patient care notes.
- Doctor instruction checklist.
- Nursing task status.
- Medication administration records.
- Patient monitoring timeline.
- Shift-wise assignments.

Medication record fields:

- Patient.
- Medication order reference.
- Scheduled administration time.
- Administration status.
- Recorded By.
- Notes.

Statuses:

- Pending.
- Administered.
- Delayed.
- Not Administered.

Use demo data only and do not generate treatment instructions automatically.

## 18. Laboratory and Diagnostic Reports

Create a lab management module.

Fields:

- Test ID.
- Patient ID.
- Patient Name.
- Referring Doctor.
- Test Name.
- Test Category.
- Request Date.
- Sample Collection Date.
- Report Date.
- Test Status.
- Result Summary.
- Lab Remarks.

Test categories:

- Blood Test.
- Urine Test.
- Blood Sugar.
- Lipid Profile.
- Thyroid Profile.
- ECG.
- X-Ray.
- Ultrasound.

Statuses:

- Requested.
- Sample Collected.
- Processing.
- Completed.
- Cancelled.

Features:

- Create test request.
- Update status.
- Record fictional results.
- View patient test history.
- Filter reports.
- Print lab report.
- Link tests to consultations and billing.

Clearly indicate that the demo does not perform actual diagnostic testing.

## 19. IPD and Admission Management

Create an inpatient management module.

Fields:

- Admission ID.
- Patient ID.
- Patient Name.
- Attending Doctor.
- Department.
- Admission Date and Time.
- Ward.
- Bed Number.
- Admission Reason.
- Preliminary Diagnosis.
- Expected Discharge Date.
- Admission Status.

Features:

- Admit existing patient.
- View active admissions.
- Edit admission details.
- Assign ward and bed.
- Add admission notes.
- View admission history.
- Track patient status.
- Create discharge summary.
- Release bed after discharge.

Prevent the same bed from being assigned to multiple active admissions.

## 20. Bed and Ward Management

Create a visual bed availability dashboard.

Fields:

- Bed Number.
- Ward Name.
- Floor.
- Bed Type.
- Status.
- Assigned Patient.
- Admission ID.

Statuses:

- Available.
- Occupied.
- Reserved.
- Maintenance.

Features:

- Add and edit beds.
- Filter by ward and availability.
- View occupied beds.
- Assign patients.
- Release beds.
- Display occupancy statistics.
- Prevent double booking.

## 21. Operation Theatre Management

Create an OT scheduling module.

Fields:

- Surgery ID.
- Patient ID.
- Patient Name.
- Surgeon.
- Department.
- OT Room.
- Scheduled Date.
- Start Time.
- End Time.
- Procedure Name.
- Status.
- Notes.

Statuses:

- Scheduled.
- Preparation.
- In Progress.
- Completed.
- Cancelled.

Features:

- Create surgery schedule.
- Edit schedule.
- View daily OT calendar.
- Track OT availability.
- View surgeon assignments.
- Link records to patient profiles and admissions.
- Prevent overlapping schedules for the same OT room.

## 22. Pharmacy and Medicine Inventory

Create a pharmacy management module.

Fields:

- Medicine ID.
- Medicine Name.
- Category.
- Strength.
- Batch Number.
- Expiry Date.
- Stock Quantity.
- Unit Price.
- Supplier.
- Reorder Level.
- Status.

Features:

- Add, edit and remove medicines.
- Search medicines.
- Track inventory.
- Low-stock alerts.
- Near-expiry alerts.
- Batch-wise stock records.
- Demo dispensing.
- Patient-linked dispensing history.
- Link charges to billing.

Do not automatically prescribe or recommend medicines.

## 23. Inventory, Purchasing and Suppliers

Create a central inventory and procurement module.

Manage:

- Medical supplies.
- Non-medical supplies.
- Laboratory consumables.
- Medical equipment.
- Suppliers.
- Purchase orders.
- Stock receipts.
- Purchase dates.
- Quantities.
- Purchase costs.
- Stock adjustments.

Features:

- Add and edit suppliers.
- Create purchase orders.
- Track pending orders.
- Record received inventory.
- Update stock quantities.
- Display low-stock alerts.
- View purchase history.

## 24. Blood Bank Management

Create a basic blood bank inventory demonstration.

Fields:

- Blood Unit ID.
- Blood Group.
- Component Type.
- Collection Date.
- Expiry Date.
- Availability Status.
- Storage Location.
- Issue Reference.

Features:

- Display available units by blood group.
- Add fictional inventory records.
- Search and filter stock.
- Track expiry dates.
- Record demo issue and reservation entries.
- Display low-availability warnings.

Blood compatibility and clinical release decisions must not be automated.

## 25. Ambulance Management

Create an ambulance operations module.

Fields:

- Ambulance ID.
- Vehicle Registration Placeholder.
- Driver Name.
- Driver Contact.
- Vehicle Type.
- Availability.
- Dispatch Time.
- Return Time.
- Linked Emergency Case.
- Destination.
- Notes.

Statuses:

- Available.
- Dispatched.
- On Trip.
- Maintenance.

Features:

- Register ambulance.
- Edit vehicle details.
- Track dispatch records.
- Assign ambulance to an emergency case.
- Record return and availability.
- View dispatch history.

Do not claim GPS tracking or live vehicle location.

## 26. Billing, Payments and Invoices

Create a professional billing module.

Invoice fields:

- Invoice Number.
- Patient ID.
- Patient Name.
- Consultation Fee.
- Lab Charges.
- Procedure Charges.
- Medicine Charges.
- Room Charges.
- Other Charges.
- Discount.
- Applicable Tax.
- Grand Total.
- Amount Paid.
- Outstanding Balance.
- Payment Method.
- Payment Date.
- Payment Status.

Payment methods:

- Cash.
- UPI.
- Card.
- Other.

Statuses:

- Paid.
- Partially Paid.
- Pending.
- Cancelled.

Features:

- Generate invoice.
- Add and remove bill items.
- Automatically calculate totals.
- Validate discounts and payments.
- Record full or partial payments.
- Calculate outstanding balance.
- Search by patient or invoice.
- Print invoice.
- Print receipt.
- View payment history.
- Display revenue summaries.

Use Indian Rupees (₹).

Do not connect to an actual payment gateway.

## 27. Insurance and TPA Management

Create an insurance and Third-Party Administrator module.

Fields:

- Insurance Record ID.
- Patient ID.
- Patient Name.
- Insurance Provider.
- Policy Number.
- TPA Name.
- Claim Number.
- Admission Reference.
- Estimated Claim Amount.
- Approved Amount.
- Claim Status.
- Submission Date.
- Notes.

Statuses:

- Draft.
- Submitted.
- Under Review.
- Approved.
- Partially Approved.
- Rejected.
- Settled.

Features:

- Create insurance record.
- Update claim status.
- Track outstanding claims.
- Maintain document checklist.
- View patient-linked insurance history.
- Filter by provider and status.

No external insurance API integration.

## 28. Refund Management

Create a refund workflow.

Fields:

- Refund ID.
- Invoice Number.
- Patient.
- Refund Amount.
- Refund Reason.
- Request Date.
- Requested By.
- Approval Status.
- Refund Method.
- Notes.

Statuses:

- Requested.
- Pending Approval.
- Approved.
- Rejected.
- Processed.

Features:

- Create refund request.
- Validate refund amount.
- Show linked invoice.
- Track approvals.
- Update refund status.
- Include refunds in financial reports.

## 29. Discharge Summary

Create a printable discharge summary.

Include:

- Hospital Details.
- Patient Details.
- Admission ID.
- Admission Date.
- Discharge Date.
- Attending Doctor.
- Admission Reason.
- Diagnosis.
- Treatment Summary.
- Procedures and Investigations.
- Discharge Medicines.
- Discharge Instructions.
- Follow-up Date.
- Doctor Notes.
- Signature Placeholder.

Features:

- Create discharge summary.
- Edit draft.
- Preview.
- Print.
- Link to patient profile.
- Link to admission record.

## 30. Staff Management and Duty Roster

Create a staff directory and shift scheduling module.

Staff fields:

- Staff ID.
- Name.
- Role.
- Department.
- Contact Number.
- Employment Status.
- Assigned Shift.

Duty roster fields:

- Staff Member.
- Date.
- Shift.
- Department.
- Duty Status.
- Notes.

Features:

- Add, edit and deactivate staff.
- Assign roles.
- Schedule shifts.
- View daily and weekly rosters.
- Filter by department.
- Track availability.
- Manage demo leave records.

## 31. Equipment Management and Maintenance

Create a medical equipment inventory.

Fields:

- Equipment ID.
- Equipment Name.
- Category.
- Department.
- Serial Number Placeholder.
- Purchase Date.
- Warranty Expiry.
- Last Maintenance Date.
- Next Maintenance Date.
- Status.

Statuses:

- Available.
- In Use.
- Under Maintenance.
- Out of Service.

Features:

- Add and edit equipment.
- Assign department.
- Record maintenance history.
- Show upcoming service reminders.
- Track unavailable equipment.

## 32. Expenses and Purchase Management

Create a basic operational expense module.

Categories:

- Medical Supplies.
- Utilities.
- Equipment.
- Maintenance.
- Staff Expenses.
- Housekeeping.
- Other.

Fields:

- Expense ID.
- Category.
- Description.
- Amount.
- Date.
- Payment Method.
- Vendor.
- Approval Status.

Features:

- Add and edit demo expenses.
- Filter by date and category.
- View expense totals.
- Compare expenses and revenue.
- Export records to CSV.

## 33. Patient Feedback

Create a patient feedback module.

Fields:

- Feedback ID.
- Patient ID.
- Visit Reference.
- Department.
- Rating.
- Feedback Text.
- Submission Date.
- Status.

Features:

- Add fictional feedback.
- Filter by rating and department.
- Display average demo ratings.
- Track feedback review.
- Mark feedback as reviewed.

## 34. Follow-up Management

Create a dedicated follow-up tracker.

Fields:

- Follow-up ID.
- Patient ID.
- Patient Name.
- Doctor.
- Previous Visit Date.
- Follow-up Date.
- Reason.
- Status.

Features:

- Upcoming follow-ups.
- Overdue follow-ups.
- Completed follow-ups.
- Search by patient or doctor.
- Book follow-up appointment.
- Display follow-up reminders.

Do not send real SMS, WhatsApp, email, or phone notifications.

## 35. Notifications and Alerts

Create an interactive notification centre.

Notification types:

- New Patient Registration.
- Upcoming Appointment.
- Patient Waiting.
- Pending Lab Report.
- Low Medicine Stock.
- Medicine Near Expiry.
- Equipment Maintenance.
- Pending Invoice.
- Insurance Claim Update.
- Follow-up Due.
- Upcoming OT Schedule.

Features:

- Unread count.
- Mark as read.
- Mark all as read.
- Filter by category.
- Link notifications to corresponding records.

Generate notifications locally.

## 36. Document Centre

Create a document management interface for demo records.

Categories:

- Patient Documents.
- Lab Reports.
- Prescriptions.
- Consent Forms.
- Admission Documents.
- Insurance Documents.
- Discharge Summaries.
- Billing Documents.

Features:

- Document title.
- Linked patient.
- Category.
- Document date.
- File type.
- View or print where supported.
- Search and filters.

Use sample metadata and local demonstration content. No external document storage.

## 37. Reports and Analytics

Create a detailed analytics section.

Reports:

- Patient Registration Report.
- OPD Report.
- Appointment Report.
- Doctor-wise Consultation Report.
- Department-wise Patient Report.
- Prescription Report.
- Lab Report Status.
- Admission and Discharge Report.
- Bed Occupancy Report.
- Pharmacy Stock Report.
- Medicine Expiry Report.
- Revenue Report.
- Pending Payments Report.
- Refund Report.
- Insurance Claims Report.
- OT Schedule Report.
- Blood Bank Availability Report.
- Ambulance Utilization Report.
- Staff Duty Report.
- Expense Report.
- Follow-up Report.

Features:

- Today.
- Last 7 Days.
- Last 30 Days.
- Custom Date Range.
- Doctor filters.
- Department filters.
- Status filters.
- Summary cards.
- CSS-based charts.
- Sortable tables.
- CSV export.

All report figures must be calculated from mock data.

## 38. Global Search and Quick Actions

Implement global search across:

- Patient name.
- Patient ID.
- Mobile number.
- Doctor name.
- Appointment ID.
- Prescription ID.
- Invoice number.
- Admission ID.
- Lab Test ID.
- Medicine name.

Display categorized search results with navigation to the relevant record.

Quick actions:

- Register Patient.
- Book Appointment.
- Create Consultation.
- Create Prescription.
- Generate Invoice.
- Admit Patient.
- Add Lab Test.
- Register Emergency Case.
- Add Medicine.
- Record Payment.

## 39. Audit Trail and Activity Log

Create a demo activity history.

Track events such as:

- Patient Created.
- Patient Updated.
- Appointment Created.
- Prescription Created.
- Invoice Generated.
- Payment Recorded.
- Admission Created.
- Bed Assigned.
- Medicine Stock Updated.
- Discharge Recorded.
- Settings Updated.

Fields:

- Activity ID.
- User.
- Role.
- Action.
- Record Type.
- Record ID.
- Date and Time.
- Description.

Create activity records from actual demo actions.

Allow filters by user, date, action, and record type.

Explain that browser-based audit records are editable and not tamper-proof.

## 40. Backup and Restore

Create a demo data management page.

Features:

- Export all demo data to JSON.
- Export selected lists to CSV.
- Import a compatible JSON backup.
- Validate imported structures.
- Confirm before replacing existing records.
- Reset demo data with confirmation.
- Display last local export date when available.
- Show demo data storage information.

Use standard browser APIs only.

Do not claim localStorage is a secure production backup.

## 41. Hospital Settings

Create a configurable settings module.

Fields:

- Hospital Name.
- Hospital Logo Placeholder.
- Address.
- Phone Number.
- Email Address.
- Hospital Registration Number.
- Prescription Header.
- Invoice Header.
- Default Consultation Fee.
- Currency.
- Date Format.
- Footer Text.

Use Janata Raja Multi-speciality Hospital as the default hospital name.

Leave unknown contact details blank.

Apply settings consistently to the dashboard, patient card, prescription, invoice, receipt, lab report, discharge summary and printable documents.

Persist settings in localStorage.

## 42. Mock Data Requirements

Create realistic, interconnected fictional records.

Minimum dataset:

- 30 patients.
- 10 doctors.
- 10 departments.
- 25 appointments.
- 20 prescriptions.
- 20 invoices.
- 15 lab records.
- 15 medicines.
- 12 beds.
- 6 admissions.
- 5 emergency cases.
- 5 OT schedules.
- 10 staff members.
- 8 nursing tasks.
- 8 insurance claims.
- 6 blood inventory records.
- 4 ambulance records.
- 10 inventory items.
- 10 equipment records.
- 10 expense records.
- 10 follow-up records.
- 10 feedback records.
- Relevant notifications and activity logs.

Use fictional Indian names and fictional contact information. Never use real patient medical information.

Use consistent identifiers:

- Patients: `JRH-2026-0001`
- Appointments: `APT-2026-0001`
- Prescriptions: `PRS-2026-0001`
- Invoices: `INV-2026-0001`
- Admissions: `ADM-2026-0001`
- Lab Tests: `LAB-2026-0001`
- Emergency Cases: `EMR-2026-0001`
- OT Schedules: `OT-2026-0001`

All linked records must reference correct patient IDs, doctor IDs, appointment IDs and invoice IDs.

Use Indian date formatting and ₹ currency formatting.

Initialize missing mock data only. Do not overwrite user changes every time the application starts.

## 43. LocalStorage and Data Consistency

Use localStorage as the sole persistence mechanism.

Maintain organized records for:

- Sessions.
- Patients.
- Doctors.
- Departments.
- Appointments.
- Consultations.
- Prescriptions.
- Medical History.
- Vitals.
- Emergency Cases.
- Nursing Tasks.
- Lab Reports.
- Admissions.
- Beds.
- OT Schedules.
- Medicines.
- Inventory.
- Suppliers.
- Blood Bank.
- Ambulances.
- Invoices.
- Payments.
- Insurance Claims.
- Refunds.
- Staff.
- Duty Roster.
- Equipment.
- Expenses.
- Feedback.
- Follow-ups.
- Notifications.
- Documents.
- Audit Trail.
- Settings.

Create reusable read/write helpers and handle missing or invalid stored data gracefully.

Do not seed over existing data.

Ensure cross-module updates remain consistent. For example, completing an admission should release the assigned bed, and partial payments should update invoice balances.

Because localStorage is browser-specific, data will not synchronize between computers or different users.

## 44. CRUD and User Experience Requirements

All relevant modules must support:

- Create.
- Read.
- Update.
- Delete with confirmation.
- Search.
- Filters.
- Sorting where appropriate.
- Form validation.
- Empty states.
- Success and error messages.
- Detail views.
- Print actions where relevant.

Implement reusable React components for:

- Modals.
- Toast messages.
- Status badges.
- Data tables.
- Form fields.
- Confirmation dialogs.
- Search controls.
- Filter controls.
- Responsive cards.

Do not use browser alert boxes as the primary interface.

Every visible button and menu item must perform a meaningful action.

## 45. Print Centre

Create print functionality for:

- Patient Details.
- Patient ID Card.
- Prescription.
- Lab Report.
- Invoice.
- Payment Receipt.
- Admission Summary.
- Discharge Summary.
- OT Schedule.
- Emergency Intake Summary.

Requirements:

- Professional A4 layouts where applicable.
- Hospital name and logo.
- Proper page margins.
- Clean typography.
- Hide navigation and buttons during printing.
- Avoid splitting important document sections across pages.
- Include signature placeholders where relevant.

Use browser `window.print()` and CSS print media rules.

## 46. Responsive Design

Desktop:
- Collapsible sidebar.
- Top navigation.
- Detailed tables.
- Multi-column dashboards.
- Wide print previews.

Tablet:
- Responsive sidebar.
- Two-column cards where suitable.
- Scrollable tables.
- Adapted form layouts.

Mobile:
- Navigation drawer.
- Single-column forms.
- Touch-friendly buttons.
- Responsive patient tabs.
- Mobile-friendly dialogs.
- No unintended horizontal overflow.

## 47. Footer Branding

Include this exact footer credit throughout the application:

**Designed and development by SOSynch Ai Tech**

Add an **Admin Login** link in the footer.

The link must open the actual login page or provide a sensible dashboard route when the administrator is already authenticated.

Keep the footer professional and unobtrusive.

## 48. Quality Assurance

Before completing the project, verify:

1. Vite starts correctly.
2. Login and logout work.
3. All sidebar modules open correctly.
4. No empty placeholder pages remain.
5. Patient registration and CRUD work.
6. Patient IDs remain unique.
7. Appointments link to the correct patients and doctors.
8. Queue tokens update correctly.
9. Prescriptions can be created, saved, edited and printed.
10. Vitals and medical history remain associated with the correct patient.
11. Lab reports can be created and updated.
12. Bed assignment prevents double booking.
13. OT schedules prevent room conflicts.
14. Pharmacy inventory and alerts work.
15. Billing totals are calculated correctly.
16. Partial payments update outstanding balances.
17. Insurance and refund statuses can be updated.
18. Discharge summaries can be printed.
19. Reports use current mock data.
20. CSV and JSON export work.
21. Import validation works.
22. Reset requires confirmation.
23. localStorage persists data after refresh.
24. Cross-module references remain consistent.
25. Responsive layouts work on desktop, tablet and mobile.
26. Banner images work in local and Vercel deployments.
27. No prohibited libraries or databases have been added.
28. Unknown hospital contact details are not fabricated.
29. Footer credit and Admin Login link are present.
30. No critical console errors remain.

## 49. Final Deliverable

Deliver a complete, premium, interactive **Janata Raja Multi-speciality Hospital — Patient Management System Software Demo**.

This is a software demonstration, not a hospital marketing website.

Prioritize a functional dashboard, real-looking hospital workflows, interconnected mock data, professional forms, working tables, print-ready documents and comprehensive admin controls.

All major modules must have functional interfaces and working demo actions.

**Final mandatory instruction:** Use React + Vite + Tailwind CSS only. No additional libraries, backend, database or external APIs. Use mock data and localStorage exclusively. Include the hospital banner image, demo admin login, functional Admin Login footer link, and the exact credit “Designed and development by SOSynch Ai Tech”.

Clearly identify the application as a frontend demo. Do not use real patient data or claim that the software is ready for production hospital operations.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2bd8ed44-57fe-4c38-8191-d620b72e72f9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
