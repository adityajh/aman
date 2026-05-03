# 🚀 Aman Practice Management: Quick Start Guide

Welcome to **Aman**, your clinical practice management system. This guide will help you get up and running with your client management and billing workflows.

---

## 👥 1. Managing Clients
Before you can schedule sessions, you need to add your clients.
- Go to the **Clients** tab in the sidebar.
- Click **"Add Client"**.
- Fill in the name, contact details, and assign a **Default Fee Scheme** (INR or USD).
- **Duplicate Email Detection**: If you add a client with an email that already exists, you will be prompted to either **Restart/Reactivate** the existing client or **Create a New Profile Anyway** (for family members sharing an email).
- **Terminating a Client**: Click "Terminate Service" from the client's detail view. You will be asked whether pending sessions should still be invoiced — if not, they will be automatically cancelled.

---

## 💰 2. Setting Up Fee Schemes
Standardize your billing by creating reusable fee structures.
- Go to the **Fees** tab.
- Click **"New Fee Scheme"** and set the currency (INR `₹` or USD `$`) and amount.
- These will appear as options when scheduling a session and can be assigned to clients as a default.
- To change a client's currency, go to **Edit Profile** and update their Default Fee Scheme.

---

## 🗓 3. Scheduling & Completing Sessions
The core of your daily practice.
- Go to the **Sessions** tab (defaults to **Active Clients** view).
- Click **"New Session"**. The client's default fee scheme will be auto-populated.
- **Cancelling a Session**: Click the ✕ icon on any **Scheduled** session row. You can optionally enter a reason.
- **Writing Notes**: After a session ends, click **"Write Note"** to open the clinical editor.
- **⚠️ Important**: Saving a clinical note automatically marks the session as **Completed**, making it ready for billing.

---

## 🧾 4. Monthly Billing (Invoicing)
Aman makes batch billing effortless.
- Go to the **Invoices** tab.
- Click **"New Batch"**.
- You will see a list of clients who have **Completed** sessions that haven't been billed yet.
- Each client row shows their pending amount in the correct currency (`₹` or `$`).
- If you have both INR and USD clients selected, the header will show **separate totals** for each currency.
- Click **"Generate Invoices"** to create invoices, then **"Send"** to email them.

---

## 📊 5. Understanding Your Dashboard
Your "Practice Overview" gives you a real-time pulse on your practice:
- **Unbilled Sessions**: Work you've completed but haven't invoiced yet.
- **Outstanding Revenue**: Total value of all **Generated** and **Sent** invoices awaiting payment.
- **Upcoming Sessions**: Your schedule for the next 7 days.
- **Risk Flags**: Clinical alerts triggered in your session notes.

---

## 📈 6. Progress Tracking
- Click the chart icon (📈) next to any client to see their **ORS and SRS progress charts** over time.
- ORS and SRS scores are recorded in the clinical note editor using precision sliders (0–10, in 0.1 steps).

---

### ✉️ Email Setup Reminder
Ensure you've added your `SMTP_USER` and `SMTP_PASS` (App Password) to your environment settings to enable the **"Send"** functionality.

*Happy Counseling!* 🧑‍⚕️✨

