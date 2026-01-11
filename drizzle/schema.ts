import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Patients table - stores patient information
 */
export const patients = mysqlTable(
  "patients",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
    fullName: text("full_name").notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Dentists table - stores dentist information
 */
export const dentists = mysqlTable("dentists", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  fullName: text("full_name").notNull(),
  specialization: text("specialization"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Dentist = typeof dentists.$inferSelect;
export type InsertDentist = typeof dentists.$inferInsert;

/**
 * Appointments table - stores appointment records
 */
export const appointments = mysqlTable(
  "appointments",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
    patientId: varchar("patient_id", { length: 36 }).notNull(),
    appointmentTime: timestamp("appointment_time").notNull(),
    status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "finished"]).default("pending").notNull(),
    reason: text("reason"),
    phoneNumber: varchar("phone_number", { length: 20 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Time slots table - stores available appointment slots
 */
export const timeSlots = mysqlTable(
  "time_slots",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
    slotDateTime: timestamp("slot_date_time").notNull(),
    dentistId: varchar("dentist_id", { length: 36 }).notNull(),
    isBooked: boolean("is_booked").default(false).notNull(),
    appointmentId: varchar("appointment_id", { length: 36 }),
  },
  (table) => ({
    slotDateTimeIdx: uniqueIndex("slot_date_time_dentist_idx").on(table.slotDateTime, table.dentistId),
  })
);

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = typeof timeSlots.$inferInsert;

// Add foreign key relationships
// Note: Drizzle ORM doesn't enforce foreign keys by default in MySQL
// These are documented here for reference and should be enforced at the database level

/**
 * Clinic settings table - stores clinic configuration
 */
export const clinicSettings = mysqlTable("clinic_settings", {
  id: int("id").autoincrement().primaryKey(),
  clinicName: text("clinic_name").notNull(),
  workingDays: text("working_days").notNull(), // 0=Sunday, 1=Monday, ..., 6=Saturday
  workingHoursStart: varchar("working_hours_start", { length: 5 }).notNull(), // HH:MM format
  workingHoursEnd: varchar("working_hours_end", { length: 5 }).notNull(), // HH:MM format
  slotDurationMinutes: int("slot_duration_minutes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ClinicSettings = typeof clinicSettings.$inferSelect;
export type InsertClinicSettings = typeof clinicSettings.$inferInsert;

// Default clinic settings
export const DEFAULT_CLINIC_SETTINGS = {
  clinicName: "Canuck Dentist",
  workingDays: "1,2,3,4,5", // Monday to Friday
  workingHoursStart: "09:30",
  workingHoursEnd: "17:30",
  slotDurationMinutes: 60,
};