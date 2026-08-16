// OWNER: shared foundation. Server-side authorization helpers.
// Rule from spec section 31: "Do not rely only on hidden UI buttons for
// permission control." Every server action / route handler that mutates
// data must call one of these — RLS is the real backstop, this is the
// fast-fail layer that produces a friendly error before hitting the DB.

import type { MemberRole } from "@/types/database";

export interface CurrentMembership {
  businessId: string;
  role: MemberRole;
  resourceId: string | null;
}

export function canManageBusinessSettings(membership: CurrentMembership | null): boolean {
  return membership?.role === "OWNER";
}

export function canManageEmployeesAndServices(membership: CurrentMembership | null): boolean {
  return membership?.role === "OWNER";
}

export function canManageInventory(membership: CurrentMembership | null): boolean {
  return membership?.role === "OWNER";
}

/** Owners act on any booking in their business; employees only on their own resource's bookings. */
export function canActOnBooking(
  membership: CurrentMembership | null,
  bookingResourceId: string
): boolean {
  if (!membership) return false;
  if (membership.role === "OWNER") return true;
  return membership.role === "EMPLOYEE" && membership.resourceId === bookingResourceId;
}

export function canRecordPayment(membership: CurrentMembership | null): boolean {
  return membership?.role === "OWNER" || membership?.role === "EMPLOYEE";
}
