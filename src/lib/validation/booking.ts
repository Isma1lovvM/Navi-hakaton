import { z } from "zod";
import type { BookingStatus } from "@/types/database";

/** Public customer booking form (spec section 15, steps 1-7). */
export const createBookingSchema = z.object({
  business_id: z.string().uuid(),
  service_id: z.string().uuid("Xizmatni tanlang"),
  resource_id: z.string().uuid("Ustani tanlang"),
  start_at: z.string().datetime({ message: "Vaqtni tanlang" }),
  customer_name: z.string().min(2, "Ismingizni kiriting"),
  customer_phone: z
    .string()
    .regex(/^\+?\d{9,13}$/, "Telefon raqamini to'g'ri kiriting (masalan +998901234567)"),
  notes: z.string().max(300).optional(),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/** Staff-side manual booking creation (owner/employee adds a walk-in). */
export const staffCreateBookingSchema = createBookingSchema.omit({ customer_name: true, customer_phone: true }).extend({
  customer_id: z.string().uuid().optional(),
  customer_name: z.string().min(2).optional(),
  customer_phone: z.string().min(9).optional(),
}).refine((d) => d.customer_id || (d.customer_name && d.customer_phone), {
  message: "Mavjud mijozni tanlang yoki yangi mijoz ma'lumotini kiriting",
  path: ["customer_id"],
});

export const bookingStatusTransitionSchema = z.object({
  booking_id: z.string().uuid(),
  status: z.enum(["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  cancelled_reason: z.string().max(300).optional(),
});
export type BookingStatusTransitionInput = z.infer<typeof bookingStatusTransitionSchema>;

export const recordPaymentSchema = z.object({
  booking_id: z.string().uuid(),
  amount: z.coerce.number().nonnegative(),
  method: z.enum(["CASH", "CARD"]),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

/**
 * Legal status transitions — the single source of truth so the UI never
 * shows a button for a transition the backend would reject anyway.
 * See spec section 19 (edge cases) + section 10 (statuses).
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED", "NO_SHOW"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};
