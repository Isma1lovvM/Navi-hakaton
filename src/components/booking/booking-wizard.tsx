"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ServiceCard } from "@/components/business/service-card";
import { EmployeeCard } from "@/components/dashboard/employee-card";
import { TimeSlotButton } from "@/components/booking/time-slot-button";
import { OnlineStatusBadge } from "@/components/layout/online-status-badge";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { createBookingSchema } from "@/lib/validation/booking";
import { getAvailableSlotsForSelection, submitBooking, type AvailableSlot } from "@/lib/actions/public-booking";
import type { Resource, Service, BookAppointmentResult } from "@/types/database";

interface Props {
  businessId: string;
  businessName: string;
  timezone: string;
  services: Service[];
  resources: Resource[];
}

const STEP_LABELS = ["Xizmat", "Usta", "Sana", "Vaqt", "Ma'lumot", "Tasdiqlash"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function BookingWizard({ businessId, businessName, timezone, services, resources }: Props) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [resource, setResource] = useState<Resource | null>(null);
  const [date, setDate] = useState(todayIso());
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<BookAppointmentResult | null>(null);
  const online = useOnlineStatus();

  useEffect(() => {
    if (step !== 4 || !resource || !service) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    getAvailableSlotsForSelection({ businessId, resourceId: resource.id, serviceId: service.id, date, timezone })
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [step, resource, service, date, businessId, timezone]);

  const refreshSlots = () => {
    if (!resource || !service) return;
    setLoadingSlots(true);
    getAvailableSlotsForSelection({ businessId, resourceId: resource.id, serviceId: service.id, date, timezone })
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  };

  const canGoNext =
    (step === 1 && service) ||
    (step === 2 && resource) ||
    (step === 3 && date) ||
    (step === 4 && selectedSlot) ||
    step === 5;

  const goNext = () => {
    if (step === 5) {
      const parsed = createBookingSchema.safeParse({
        business_id: businessId,
        service_id: service?.id,
        resource_id: resource?.id,
        start_at: selectedSlot?.startAt,
        customer_name: customerName,
        customer_phone: customerPhone,
        notes: notes || undefined,
      });
      if (!parsed.success) {
        setFormError(parsed.error.issues[0]?.message ?? "Ma'lumotlarni tekshiring.");
        return;
      }
      setFormError(null);
    }
    setStep((s) => Math.min(6, s + 1));
  };

  const handleConfirm = async () => {
    if (!service || !resource || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitBooking({
      business_id: businessId,
      service_id: service.id,
      resource_id: resource.id,
      start_at: selectedSlot.startAt,
      customer_name: customerName,
      customer_phone: customerPhone,
      notes: notes || undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.message);
      if (result.errorCode === "SLOT_TAKEN") {
        setStep(4);
        refreshSlots();
      }
      return;
    }

    // Never shown until the server call above actually resolved successfully.
    setConfirmed(result.booking);
  };

  if (confirmed) {
    return (
      <div className="rounded-card border border-emerald-200 bg-emerald-50 p-6 text-center">
        <Check className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
        <p className="text-lg font-semibold text-emerald-900">Booking tasdiqlandi</p>
        <p className="mt-1 text-sm text-emerald-700">
          {businessName} · {service?.name} · {resource?.name}
        </p>
        <p className="text-sm text-emerald-700">
          {date} · {selectedSlot?.label}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          {step}/6 — {STEP_LABELS[step - 1]}
        </span>
        <OnlineStatusBadge />
      </div>

      <div className="mb-2 flex gap-1">
        {STEP_LABELS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-accent-600" : "bg-border"}`} />
        ))}
      </div>

      <div className="min-h-[280px] py-4">
        {step === 1 ? (
          <div className="space-y-2">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} selected={service?.id === s.id} onSelect={setService} />
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-2">
            {resources.map((r) => (
              <EmployeeCard key={r.id} resource={r} selected={resource?.id === r.id} onSelect={setResource} />
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sanani tanlang</label>
            <input
              type="date"
              min={todayIso()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </div>
        ) : null}

        {step === 4 ? (
          <div>
            {loadingSlots ? (
              <p className="text-sm text-slate-400">Bo&apos;sh vaqtlar yuklanmoqda...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-slate-400">Bu kunda bo&apos;sh vaqt yo&apos;q. Boshqa sanani tanlang.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <TimeSlotButton
                    key={slot.startAt}
                    label={slot.label}
                    available
                    selected={selectedSlot?.startAt === slot.startAt}
                    onClick={() => setSelectedSlot(slot)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ismingiz</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Telefon raqamingiz</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+998901234567"
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Izoh (ixtiyoriy)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          </div>
        ) : null}

        {step === 6 ? (
          <div className="rounded-card border border-border bg-surface-muted p-4">
            <p className="text-lg font-semibold text-slate-900">{businessName}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>{service?.name}</p>
              <p>{resource?.name}</p>
              <p>
                {date} · {selectedSlot?.label}
              </p>
              <p className="text-base font-semibold text-accent-700">
                {service?.price.toLocaleString("uz-UZ")} so&apos;m
              </p>
            </div>
            {submitError ? <p className="mt-3 text-sm text-red-600">{submitError}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="flex gap-2">
        {step > 1 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" /> Orqaga
          </button>
        ) : null}

        {step < 6 ? (
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className="ml-auto flex flex-1 items-center justify-center gap-1 rounded-md bg-accent-600 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50"
          >
            Keyingisi <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={submitting || !online}
            className="ml-auto flex-1 rounded-md bg-accent-600 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50"
          >
            {!online ? "Internet yo'q" : submitting ? "Yuborilmoqda..." : "Tasdiqlash"}
          </button>
        )}
      </div>
    </div>
  );
}
