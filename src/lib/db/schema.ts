// ============================================================
// DEEPEN — Drizzle ORM Schema
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
// TENANTS & USERS
// ─────────────────────────────────────────────
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone"),
  planTier: text("plan_tier").$type<"basic" | "pro">().notNull().default("basic"),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  isActive: boolean("is_active").notNull().default(true),
  isExempt: boolean("is_exempt").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().default(sql`now()`),
});

// ─────────────────────────────────────────────
// FEE SCHEMES
// ─────────────────────────────────────────────
export const feeSchemes = pgTable(
  "fee_schemes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("INR"),
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
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
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
    terminationReason: text("termination_reason"),
    terminationType: text("termination_type").$type<"planned" | "unplanned">(),
    terminatedAt: timestamp("terminated_at", { withTimezone: true }),
    prematureTerminationManual: boolean("premature_termination_manual"),
    intakeNotes: text("intake_notes"),
    timezone: text("timezone").notNull().default("Asia/Kolkata"),
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
    tenantActiveIdx: index("idx_clients_tenant_active").on(t.tenantId, t.isActive),
  })
);

// ─────────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────────
export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    invoiceNumber: text("invoice_number").notNull(),
    billingMonth: date("billing_month").notNull(),
    issuedDate: date("issued_date").notNull().default(sql`CURRENT_DATE`),
    dueDate: date("due_date"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
    taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
    amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("INR"),
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
    uniqueInvoiceNum: uniqueIndex("idx_invoices_tenant_num").on(t.tenantId, t.invoiceNumber),
  })
);

// ─────────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────────
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationMin: integer("duration_min").notNull().default(60),
    sessionType: text("session_type")
      .$type<"individual" | "couples" | "group" | "intake" | "followup">()
      .notNull()
      .default("individual"),
    actualStartTime: timestamp("actual_start_time", { withTimezone: true }),
    actualEndTime: timestamp("actual_end_time", { withTimezone: true }),
    invoicedDurationMin: integer("invoiced_duration_min"),
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
    tenantScheduledIdx: index("idx_sessions_tenant_scheduled").on(t.tenantId, t.scheduledAt),
    invoiceIdx: index("idx_sessions_invoice").on(t.invoiceId),
  })
);

// ─────────────────────────────────────────────
// SESSION NOTES
// ─────────────────────────────────────────────
export const sessionNotes = pgTable(
  "session_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .unique()
      .references(() => sessions.id, { onDelete: "restrict" }),
    subjective: text("subjective"),
    objective: text("objective"),
    assessment: text("assessment"),
    plan: text("plan"),
    updates: text("updates"),
    clientActions: text("client_actions"),
    myActions: text("my_actions"),
    agenda: text("agenda"),
    feedback: text("feedback"),
    // ORS Scores (1-10)
    orsIndividual: numeric("ors_individual", { precision: 5, scale: 1 }),
    orsInterpersonal: numeric("ors_interpersonal", { precision: 5, scale: 1 }),
    orsSocial: numeric("ors_social", { precision: 5, scale: 1 }),
    orsOverall: numeric("ors_overall", { precision: 5, scale: 1 }),
    orsTotal: numeric("ors_total", { precision: 5, scale: 1 }),
    // SRS Scores (1-10)
    srsRelationship: numeric("srs_relationship", { precision: 5, scale: 1 }),
    srsGoals: numeric("srs_goals", { precision: 5, scale: 1 }),
    srsApproach: numeric("srs_approach", { precision: 5, scale: 1 }),
    srsOverall: numeric("srs_overall", { precision: 5, scale: 1 }),
    srsTotal: numeric("srs_total", { precision: 5, scale: 1 }),
    moodScore: integer("mood_score"),
    goalProgress: text("goal_progress"),
    riskFlag: text("risk_flag")
      .$type<"none" | "low" | "medium" | "high">()
      .notNull()
      .default("none"),
    // Auto outcome flags derived from the scores (null = scale not recorded /
    // N/A). ORS flag = ORS dropped >= threshold from baseline. SRS flag = SRS
    // below cutoff OR dropped >= threshold from last session.
    orsFlag: boolean("ors_flag"),
    srsFlag: boolean("srs_flag"),
    noteType: text("note_type")
      .$type<"SOAP" | "DAP" | "BIRP" | "free" | "CUSTOM">()
      .notNull()
      .default("CUSTOM"),
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
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
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
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    // Allocation of a receipt to an invoice. receiptId groups all allocation
    // rows that came from one payment event (the client-facing receipt).
    receiptId: uuid("receipt_id").references(() => receipts.id, { onDelete: "cascade" }),
    invoiceId: uuid("invoice_id")
      .references(() => invoices.id, { onDelete: "restrict" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    paymentDate: date("payment_date").notNull().default(sql`CURRENT_DATE`),
    currency: text("currency").notNull().default("INR"),
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
    receiptIdx: index("idx_payments_receipt").on(t.receiptId),
  })
);

