# Aman — Clinical Practice Management

Aman is a modern, lightweight practice management system designed for solo counselors. It streamlines the "Golden Path" of clinical work: scheduling sessions, writing clinical notes, and automating monthly invoicing.

## ✨ Core Features

- **Practice Dashboard**: High-level metrics for unbilled sessions, revenue, upcoming appointments, and risk flags.
- **Client Management**: Secure database for client records, default fees, and intake details.
- **Sessions Dashboard**: Fast scheduling with modality tracking (In-person, Video, Phone).
- **SOAP Note Editor**: Professional clinical editor with integrated risk flagging. Completing a note automatically marks the session as billable.
- **Invoicing Engine**: One-click batch generation of monthly invoices for all clients.
- **Resend Integration**: Automated delivery of branded HTML invoices directly to client emails.

## 🛠 Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, Turbopack)
- **Database**: [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Email**: [Resend](https://resend.com/)

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- A Neon PostgreSQL database
- A Resend API account

### 2. Installation

```bash
git clone https://github.com/adityajh/aman.git
cd aman
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
NEXTAUTH_SECRET=your_32_char_secret
NEXTAUTH_URL=http://localhost:3000

# Optional: Default Admin Credentials
ADMIN_EMAIL=counselor@aman.com
ADMIN_PASSWORD=password123
```

### 4. Database Setup

```bash
npx drizzle-kit push
```

### 5. Run Development Server

```bash
npm run dev
```

## 🛤 Roadmap

- [x] **Phase 1**: MVP (Invoicing, Clients, Sessions, SOAP Notes)
- [ ] **Phase 2**: AI Assistance (SOAP Note drafting via Claude API)
- [ ] **Phase 3**: Client Portal (Token-gated payment history view)
- [ ] **Phase 4**: Advanced Analytics (Mood tracking & progress charts)

## 📄 License

MIT
