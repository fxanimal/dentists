import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  getOrCreatePatient,
  getPatientByEmail,
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentById,
  updateAppointmentStatus,
  getTodayAppointments,
  getPendingAppointments,
  getAvailableTimeSlots,
  getActiveDentists,
  getClinicSettings,
} from "../db";

export const appointmentsRouter = router({
  // Public procedures
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      const slots = await getAvailableTimeSlots(input.startDate, input.endDate);
      return slots;
    }),

  getDentists: publicProcedure.query(async () => {
    const dentists = await getActiveDentists();
    return dentists;
  }),

  getClinicInfo: publicProcedure.query(async () => {
    const settings = await getClinicSettings();
    return settings;
  }),

  bookAppointment: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
        reason: z.string().min(1),
        appointmentTime: z.date(),
        isNewPatient: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get or create patient
        const patient = await getOrCreatePatient(
          input.email,
          input.fullName,
          input.phone
        );

        if (!patient) {
          throw new Error("Failed to create or retrieve patient");
        }

        // Create appointment
        const appointment = await createAppointment(
          patient.id,
          input.appointmentTime,
          input.reason,
          input.phone,
          "pending"
        );

        return {
          success: true,
          patientId: patient.id,
          appointmentId: appointment,
        };
      } catch (error) {
        console.error("Booking error:", error);
        throw error;
      }
    }),

  getPatientAppointments: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const patient = await getPatientByEmail(input.email);
      if (!patient) return [];

      const appointments = await getAppointmentsByPatient(patient.id);
      return appointments;
    }),

  // Protected procedures (admin only)
  getTodayAppointments: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return getTodayAppointments();
  }),

  getPendingAppointments: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return getPendingAppointments();
  }),

  updateAppointmentStatus: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        status: z.enum(["pending", "confirmed", "cancelled", "finished"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await updateAppointmentStatus(input.appointmentId, input.status);
      return { success: true };
    }),

  getAppointmentDetails: protectedProcedure
    .input(z.object({ appointmentId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return getAppointmentById(input.appointmentId);
    }),
});