// ─────────────────────────────────────────────
// RECEIPTS
// ─────────────────────────────────────────────
// One row per payment EVENT the client makes (the client-facing, numbered
// receipt). The money is then split across one or more `payments` allocation
// rows (which invoice each slice covers, or excess when invoiceId is null).
export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    receiptNumber: text("receipt_number").notNull(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("INR"),
    paymentDate: date("payment_date").notNull().default(sql`CURRENT_DATE`),
    method: text("method")
      .$type<"cash" | "upi" | "bank_transfer" | "card" | "online" | "other">()
      .notNull(),
    referenceId: text("reference_id"),
    notes: text("notes"),
    // When a receipt PDF/email was sent to the client (null = not sent).
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    clientIdx: index("idx_receipts_client").on(t.clientId),
    uniqueReceiptNum: uniqueIndex("idx_receipts_tenant_num").on(t.tenantId, t.receiptNumber),
  })
);

// ─────────────────────────────────────────────
// PORTAL TOKENS
// ─────────────────────────────────────────────
export const portalTokens = pgTable(
  "portal_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
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
// PRACTICE SETTINGS
// ─────────────────────────────────────────────
export const practiceSettings = pgTable(
  "practice_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
    counselorName: text("counselor_name").notNull().default("Vijay Gopal Sreenivasan"),
    practiceName: text("practice_name").notNull().default("Deepen Counseling"),
    address: text("address").default("Noida, Uttar Pradesh"),
    phone: text("phone").default("+91-0000000000"),
    email: text("email").default("counselor@deepen.health"),
    upiId: text("upi_id"),
    monthlyQuote: text("monthly_quote").default("Progress is not a straight line."),
    orsCutoff: integer("ors_cutoff").notNull().default(25),
    srsCutoff: integer("srs_cutoff").notNull().default(36),
    orsDeteriorationThreshold: integer("ors_deterioration_threshold").notNull().default(5),
    srsDeclineThreshold: integer("srs_decline_threshold").notNull().default(2),
    orsRciThreshold: integer("ors_rci_threshold").notNull().default(5),
    orsAmberLow: integer("ors_amber_low").notNull().default(26),
    orsGreenLow: integer("ors_green_low").notNull().default(32),
    // Default number of days after the issue date that a generated invoice is
    // due. Surfaced as the default selection in the New Batch dialog's
    // "Payment due" pulldown (7 / 15 / custom).
    invoiceDueDays: integer("invoice_due_days").notNull().default(15),
    // When true, every outgoing invoice email is rerouted to the counselor's
    // own address (`email` column above) instead of the client's. Used for
    // dry-runs against real data before going live with a batch.
    emailOverride: boolean("email_override").notNull().default(false),
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
    tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
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
// RELATIONSHIPS
// ─────────────────────────────────────────────

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  sessions: many(sessions),
  invoices: many(invoices),
  receipts: many(receipts),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [clients.tenantId],
    references: [tenants.id],
  }),
  sessions: many(sessions),
  invoices: many(invoices),
  payments: many(payments),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

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
  feeScheme: one(feeSchemes, {
    fields: [sessions.feeSchemeId],
    references: [feeSchemes.id],
  }),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
  session: one(sessions, {
    fields: [invoiceLineItems.sessionId],
    references: [sessions.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  client: one(clients, {
    fields: [payments.clientId],
    references: [clients.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  receipt: one(receipts, {
    fields: [payments.receiptId],
    references: [receipts.id],
  }),
}));

export const receiptsRelations = relations(receipts, ({ one, many }) => ({
  client: one(clients, {
    fields: [receipts.clientId],
    references: [clients.id],
  }),
  allocations: many(payments),
}));

// ─────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
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
export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;
export type FeeScheme = typeof feeSchemes.$inferSelect;
export type NewFeeScheme = typeof feeSchemes.$inferInsert;
export type AuditLog = typeof auditLog.$inferSelect;
export type PracticeSettings = typeof practiceSettings.$inferSelect;
export type NewPracticeSettings = typeof practiceSettings.$inferInsert;
