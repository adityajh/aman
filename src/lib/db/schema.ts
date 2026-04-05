// ============================================================
// AMAN — Drizzle ORM Schema
// /lib/db/schema.ts
// Compatible with Neon (PostgreSQL) + Drizzle ORM
// ============================================================

import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  numeric,
  date,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

// ─────────────────────────────────────────────
// FEE SCHEMES
// ─────────────────────────────────────────────
export const feeSchemes = pgTable(
  "fee_schemes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  }
);

// ─────────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────────
export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    dateOfBirth: date("date_of_birth"),
    defaultFee: numeric("default_fee", { precision: 10, scale: 2 }),
    feeType: text("fee_type")
      .$type<"hourly" | "per_session" | "package" | "sliding_scale">()
      .default("per_session"),
    tags: text("tags").array(),
    isActive: boolean("is_active").notNull().default(true),
    intakeNotes: text("intake_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    defaultFeeSchemeId: uuid("default_fee_scheme_id").references(() => feeSchemes.id, { onDelete: "set null" }),
  },
  (t) => ({
    activeIdx: index("idx_clients_active").on(t.isActive),
  })
);

export const clientsRelations = relations(clients, ({ many }) => ({
  sessions: many(sessions),
  invoices: many(invoices),
}));

// ─────────────────────────────────────────────
// INVOICES (declared before sessions for FK)
// ─────────────────────────────────────────────
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    invoiceNumber: text("invoice_number").notNull().unique(),
    billingMonth: date("billing_month").notNull(),
    issuedDate: date("issued_date").notNull().default(sql`CURRENT_DATE`),
    dueDate: date("due_date"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
    taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
    amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull().default("0"),
    status: text("status")
      .$type<"draft" | "sent" | "paid" | "partial" | "overdue" | "void">()
      .notNull()
      .default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    pdfUrl: text("pdf_url"),
    paymentLink: text("payment_link"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    clientIdx: index("idx_invoices_client").on(t.clientId),
    statusIdx: index("idx_invoices_status").on(t.status),
    monthIdx: index("idx_invoices_month").on(t.billingMonth),
  })
);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

// ─────────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────────
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    durationMin: integer("duration_min").notNull().default(60),
    sessionType: text("session_type")
      .$type<"individual" | "couples" | "group" | "intake" | "followup">()
      .notNull()
      .default("individual"),
    status: text("status")
      .$type<"scheduled" | "completed" | "no_show" | "cancelled" | "rescheduled">()
      .notNull()
      .default("scheduled"),
    cancellationReason: text("cancellation_reason"),
    cancellationFee: numeric("cancellation_fee", { precision: 10, scale: 2 }).default("0"),
    modality: text("modality")
      .$type<"in_person" | "video" | "phone">()
      .notNull()
      .default("in_person"),
    feeCharged: numeric("fee_charged", { precision: 10, scale: 2 }),
    feeOverride: boolean("fee_override").notNull().default(false),
    feeSchemeId: uuid("fee_scheme_id").references(() => feeSchemes.id, { onDelete: "set null" }),
    invoiceId: uuid("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    clientIdx: index("idx_sessions_client").on(t.clientId),
    statusIdx: index("idx_sessions_status").on(t.status),
    scheduledIdx: index("idx_sessions_scheduled").on(t.scheduledAt),
    invoiceIdx: index("idx_sessions_invoice").on(t.invoiceId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  client: one(clients, {
    fields: [sessions.clientId],
    references: [clients.id],
  }),
  invoice: one(invoices, {
    fields: [sessions.invoiceId],
    references: [invoices.id],
  }),
  note: one(sessionNotes, {
    fields: [sessions.id],
    references: [sessionNotes.sessionId],
  }),
}));

// ─────────────────────────────────────────────
// SESSION NOTES (SOAP)
// ─────────────────────────────────────────────
export const sessionNotes = pgTable(
  "session_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .unique()
      .references(() => sessions.id, { onDelete: "restrict" }),
    subjective: text("subjective"),
    objective: text("objective"),
    assessment: text("assessment"),
    plan: text("plan"),
    moodScore: integer("mood_score"),       // 1–10; Phase 2
    goalProgress: text("goal_progress"),
    riskFlag: text("risk_flag")
      .$type<"none" | "low" | "medium" | "high">()
      .notNull()
      .default("none"),
    noteType: text("note_type")
      .$type<"SOAP" | "DAP" | "BIRP" | "free">()
      .notNull()
      .default("SOAP"),
    aiDrafted: boolean("ai_drafted").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    sessionIdx: index("idx_notes_session").on(t.sessionId),
    riskIdx: index("idx_notes_risk_flag").on(t.riskFlag),
  })
);

// ─────────────────────────────────────────────
// INVOICE LINE ITEMS
// ─────────────────────────────────────────────
export const invoiceLineItems = pgTable(
  "invoice_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id").references(() => sessions.id, { onDelete: "set null" }),
    description: text("description").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    invoiceIdx: index("idx_line_items_invoice").on(t.invoiceId),
    sessionIdx: index("idx_line_items_session").on(t.sessionId),
  })
);

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "restrict" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    paymentDate: date("payment_date").notNull().default(sql`CURRENT_DATE`),
    method: text("method")
      .$type<"cash" | "upi" | "bank_transfer" | "card" | "online" | "other">()
      .notNull(),
    referenceId: text("reference_id"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    invoiceIdx: index("idx_payments_invoice").on(t.invoiceId),
  })
);

// ─────────────────────────────────────────────
// PORTAL TOKENS (Phase 2)
// ─────────────────────────────────────────────
export const portalTokens = pgTable(
  "portal_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    clientIdx: index("idx_portal_tokens_client").on(t.clientId),
    tokenIdx: uniqueIndex("idx_portal_tokens_token").on(t.token),
  })
);

// ─────────────────────────────────────────────
// PRACTICE SETTINGS (Single Row)
// ─────────────────────────────────────────────
export const practiceSettings = pgTable(
  "practice_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    counselorName: text("counselor_name").notNull().default("Vijay Gopal Sreenivasan"),
    practiceName: text("practice_name").notNull().default("Aman Counseling"),
    address: text("address").default("Noida, Uttar Pradesh"),
    phone: text("phone").default("+91-0000000000"),
    email: text("email").default("counselor@aman.com"),
    monthlyQuote: text("monthly_quote").default("Progress is not a straight line."),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  }
);

// ─────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tableName: text("table_name").notNull(),
    recordId: uuid("record_id").notNull(),
    action: text("action").$type<"INSERT" | "UPDATE" | "DELETE">().notNull(),
    oldData: jsonb("old_data"),
    newData: jsonb("new_data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    tableIdx: index("idx_audit_table").on(t.tableName),
    recordIdx: index("idx_audit_record").on(t.recordId),
    createdIdx: index("idx_audit_created").on(t.createdAt),
  })
);

// ─────────────────────────────────────────────
// TYPE EXPORTS (useful for API route typing)
// ─────────────────────────────────────────────
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type SessionNote = typeof sessionNotes.$inferSelect;
export type NewSessionNote = typeof sessionNotes.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type FeeScheme = typeof feeSchemes.$inferSelect;
export type NewFeeScheme = typeof feeSchemes.$inferInsert;
export type AuditLog = typeof auditLog.$inferSelect;
export type PracticeSettings = typeof practiceSettings.$inferSelect;
export type NewPracticeSettings = typeof practiceSettings.$inferInsert;
