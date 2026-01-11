import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getActiveDentists, createDentist, getDentistById } from "../db";

export const dentistsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return getActiveDentists();
  }),

  create: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        specialization: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await createDentist(input.fullName, input.specialization);
      return { success: true };
    }),

  getById: protectedProcedure
    .input(z.object({ dentistId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }

      return getDentistById(input.dentistId);
    }),
});
