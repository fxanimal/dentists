import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, patients, appointments, dentists, timeSlots, clinicSettings } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Patients queries
export async function getOrCreatePatient(email: string, fullName: string, phone: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
  if (existing.length > 0) return existing[0];

  await db.insert(patients).values({ fullName, email, phone });
  const result = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
  return result[0];
}

export async function getPatientByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patients).where(eq(patients.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPatientById(patientId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Appointments queries
export async function createAppointment(patientId: string, appointmentTime: Date, reason: string, phoneNumber: string, status: "pending" | "confirmed" | "cancelled" | "finished" = "pending") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(appointments).values({
    patientId,
    appointmentTime,
    reason,
    phoneNumber,
    status,
  });
  return result;
}

export async function getAppointmentsByPatient(patientId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(appointments).where(eq(appointments.patientId, patientId));
  return result;
}

export async function getAppointmentById(appointmentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAppointmentStatus(appointmentId: string, status: "pending" | "confirmed" | "cancelled" | "finished") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(appointments).set({ status }).where(eq(appointments.id, appointmentId));
}

export async function getTodayAppointments() {
  const db = await getDb();
  if (!db) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const result = await db.select().from(appointments).where(
    and(
      gte(appointments.appointmentTime, today),
      lte(appointments.appointmentTime, tomorrow)
    )
  );
  return result;
}

export async function getPendingAppointments() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(appointments).where(
    eq(appointments.status, "pending")
  ).orderBy(desc(appointments.createdAt));
  return result;
}

// Dentists queries
export async function getActiveDentists() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(dentists).where(eq(dentists.isActive, true));
  return result;
}

export async function getDentistById(dentistId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(dentists).where(eq(dentists.id, dentistId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDentist(fullName: string, specialization?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(dentists).values({ fullName, specialization });
}

// Time slots queries
export async function getAvailableTimeSlots(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(timeSlots).where(
    and(
      gte(timeSlots.slotDateTime, startDate),
      lte(timeSlots.slotDateTime, endDate),
      eq(timeSlots.isBooked, false)
    )
  ).orderBy(timeSlots.slotDateTime);
  return result;
}

export async function getClinicSettings() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(clinicSettings).limit(1);
  return result.length > 0 ? result[0] : null;
}
