# Ministry Staff Information Management System (SIMS)
### Ministry of Housing, Construction and Water Supply, Sri Lanka
**ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය | Democratic Socialist Republic of Sri Lanka**

A secure, modern, responsive Web Application designed for the **Ministry of Housing, Construction and Water Supply, Sri Lanka** to manage staff information, internal transfer preferences, service chronologies, and administrative records.

---

## 🏛️ System Overview

The system provides two distinct user interfaces tailored to ministerial human resource workflows:

1. **Public Staff Portal (`/submit` or `#submit`)**:
   - Clean, accessible self-service registration form for civil servants and ministry employees to submit their service records, personal data, and transfer preferences.
   - Live client-side validation for Sri Lankan National Identity Cards (NIC), 10-digit phone numbers (`07XXXXXXXX`), age computation, and 60-year statutory retirement date forecasting.
   - Interactive transfer preference selector with strict validation (maximum 2 target divisions).
   - Instant verification feedback and official downloadable / printable acknowledgment receipt with unique reference code.

2. **Admin Dashboard & Management Portal (`/admin` or `#admin`)**:
   - Protected government HR portal guarded by a security PIN barrier (`admin123` or `ministry@2026`) with persistent `sessionStorage` session.
   - Real-time Executive KPI cards: Total registered staff, internal transfer willingness count & percentage, active staff in service, transferred staff, and superannuated/retired staff.
   - Live multi-field search (by Name, NIC, Designation, or Reference ID).
   - Multi-criteria filter dropdowns: Status (`Active`, `Transferred`, `Retired`), Transfer Willingness (`Yes`, `No`), Designation, and Preferred Ministry Division.
   - Dynamic sorting across all key fields and customizable pagination (5, 10, 25, or All per page).
   - Inline / Modal Admin Profile Editor: Update status (`Active`, `Transferred`, `Retired`), set effective transfer date (`dateOfTransfer`), assign transferred board/department (`transferredLocation`), or correct record details.
   - Excel-compatible UTF-8 CSV Export and JSON backup/restore.
   - Official Printable Employee Summary Dossier formatted with the National Emblem, Ministry letterhead, official registry seal, and Director General / Additional Secretary verification block.

---

## 📋 Employee Data Schema

| Field Name | Type | Constraints & Sri Lankan Validation Rules |
| :--- | :--- | :--- |
| `id` | String (UUID) | Auto-generated unique identifier |
| `referenceNumber` | String | Unique ministerial reference code (e.g., `MOHC-WS-2026-0184`) |
| `fullName` | String | Required; full legal name with civil service title |
| `designationGrade` | String | Required; official grade (e.g., *Development Officer - Grade II*, *Chief Engineer - Grade I*) |
| `nicNumber` | String | Required; validated for Sri Lankan NIC: 9 digits + V/X (Old) or 12 digits (New) |
| `dateOfBirth` | Date | Required; auto-computes current age |
| `dateOfAppointment` | Date | Required; initial date of entry into Public Service |
| `permanentAddress` | Text | Required; residential address and district |
| `contactNumber` | String | Required; 10-digit Sri Lankan mobile number starting with `07` (e.g., `0771234567`) |
| `dateOfRetirement` | Date | Required; auto-calculated 60-year public service retirement ceiling |
| `dateOfSalaryIncrement` | Date | Required; scheduled annual increment review date |
| `dateReportedToMinistry` | Date | Required; date assumed duties at this Ministry |
| `willingnessForInternalTransfer` | Enum (`Yes` \| `No`) | Required; transfer intention toggle |
| `preferredDivisions` | Array of Strings | Conditional (visible only if willingness is `Yes`); **Strict maximum of 2 selections** |
| `emergencyContactNumber` | String | Required; 10-digit emergency contact / next-of-kin phone number |
| `dateOfTransfer` | Date | Admin-only field; recorded when employee is reassigned |
| `transferredLocation` | String | Admin-only field; receiving board, authority, or district office |
| `submissionTimestamp` | DateTime | Auto-stamped on record creation |
| `status` | Enum (`Active` \| `Transferred` \| `Retired`) | Default: `Active` |

---

## 🚀 How to Run the Application

The application includes an embedded Node.js HTTP/REST server and full static SPA frontend.

### Option 1: Quick Launch (Windows Batch Script)
- Double-click **`start.bat`** to start the local server.
- Double-click **`open_app.bat`** to open the portal in your default web browser at `http://localhost:3000`.

### Option 2: Command Line
```powershell
node server.js
```
The server will start on port `3000`:
- **Public Submission Form:** [http://localhost:3000/submit](http://localhost:3000/submit)
- **Admin Management Portal:** [http://localhost:3000/admin](http://localhost:3000/admin)

### Admin Credentials for Evaluation
- **Default PIN:** `admin123` or `ministry@2026`

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/employees` | Retrieve all registered employee records |
| `POST` | `/api/employees` | Validate & lodge new staff registration record |
| `PUT` | `/api/employees/:id` | Admin update (status, transfer date/location, corrections) |
| `DELETE` | `/api/employees/:id` | Delete employee record |
| `POST` | `/api/admin/login` | Authenticate with Admin PIN (`admin123` / `ministry@2026`) |
| `GET` | `/api/export/csv` | Download complete registry as Excel UTF-8 CSV with BOM |
| `POST` | `/api/reset-data` | Reset database to default Sri Lankan civil servant demo records |

---

## 🎨 Enterprise Government Design System
- **Color Palette:**
  - Deep Navy Blue (`#0f2942`) & Slate Slate (`#1e3a5f`)
  - Sri Lankan National Colors Ribbon: Saffron Orange (`#eb7a23`), Maroon (`#8d153a`), Forest Green (`#00534e`), Gold (`#fbb03b`)
  - Status Indicators: Emerald Green (`Active`), Royal Blue (`Transferred`), Neutral Slate (`Retired`)
- **Typography:** Inter & Noto Sans Sinhala / Tamil
- **Print Optimization:** Dedicated `@media print` rules ensure receipts and dossiers print cleanly without UI buttons or navigation.

---

Developed for the **Ministry of Housing, Construction and Water Supply, Sri Lanka**.

