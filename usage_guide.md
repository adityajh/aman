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
- Go to the **Sessions** tab (defaults to **This Month**, **Active Clients** view).
- Click **"New Session"**. The client's default fee scheme will be auto-populated. You can also set up **recurring** sessions.
- **Filtering**: Use the time dropdown — **Today, This Week, This Month, YTD,** or **Custom Range** (pick From/To dates). Each window is bounded, so future recurring sessions won't leak into the current period. Use **All Time** to see everything.
- **Sorting by client**: Click the **Client** column header to sort the list alphabetically (click again to reverse, once more to return to date order).
- **Duration column**: For completed sessions the **actual** clocked duration shows in black, with the **billed** minutes beneath it; scheduled sessions show their **planned** duration in blue.
- **Cancelling / No-Show**: Click the ✕ icon on any **Scheduled** row. Choose Cancellation or No-Show, optionally enter a reason, and set the fee — use the **0% / 50% / 100%** quick-fill buttons or type a custom amount (set to 0 to skip billing).
- **Writing Notes**: After a session ends, click **"Write Note"** to open the clinical editor.
- **⚠️ Important**: Saving a clinical note automatically marks the session as **Completed**, making it ready for billing.

### 💡 How session fees are calculated
When you finalize a note with actual start/end times, the billed duration is rounded to the nearest 15 minutes and the fee scales accordingly (e.g. 30 min → 0.5×, 45 min → 0.75× of the hourly rate). Sessions running 53–70 minutes still bill a full hour. This **only** applies when the session is linked to a fee scheme and you haven't manually overridden the fee — a flat fee you type in is always kept as-is.

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
- ORS and SRS scores are recorded in the clinical note editor (0–10). Drag the precision sliders, or toggle to numbers mode and **type the value directly** (decimals like `7.5` are supported).

---

### ✉️ Email Setup Reminder
Ensure you've added your `SMTP_USER` and `SMTP_PASS` (App Password) to your environment settings to enable the **"Send"** functionality.

*Happy Counseling!* 🧑‍⚕️✨

