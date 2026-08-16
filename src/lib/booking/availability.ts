// OWNER: shared foundation (core algorithm — spec sections 11 & 12).
// Pure function, zero DB/network dependency, so it is trivially unit
// testable and reusable both in a Server Component (owner calendar) and
// in the public booking flow. Whoever wires the DB query (Backend-2)
// should fetch business_hours + resource_hours + non-cancelled bookings
// for the target day and pass them in — do not reimplement this logic
// closer to the UI.
//
// IMPORTANT: this mirrors the DB's own conflict semantics on purpose —
// tstzrange(start,end) in Postgres is [start, end), so a booking ending
// at 10:00 does NOT block a new booking starting at 10:00. The exclusion
// constraint in supabase/schema.sql is still the real source of truth;
// this function exists to give the UI a correct preview, not to replace
// server-side / DB-side validation (spec section 11: "frontend disabling
// is NOT enough").

import { addMinutes, areIntervalsOverlapping, isBefore } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import type { BusinessHours, ResourceHours } from "@/types/database";

export interface DayHours {
  isClosed: boolean;
  openTime: string | null; // "HH:MM" or "HH:MM:SS", local wall-clock
  closeTime: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
}

export interface ExistingBookingRange {
  startAt: string; // ISO instant
  endAt: string;
}

export interface AvailabilityInput {
  /** "YYYY-MM-DD", the calendar date in the business's own timezone. */
  date: string;
  /** IANA timezone, e.g. "Asia/Tashkent" (spec section 36 — fixed for the demo). */
  timezone: string;
  businessHours: DayHours;
  resourceHours: DayHours;
  serviceDurationMinutes: number;
  /** All non-cancelled/non-no-show bookings for this resource on this date. */
  existingBookings: ExistingBookingRange[];
  /** Candidate start-time granularity. Defaults to 15 minutes. */
  slotStepMinutes?: number;
  /** Injectable for tests; defaults to `new Date()`. Slots before `now` are excluded. */
  now?: Date;
}

export interface TimeSlot {
  startAt: Date;
  endAt: Date;
  /** "HH:MM" in the business timezone, ready to render. */
  label: string;
}

function toMinutes(time: string): number {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function businessHoursToDayHours(row: Pick<BusinessHours, "is_closed" | "open_time" | "close_time" | "break_start" | "break_end">): DayHours {
  return {
    isClosed: row.is_closed,
    openTime: row.open_time,
    closeTime: row.close_time,
    breakStart: row.break_start,
    breakEnd: row.break_end,
  };
}

export function resourceHoursToDayHours(row: Pick<ResourceHours, "is_off" | "start_time" | "end_time">): DayHours {
  return {
    isClosed: row.is_off,
    openTime: row.start_time,
    closeTime: row.end_time,
  };
}

/**
 * Generates valid booking start times for one resource, one service, one day.
 * Availability = business hours ∩ resource hours ∩ service duration
 *                ∩ NOT(existing bookings) ∩ NOT(business break) (spec section 12).
 */
export function getAvailableSlots(input: AvailabilityInput): TimeSlot[] {
  const { businessHours, resourceHours, serviceDurationMinutes } = input;

  if (businessHours.isClosed || resourceHours.isClosed) return [];
  if (!businessHours.openTime || !businessHours.closeTime) return [];
  if (!resourceHours.openTime || !resourceHours.closeTime) return [];

  const effectiveOpen = Math.max(toMinutes(businessHours.openTime), toMinutes(resourceHours.openTime));
  const effectiveClose = Math.min(toMinutes(businessHours.closeTime), toMinutes(resourceHours.closeTime));

  if (effectiveOpen >= effectiveClose) return [];

  const breakStart = businessHours.breakStart ? toMinutes(businessHours.breakStart) : null;
  const breakEnd = businessHours.breakEnd ? toMinutes(businessHours.breakEnd) : null;

  const step = input.slotStepMinutes ?? 15;
  const now = input.now ?? new Date();

  const slots: TimeSlot[] = [];

  for (
    let candidateStart = effectiveOpen;
    candidateStart + serviceDurationMinutes <= effectiveClose;
    candidateStart += step
  ) {
    const candidateEnd = candidateStart + serviceDurationMinutes;

    if (breakStart !== null && breakEnd !== null && rangesOverlap(candidateStart, candidateEnd, breakStart, breakEnd)) {
      continue;
    }

    const startAt = fromZonedTime(`${input.date} ${toHHMM(candidateStart)}`, input.timezone);
    const endAt = addMinutes(startAt, serviceDurationMinutes);

    if (isBefore(startAt, now)) continue;

    const conflict = input.existingBookings.some((b) =>
      areIntervalsOverlapping(
        { start: startAt, end: endAt },
        { start: new Date(b.startAt), end: new Date(b.endAt) },
        { inclusive: false }
      )
    );
    if (conflict) continue;

    slots.push({ startAt, endAt, label: toHHMM(candidateStart) });
  }

  return slots;
}

/** Convenience check for a single, already-chosen start time (e.g. right before submit,
 * to show an inline "no longer available" state without waiting for the server round trip). */
export function isSlotStillAvailable(
  candidate: { startAt: Date; endAt: Date },
  existingBookings: ExistingBookingRange[]
): boolean {
  return !existingBookings.some((b) =>
    areIntervalsOverlapping(
      { start: candidate.startAt, end: candidate.endAt },
      { start: new Date(b.startAt), end: new Date(b.endAt) },
      { inclusive: false }
    )
  );
}
