// Hand-written types mirroring supabase/schema.sql.
// If you have the Supabase CLI, you can regenerate the exact version with:
//   npx supabase gen types typescript --project-id <id> > src/types/database.generated.ts
// Until then, this file is the single source of truth for shapes across
// the whole team — do not redefine these interfaces elsewhere.

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
export type PaymentMethod = "CASH" | "CARD";
export type MemberRole = "OWNER" | "EMPLOYEE";
export type InventoryReason = "RESTOCK" | "USAGE" | "ADJUSTMENT";

/** 0 = Sunday ... 6 = Saturday, matches JS Date#getDay() */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  timezone: string;
  accent_color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  profile_id: string;
  role: MemberRole;
  resource_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Resource {
  id: string;
  business_id: string;
  name: string;
  type: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  day_of_week: DayOfWeek;
  is_closed: boolean;
  open_time: string | null; // "HH:MM:SS"
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
}

export interface ResourceHours {
  id: string;
  resource_id: string;
  day_of_week: DayOfWeek;
  is_off: boolean;
  start_time: string | null;
  end_time: string | null;
}

export interface Customer {
  id: string;
  business_id: string;
  profile_id: string | null;
  full_name: string;
  phone: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  business_id: string;
  customer_id: string;
  resource_id: string;
  service_id: string;
  start_at: string; // ISO timestamptz
  end_at: string;
  date: string; // YYYY-MM-DD, generated column
  status: BookingStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  cancelled_reason: string | null;
  created_at: string;
  updated_at: string;
}

/** Booking joined with the display fields most screens need. */
export interface BookingWithDetails extends Booking {
  customer: Pick<Customer, "id" | "full_name" | "phone">;
  resource: Pick<Resource, "id" | "name">;
  service: Pick<Service, "id" | "name" | "duration_minutes" | "price">;
}

export interface Payment {
  id: string;
  business_id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  recorded_by: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  business_id: string;
  product_id: string;
  change: number;
  reason: InventoryReason;
  created_by: string | null;
  created_at: string;
}

/** Return shape of the book_appointment() RPC (see supabase/schema.sql). */
export type BookAppointmentResult = Booking;

/** Stable error codes raised by book_appointment() — match on these,
 * never show err.message from Postgres directly to a customer. */
export type BookingErrorCode = "SLOT_TAKEN" | "SERVICE_NOT_FOUND" | "RESOURCE_NOT_FOUND";

export const BOOKING_ERROR_MESSAGES: Record<BookingErrorCode, string> = {
  SLOT_TAKEN: "Bu vaqt boshqa mijoz tomonidan band qilindi. Iltimos, boshqa vaqtni tanlang.",
  SERVICE_NOT_FOUND: "Bu xizmat mavjud emas. Sahifani yangilab ko'ring.",
  RESOURCE_NOT_FOUND: "Bu usta mavjud emas. Sahifani yangilab ko'ring.",
};
